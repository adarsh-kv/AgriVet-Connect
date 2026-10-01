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
            padding: 10px 14px;
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
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="inline-block ml-1.5 shrink-0">
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8" />
        <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);

const InfoCircleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 16v-4m0-4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const CalendarIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0 text-amber-700">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="1.8" />
        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.8" />
    </svg>
);

const PhoneIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
        <path
            d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const CheckShieldIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-emerald-700 shrink-0">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

const Schemes = () => {
    // Top-Level Module Tab: "schemes" | "insurance"
    const [mainModule, setMainModule] = useState("schemes");

    // Data States
    const [schemes, setSchemes] = useState([]);
    const [insuranceList, setInsuranceList] = useState([]);

    // UI States
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Search and Filter States
    const [schemeSearch, setSchemeSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All Categories");

    const [insuranceSearch, setInsuranceSearch] = useState("");
    const [selectedInsType, setSelectedInsType] = useState("All Providers");

    // Modals
    const [selectedScheme, setSelectedScheme] = useState(null);
    const [selectedInsurance, setSelectedInsurance] = useState(null);

    // Initial Data Fetching
    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
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
                console.error("Load Schemes & Insurance Error:", err);
                if (isMounted) {
                    setError("Failed to load information directory. Please check your network connection.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadData();

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
            const benefitMatch = s.benefits?.toLowerCase().includes(query);
            const eligMatch = s.eligibility?.toLowerCase().includes(query);

            return matchesCat && (nameMatch || codeMatch || deptMatch || descMatch || benefitMatch || eligMatch);
        });
    }, [schemes, selectedCategory, schemeSearch]);

    // Unique Insurance Provider Types for Filter Pills
    const insuranceProviderTypes = useMemo(() => {
        const types = new Set(["All Providers"]);
        insuranceList.forEach((ins) => {
            if (ins.provider_type) types.add(ins.provider_type);
        });
        return Array.from(types);
    }, [insuranceList]);

    // Filtered Insurance Directory
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
            const covMatch = ins.coverage_details?.toLowerCase().includes(query);
            const subMatch = ins.subsidy_info?.toLowerCase().includes(query);

            return matchesType && (provMatch || polMatch || liveMatch || covMatch || subMatch);
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
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Official Advisory Hub
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                                Central Government & Public Sector Directory
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold av-serif text-[#1C1917]">
                            Central Schemes & Livestock Insurance
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 mt-1 max-w-3xl">
                            Verified Central Government subsidy initiatives, credit assistance, and public sector livestock insurance policies to protect and finance your livestock operations.
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
                            <span>Government Schemes</span>
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
                            <span>Livestock Insurance</span>
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

            {/* MAIN CONTENT AREA */}
            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <div className="w-8 h-8 border-3 border-emerald-700 border-t-transparent rounded-full av-spin mb-4" />
                        <p className="text-sm font-medium">Loading verified directory listings...</p>
                    </div>
                ) : mainModule === "schemes" ? (
                    /* ======================================================== */
                    /* MODULE 1: GOVERNMENT SCHEMES                             */
                    /* ======================================================== */
                    <div>
                        {/* Informational Guidance Banner */}
                        <div className="mb-6 p-4 sm:p-5 bg-emerald-50/70 border border-emerald-200 rounded-lg flex items-start gap-3 sm:gap-4">
                            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-full shrink-0">
                                <InfoCircleIcon />
                            </div>
                            <div className="text-sm">
                                <h3 className="font-semibold text-emerald-900 text-base mb-1">
                                    Official Central Government Information Hub
                                </h3>
                                <p className="text-emerald-800 leading-relaxed">
                                    AgriVet Connect aggregates centrally sponsored schemes from the Department of Animal Husbandry and Dairying (DAHD), Government of India. Subsidy disbursals, loan sanctions, and applications are administered solely through the official government portals linked below or your local District Animal Husbandry Office.
                                </p>
                            </div>
                        </div>

                        {/* Search and Filters */}
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
                                        placeholder="Search schemes by name, keyword, department, or benefits..."
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
                                    Filter:
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

                        {/* Schemes Listing */}
                        {filteredSchemes.length === 0 ? (
                            <div className="text-center py-16 bg-white border border-[#EFE9DC] rounded-lg p-8">
                                <p className="text-base font-semibold text-gray-700 mb-1">No government schemes matched your criteria</p>
                                <p className="text-xs text-gray-500 mb-4">Try adjusting your keyword search or category filter.</p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSchemeSearch("");
                                        setSelectedCategory("All Categories");
                                    }}
                                    className="px-4 py-2 text-xs font-semibold bg-emerald-800 text-white rounded hover:bg-emerald-900 transition-colors"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {filteredSchemes.map((scheme) => (
                                    <div
                                        key={scheme.scheme_id}
                                        className="bg-white border border-[#EAE3D2] rounded-lg p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                                    >
                                        <div>
                                            {/* Card Top Meta */}
                                            <div className="flex items-center justify-between gap-2 mb-3">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="av-mono text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-[#855B14] border border-amber-200">
                                                        {scheme.scheme_code}
                                                    </span>
                                                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                                        {scheme.category || "Central Scheme"}
                                                    </span>
                                                </div>
                                                <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                                                    Active
                                                </span>
                                            </div>

                                            {/* Title & Department */}
                                            <h2 className="text-lg sm:text-xl font-semibold av-serif text-[#1C1917] mb-1 leading-snug">
                                                {scheme.scheme_name}
                                            </h2>
                                            <p className="text-xs text-gray-500 font-medium mb-3">
                                                {scheme.department}
                                            </p>

                                            {/* Description */}
                                            <p className="text-sm text-gray-700 leading-relaxed mb-4 line-clamp-3">
                                                {scheme.description}
                                            </p>

                                            {/* Highlights Grid */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#FAF8F3] border border-[#EFE9DC] rounded mb-4 text-xs">
                                                <div>
                                                    <span className="font-semibold text-gray-900 block mb-1">
                                                        Eligibility:
                                                    </span>
                                                    <p className="text-gray-600 line-clamp-2">
                                                        {scheme.eligibility}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-gray-900 block mb-1">
                                                        Key Benefits:
                                                    </span>
                                                    <p className="text-gray-600 line-clamp-2">
                                                        {scheme.benefits}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Deadline */}
                                            <div className="flex items-center gap-2 text-xs text-gray-600 mb-4 bg-amber-50/50 p-2 rounded border border-amber-100">
                                                <CalendarIcon />
                                                <span className="font-medium text-gray-800">
                                                    Application Period:
                                                </span>
                                                <span className="text-amber-900 font-semibold">
                                                    {formatDeadline(scheme.application_deadline)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Card Actions */}
                                        <div className="pt-4 border-t border-[#EFE9DC] flex items-center justify-between gap-3 mt-2">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedScheme(scheme)}
                                                className="px-3 py-2 text-xs font-semibold text-gray-700 hover:text-gray-900 hover:bg-[#F3EFE6] rounded transition-colors"
                                            >
                                                View Full Overview
                                            </button>

                                            <a
                                                href={scheme.official_url || "https://dahd.gov.in/"}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-xs font-semibold shadow-xs transition-colors"
                                            >
                                                <span>Visit Official Portal</span>
                                                <ExternalLinkIcon />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    /* ======================================================== */
                    /* MODULE 2: LIVESTOCK INSURANCE                            */
                    /* ======================================================== */
                    <div>
                        {/* Informational Guidance Banner */}
                        <div className="mb-6 p-4 sm:p-5 bg-amber-50/70 border border-amber-200 rounded-lg flex items-start gap-3 sm:gap-4">
                            <div className="p-2 bg-amber-100 text-amber-800 rounded-full shrink-0">
                                <ShieldIcon />
                            </div>
                            <div className="text-sm">
                                <h3 className="font-semibold text-amber-950 text-base mb-1">
                                    Public Sector Livestock Insurance Directory
                                </h3>
                                <p className="text-amber-900 leading-relaxed">
                                    AgriVet Connect provides livestock insurance advisory and directory information. Insurance underwriting, premium assessment, policy issuance, and claim settlements are executed directly through authorized public sector general insurance companies and state livestock development agencies.
                                </p>
                            </div>
                        </div>

                        {/* Search and Filters */}
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
                                        placeholder="Search by insurer, policy name, livestock type, or coverage..."
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

                        {/* Insurance Listing */}
                        {filteredInsurance.length === 0 ? (
                            <div className="text-center py-16 bg-white border border-[#EFE9DC] rounded-lg p-8">
                                <p className="text-base font-semibold text-gray-700 mb-1">No insurance providers matched your criteria</p>
                                <p className="text-xs text-gray-500 mb-4">Try adjusting your keyword search or provider filter.</p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setInsuranceSearch("");
                                        setSelectedInsType("All Providers");
                                    }}
                                    className="px-4 py-2 text-xs font-semibold bg-[#916922] text-white rounded hover:bg-[#785516] transition-colors"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {filteredInsurance.map((ins) => (
                                    <div
                                        key={ins.insurance_id}
                                        className="bg-white border border-[#EAE3D2] rounded-lg p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                                    >
                                        <div>
                                            {/* Card Top Meta */}
                                            <div className="flex items-center justify-between gap-2 mb-3">
                                                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                                                    {ins.provider_type}
                                                </span>
                                                <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                                                    Verified Policy
                                                </span>
                                            </div>

                                            {/* Insurer & Policy Name */}
                                            <h2 className="text-lg sm:text-xl font-semibold av-serif text-[#1C1917] mb-1 leading-snug">
                                                {ins.policy_name}
                                            </h2>
                                            <p className="text-xs text-gray-600 font-semibold mb-3">
                                                {ins.provider_name}
                                            </p>

                                            {/* Eligible Livestock Tags */}
                                            <div className="mb-4">
                                                <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 block mb-1">
                                                    Eligible Livestock:
                                                </span>
                                                <p className="text-xs text-gray-800 bg-[#FAF8F3] p-2 rounded border border-[#EFE9DC]">
                                                    {ins.eligible_livestock}
                                                </p>
                                            </div>

                                            {/* Coverage & Subsidy Snippets */}
                                            <div className="space-y-3 mb-4 text-xs">
                                                <div>
                                                    <span className="font-semibold text-gray-900 block mb-0.5">
                                                        Coverage Scope:
                                                    </span>
                                                    <p className="text-gray-700 leading-relaxed line-clamp-2">
                                                        {ins.coverage_details}
                                                    </p>
                                                </div>

                                                <div>
                                                    <span className="font-semibold text-gray-900 block mb-0.5">
                                                        Subsidy Information:
                                                    </span>
                                                    <p className="text-gray-700 leading-relaxed line-clamp-2">
                                                        {ins.subsidy_info}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Helpline */}
                                            {ins.contact_info && (
                                                <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-200 mb-4">
                                                    <PhoneIcon />
                                                    <span className="font-medium">Helpline / Support:</span>
                                                    <span className="text-gray-900 font-semibold">{ins.contact_info}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Card Actions */}
                                        <div className="pt-4 border-t border-[#EFE9DC] flex items-center justify-between gap-3 mt-2">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedInsurance(ins)}
                                                className="px-3 py-2 text-xs font-semibold text-gray-700 hover:text-gray-900 hover:bg-[#F3EFE6] rounded transition-colors"
                                            >
                                                View Policy Guide
                                            </button>

                                            <a
                                                href={ins.official_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center px-4 py-2 bg-[#916922] hover:bg-[#7A5616] text-white rounded text-xs font-semibold shadow-xs transition-colors"
                                            >
                                                <span>Visit Insurer Portal</span>
                                                <ExternalLinkIcon />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ======================================================== */}
            {/* MODAL 1: SCHEME FULL DETAILS                             */}
            {/* ======================================================== */}
            {selectedScheme && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
                    onClick={() => setSelectedScheme(null)}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl border border-[#DED7C9] max-w-2xl w-full p-6 sm:p-8 my-8 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#EFE9DC]">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="av-mono text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-[#855B14] border border-amber-200">
                                        {selectedScheme.scheme_code}
                                    </span>
                                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                        {selectedScheme.category}
                                    </span>
                                </div>
                                <h3 className="text-xl sm:text-2xl font-semibold av-serif text-[#1C1917]">
                                    {selectedScheme.scheme_name}
                                </h3>
                                <p className="text-xs text-gray-500 font-medium mt-1">
                                    {selectedScheme.department}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedScheme(null)}
                                className="text-gray-400 hover:text-gray-700 text-xl font-bold leading-none p-1"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-1 text-sm">
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">About the Scheme</h4>
                                <p className="text-gray-700 leading-relaxed text-sm">
                                    {selectedScheme.description}
                                </p>
                            </div>

                            <div className="p-3 bg-[#FAF8F3] border border-[#EFE9DC] rounded">
                                <h4 className="font-semibold text-gray-900 mb-1">Eligibility Criteria</h4>
                                <p className="text-gray-700 leading-relaxed text-xs sm:text-sm">
                                    {selectedScheme.eligibility}
                                </p>
                            </div>

                            <div className="p-3 bg-[#FAF8F3] border border-[#EFE9DC] rounded">
                                <h4 className="font-semibold text-gray-900 mb-1">Financial & Technical Benefits</h4>
                                <p className="text-gray-700 leading-relaxed text-xs sm:text-sm">
                                    {selectedScheme.benefits}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 text-xs sm:text-sm bg-amber-50/70 p-3 rounded border border-amber-200 text-amber-950">
                                <CalendarIcon />
                                <div>
                                    <span className="font-semibold">Application Period / Deadline: </span>
                                    <span>{formatDeadline(selectedScheme.application_deadline)}</span>
                                </div>
                            </div>

                            <div className="text-xs text-gray-500 italic bg-gray-50 p-3 rounded border border-gray-200">
                                Note: Applications, beneficiary identification, and subsidy sanctions are managed directly on the official Ministry / Mission portal.
                            </div>
                        </div>

                        <div className="pt-4 border-t border-[#EFE9DC] flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setSelectedScheme(null)}
                                className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded"
                            >
                                Close
                            </button>
                            <a
                                href={selectedScheme.official_url || "https://dahd.gov.in/"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-xs font-semibold shadow-xs"
                            >
                                <span>Proceed to Official Government Portal</span>
                                <ExternalLinkIcon />
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* MODAL 2: INSURANCE FULL DETAILS & POLICY GUIDE           */}
            {/* ======================================================== */}
            {selectedInsurance && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
                    onClick={() => setSelectedInsurance(null)}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl border border-[#DED7C9] max-w-2xl w-full p-6 sm:p-8 my-8 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#EFE9DC]">
                            <div>
                                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                                    {selectedInsurance.provider_type}
                                </span>
                                <h3 className="text-xl sm:text-2xl font-semibold av-serif text-[#1C1917] mt-2">
                                    {selectedInsurance.policy_name}
                                </h3>
                                <p className="text-xs text-gray-600 font-semibold mt-0.5">
                                    {selectedInsurance.provider_name}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedInsurance(null)}
                                className="text-gray-400 hover:text-gray-700 text-xl font-bold leading-none p-1"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-1 text-sm">
                            <div className="p-3 bg-[#FAF8F3] border border-[#EFE9DC] rounded">
                                <h4 className="font-semibold text-gray-900 mb-1 text-xs uppercase tracking-wider">
                                    Eligible Animals
                                </h4>
                                <p className="text-gray-700 text-xs sm:text-sm">
                                    {selectedInsurance.eligible_livestock}
                                </p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1 text-xs uppercase tracking-wider">
                                    Coverage Details & Scope
                                </h4>
                                <p className="text-gray-700 leading-relaxed text-xs sm:text-sm">
                                    {selectedInsurance.coverage_details}
                                </p>
                            </div>

                            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded">
                                <h4 className="font-semibold text-amber-950 mb-1 text-xs uppercase tracking-wider">
                                    Premium & Subsidy Eligibility
                                </h4>
                                <p className="text-amber-900 leading-relaxed text-xs sm:text-sm">
                                    {selectedInsurance.subsidy_info}
                                </p>
                            </div>

                            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded space-y-1">
                                <div className="flex items-center gap-1.5 font-semibold text-emerald-950 text-xs uppercase tracking-wider mb-1">
                                    <CheckShieldIcon />
                                    <span>Claim Submission Process & Checklist</span>
                                </div>
                                <p className="text-emerald-900 leading-relaxed text-xs sm:text-sm">
                                    {selectedInsurance.claim_process}
                                </p>
                            </div>

                            {selectedInsurance.contact_info && (
                                <div className="flex items-center gap-2 text-xs sm:text-sm bg-gray-50 p-3 rounded border border-gray-200 text-gray-700">
                                    <PhoneIcon />
                                    <span className="font-semibold">Contact & Support:</span>
                                    <span>{selectedInsurance.contact_info}</span>
                                </div>
                            )}

                            <div className="text-xs text-gray-500 italic bg-gray-50 p-3 rounded border border-gray-200">
                                Note: Policy enrollment, premium calculation, and claim adjudication are processed directly by the respective insurance company under IRDAI regulations.
                            </div>
                        </div>

                        <div className="pt-4 border-t border-[#EFE9DC] flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setSelectedInsurance(null)}
                                className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded"
                            >
                                Close
                            </button>
                            <a
                                href={selectedInsurance.official_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-[#916922] hover:bg-[#7A5616] text-white rounded text-xs font-semibold shadow-xs"
                            >
                                <span>Proceed to Insurer Official Website</span>
                                <ExternalLinkIcon />
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Schemes;
