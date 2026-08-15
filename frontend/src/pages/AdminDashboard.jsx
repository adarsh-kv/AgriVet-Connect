import { useEffect, useState } from "react";
import API from "../services/api";

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalLivestock: 0,
        totalHealthRecords: 0,
        totalVaccinations: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const loadDashboard = async () => {
            try {
                const response = await API.get(
                    "/dashboard/stats"
                );

                if (!cancelled) {
                    console.log(
                        "ADMIN DASHBOARD:",
                        response.data
                    );

                    setStats({
                        totalLivestock:
                            response.data.totalLivestock || 0,

                        totalHealthRecords:
                            response.data.totalHealthRecords || 0,

                        totalVaccinations:
                            response.data.totalVaccinations || 0
                    });

                    setError("");
                    setLoading(false);
                }

            } catch (error) {

                if (!cancelled) {

                    console.error(
                        "ADMIN DASHBOARD ERROR:",
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
                        "Failed to load dashboard"
                    );

                    setLoading(false);
                }
            }
        };

        loadDashboard();

        return () => {
            cancelled = true;
        };

    }, []);

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F6F1E4]">

                <p className="text-sm text-[#8A8072]">
                    Loading dashboard...
                </p>

            </div>
        );
    }

    // ==========================================
    // DASHBOARD
    // ==========================================

    return (
        <div className="min-h-screen bg-[#F6F1E4] px-6 py-12">

            <main className="max-w-6xl mx-auto">

                {/* HEADER */}

                <div className="mb-10">

                    <p className="text-[11px] tracking-[0.25em] uppercase text-[#A8452F] mb-3">
                        Administration
                    </p>

                    <h1 className="text-[2.1rem] font-medium text-[#2B2620]">
                        Admin Dashboard
                    </h1>

                    <p className="text-sm text-[#8A8072] mt-3">
                        Overview of the AgriVet Connect system.
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


                {/* STATISTICS */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">


                    {/* LIVESTOCK */}

                    <div className="bg-white border border-[#DED7C9] p-6 rounded-sm">

                        <p className="text-[10px] tracking-[0.15em] uppercase text-[#8A8072]">
                            Total Livestock
                        </p>

                        <p className="text-3xl font-medium text-[#2B2620] mt-3">
                            {stats.totalLivestock}
                        </p>

                    </div>


                    {/* HEALTH RECORDS */}

                    <div className="bg-white border border-[#DED7C9] p-6 rounded-sm">

                        <p className="text-[10px] tracking-[0.15em] uppercase text-[#8A8072]">
                            Health Records
                        </p>

                        <p className="text-3xl font-medium text-[#2B2620] mt-3">
                            {stats.totalHealthRecords}
                        </p>

                    </div>


                    {/* VACCINATIONS */}

                    <div className="bg-white border border-[#DED7C9] p-6 rounded-sm">

                        <p className="text-[10px] tracking-[0.15em] uppercase text-[#8A8072]">
                            Vaccinations
                        </p>

                        <p className="text-3xl font-medium text-[#2B2620] mt-3">
                            {stats.totalVaccinations}
                        </p>

                    </div>

                </div>


                {/* ADMIN INFORMATION */}

                <div className="mt-8 bg-white border border-[#DED7C9] rounded-sm p-6">

                    <p className="text-[10px] tracking-[0.15em] uppercase text-[#8A8072] mb-3">
                        Administrator
                    </p>

                    <h2 className="text-lg font-medium text-[#2B2620]">
                        System Administration
                    </h2>

                    <p className="text-sm text-[#8A8072] mt-2">
                        Manage users, livestock, health records,
                        vaccinations and veterinarian activities.
                    </p>

                </div>

            </main>

        </div>
    );
};

export default AdminDashboard;