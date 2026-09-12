import { useEffect, useState } from "react";
import API from "../services/api";

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [updating, setUpdating] = useState(null);

    // Selected user for View modal
    const [selectedUser, setSelectedUser] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // Veterinarian Verifications tab state
    const [activeTab, setActiveTab] = useState("USERS");
    const [verifications, setVerifications] = useState([]);
    const [verificationsLoading, setVerificationsLoading] = useState(false);
    const [actionUpdating, setActionUpdating] = useState(null);

    // =====================================================
    // LOAD USERS
    // =====================================================

    useEffect(() => {
        let cancelled = false;

        API.get("/admin/users")
            .then((response) => {
                if (cancelled) return;

                console.log("ADMIN USERS:", response.data);

                setUsers(response.data);
            })
            .catch((error) => {
                if (cancelled) return;

                console.error(
                    "GET USERS ERROR:",
                    error
                );

                console.error(
                    "STATUS:",
                    error.response?.status
                );

                console.error(
                    "DATA:",
                    error.response?.data
                );

                setError(
                    error.response?.data?.message ||
                    "Failed to load users"
                );
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    // =====================================================
    // VIEW USER
    // =====================================================

    const handleViewUser = async (userId) => {
        try {
            setDetailsLoading(true);
            setSelectedUser(null);

            console.log(
                "VIEW USER:",
                userId
            );

            const response = await API.get(
                `/admin/users/${userId}`
            );

            console.log(
                "USER DETAILS:",
                response.data
            );

            setSelectedUser(response.data);

        } catch (error) {
            console.error(
                "VIEW USER ERROR:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Unable to load user details"
            );
        } finally {
            setDetailsLoading(false);
        }
    };

    // =====================================================
    // UPDATE USER STATUS
    // =====================================================

    const updateStatus = async (userId, currentStatus) => {

        const newStatus =
            currentStatus === "ACTIVE"
                ? "INACTIVE"
                : "ACTIVE";

        const action =
            newStatus === "ACTIVE"
                ? "activate"
                : "deactivate";

        const confirmed = window.confirm(
            `Are you sure you want to ${action} this user?`
        );

        if (!confirmed) {
            return;
        }

        try {

            setUpdating(userId);
            setError("");

            console.log("=================================");
            console.log("CHANGING USER STATUS");
            console.log("User ID:", userId);
            console.log("Current:", currentStatus);
            console.log("New:", newStatus);
            console.log("=================================");

            const response = await API.put(
                `/admin/users/${userId}/status`,
                {
                    status: newStatus
                }
            );

            console.log(
                "STATUS UPDATE RESPONSE:",
                response.data
            );

            // Use status returned by backend
            const updatedUser = response.data.user;

            setUsers((previousUsers) =>
                previousUsers.map((user) =>
                    user.user_id === userId
                        ? {
                            ...user,
                            status: updatedUser.status
                        }
                        : user
                )
            );

            setSelectedUser((prevSelected) =>
                prevSelected && prevSelected.user_id === userId
                    ? {
                        ...prevSelected,
                        status: updatedUser.status
                    }
                    : prevSelected
            );

        } catch (error) {

            console.error(
                "UPDATE USER STATUS ERROR:",
                error
            );

            console.error(
                "HTTP STATUS:",
                error.response?.status
            );

            console.error(
                "SERVER RESPONSE:",
                error.response?.data
            );

            setError(
                error.response?.data?.message ||
                "Unable to update user status"
            );

        } finally {

            setUpdating(null);

        }
    };

    // =====================================================
    // VETERINARIAN VERIFICATIONS
    // =====================================================

    useEffect(() => {
        let cancelled = false;

        API.get("/admin/veterinarians/verifications")
            .then((res) => {
                if (cancelled) return;
                setVerifications(res.data);
            })
            .catch((err) => {
                if (cancelled) return;
                console.error("GET VERIFICATIONS ERROR:", err);
            })
            .finally(() => {
                if (!cancelled) {
                    setVerificationsLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const handleVerificationStatus = async (verificationId, newStatus) => {
        const actionText = newStatus === "APPROVED" ? "approve" : "reject";
        const confirmed = window.confirm(
            `Are you sure you want to ${actionText} this veterinarian application?`
        );
        if (!confirmed) {
            return;
        }

        try {
            setActionUpdating(verificationId);
            setError("");

            const res = await API.put(
                `/admin/veterinarians/verifications/${verificationId}/status`,
                { status: newStatus }
            );

            const updatedVerification = res.data.verification;

            setVerifications((prev) =>
                prev.map((v) =>
                    v.verification_id === verificationId
                        ? updatedVerification
                        : v
                )
            );

        } catch (err) {
            console.error("UPDATE VERIFICATION ERROR:", err);
            setError(
                err.response?.data?.message ||
                "Failed to update verification status"
            );
        } finally {
            setActionUpdating(null);
        }
    };

    const handleViewCertificate = (filePath) => {
        if (!filePath) {
            alert("No certificate file uploaded for this application.");
            return;
        }
        const fileUrl = `http://localhost:5000/${filePath}`;
        window.open(fileUrl, "_blank", "noopener,noreferrer");
    };

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F6F1E4] flex items-center justify-center">

                <p className="text-sm text-[#8A8072]">
                    Loading users...
                </p>

            </div>
        );
    }

    // =====================================================
    // PAGE
    // =====================================================

    return (
        <div className="min-h-screen bg-[#F6F1E4] px-6 py-12">

            <main className="max-w-6xl mx-auto">

                {/* HEADER */}

                <div className="mb-10">

                    <p className="text-[11px] tracking-[0.25em] uppercase text-[#A8452F] mb-3">
                        Administration
                    </p>

                    <h1 className="text-[2.1rem] font-medium text-[#2B2620]">
                        User Management
                    </h1>

                    <p className="text-sm text-[#8A8072] mt-3">
                        View registered users and manage their
                        account access.
                    </p>

                </div>

                {/* ERROR */}

                {error && (
                    <div className="mb-6 border-l-2 border-[#A8452F] bg-[#A8452F]/[0.06] px-5 py-4">

                        <p className="text-[10px] tracking-[0.15em] uppercase text-[#A8452F] mb-1">
                            Error
                        </p>

                        <p className="text-sm text-[#A8452F]">
                            {error}
                        </p>

                    </div>
                )}

                {/* TABS */}
                <div className="flex border-b border-[#DED7C9] mb-6">
                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab("USERS");
                            setError("");
                        }}
                        className={`pb-3.5 px-4 text-[11px] tracking-[0.15em] uppercase font-medium transition-all ${
                            activeTab === "USERS"
                                ? "border-b-2 border-[#1F3B2C] text-[#1F3B2C]"
                                : "text-[#8A8072] hover:text-[#2B2620]"
                        }`}
                    >
                        Registered Users ({users.length})
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab("VERIFICATIONS");
                            setError("");
                        }}
                        className={`pb-3.5 px-4 text-[11px] tracking-[0.15em] uppercase font-medium transition-all flex items-center gap-2 ${
                            activeTab === "VERIFICATIONS"
                                ? "border-b-2 border-[#1F3B2C] text-[#1F3B2C]"
                                : "text-[#8A8072] hover:text-[#2B2620]"
                        }`}
                    >
                        <span>Veterinarian Verifications</span>
                        {verifications.filter((v) => v.verification_status === "PENDING").length > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] bg-[#D9A441] text-[#1F3B2C] font-bold">
                                {verifications.filter((v) => v.verification_status === "PENDING").length}
                            </span>
                        )}
                    </button>
                </div>

                {/* USERS CARD */}
                {activeTab === "USERS" && (
                    <div className="bg-white border border-[#DED7C9] rounded-sm overflow-hidden">

                    {/* CARD HEADER */}

                    <div className="px-6 py-5 border-b border-[#DED7C9]">

                        <p className="text-[10px] tracking-[0.15em] uppercase text-[#8A8072]">
                            Registered Users
                        </p>

                        <h2 className="text-lg font-medium text-[#2B2620] mt-1">
                            {users.length} User
                            {users.length !== 1 ? "s" : ""}
                        </h2>

                    </div>

                    {/* TABLE */}

                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead>

                                <tr className="border-b border-[#DED7C9]">

                                    <th className="text-left px-6 py-4 text-[10px] tracking-[0.12em] uppercase text-[#8A8072] font-medium">
                                        Name
                                    </th>

                                    <th className="text-left px-6 py-4 text-[10px] tracking-[0.12em] uppercase text-[#8A8072] font-medium">
                                        Email
                                    </th>

                                    <th className="text-left px-6 py-4 text-[10px] tracking-[0.12em] uppercase text-[#8A8072] font-medium">
                                        Phone
                                    </th>

                                    <th className="text-left px-6 py-4 text-[10px] tracking-[0.12em] uppercase text-[#8A8072] font-medium">
                                        Role
                                    </th>

                                    <th className="text-left px-6 py-4 text-[10px] tracking-[0.12em] uppercase text-[#8A8072] font-medium">
                                        Status
                                    </th>

                                    <th className="text-right px-6 py-4 text-[10px] tracking-[0.12em] uppercase text-[#8A8072] font-medium">
                                        Actions
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {users.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="6"
                                            className="px-6 py-10 text-center text-sm text-[#8A8072]"
                                        >
                                            No users found.
                                        </td>

                                    </tr>

                                ) : (

                                    users.map((user) => {

                                        const isCurrentUser =
                                            user.user_id ===
                                            Number(
                                                localStorage.getItem(
                                                    "user_id"
                                                )
                                            );

                                        const isActive =
                                            String(
                                                user.status
                                            ).toUpperCase() ===
                                            "ACTIVE";

                                        return (
                                            <tr
                                                key={user.user_id}
                                                className="border-b border-[#EEE8DC] last:border-b-0"
                                            >

                                                {/* NAME */}

                                                <td className="px-6 py-5">

                                                    <p className="text-sm font-medium text-[#2B2620]">
                                                        {user.full_name}
                                                    </p>

                                                </td>

                                                {/* EMAIL */}

                                                <td className="px-6 py-5">

                                                    <p className="text-sm text-[#5F574D]">
                                                        {user.email}
                                                    </p>

                                                </td>

                                                {/* PHONE */}

                                                <td className="px-6 py-5">

                                                    <p className="text-sm text-[#5F574D]">
                                                        {user.phone || "—"}
                                                    </p>

                                                </td>

                                                {/* ROLE */}

                                                <td className="px-6 py-5">

                                                    <span className="text-[10px] tracking-[0.1em] uppercase text-[#5F574D]">
                                                        {user.role_name}
                                                    </span>

                                                </td>

                                                {/* STATUS */}

                                                <td className="px-6 py-5">

                                                    <span
                                                        className={
                                                            isActive
                                                                ? "inline-flex items-center px-3 py-1 rounded-full text-[10px] tracking-[0.1em] uppercase bg-green-100 text-green-700"
                                                                : "inline-flex items-center px-3 py-1 rounded-full text-[10px] tracking-[0.1em] uppercase bg-red-100 text-red-700"
                                                        }
                                                    >
                                                        {user.status}
                                                    </span>

                                                </td>

                                                {/* ACTIONS */}

                                                <td className="px-6 py-5">

                                                    <div className="flex justify-end items-center gap-3">

                                                        {/* VIEW */}

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleViewUser(
                                                                    user.user_id
                                                                )
                                                            }
                                                            className="px-4 py-2 text-[10px] tracking-[0.12em] uppercase border border-[#8A8072] text-[#5F574D] hover:bg-[#F6F1E4] transition"
                                                        >
                                                            View
                                                        </button>

                                                        {/* STATUS */}

                                                        {isCurrentUser ? (

                                                            <span className="px-4 py-2 text-[10px] uppercase tracking-[0.1em] text-[#A49A8A]">
                                                                Current Account
                                                            </span>

                                                        ) : (

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    updateStatus(
                                                                        user.user_id,
                                                                        user.status
                                                                    )
                                                                }
                                                                disabled={
                                                                    updating ===
                                                                    user.user_id
                                                                }
                                                                className={
                                                                    isActive
                                                                        ? "px-4 py-2 text-[10px] tracking-[0.12em] uppercase border border-[#A8452F] text-[#A8452F] hover:bg-[#A8452F] hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                                        : "px-4 py-2 text-[10px] tracking-[0.12em] uppercase border border-green-700 text-green-700 hover:bg-green-700 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                                }
                                                            >

                                                                {updating ===
                                                                user.user_id
                                                                    ? "Updating..."
                                                                    : isActive
                                                                    ? "Deactivate"
                                                                    : "Activate"}

                                                            </button>

                                                        )}

                                                    </div>

                                                </td>

                                            </tr>
                                        );
                                    })

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>
                )}

                {/* VETERINARIAN VERIFICATIONS CARD */}
                {activeTab === "VERIFICATIONS" && (
                    <div className="bg-white border border-[#DED7C9] rounded-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-[#DED7C9]">
                            <p className="text-[10px] tracking-[0.15em] uppercase text-[#8A8072]">
                                Verification Requests
                            </p>
                            <h2 className="text-lg font-medium text-[#2B2620] mt-1">
                                {verifications.length} Application{verifications.length !== 1 ? "s" : ""}
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[#DED7C9]">
                                        <th className="text-left px-6 py-4 text-[10px] tracking-[0.12em] uppercase text-[#8A8072] font-medium">
                                            Applicant
                                        </th>
                                        <th className="text-left px-6 py-4 text-[10px] tracking-[0.12em] uppercase text-[#8A8072] font-medium">
                                            Email
                                        </th>
                                        <th className="text-left px-6 py-4 text-[10px] tracking-[0.12em] uppercase text-[#8A8072] font-medium">
                                            Certificate
                                        </th>
                                        <th className="text-left px-6 py-4 text-[10px] tracking-[0.12em] uppercase text-[#8A8072] font-medium">
                                            Submitted
                                        </th>
                                        <th className="text-left px-6 py-4 text-[10px] tracking-[0.12em] uppercase text-[#8A8072] font-medium">
                                            Status
                                        </th>
                                        <th className="text-right px-6 py-4 text-[10px] tracking-[0.12em] uppercase text-[#8A8072] font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {verificationsLoading ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-10 text-center text-sm text-[#8A8072]">
                                                Loading applications...
                                            </td>
                                        </tr>
                                    ) : verifications.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-10 text-center text-sm text-[#8A8072]">
                                                No veterinarian applications found.
                                            </td>
                                        </tr>
                                    ) : (
                                        verifications.map((v) => {
                                            const isPending = v.verification_status === "PENDING";
                                            const isApproved = v.verification_status === "APPROVED";
                                            const isBusy = actionUpdating === v.verification_id;

                                            return (
                                                <tr key={v.verification_id} className="border-b border-[#EEE8DC] last:border-b-0">
                                                    {/* APPLICANT */}
                                                    <td className="px-6 py-5">
                                                        <p className="text-sm font-medium text-[#2B2620]">
                                                            {v.full_name}
                                                        </p>
                                                        <p className="text-xs text-[#8A8072] mt-0.5">
                                                            {v.phone || "No phone"}
                                                        </p>
                                                    </td>

                                                    {/* EMAIL */}
                                                    <td className="px-6 py-5">
                                                        <p className="text-sm text-[#5F574D]">
                                                            {v.email}
                                                        </p>
                                                    </td>

                                                    {/* CERTIFICATE */}
                                                    <td className="px-6 py-5">
                                                        <p className="text-sm font-medium text-[#2B2620]">
                                                            {v.certificate_name}
                                                        </p>
                                                        {v.certificate_number && (
                                                            <p className="text-[11px] text-[#8A8072] mt-0.5">
                                                                Reg: {v.certificate_number}
                                                            </p>
                                                        )}
                                                    </td>

                                                    {/* SUBMITTED */}
                                                    <td className="px-6 py-5">
                                                        <p className="text-sm text-[#5F574D]">
                                                            {v.submitted_at
                                                                ? new Date(v.submitted_at).toLocaleDateString()
                                                                : "—"}
                                                        </p>
                                                    </td>

                                                    {/* STATUS */}
                                                    <td className="px-6 py-5">
                                                        <span
                                                            className={
                                                                isPending
                                                                    ? "inline-flex items-center px-3 py-1 rounded-full text-[10px] tracking-[0.1em] uppercase bg-amber-100 text-amber-800 font-medium"
                                                                    : isApproved
                                                                    ? "inline-flex items-center px-3 py-1 rounded-full text-[10px] tracking-[0.1em] uppercase bg-green-100 text-green-700 font-medium"
                                                                    : "inline-flex items-center px-3 py-1 rounded-full text-[10px] tracking-[0.1em] uppercase bg-red-100 text-red-700 font-medium"
                                                            }
                                                        >
                                                            {v.verification_status}
                                                        </span>
                                                    </td>

                                                    {/* ACTIONS */}
                                                    <td className="px-6 py-5">
                                                        <div className="flex justify-end items-center gap-2.5">
                                                            {/* VIEW CERTIFICATE */}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleViewCertificate(v.certificate_file)}
                                                                className="px-3 py-1.5 text-[10px] tracking-[0.12em] uppercase border border-[#8A8072] text-[#5F574D] hover:bg-[#F6F1E4] transition"
                                                            >
                                                                View Certificate
                                                            </button>

                                                            {isPending ? (
                                                                <>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleVerificationStatus(v.verification_id, "APPROVED")}
                                                                        disabled={isBusy}
                                                                        className="px-3 py-1.5 text-[10px] tracking-[0.12em] uppercase border border-green-700 text-green-700 hover:bg-green-700 hover:text-white transition disabled:opacity-50"
                                                                    >
                                                                        {isBusy ? "Updating..." : "Approve"}
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleVerificationStatus(v.verification_id, "REJECTED")}
                                                                        disabled={isBusy}
                                                                        className="px-3 py-1.5 text-[10px] tracking-[0.12em] uppercase border border-[#A8452F] text-[#A8452F] hover:bg-[#A8452F] hover:text-white transition disabled:opacity-50"
                                                                    >
                                                                        {isBusy ? "Updating..." : "Reject"}
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <span className="text-[10px] tracking-[0.1em] uppercase text-[#A49A8A] px-2">
                                                                    Decided
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </main>

            {/* =====================================================
                USER DETAILS MODAL
            ===================================================== */}

            {(selectedUser || detailsLoading) && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B2620]/40 px-5">

                    <div className="w-full max-w-lg bg-[#F6F1E4] border border-[#DED7C9] rounded-sm shadow-xl">

                        {/* MODAL HEADER */}

                        <div className="px-6 py-5 border-b border-[#DED7C9] flex items-center justify-between">

                            <div>

                                <p className="text-[10px] tracking-[0.15em] uppercase text-[#A8452F]">
                                    User Details
                                </p>

                                <h2 className="text-xl font-medium text-[#2B2620] mt-1">
                                    {selectedUser
                                        ? selectedUser.full_name
                                        : "Loading..."}
                                </h2>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedUser(null)
                                }
                                className="text-2xl text-[#8A8072] hover:text-[#2B2620]"
                            >
                                ×
                            </button>

                        </div>

                        {/* MODAL CONTENT */}

                        <div className="p-6">

                            {detailsLoading ? (

                                <div className="py-8 text-center">

                                    <p className="text-sm text-[#8A8072]">
                                        Loading user details...
                                    </p>

                                </div>

                            ) : selectedUser ? (

                                <div className="space-y-5">

                                    <div>
                                        <p className="text-[10px] tracking-[0.12em] uppercase text-[#8A8072]">
                                            User ID
                                        </p>

                                        <p className="text-sm text-[#2B2620] mt-1">
                                            {selectedUser.user_id}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[10px] tracking-[0.12em] uppercase text-[#8A8072]">
                                            Full Name
                                        </p>

                                        <p className="text-sm text-[#2B2620] mt-1">
                                            {selectedUser.full_name}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[10px] tracking-[0.12em] uppercase text-[#8A8072]">
                                            Email
                                        </p>

                                        <p className="text-sm text-[#2B2620] mt-1">
                                            {selectedUser.email}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[10px] tracking-[0.12em] uppercase text-[#8A8072]">
                                            Phone
                                        </p>

                                        <p className="text-sm text-[#2B2620] mt-1">
                                            {selectedUser.phone || "Not provided"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[10px] tracking-[0.12em] uppercase text-[#8A8072]">
                                            Role
                                        </p>

                                        <p className="text-sm text-[#2B2620] mt-1">
                                            {selectedUser.role_name}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[10px] tracking-[0.12em] uppercase text-[#8A8072]">
                                            Status
                                        </p>

                                        <span
                                            className={
                                                String(
                                                    selectedUser.status
                                                ).toUpperCase() ===
                                                "ACTIVE"
                                                    ? "inline-flex mt-1 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.1em] bg-green-100 text-green-700"
                                                    : "inline-flex mt-1 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.1em] bg-red-100 text-red-700"
                                            }
                                        >
                                            {selectedUser.status}
                                        </span>
                                    </div>

                                    <div>
                                        <p className="text-[10px] tracking-[0.12em] uppercase text-[#8A8072]">
                                            Created At
                                        </p>

                                        <p className="text-sm text-[#2B2620] mt-1">
                                            {selectedUser.created_at
                                                ? new Date(
                                                      selectedUser.created_at
                                                  ).toLocaleString()
                                                : "Not available"}
                                        </p>
                                    </div>

                                </div>

                            ) : null}

                        </div>

                        {/* MODAL FOOTER */}

                        {selectedUser && !detailsLoading && (

                            <div className="px-6 py-4 border-t border-[#DED7C9] flex justify-end gap-3">

                                <button
                                    type="button"
                                    onClick={() =>
                                        updateStatus(
                                            selectedUser.user_id,
                                            selectedUser.status
                                        )
                                    }
                                    disabled={
                                        updating ===
                                        selectedUser.user_id
                                    }
                                    className={
                                        String(
                                            selectedUser.status
                                        ).toUpperCase() ===
                                        "ACTIVE"
                                            ? "px-4 py-2 text-[10px] tracking-[0.12em] uppercase border border-[#A8452F] text-[#A8452F] hover:bg-[#A8452F] hover:text-white transition disabled:opacity-50"
                                            : "px-4 py-2 text-[10px] tracking-[0.12em] uppercase border border-green-700 text-green-700 hover:bg-green-700 hover:text-white transition disabled:opacity-50"
                                    }
                                >
                                    {updating ===
                                    selectedUser.user_id
                                        ? "Updating..."
                                        : String(
                                              selectedUser.status
                                          ).toUpperCase() ===
                                          "ACTIVE"
                                        ? "Deactivate"
                                        : "Activate"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSelectedUser(null)
                                    }
                                    className="px-4 py-2 text-[10px] tracking-[0.12em] uppercase border border-[#BDB4A5] text-[#2B2620] hover:bg-white transition"
                                >
                                    Close
                                </button>

                            </div>

                        )}

                    </div>

                </div>

            )}

        </div>
    );
};

export default AdminUsers;