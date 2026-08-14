import { useEffect, useState } from "react";
import API from "../services/api";

const VeterinarianRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const loadRequests = async () => {
            try {
                const response = await API.get(
                    "/veterinarians/requests"
                );

                if (!cancelled) {
                    console.log(
                        "VETERINARIAN REQUESTS:",
                        response.data
                    );

                    setRequests(response.data);
                    setError("");
                    setLoading(false);
                }
            } catch (error) {
                if (!cancelled) {
                    console.error(
                        "FETCH REQUESTS ERROR:",
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

                    console.error(
                        "URL:",
                        error.config?.url
                    );

                    setError(
                        error.response?.data?.message ||
                        "Failed to load veterinarian requests"
                    );

                    setLoading(false);
                }
            }
        };

        loadRequests();

        return () => {
            cancelled = true;
        };
    }, []);

    const handleStatusUpdate = async (
        requestId,
        status
    ) => {
        try {
            setProcessingId(requestId);
            setError("");

            const response = await API.put(
                `/veterinarians/requests/${requestId}`,
                {
                    status: status
                }
            );

            console.log(
                "REQUEST UPDATE:",
                response.data
            );

            setRequests((currentRequests) =>
                currentRequests.map((request) =>
                    request.request_id === requestId
                        ? {
                              ...request,
                              status: status
                          }
                        : request
                )
            );

        } catch (error) {
            console.error(
                "UPDATE REQUEST ERROR:",
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

            console.error(
                "URL:",
                error.config?.url
            );

            setError(
                error.response?.data?.message ||
                "Failed to update request"
            );
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#F6F1E4]">

                <div className="h-8 w-8 rounded-full border-2 border-[#DED7C9] border-t-[#1F3B2C] animate-spin" />

                <p className="text-[11px] tracking-[0.2em] uppercase text-[#8A8072]">
                    Loading requests
                </p>

            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F6F1E4] px-6 py-12">

            <main className="max-w-6xl mx-auto">

                <div className="mb-10">

                    <p className="text-[11px] tracking-[0.25em] uppercase text-[#A8452F] mb-3">
                        Veterinary Care
                    </p>

                    <h1 className="text-[2.1rem] font-medium text-[#2B2620]">
                        Veterinarian Requests
                    </h1>

                    <p className="text-sm text-[#8A8072] mt-3">
                        Review and manage requests from farmers.
                    </p>

                </div>

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

                {requests.length === 0 ? (

                    <div className="bg-white border border-[#DED7C9] rounded-sm p-8">

                        <p className="text-sm text-[#8A8072]">
                            No veterinarian requests found.
                        </p>

                    </div>

                ) : (

                    <div className="bg-white border border-[#DED7C9] rounded-sm overflow-hidden">

                        <div className="overflow-x-auto">

                            <table className="w-full text-sm">

                                <thead className="bg-[#1F3B2C] text-[#F6F1E4]">

                                    <tr>

                                        <th className="text-left px-6 py-4 font-medium">
                                            Farmer
                                        </th>

                                        <th className="text-left px-6 py-4 font-medium">
                                            Livestock
                                        </th>

                                        <th className="text-left px-6 py-4 font-medium">
                                            Reason
                                        </th>

                                        <th className="text-left px-6 py-4 font-medium">
                                            Status
                                        </th>

                                        <th className="text-left px-6 py-4 font-medium">
                                            Action
                                        </th>

                                    </tr>

                                </thead>

                                <tbody className="divide-y divide-[#DED7C9]">

                                    {requests.map((request) => (

                                        <tr
                                            key={request.request_id}
                                            className="hover:bg-[#F6F1E4]/50 transition-colors"
                                        >

                                            <td className="px-6 py-4">

                                                <div className="font-medium text-[#2B2620]">
                                                    {request.farmer_name ||
                                                        `Farmer #${request.farmer_id}`}
                                                </div>

                                            </td>

                                            <td className="px-6 py-4">

                                                <div className="font-medium text-[#2B2620]">
                                                    {request.animal_name ||
                                                        "Unknown"}
                                                </div>

                                                <div className="text-[11px] text-[#8A8072] mt-1">
                                                    {request.tag_number ||
                                                        "—"}
                                                </div>

                                            </td>

                                            <td className="px-6 py-4 text-[#6B6255] max-w-xs">

                                                {request.reason || "—"}

                                            </td>

                                            <td className="px-6 py-4">

                                                <span
                                                    className={`inline-block px-3 py-1 text-[10px] uppercase tracking-wider ${
                                                        request.status ===
                                                        "ACCEPTED"
                                                            ? "bg-[#1F3B2C]/10 text-[#1F3B2C]"
                                                            : request.status ===
                                                              "REJECTED"
                                                            ? "bg-[#A8452F]/10 text-[#A8452F]"
                                                            : "bg-[#D9A441]/10 text-[#8A651C]"
                                                    }`}
                                                >
                                                    {request.status}
                                                </span>

                                            </td>

                                            <td className="px-6 py-4">

                                                {request.status ===
                                                "PENDING" ? (

                                                    <div className="flex gap-2">

                                                        {/* ACCEPT */}

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleStatusUpdate(
                                                                    request.request_id,
                                                                    "ACCEPTED"
                                                                )
                                                            }
                                                            disabled={
                                                                processingId ===
                                                                request.request_id
                                                            }
                                                            className="px-4 py-2 bg-[#1F3B2C] text-white text-xs rounded-sm hover:bg-[#2D523D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {processingId ===
                                                            request.request_id
                                                                ? "..."
                                                                : "Accept"}
                                                        </button>


                                                        {/* REJECT */}

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleStatusUpdate(
                                                                    request.request_id,
                                                                    "REJECTED"
                                                                )
                                                            }
                                                            disabled={
                                                                processingId ===
                                                                request.request_id
                                                            }
                                                            className="px-4 py-2 border border-[#A8452F] text-[#A8452F] text-xs rounded-sm hover:bg-[#A8452F]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            Reject
                                                        </button>

                                                    </div>

                                                ) : (

                                                    <span className="text-xs text-[#8A8072]">
                                                        Processed
                                                    </span>

                                                )}

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    </div>

                )}

            </main>

        </div>
    );
};

export default VeterinarianRequests;