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
            padding: 12px 16px;
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

const Schemes = () => {
    const [activeTab, setActiveTab] = useState("explore"); // "explore" | "my-applications"
    const [schemes, setSchemes] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [livestockList, setLivestockList] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Modal state for viewing details and applying
    const [selectedScheme, setSelectedScheme] = useState(null);
    const [applyLivestockId, setApplyLivestockId] = useState("");
    const [applyNotes, setApplyNotes] = useState("");
    const [applying, setApplying] = useState(false);
    const [applyError, setApplyError] = useState("");

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const [schemesRes, appsRes, livestockRes] = await Promise.all([
                    API.get("/schemes"),
                    API.get("/schemes/my-applications"),
                    API.get("/livestock")
                ]);

                if (isMounted) {
                    setSchemes(schemesRes.data);
                    setMyApplications(appsRes.data);
                    setLivestockList(livestockRes.data);
                    setError("");
                }
            } catch (err) {
                if (isMounted) {
                    console.error("LOAD SCHEMES ERROR:", err);
                    setError(err.response?.data?.message || "Failed to load government schemes");
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

    const handleOpenApplyModal = (scheme) => {
        setSelectedScheme(scheme);
        setApplyLivestockId("");
        setApplyNotes("");
        setApplyError("");
    };

    const handleCloseModal = () => {
        setSelectedScheme(null);
        setApplyLivestockId("");
        setApplyNotes("");
        setApplyError("");
    };

    const handleSubmitApplication = async (e) => {
        e.preventDefault();
        if (!selectedScheme) return;

        setApplying(true);
        setApplyError("");

        try {
            const payload = {
                livestock_id: applyLivestockId ? Number(applyLivestockId) : null,
                applicant_notes: applyNotes.trim() || null
            };

            await API.post(`/schemes/${selectedScheme.scheme_id}/apply`, payload);

            setSuccessMessage(`Application for "${selectedScheme.scheme_name}" submitted successfully!`);
            handleCloseModal();

            // Refresh applications
            const updatedApps = await API.get("/schemes/my-applications");
            setMyApplications(updatedApps.data);
            setActiveTab("my-applications");
        } catch (err) {
            console.error("APPLY SCHEME ERROR:", err);
            setApplyError(err.response?.data?.message || "Failed to submit application");
        } finally {
            setApplying(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {sharedStyles}

            {/* HEADER */}
            <div className="mb-8">
                <p className="av-mono text-xs uppercase tracking-[0.2em] text-[#A8452F] mb-1">
                    Government Initiatives & Subsidies
                </p>
                <h1 className="av-serif text-3xl font-medium text-[#2B2620]">
                    Schemes & Subsidies
                </h1>
                <p className="text-sm text-[#8A8072] mt-1">
                    Explore active animal husbandry schemes, financial subsidies, and track your application status.
                </p>
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
                    onClick={() => setActiveTab("explore")}
                    className={`pb-3 px-4 text-xs uppercase tracking-[0.15em] font-medium transition border-b-2 ${
                        activeTab === "explore"
                            ? "border-[#1F3B2C] text-[#1F3B2C]"
                            : "border-transparent text-[#8A8072] hover:text-[#2B2620]"
                    }`}
                >
                    Available Schemes ({schemes.length})
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("my-applications")}
                    className={`pb-3 px-4 text-xs uppercase tracking-[0.15em] font-medium transition border-b-2 ${
                        activeTab === "my-applications"
                            ? "border-[#1F3B2C] text-[#1F3B2C]"
                            : "border-transparent text-[#8A8072] hover:text-[#2B2620]"
                    }`}
                >
                    My Applications ({myApplications.length})
                </button>
            </div>

            {loading ? (
                <div className="p-16 text-center text-sm text-[#8A8072] flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-[#1F3B2C] border-t-transparent rounded-full av-spin" />
                    Loading schemes...
                </div>
            ) : activeTab === "explore" ? (
                /* EXPLORE SCHEMES GRID */
                <div>
                    {schemes.length === 0 ? (
                        <div className="bg-white border border-[#DED7C9] rounded-sm p-12 text-center">
                            <p className="text-base font-medium text-[#2B2620] mb-1">
                                No active schemes available
                            </p>
                            <p className="text-sm text-[#8A8072]">
                                There are currently no government schemes accepting applications. Please check back later.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {schemes.map((scheme) => {
                                const hasApplied = myApplications.some(
                                    (app) => app.scheme_id === scheme.scheme_id && app.status === "PENDING"
                                );

                                return (
                                    <div
                                        key={scheme.scheme_id}
                                        className="bg-white border border-[#DED7C9] rounded-sm p-6 flex flex-col justify-between hover:border-[#8A8072] transition shadow-xs"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-2 mb-3">
                                                <span className="av-mono text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#EEE8DC] text-[#5F574D] rounded-xs font-medium">
                                                    {scheme.scheme_code}
                                                </span>
                                                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#1F3B2C]/10 text-[#1F3B2C] rounded-full font-medium">
                                                    {scheme.category}
                                                </span>
                                            </div>

                                            <h3 className="av-serif text-lg font-medium text-[#2B2620] mb-2">
                                                {scheme.scheme_name}
                                            </h3>

                                            <p className="text-xs text-[#8A8072] mb-4">
                                                Dept: {scheme.department}
                                            </p>

                                            <p className="text-xs text-[#5F574D] line-clamp-3 mb-4">
                                                {scheme.description}
                                            </p>

                                            <div className="space-y-2 border-t border-[#EEE8DC] pt-3 mb-5 text-xs">
                                                <div>
                                                    <span className="text-[#8A8072] uppercase text-[10px] tracking-wider block">
                                                        Benefits:
                                                    </span>
                                                    <p className="text-[#1F3B2C] font-medium line-clamp-2">
                                                        {scheme.benefits}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-[#8A8072] uppercase text-[10px] tracking-wider block">
                                                        Eligibility:
                                                    </span>
                                                    <p className="text-[#5F574D] line-clamp-2">
                                                        {scheme.eligibility}
                                                    </p>
                                                </div>
                                                {scheme.application_deadline && (
                                                    <div>
                                                        <span className="text-[#8A8072] uppercase text-[10px] tracking-wider block">
                                                            Deadline:
                                                        </span>
                                                        <p className="text-[#A8452F] font-medium">
                                                            {new Date(scheme.application_deadline).toLocaleDateString("en-IN", {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric"
                                                            })}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleOpenApplyModal(scheme)}
                                            className="w-full py-2.5 px-4 bg-[#1F3B2C] text-[#F6F1E4] hover:bg-[#2C4A37] text-xs uppercase tracking-[0.15em] font-medium rounded-xs transition flex items-center justify-center gap-2"
                                        >
                                            <DocumentIcon />
                                            {hasApplied ? "Apply Again / View" : "Apply for Scheme"}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ) : (
                /* MY APPLICATIONS TAB */
                <div className="bg-white border border-[#DED7C9] rounded-sm overflow-hidden shadow-xs">
                    <div className="p-6 border-b border-[#EEE8DC]">
                        <h2 className="av-serif text-xl font-medium text-[#2B2620]">
                            Application History
                        </h2>
                        <p className="text-xs text-[#8A8072] mt-0.5">
                            Track the review status and administrator remarks for your submitted scheme applications.
                        </p>
                    </div>

                    {myApplications.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-base text-[#2B2620] font-medium mb-1">
                                No applications submitted yet
                            </p>
                            <p className="text-sm text-[#8A8072] mb-5">
                                Browse available schemes and submit an application to access government benefits.
                            </p>
                            <button
                                type="button"
                                onClick={() => setActiveTab("explore")}
                                className="px-5 py-2.5 bg-[#1F3B2C] text-[#F6F1E4] hover:bg-[#2C4A37] text-xs uppercase tracking-[0.15em] font-medium rounded-xs transition"
                            >
                                Explore Schemes
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-[#EEE8DC] bg-[#F6F1E4]/50">
                                        <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072]">
                                            Scheme
                                        </th>
                                        <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072]">
                                            Linked Animal
                                        </th>
                                        <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072]">
                                            Applied Date
                                        </th>
                                        <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072]">
                                            Status
                                        </th>
                                        <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072]">
                                            Applicant Notes
                                        </th>
                                        <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072]">
                                            Admin Remarks
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#EEE8DC]">
                                    {myApplications.map((app) => {
                                        const isPending = app.status === "PENDING";
                                        const isApproved = app.status === "APPROVED";
                                        const isRejected = app.status === "REJECTED";

                                        return (
                                            <tr key={app.application_id} className="hover:bg-[#F6F1E4]/30 transition-colors">
                                                <td className="py-4 px-5">
                                                    <p className="text-sm font-medium text-[#2B2620]">
                                                        {app.scheme_name}
                                                    </p>
                                                    <span className="av-mono text-[10px] text-[#8A8072]">
                                                        {app.scheme_code} • {app.department}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-5 text-xs text-[#5F574D]">
                                                    {app.tag_number ? (
                                                        <span>
                                                            {app.animal_name ? `${app.animal_name} (${app.tag_number})` : app.tag_number} — {app.species}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[#8A8072] italic">
                                                            General Farm Application
                                                        </span>
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
                                                            isPending
                                                                ? "bg-amber-100 text-amber-800"
                                                                : isApproved
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-red-100 text-red-800"
                                                        }`}
                                                    >
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-5 text-xs text-[#5F574D] max-w-xs truncate">
                                                    {app.applicant_notes || "—"}
                                                </td>
                                                <td className="py-4 px-5 text-xs max-w-xs">
                                                    {app.admin_remarks ? (
                                                        <span className={isRejected ? "text-red-700 font-medium" : "text-[#1F3B2C]"}>
                                                            {app.admin_remarks}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[#8A8072] italic">Awaiting review</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* APPLY MODAL */}
            {selectedScheme && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
                    <div className="bg-white border border-[#DED7C9] rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto p-7 shadow-lg">
                        <div className="flex items-start justify-between gap-4 mb-5 border-b border-[#EEE8DC] pb-4">
                            <div>
                                <span className="av-mono text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#EEE8DC] text-[#5F574D] rounded-xs font-medium">
                                    {selectedScheme.scheme_code}
                                </span>
                                <h2 className="av-serif text-2xl font-medium text-[#2B2620] mt-1">
                                    {selectedScheme.scheme_name}
                                </h2>
                                <p className="text-xs text-[#8A8072] mt-0.5">
                                    {selectedScheme.department} • {selectedScheme.category}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="text-[#8A8072] hover:text-[#2B2620] text-xl font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        {/* SCHEME FULL DETAILS */}
                        <div className="bg-[#F6F1E4]/50 border border-[#DED7C9] rounded-xs p-4 mb-6 text-xs space-y-3">
                            <div>
                                <span className="av-mono uppercase text-[10px] tracking-wider text-[#8A8072] block">
                                    Description:
                                </span>
                                <p className="text-[#2B2620] mt-0.5">{selectedScheme.description}</p>
                            </div>
                            <div>
                                <span className="av-mono uppercase text-[10px] tracking-wider text-[#8A8072] block">
                                    Benefits:
                                </span>
                                <p className="text-[#1F3B2C] font-medium mt-0.5">{selectedScheme.benefits}</p>
                            </div>
                            <div>
                                <span className="av-mono uppercase text-[10px] tracking-wider text-[#8A8072] block">
                                    Eligibility:
                                </span>
                                <p className="text-[#5F574D] mt-0.5">{selectedScheme.eligibility}</p>
                            </div>
                        </div>

                        {applyError && (
                            <div className="mb-5 border-l-2 border-[#A8452F] bg-[#A8452F]/[0.06] px-4 py-3">
                                <p className="text-xs text-[#A8452F] font-medium">{applyError}</p>
                            </div>
                        )}

                        {/* APPLICATION FORM */}
                        <form onSubmit={handleSubmitApplication} className="space-y-5">
                            <div>
                                <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-2">
                                    Select Livestock (Optional)
                                </label>
                                <select
                                    value={applyLivestockId}
                                    onChange={(e) => setApplyLivestockId(e.target.value)}
                                    className="av-input w-full text-sm text-[#2B2620] bg-white"
                                >
                                    <option value="">None (General Farm / Farmer Application)</option>
                                    {livestockList.map((animal) => {
                                        const name = animal.animal_name
                                            ? `${animal.animal_name} (${animal.tag_number})`
                                            : animal.tag_number;
                                        return (
                                            <option key={animal.livestock_id} value={animal.livestock_id}>
                                                {name} — {animal.species}
                                            </option>
                                        );
                                    })}
                                </select>
                                <p className="text-[11px] text-[#8A8072] mt-1">
                                    If this scheme is for an individual animal (e.g. calf rearing, breeding), select the animal above.
                                </p>
                            </div>

                            <div>
                                <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-2">
                                    Application Notes / Statement of Purpose
                                </label>
                                <textarea
                                    rows="3"
                                    value={applyNotes}
                                    onChange={(e) => setApplyNotes(e.target.value)}
                                    placeholder="Explain your farm scale, requirement, or why you are applying for this scheme..."
                                    className="av-input w-full text-sm text-[#2B2620] placeholder:text-[#B4AA9B]"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EEE8DC]">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-5 py-2.5 border border-[#8A8072] text-[#5F574D] hover:bg-[#F6F1E4] text-xs uppercase tracking-[0.15em] font-medium rounded-xs transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={applying}
                                    className="px-6 py-2.5 bg-[#1F3B2C] text-[#F6F1E4] hover:bg-[#2C4A37] text-xs uppercase tracking-[0.15em] font-medium rounded-xs transition disabled:opacity-50"
                                >
                                    {applying ? "Submitting..." : "Submit Application"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Schemes;
