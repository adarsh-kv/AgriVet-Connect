import { useEffect, useState } from "react";
import API from "../services/api";

const STAT_CARDS = [
    {
        key: "totalLivestock",
        label: "Total Livestock",
        caption: "Animals registered",
        icon: (
            <path d="M4 17c0-3.5 2.5-6 6-6h4c3.5 0 6 2.5 6 6M9 11V7a3 3 0 013-3 3 3 0 013 3v4"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        ),
    },
    {
        key: "totalHealthRecords",
        label: "Health Records",
        caption: "Medical records",
        icon: (
            <path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        ),
    },
    {
        key: "totalVaccinations",
        label: "Vaccinations",
        caption: "Vaccination records",
        icon: (
            <path d="M6 18 18 6M9 6l4 4M14 11l4 4M6 18l-2 2M6 18l3-1-2-2-1 3z"
                stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        ),
    },
];

// Circular line-icon avatar used to open each row in a list — keeps the
// same dark-green / gold language as the brand mark instead of emoji.
const RowAvatar = ({ children }) => (
    <div className="w-11 h-11 rounded-full bg-[#1F3B2C] flex items-center justify-center shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" className="text-[#D9A441]" aria-hidden="true">
            {children}
        </svg>
    </div>
);

const TagIcon = () => (
    <path
        d="M4 17c0-3.5 2.5-6 6-6h4c3.5 0 6 2.5 6 6M9 11V7a3 3 0 013-3 3 3 0 013 3v4"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"
    />
);

const PulseIcon = () => (
    <path
        d="M3 12h4l2 5 4-10 2 5h6"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"
    />
);

