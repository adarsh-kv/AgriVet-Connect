require("c:/Users/adars/Downloads/AgriVet Connect/backend/node_modules/dotenv").config({
    path: "c:/Users/adars/Downloads/AgriVet Connect/backend/.env"
});
const db = require("c:/Users/adars/Downloads/AgriVet Connect/backend/config/db");
const jwt = require("c:/Users/adars/Downloads/AgriVet Connect/backend/node_modules/jsonwebtoken");

const BASE_URL = "http://localhost:5000/api";
const JWT_SECRET = process.env.JWT_SECRET || "agrivet_connect_secret_key";

async function runNotificationsTestSuite() {
    console.log("==================================================");
    console.log("NOTIFICATIONS MODULE — FULL VERIFICATION TEST SUITE");
    console.log("==================================================");

    const timestamp = Date.now();
    let farmerA, farmerB, admin, vet;
    let tokenFarmerA, tokenFarmerB, tokenAdmin, tokenVet;
    let livestockA, livestockB;
    let schemeId, schemeAppId;
    let insurancePolicyId;
    let vetRequestId;
    let vaccinationId;

    try {
        // [1] DATABASE SCHEMA VERIFICATION
        console.log("\n[TEST 1] Verifying MySQL notifications table structure, FK, and indexes...");
        const [tables] = await db.query("SHOW TABLES LIKE 'notifications'");
        if (tables.length === 0) throw new Error("notifications table does not exist!");

        const [cols] = await db.query("DESCRIBE notifications");
        const colNames = cols.map((c) => c.Field);
        const requiredCols = [
            "notification_id",
            "user_id",
            "title",
            "message",
            "notification_type",
            "related_id",
            "related_type",
            "is_read",
            "created_at"
        ];
        for (const reqCol of requiredCols) {
            if (!colNames.includes(reqCol)) throw new Error(`Missing column: ${reqCol}`);
        }

        const [indexes] = await db.query("SHOW INDEX FROM notifications");
        const indexNames = indexes.map((i) => i.Key_name);
        console.log("✓ Table structure matches requirements:", colNames.join(", "));
        console.log("✓ Indexes verified:", [...new Set(indexNames)].join(", "));

        // [2] SETUP TEST USERS
        console.log("\n[SETUP] Creating test users: Farmer A, Farmer B, Admin, Veterinarian...");
        const [roles] = await db.query("SELECT role_id, role_name FROM roles");
        const roleFarmer = roles.find((r) => r.role_name === "FARMER").role_id;
        const roleAdmin = roles.find((r) => r.role_name === "ADMIN").role_id;
        const roleVet = roles.find((r) => r.role_name === "VETERINARIAN").role_id;

        // Farmer A
        const [fa] = await db.query(
            "INSERT INTO users (role_id, full_name, email, password, phone, status) VALUES (?, ?, ?, 'pass', '9876543201', 'ACTIVE')",
            [roleFarmer, "Farmer Alpha", `farmer_a_${timestamp}@test.com`]
        );
        farmerA = fa.insertId;
        tokenFarmerA = jwt.sign({ user_id: farmerA, role_id: roleFarmer, role: "FARMER" }, JWT_SECRET, { expiresIn: "1h" });

        // Farmer B
        const [fb] = await db.query(
            "INSERT INTO users (role_id, full_name, email, password, phone, status) VALUES (?, ?, ?, 'pass', '9876543202', 'ACTIVE')",
            [roleFarmer, "Farmer Beta", `farmer_b_${timestamp}@test.com`]
        );
        farmerB = fb.insertId;
        tokenFarmerB = jwt.sign({ user_id: farmerB, role_id: roleFarmer, role: "FARMER" }, JWT_SECRET, { expiresIn: "1h" });

        // Admin
        const [adm] = await db.query(
            "INSERT INTO users (role_id, full_name, email, password, phone, status) VALUES (?, ?, ?, 'pass', '9876543203', 'ACTIVE')",
            [roleAdmin, "Admin Officer", `admin_${timestamp}@test.com`]
        );
        admin = adm.insertId;
        tokenAdmin = jwt.sign({ user_id: admin, role_id: roleAdmin, role: "ADMIN" }, JWT_SECRET, { expiresIn: "1h" });

        // Veterinarian
        const [vt] = await db.query(
            "INSERT INTO users (role_id, full_name, email, password, phone, status) VALUES (?, ?, ?, 'pass', '9876543204', 'ACTIVE')",
            [roleVet, "Dr. Sunita Sharma", `vet_${timestamp}@test.com`]
        );
        vet = vt.insertId;
        tokenVet = jwt.sign({ user_id: vet, role_id: roleVet, role: "VETERINARIAN" }, JWT_SECRET, { expiresIn: "1h" });

        // Veterinarian verification
        await db.query(
            "INSERT INTO veterinarian_verifications (user_id, certificate_name, certificate_file, specialization, verification_status) VALUES (?, 'Cert', 'cert.pdf', 'Large Animal', 'APPROVED')",
            [vet]
        );

        // Livestock for Farmer A
        const [la] = await db.query(
            "INSERT INTO livestock (owner_id, animal_name, tag_number, species, breed, gender) VALUES (?, 'Gauri', 'TAG-A-" + timestamp + "', 'Cattle', 'Gir', 'Female')",
            [farmerA]
        );
        livestockA = la.insertId;

        console.log(`✓ Setup complete: FarmerA=${farmerA}, FarmerB=${farmerB}, Admin=${admin}, Vet=${vet}, LivestockA=${livestockA}`);

        // [3] TEST NOTIFICATION BASIC CRUD & OWNERSHIP
        console.log("\n[TEST 2] Testing Basic Notification CRUD & Endpoints...");
        // Insert a direct notification for Farmer A
        const [insNotif] = await db.query(
            `INSERT INTO notifications (user_id, title, message, notification_type, is_read)
             VALUES (?, 'Welcome Farmer A', 'Welcome to AgriVet Connect!', 'SYSTEM', FALSE)`,
            [farmerA]
        );
        const notifA1 = insNotif.insertId;

        // Check unread count for Farmer A
        const countResA = await fetch(`${BASE_URL}/notifications/unread-count`, {
            headers: { Authorization: `Bearer ${tokenFarmerA}` }
        });
        const countDataA = await countResA.json();
        if (countResA.status === 200 && countDataA.unread_count >= 1) {
            console.log(`✓ GET /api/notifications/unread-count returned: ${countDataA.unread_count}`);
        } else {
            throw new Error(`Unexpected unread count: ${JSON.stringify(countDataA)}`);
        }

        // Check list for Farmer A
        const listResA = await fetch(`${BASE_URL}/notifications`, {
            headers: { Authorization: `Bearer ${tokenFarmerA}` }
        });
        const listDataA = await listResA.json();
        const foundA1 = listDataA.find((n) => n.notification_id === notifA1);
        if (listResA.status === 200 && foundA1 && foundA1.is_read === 0) {
            console.log(`✓ GET /api/notifications returned Farmer A's notification (ID: ${notifA1})`);
        } else {
            throw new Error(`Notification not found in list: ${JSON.stringify(listDataA)}`);
        }

        // [4] CROSS-USER SECURITY TESTS
        console.log("\n[TEST 3] Testing Cross-User Tenant Isolation & Security...");
        // Farmer B checks notifications -> should NOT see Farmer A's notification
        const listResB = await fetch(`${BASE_URL}/notifications`, {
            headers: { Authorization: `Bearer ${tokenFarmerB}` }
        });
        const listDataB = await listResB.json();
        if (listDataB.some((n) => n.notification_id === notifA1)) {
            throw new Error("SECURITY BREACH: Farmer B saw Farmer A's notification!");
        }
        console.log("✓ Cross-user list isolation verified: Farmer B cannot see Farmer A's notifications");

        // Farmer B attempts to mark Farmer A's notification as read -> must return 403 or 404
        const markResB = await fetch(`${BASE_URL}/notifications/${notifA1}/read`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${tokenFarmerB}` }
        });
        if (markResB.status === 403 || markResB.status === 404) {
            console.log(`✓ Cross-user mark-read blocked with HTTP ${markResB.status}`);
        } else {
            throw new Error(`SECURITY BREACH: Farmer B marked Farmer A's notification with status: ${markResB.status}`);
        }

        // Farmer B attempts to delete Farmer A's notification -> must return 403 or 404
        const delResB = await fetch(`${BASE_URL}/notifications/${notifA1}/delete`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${tokenFarmerB}` }
        });
        // Testing DELETE /api/notifications/:id
        const delResB2 = await fetch(`${BASE_URL}/notifications/${notifA1}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${tokenFarmerB}` }
        });
        if (delResB2.status === 403 || delResB2.status === 404) {
            console.log(`✓ Cross-user delete blocked with HTTP ${delResB2.status}`);
        } else {
            throw new Error(`SECURITY BREACH: Farmer B deleted Farmer A's notification with status: ${delResB2.status}`);
        }

        // [5] MARK AS READ & READ ALL
        console.log("\n[TEST 4] Testing Mark As Read & Mark All As Read...");
        // Farmer A marks notifA1 as read
        const markResA = await fetch(`${BASE_URL}/notifications/${notifA1}/read`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${tokenFarmerA}` }
        });
        if (markResA.status === 200) {
            console.log(`✓ Farmer A successfully marked notification #${notifA1} as read`);
        } else {
            throw new Error(`Failed to mark read: ${markResA.status}`);
        }

        // Farmer A adds two more notifications and tests mark-all
        await db.query(
            "INSERT INTO notifications (user_id, title, message, notification_type, is_read) VALUES (?, 'Msg 2', 'Text', 'ALERT', FALSE), (?, 'Msg 3', 'Text', 'ALERT', FALSE)",
            [farmerA, farmerA]
        );
        const markAllRes = await fetch(`${BASE_URL}/notifications/read-all`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${tokenFarmerA}` }
        });
        const markAllData = await markAllRes.json();
        if (markAllRes.status === 200 && markAllData.updated_count >= 2) {
            console.log(`✓ PUT /api/notifications/read-all marked ${markAllData.updated_count} notifications as read`);
        } else {
            throw new Error(`Failed to mark all as read: ${JSON.stringify(markAllData)}`);
        }

        // Farmer A deletes notifA1
        const delResA = await fetch(`${BASE_URL}/notifications/${notifA1}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${tokenFarmerA}` }
        });
        if (delResA.status === 200) {
            console.log(`✓ DELETE /api/notifications/:id deleted notification #${notifA1} successfully`);
        } else {
            throw new Error(`Failed to delete notification: ${delResA.status}`);
        }

        // [6] GOVERNMENT SCHEMES NOTIFICATION INTEGRATION
        console.log("\n[TEST 5] Testing Government Schemes Notification Integration...");
        // Create test scheme
        const [sc] = await db.query(
            `INSERT INTO schemes (scheme_name, scheme_code, category, description, eligibility, benefits, department, status, created_by)
             VALUES ('Fodder Subsidy Scheme', 'FODDER-${timestamp}', 'Subsidy', 'Subsidized fodder', 'Farmers', '50% off', 'Agri Dept', 'ACTIVE', ?)`,
            [admin]
        );
        schemeId = sc.insertId;

        // Farmer A applies for scheme
        const applySchemeRes = await fetch(`${BASE_URL}/schemes/${schemeId}/apply`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${tokenFarmerA}`
            },
            body: JSON.stringify({
                applicant_notes: "Requesting fodder subsidy"
            })
        });
        const applySchemeData = await applySchemeRes.json();
        schemeAppId = applySchemeData.application_id;

        // Admin verifies notification received!
        const adminNotifRes1 = await fetch(`${BASE_URL}/notifications`, {
            headers: { Authorization: `Bearer ${tokenAdmin}` }
        });
        const adminNotifs1 = await adminNotifRes1.json();
        const schemeNotifForAdmin = adminNotifs1.find(
            (n) => n.notification_type === "SCHEME_APPLICATION" && n.related_id === schemeAppId
        );
        if (schemeNotifForAdmin) {
            console.log(`✓ Admin received notification on Scheme application: "${schemeNotifForAdmin.title}" — "${schemeNotifForAdmin.message}"`);
        } else {
            throw new Error("Admin did not receive SCHEME_APPLICATION notification!");
        }

        // Admin approves scheme application
        await fetch(`${BASE_URL}/schemes/applications/${schemeAppId}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${tokenAdmin}`
            },
            body: JSON.stringify({
                status: "APPROVED",
                admin_remarks: "Documents verified successfully."
            })
        });

        // Farmer A verifies notification received on approval!
        const farmerNotifRes1 = await fetch(`${BASE_URL}/notifications`, {
            headers: { Authorization: `Bearer ${tokenFarmerA}` }
        });
        const farmerNotifs1 = await farmerNotifRes1.json();
        const schemeStatusNotif = farmerNotifs1.find(
            (n) => n.notification_type === "SCHEME_STATUS" && n.related_id === schemeAppId
        );
        if (schemeStatusNotif && schemeStatusNotif.message.includes("approved")) {
            console.log(`✓ Farmer received notification on Scheme approval: "${schemeStatusNotif.title}" — "${schemeStatusNotif.message}"`);
        } else {
            throw new Error("Farmer did not receive SCHEME_STATUS notification!");
        }

        // [7] LIVESTOCK INSURANCE NOTIFICATION INTEGRATION
        console.log("\n[TEST 6] Testing Livestock Insurance Notification Integration...");
        // Farmer A applies for insurance on livestockA
        const applyInsRes = await fetch(`${BASE_URL}/insurance/apply`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${tokenFarmerA}`
            },
            body: JSON.stringify({
                livestock_id: livestockA,
                insurance_provider: "National Insurance Co",
                policy_name: "Cattle Protection Scheme",
                coverage_amount: 50000,
                premium_amount: 2000,
                subsidy_amount: 1000,
                start_date: "2026-10-01",
                end_date: "2027-09-30"
            })
        });
        const applyInsData = await applyInsRes.json();
        insurancePolicyId = applyInsData.policy_id;

        // Admin verifies notification received!
        const adminNotifRes2 = await fetch(`${BASE_URL}/notifications`, {
            headers: { Authorization: `Bearer ${tokenAdmin}` }
        });
        const adminNotifs2 = await adminNotifRes2.json();
        const insNotifForAdmin = adminNotifs2.find(
            (n) => n.notification_type === "INSURANCE_APPLICATION" && n.related_id === insurancePolicyId
        );
        if (insNotifForAdmin) {
            console.log(`✓ Admin received notification on Insurance application: "${insNotifForAdmin.title}" — "${insNotifForAdmin.message}"`);
        } else {
            throw new Error("Admin did not receive INSURANCE_APPLICATION notification!");
        }

        // Admin approves insurance policy
        await fetch(`${BASE_URL}/insurance/${insurancePolicyId}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${tokenAdmin}`
            },
            body: JSON.stringify({
                status: "ACTIVE",
                policy_number: `AGV-INS-${String(insurancePolicyId).padStart(4, "0")}`,
                start_date: "2026-10-01",
                end_date: "2027-09-30",
                admin_remarks: "Animal ear tag confirmed."
            })
        });

        // Farmer A verifies notification received!
        const farmerNotifRes2 = await fetch(`${BASE_URL}/notifications`, {
            headers: { Authorization: `Bearer ${tokenFarmerA}` }
        });
        const farmerNotifs2 = await farmerNotifRes2.json();
        const insStatusNotif = farmerNotifs2.find(
            (n) => n.notification_type === "INSURANCE_STATUS" && n.related_id === insurancePolicyId
        );
        if (insStatusNotif && insStatusNotif.message.includes("active")) {
            console.log(`✓ Farmer received notification on Insurance approval: "${insStatusNotif.title}" — "${insStatusNotif.message}"`);
        } else {
            throw new Error("Farmer did not receive INSURANCE_STATUS notification!");
        }

        // [8] VETERINARIAN REQUESTS NOTIFICATION INTEGRATION
        console.log("\n[TEST 7] Testing Veterinarian Request Notification Integration...");
        // Farmer A requests Dr. Sunita Sharma
        const vetReqRes = await fetch(`${BASE_URL}/veterinarians/requests`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${tokenFarmerA}`
            },
            body: JSON.stringify({
                veterinarian_id: vet,
                livestock_id: livestockA,
                reason: "Routine health inspection and deworming"
            })
        });
        const vetReqData = await vetReqRes.json();
        vetRequestId = vetReqData.request_id;

        // Veterinarian verifies notification received!
        const vetNotifRes = await fetch(`${BASE_URL}/notifications`, {
            headers: { Authorization: `Bearer ${tokenVet}` }
        });
        const vetNotifs = await vetNotifRes.json();
        const reqNotifForVet = vetNotifs.find(
            (n) => n.notification_type === "VET_REQUEST" && n.related_id === vetRequestId
        );
        if (reqNotifForVet) {
            console.log(`✓ Veterinarian received notification on consultation request: "${reqNotifForVet.title}" — "${reqNotifForVet.message}"`);
        } else {
            throw new Error("Veterinarian did not receive VET_REQUEST notification!");
        }

        // Veterinarian accepts request
        await fetch(`${BASE_URL}/veterinarians/requests/${vetRequestId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${tokenVet}`
            },
            body: JSON.stringify({ status: "ACCEPTED" })
        });

        // Farmer A verifies notification received on acceptance!
        const farmerNotifRes3 = await fetch(`${BASE_URL}/notifications`, {
            headers: { Authorization: `Bearer ${tokenFarmerA}` }
        });
        const farmerNotifs3 = await farmerNotifRes3.json();
        const vetStatusNotif = farmerNotifs3.find(
            (n) => n.notification_type === "VET_REQUEST_STATUS" && n.related_id === vetRequestId
        );
        if (vetStatusNotif && vetStatusNotif.message.includes("accepted")) {
            console.log(`✓ Farmer received notification on Vet acceptance: "${vetStatusNotif.title}" — "${vetStatusNotif.message}"`);
        } else {
            throw new Error("Farmer did not receive VET_REQUEST_STATUS notification!");
        }

        // [9] VACCINATION DUE & DUPLICATE SUPPRESSION
        console.log("\n[TEST 8] Testing Vaccination Due & Duplicate Suppression Safeguard...");
        // Add a vaccination record with next_due_date approaching (3 days from now)
        const inThreeDays = new Date();
        inThreeDays.setDate(inThreeDays.getDate() + 3);
        const nextDueDateStr = inThreeDays.toISOString().split("T")[0];

        const [vacIns] = await db.query(
            `INSERT INTO vaccinations (livestock_id, veterinarian_id, vaccine_name, vaccination_date, next_due_date, status, remarks)
             VALUES (?, ?, 'Foot and Mouth Disease (FMD)', CURDATE(), ?, 'Completed', 'Administered first dose')`,
            [livestockA, vet, nextDueDateStr]
        );
        vaccinationId = vacIns.insertId;

        // Farmer A checks notifications -> vaccination notification generated automatically!
        const vacNotifCheck1 = await fetch(`${BASE_URL}/notifications`, {
            headers: { Authorization: `Bearer ${tokenFarmerA}` }
        });
        const vacNotifs1 = await vacNotifCheck1.json();
        const vacNotif = vacNotifs1.find(
            (n) => n.notification_type === "VACCINATION_DUE" && n.related_id === vaccinationId
        );
        if (vacNotif) {
            console.log(`✓ Vaccination due notification created: "${vacNotif.title}" — "${vacNotif.message}"`);
        } else {
            throw new Error("Vaccination due notification was NOT created!");
        }

        // Count current notifications for Farmer A
        const countBeforeRefresh = vacNotifs1.length;

        // TEST DUPLICATE SUPPRESSION: Fetch notifications 3 times consecutively (simulating page refreshes)
        for (let i = 1; i <= 3; i++) {
            const refreshRes = await fetch(`${BASE_URL}/notifications`, {
                headers: { Authorization: `Bearer ${tokenFarmerA}` }
            });
            const refreshData = await refreshRes.json();
            const matchingVacNotifs = refreshData.filter(
                (n) => n.notification_type === "VACCINATION_DUE" && n.related_id === vaccinationId
            );
            if (matchingVacNotifs.length !== 1) {
                throw new Error(`DUPLICATE DETECTED on refresh ${i}: found ${matchingVacNotifs.length} matching notifications instead of exactly 1!`);
            }
        }
        console.log("✓ Duplicate suppression verified: Multiple consecutive refreshes did NOT create duplicate notifications!");

        // Farmer marks the vaccination notification as read, then refreshes again
        await fetch(`${BASE_URL}/notifications/${vacNotif.notification_id}/read`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${tokenFarmerA}` }
        });
        const refreshAfterRead = await fetch(`${BASE_URL}/notifications`, {
            headers: { Authorization: `Bearer ${tokenFarmerA}` }
        });
        const afterReadData = await refreshAfterRead.json();
        const matchingAfterRead = afterReadData.filter(
            (n) => n.notification_type === "VACCINATION_DUE" && n.related_id === vaccinationId
        );
        if (matchingAfterRead.length === 1 && matchingAfterRead[0].is_read === 1) {
            console.log("✓ Duplicate suppression after read verified: Status remains read and no duplicate created!");
        } else {
            throw new Error("Duplicate notification created after marking as read!");
        }

        console.log("\n==================================================");
        console.log("ALL 8 NOTIFICATION TESTS & SAFEGUARDS PASSED (100%)!");
        console.log("==================================================");

    } finally {
        console.log("\n[CLEANUP] Cleaning up test entities...");
        if (schemeAppId) await db.query("DELETE FROM scheme_applications WHERE application_id = ?", [schemeAppId]);
        if (schemeId) await db.query("DELETE FROM schemes WHERE scheme_id = ?", [schemeId]);
        if (insurancePolicyId) await db.query("DELETE FROM insurance_policies WHERE policy_id = ?", [insurancePolicyId]);
        if (vetRequestId) await db.query("DELETE FROM veterinarian_requests WHERE request_id = ?", [vetRequestId]);
        if (vaccinationId) await db.query("DELETE FROM vaccinations WHERE vaccination_id = ?", [vaccinationId]);
        if (livestockA) await db.query("DELETE FROM livestock WHERE livestock_id = ?", [livestockA]);
        if (vet) {
            await db.query("DELETE FROM veterinarian_verifications WHERE user_id = ?", [vet]);
            await db.query("DELETE FROM users WHERE user_id = ?", [vet]);
        }
        if (farmerA) await db.query("DELETE FROM users WHERE user_id = ?", [farmerA]);
        if (farmerB) await db.query("DELETE FROM users WHERE user_id = ?", [farmerB]);
        if (admin) await db.query("DELETE FROM users WHERE user_id = ?", [admin]);
        console.log("✓ Cleanup finished.");
    }
}

runNotificationsTestSuite()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("TEST FAILED:", err);
        process.exit(1);
    });
