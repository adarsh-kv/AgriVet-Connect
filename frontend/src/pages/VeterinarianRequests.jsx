import { useEffect, useState } from "react";
import API from "../services/api";

const VeterinarianRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const loadRequests = async () => {
            try {
                const response = await API.get(
                    "/veterinarians/requests"
                );

                if (!cancelled) {
                    setRequests(response.data);
                }

            } catch (error) {
                console.error(
                    "VETERINARIAN REQUESTS ERROR:",
                    error
                );

                if (!cancelled) {
                    setError(
                        error.response?.data?.message ||
                        "Failed to load veterinarian requests"
                    );
                }

            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadRequests();

        return () => {
            cancelled = true;
        };
    }, []);


    // ==========================================
    // ACCEPT / DECLINE REQUEST
    // ==========================================

    const handleRequestUpdate = async (
        requestId,
        status
    ) => {
        try {
            setUpdatingId(requestId);

            await API.put(
                `/veterinarians/requests/${requestId}`,
                {
                    status: status
                }
            );

            // Update the request immediately
            // without refreshing the page

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

            alert(
                error.response?.data?.message ||
                "Failed to update request"
            );

        } finally {
            setUpdatingId(null);
        }
    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F6F1E4]">

                <p className="av-mono text-[11px] tracking-[0.2em] uppercase text-[#8A8072]">
                    Loading requests
                </p>

            </div>
        );
    }


    // ==========================================
    // ERROR
    // ==========================================

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F6F1E4] px-6">

                <div className="border-l-2 border-[#A8452F] bg-[#A8452F]/[0.06] px-5 py-4 max-w-md">

                    <p className="av-mono text-[10px] tracking-[0.2em] uppercase text-[#A8452F]">
                        Request error
                    </p>

                    <p className="text-sm text-[#A8452F] mt-2">
                        {error}
                    </p>

                </div>

            </div>
        );
    }


    // ==========================================
    // MAIN PAGE
    // ==========================================

    return (
        <div className="min-h-screen bg-[#F6F1E4]">

            <main className="max-w-6xl mx-auto px-6 py-12">

                {/* ==================================
                    HEADING
                ================================== */}

                <div className="mb-10">

                    <p className="av-mono text-[11px] tracking-[0.25em] uppercase text-[#A8452F] mb-3">
                        Veterinary Care
                    </p>

                    <h1 className="av-serif text-[2.1rem] font-medium text-[#2B2620]">
                        Veterinarian Requests
                    </h1>

                    <p className="text-[#6B6255] mt-3">
                        Review and respond to requests from farmers.
                    </p>

                </div>


                {/* ==================================
                    EMPTY STATE
                ================================== */}

                {requests.length === 0 ? (

                    <div className="bg-white border border-[#DED7C9] rounded-sm p-8">

                        <p className="text-[#6B6255]">
                            No veterinarian requests found.
                        </p>

                    </div>

                ) : (

                    /* ==================================
                       REQUEST TABLE
                    ================================== */

                    <div className="bg-white border border-[#DED7C9] rounded-sm overflow-hidden">

                        <div className="overflow-x-auto">

                            <table className="w-full text-sm">

                                {/* ==================================
                                    TABLE HEADER
                                ================================== */}

                                <thead className="bg-[#1F3B2C] text-[#F6F1E4]">

                                    <tr>

                                        <th className="text-left px-6 py-4 av-mono text-[10px] tracking-[0.15em] uppercase font-medium">
                                            Farmer
                                        </th>

                                        <th className="text-left px-6 py-4 av-mono text-[10px] tracking-[0.15em] uppercase font-medium">
                                            Livestock
                                        </th>

                                        <th className="text-left px-6 py-4 av-mono text-[10px] tracking-[0.15em] uppercase font-medium">
                                            Requested
                                        </th>

                                        <th className="text-left px-6 py-4 av-mono text-[10px] tracking-[0.15em] uppercase font-medium">
                                            Status
                                        </th>

                                        <th className="text-left px-6 py-4 av-mono text-[10px] tracking-[0.15em] uppercase font-medium">
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                {/* ==================================
                                    TABLE BODY
                                ================================== */}

                                <tbody className="divide-y divide-[#DED7C9]">

                                    {requests.map((request) => (

                                        <tr
                                            key={request.request_id}
                                            className="hover:bg-[#F6F1E4]/50 transition-colors"
                                        >

                                            {/* ==================================
                                                FARMER
                                            ================================== */}

                                            <td className="px-6 py-5">

                                                <p className="font-medium text-[#2B2620]">
                                                    {request.farmer_name || "—"}
                                                </p>

                                            </td>


                                            {/* ==================================
                                                LIVESTOCK
                                            ================================== */}

                                            <td className="px-6 py-5">

                                                <p className="font-medium text-[#2B2620]">
                                                    {request.animal_name || "—"}
                                                </p>

                                                <p className="text-xs text-[#8A8072] mt-1">

                                                    {request.species ||
                                                        "Species not available"
                                                    }

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

                                            </td>


                                            {/* ==================================
                                                REQUESTED DATE
                                            ================================== */}

                                            <td className="px-6 py-5 text-[#6B6255]">

                                                {request.requested_at
                                                    ? new Date(
                                                        request.requested_at
                                                    ).toLocaleDateString()
                                                    : "—"
                                                }

                                            </td>


                                            {/* ==================================
                                                STATUS
                                            ================================== */}

                                            <td className="px-6 py-5">

                                                <span
                                                    className={`
                                                        inline-block
                                                        px-2.5
                                                        py-1
                                                        av-mono
                                                        text-[10px]
                                                        uppercase
                                                        tracking-wider

                                                        ${
                                                            request.status ===
                                                            "PENDING"
                                                                ? "bg-[#D9A441]/10 text-[#8A651C]"
                                                                : request.status ===
                                                                  "ACCEPTED"
                                                                ? "bg-[#1F3B2C]/10 text-[#1F3B2C]"
                                                                : "bg-[#A8452F]/10 text-[#A8452F]"
                                                        }
                                                    `}
                                                >
                                                    {request.status}
                                                </span>

                                            </td>


                                            {/* ==================================
                                                ACTIONS
                                            ================================== */}

                                            <td className="px-6 py-5">

                                                {request.status === "PENDING" ? (

                                                    <div className="flex gap-2">

                                                        {/* ACCEPT */}

                                                        <button
                                                            onClick={() =>
                                                                handleRequestUpdate(
                                                                    request.request_id,
                                                                    "ACCEPTED"
                                                                )
                                                            }
                                                            disabled={
                                                                updatingId ===
                                                                request.request_id
                                                            }
                                                            className="px-3 py-2 bg-[#1F3B2C] text-[#F6F1E4] text-xs rounded-sm hover:bg-[#2C4A37] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >

                                                            {updatingId ===
                                                            request.request_id
                                                                ? "Updating..."
                                                                : "Accept"
                                                            }

                                                        </button>


                                                        {/* DECLINE */}

                                                        <button
                                                            onClick={() =>
                                                                handleRequestUpdate(
                                                                    request.request_id,
                                                                    "REJECTED"
                                                                )
                                                            }
                                                            disabled={
                                                                updatingId ===
                                                                request.request_id
                                                            }
                                                            className="px-3 py-2 bg-[#A8452F] text-[#F6F1E4] text-xs rounded-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                                                        >

                                                            {updatingId ===
                                                            request.request_id
                                                                ? "Updating..."
                                                                : "Decline"
                                                            }

                                                        </button>

                                                    </div>

                                                ) : (

                                                    <span className="text-xs text-[#8A8072]">
                                                        No action available
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