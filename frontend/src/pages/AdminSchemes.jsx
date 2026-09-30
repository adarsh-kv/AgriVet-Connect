import { useEffect, useState } from "react";
import API from "../services/api";

const sharedStyles = (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        .av-serif {
            font-family: 'Fraunces', serif;
        }

        .av-mono {
            font-family: 'JetBrains Mono', monospace;
        }

        body {
            font-family: 'Inter', sans-serif;
        }

        .av-input {
            border: 1px solid #DED7C9;
            border-radius: 2px;
            padding: 10px 14px;
            outline: none;
            transition: border-color 0.2s ease;
        }

        .av-input:focus {
            border-color: #D9A441;
        }

        @keyframes av-spin {
            to {
                transform: rotate(360deg);
            }
        }

        .av-spin {
            animation: av-spin 1s linear infinite;
        }
    `}</style>
);

const DocumentIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const ShieldIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const renderInsuranceBadge = (status) => {
    switch (status) {
        case "ACTIVE":
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] tracking-wider uppercase font-semibold bg-green-100 text-green-800 border border-green-300">
                    Active
                </span>
            );
        case "PENDING":
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] tracking-wider uppercase font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                    Pending
                </span>
            );
        case "REJECTED":
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] tracking-wider uppercase font-semibold bg-red-100 text-red-800 border border-red-300">
                    Rejected
                </span>
            );
        case "EXPIRED":
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] tracking-wider uppercase font-semibold bg-gray-100 text-gray-800 border border-gray-300">
                    Expired
                </span>
            );
        case "CLAIMED":
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] tracking-wider uppercase font-semibold bg-blue-100 text-blue-800 border border-blue-300">
                    Claimed
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] tracking-wider uppercase font-semibold bg-gray-100 text-gray-700">
                    {status}
                </span>
            );
    }
};

const EMPTY_SCHEME = {
    scheme_name: "",
    scheme_code: "",
    category: "Subsidy",
    description: "",
    eligibility: "",
    benefits: "",
    department: "",
    application_deadline: "",
    status: "ACTIVE"
};

const CATEGORIES = [
    "Subsidy",
    "Financial Aid",
    "Fodder & Feed",
    "Breeding & Genetics",
    "Healthcare & Disease Control",
    "Equipment & Infrastructure",
    "Insurance & Relief"
];

const AdminSchemes = () => {
    // Top-Level Module Navigation: "schemes" | "insurance"
    const [mainModule, setMainModule] = useState("schemes");

    // Schemes Sub-tab: "schemes" | "applications"
    const [schemeTab, setSchemeTab] = useState("schemes");

    // Schemes Data States
    const [schemes, setSchemes] = useState([]);
    const [applications, setApplications] = useState([]);

    // Insurance Data States
    const [insurancePolicies, setInsurancePolicies] = useState([]);

    // Loading & Alerts
    const [loading, setLoading] = useState(true);
    const [insuranceLoading, setInsuranceLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Scheme Form Modal State (Create / Edit)
    const [showSchemeModal, setShowSchemeModal] = useState(false);
    const [editingSchemeId, setEditingSchemeId] = useState(null);
    const [schemeForm, setSchemeForm] = useState(EMPTY_SCHEME);
    const [savingScheme, setSavingScheme] = useState(false);
    const [formError, setFormError] = useState("");

    // Review Scheme Application Modal State
    const [reviewModalApp, setReviewModalApp] = useState(null);
    const [reviewStatus, setReviewStatus] = useState("APPROVED");
    const [reviewRemarks, setReviewRemarks] = useState("");
    const [reviewing, setReviewing] = useState(false);
    const [reviewError, setReviewError] = useState("");

    // Insurance Modals State
    const [viewingInsurancePolicy, setViewingInsurancePolicy] = useState(null);
    const [approveModalPolicy, setApproveModalPolicy] = useState(null);
    const [rejectModalPolicy, setRejectModalPolicy] = useState(null);

    // Insurance Approval Form
    const [approvalPolicyNumber, setApprovalPolicyNumber] = useState("");
    const [approvalStartDate, setApprovalStartDate] = useState("");
    const [approvalEndDate, setApprovalEndDate] = useState("");
    const [approvalRemarks, setApprovalRemarks] = useState("");
    const [approving, setApproving] = useState(false);
    const [approvalError, setApprovalError] = useState("");

    // Insurance Rejection Form
    const [rejectionRemarks, setRejectionRemarks] = useState("");
    const [rejecting, setRejecting] = useState(false);
    const [rejectionError, setRejectionError] = useState("");

    // Fetch initial schemes data
    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const [schemesRes, appsRes, insuranceRes] = await Promise.all([
                    API.get("/schemes"),
                    API.get("/schemes/applications"),
                    API.get("/insurance")
                ]);

                if (isMounted) {
                    setSchemes(schemesRes.data);
                    setApplications(appsRes.data);
                    setInsurancePolicies(insuranceRes.data);
                    setError("");
                }
            } catch (err) {
                if (isMounted) {
                    console.error("ADMIN SCHEMES LOAD ERROR:", err);
                    setError(err.response?.data?.message || "Failed to load schemes administration data");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    // Fetch Insurance Policies
    const fetchInsurancePolicies = async () => {
        setInsuranceLoading(true);
        try {
            const res = await API.get("/insurance");
            setInsurancePolicies(res.data);
        } catch (err) {
            console.error("ADMIN LOAD INSURANCE ERROR:", err);
            setError(err.response?.data?.message || "Failed to load insurance policies");
        } finally {
            setInsuranceLoading(false);
        }
    };

    // ========================================================
    // SCHEME HANDLERS
    // ========================================================
    const handleOpenAddSchemeModal = () => {
        setEditingSchemeId(null);
        setSchemeForm(EMPTY_SCHEME);
        setFormError("");
        setShowSchemeModal(true);
    };

    const handleOpenEditSchemeModal = (scheme) => {
        setEditingSchemeId(scheme.scheme_id);
        setSchemeForm({
            scheme_name: scheme.scheme_name,
            scheme_code: scheme.scheme_code,
            category: scheme.category,
            description: scheme.description,
            eligibility: scheme.eligibility,
            benefits: scheme.benefits,
            department: scheme.department,
            application_deadline: scheme.application_deadline
                ? String(scheme.application_deadline).split("T")[0]
                : "",
            status: scheme.status
        });
        setFormError("");
        setShowSchemeModal(true);
    };

    const handleCloseSchemeModal = () => {
        setShowSchemeModal(false);
        setEditingSchemeId(null);
        setSchemeForm(EMPTY_SCHEME);
        setFormError("");
    };

    const handleSchemeFormChange = (e) => {
        const { name, value } = e.target;
        setSchemeForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveScheme = async (e) => {
        e.preventDefault();
        setFormError("");
        setSuccessMessage("");

        if (
            !schemeForm.scheme_name.trim() ||
            !schemeForm.scheme_code.trim() ||
            !schemeForm.category.trim() ||
            !schemeForm.description.trim() ||
            !schemeForm.eligibility.trim() ||
            !schemeForm.benefits.trim() ||
            !schemeForm.department.trim()
        ) {
            setFormError("All fields except deadline are required.");
            return;
        }

        setSavingScheme(true);

        try {
            const payload = {
                ...schemeForm,
                application_deadline: schemeForm.application_deadline || null
            };

            if (editingSchemeId) {
                await API.put(`/schemes/${editingSchemeId}`, payload);
                setSuccessMessage(`Scheme "${schemeForm.scheme_name}" updated successfully.`);
            } else {
                await API.post("/schemes", payload);
                setSuccessMessage(`Scheme "${schemeForm.scheme_name}" created successfully.`);
            }

            handleCloseSchemeModal();
            const updated = await API.get("/schemes");
            setSchemes(updated.data);
        } catch (err) {
            console.error("SAVE SCHEME ERROR:", err);
            setFormError(err.response?.data?.message || "Failed to save scheme");
        } finally {
            setSavingScheme(false);
        }
    };

    const handleToggleSchemeStatus = async (scheme) => {
        const newStatus = scheme.status === "ACTIVE" ? "CLOSED" : "ACTIVE";
        try {
            await API.put(`/schemes/${scheme.scheme_id}`, {
                ...scheme,
                application_deadline: scheme.application_deadline
                    ? String(scheme.application_deadline).split("T")[0]
                    : null,
                status: newStatus
            });

            setSuccessMessage(`Scheme status changed to ${newStatus}.`);
            const updated = await API.get("/schemes");
            setSchemes(updated.data);
        } catch (err) {
            console.error("TOGGLE STATUS ERROR:", err);
            setError(err.response?.data?.message || "Failed to update scheme status");
        }
    };

    const handleDeleteScheme = async (schemeId, schemeName) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete scheme "${schemeName}"? All associated farmer applications will also be deleted.`
        );
        if (!confirmed) return;

        try {
            await API.delete(`/schemes/${schemeId}`);
            setSuccessMessage(`Scheme "${schemeName}" deleted successfully.`);
            const [schemesRes, appsRes] = await Promise.all([
                API.get("/schemes"),
                API.get("/schemes/applications")
            ]);
            setSchemes(schemesRes.data);
            setApplications(appsRes.data);
        } catch (err) {
            console.error("DELETE SCHEME ERROR:", err);
            setError(err.response?.data?.message || "Failed to delete scheme");
        }
    };

    // Scheme Application Review
    const handleOpenReviewSchemeModal = (app) => {
        setReviewModalApp(app);
        setReviewStatus(app.status === "REJECTED" ? "REJECTED" : "APPROVED");
        setReviewRemarks(app.admin_remarks || "");
        setReviewError("");
    };

    const handleCloseReviewSchemeModal = () => {
        setReviewModalApp(null);
        setReviewRemarks("");
        setReviewError("");
    };

    const handleSaveSchemeReview = async (e) => {
        e.preventDefault();
        if (!reviewModalApp) return;

        setReviewing(true);
        setReviewError("");

        try {
            await API.put(`/schemes/applications/${reviewModalApp.application_id}/status`, {
                status: reviewStatus,
                admin_remarks: reviewRemarks.trim() || null
            });

            setSuccessMessage(
                `Application for ${reviewModalApp.farmer_name} ${reviewStatus.toLowerCase()} successfully.`
            );
            handleCloseReviewSchemeModal();

            const updatedApps = await API.get("/schemes/applications");
            setApplications(updatedApps.data);
        } catch (err) {
            console.error("REVIEW APPLICATION ERROR:", err);
            setReviewError(err.response?.data?.message || "Failed to update application status");
        } finally {
            setReviewing(false);
        }
    };

    // ========================================================
    // INSURANCE HANDLERS
    // ========================================================
    const handleOpenApproveModal = (policy) => {
        setApproveModalPolicy(policy);
        // Pre-fill or generate suggested policy number
        const defaultPolNum = policy.policy_number || `AGV-INS-${String(policy.policy_id).padStart(4, "0")}`;
        setApprovalPolicyNumber(defaultPolNum);

        // Pre-fill start date (requested start date or today)
        const todayStr = new Date().toISOString().split("T")[0];
        const sDate = policy.start_date ? String(policy.start_date).split("T")[0] : todayStr;
        setApprovalStartDate(sDate);

        // Pre-fill end date (requested end date or 1 year from start date)
        if (policy.end_date) {
            setApprovalEndDate(String(policy.end_date).split("T")[0]);
        } else {
            const nextYear = new Date();
            nextYear.setFullYear(nextYear.getFullYear() + 1);
            setApprovalEndDate(nextYear.toISOString().split("T")[0]);
        }

        setApprovalRemarks(policy.admin_remarks || "");
        setApprovalError("");
    };

    const handleCloseApproveModal = () => {
        setApproveModalPolicy(null);
        setApprovalPolicyNumber("");
        setApprovalStartDate("");
        setApprovalEndDate("");
        setApprovalRemarks("");
        setApprovalError("");
    };

    const handleConfirmApproval = async (e) => {
        e.preventDefault();
        if (!approveModalPolicy) return;

        if (!approvalPolicyNumber.trim()) {
            setApprovalError("Policy number is required for approval.");
            return;
        }

        if (!approvalStartDate) {
            setApprovalError("Policy start date is required.");
            return;
        }

        if (!approvalEndDate) {
            setApprovalError("Policy end date is required.");
            return;
        }

        if (new Date(approvalEndDate) < new Date(approvalStartDate)) {
            setApprovalError("End date cannot be earlier than start date.");
            return;
        }

        setApproving(true);
        setApprovalError("");

        try {
            await API.put(`/insurance/${approveModalPolicy.policy_id}/status`, {
                status: "ACTIVE",
                policy_number: approvalPolicyNumber.trim(),
                start_date: approvalStartDate,
                end_date: approvalEndDate,
                admin_remarks: approvalRemarks.trim() || null
            });

            setSuccessMessage(
                `Policy ${approvalPolicyNumber.trim()} approved and activated successfully.`
            );
            handleCloseApproveModal();
            await fetchInsurancePolicies();
        } catch (err) {
            console.error("APPROVE INSURANCE ERROR:", err);
            setApprovalError(err.response?.data?.message || "Failed to approve insurance policy.");
        } finally {
            setApproving(false);
        }
    };

    const handleOpenRejectModal = (policy) => {
        setRejectModalPolicy(policy);
        setRejectionRemarks(policy.admin_remarks || "");
        setRejectionError("");
    };

    const handleCloseRejectModal = () => {
        setRejectModalPolicy(null);
        setRejectionRemarks("");
        setRejectionError("");
    };

    const handleConfirmRejection = async (e) => {
        e.preventDefault();
        if (!rejectModalPolicy) return;

        setRejecting(true);
        setRejectionError("");

        try {
            await API.put(`/insurance/${rejectModalPolicy.policy_id}/status`, {
                status: "REJECTED",
                admin_remarks: rejectionRemarks.trim() || null
            });

            setSuccessMessage(`Insurance application #${rejectModalPolicy.policy_id} rejected.`);
            handleCloseRejectModal();
            await fetchInsurancePolicies();
        } catch (err) {
            console.error("REJECT INSURANCE ERROR:", err);
            setRejectionError(err.response?.data?.message || "Failed to reject insurance policy.");
        } finally {
            setRejecting(false);
        }
    };

    const handleDeleteInsurancePolicy = async (policyId) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete insurance policy record #${policyId}? This action cannot be undone.`
        );
        if (!confirmed) return;

        try {
            await API.delete(`/insurance/${policyId}`);
            setSuccessMessage(`Insurance policy #${policyId} deleted successfully.`);
            await fetchInsurancePolicies();
        } catch (err) {
            console.error("DELETE INSURANCE ERROR:", err);
            setError(err.response?.data?.message || "Failed to delete insurance policy.");
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {sharedStyles}

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <p className="av-mono text-xs uppercase tracking-[0.2em] text-[#A8452F] mb-1">
                        Administration
                    </p>
                    <h1 className="av-serif text-3xl font-medium text-[#2B2620]">
                        Schemes & Insurance Management
                    </h1>
                    <p className="text-sm text-[#8A8072] mt-1">
                        Publish government schemes, review farmer subsidy applications, and manage livestock insurance policies.
                    </p>
                </div>

                {mainModule === "schemes" && schemeTab === "schemes" && (
                    <button
                        type="button"
                        onClick={handleOpenAddSchemeModal}
                        className="px-5 py-2.5 bg-[#1F3B2C] text-[#F6F1E4] hover:bg-[#2C4A37] text-xs uppercase tracking-[0.15em] font-medium rounded-xs transition"
                    >
                        + Add New Scheme
                    </button>
                )}
            </div>

            {/* ALERTS */}
            {error && (
                <div className="mb-6 border-l-2 border-[#A8452F] bg-[#A8452F]/[0.06] px-5 py-4 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] tracking-[0.15em] uppercase text-[#A8452F] font-semibold mb-0.5">
                            Error
                        </p>
                        <p className="text-sm text-[#A8452F]">{error}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setError("")}
                        className="text-xs text-[#A8452F] hover:underline uppercase tracking-wider"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {successMessage && (
                <div className="mb-6 border-l-2 border-[#1F3B2C] bg-[#1F3B2C]/[0.06] px-5 py-4 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] tracking-[0.15em] uppercase text-[#1F3B2C] font-semibold mb-0.5">
                            Success
                        </p>
                        <p className="text-sm text-[#1F3B2C]">{successMessage}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setSuccessMessage("")}
                        className="text-xs text-[#1F3B2C] hover:underline uppercase tracking-wider"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* TOP-LEVEL UNIFIED MODULE NAVIGATION */}
            <div className="flex border-b-2 border-[#DED7C9] mb-8 gap-8">
                <button
                    type="button"
                    onClick={() => {
                        setMainModule("schemes");
                        setError("");
                    }}
                    className={`pb-3 text-sm font-semibold tracking-wide transition flex items-center gap-2 border-b-2 -mb-[2px] ${
                        mainModule === "schemes"
                            ? "border-[#1F3B2C] text-[#1F3B2C]"
                            : "border-transparent text-[#8A8072] hover:text-[#2B2620]"
                    }`}
                >
                    <DocumentIcon />
                    Government Schemes ({schemes.length})
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setMainModule("insurance");
                        setError("");
                    }}
                    className={`pb-3 text-sm font-semibold tracking-wide transition flex items-center gap-2 border-b-2 -mb-[2px] ${
                        mainModule === "insurance"
                            ? "border-[#1F3B2C] text-[#1F3B2C]"
                            : "border-transparent text-[#8A8072] hover:text-[#2B2620]"
                    }`}
                >
                    <ShieldIcon />
                    Livestock Insurance ({insurancePolicies.length})
                </button>
            </div>

            {/* ========================================================
                ADMIN MODULE 1: GOVERNMENT SCHEMES
            ======================================================== */}
            {mainModule === "schemes" && (
                <div>
                    {/* SUB-TABS */}
                    <div className="flex border-b border-[#EEE8DC] mb-6">
                        <button
                            type="button"
                            onClick={() => setSchemeTab("schemes")}
                            className={`pb-2.5 px-4 text-xs uppercase tracking-[0.15em] font-medium transition border-b-2 ${
                                schemeTab === "schemes"
                                    ? "border-[#1F3B2C] text-[#1F3B2C]"
                                    : "border-transparent text-[#8A8072] hover:text-[#2B2620]"
                            }`}
                        >
                            All Schemes ({schemes.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setSchemeTab("applications")}
                            className={`pb-2.5 px-4 text-xs uppercase tracking-[0.15em] font-medium transition border-b-2 ${
                                schemeTab === "applications"
                                    ? "border-[#1F3B2C] text-[#1F3B2C]"
                                    : "border-transparent text-[#8A8072] hover:text-[#2B2620]"
                            }`}
                        >
                            Farmer Applications ({applications.length})
                        </button>
                    </div>

                    {loading ? (
                        <div className="p-16 text-center text-sm text-[#8A8072] flex items-center justify-center gap-3">
                            <div className="w-5 h-5 border-2 border-[#1F3B2C] border-t-transparent rounded-full av-spin" />
                            Loading administration data...
                        </div>
                    ) : schemeTab === "schemes" ? (
                        /* SCHEMES TABLE */
                        <div className="bg-white border border-[#DED7C9] rounded-sm overflow-hidden shadow-xs">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-[#EEE8DC] bg-[#F6F1E4]/50">
                                            <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072]">
                                                Code
                                            </th>
                                            <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072]">
                                                Scheme Name
                                            </th>
                                            <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072]">
                                                Category / Dept
                                            </th>
                                            <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072]">
                                                Deadline
                                            </th>
                                            <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072]">
                                                Status
                                            </th>
                                            <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#EEE8DC]">
                                        {schemes.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="py-10 text-center text-sm text-[#8A8072]">
                                                    No schemes found. Click &quot;+ Add New Scheme&quot; to publish one.
                                                </td>
                                            </tr>
                                        ) : (
                                            schemes.map((scheme) => (
                                                <tr key={scheme.scheme_id} className="hover:bg-[#F6F1E4]/30 transition-colors">
                                                    <td className="py-4 px-5">
                                                        <span className="av-mono text-xs font-semibold px-2 py-0.5 bg-[#EEE8DC] text-[#2B2620] rounded-xs">
                                                            {scheme.scheme_code}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-5">
                                                        <p className="text-sm font-medium text-[#2B2620]">
                                                            {scheme.scheme_name}
                                                        </p>
                                                        <p className="text-xs text-[#8A8072] line-clamp-1">
                                                            {scheme.benefits}
                                                        </p>
                                                    </td>
                                                    <td className="py-4 px-5 text-xs text-[#5F574D]">
                                                        <p className="font-medium text-[#1F3B2C]">{scheme.category}</p>
                                                        <p className="text-[#8A8072]">{scheme.department}</p>
                                                    </td>
                                                    <td className="py-4 px-5 text-xs text-[#5F574D]">
                                                        {scheme.application_deadline
                                                            ? new Date(scheme.application_deadline).toLocaleDateString("en-IN", {
                                                                  day: "2-digit",
                                                                  month: "short",
                                                                  year: "numeric"
                                                              })
                                                            : "Ongoing"}
                                                    </td>
                                                    <td className="py-4 px-5">
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] tracking-wider uppercase font-medium ${
                                                                scheme.status === "ACTIVE"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : "bg-gray-200 text-gray-700"
                                                            }`}
                                                        >
                                                            {scheme.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-5 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleToggleSchemeStatus(scheme)}
                                                                className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium border border-[#8A8072] text-[#5F574D] hover:bg-[#F6F1E4] rounded-xs transition"
                                                            >
                                                                {scheme.status === "ACTIVE" ? "Close" : "Activate"}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenEditSchemeModal(scheme)}
                                                                className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium border border-[#1F3B2C] text-[#1F3B2C] hover:bg-[#1F3B2C] hover:text-white rounded-xs transition"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteScheme(scheme.scheme_id, scheme.scheme_name)}
                                                                className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium border border-red-300 text-red-700 hover:bg-red-700 hover:text-white rounded-xs transition"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        /* SCHEME APPLICATIONS TABLE */
                        <div className="bg-white border border-[#DED7C9] rounded-sm overflow-hidden shadow-xs">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-[#EEE8DC] bg-[#F6F1E4]/50">
                                            <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072]">
                                                Applicant
                                            </th>
                                            <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072]">
                                                Scheme
                                            </th>
                                            <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072]">
                                                Animal
                                            </th>
                                            <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072]">
                                                Applied Date
                                            </th>
                                            <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072]">
                                                Status
                                            </th>
                                            <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072]">
                                                Remarks
                                            </th>
                                            <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#EEE8DC]">
                                        {applications.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="py-10 text-center text-sm text-[#8A8072]">
                                                    No farmer applications submitted yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            applications.map((app) => (
                                                <tr key={app.application_id} className="hover:bg-[#F6F1E4]/30 transition-colors">
                                                    <td className="py-4 px-5">
                                                        <p className="text-sm font-medium text-[#2B2620]">
                                                            {app.farmer_name}
                                                        </p>
                                                        <p className="text-xs text-[#8A8072]">
                                                            {app.farmer_phone || app.farmer_email}
                                                        </p>
                                                    </td>
                                                    <td className="py-4 px-5">
                                                        <p className="text-sm font-medium text-[#2B2620]">
                                                            {app.scheme_name}
                                                        </p>
                                                        <span className="av-mono text-[10px] text-[#8A8072]">
                                                            {app.scheme_code}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-5 text-xs text-[#5F574D]">
                                                        {app.tag_number ? (
                                                            <span>
                                                                {app.animal_name ? `${app.animal_name} (${app.tag_number})` : app.tag_number}
                                                            </span>
                                                        ) : (
                                                            <span className="text-[#8A8072] italic">General</span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-5 text-xs text-[#5F574D]">
                                                        {app.applied_at
                                                            ? new Date(app.applied_at).toLocaleDateString("en-IN", {
                                                                  day: "2-digit",
                                                                  month: "short",
                                                                  year: "numeric"
                                                              })
                                                            : "—"}
                                                    </td>
                                                    <td className="py-4 px-5">
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] tracking-wider uppercase font-medium ${
                                                                app.status === "PENDING"
                                                                    ? "bg-amber-100 text-amber-800"
                                                                    : app.status === "APPROVED"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : "bg-red-100 text-red-800"
                                                            }`}
                                                        >
                                                            {app.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-5 text-xs text-[#5F574D] max-w-xs truncate">
                                                        {app.admin_remarks || app.applicant_notes || "—"}
                                                    </td>
                                                    <td className="py-4 px-5 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenReviewSchemeModal(app)}
                                                            className="px-3 py-1.5 text-xs uppercase tracking-wider font-medium bg-[#1F3B2C] text-[#F6F1E4] hover:bg-[#2C4A37] rounded-xs transition"
                                                        >
                                                            Review
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ========================================================
                ADMIN MODULE 2: LIVESTOCK INSURANCE
            ======================================================== */}
            {mainModule === "insurance" && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="av-serif text-xl font-medium text-[#2B2620]">
                                Livestock Insurance Policies & Applications
                            </h2>
                            <p className="text-xs text-[#8A8072] mt-0.5">
                                Review pending insurance applications, approve coverage with assigned policy numbers, or view complete policy records.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={fetchInsurancePolicies}
                            className="px-4 py-2 border border-[#8A8072] text-[#5F574D] hover:bg-[#F6F1E4] text-xs uppercase tracking-[0.15em] font-medium rounded-xs transition"
                        >
                            Refresh List
                        </button>
                    </div>

                    {insuranceLoading ? (
                        <div className="p-16 text-center text-sm text-[#8A8072] flex items-center justify-center gap-3">
                            <div className="w-5 h-5 border-2 border-[#1F3B2C] border-t-transparent rounded-full av-spin" />
                            Loading insurance policies...
                        </div>
                    ) : (
                        <div className="bg-white border border-[#DED7C9] rounded-sm overflow-hidden shadow-xs">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-[#EEE8DC] bg-[#F6F1E4]/50">
                                            <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072]">
                                                Policy / Provider
                                            </th>
                                            <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072]">
                                                Farmer / Applicant
                                            </th>
                                            <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072]">
                                                Livestock
                                            </th>
                                            <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072]">
                                                Coverage & Premium
                                            </th>
                                            <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072]">
                                                Status
                                            </th>
                                            <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072]">
                                                Applied Date
                                            </th>
                                            <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#EEE8DC]">
                                        {insurancePolicies.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="py-10 text-center text-sm text-[#8A8072]">
                                                    No insurance applications submitted by farmers yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            insurancePolicies.map((pol) => {
                                                const isPending = pol.status === "PENDING";

                                                return (
                                                    <tr key={pol.policy_id} className="hover:bg-[#F6F1E4]/30 transition-colors">
                                                        <td className="py-4 px-5">
                                                            {pol.policy_number ? (
                                                                <p className="av-mono text-xs font-semibold text-[#1F3B2C] bg-[#1F3B2C]/10 px-2 py-0.5 rounded-xs inline-block mb-1">
                                                                    {pol.policy_number}
                                                                </p>
                                                            ) : (
                                                                <span className="av-mono text-[10px] text-[#8A8072] bg-gray-100 px-2 py-0.5 rounded-xs inline-block mb-1">
                                                                    Pending Number
                                                                </span>
                                                            )}
                                                            <p className="text-sm font-medium text-[#2B2620]">
                                                                {pol.policy_name}
                                                            </p>
                                                            <p className="text-xs text-[#8A8072]">
                                                                {pol.insurance_provider}
                                                            </p>
                                                        </td>
                                                        <td className="py-4 px-5 text-xs">
                                                            <p className="font-semibold text-[#2B2620]">
                                                                {pol.farmer_name}
                                                            </p>
                                                            <p className="text-[#8A8072]">
                                                                {pol.farmer_phone || pol.farmer_email}
                                                            </p>
                                                        </td>
                                                        <td className="py-4 px-5 text-xs text-[#5F574D]">
                                                            <p className="font-semibold text-[#2B2620]">
                                                                {pol.animal_name ? `${pol.animal_name} (${pol.tag_number})` : pol.tag_number}
                                                            </p>
                                                            <p className="text-[#8A8072]">
                                                                {pol.species} • {pol.breed}
                                                            </p>
                                                        </td>
                                                        <td className="py-4 px-5 text-xs text-[#5F574D]">
                                                            <p className="font-semibold text-[#1F3B2C]">
                                                                Cover: ₹{Number(pol.coverage_amount).toLocaleString("en-IN")}
                                                            </p>
                                                            <p className="text-[#8A8072]">
                                                                Prem: ₹{Number(pol.premium_amount).toLocaleString("en-IN")}
                                                                {Number(pol.subsidy_amount) > 0 && (
                                                                    <span className="text-[#D9A441] ml-1">
                                                                        (Sub: ₹{Number(pol.subsidy_amount).toLocaleString("en-IN")})
                                                                    </span>
                                                                )}
                                                            </p>
                                                        </td>
                                                        <td className="py-4 px-5">
                                                            {renderInsuranceBadge(pol.status)}
                                                        </td>
                                                        <td className="py-4 px-5 text-xs text-[#5F574D]">
                                                            {pol.applied_at
                                                                ? new Date(pol.applied_at).toLocaleDateString("en-IN", {
                                                                      day: "2-digit",
                                                                      month: "short",
                                                                      year: "numeric"
                                                                  })
                                                                : "—"}
                                                        </td>
                                                        <td className="py-4 px-5 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setViewingInsurancePolicy(pol)}
                                                                    className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium border border-[#8A8072] text-[#5F574D] hover:bg-[#F6F1E4] rounded-xs transition"
                                                                >
                                                                    Details
                                                                </button>

                                                                {isPending && (
                                                                    <>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleOpenApproveModal(pol)}
                                                                            className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium bg-[#1F3B2C] text-[#F6F1E4] hover:bg-[#2C4A37] rounded-xs transition"
                                                                        >
                                                                            Approve
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleOpenRejectModal(pol)}
                                                                            className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium bg-red-700 text-white hover:bg-red-800 rounded-xs transition"
                                                                        >
                                                                            Reject
                                                                        </button>
                                                                    </>
                                                                )}

                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteInsurancePolicy(pol.policy_id)}
                                                                    className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium border border-red-300 text-red-700 hover:bg-red-700 hover:text-white rounded-xs transition"
                                                                >
                                                                    Delete
                                                                </button>
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
                </div>
            )}

            {/* ========================================================
                SCHEME CREATE / EDIT MODAL
            ======================================================== */}
            {showSchemeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
                    <div className="bg-white border border-[#DED7C9] rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto p-7 shadow-lg">
                        <div className="flex items-center justify-between mb-5 border-b border-[#EEE8DC] pb-4">
                            <h2 className="av-serif text-2xl font-medium text-[#2B2620]">
                                {editingSchemeId ? "Edit Scheme" : "Create New Scheme"}
                            </h2>
                            <button
                                type="button"
                                onClick={handleCloseSchemeModal}
                                className="text-[#8A8072] hover:text-[#2B2620] text-xl font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        {formError && (
                            <div className="mb-5 border-l-2 border-[#A8452F] bg-[#A8452F]/[0.06] px-4 py-3">
                                <p className="text-xs text-[#A8452F] font-medium">{formError}</p>
                            </div>
                        )}

                        <form onSubmit={handleSaveScheme} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-1">
                                        Scheme Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="scheme_name"
                                        value={schemeForm.scheme_name}
                                        onChange={handleSchemeFormChange}
                                        placeholder="e.g. National Livestock Mission"
                                        className="av-input w-full text-sm text-[#2B2620]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-1">
                                        Scheme Code *
                                    </label>
                                    <input
                                        type="text"
                                        name="scheme_code"
                                        value={schemeForm.scheme_code}
                                        onChange={handleSchemeFormChange}
                                        placeholder="e.g. NLM-2026"
                                        className="av-input w-full text-sm text-[#2B2620] uppercase font-mono"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-1">
                                        Category *
                                    </label>
                                    <select
                                        name="category"
                                        value={schemeForm.category}
                                        onChange={handleSchemeFormChange}
                                        className="av-input w-full text-sm text-[#2B2620] bg-white"
                                        required
                                    >
                                        {CATEGORIES.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-1">
                                        Department / Agency *
                                    </label>
                                    <input
                                        type="text"
                                        name="department"
                                        value={schemeForm.department}
                                        onChange={handleSchemeFormChange}
                                        placeholder="e.g. Dept of Animal Husbandry"
                                        className="av-input w-full text-sm text-[#2B2620]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-1">
                                        Application Deadline (Optional)
                                    </label>
                                    <input
                                        type="date"
                                        name="application_deadline"
                                        value={schemeForm.application_deadline}
                                        onChange={handleSchemeFormChange}
                                        className="av-input w-full text-sm text-[#2B2620]"
                                    />
                                </div>

                                <div>
                                    <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-1">
                                        Status *
                                    </label>
                                    <select
                                        name="status"
                                        value={schemeForm.status}
                                        onChange={handleSchemeFormChange}
                                        className="av-input w-full text-sm text-[#2B2620] bg-white"
                                        required
                                    >
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="CLOSED">CLOSED</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-1">
                                    Benefits *
                                </label>
                                <textarea
                                    rows="2"
                                    name="benefits"
                                    value={schemeForm.benefits}
                                    onChange={handleSchemeFormChange}
                                    placeholder="e.g. 50% capital subsidy up to ₹50,000 for shed construction & feed."
                                    className="av-input w-full text-sm text-[#2B2620]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-1">
                                    Eligibility Criteria *
                                </label>
                                <textarea
                                    rows="2"
                                    name="eligibility"
                                    value={schemeForm.eligibility}
                                    onChange={handleSchemeFormChange}
                                    placeholder="e.g. Small and marginal dairy farmers holding registered cattle."
                                    className="av-input w-full text-sm text-[#2B2620]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-1">
                                    Full Description *
                                </label>
                                <textarea
                                    rows="3"
                                    name="description"
                                    value={schemeForm.description}
                                    onChange={handleSchemeFormChange}
                                    placeholder="Detailed overview and guidelines for the scheme..."
                                    className="av-input w-full text-sm text-[#2B2620]"
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EEE8DC]">
                                <button
                                    type="button"
                                    onClick={handleCloseSchemeModal}
                                    className="px-5 py-2.5 border border-[#8A8072] text-[#5F574D] hover:bg-[#F6F1E4] text-xs uppercase tracking-[0.15em] font-medium rounded-xs transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingScheme}
                                    className="px-6 py-2.5 bg-[#1F3B2C] text-[#F6F1E4] hover:bg-[#2C4A37] text-xs uppercase tracking-[0.15em] font-medium rounded-xs transition disabled:opacity-50"
                                >
                                    {savingScheme ? "Saving..." : editingSchemeId ? "Update Scheme" : "Create Scheme"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================
                REVIEW SCHEME APPLICATION MODAL
            ======================================================== */}
            {reviewModalApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
                    <div className="bg-white border border-[#DED7C9] rounded-sm max-w-lg w-full p-7 shadow-lg">
                        <div className="flex items-center justify-between mb-4 border-b border-[#EEE8DC] pb-3">
                            <h2 className="av-serif text-xl font-medium text-[#2B2620]">
                                Review Application
                            </h2>
                            <button
                                type="button"
                                onClick={handleCloseReviewSchemeModal}
                                className="text-[#8A8072] hover:text-[#2B2620] text-xl font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        {reviewError && (
                            <div className="mb-4 border-l-2 border-[#A8452F] bg-[#A8452F]/[0.06] px-4 py-2">
                                <p className="text-xs text-[#A8452F] font-medium">{reviewError}</p>
                            </div>
                        )}

                        <div className="space-y-2 mb-5 text-xs text-[#5F574D] bg-[#F6F1E4]/60 p-4 rounded-xs border border-[#EEE8DC]">
                            <p>
                                <strong className="text-[#2B2620]">Applicant:</strong> {reviewModalApp.farmer_name} (
                                {reviewModalApp.farmer_phone || reviewModalApp.farmer_email})
                            </p>
                            <p>
                                <strong className="text-[#2B2620]">Scheme:</strong> {reviewModalApp.scheme_name} (
                                {reviewModalApp.scheme_code})
                            </p>
                            {reviewModalApp.tag_number && (
                                <p>
                                    <strong className="text-[#2B2620]">Linked Animal:</strong> {reviewModalApp.animal_name}{" "}
                                    ({reviewModalApp.tag_number}) — {reviewModalApp.species}
                                </p>
                            )}
                            {reviewModalApp.applicant_notes && (
                                <p>
                                    <strong className="text-[#2B2620]">Applicant Notes:</strong>{" "}
                                    {reviewModalApp.applicant_notes}
                                </p>
                            )}
                        </div>

                        <form onSubmit={handleSaveSchemeReview} className="space-y-4">
                            <div>
                                <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-1">
                                    Review Decision *
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 text-sm text-[#2B2620] cursor-pointer">
                                        <input
                                            type="radio"
                                            name="reviewStatus"
                                            value="APPROVED"
                                            checked={reviewStatus === "APPROVED"}
                                            onChange={(e) => setReviewStatus(e.target.value)}
                                            className="accent-[#1F3B2C]"
                                        />
                                        Approve Application
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-[#2B2620] cursor-pointer">
                                        <input
                                            type="radio"
                                            name="reviewStatus"
                                            value="REJECTED"
                                            checked={reviewStatus === "REJECTED"}
                                            onChange={(e) => setReviewStatus(e.target.value)}
                                            className="accent-red-700"
                                        />
                                        Reject Application
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-1">
                                    Admin Remarks / Feedback
                                </label>
                                <textarea
                                    rows="3"
                                    value={reviewRemarks}
                                    onChange={(e) => setReviewRemarks(e.target.value)}
                                    placeholder="Provide feedback or justification..."
                                    className="av-input w-full text-sm text-[#2B2620]"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EEE8DC]">
                                <button
                                    type="button"
                                    onClick={handleCloseReviewSchemeModal}
                                    className="px-5 py-2 border border-[#8A8072] text-[#5F574D] hover:bg-[#F6F1E4] text-xs uppercase tracking-[0.15em] font-medium rounded-xs transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={reviewing}
                                    className={`px-6 py-2 text-xs uppercase tracking-[0.15em] font-medium rounded-xs transition text-white ${
                                        reviewStatus === "APPROVED"
                                            ? "bg-[#1F3B2C] hover:bg-[#2C4A37]"
                                            : "bg-red-700 hover:bg-red-800"
                                    }`}
                                >
                                    {reviewing ? "Saving..." : `Confirm ${reviewStatus}`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================
                APPROVE INSURANCE MODAL (ACTIVE)
            ======================================================== */}
            {approveModalPolicy && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
                    <div className="bg-white border border-[#DED7C9] rounded-sm max-w-lg w-full p-7 shadow-lg">
                        <div className="flex items-center justify-between mb-4 border-b border-[#EEE8DC] pb-3">
                            <div>
                                <h2 className="av-serif text-xl font-medium text-[#2B2620]">
                                    Approve & Activate Policy
                                </h2>
                                <p className="text-xs text-[#8A8072] mt-0.5">
                                    Policy #{approveModalPolicy.policy_id} — {approveModalPolicy.farmer_name}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleCloseApproveModal}
                                className="text-[#8A8072] hover:text-[#2B2620] text-xl font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        {approvalError && (
                            <div className="mb-4 border-l-2 border-[#A8452F] bg-[#A8452F]/[0.06] px-4 py-2">
                                <p className="text-xs text-[#A8452F] font-medium">{approvalError}</p>
                            </div>
                        )}

                        <div className="space-y-1 mb-5 text-xs text-[#5F574D] bg-[#F6F1E4]/60 p-3 rounded-xs border border-[#EEE8DC]">
                            <p>
                                <strong className="text-[#2B2620]">Animal:</strong> {approveModalPolicy.animal_name || "Tag"}{" "}
                                ({approveModalPolicy.tag_number}) • {approveModalPolicy.species} ({approveModalPolicy.breed})
                            </p>
                            <p>
                                <strong className="text-[#2B2620]">Provider:</strong> {approveModalPolicy.insurance_provider} • {approveModalPolicy.policy_name}
                            </p>
                            <p>
                                <strong className="text-[#2B2620]">Coverage:</strong> ₹{Number(approveModalPolicy.coverage_amount).toLocaleString("en-IN")} | <strong className="text-[#2B2620]">Premium:</strong> ₹{Number(approveModalPolicy.premium_amount).toLocaleString("en-IN")}
                            </p>
                            {approveModalPolicy.identification_mark && (
                                <p>
                                    <strong className="text-[#2B2620]">ID Mark:</strong> {approveModalPolicy.identification_mark}
                                </p>
                            )}
                        </div>

                        <form onSubmit={handleConfirmApproval} className="space-y-4">
                            <div>
                                <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-1">
                                    Policy Number *
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={approvalPolicyNumber}
                                        onChange={(e) => setApprovalPolicyNumber(e.target.value)}
                                        placeholder="e.g. NIC-LIV-2026-001"
                                        className="av-input flex-1 text-sm text-[#2B2620] font-mono uppercase"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setApprovalPolicyNumber(`AGV-INS-${String(approveModalPolicy.policy_id).padStart(4, "0")}`)}
                                        className="px-3 py-1 text-xs border border-[#8A8072] text-[#5F574D] hover:bg-[#F6F1E4] rounded-xs"
                                    >
                                        Auto Generate
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-1">
                                        Start Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={approvalStartDate}
                                        onChange={(e) => setApprovalStartDate(e.target.value)}
                                        className="av-input w-full text-sm text-[#2B2620]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-1">
                                        End Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={approvalEndDate}
                                        onChange={(e) => setApprovalEndDate(e.target.value)}
                                        className="av-input w-full text-sm text-[#2B2620]"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-1">
                                    Admin Remarks (Optional)
                                </label>
                                <textarea
                                    rows="2"
                                    value={approvalRemarks}
                                    onChange={(e) => setApprovalRemarks(e.target.value)}
                                    placeholder="e.g. Ear tag & animal identity verified. Policy active."
                                    className="av-input w-full text-sm text-[#2B2620]"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EEE8DC]">
                                <button
                                    type="button"
                                    onClick={handleCloseApproveModal}
                                    className="px-5 py-2 border border-[#8A8072] text-[#5F574D] hover:bg-[#F6F1E4] text-xs uppercase tracking-[0.15em] font-medium rounded-xs transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={approving}
                                    className="px-6 py-2 bg-[#1F3B2C] text-[#F6F1E4] hover:bg-[#2C4A37] text-xs uppercase tracking-[0.15em] font-medium rounded-xs transition disabled:opacity-50"
                                >
                                    {approving ? "Activating..." : "Approve & Activate"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================
                REJECT INSURANCE MODAL
            ======================================================== */}
            {rejectModalPolicy && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
                    <div className="bg-white border border-[#DED7C9] rounded-sm max-w-md w-full p-7 shadow-lg">
                        <div className="flex items-center justify-between mb-4 border-b border-[#EEE8DC] pb-3">
                            <h2 className="av-serif text-xl font-medium text-red-700">
                                Reject Application
                            </h2>
                            <button
                                type="button"
                                onClick={handleCloseRejectModal}
                                className="text-[#8A8072] hover:text-[#2B2620] text-xl font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        {rejectionError && (
                            <div className="mb-4 border-l-2 border-[#A8452F] bg-[#A8452F]/[0.06] px-4 py-2">
                                <p className="text-xs text-[#A8452F] font-medium">{rejectionError}</p>
                            </div>
                        )}

                        <p className="text-xs text-[#5F574D] mb-4">
                            You are rejecting the insurance application for{" "}
                            <strong>{rejectModalPolicy.farmer_name}</strong>&#39;s animal (Tag #
                            {rejectModalPolicy.tag_number}).
                        </p>

                        <form onSubmit={handleConfirmRejection} className="space-y-4">
                            <div>
                                <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-1">
                                    Rejection Reason / Remarks
                                </label>
                                <textarea
                                    rows="3"
                                    value={rejectionRemarks}
                                    onChange={(e) => setRejectionRemarks(e.target.value)}
                                    placeholder="Provide the reason for rejection (e.g. ear tag photo unclear, age limit exceeded, invalid insurance provider)..."
                                    className="av-input w-full text-sm text-[#2B2620]"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EEE8DC]">
                                <button
                                    type="button"
                                    onClick={handleCloseRejectModal}
                                    className="px-5 py-2 border border-[#8A8072] text-[#5F574D] hover:bg-[#F6F1E4] text-xs uppercase tracking-[0.15em] font-medium rounded-xs transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={rejecting}
                                    className="px-6 py-2 bg-red-700 text-white hover:bg-red-800 text-xs uppercase tracking-[0.15em] font-medium rounded-xs transition disabled:opacity-50"
                                >
                                    {rejecting ? "Rejecting..." : "Confirm Rejection"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================
                VIEW POLICY DETAILS MODAL
            ======================================================== */}
            {viewingInsurancePolicy && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
                    <div className="bg-white border border-[#DED7C9] rounded-sm max-w-xl w-full max-h-[90vh] overflow-y-auto p-7 shadow-lg">
                        <div className="flex items-center justify-between mb-4 border-b border-[#EEE8DC] pb-3">
                            <div>
                                <h2 className="av-serif text-xl font-medium text-[#2B2620]">
                                    Insurance Record Details
                                </h2>
                                <p className="text-xs text-[#8A8072] mt-0.5">
                                    {viewingInsurancePolicy.policy_name}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setViewingInsurancePolicy(null)}
                                className="text-[#8A8072] hover:text-[#2B2620] text-xl font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-3 text-xs text-[#5F574D] bg-[#F6F1E4]/60 p-4 rounded-xs border border-[#EEE8DC] mb-5">
                            <div className="flex justify-between items-center pb-2 border-b border-[#DED7C9]">
                                <span className="av-mono text-[10px] uppercase text-[#8A8072]">Status:</span>
                                <span>{renderInsuranceBadge(viewingInsurancePolicy.status)}</span>
                            </div>
                            <div>
                                <strong className="text-[#2B2620] block">Policy Number:</strong>
                                <span className="av-mono font-semibold text-[#1F3B2C]">
                                    {viewingInsurancePolicy.policy_number || "Pending assignment upon approval"}
                                </span>
                            </div>
                            <div>
                                <strong className="text-[#2B2620] block">Farmer / Applicant:</strong>
                                <span className="font-semibold text-[#2B2620]">
                                    {viewingInsurancePolicy.farmer_name}
                                </span>{" "}
                                ({viewingInsurancePolicy.farmer_email} | {viewingInsurancePolicy.farmer_phone || "No phone"})
                            </div>
                            <div>
                                <strong className="text-[#2B2620] block">Insurance Provider:</strong>
                                <span>{viewingInsurancePolicy.insurance_provider}</span>
                            </div>
                            <div>
                                <strong className="text-[#2B2620] block">Insured Animal:</strong>
                                <span>
                                    {viewingInsurancePolicy.animal_name ? `${viewingInsurancePolicy.animal_name} (${viewingInsurancePolicy.tag_number})` : viewingInsurancePolicy.tag_number} — {viewingInsurancePolicy.species} ({viewingInsurancePolicy.breed}, {viewingInsurancePolicy.gender})
                                </span>
                            </div>
                            {viewingInsurancePolicy.identification_mark && (
                                <div>
                                    <strong className="text-[#2B2620] block">Physical Identification Mark:</strong>
                                    <span>{viewingInsurancePolicy.identification_mark}</span>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#DED7C9]">
                                <div>
                                    <strong className="text-[#2B2620] block">Coverage Amount:</strong>
                                    <span className="text-[#1F3B2C] font-semibold text-sm">
                                        ₹{Number(viewingInsurancePolicy.coverage_amount).toLocaleString("en-IN")}
                                    </span>
                                </div>
                                <div>
                                    <strong className="text-[#2B2620] block">Premium Amount:</strong>
                                    <span className="text-[#2B2620] font-semibold text-sm">
                                        ₹{Number(viewingInsurancePolicy.premium_amount).toLocaleString("en-IN")}
                                    </span>
                                </div>
                            </div>
                            {Number(viewingInsurancePolicy.subsidy_amount) > 0 && (
                                <div>
                                    <strong className="text-[#2B2620] block">Subsidy Covered:</strong>
                                    <span className="text-[#D9A441] font-semibold">
                                        ₹{Number(viewingInsurancePolicy.subsidy_amount).toLocaleString("en-IN")}
                                    </span>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#DED7C9]">
                                <div>
                                    <strong className="text-[#2B2620] block">Effective Start Date:</strong>
                                    <span>
                                        {viewingInsurancePolicy.start_date
                                            ? new Date(viewingInsurancePolicy.start_date).toLocaleDateString("en-IN", {
                                                  day: "2-digit",
                                                  month: "short",
                                                  year: "numeric"
                                              })
                                            : "—"}
                                    </span>
                                </div>
                                <div>
                                    <strong className="text-[#2B2620] block">Effective End Date:</strong>
                                    <span>
                                        {viewingInsurancePolicy.end_date
                                            ? new Date(viewingInsurancePolicy.end_date).toLocaleDateString("en-IN", {
                                                  day: "2-digit",
                                                  month: "short",
                                                  year: "numeric"
                                              })
                                            : "—"}
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#DED7C9]">
                                <div>
                                    <strong className="text-[#2B2620] block">Applied At:</strong>
                                    <span>
                                        {viewingInsurancePolicy.applied_at
                                            ? new Date(viewingInsurancePolicy.applied_at).toLocaleString("en-IN")
                                            : "—"}
                                    </span>
                                </div>
                                <div>
                                    <strong className="text-[#2B2620] block">Reviewed At:</strong>
                                    <span>
                                        {viewingInsurancePolicy.reviewed_at
                                            ? new Date(viewingInsurancePolicy.reviewed_at).toLocaleString("en-IN")
                                            : "Awaiting review"}
                                    </span>
                                </div>
                            </div>
                            {viewingInsurancePolicy.admin_remarks && (
                                <div className="pt-2 border-t border-[#DED7C9]">
                                    <strong className="text-[#2B2620] block">Administrator Remarks:</strong>
                                    <span className={viewingInsurancePolicy.status === "REJECTED" ? "text-red-700" : "text-[#1F3B2C]"}>
                                        {viewingInsurancePolicy.admin_remarks}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setViewingInsurancePolicy(null)}
                                className="px-5 py-2 bg-[#1F3B2C] text-[#F6F1E4] hover:bg-[#2C4A37] text-xs uppercase tracking-[0.15em] font-medium rounded-xs transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSchemes;
