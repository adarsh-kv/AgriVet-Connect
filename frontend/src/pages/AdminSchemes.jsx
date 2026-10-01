import { useEffect, useState, useMemo } from "react";
import API from "../services/api";

const sharedStyles = (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

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
            border-radius: 4px;
            padding: 9px 13px;
            outline: none;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .av-input:focus {
            border-color: #D9A441;
            box-shadow: 0 0 0 2px rgba(217, 164, 65, 0.15);
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

const ExternalLinkIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="inline-block ml-1 shrink-0">
        <path
            d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6m4-3h6v6m-11 5L21 3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const DocumentIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const ShieldIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const SearchIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8" />
        <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);

const CalendarIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0 text-amber-700">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="1.8" />
        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.8" />
    </svg>
);

const PhoneIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
        <path
            d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const SCHEME_CATEGORIES = [
    "All Categories",
    "Breeding & Genetics",
    "Equipment & Infrastructure",
    "Financial Aid",
    "Healthcare & Disease Control",
    "Subsidy"
];

const AdminSchemes = () => {
    // Navigation: "schemes" | "insurance"
    const [mainModule, setMainModule] = useState("schemes");

    // Data States
    const [schemes, setSchemes] = useState([]);
    const [insuranceList, setInsuranceList] = useState([]);

    // UI States
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Search and Filters
    const [schemeSearch, setSchemeSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All Categories");

    const [insuranceSearch, setInsuranceSearch] = useState("");
    const [selectedInsType, setSelectedInsType] = useState("All Providers");

    // Modals
    const [viewingScheme, setViewingScheme] = useState(null);
    const [viewingInsurance, setViewingInsurance] = useState(null);

    // Initial Fetch
    useEffect(() => {
        let isMounted = true;

        const loadAdminData = async () => {
            setLoading(true);
            setError("");
            try {
                const [schemesRes, insuranceRes] = await Promise.all([
                    API.get("/schemes"),
                    API.get("/insurance/directory")
                ]);

                if (isMounted) {
                    setSchemes(Array.isArray(schemesRes.data) ? schemesRes.data : []);
                    setInsuranceList(Array.isArray(insuranceRes.data) ? insuranceRes.data : []);
                }
            } catch (err) {
                console.error("Admin Load Schemes & Insurance Error:", err);
                if (isMounted) {
                    setError("Failed to load directory data. Please ensure the backend server is running.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadAdminData();

        return () => {
            isMounted = false;
        };
    }, []);

    // Filtered Schemes
    const filteredSchemes = useMemo(() => {
        return schemes.filter((s) => {
            const matchesCat =
                selectedCategory === "All Categories" ||
                (s.category && s.category.toLowerCase() === selectedCategory.toLowerCase());

            const query = schemeSearch.trim().toLowerCase();
            if (!query) return matchesCat;

            const nameMatch = s.scheme_name?.toLowerCase().includes(query);
            const codeMatch = s.scheme_code?.toLowerCase().includes(query);
            const deptMatch = s.department?.toLowerCase().includes(query);
            const descMatch = s.description?.toLowerCase().includes(query);

            return matchesCat && (nameMatch || codeMatch || deptMatch || descMatch);
        });
    }, [schemes, selectedCategory, schemeSearch]);

    // Unique Insurance Provider Types
    const insuranceProviderTypes = useMemo(() => {
        const types = new Set(["All Providers"]);
        insuranceList.forEach((ins) => {
            if (ins.provider_type) types.add(ins.provider_type);
        });
        return Array.from(types);
    }, [insuranceList]);

    // Filtered Insurance
    const filteredInsurance = useMemo(() => {
        return insuranceList.filter((ins) => {
            const matchesType =
                selectedInsType === "All Providers" ||
                (ins.provider_type && ins.provider_type.toLowerCase() === selectedInsType.toLowerCase());

            const query = insuranceSearch.trim().toLowerCase();
            if (!query) return matchesType;

            const provMatch = ins.provider_name?.toLowerCase().includes(query);
            const polMatch = ins.policy_name?.toLowerCase().includes(query);
            const liveMatch = ins.eligible_livestock?.toLowerCase().includes(query);

            return matchesType && (provMatch || polMatch || liveMatch);
        });
    }, [insuranceList, selectedInsType, insuranceSearch]);

    const formatDeadline = (deadline) => {
        if (!deadline) {
            return "Refer to official portal for current dates";
        }
        try {
            const d = new Date(deadline);
            if (isNaN(d.getTime())) {
                return "Refer to official portal for current dates";
            }
            return d.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric"
            });
        } catch {
            return "Refer to official portal for current dates";
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-[#1C1917] p-4 sm:p-6 lg:p-8">
            {sharedStyles}

            {/* HEADER */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#EFE9DC] pb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                                Administrative Directory
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                                Central Schemes & Insurance Reference Portal
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold av-serif text-[#1C1917]">
                            Schemes & Insurance Directory
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 mt-1 max-w-3xl">
                            Verified reference directory for Central Government livestock initiatives and Public Sector General Insurance policies available to registered farmers.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 bg-[#F5EFE6] p-1 rounded-md border border-[#E8DFC8] self-start md:self-auto shrink-0">
                        <button
                            type="button"
                            onClick={() => setMainModule("schemes")}
                            className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold transition-all ${
                                mainModule === "schemes"
                                    ? "bg-white text-emerald-900 shadow-sm border border-[#DED7C9]"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-[#ECE4D4]"
                            }`}
                        >
                            <DocumentIcon />
                            <span>Schemes Directory</span>
                            <span className="ml-1 text-xs px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                                {schemes.length}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setMainModule("insurance")}
                            className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold transition-all ${
                                mainModule === "insurance"
                                    ? "bg-white text-emerald-900 shadow-sm border border-[#DED7C9]"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-[#ECE4D4]"
                            }`}
                        >
                            <ShieldIcon />
                            <span>Insurance Providers</span>
                            <span className="ml-1 text-xs px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-full font-bold">
                                {insuranceList.length}
                            </span>
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex items-center justify-between">
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={() => setError("")}
                            className="text-red-500 hover:text-red-800 font-bold ml-4"
                        >
                            Dismiss
                        </button>
                    </div>
                )}
            </div>

            {/* DIRECTORY OVERVIEW METRICS */}
            <div className="max-w-7xl mx-auto mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-[#EFE9DC] p-4 rounded-lg shadow-xs">
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                        Active Central Schemes
                    </span>
                    <div className="text-2xl font-bold av-serif text-emerald-900">
                        {schemes.length}
                    </div>
                    <span className="text-[11px] text-gray-500 mt-1 block">
                        Under Dept. of Animal Husbandry & Dairying
                    </span>
                </div>

                <div className="bg-white border border-[#EFE9DC] p-4 rounded-lg shadow-xs">
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                        Insurance Providers / Policies
                    </span>
                    <div className="text-2xl font-bold av-serif text-[#855B14]">
                        {insuranceList.length}
                    </div>
                    <span className="text-[11px] text-gray-500 mt-1 block">
                        Licensed Public Sector General Insurers
                    </span>
                </div>

                <div className="bg-white border border-[#EFE9DC] p-4 rounded-lg shadow-xs">
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                        Application Mode
                    </span>
                    <div className="text-base font-bold text-gray-800 mt-1">
                        External Official Portals
                    </div>
                    <span className="text-[11px] text-gray-500 mt-1 block">
                        Direct Ministry / Insurer Links
                    </span>
                </div>

                <div className="bg-white border border-[#EFE9DC] p-4 rounded-lg shadow-xs">
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                        Directory Status
                    </span>
                    <div className="flex items-center gap-1.5 text-base font-bold text-emerald-700 mt-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                        Verified & Operational
                    </div>
                    <span className="text-[11px] text-gray-500 mt-1 block">
                        All Portal URLs Verified
                    </span>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <div className="w-8 h-8 border-3 border-emerald-700 border-t-transparent rounded-full av-spin mb-4" />
                        <p className="text-sm font-medium">Loading administrative directory...</p>
                    </div>
                ) : mainModule === "schemes" ? (
                    /* ======================================================== */
                    /* ADMIN VIEW: GOVERNMENT SCHEMES DIRECTORY                 */
                    /* ======================================================== */
                    <div>
                        {/* Search & Filter Header */}
                        <div className="mb-6 space-y-4">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <SearchIcon />
                                    </div>
                                    <input
                                        type="text"
                                        value={schemeSearch}
                                        onChange={(e) => setSchemeSearch(e.target.value)}
                                        placeholder="Search schemes by code, name, department, or keyword..."
                                        className="av-input w-full pl-10 pr-4 text-sm bg-white"
                                    />
                                    {schemeSearch && (
                                        <button
                                            type="button"
                                            onClick={() => setSchemeSearch("")}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-400 hover:text-gray-600 font-semibold"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Category Filter Pills */}
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">
                                    Category:
                                </span>
                                {SCHEME_CATEGORIES.map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                            selectedCategory === cat
                                                ? "bg-emerald-800 text-white shadow-xs font-semibold"
                                                : "bg-[#F3EFE6] text-gray-700 hover:bg-[#EAE2D4] border border-[#E2D8C3]"
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Schemes Table */}
                        {filteredSchemes.length === 0 ? (
                            <div className="text-center py-16 bg-white border border-[#EFE9DC] rounded-lg p-8">
                                <p className="text-base font-semibold text-gray-700 mb-1">No schemes found matching the filters</p>
                                <p className="text-xs text-gray-500">Try modifying your search or resetting category filters.</p>
                            </div>
                        ) : (
                            <div className="bg-white border border-[#EFE9DC] rounded-lg shadow-xs overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-[#FAF7F0] border-b border-[#EFE9DC] text-xs uppercase tracking-wider text-gray-600 font-semibold">
                                            <tr>
                                                <th className="py-3 px-4">Scheme Code</th>
                                                <th className="py-3 px-4">Scheme Name & Ministry</th>
                                                <th className="py-3 px-4">Category</th>
                                                <th className="py-3 px-4">Application Period</th>
                                                <th className="py-3 px-4">Official Portal</th>
                                                <th className="py-3 px-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#EFE9DC]">
                                            {filteredSchemes.map((s) => (
                                                <tr key={s.scheme_id} className="hover:bg-[#FCFBF8] transition-colors">
                                                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-amber-900 whitespace-nowrap">
                                                        {s.scheme_code}
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <div className="font-semibold text-gray-900 leading-tight">
                                                            {s.scheme_name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                                            {s.department}
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-4 whitespace-nowrap">
                                                        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                                            {s.category}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-xs text-gray-700 whitespace-nowrap">
                                                        {formatDeadline(s.application_deadline)}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-xs">
                                                        <a
                                                            href={s.official_url || "https://dahd.gov.in/"}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-emerald-700 hover:text-emerald-900 font-semibold inline-flex items-center gap-1 hover:underline"
                                                        >
                                                            <span>Portal Link</span>
                                                            <ExternalLinkIcon />
                                                        </a>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                                        <button
                                                            type="button"
                                                            onClick={() => setViewingScheme(s)}
                                                            className="px-3 py-1.5 text-xs font-semibold bg-[#F5EFE6] text-gray-800 hover:bg-[#EAE2D4] border border-[#DED7C9] rounded transition-colors"
                                                        >
                                                            View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* ======================================================== */
                    /* ADMIN VIEW: LIVESTOCK INSURANCE PROVIDERS                */
                    /* ======================================================== */
                    <div>
                        {/* Search & Filter Header */}
                        <div className="mb-6 space-y-4">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <SearchIcon />
                                    </div>
                                    <input
                                        type="text"
                                        value={insuranceSearch}
                                        onChange={(e) => setInsuranceSearch(e.target.value)}
                                        placeholder="Search providers by insurer name, policy, or livestock..."
                                        className="av-input w-full pl-10 pr-4 text-sm bg-white"
                                    />
                                    {insuranceSearch && (
                                        <button
                                            type="button"
                                            onClick={() => setInsuranceSearch("")}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-400 hover:text-gray-600 font-semibold"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Insurer Type Filter Pills */}
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">
                                    Provider Type:
                                </span>
                                {insuranceProviderTypes.map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setSelectedInsType(type)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                            selectedInsType === type
                                                ? "bg-[#916922] text-white shadow-xs font-semibold"
                                                : "bg-[#F3EFE6] text-gray-700 hover:bg-[#EAE2D4] border border-[#E2D8C3]"
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Insurance Table */}
                        {filteredInsurance.length === 0 ? (
                            <div className="text-center py-16 bg-white border border-[#EFE9DC] rounded-lg p-8">
                                <p className="text-base font-semibold text-gray-700 mb-1">No insurance providers found matching the filters</p>
                                <p className="text-xs text-gray-500">Try modifying your search or resetting provider filters.</p>
                            </div>
                        ) : (
                            <div className="bg-white border border-[#EFE9DC] rounded-lg shadow-xs overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-[#FAF7F0] border-b border-[#EFE9DC] text-xs uppercase tracking-wider text-gray-600 font-semibold">
                                            <tr>
                                                <th className="py-3 px-4">Provider Name & Type</th>
                                                <th className="py-3 px-4">Policy Name</th>
                                                <th className="py-3 px-4">Eligible Animals</th>
                                                <th className="py-3 px-4">Official Portal</th>
                                                <th className="py-3 px-4">Contact / Helpline</th>
                                                <th className="py-3 px-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#EFE9DC]">
                                            {filteredInsurance.map((ins) => (
                                                <tr key={ins.insurance_id} className="hover:bg-[#FCFBF8] transition-colors">
                                                    <td className="py-3.5 px-4">
                                                        <div className="font-semibold text-gray-900 leading-tight">
                                                            {ins.provider_name}
                                                        </div>
                                                        <div className="text-xs text-amber-900 font-medium mt-0.5">
                                                            {ins.provider_type}
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-4 font-medium text-gray-800">
                                                        {ins.policy_name}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-xs text-gray-600">
                                                        <span className="line-clamp-2 max-w-xs">
                                                            {ins.eligible_livestock}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                                                        <a
                                                            href={ins.official_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-amber-800 hover:text-amber-950 font-semibold inline-flex items-center gap-1 hover:underline"
                                                        >
                                                            <span>Official Site</span>
                                                            <ExternalLinkIcon />
                                                        </a>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-xs text-gray-600 whitespace-nowrap">
                                                        {ins.contact_info || "Refer to portal"}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                                        <button
                                                            type="button"
                                                            onClick={() => setViewingInsurance(ins)}
                                                            className="px-3 py-1.5 text-xs font-semibold bg-[#F5EFE6] text-gray-800 hover:bg-[#EAE2D4] border border-[#DED7C9] rounded transition-colors"
                                                        >
                                                            View Guide
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ======================================================== */}
            {/* ADMIN MODAL: SCHEME DETAILS                              */}
            {/* ======================================================== */}
            {viewingScheme && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
                    onClick={() => setViewingScheme(null)}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl border border-[#DED7C9] max-w-2xl w-full p-6 sm:p-8 my-8 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#EFE9DC]">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="av-mono text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-[#855B14] border border-amber-200">
                                        {viewingScheme.scheme_code}
                                    </span>
                                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                        {viewingScheme.category}
                                    </span>
                                </div>
                                <h3 className="text-xl sm:text-2xl font-semibold av-serif text-[#1C1917]">
                                    {viewingScheme.scheme_name}
                                </h3>
                                <p className="text-xs text-gray-500 font-medium mt-1">
                                    {viewingScheme.department}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setViewingScheme(null)}
                                className="text-gray-400 hover:text-gray-700 text-xl font-bold leading-none p-1"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-1 text-sm">
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">Description</h4>
                                <p className="text-gray-700 leading-relaxed text-sm">
                                    {viewingScheme.description}
                                </p>
                            </div>

                            <div className="p-3 bg-[#FAF8F3] border border-[#EFE9DC] rounded">
                                <h4 className="font-semibold text-gray-900 mb-1">Eligibility Criteria</h4>
                                <p className="text-gray-700 leading-relaxed text-xs sm:text-sm">
                                    {viewingScheme.eligibility}
                                </p>
                            </div>

                            <div className="p-3 bg-[#FAF8F3] border border-[#EFE9DC] rounded">
                                <h4 className="font-semibold text-gray-900 mb-1">Benefits</h4>
                                <p className="text-gray-700 leading-relaxed text-xs sm:text-sm">
                                    {viewingScheme.benefits}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 text-xs sm:text-sm bg-amber-50/70 p-3 rounded border border-amber-200 text-amber-950">
                                <CalendarIcon />
                                <div>
                                    <span className="font-semibold">Application Period: </span>
                                    <span>{formatDeadline(viewingScheme.application_deadline)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-[#EFE9DC] flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setViewingScheme(null)}
                                className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded"
                            >
                                Close
                            </button>
                            <a
                                href={viewingScheme.official_url || "https://dahd.gov.in/"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-xs font-semibold shadow-xs"
                            >
                                <span>Visit Official Portal</span>
                                <ExternalLinkIcon />
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* ADMIN MODAL: INSURANCE DETAILS                           */}
            {/* ======================================================== */}
            {viewingInsurance && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
                    onClick={() => setViewingInsurance(null)}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl border border-[#DED7C9] max-w-2xl w-full p-6 sm:p-8 my-8 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#EFE9DC]">
                            <div>
                                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                                    {viewingInsurance.provider_type}
                                </span>
                                <h3 className="text-xl sm:text-2xl font-semibold av-serif text-[#1C1917] mt-2">
                                    {viewingInsurance.policy_name}
                                </h3>
                                <p className="text-xs text-gray-600 font-semibold mt-0.5">
                                    {viewingInsurance.provider_name}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setViewingInsurance(null)}
                                className="text-gray-400 hover:text-gray-700 text-xl font-bold leading-none p-1"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-1 text-sm">
                            <div className="p-3 bg-[#FAF8F3] border border-[#EFE9DC] rounded">
                                <h4 className="font-semibold text-gray-900 mb-1 text-xs uppercase tracking-wider">
                                    Eligible Livestock
                                </h4>
                                <p className="text-gray-700 text-xs sm:text-sm">
                                    {viewingInsurance.eligible_livestock}
                                </p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1 text-xs uppercase tracking-wider">
                                    Coverage Details
                                </h4>
                                <p className="text-gray-700 leading-relaxed text-xs sm:text-sm">
                                    {viewingInsurance.coverage_details}
                                </p>
                            </div>

                            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded">
                                <h4 className="font-semibold text-amber-950 mb-1 text-xs uppercase tracking-wider">
                                    Subsidy Information
                                </h4>
                                <p className="text-amber-900 leading-relaxed text-xs sm:text-sm">
                                    {viewingInsurance.subsidy_info}
                                </p>
                            </div>

                            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded">
                                <h4 className="font-semibold text-emerald-950 mb-1 text-xs uppercase tracking-wider">
                                    Claim Submission Guidelines
                                </h4>
                                <p className="text-emerald-900 leading-relaxed text-xs sm:text-sm">
                                    {viewingInsurance.claim_process}
                                </p>
                            </div>

                            {viewingInsurance.contact_info && (
                                <div className="flex items-center gap-2 text-xs sm:text-sm bg-gray-50 p-3 rounded border border-gray-200 text-gray-700">
                                    <PhoneIcon />
                                    <span className="font-semibold">Contact & Helpline:</span>
                                    <span>{viewingInsurance.contact_info}</span>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-[#EFE9DC] flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setViewingInsurance(null)}
                                className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded"
                            >
                                Close
                            </button>
                            <a
                                href={viewingInsurance.official_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-[#916922] hover:bg-[#7A5616] text-white rounded text-xs font-semibold shadow-xs"
                            >
                                <span>Proceed to Insurer Portal</span>
                                <ExternalLinkIcon />
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSchemes;
