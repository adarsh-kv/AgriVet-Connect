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
    const [activeTab, setActiveTab] = useState("schemes"); // "schemes" | "applications"
    const [schemes, setSchemes] = useState([]);
    const [applications, setApplications] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Scheme Form Modal State (Create / Edit)
    const [showSchemeModal, setShowSchemeModal] = useState(false);
    const [editingSchemeId, setEditingSchemeId] = useState(null);
    const [schemeForm, setSchemeForm] = useState(EMPTY_SCHEME);
    const [savingScheme, setSavingScheme] = useState(false);
    const [formError, setFormError] = useState("");

    // Review Application Modal State
    const [reviewModalApp, setReviewModalApp] = useState(null);
    const [reviewStatus, setReviewStatus] = useState("APPROVED");
    const [reviewRemarks, setReviewRemarks] = useState("");
    const [reviewing, setReviewing] = useState(false);
    const [reviewError, setReviewError] = useState("");

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const [schemesRes, appsRes] = await Promise.all([
                    API.get("/schemes"),
                    API.get("/schemes/applications")
                ]);

                if (isMounted) {
                    setSchemes(schemesRes.data);
                    setApplications(appsRes.data);
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

    // Open Add Scheme Modal
    const handleOpenAddModal = () => {
        setEditingSchemeId(null);
        setSchemeForm(EMPTY_SCHEME);
        setFormError("");
        setShowSchemeModal(true);
    };

    // Open Edit Scheme Modal
    const handleOpenEditModal = (scheme) => {
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

    // Toggle status (Activate / Close)
    const handleToggleStatus = async (scheme) => {
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

    // Delete Scheme
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

    // Open Review Modal
    const handleOpenReviewModal = (app) => {
        setReviewModalApp(app);
        setReviewStatus(app.status === "REJECTED" ? "REJECTED" : "APPROVED");
        setReviewRemarks(app.admin_remarks || "");
        setReviewError("");
    };

    const handleCloseReviewModal = () => {
        setReviewModalApp(null);
        setReviewRemarks("");
        setReviewError("");
    };

    const handleSaveReview = async (e) => {
        e.preventDefault();
        if (!reviewModalApp) return;

        setReviewing(true);
        setReviewError("");

        try {
            await API.put(`/schemes/applications/${reviewModalApp.application_id}/status`, {
                status: reviewStatus,
                admin_remarks: reviewRemarks.trim() || null
            });

            setSuccessMessage(`Application for ${reviewModalApp.farmer_name} ${reviewStatus.toLowerCase()} successfully.`);
            handleCloseReviewModal();

            const updatedApps = await API.get("/schemes/applications");
            setApplications(updatedApps.data);
        } catch (err) {
            console.error("REVIEW APPLICATION ERROR:", err);
            setReviewError(err.response?.data?.message || "Failed to update application status");
        } finally {
            setReviewing(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {sharedStyles}

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <p className="av-mono text-xs uppercase tracking-[0.2em] text-[#A8452F] mb-1">
                        Administration
                    </p>
                    <h1 className="av-serif text-3xl font-medium text-[#2B2620]">
                        Government Schemes Management
                    </h1>
                    <p className="text-sm text-[#8A8072] mt-1">
                        Publish schemes, manage subsidy programs, and review farmer applications.
                    </p>
                </div>

                {activeTab === "schemes" && (
                    <button
                        type="button"
                        onClick={handleOpenAddModal}
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

            {/* TABS */}
            <div className="flex border-b border-[#DED7C9] mb-8">
                <button
                    type="button"
                    onClick={() => setActiveTab("schemes")}
                    className={`pb-3 px-4 text-xs uppercase tracking-[0.15em] font-medium transition border-b-2 ${
                        activeTab === "schemes"
                            ? "border-[#1F3B2C] text-[#1F3B2C]"
                            : "border-transparent text-[#8A8072] hover:text-[#2B2620]"
                    }`}
                >
                    All Schemes ({schemes.length})
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("applications")}
                    className={`pb-3 px-4 text-xs uppercase tracking-[0.15em] font-medium transition border-b-2 ${
                        activeTab === "applications"
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
            ) : activeTab === "schemes" ? (
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
                                                        onClick={() => handleToggleStatus(scheme)}
                                                        className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium border border-[#8A8072] text-[#5F574D] hover:bg-[#F6F1E4] rounded-xs transition"
                                                    >
                                                        {scheme.status === "ACTIVE" ? "Close" : "Activate"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEditModal(scheme)}
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
                /* APPLICATIONS TABLE */
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
                                                    onClick={() => handleOpenReviewModal(app)}
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

            {/* SCHEME CREATE / EDIT MODAL */}
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

            {/* REVIEW APPLICATION MODAL */}
            {reviewModalApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
                    <div className="bg-white border border-[#DED7C9] rounded-sm max-w-lg w-full p-7 shadow-lg">
                        <div className="flex items-center justify-between mb-4 border-b border-[#EEE8DC] pb-3">
                            <h2 className="av-serif text-xl font-medium text-[#2B2620]">
                                Review Application
                            </h2>
                            <button
                                type="button"
                                onClick={handleCloseReviewModal}
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

                        <form onSubmit={handleSaveReview} className="space-y-4">
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
                                    placeholder="Provide feedback or justification (e.g. Approved under category A, or Rejected due to incomplete land verification)..."
                                    className="av-input w-full text-sm text-[#2B2620]"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EEE8DC]">
                                <button
                                    type="button"
                                    onClick={handleCloseReviewModal}
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
        </div>
    );
};

export default AdminSchemes;
