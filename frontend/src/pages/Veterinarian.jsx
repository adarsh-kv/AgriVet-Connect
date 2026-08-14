import { useEffect, useState } from "react";
import API from "../services/api";

const Veterinarian = () => {
    const [veterinarians, setVeterinarians] = useState([]);
    const [livestock, setLivestock] = useState([]);
    const [requests, setRequests] = useState([]);

    const [selectedVet, setSelectedVet] = useState("");
    const [selectedLivestock, setSelectedLivestock] = useState("");
    const [reason, setReason] = useState("");

    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        let cancelled = false;

        const loadData = async () => {
            try {
                setError("");

                // Get veterinarians
                const vetResponse = await API.get("/veterinarians");

                if (cancelled) return;

                console.log("VETERINARIANS:", vetResponse.data);
                setVeterinarians(vetResponse.data);

                // Get farmer's livestock
                const livestockResponse = await API.get("/livestock");

                if (cancelled) return;

                console.log("LIVESTOCK:", livestockResponse.data);
                setLivestock(livestockResponse.data);

                // Get farmer's veterinarian requests
                const requestResponse = await API.get(
                    "/veterinarians/requests"
                );

                if (cancelled) return;

                console.log("REQUESTS:", requestResponse.data);
                setRequests(requestResponse.data);

            } catch (error) {
                if (cancelled) return;

                console.error(
                    "VETERINARIAN PAGE ERROR:",
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
                    "Failed to load veterinarian data"
                );

            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            cancelled = true;
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!selectedVet) {
            setError("Please select a veterinarian.");
            return;
        }

        if (!selectedLivestock) {
            setError("Please select livestock.");
            return;
        }

        if (!reason.trim()) {
            setError("Please enter a reason for the request.");
            return;
        }

        try {
            setSending(true);

            const response = await API.post(
                "/veterinarians/requests",
                {
                    veterinarian_id: Number(selectedVet),
                    livestock_id: Number(selectedLivestock),
                    reason: reason.trim()
                }
            );

            console.log(
                "REQUEST CREATED:",
                response.data
            );

            setSuccess(
                response.data.message ||
                "Veterinarian request sent successfully."
            );

            // Clear form
            setSelectedVet("");
            setSelectedLivestock("");
            setReason("");

            // Refresh request history
            const requestResponse = await API.get(
                "/veterinarians/requests"
            );

            setRequests(requestResponse.data);

        } catch (error) {
            console.error(
                "REQUEST ERROR:",
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
                "Failed to send veterinarian request"
            );

        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#F6F1E4]">

                <div className="h-8 w-8 rounded-full border-2 border-[#DED7C9] border-t-[#1F3B2C] animate-spin" />

                <p className="text-[11px] tracking-[0.2em] uppercase text-[#8A8072]">
                    Loading veterinarians
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
                        Veterinarian
                    </h1>

                    <p className="text-sm text-[#8A8072] mt-3">
                        Choose a veterinarian and request
                        assistance for your livestock.
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

                {success && (
                    <div className="mb-6 border-l-2 border-[#1F3B2C] bg-[#1F3B2C]/[0.06] px-5 py-4">

                        <p className="text-[10px] tracking-[0.15em] uppercase text-[#1F3B2C] mb-1">
                            Success
                        </p>

                        <p className="text-sm text-[#1F3B2C]">
                            {success}
                        </p>

                    </div>
                )}

                <section className="bg-white border border-[#DED7C9] rounded-sm p-7 mb-10">

                    <div className="mb-7">

                        <p className="text-[10px] tracking-[0.2em] uppercase text-[#A8452F] mb-2">
                            Veterinary Request
                        </p>

                        <h2 className="text-2xl font-medium text-[#2B2620]">
                            Request a Veterinarian
                        </h2>

                    </div>


                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >

                        {/* Veterinarian */}

                        <div>

                            <label className="block text-[10px] tracking-[0.15em] uppercase text-[#8A8072] mb-2">
                                Veterinarian
                            </label>

                            <select
                                value={selectedVet}
                                onChange={(e) =>
                                    setSelectedVet(e.target.value)
                                }
                                className="w-full border border-[#DED7C9] rounded-sm px-4 py-3 bg-[#F6F1E4] text-[#2B2620] outline-none focus:border-[#1F3B2C]"
                            >

                                <option value="">
                                    Select veterinarian
                                </option>

                                {veterinarians.map((vet) => (
                                    <option
                                        key={vet.user_id}
                                        value={vet.user_id}
                                    >
                                        {vet.full_name}
                                    </option>
                                ))}

                            </select>

                        </div>


                        {/* Livestock */}

                        <div>

                            <label className="block text-[10px] tracking-[0.15em] uppercase text-[#8A8072] mb-2">
                                Livestock
                            </label>

                            <select
                                value={selectedLivestock}
                                onChange={(e) =>
                                    setSelectedLivestock(e.target.value)
                                }
                                className="w-full border border-[#DED7C9] rounded-sm px-4 py-3 bg-[#F6F1E4] text-[#2B2620] outline-none focus:border-[#1F3B2C]"
                            >

                                <option value="">
                                    Select livestock
                                </option>

                                {livestock.map((animal) => (
                                    <option
                                        key={animal.livestock_id}
                                        value={animal.livestock_id}
                                    >
                                        {animal.animal_name || "Unnamed"}
                                        {" — "}
                                        {animal.tag_number}
                                    </option>
                                ))}

                            </select>

                        </div>


                        {/* Reason */}

                        <div className="md:col-span-2">

                            <label className="block text-[10px] tracking-[0.15em] uppercase text-[#8A8072] mb-2">
                                Reason for Request
                            </label>

                            <textarea
                                value={reason}
                                onChange={(e) =>
                                    setReason(e.target.value)
                                }
                                placeholder="Describe the problem or reason for requesting the veterinarian..."
                                rows={4}
                                className="w-full border border-[#DED7C9] rounded-sm px-4 py-3 bg-[#F6F1E4] text-[#2B2620] outline-none focus:border-[#1F3B2C] resize-none"
                            />

                        </div>


                        {/* Submit */}

                        <div className="md:col-span-2">

                            <button
                                type="submit"
                                disabled={sending}
                                className="bg-[#1F3B2C] text-[#F6F1E4] px-6 py-3 text-sm rounded-sm hover:bg-[#2D523D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >

                                {sending
                                    ? "Sending Request..."
                                    : "Send Request"}

                            </button>

                        </div>

                    </form>

                </section>

                <section>

                    <div className="mb-5">

                        <p className="text-[11px] tracking-[0.2em] uppercase text-[#A8452F]">
                            Request History
                        </p>

                        <h2 className="text-2xl font-medium text-[#2B2620] mt-2">
                            Your Veterinarian Requests
                        </h2>

                    </div>


                    {requests.length === 0 ? (

                        <div className="bg-white border border-[#DED7C9] rounded-sm p-7">

                            <p className="text-sm text-[#8A8072]">
                                No veterinarian requests yet.
                            </p>

                        </div>

                    ) : (

                        <div className="bg-white border border-[#DED7C9] rounded-sm overflow-hidden">

                            <div className="overflow-x-auto">

                                <table className="w-full text-sm">

                                    <thead className="bg-[#1F3B2C] text-[#F6F1E4]">

                                        <tr>

                                            <th className="text-left px-6 py-4 font-medium">
                                                Veterinarian
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

                                        </tr>

                                    </thead>


                                    <tbody className="divide-y divide-[#DED7C9]">

                                        {requests.map((request) => (

                                            <tr
                                                key={request.request_id}
                                                className="hover:bg-[#F6F1E4]/50 transition-colors"
                                            >

                                                {/* Veterinarian */}

                                                <td className="px-6 py-4">

                                                    <span className="font-medium text-[#2B2620]">
                                                        {request.veterinarian_name}
                                                    </span>

                                                </td>


                                                {/* Livestock */}

                                                <td className="px-6 py-4">

                                                    <div className="text-[#2B2620]">
                                                        {request.animal_name}
                                                    </div>

                                                    <div className="text-[11px] text-[#8A8072] mt-1">
                                                        {request.tag_number}
                                                    </div>

                                                </td>


                                                {/* Reason */}

                                                <td className="px-6 py-4 text-[#6B6255] max-w-xs">
                                                    {request.reason || "—"}
                                                </td>


                                                {/* Status */}

                                                <td className="px-6 py-4">

                                                    <span
                                                        className={`inline-block px-3 py-1 text-[10px] uppercase tracking-wider ${
                                                            request.status === "ACCEPTED"
                                                                ? "bg-[#1F3B2C]/10 text-[#1F3B2C]"
                                                                : request.status === "REJECTED"
                                                                ? "bg-[#A8452F]/10 text-[#A8452F]"
                                                                : "bg-[#D9A441]/10 text-[#8A651C]"
                                                        }`}
                                                    >
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

                </section>

            </main>

        </div>
    );
};

export default Veterinarian;