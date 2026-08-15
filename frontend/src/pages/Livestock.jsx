import { useEffect, useState } from "react";
import API from "../services/api";

const RowAvatar = ({ children }) => (
    <div className="w-9 h-9 rounded-full bg-[#1F3B2C] flex items-center justify-center shrink-0">
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            className="text-[#D9A441]"
            aria-hidden="true"
        >
            {children}
        </svg>
    </div>
);

const TagIcon = () => (
    <path
        d="M4 17c0-3.5 2.5-6 6-6h4c3.5 0 6 2.5 6 6M9 11V7a3 3 0 013-3 3 3 0 013 3v4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
    />
);

const EditIcon = () => (
    <path
        d="M14.5 5.5l4 4L8 20H4v-4L14.5 5.5z M13 7l4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
    />
);

const DeleteIcon = () => (
    <path
        d="M5 7h14M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m2 0-.8 12.1a2 2 0 01-2 1.9H8.8a2 2 0 01-2-1.9L6 7h12z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
    />
);

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
    farm_id: "",
    tag_number: "",
    animal_name: "",
    species: "",
    breed: "",
    gender: "",
    date_of_birth: "",
    weight: "",
    health_status: ""
};

const Livestock = () => {
    const [livestock, setLivestock] = useState([]);
    const [farms, setFarms] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState(EMPTY_FORM);

    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData((previous) => ({
            ...previous,
            [e.target.name]: e.target.value
        }));
    };

    const handleEdit = (animal) => {
        setEditingId(animal.livestock_id);

        setFormData({
            farm_id: animal.farm_id || "",
            tag_number: animal.tag_number || "",
            animal_name: animal.animal_name || "",
            species: animal.species || "",
            breed: animal.breed || "",
            gender: animal.gender || "",
            date_of_birth: animal.date_of_birth
                ? String(animal.date_of_birth).split("T")[0]
                : "",
            weight: animal.weight || "",
            health_status: animal.health_status || ""
        });

        setFormError("");
        setShowForm(true);
    };

    const handleDelete = async (livestockId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this animal?"
        );

        if (!confirmed) return;

        try {
            await API.delete(`/livestock/${livestockId}`);

            const response = await API.get("/livestock");

            setLivestock(response.data);
            setError("");
        } catch (error) {
            console.error("DELETE LIVESTOCK ERROR:", error);

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

        if (!formData.farm_id) {
            setFormError("Please select a farm.");
            setSubmitting(false);
            return;
        }

        if (!formData.tag_number || !formData.species) {
            setFormError("Tag Number and Species are required.");
            setSubmitting(false);
            return;
        }

        try {
            const data = {
                farm_id: Number(formData.farm_id),
                tag_number: formData.tag_number,
                animal_name: formData.animal_name || null,
                species: formData.species,
                breed: formData.breed || null,
                gender: formData.gender || null,
                date_of_birth: formData.date_of_birth || null,
                weight: formData.weight
                    ? Number(formData.weight)
                    : null,
                health_status: formData.health_status || null
            };

            if (editingId) {
                await API.put(
                    `/livestock/${editingId}`,
                    data
                );
            } else {
                await API.post(
                    "/livestock",
                    data
                );
            }

            const updatedResponse = await API.get(
                "/livestock"
            );

            setLivestock(updatedResponse.data);

            setFormData(EMPTY_FORM);
            setEditingId(null);
            setShowForm(false);
            setFormError("");
            setError("");
        } catch (error) {
            console.error(
                "LIVESTOCK SAVE ERROR:",
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

            setFormError(
                error.response?.data?.message ||
                `Failed to ${
                    editingId
                        ? "update"
                        : "add"
                } livestock`
            );
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        let cancelled = false;

        const fetchData = async () => {
            try {
                setLoading(true);
                setError("");

                const [livestockResponse, farmsResponse] =
                    await Promise.all([
                        API.get("/livestock"),
                        API.get("/farms")
                    ]);

                if (cancelled) return;

                setLivestock(
                    livestockResponse.data
                );

                setFarms(
                    farmsResponse.data
                );
            } catch (error) {
                if (cancelled) return;

                console.error(
                    "LIVESTOCK/FARMS ERROR:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Failed to load livestock and farms"
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            cancelled = true;
        };
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

                    <p className="text-[14px] text-[#A8452F]">
                        {error}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F6F1E4] font-[Inter,sans-serif]">
            {sharedStyles}

            <main className="max-w-6xl mx-auto px-6 py-12">

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
                            {livestock.length === 1
                                ? "animal"
                                : "animals"}{" "}
                            registered
                        </p>
                    </div>

                    <button
                        type="button"
                        disabled={farms.length === 0}
                        onClick={() => {
                            setEditingId(null);
                            setFormData(EMPTY_FORM);
                            setFormError("");
                            setShowForm(true);
                        }}
                        className="av-mono text-[10px] tracking-[0.15em] uppercase bg-[#1F3B2C] text-[#F6F1E4] px-5 py-3 rounded-sm hover:bg-[#2C4A37] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        + Add Livestock
                    </button>
                </div>

                {farms.length === 0 && (
                    <div className="mb-8 border-l-2 border-[#D9A441] bg-[#D9A441]/[0.08] px-5 py-4">
                        <p className="av-mono text-[10px] tracking-[0.15em] uppercase text-[#8A651C] mb-1">
                            Farm required
                        </p>

                        <p className="text-sm text-[#6B6255]">
                            You need to create a farm before adding livestock.
                        </p>
                    </div>
                )}

                {showForm && (
                    <div className="relative bg-white border border-[#DED7C9] rounded-sm p-7 mb-8 overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#1F3B2C]" />

                        <div className="mb-6">
                            <p className="av-mono text-[10px] tracking-[0.2em] uppercase text-[#A8452F]">
                                {editingId
                                    ? "Update Animal"
                                    : "New Animal"}
                            </p>

                            <h2 className="av-serif text-2xl text-[#2B2620] mt-2">
                                {editingId
                                    ? "Edit Livestock"
                                    : "Register Livestock"}
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

                            <div className="md:col-span-2">
                                <label className="block av-mono text-[10px] uppercase tracking-wider text-[#8A8072] mb-2">
                                    Farm
                                </label>

                                <select
                                    name="farm_id"
                                    value={formData.farm_id}
                                    onChange={handleChange}
                                    required
                                    className="av-input w-full bg-white text-[#2B2620]"
                                >
                                    <option value="">
                                        Select farm
                                    </option>

                                    {farms.map((farm) => (
                                        <option
                                            key={farm.farm_id}
                                            value={farm.farm_id}
                                        >
                                            {farm.farm_name}
                                            {farm.farm_type
                                                ? ` — ${farm.farm_type}`
                                                : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

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
                                    placeholder="Cow / Buffalo / Goat / Chicken"
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
                                    Gender
                                </label>

                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="av-input w-full bg-white text-[#2B2620]"
                                >
                                    <option value="">
                                        Select gender
                                    </option>

                                    <option value="Male">
                                        Male
                                    </option>

                                    <option value="Female">
                                        Female
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className="block av-mono text-[10px] uppercase tracking-wider text-[#8A8072] mb-2">
                                    Date of Birth
                                </label>

                                <input
                                    type="date"
                                    name="date_of_birth"
                                    value={formData.date_of_birth}
                                    onChange={handleChange}
                                    className="av-input w-full text-[#2B2620]"
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
                                    step="0.01"
                                    className="av-input w-full text-[#2B2620] placeholder:text-[#B4AA9B]"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block av-mono text-[10px] uppercase tracking-wider text-[#8A8072] mb-2">
                                    Health Status
                                </label>

                                <input
                                    name="health_status"
                                    value={formData.health_status}
                                    onChange={handleChange}
                                    placeholder="Healthy"
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
                                    disabled={
                                        submitting ||
                                        farms.length === 0
                                    }
                                    className="av-mono text-[10px] uppercase tracking-wider px-5 py-3 bg-[#1F3B2C] text-[#F6F1E4] rounded-sm hover:bg-[#2C4A37] disabled:opacity-50 transition-colors"
                                >
                                    {submitting
                                        ? editingId
                                            ? "Updating…"
                                            : "Adding…"
                                        : editingId
                                            ? "Update Animal"
                                            : "Add Animal"}
                                </button>
                            </div>

                        </form>
                    </div>
                )}

                {livestock.length === 0 ? (
                    <div className="bg-white border border-[#DED7C9] rounded-sm p-8">
                        <p className="text-[#6B6255]">
                            No livestock registered.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white border border-[#DED7C9] rounded-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-[#1F3B2C] text-[#F6F1E4]">
                                    <tr>
                                        <th className="text-left px-6 py-4 av-mono text-[10px] tracking-[0.15em] uppercase font-medium text-[#D8E2D9]">
                                            Farm
                                        </th>

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

                                        <th className="text-right px-6 py-4 av-mono text-[10px] tracking-[0.15em] uppercase font-medium text-[#D8E2D9]">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-[#DED7C9]">
                                    {livestock.map((animal) => {
                                        const farm = farms.find(
                                            (item) =>
                                                Number(item.farm_id) ===
                                                Number(animal.farm_id)
                                        );

                                        return (
                                            <tr
                                                key={animal.livestock_id}
                                                className="hover:bg-[#F6F1E4]/50 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-[#2B2620]">
                                                        {farm?.farm_name ||
                                                            animal.farm_name ||
                                                            "—"}
                                                    </div>

                                                    {farm?.farm_type && (
                                                        <div className="text-[10px] av-mono uppercase tracking-wider text-[#8A8072] mt-1">
                                                            {farm.farm_type}
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 av-mono text-xs text-[#6B6255]">
                                                    {animal.tag_number}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <RowAvatar>
                                                            <TagIcon />
                                                        </RowAvatar>

                                                        <span className="font-medium text-[#2B2620]">
                                                            {animal.animal_name ||
                                                                "Unnamed"}
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
                                                    <div className="flex items-center justify-end gap-4">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    animal
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-1.5 av-mono text-[10px] uppercase tracking-wider text-[#6B6255] hover:text-[#1F3B2C] transition-colors"
                                                        >
                                                            <svg
                                                                width="13"
                                                                height="13"
                                                                viewBox="0 0 24 24"
                                                                aria-hidden="true"
                                                            >
                                                                <EditIcon />
                                                            </svg>

                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    animal.livestock_id
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-1.5 av-mono text-[10px] uppercase tracking-wider text-[#6B6255] hover:text-[#A8452F] transition-colors"
                                                        >
                                                            <svg
                                                                width="13"
                                                                height="13"
                                                                viewBox="0 0 24 24"
                                                                aria-hidden="true"
                                                            >
                                                                <DeleteIcon />
                                                            </svg>

                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
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