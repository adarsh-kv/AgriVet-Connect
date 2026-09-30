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

const Schemes = () => {
    // Top-Level Module Tab: "schemes" | "insurance"
    const [mainModule, setMainModule] = useState("schemes");

    // Schemes Sub-tab: "explore" | "my-applications"
    const [schemeTab, setSchemeTab] = useState("explore");

    // Insurance Sub-tab: "my-policies" | "apply"
    const [insuranceTab, setInsuranceTab] = useState("my-policies");

    // Data States
    const [schemes, setSchemes] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [livestockList, setLivestockList] = useState([]);
    const [insurancePolicies, setInsurancePolicies] = useState([]);

    // UI Loading & Message States
    const [loading, setLoading] = useState(true);
    const [insuranceLoading, setInsuranceLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Scheme Modal State (view details & apply)
    const [selectedScheme, setSelectedScheme] = useState(null);
    const [applyLivestockId, setApplyLivestockId] = useState("");
    const [applyNotes, setApplyNotes] = useState("");
    const [applyingScheme, setApplyingScheme] = useState(false);
    const [schemeModalError, setSchemeModalError] = useState("");

    // Insurance Form State
    const [insForm, setInsForm] = useState({
        livestock_id: "",
        insurance_provider: "",
        policy_name: "",
        coverage_amount: "",
        premium_amount: "",
        subsidy_amount: "",
        start_date: "",
        end_date: "",
        identification_mark: ""
    });
    const [submittingInsurance, setSubmittingInsurance] = useState(false);
    const [insFormError, setInsFormError] = useState("");

    // Insurance Policy Details Modal State
    const [selectedPolicy, setSelectedPolicy] = useState(null);

    // Initial Data Fetch
    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const [schemesRes, appsRes, livestockRes, insuranceRes] = await Promise.all([
                    API.get("/schemes"),
                    API.get("/schemes/my-applications"),
                    API.get("/livestock"),
                    API.get("/insurance/my-policies")
                ]);

                if (isMounted) {
                    setSchemes(schemesRes.data);
                    setMyApplications(appsRes.data);
                    setLivestockList(livestockRes.data);
                    setInsurancePolicies(insuranceRes.data);
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

    // Fetch Farmer Insurance Policies
    const fetchInsurancePolicies = async () => {
        setInsuranceLoading(true);
        try {
            const res = await API.get("/insurance/my-policies");
            setInsurancePolicies(res.data);
        } catch (err) {
            console.error("LOAD INSURANCE POLICIES ERROR:", err);
            setError(err.response?.data?.message || "Failed to load insurance policies");
        } finally {
            setInsuranceLoading(false);
        }
    };

    // ========================================================
    // SCHEME HANDLERS
    // ========================================================
    const handleOpenSchemeModal = (scheme) => {
        setSelectedScheme(scheme);
        setApplyLivestockId("");
        setApplyNotes("");
        setSchemeModalError("");
    };

    const handleCloseSchemeModal = () => {
        setSelectedScheme(null);
        setApplyLivestockId("");
        setApplyNotes("");
        setSchemeModalError("");
    };

    const handleSubmitSchemeApplication = async (e) => {
        e.preventDefault();
        if (!selectedScheme) return;

        setApplyingScheme(true);
        setSchemeModalError("");

        try {
            const payload = {
                livestock_id: applyLivestockId ? Number(applyLivestockId) : null,
                applicant_notes: applyNotes.trim() || null
            };

            await API.post(`/schemes/${selectedScheme.scheme_id}/apply`, payload);

            setSuccessMessage(`Application for "${selectedScheme.scheme_name}" submitted successfully!`);
            handleCloseSchemeModal();

            // Refresh applications
            const updatedApps = await API.get("/schemes/my-applications");
            setMyApplications(updatedApps.data);
            setSchemeTab("my-applications");
        } catch (err) {
            console.error("APPLY SCHEME ERROR:", err);
            setSchemeModalError(err.response?.data?.message || "Failed to submit application");
        } finally {
            setApplyingScheme(false);
        }
    };

    // ========================================================
    // INSURANCE HANDLERS
    // ========================================================
    const handleInsFormChange = (e) => {
        const { name, value } = e.target;
        setInsForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleResetInsForm = () => {
        setInsForm({
            livestock_id: "",
            insurance_provider: "",
            policy_name: "",
            coverage_amount: "",
            premium_amount: "",
            subsidy_amount: "",
            start_date: "",
            end_date: "",
            identification_mark: ""
        });
        setInsFormError("");
    };

    const handleSubmitInsurance = async (e) => {
        e.preventDefault();
        setInsFormError("");

        // Frontend Validations
        if (!insForm.livestock_id) {
            setInsFormError("Please select an animal from your registered livestock.");
            return;
        }
        if (!insForm.insurance_provider.trim()) {
            setInsFormError("Insurance Provider name is required.");
            return;
        }
        if (!insForm.policy_name.trim()) {
            setInsFormError("Policy Name is required.");
            return;
        }

        const coverage = parseFloat(insForm.coverage_amount);
        if (isNaN(coverage) || coverage <= 0) {
            setInsFormError("Coverage amount must be a positive number greater than zero.");
            return;
        }

        const premium = parseFloat(insForm.premium_amount);
        if (isNaN(premium) || premium <= 0) {
            setInsFormError("Premium amount must be a positive number greater than zero.");
            return;
        }

        let subsidy = 0;
        if (insForm.subsidy_amount !== "") {
            subsidy = parseFloat(insForm.subsidy_amount);
            if (isNaN(subsidy) || subsidy < 0) {
                setInsFormError("Subsidy amount cannot be negative.");
                return;
            }
        }

        if (insForm.start_date && insForm.end_date) {
            if (new Date(insForm.end_date) < new Date(insForm.start_date)) {
                setInsFormError("Policy End Date cannot be earlier than Policy Start Date.");
                return;
            }
        }

        setSubmittingInsurance(true);

        try {
            const payload = {
                livestock_id: Number(insForm.livestock_id),
                insurance_provider: insForm.insurance_provider.trim(),
                policy_name: insForm.policy_name.trim(),
                coverage_amount: coverage,
                premium_amount: premium,
                subsidy_amount: subsidy,
                start_date: insForm.start_date || null,
                end_date: insForm.end_date || null,
                identification_mark: insForm.identification_mark.trim() || null
            };

            const response = await API.post("/insurance/apply", payload);

            setSuccessMessage(
                response.data?.message || "Livestock insurance application submitted successfully!"
            );
            handleResetInsForm();

            // Refresh list and switch to My Policies tab
            await fetchInsurancePolicies();
            setInsuranceTab("my-policies");
        } catch (err) {
            console.error("APPLY INSURANCE ERROR:", err);
            setInsFormError(
                err.response?.data?.message || "Failed to submit insurance application. Please try again."
            );
        } finally {
            setSubmittingInsurance(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {sharedStyles}

            {/* HEADER */}
            <div className="mb-6">
                <p className="av-mono text-xs uppercase tracking-[0.2em] text-[#A8452F] mb-1">
                    Financial Protection & Subsidies
                </p>
                <h1 className="av-serif text-3xl font-medium text-[#2B2620]">
                    Schemes & Insurance
                </h1>
                <p className="text-sm text-[#8A8072] mt-1">
                    Access government welfare schemes, livestock insurance coverage, and track application reviews.
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
                MODULE 1: GOVERNMENT SCHEMES
            ======================================================== */}
            {mainModule === "schemes" && (
                <div>
                    {/* SUB-TABS */}
                    <div className="flex border-b border-[#EEE8DC] mb-6">
                        <button
                            type="button"
                            onClick={() => setSchemeTab("explore")}
                            className={`pb-2.5 px-4 text-xs uppercase tracking-[0.15em] font-medium transition border-b-2 ${
                                schemeTab === "explore"
                                    ? "border-[#1F3B2C] text-[#1F3B2C]"
                                    : "border-transparent text-[#8A8072] hover:text-[#2B2620]"
                            }`}
                        >
                            Available Schemes ({schemes.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setSchemeTab("my-applications")}
                            className={`pb-2.5 px-4 text-xs uppercase tracking-[0.15em] font-medium transition border-b-2 ${
                                schemeTab === "my-applications"
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
                            Loading government schemes...
                        </div>
                    ) : schemeTab === "explore" ? (
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
                                                    onClick={() => handleOpenSchemeModal(scheme)}
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
                                        onClick={() => setSchemeTab("explore")}
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
                                                                <span className={app.status === "REJECTED" ? "text-red-700 font-medium" : "text-[#1F3B2C]"}>
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
                </div>
            )}

            {/* ========================================================
                MODULE 2: LIVESTOCK INSURANCE
            ======================================================== */}
            {mainModule === "insurance" && (
                <div>
                    {/* SUB-TABS */}
                    <div className="flex border-b border-[#EEE8DC] mb-6 justify-between items-center">
                        <div className="flex">
                            <button
                                type="button"
                                onClick={() => {
                                    setInsuranceTab("my-policies");
                                    setInsFormError("");
                                }}
                                className={`pb-2.5 px-4 text-xs uppercase tracking-[0.15em] font-medium transition border-b-2 ${
                                    insuranceTab === "my-policies"
                                        ? "border-[#1F3B2C] text-[#1F3B2C]"
                                        : "border-transparent text-[#8A8072] hover:text-[#2B2620]"
                                }`}
                            >
                                My Insurance Policies ({insurancePolicies.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setInsuranceTab("apply");
                                    setInsFormError("");
                                }}
                                className={`pb-2.5 px-4 text-xs uppercase tracking-[0.15em] font-medium transition border-b-2 ${
                                    insuranceTab === "apply"
                                        ? "border-[#1F3B2C] text-[#1F3B2C]"
                                        : "border-transparent text-[#8A8072] hover:text-[#2B2620]"
                                }`}
                            >
                                + Apply for Insurance
                            </button>
                        </div>

                        {insuranceTab === "my-policies" && (
                            <button
                                type="button"
                                onClick={() => setInsuranceTab("apply")}
                                className="mb-2 px-4 py-2 bg-[#1F3B2C] text-[#F6F1E4] hover:bg-[#2C4A37] text-xs uppercase tracking-[0.15em] font-medium rounded-xs transition"
                            >
                                + New Insurance Application
                            </button>
                        )}
                    </div>

                    {insuranceLoading ? (
                        <div className="p-16 text-center text-sm text-[#8A8072] flex items-center justify-center gap-3">
                            <div className="w-5 h-5 border-2 border-[#1F3B2C] border-t-transparent rounded-full av-spin" />
                            Loading insurance policies...
                        </div>
                    ) : insuranceTab === "my-policies" ? (
                        /* MY INSURANCE POLICIES VIEW */
                        <div className="bg-white border border-[#DED7C9] rounded-sm overflow-hidden shadow-xs">
                            <div className="p-6 border-b border-[#EEE8DC]">
                                <h2 className="av-serif text-xl font-medium text-[#2B2620]">
                                    My Insured Livestock & Policies
                                </h2>
                                <p className="text-xs text-[#8A8072] mt-0.5">
                                    Monitor policy active status, policy numbers, coverage values, and administrator reviews.
                                </p>
                            </div>

                            {insurancePolicies.length === 0 ? (
                                <div className="p-12 text-center">
                                    <p className="text-base text-[#2B2620] font-medium mb-1">
                                        No insurance policies applied yet
                                    </p>
                                    <p className="text-sm text-[#8A8072] mb-5">
                                        Protect your livestock against unforeseen loss, accidents, or diseases with insurance coverage.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setInsuranceTab("apply")}
                                        className="px-5 py-2.5 bg-[#1F3B2C] text-[#F6F1E4] hover:bg-[#2C4A37] text-xs uppercase tracking-[0.15em] font-medium rounded-xs transition"
                                    >
                                        Apply for Insurance
                                    </button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-[#EEE8DC] bg-[#F6F1E4]/50">
                                                <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072]">
                                                    Policy / Provider
                                                </th>
                                                <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072]">
                                                    Livestock
                                                </th>
                                                <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072]">
                                                    Coverage & Premium
                                                </th>
                                                <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072]">
                                                    Policy Period
                                                </th>
                                                <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072]">
                                                    Status
                                                </th>
                                                <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072]">
                                                    Remarks / Notes
                                                </th>
                                                <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] text-right">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#EEE8DC]">
                                            {insurancePolicies.map((policy) => (
                                                <tr key={policy.policy_id} className="hover:bg-[#F6F1E4]/30 transition-colors">
                                                    <td className="py-4 px-5">
                                                        {policy.policy_number ? (
                                                            <p className="av-mono text-xs font-semibold text-[#1F3B2C] bg-[#1F3B2C]/10 px-2 py-0.5 rounded-xs inline-block mb-1">
                                                                {policy.policy_number}
                                                            </p>
                                                        ) : (
                                                            <span className="av-mono text-[10px] text-[#8A8072] bg-gray-100 px-2 py-0.5 rounded-xs inline-block mb-1">
                                                                Pending Number
                                                            </span>
                                                        )}
                                                        <p className="text-sm font-medium text-[#2B2620]">
                                                            {policy.policy_name}
                                                        </p>
                                                        <p className="text-xs text-[#8A8072]">
                                                            {policy.insurance_provider}
                                                        </p>
                                                    </td>
                                                    <td className="py-4 px-5 text-xs text-[#5F574D]">
                                                        <p className="font-semibold text-[#2B2620]">
                                                            {policy.animal_name ? `${policy.animal_name} (${policy.tag_number})` : policy.tag_number}
                                                        </p>
                                                        <p className="text-[#8A8072]">
                                                            {policy.species} • {policy.breed}
                                                        </p>
                                                    </td>
                                                    <td className="py-4 px-5 text-xs text-[#5F574D]">
                                                        <p className="font-semibold text-[#1F3B2C]">
                                                            Cover: ₹{Number(policy.coverage_amount).toLocaleString("en-IN")}
                                                        </p>
                                                        <p className="text-[#8A8072]">
                                                            Prem: ₹{Number(policy.premium_amount).toLocaleString("en-IN")}
                                                            {Number(policy.subsidy_amount) > 0 && (
                                                                <span className="text-[#D9A441] ml-1">
                                                                    (Sub: ₹{Number(policy.subsidy_amount).toLocaleString("en-IN")})
                                                                </span>
                                                            )}
                                                        </p>
                                                    </td>
                                                    <td className="py-4 px-5 text-xs text-[#5F574D]">
                                                        {policy.start_date ? (
                                                            <span>
                                                                {new Date(policy.start_date).toLocaleDateString("en-IN", {
                                                                    day: "2-digit",
                                                                    month: "short",
                                                                    year: "numeric"
                                                                })}
                                                                {policy.end_date && (
                                                                    <>
                                                                        <br />
                                                                        to{" "}
                                                                        {new Date(policy.end_date).toLocaleDateString("en-IN", {
                                                                            day: "2-digit",
                                                                            month: "short",
                                                                            year: "numeric"
                                                                        })}
                                                                    </>
                                                                )}
                                                            </span>
                                                        ) : (
                                                            <span className="text-[#8A8072] italic">Pending assignment</span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-5">
                                                        {renderInsuranceBadge(policy.status)}
                                                    </td>
                                                    <td className="py-4 px-5 text-xs text-[#5F574D] max-w-xs">
                                                        {policy.admin_remarks ? (
                                                            <span className={policy.status === "REJECTED" ? "text-red-700 font-medium" : "text-[#1F3B2C]"}>
                                                                {policy.admin_remarks}
                                                            </span>
                                                        ) : (
                                                            <span className="text-[#8A8072] italic">
                                                                {policy.status === "PENDING"
                                                                    ? "Awaiting admin verification"
                                                                    : "No remarks"}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-5 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedPolicy(policy)}
                                                            className="px-3 py-1.5 text-xs uppercase tracking-wider font-medium border border-[#1F3B2C] text-[#1F3B2C] hover:bg-[#1F3B2C] hover:text-white rounded-xs transition"
                                                        >
                                                            Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* APPLY FOR INSURANCE FORM */
                        <div className="bg-white border border-[#DED7C9] rounded-sm p-8 shadow-xs max-w-3xl">
                            <div className="border-b border-[#EEE8DC] pb-4 mb-6">
                                <h2 className="av-serif text-2xl font-medium text-[#2B2620]">
                                    Apply for Livestock Insurance
                                </h2>
                                <p className="text-xs text-[#8A8072] mt-1">
                                    Submit insurance details for your tagged livestock. Once verified by the administrator, your policy will become active.
                                </p>
                            </div>

                            {insFormError && (
                                <div className="mb-6 border-l-2 border-[#A8452F] bg-[#A8452F]/[0.06] px-5 py-3">
                                    <p className="text-xs text-[#A8452F] font-medium">{insFormError}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmitInsurance} className="space-y-5">
                                {/* LIVESTOCK SELECTION */}
                                <div>
                                    <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-1">
                                        Select Owned Animal *
                                    </label>
                                    <select
                                        name="livestock_id"
                                        value={insForm.livestock_id}
                                        onChange={handleInsFormChange}
                                        className="av-input w-full text-sm text-[#2B2620] bg-white"
                                        required
                                    >
                                        <option value="">-- Choose your animal to insure --</option>
                                        {livestockList.map((animal) => (
                                            <option key={animal.livestock_id} value={animal.livestock_id}>
                                                {animal.animal_name ? `${animal.animal_name} (${animal.tag_number})` : animal.tag_number} — {animal.species} ({animal.breed})
                                            </option>
                                        ))}
                                    </select>
                                    {livestockList.length === 0 && (
                                        <p className="text-xs text-[#A8452F] mt-1">
                                            No livestock found under your account. Please add your animals in the Livestock tab first.
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* INSURANCE PROVIDER */}
                                    <div>
                                        <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-1">
                                            Insurance Provider *
                                        </label>
                                        <input
                                            type="text"
                                            name="insurance_provider"
                                            value={insForm.insurance_provider}
                                            onChange={handleInsFormChange}
                                            placeholder="e.g. National Insurance Company"
                                            className="av-input w-full text-sm text-[#2B2620]"
                                            list="provider-suggestions"
                                            required
                                        />
                                        <datalist id="provider-suggestions">
                                            <option value="National Insurance Company" />
                                            <option value="United India Insurance" />
                                            <option value="New India Assurance" />
                                            <option value="Oriental Insurance Company" />
                                            <option value="ICICI Lombard" />
                                            <option value="HDFC ERGO General Insurance" />
                                        </datalist>
                                    </div>

                                    {/* POLICY NAME */}
                                    <div>
                                        <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-1">
                                            Policy Name / Scheme *
                                        </label>
                                        <input
                                            type="text"
                                            name="policy_name"
                                            value={insForm.policy_name}
                                            onChange={handleInsFormChange}
                                            placeholder="e.g. Cattle & Dairy Livestock Protection"
                                            className="av-input w-full text-sm text-[#2B2620]"
                                            required
                                        />
                                    </div>

                                    {/* COVERAGE AMOUNT */}
                                    <div>
                                        <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-1">
                                            Coverage Amount (₹) *
                                        </label>
                                        <input
                                            type="number"
                                            name="coverage_amount"
                                            value={insForm.coverage_amount}
                                            onChange={handleInsFormChange}
                                            placeholder="e.g. 60000"
                                            min="1"
                                            step="0.01"
                                            className="av-input w-full text-sm text-[#2B2620]"
                                            required
                                        />
                                    </div>

                                    {/* PREMIUM AMOUNT */}
                                    <div>
                                        <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-1">
                                            Premium Amount (₹) *
                                        </label>
                                        <input
                                            type="number"
                                            name="premium_amount"
                                            value={insForm.premium_amount}
                                            onChange={handleInsFormChange}
                                            placeholder="e.g. 2400"
                                            min="0.01"
                                            step="0.01"
                                            className="av-input w-full text-sm text-[#2B2620]"
                                            required
                                        />
                                    </div>

                                    {/* SUBSIDY AMOUNT */}
                                    <div>
                                        <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-1">
                                            Subsidy Amount (₹) (Optional)
                                        </label>
                                        <input
                                            type="number"
                                            name="subsidy_amount"
                                            value={insForm.subsidy_amount}
                                            onChange={handleInsFormChange}
                                            placeholder="e.g. 1200"
                                            min="0"
                                            step="0.01"
                                            className="av-input w-full text-sm text-[#2B2620]"
                                        />
                                        <p className="text-[11px] text-[#8A8072] mt-0.5">
                                            If co-subsidized by state or central scheme.
                                        </p>
                                    </div>

                                    {/* PHYSICAL IDENTIFICATION MARK */}
                                    <div>
                                        <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-1">
                                            Physical Identification Mark
                                        </label>
                                        <input
                                            type="text"
                                            name="identification_mark"
                                            value={insForm.identification_mark}
                                            onChange={handleInsFormChange}
                                            placeholder="e.g. Yellow RFID tag #104, white star on forehead"
                                            className="av-input w-full text-sm text-[#2B2620]"
                                        />
                                    </div>

                                    {/* START DATE */}
                                    <div>
                                        <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-1">
                                            Requested Start Date (Optional)
                                        </label>
                                        <input
                                            type="date"
                                            name="start_date"
                                            value={insForm.start_date}
                                            onChange={handleInsFormChange}
                                            className="av-input w-full text-sm text-[#2B2620]"
                                        />
                                    </div>

                                    {/* END DATE */}
                                    <div>
                                        <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-1">
                                            Requested End Date (Optional)
                                        </label>
                                        <input
                                            type="date"
                                            name="end_date"
                                            value={insForm.end_date}
                                            onChange={handleInsFormChange}
                                            className="av-input w-full text-sm text-[#2B2620]"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EEE8DC]">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            handleResetInsForm();
                                            setInsuranceTab("my-policies");
                                        }}
                                        className="px-5 py-2.5 border border-[#8A8072] text-[#5F574D] hover:bg-[#F6F1E4] text-xs uppercase tracking-[0.15em] font-medium rounded-xs transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submittingInsurance}
                                        className="px-6 py-2.5 bg-[#1F3B2C] text-[#F6F1E4] hover:bg-[#2C4A37] text-xs uppercase tracking-[0.15em] font-medium rounded-xs transition disabled:opacity-50"
                                    >
                                        {submittingInsurance ? "Submitting Application..." : "Submit Insurance Application"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {/* ========================================================
                SCHEME APPLY MODAL
            ======================================================== */}
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
                                onClick={handleCloseSchemeModal}
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

                        {schemeModalError && (
                            <div className="mb-5 border-l-2 border-[#A8452F] bg-[#A8452F]/[0.06] px-4 py-3">
                                <p className="text-xs text-[#A8452F] font-medium">{schemeModalError}</p>
                            </div>
                        )}

                        {/* APPLICATION FORM */}
                        <form onSubmit={handleSubmitSchemeApplication} className="space-y-5">
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
                                    onClick={handleCloseSchemeModal}
                                    className="px-5 py-2.5 border border-[#8A8072] text-[#5F574D] hover:bg-[#F6F1E4] text-xs uppercase tracking-[0.15em] font-medium rounded-xs transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={applyingScheme}
                                    className="px-6 py-2.5 bg-[#1F3B2C] text-[#F6F1E4] hover:bg-[#2C4A37] text-xs uppercase tracking-[0.15em] font-medium rounded-xs transition disabled:opacity-50"
                                >
                                    {applyingScheme ? "Submitting..." : "Submit Application"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================
                INSURANCE POLICY DETAILS MODAL
            ======================================================== */}
            {selectedPolicy && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
                    <div className="bg-white border border-[#DED7C9] rounded-sm max-w-lg w-full p-7 shadow-lg">
                        <div className="flex items-center justify-between mb-4 border-b border-[#EEE8DC] pb-3">
                            <div>
                                <h2 className="av-serif text-xl font-medium text-[#2B2620]">
                                    Insurance Policy Details
                                </h2>
                                <p className="text-xs text-[#8A8072] mt-0.5">
                                    {selectedPolicy.policy_name}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedPolicy(null)}
                                className="text-[#8A8072] hover:text-[#2B2620] text-xl font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-3 text-xs text-[#5F574D] bg-[#F6F1E4]/60 p-4 rounded-xs border border-[#EEE8DC] mb-5">
                            <div className="flex justify-between items-center pb-2 border-b border-[#DED7C9]">
                                <span className="av-mono text-[10px] uppercase text-[#8A8072]">Status:</span>
                                <span>{renderInsuranceBadge(selectedPolicy.status)}</span>
                            </div>
                            <div>
                                <strong className="text-[#2B2620] block">Policy Number:</strong>
                                <span className="av-mono font-semibold text-[#1F3B2C]">
                                    {selectedPolicy.policy_number || "Pending assignment upon approval"}
                                </span>
                            </div>
                            <div>
                                <strong className="text-[#2B2620] block">Insurance Provider:</strong>
                                <span>{selectedPolicy.insurance_provider}</span>
                            </div>
                            <div>
                                <strong className="text-[#2B2620] block">Insured Livestock:</strong>
                                <span>
                                    {selectedPolicy.animal_name ? `${selectedPolicy.animal_name} (${selectedPolicy.tag_number})` : selectedPolicy.tag_number} — {selectedPolicy.species} ({selectedPolicy.breed}, {selectedPolicy.gender})
                                </span>
                            </div>
                            {selectedPolicy.identification_mark && (
                                <div>
                                    <strong className="text-[#2B2620] block">Physical Identification Mark:</strong>
                                    <span>{selectedPolicy.identification_mark}</span>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#DED7C9]">
                                <div>
                                    <strong className="text-[#2B2620] block">Coverage Amount:</strong>
                                    <span className="text-[#1F3B2C] font-semibold text-sm">
                                        ₹{Number(selectedPolicy.coverage_amount).toLocaleString("en-IN")}
                                    </span>
                                </div>
                                <div>
                                    <strong className="text-[#2B2620] block">Premium:</strong>
                                    <span className="text-[#2B2620] font-semibold text-sm">
                                        ₹{Number(selectedPolicy.premium_amount).toLocaleString("en-IN")}
                                    </span>
                                </div>
                            </div>
                            {Number(selectedPolicy.subsidy_amount) > 0 && (
                                <div>
                                    <strong className="text-[#2B2620] block">Subsidy Covered:</strong>
                                    <span className="text-[#D9A441] font-semibold">
                                        ₹{Number(selectedPolicy.subsidy_amount).toLocaleString("en-IN")}
                                    </span>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#DED7C9]">
                                <div>
                                    <strong className="text-[#2B2620] block">Start Date:</strong>
                                    <span>
                                        {selectedPolicy.start_date
                                            ? new Date(selectedPolicy.start_date).toLocaleDateString("en-IN", {
                                                  day: "2-digit",
                                                  month: "short",
                                                  year: "numeric"
                                              })
                                            : "—"}
                                    </span>
                                </div>
                                <div>
                                    <strong className="text-[#2B2620] block">End Date:</strong>
                                    <span>
                                        {selectedPolicy.end_date
                                            ? new Date(selectedPolicy.end_date).toLocaleDateString("en-IN", {
                                                  day: "2-digit",
                                                  month: "short",
                                                  year: "numeric"
                                              })
                                            : "—"}
                                    </span>
                                </div>
                            </div>
                            {selectedPolicy.admin_remarks && (
                                <div className="pt-2 border-t border-[#DED7C9]">
                                    <strong className="text-[#2B2620] block">Administrator Remarks:</strong>
                                    <span className={selectedPolicy.status === "REJECTED" ? "text-red-700" : "text-[#1F3B2C]"}>
                                        {selectedPolicy.admin_remarks}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => setSelectedPolicy(null)}
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

export default Schemes;
