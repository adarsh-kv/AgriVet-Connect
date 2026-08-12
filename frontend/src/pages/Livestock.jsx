import { useEffect, useState } from "react";
import API from "../services/api";

const RowAvatar = ({ children }) => (
    <div className="w-9 h-9 rounded-full bg-[#1F3B2C] flex items-center justify-center shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" className="text-[#D9A441]" aria-hidden="true">
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

const sharedStyles = (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        .av-serif { font-family: 'Fraunces', serif; }
        .av-mono { font-family: 'JetBrains Mono', monospace; }
        body { font-family: 'Inter', sans-serif; }

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

        @keyframes av-spin { to { transform: rotate(360deg); } }
        .av-spin { animation: av-spin 1s linear infinite; }

        @media (prefers-reduced-motion: reduce) {
            .av-spin { animation: none; }
        }
    `}</style>
);

const EMPTY_FORM = {
    tag_number: "",
    animal_name: "",
    species: "",
    breed: "",
    weight: ""
};

const Livestock = () => {
    const [livestock, setLivestock] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);

    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleEdit = (animal) => {
    setEditingId(animal.livestock_id);

    setFormData({
        tag_number: animal.tag_number || "",
        animal_name: animal.animal_name || "",
        species: animal.species || "",
        breed: animal.breed || "",
        weight: animal.weight || ""
        });

        setShowForm(true);
    };

    const handleDelete = async (livestockId) => {
    const confirmed = window.confirm(
        "Are you sure you want to delete this animal?"
    );

    if (!confirmed) return;

    try {
        await API.delete(`/livestock/${livestockId}`);

        // Refresh the list from backend
        const updatedResponse = await API.get("/livestock");
        setLivestock(updatedResponse.data);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to delete livestock"
            );
        }
    };

    const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setFormError("");

    try {
        if (editingId) {
            await API.put(`/livestock/${editingId}`, {
                ...formData,
                weight: formData.weight
                    ? Number(formData.weight)
                    : null
            });
        } else {
            await API.post("/livestock", {
                ...formData,
                weight: formData.weight
                    ? Number(formData.weight)
                    : null
            });
        }

        // Get latest data from backend
        const updatedResponse = await API.get("/livestock");
        setLivestock(updatedResponse.data);

        setFormData(EMPTY_FORM);
        setEditingId(null);
        setShowForm(false);

    } catch (error) {
        setFormError(
            error.response?.data?.message ||
            `Failed to ${editingId ? "update" : "add"} livestock`
        );
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        const fetchLivestock = async () => {
            try {
                const response = await API.get("/livestock");
                setLivestock(response.data);
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Failed to load livestock"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchLivestock();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#F6F1E4] font-[Inter,sans-serif]">
                {sharedStyles}
                <div className="av-spin h-8 w-8 rounded-full border-2 border-[#DED7C9] border-t-[#1F3B2C]" />
                <p className="av-mono text-[11px] tracking-[0.2em] uppercase text-[#8A8072]">
                    Loading livestock
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
                        Livestock error
                    </p>
                    <p className="text-[14px] text-[#A8452F]">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F6F1E4] font-[Inter,sans-serif]">
            {sharedStyles}

            <main className="max-w-6xl mx-auto px-6 py-12">

                {/* Heading */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
                    <div>
                        <p className="av-mono text-[11px] tracking-[0.25em] uppercase text-[#A8452F] mb-3">
                            Farm Management
                        </p>

                        <h1 className="av-serif text-[2.1rem] font-medium text-[#2B2620]">
                            Livestock
                        </h1>

                        <p className="av-mono text-[11px] tracking-[0.12em] uppercase text-[#8A8072] mt-3">
                            {livestock.length}{" "}
                            {livestock.length === 1 ? "animal" : "animals"} registered
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowForm(true)}
                        className="av-mono text-[10px] tracking-[0.15em] uppercase bg-[#1F3B2C] text-[#F6F1E4] px-5 py-3 rounded-sm hover:bg-[#2C4A37] transition-colors"
                    >
                        + Add Livestock
                    </button>
                </div>

                {/* Add Livestock form */}
                {showForm && (
                    <div className="relative bg-white border border-[#DED7C9] rounded-sm p-7 mb-8 overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#1F3B2C]" />

                        <div className="mb-6">
                            <p className="av-mono text-[10px] tracking-[0.2em] uppercase text-[#A8452F]">
                                {editingId ? "Update Animal" : "New Animal"}
                            </p>

                            <h2 className="av-serif text-2xl text-[#2B2620] mt-2">
                                {editingId ? "Edit Livestock" : "Register Livestock"}
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
                                    Tag Number
                                </label>

                                <input
                                    name="tag_number"
                                    value={formData.tag_number}
                                    onChange={handleChange}
                                    placeholder="AGV002"
                                    required
                                    className="av-input w-full text-[#2B2620] placeholder:text-[#B4AA9B]"
                                />
                            </div>

                            <div>
                                <label className="block av-mono text-[10px] uppercase tracking-wider text-[#8A8072] mb-2">
                                    Animal Name
                                </label>

                                <input
                                    name="animal_name"
                                    value={formData.animal_name}
                                    onChange={handleChange}
                                    placeholder="Lakshmi"
                                    required
                                    className="av-input w-full text-[#2B2620] placeholder:text-[#B4AA9B]"
                                />
                            </div>

                            <div>
                                <label className="block av-mono text-[10px] uppercase tracking-wider text-[#8A8072] mb-2">
                                    Species
                                </label>

                                <input
                                    name="species"
                                    value={formData.species}
                                    onChange={handleChange}
                                    placeholder="Cow"
                                    required
                                    className="av-input w-full text-[#2B2620] placeholder:text-[#B4AA9B]"
                                />
                            </div>

                            <div>
                                <label className="block av-mono text-[10px] uppercase tracking-wider text-[#8A8072] mb-2">
                                    Breed
                                </label>

                                <input
                                    name="breed"
                                    value={formData.breed}
                                    onChange={handleChange}
                                    placeholder="Jersey"
                                    className="av-input w-full text-[#2B2620] placeholder:text-[#B4AA9B]"
                                />
                            </div>

                            <div>
                                <label className="block av-mono text-[10px] uppercase tracking-wider text-[#8A8072] mb-2">
                                    Weight (kg)
                                </label>

                                <input
                                    type="number"
                                    name="weight"
                                    value={formData.weight}
                                    onChange={handleChange}
                                    placeholder="420"
                                    min="0"
                                    className="av-input w-full text-[#2B2620] placeholder:text-[#B4AA9B]"
                                />
                            </div>

                            <div className="md:col-span-2 flex gap-3 justify-end pt-2">

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingId(null);
                                        setFormData(EMPTY_FORM);
                                        setFormError("");
                                    }}
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
                                            : "Adding..."
                                        : editingId
                                            ? "Update Animal"
                                            : "Add Animal"
                                    }
                                </button>

                            </div>

                        </form>

                    </div>
                )}

                {/* Empty state */}
                {livestock.length === 0 ? (

                    <div className="bg-white border border-[#DED7C9] rounded-sm p-8">
                        <p className="text-[#6B6255]">
                            No livestock registered.
                        </p>
                    </div>

                ) : (

                    /* Livestock table */
                    <div className="bg-white border border-[#DED7C9] rounded-sm overflow-hidden">

                        <div className="overflow-x-auto">

                            <table className="w-full text-sm">

                                <thead className="bg-[#1F3B2C] text-[#F6F1E4]">

                                    <tr>
                                        <th className="text-left px-6 py-4 av-mono text-[10px] tracking-[0.15em] uppercase font-medium text-[#D8E2D9]">
                                            Tag Number
                                        </th>

                                        <th className="text-left px-6 py-4 av-mono text-[10px] tracking-[0.15em] uppercase font-medium text-[#D8E2D9]">
                                            Animal
                                        </th>

                                        <th className="text-left px-6 py-4 av-mono text-[10px] tracking-[0.15em] uppercase font-medium text-[#D8E2D9]">
                                            Species
                                        </th>

                                        <th className="text-left px-6 py-4 av-mono text-[10px] tracking-[0.15em] uppercase font-medium text-[#D8E2D9]">
                                            Breed
                                        </th>

                                        <th className="text-left px-6 py-4 av-mono text-[10px] tracking-[0.15em] uppercase font-medium text-[#D8E2D9]">
                                            Weight
                                        </th>
                                        <th className="text-left px-6 py-4 av-mono text-[10px] tracking-[0.15em] uppercase font-medium text-[#D8E2D9]">
                                            Actions
                                        </th>
                                    </tr>

                                </thead>

                                <tbody className="divide-y divide-[#DED7C9]">

                                    {livestock.map((animal) => (

                                        <tr
                                            key={animal.livestock_id}
                                            className="hover:bg-[#F6F1E4]/50 transition-colors"
                                        >

                                            <td className="px-6 py-4 av-mono text-xs text-[#6B6255]">
                                                {animal.tag_number}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <RowAvatar>
                                                        <TagIcon />
                                                    </RowAvatar>
                                                    <span className="font-medium text-[#2B2620]">
                                                        {animal.animal_name}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="inline-block px-2.5 py-1 bg-[#D9A441]/10 text-[#8A651C] av-mono text-[10px] uppercase tracking-wider">
                                                    {animal.species}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-[#6B6255]">
                                                {animal.breed || "—"}
                                            </td>

                                            <td className="px-6 py-4 text-[#6B6255]">
                                                {animal.weight
                                                    ? `${animal.weight} kg`
                                                    : "—"}
                                            </td>
                                            
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">

                                                    <button
                                                        type="button"
                                                        onClick={() => handleEdit(animal)}
                                                        className="text-[#1F3B2C] av-mono text-[10px] uppercase tracking-wider hover:text-[#D9A441] transition-colors"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(animal.livestock_id)}
                                                        className="text-[#A8452F] av-mono text-[10px] uppercase tracking-wider hover:opacity-70 transition-opacity"
                                                    >
                                                        Delete
                                                    </button>

                                                </div>
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

export default Livestock;