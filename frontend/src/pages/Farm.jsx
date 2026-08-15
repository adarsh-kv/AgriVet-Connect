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

const EMPTY_FORM = {
    farm_name: "",
    location: "",
    farm_type: "",
    description: ""
};

const FarmIcon = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        aria-hidden="true"
    >
        <path
            d="M3 21h18M5 21V10l7-6 7 6v11M9 21v-5h6v5M8 10h.01M12 10h.01M16 10h.01"
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

const Farms = () => {
    const [farms, setFarms] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [formError, setFormError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const loadFarms = async () => {
            try {
                setError("");

                const response = await API.get("/farms");

                if (!cancelled) {
                    setFarms(response.data);
                }
            } catch (error) {
                if (!cancelled) {
                    console.error("FARMS ERROR:", error);

                    setError(
                        error.response?.data?.message ||
                        "Failed to load farms"
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadFarms();

        return () => {
            cancelled = true;
        };
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const refreshFarms = async () => {
        try {
            const response = await API.get("/farms");
            setFarms(response.data);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to refresh farms"
            );
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setFormError("");
        setError("");

        if (!formData.farm_name.trim()) {
            setFormError("Farm name is required.");
            return;
        }

        try {
            setSubmitting(true);

            if (editingId) {
                await API.put(`/farms/${editingId}`, {
                    farm_name: formData.farm_name.trim(),
                    location: formData.location.trim(),
                    farm_type: formData.farm_type.trim(),
                    description: formData.description.trim()
                });
            } else {
                await API.post("/farms", {
                    farm_name: formData.farm_name.trim(),
                    location: formData.location.trim(),
                    farm_type: formData.farm_type.trim(),
                    description: formData.description.trim()
                });
            }

            await refreshFarms();

            setFormData(EMPTY_FORM);
            setEditingId(null);
            setShowForm(false);
            setFormError("");
        } catch (error) {
            console.error("FARM SAVE ERROR:", error);

            setFormError(
                error.response?.data?.message ||
                `Failed to ${editingId ? "update" : "create"} farm`
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (farm) => {
        setEditingId(farm.farm_id);

        setFormData({
            farm_name: farm.farm_name || "",
            location: farm.location || "",
            farm_type: farm.farm_type || "",
            description: farm.description || ""
        });

        setFormError("");
        setShowForm(true);
    };

    const handleDelete = async (farmId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this farm?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            await API.delete(`/farms/${farmId}`);

            await refreshFarms();
        } catch (error) {
            console.error("FARM DELETE ERROR:", error);

            setError(
                error.response?.data?.message ||
                "Failed to delete farm"
            );
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData(EMPTY_FORM);
        setFormError("");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#F6F1E4]">
                {sharedStyles}

                <div className="av-spin h-8 w-8 rounded-full border-2 border-[#DED7C9] border-t-[#1F3B2C]" />

                <p className="av-mono text-[11px] tracking-[0.2em] uppercase text-[#8A8072]">
                    Loading farms
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F6F1E4]">
            {sharedStyles}

            <main className="max-w-6xl mx-auto px-6 py-12">

                <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">

                    <div>
                        <p className="av-mono text-[11px] tracking-[0.25em] uppercase text-[#A8452F] mb-3">
                            Farm Management
                        </p>

                        <h1 className="av-serif text-[2.1rem] font-medium text-[#2B2620]">
                            My Farms
                        </h1>

                        <p className="text-sm text-[#8A8072] mt-3">
                            Manage your farms and the livestock assigned to each farm.
                        </p>

                        <p className="av-mono text-[11px] tracking-[0.12em] uppercase text-[#8A8072] mt-3">
                            {farms.length}{" "}
                            {farms.length === 1 ? "farm" : "farms"} registered
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setEditingId(null);
                            setFormData(EMPTY_FORM);
                            setFormError("");
                            setShowForm(true);
                        }}
                        className="av-mono text-[10px] tracking-[0.15em] uppercase bg-[#1F3B2C] text-[#F6F1E4] px-5 py-3 rounded-sm hover:bg-[#2C4A37] transition-colors"
                    >
                        + Add Farm
                    </button>

                </div>

                {error && (
                    <div className="mb-6 border-l-2 border-[#A8452F] bg-[#A8452F]/[0.06] px-5 py-4">

                        <p className="av-mono text-[10px] tracking-[0.15em] uppercase text-[#A8452F] mb-1">
                            Farm Error
                        </p>

                        <p className="text-sm text-[#A8452F]">
                            {error}
                        </p>

                    </div>
                )}

                {showForm && (
                    <div className="relative bg-white border border-[#DED7C9] rounded-sm p-7 mb-8 overflow-hidden">

                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#1F3B2C]" />

                        <div className="mb-6">

                            <p className="av-mono text-[10px] tracking-[0.2em] uppercase text-[#A8452F]">
                                {editingId ? "Update Farm" : "New Farm"}
                            </p>

                            <h2 className="av-serif text-2xl text-[#2B2620] mt-2">
                                {editingId
                                    ? "Edit Farm"
                                    : "Register Farm"}
                            </h2>

                        </div>

                        {formError && (
                            <div className="border-l-2 border-[#A8452F] bg-[#A8452F]/[0.06] px-4 py-3 mb-5">

                                <p className="text-sm text-[#A8452F]">
                                    {formError}
                                </p>

                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            className="grid grid-cols-1 md:grid-cols-2 gap-5"
                        >

                            <div>
                                <label className="block av-mono text-[10px] uppercase tracking-wider text-[#8A8072] mb-2">
                                    Farm Name
                                </label>

                                <input
                                    type="text"
                                    name="farm_name"
                                    value={formData.farm_name}
                                    onChange={handleChange}
                                    placeholder="Green Valley Farm"
                                    required
                                    className="av-input w-full text-[#2B2620] placeholder:text-[#B4AA9B]"
                                />
                            </div>

                            <div>
                                <label className="block av-mono text-[10px] uppercase tracking-wider text-[#8A8072] mb-2">
                                    Location
                                </label>

                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="Kochi"
                                    className="av-input w-full text-[#2B2620] placeholder:text-[#B4AA9B]"
                                />
                            </div>

                            <div>
                                <label className="block av-mono text-[10px] uppercase tracking-wider text-[#8A8072] mb-2">
                                    Farm Type
                                </label>

                                <select
                                    name="farm_type"
                                    value={formData.farm_type}
                                    onChange={handleChange}
                                    className="av-input w-full bg-white text-[#2B2620]"
                                >
                                    <option value="">
                                        Select farm type
                                    </option>

                                    <option value="Livestock">
                                        Livestock
                                    </option>

                                    <option value="Dairy">
                                        Dairy
                                    </option>

                                    <option value="Poultry">
                                        Poultry
                                    </option>

                                    <option value="Crop">
                                        Crop
                                    </option>

                                    <option value="Rice">
                                        Rice
                                    </option>

                                    <option value="Mixed">
                                        Mixed
                                    </option>

                                    <option value="Other">
                                        Other
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className="block av-mono text-[10px] uppercase tracking-wider text-[#8A8072] mb-2">
                                    Description
                                </label>

                                <input
                                    type="text"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Short description"
                                    className="av-input w-full text-[#2B2620] placeholder:text-[#B4AA9B]"
                                />
                            </div>

                            <div className="md:col-span-2 flex justify-end gap-3 pt-2">

                                <button
                                    type="button"
                                    onClick={closeForm}
                                    className="av-mono text-[10px] uppercase tracking-wider px-5 py-3 border border-[#DED7C9] text-[#6B6255] rounded-sm hover:bg-[#F6F1E4] transition-colors"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="av-mono text-[10px] uppercase tracking-wider px-5 py-3 bg-[#1F3B2C] text-[#F6F1E4] rounded-sm hover:bg-[#2C4A37] disabled:opacity-50 transition-colors"
                                >
                                    {submitting
                                        ? editingId
                                            ? "Updating..."
                                            : "Creating..."
                                        : editingId
                                            ? "Update Farm"
                                            : "Create Farm"}
                                </button>

                            </div>

                        </form>

                    </div>
                )}

                {farms.length === 0 ? (
                    <div className="bg-white border border-[#DED7C9] rounded-sm p-8">

                        <div className="flex items-center gap-4">

                            <div className="w-10 h-10 rounded-full bg-[#1F3B2C] flex items-center justify-center text-[#D9A441]">
                                <FarmIcon />
                            </div>

                            <div>
                                <h2 className="av-serif text-xl text-[#2B2620]">
                                    No farms registered
                                </h2>

                                <p className="text-sm text-[#8A8072] mt-1">
                                    Create your first farm to start organizing your livestock.
                                </p>
                            </div>

                        </div>

                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                        {farms.map((farm) => (
                            <div
                                key={farm.farm_id}
                                className="bg-white border border-[#DED7C9] rounded-sm p-6 hover:border-[#BEB5A5] transition-colors"
                            >

                                <div className="flex items-start justify-between gap-4">

                                    <div className="flex items-center gap-3">

                                        <div className="w-10 h-10 rounded-full bg-[#1F3B2C] flex items-center justify-center text-[#D9A441] shrink-0">
                                            <FarmIcon />
                                        </div>

                                        <div>
                                            <h2 className="font-medium text-[#2B2620]">
                                                {farm.farm_name}
                                            </h2>

                                            <p className="text-xs text-[#8A8072] mt-1">
                                                {farm.location || "Location not specified"}
                                            </p>
                                        </div>

                                    </div>

                                </div>

                                <div className="mt-5 pt-5 border-t border-[#DED7C9]">

                                    <div className="flex items-center justify-between mb-3">

                                        <span className="av-mono text-[10px] uppercase tracking-wider text-[#8A8072]">
                                            Farm Type
                                        </span>

                                        <span className="inline-block px-2.5 py-1 bg-[#D9A441]/10 text-[#8A651C] av-mono text-[10px] uppercase tracking-wider">
                                            {farm.farm_type || "Other"}
                                        </span>

                                    </div>

                                    <div className="flex items-center justify-between">

                                        <span className="av-mono text-[10px] uppercase tracking-wider text-[#8A8072]">
                                            Livestock
                                        </span>

                                        <span className="font-medium text-[#2B2620]">
                                            {farm.livestock_count || 0}
                                        </span>

                                    </div>

                                </div>

                                {farm.description && (
                                    <p className="text-sm text-[#6B6255] mt-4">
                                        {farm.description}
                                    </p>
                                )}

                                <div className="flex justify-end gap-4 mt-5 pt-4 border-t border-[#DED7C9]">

                                    <button
                                        type="button"
                                        onClick={() => handleEdit(farm)}
                                        className="inline-flex items-center gap-1.5 av-mono text-[10px] uppercase tracking-wider text-[#6B6255] hover:text-[#1F3B2C] transition-colors"
                                    >
                                        <EditIcon />
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleDelete(farm.farm_id)}
                                        className="inline-flex items-center gap-1.5 av-mono text-[10px] uppercase tracking-wider text-[#6B6255] hover:text-[#A8452F] transition-colors"
                                    >
                                        <DeleteIcon />
                                        Delete
                                    </button>

                                </div>

                            </div>
                        ))}

                    </div>
                )}

            </main>
        </div>
    );
};

export default Farms;