const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalLivestock: 0,
        totalHealthRecords: 0,
        totalVaccinations: 0
    });
    const [vaccinations, setVaccinations] = useState([]);
    const [healthRecords, setHealthRecords] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
    const fetchDashboardData = async () => {
        try {
            const statsResponse = await API.get("/dashboard/stats");
            setStats(statsResponse.data);

            const vaccinationResponse = await API.get(
                "/dashboard/upcoming-vaccinations"
            );
            setVaccinations(vaccinationResponse.data);

            const healthResponse = await API.get(
                "/dashboard/recent-health"
            );
            setHealthRecords(healthResponse.data);

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Failed to load dashboard"
            );
        } finally {
            setLoading(false);
        }
    };

    fetchDashboardData();
}, []);

    const sharedStyles = (
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
            .av-serif { font-family: 'Fraunces', serif; }
            .av-mono { font-family: 'JetBrains Mono', monospace; }
            body { font-family: 'Inter', sans-serif; }

            @keyframes av-pulse {
                0%   { box-shadow: 0 0 0 0 rgba(217,164,65,0.55); }
                70%  { box-shadow: 0 0 0 9px rgba(217,164,65,0); }
                100% { box-shadow: 0 0 0 0 rgba(217,164,65,0); }
            }
            .av-node-dot { animation: av-pulse 2.6s ease-out infinite; }

            @keyframes av-spin { to { transform: rotate(360deg); } }
            .av-spin { animation: av-spin 1s linear infinite; }

            @media (prefers-reduced-motion: reduce) {
                .av-node-dot, .av-spin { animation: none; }
            }
        `}</style>
    );

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#F6F1E4] font-[Inter,sans-serif]">
                {sharedStyles}
                <div className="av-spin h-8 w-8 rounded-full border-2 border-[#DED7C9] border-t-[#1F3B2C]" />
                <p className="av-mono text-[11px] tracking-[0.2em] uppercase text-[#8A8072]">
                    Loading dashboard
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F6F1E4] px-6 font-[Inter,sans-serif]">
                {sharedStyles}
                <div className="border-l-2 border-[#A8452F] bg-[#A8452F]/[0.06] px-5 py-4 max-w-sm">
                    <p className="av-mono text-[10px] tracking-[0.2em] uppercase text-[#A8452F] mb-1.5">
                        Dashboard error
                    </p>
                    <p className="text-[14px] text-[#A8452F]">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F6F1E4] font-[Inter,sans-serif]">
            {sharedStyles}

            {/* Main */}
            <main className="max-w-6xl mx-auto px-6 py-12">

                {/* Overview */}
                <div className="mb-10">
                    <p className="av-mono text-[11px] tracking-[0.25em] uppercase text-[#A8452F] mb-3">
                        Overview
                    </p>
                    <h2 className="av-serif text-[2.1rem] font-medium text-[#2B2620]">
                        Farm at a glance
                    </h2>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {STAT_CARDS.map((card) => (
                        <div
                            key={card.key}
                            className="relative bg-white border border-[#DED7C9] rounded-sm p-7 overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#1F3B2C]" />

                            <div className="flex items-start justify-between">
                                <p className="av-mono text-[10px] tracking-[0.18em] uppercase text-[#8A8072] mt-1">
                                    {card.label}
                                </p>
                                <svg
                                    width="20" height="20" viewBox="0 0 24 24"
                                    className="text-[#D9A441] shrink-0"
                                    aria-hidden="true"
                                >
                                    {card.icon}
                                </svg>
                            </div>

                            <p className="av-serif text-5xl font-medium text-[#1F3B2C] mt-5">
                                {stats[card.key]}
                            </p>

                            <p className="text-[12.5px] text-[#8A8072] mt-3">
                                {card.caption}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Upcoming Vaccinations */}
                <section className="mt-12">

                    <div className="mb-6">
                        <p className="av-mono text-[11px] tracking-[0.25em] uppercase text-[#A8452F] mb-3">
                            Vaccination Schedule
                        </p>
                        <h2 className="av-serif text-[2rem] font-medium text-[#2B2620]">
                            Upcoming Vaccinations
                        </h2>
                    </div>

                    <div className="bg-white border border-[#DED7C9] rounded-sm overflow-hidden">

                        {vaccinations.length === 0 ? (
                            <div className="px-7 py-8">
                                <p className="text-sm text-[#8A8072]">
                                    No upcoming vaccinations.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-[#DED7C9]">
                                {vaccinations.map((vaccination) => (
                                    <div
                                        key={vaccination.vaccination_id}
                                        className="px-7 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 hover:bg-[#F6F1E4]/50 transition-colors"
                                    >

                                        {/* Animal information */}
                                        <div className="flex items-center gap-4">
                                            <RowAvatar>
                                                <TagIcon />
                                            </RowAvatar>

                                            <div>
                                                <h3 className="font-medium text-[#2B2620]">
                                                    {vaccination.animal_name}
                                                </h3>
                                                <p className="av-mono text-[10px] tracking-[0.12em] uppercase text-[#8A8072] mt-1">
                                                    Tag {vaccination.tag_number}
                                                </p>
                                                <p className="text-sm text-[#6B6255] mt-2">
                                                    {vaccination.vaccine_name}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Due date */}
                                        <div className="sm:text-right">
                                            <p className="av-mono text-[10px] tracking-[0.15em] uppercase text-[#8A8072]">
                                                Next Due
                                            </p>
                                            <p className="av-serif text-lg text-[#1F3B2C] mt-1">
                                                {formatDate(vaccination.next_due_date)}
                                            </p>
                                            <span className="inline-block mt-2 px-2.5 py-1 bg-[#D9A441]/10 text-[#8A651C] av-mono text-[10px] uppercase tracking-wider">
                                                {vaccination.status}
                                            </span>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        )}

                    </div>
                </section>

                {/* Recent Health Records */}
                <section className="mt-12">

                    <div className="mb-6">
                        <p className="av-mono text-[11px] tracking-[0.25em] uppercase text-[#A8452F] mb-3">
                            Veterinary Care
                        </p>
                        <h2 className="av-serif text-[2rem] font-medium text-[#2B2620]">
                            Recent Health Records
                        </h2>
                    </div>

                    <div className="bg-white border border-[#DED7C9] rounded-sm overflow-hidden">

                        {healthRecords.length === 0 ? (
                            <div className="px-7 py-8">
                                <p className="text-sm text-[#8A8072]">
                                    No recent health records.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-[#DED7C9]">
                                {healthRecords.map((record) => (
                                    <div
                                        key={record.record_id}
                                        className="px-7 py-6 hover:bg-[#F6F1E4]/50 transition-colors"
                                    >

                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                                            {/* Animal */}
                                            <div className="flex items-center gap-4">
                                                <RowAvatar>
                                                    <PulseIcon />
                                                </RowAvatar>

                                                <div>
                                                    <h3 className="font-medium text-[#2B2620]">
                                                        {record.animal_name}
                                                    </h3>
                                                    <p className="av-mono text-[10px] tracking-[0.12em] uppercase text-[#8A8072] mt-1">
                                                        Tag {record.tag_number}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Diagnosis */}
                                            <div className="lg:max-w-xs">
                                                <p className="av-mono text-[10px] tracking-[0.15em] uppercase text-[#8A8072]">
                                                    Diagnosis
                                                </p>
                                                <p className="text-sm font-medium text-[#2B2620] mt-1">
                                                    {record.diagnosis}
                                                </p>
                                            </div>

                                            {/* Treatment */}
                                            <div className="lg:max-w-xs">
                                                <p className="av-mono text-[10px] tracking-[0.15em] uppercase text-[#8A8072]">
                                                    Treatment
                                                </p>
                                                <p className="text-sm text-[#6B6255] mt-1">
                                                    {record.treatment}
                                                </p>
                                            </div>

                                            {/* Visit date */}
                                            <div className="lg:text-right">
                                                <p className="av-mono text-[10px] tracking-[0.15em] uppercase text-[#8A8072]">
                                                    Visit Date
                                                </p>
                                                <p className="av-serif text-lg text-[#1F3B2C] mt-1">
                                                    {formatDate(record.visit_date)}
                                                </p>
                                            </div>

                                        </div>

                                        {/* Medicine / Remarks */}
                                        <div className="mt-5 pt-4 border-t border-[#DED7C9] flex flex-col sm:flex-row gap-4 text-sm">
                                            <div>
                                                <span className="av-mono text-[9px] uppercase tracking-wider text-[#8A8072]">
                                                    Medicine
                                                </span>
                                                <p className="text-[#6B6255] mt-1">
                                                    {record.medicine || "—"}
                                                </p>
                                            </div>

                                            <div className="sm:ml-8">
                                                <span className="av-mono text-[9px] uppercase tracking-wider text-[#8A8072]">
                                                    Remarks
                                                </span>
                                                <p className="text-[#6B6255] mt-1">
                                                    {record.remarks || "—"}
                                                </p>
                                            </div>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        )}

                    </div>
                </section>

            </main>

        </div>
    );
};

export default Dashboard;