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

        @media (prefers-reduced-motion: reduce) {
            .av-spin {
                animation: none;
            }
        }
    `}</style>
);

const FeedIcon = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        aria-hidden="true"
    >
        <path
            d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V9H6v10zM19 5h-3.5l-1-1h-5l-1 1H5v2h14V5z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
        />
    </svg>
);

const EditIcon = () => (
    <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        aria-hidden="true"
    >
        <path
            d="M14.5 5.5l4 4L8 20H4v-4L14.5 5.5zM13 7l4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
        />
    </svg>
);

const DeleteIcon = () => (
    <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        aria-hidden="true"
    >
        <path
            d="M5 7h14M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m2 0-.8 12.1a2 2 0 01-2 1.9H8.8a2 2 0 01-2-1.9L6 7h12z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
        />
    </svg>
);

const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

const EMPTY_FORM = {
    livestock_id: "",
    feed_type: "",
    quantity: "",
    unit: "kg",
    feeding_date: getTodayString(),
    remarks: ""
};

const ALLOWED_UNITS = ["kg", "g", "lbs", "liters", "bales", "bundles"];

const Feed = () => {
    const [feedRecords, setFeedRecords] = useState([]);
    const [livestockList, setLivestockList] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [formError, setFormError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Load initial data: feed records and farmer's livestock
    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                setError("");
                const [feedRes, livestockRes] = await Promise.all([
                    API.get("/feed"),
                    API.get("/livestock")
                ]);

                if (isMounted) {
                    setFeedRecords(feedRes.data);
                    setLivestockList(livestockRes.data);
                }
            } catch (err) {
                if (isMounted) {
                    console.error("FEED DATA LOAD ERROR:", err);
                    setError(err.response?.data?.message || "Failed to load feed management data");
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleOpenAddForm = () => {
        setEditingId(null);
        setFormData({
            livestock_id: livestockList.length > 0 ? String(livestockList[0].livestock_id) : "",
            feed_type: "",
            quantity: "",
            unit: "kg",
            feeding_date: getTodayString(),
            remarks: ""
        });
        setFormError("");
        setShowForm(true);
    };

    const handleEdit = (record) => {
        setEditingId(record.feed_id);
        setFormData({
            livestock_id: String(record.livestock_id),
            feed_type: record.feed_type || "",
            quantity: String(record.quantity),
            unit: record.unit || "kg",
            feeding_date: record.feeding_date ? String(record.feeding_date).split("T")[0] : getTodayString(),
            remarks: record.remarks || ""
        });
        setFormError("");
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData(EMPTY_FORM);
        setFormError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");
        setSuccessMessage("");

        // Validation
        if (!formData.livestock_id) {
            setFormError("Please select a livestock animal.");
            return;
        }

        if (!formData.feed_type.trim()) {
            setFormError("Feed Type is required.");
            return;
        }

        const numQty = parseFloat(formData.quantity);
        if (isNaN(numQty) || numQty <= 0) {
            setFormError("Quantity must be a valid positive number greater than zero.");
            return;
        }

        if (!formData.feeding_date) {
            setFormError("Feeding Date is required.");
            return;
        }

        setSubmitting(true);

        try {
            const payload = {
                livestock_id: Number(formData.livestock_id),
                feed_type: formData.feed_type.trim(),
                quantity: numQty,
                unit: formData.unit,
                feeding_date: formData.feeding_date,
                remarks: formData.remarks.trim() || null
            };

            if (editingId) {
                await API.put(`/feed/${editingId}`, payload);
                setSuccessMessage("Feed record updated successfully.");
            } else {
                await API.post("/feed", payload);
                setSuccessMessage("Feed record added successfully.");
            }

            // Refresh feed list
            const updated = await API.get("/feed");
            setFeedRecords(updated.data);

            handleCancel();
        } catch (err) {
            console.error("FEED RECORD SAVE ERROR:", err);
            setFormError(err.response?.data?.message || "Failed to save feed record");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (feedId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this feed record? This action cannot be undone."
        );
        if (!confirmed) return;

        try {
            setError("");
            await API.delete(`/feed/${feedId}`);
            setSuccessMessage("Feed record deleted successfully.");

            const updated = await API.get("/feed");
            setFeedRecords(updated.data);
        } catch (err) {
            console.error("DELETE FEED RECORD ERROR:", err);
            setError(err.response?.data?.message || "Failed to delete feed record");
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {sharedStyles}

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <p className="av-mono text-xs uppercase tracking-[0.2em] text-[#A8452F] mb-1">
                        Nutrition & Rations
                    </p>
                    <h1 className="av-serif text-3xl font-medium text-[#2B2620]">
                        Feed Management
                    </h1>
                    <p className="text-sm text-[#8A8072] mt-1">
                        Log and monitor feeding schedules, rations, and feed intake for your livestock.
                    </p>
                </div>

                {!showForm && (
                    <button
                        type="button"
                        onClick={handleOpenAddForm}
                        className="self-start md:self-auto px-5 py-2.5 bg-[#1F3B2C] text-[#F6F1E4] hover:bg-[#2C4A37] text-xs uppercase tracking-[0.15em] font-medium rounded-xs transition flex items-center gap-2"
                    >
                        <FeedIcon />
                        Add Feed Record
                    </button>
                )}
            </div>

            {/* ALERT BANNERS */}
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

            {/* ADD / EDIT FORM */}
            {showForm && (
                <section className="bg-white border border-[#DED7C9] rounded-sm p-7 mb-10 shadow-xs">
                    <div className="mb-6">
                        <p className="text-[10px] tracking-[0.2em] uppercase text-[#A8452F] mb-1">
                            {editingId ? "Modify Entry" : "New Ration"}
                        </p>
                        <h2 className="av-serif text-2xl font-medium text-[#2B2620]">
                            {editingId ? "Edit Feed Record" : "Add Feed Record"}
                        </h2>
                    </div>

                    {formError && (
                        <div className="mb-6 border-l-2 border-[#A8452F] bg-[#A8452F]/[0.06] px-5 py-3">
                            <p className="text-xs text-[#A8452F] font-medium">{formError}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {/* LIVESTOCK SELECT */}
                            <div>
                                <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-2">
                                    Livestock *
                                </label>
                                <select
                                    name="livestock_id"
                                    value={formData.livestock_id}
                                    onChange={handleChange}
                                    className="av-input w-full text-sm text-[#2B2620] bg-white"
                                    required
                                >
                                    <option value="">Select an animal</option>
                                    {livestockList.map((animal) => {
                                        const displayName = animal.animal_name
                                            ? `${animal.animal_name} (${animal.tag_number})`
                                            : animal.tag_number;
                                        return (
                                            <option key={animal.livestock_id} value={animal.livestock_id}>
                                                {displayName} — {animal.species}
                                            </option>
                                        );
                                    })}
                                </select>
                                {livestockList.length === 0 && (
                                    <p className="text-[11px] text-[#A8452F] mt-1">
                                        No livestock registered yet. Please add livestock first.
                                    </p>
                                )}
                            </div>

                            {/* FEED TYPE */}
                            <div>
                                <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-2">
                                    Feed Type *
                                </label>
                                <input
                                    type="text"
                                    name="feed_type"
                                    value={formData.feed_type}
                                    onChange={handleChange}
                                    placeholder="e.g. Napier Grass, Silage, Hay, Corn Mash"
                                    className="av-input w-full text-sm text-[#2B2620] placeholder:text-[#B4AA9B]"
                                    required
                                />
                            </div>

                            {/* FEEDING DATE */}
                            <div>
                                <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-2">
                                    Feeding Date *
                                </label>
                                <input
                                    type="date"
                                    name="feeding_date"
                                    value={formData.feeding_date}
                                    onChange={handleChange}
                                    className="av-input w-full text-sm text-[#2B2620]"
                                    required
                                />
                            </div>

                            {/* QUANTITY */}
                            <div>
                                <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-2">
                                    Quantity *
                                </label>
                                <input
                                    type="number"
                                    name="quantity"
                                    step="0.01"
                                    min="0.01"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    placeholder="e.g. 12.5"
                                    className="av-input w-full text-sm text-[#2B2620] placeholder:text-[#B4AA9B]"
                                    required
                                />
                            </div>

                            {/* UNIT */}
                            <div>
                                <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-2">
                                    Unit *
                                </label>
                                <select
                                    name="unit"
                                    value={formData.unit}
                                    onChange={handleChange}
                                    className="av-input w-full text-sm text-[#2B2620] bg-white"
                                    required
                                >
                                    {ALLOWED_UNITS.map((u) => (
                                        <option key={u} value={u}>
                                            {u}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* REMARKS */}
                            <div className="lg:col-span-3">
                                <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-2">
                                    Remarks / Notes (Optional)
                                </label>
                                <input
                                    type="text"
                                    name="remarks"
                                    maxLength={255}
                                    value={formData.remarks}
                                    onChange={handleChange}
                                    placeholder="e.g. Morning ration, enriched with mineral supplements"
                                    className="av-input w-full text-sm text-[#2B2620] placeholder:text-[#B4AA9B]"
                                />
                            </div>
                        </div>

                        {/* BUTTONS */}
                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-2.5 bg-[#1F3B2C] text-[#F6F1E4] hover:bg-[#2C4A37] text-xs uppercase tracking-[0.15em] font-medium rounded-xs transition disabled:opacity-50"
                            >
                                {submitting
                                    ? "Saving..."
                                    : editingId
                                    ? "Update Feed Record"
                                    : "Save Feed Record"}
                            </button>

                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-5 py-2.5 border border-[#8A8072] text-[#5F574D] hover:bg-[#F6F1E4] text-xs uppercase tracking-[0.15em] font-medium rounded-xs transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {/* FEED HISTORY SECTION */}
            <section className="bg-white border border-[#DED7C9] rounded-sm overflow-hidden shadow-xs">
                <div className="p-6 border-b border-[#EEE8DC] flex items-center justify-between">
                    <div>
                        <h2 className="av-serif text-xl font-medium text-[#2B2620]">
                            Feed History
                        </h2>
                        <p className="text-xs text-[#8A8072] mt-0.5">
                            Total Records: {feedRecords.length}
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-sm text-[#8A8072] flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-[#1F3B2C] border-t-transparent rounded-full av-spin" />
                        Loading feed records...
                    </div>
                ) : feedRecords.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-base text-[#2B2620] font-medium mb-1">
                            No feed records found
                        </p>
                        <p className="text-sm text-[#8A8072] mb-6">
                            Start tracking nutrition by adding the first feeding record for your animals.
                        </p>
                        {!showForm && (
                            <button
                                type="button"
                                onClick={handleOpenAddForm}
                                className="px-5 py-2.5 bg-[#1F3B2C] text-[#F6F1E4] hover:bg-[#2C4A37] text-xs uppercase tracking-[0.15em] font-medium rounded-xs transition"
                            >
                                Add First Feed Record
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[#EEE8DC] bg-[#F6F1E4]/50">
                                    <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072]">
                                        Animal
                                    </th>
                                    <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072]">
                                        Tag Number
                                    </th>
                                    <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072]">
                                        Species
                                    </th>
                                    <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072]">
                                        Feed Type
                                    </th>
                                    <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072]">
                                        Quantity
                                    </th>
                                    <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072]">
                                        Feeding Date
                                    </th>
                                    <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072]">
                                        Remarks
                                    </th>
                                    <th className="py-3 px-5 av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#EEE8DC]">
                                {feedRecords.map((record) => (
                                    <tr
                                        key={record.feed_id}
                                        className="hover:bg-[#F6F1E4]/30 transition-colors"
                                    >
                                        <td className="py-4 px-5 text-sm font-medium text-[#2B2620]">
                                            {record.animal_name || "Unnamed"}
                                        </td>
                                        <td className="py-4 px-5 text-xs text-[#5F574D]">
                                            <span className="av-mono px-2 py-0.5 bg-[#EEE8DC] rounded-xs">
                                                {record.tag_number}
                                            </span>
                                        </td>
                                        <td className="py-4 px-5 text-xs text-[#5F574D]">
                                            {record.species}
                                        </td>
                                        <td className="py-4 px-5 text-sm font-medium text-[#1F3B2C]">
                                            {record.feed_type}
                                        </td>
                                        <td className="py-4 px-5 text-sm text-[#2B2620] font-semibold">
                                            {record.quantity}{" "}
                                            <span className="text-xs text-[#8A8072] font-normal">
                                                {record.unit}
                                            </span>
                                        </td>
                                        <td className="py-4 px-5 text-xs text-[#5F574D]">
                                            {record.feeding_date
                                                ? String(record.feeding_date).split("T")[0]
                                                : "—"}
                                        </td>
                                        <td className="py-4 px-5 text-xs text-[#8A8072] max-w-xs truncate">
                                            {record.remarks || "—"}
                                        </td>
                                        <td className="py-4 px-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEdit(record)}
                                                    className="p-1.5 border border-[#8A8072] text-[#5F574D] hover:bg-[#1F3B2C] hover:text-[#F6F1E4] hover:border-[#1F3B2C] rounded-xs transition"
                                                    title="Edit Record"
                                                >
                                                    <EditIcon />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(record.feed_id)}
                                                    className="p-1.5 border border-red-300 text-red-700 hover:bg-red-700 hover:text-white hover:border-red-700 rounded-xs transition"
                                                    title="Delete Record"
                                                >
                                                    <DeleteIcon />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Feed;
