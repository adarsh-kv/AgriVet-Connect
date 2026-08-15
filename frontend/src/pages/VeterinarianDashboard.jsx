import { useEffect, useState } from "react";
import API from "../services/api";

const VeterinarianDashboard = () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    const [requests, setRequests] = useState([]);
    const [healthRecords, setHealthRecords] = useState([]);
    const [vaccinations, setVaccinations] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [
                    requestsResponse,
                    healthResponse,
                    vaccinationResponse
                ] = await Promise.all([
                    API.get("/veterinarians/requests"),
                    API.get("/health"),
                    API.get("/vaccinations")
                ]);

                setRequests(requestsResponse.data);
                setHealthRecords(healthResponse.data);
                setVaccinations(vaccinationResponse.data);

            } catch (error) {
                console.error(
                    "VETERINARIAN DASHBOARD ERROR:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Failed to load veterinarian dashboard"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F6F1E4]">
                <p className="av-mono text-[11px] tracking-[0.2em] uppercase text-[#8A8072]">
                    Loading dashboard
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F6F1E4] px-6">
                <div className="border-l-2 border-[#A8452F] bg-[#A8452F]/[0.06] px-5 py-4 max-w-md">

                    <p className="av-mono text-[10px] tracking-[0.2em] uppercase text-[#A8452F]">
                        Dashboard error
                    </p>

                    <p className="text-sm text-[#A8452F] mt-2">
                        {error}
                    </p>

                </div>
            </div>
        );
    }

    const pendingRequests = requests.filter(
        (request) =>
            request.status?.toUpperCase() === "PENDING"
    ).length;

    return (
        <div className="min-h-screen bg-[#F6F1E4] px-6 py-12">

            <div className="max-w-6xl mx-auto">

                {/* Heading */}

                <div className="mb-10">

                    <p className="av-mono text-[11px] tracking-[0.25em] uppercase text-[#A8452F] mb-3">
                        Veterinarian Portal
                    </p>

                    <h1 className="av-serif text-[2.1rem] font-medium text-[#2B2620]">
                        Veterinarian Dashboard
                    </h1>

                    <p className="text-[#6B6255] mt-3">
                        Welcome, {user?.full_name || "Veterinarian"}.
                    </p>

                </div>


                {/* Statistics */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">

                    <div className="relative bg-white border border-[#DED7C9] rounded-sm p-7 overflow-hidden">

                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#1F3B2C]" />

                        <p className="av-mono text-[10px] tracking-[0.18em] uppercase text-[#8A8072]">
                            Pending Requests
                        </p>

                        <p className="av-serif text-5xl font-medium text-[#1F3B2C] mt-5">
                            {pendingRequests}
                        </p>

                        <p className="text-[12.5px] text-[#8A8072] mt-3">
                            Farmer requests awaiting action
                        </p>

                    </div>


                    <div className="relative bg-white border border-[#DED7C9] rounded-sm p-7 overflow-hidden">

                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#1F3B2C]" />

                        <p className="av-mono text-[10px] tracking-[0.18em] uppercase text-[#8A8072]">
                            Health Records
                        </p>

                        <p className="av-serif text-5xl font-medium text-[#1F3B2C] mt-5">
                            {healthRecords.length}
                        </p>

                        <p className="text-[12.5px] text-[#8A8072] mt-3">
                            Medical records available
                        </p>

                    </div>


                    <div className="relative bg-white border border-[#DED7C9] rounded-sm p-7 overflow-hidden">

                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#1F3B2C]" />

                        <p className="av-mono text-[10px] tracking-[0.18em] uppercase text-[#8A8072]">
                            Vaccinations
                        </p>

                        <p className="av-serif text-5xl font-medium text-[#1F3B2C] mt-5">
                            {vaccinations.length}
                        </p>

                        <p className="text-[12.5px] text-[#8A8072] mt-3">
                            Vaccination records
                        </p>

                    </div>

                </div>


                {/* Requests */}

                <div>

                    <div className="mb-5">

                        <p className="av-mono text-[10px] tracking-[0.2em] uppercase text-[#A8452F]">
                            Requests
                        </p>

                        <h2 className="av-serif text-2xl font-medium text-[#2B2620] mt-1">
                            Recent Farmer Requests
                        </h2>

                    </div>


                    {requests.length === 0 ? (

                        <div className="bg-white border border-[#DED7C9] rounded-sm p-7">

                            <p className="text-[#6B6255]">
                                No veterinarian requests found.
                            </p>

                        </div>

                    ) : (

                        <div className="bg-white border border-[#DED7C9] rounded-sm overflow-hidden">

                            <div className="overflow-x-auto">

                                <table className="w-full text-sm">

                                    <thead className="bg-[#1F3B2C] text-[#F6F1E4]">

                                        <tr>

                                            <th className="text-left px-6 py-4 av-mono text-[10px] tracking-[0.15em] uppercase">
                                                Farmer
                                            </th>

                                            <th className="text-left px-6 py-4 av-mono text-[10px] tracking-[0.15em] uppercase">
                                                Livestock
                                            </th>

                                            <th className="text-left px-6 py-4 av-mono text-[10px] tracking-[0.15em] uppercase">
                                                Status
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody className="divide-y divide-[#DED7C9]">

                                        {requests.slice(0, 5).map((request) => (

                                            <tr
                                                key={request.request_id}
                                                className="hover:bg-[#F6F1E4]/50 transition-colors"
                                            >

                                                <td className="px-6 py-4 text-[#2B2620]">
                                                    {request.farmer_name || "—"}
                                                </td>


                                                <td className="px-6 py-4">

                                                    <div>

                                                        <p className="font-medium text-[#2B2620]">
                                                            {request.animal_name || "—"}
                                                        </p>

                                                        <p className="text-xs text-[#8A8072] mt-1">
                                                            {request.species || "Species not available"}

                                                            {request.breed
                                                                ? ` • ${request.breed}`
                                                                : ""
                                                            }
                                                        </p>

                                                        {request.tag_number && (
                                                            <p className="av-mono text-[10px] text-[#A8452F] mt-1">
                                                                {request.tag_number}
                                                            </p>
                                                        )}

                                                    </div>

                                                </td>


                                                <td className="px-6 py-4">

                                                    <span className="inline-block px-2.5 py-1 bg-[#D9A441]/10 text-[#8A651C] av-mono text-[10px] uppercase tracking-wider">
                                                        {request.status}
                                                    </span>

                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
};

export default VeterinarianDashboard;