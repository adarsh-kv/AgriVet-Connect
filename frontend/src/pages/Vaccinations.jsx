import { useEffect, useState } from "react";
import API from "../services/api";

const user = JSON.parse(localStorage.getItem("user"));
const userRole = user?.role;
const Vaccinations = () => {
    const [vaccinations, setVaccinations] = useState([]);
        const EMPTY_FORM = {
        livestock_id: "",
        vaccine_name: "",
        vaccination_date: "",
        next_due_date: "",
        status: "Completed"
    };

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleEdit = (vaccination) => {
        setEditingId(vaccination.vaccination_id);

        setFormData({
            livestock_id: vaccination.livestock_id || "",
            vaccine_name: vaccination.vaccine_name || "",
            vaccination_date: vaccination.vaccination_date
                ? new Date(vaccination.vaccination_date)
                    .toISOString()
                    .split("T")[0]
                : "",
            next_due_date: vaccination.next_due_date
                ? new Date(vaccination.next_due_date)
                    .toISOString()
                    .split("T")[0]
                : "",
            status: vaccination.status || "Completed"
        });

        setShowForm(true);
    };

    const handleDelete = async (vaccinationId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this vaccination record?"
        );

        if (!confirmed) return;

        try {
            await API.delete(`/vaccinations/${vaccinationId}`);

            const updatedResponse = await API.get("/vaccinations");
            setVaccinations(updatedResponse.data);

        } catch (error) {
            setFormError(
                error.response?.data?.message ||
                "Failed to delete vaccination"
            );
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSubmitting(true);
        setFormError("");

        try {
            const payload = {
                ...formData,
                livestock_id: Number(formData.livestock_id)
            };

            if (editingId) {
                await API.put(`/vaccinations/${editingId}`, payload);
            } else {
                await API.post("/vaccinations", payload);
            }

            const updatedResponse = await API.get("/vaccinations");
            setVaccinations(updatedResponse.data);

            setFormData(EMPTY_FORM);
            setEditingId(null);
            setShowForm(false);

        } catch (error) {
            setFormError(
                error.response?.data?.message ||
                `Failed to ${editingId ? "update" : "add"} vaccination`
            );
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        const fetchVaccinations = async () => {
            try {
                const response = await API.get("/vaccinations");
                setVaccinations(response.data);
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Failed to load vaccinations"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchVaccinations();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F6F1E4]">
                <p className="av-mono text-[11px] tracking-[0.2em] uppercase text-[#8A8072]">
                    Loading vaccinations
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F6F1E4] px-6">
                <div className="border-l-2 border-[#A8452F] bg-[#A8452F]/[0.06] px-5 py-4 max-w-sm">
                    <p className="av-mono text-[10px] tracking-[0.2em] uppercase text-[#A8452F] mb-1.5">
                        Vaccination error
                    </p>

                    <p className="text-[14px] text-[#A8452F]">
                        {error}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F6F1E4]">

            <main className="max-w-6xl mx-auto px-6 py-12">

                {/* Heading */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">

                    <div>
                        <p className="av-mono text-[11px] tracking-[0.25em] uppercase text-[#A8452F] mb-3">
                            Animal Health
                        </p>

                        <h1 className="av-serif text-[2.1rem] font-medium text-[#2B2620]">
                            Vaccinations
                        </h1>

                        <p className="av-mono text-[11px] tracking-[0.12em] uppercase text-[#8A8072] mt-3">
                            {vaccinations.length}{" "}
                            {vaccinations.length === 1
                                ? "vaccination"
                                : "vaccinations"}{" "}
                            recorded
                        </p>
                    </div>

                    {userRole !== "FARMER" && (
                        <button
                            type="button"
                            onClick={() => setShowForm(true)}
                            className="bg-[#1F3B2C] text-[#F6F1E4] px-5 py-3 rounded-sm av-mono text-[10px] tracking-[0.15em] uppercase hover:bg-[#2C4A37] transition-colors"
                        >
                            + Add Vaccination
                        </button>
                    )}

                </div>

                {showForm && (
                    <div className="bg-white border border-[#DED7C9] rounded-sm p-7 mb-8">

                        <div className="mb-6">
                            <p className="av-mono text-[10px] tracking-[0.2em] uppercase text-[#A8452F]">
                                Vaccination Record
                            </p>

                            <h2 className="av-serif text-2xl text-[#2B2620] mt-2">
                                {editingId ? "Edit Vaccination" : "Add Vaccination"}
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

                            {/* Livestock ID */}
                            <div>
                                <label className="block av-mono text-[10px] uppercase tracking-wider text-[#8A8072] mb-2">
                                    Livestock ID
                                </label>

                                <input
                                    type="number"
                                    name="livestock_id"
                                    value={formData.livestock_id}
                                    onChange={handleChange}
                                    placeholder="2"
                                    required
                                    className="w-full border border-[#DED7C9] px-4 py-3 rounded-sm outline-none focus:border-[#1F3B2C]"
                                />
                            </div>

                            {/* Vaccine Name */}
                            <div>
                                <label className="block av-mono text-[10px] uppercase tracking-wider text-[#8A8072] mb-2">
                                    Vaccine Name
                                </label>

                                <input
                                    type="text"
                                    name="vaccine_name"
                                    value={formData.vaccine_name}
                                    onChange={handleChange}
                                    placeholder="FMD Vaccine"
                                    required
                                    className="w-full border border-[#DED7C9] px-4 py-3 rounded-sm outline-none focus:border-[#1F3B2C]"
                                />
                            </div>

                            {/* Vaccination Date */}
                            <div>
                                <label className="block av-mono text-[10px] uppercase tracking-wider text-[#8A8072] mb-2">
                                    Vaccination Date
                                </label>

                                <input
                                    type="date"
                                    name="vaccination_date"
                                    value={formData.vaccination_date}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-[#DED7C9] px-4 py-3 rounded-sm outline-none focus:border-[#1F3B2C]"
                                />
                            </div>

                            {/* Next Due Date */}
                            <div>
                                <label className="block av-mono text-[10px] uppercase tracking-wider text-[#8A8072] mb-2">
                                    Next Due Date
                                </label>

                                <input
                                    type="date"
                                    name="next_due_date"
                                    value={formData.next_due_date}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-[#DED7C9] px-4 py-3 rounded-sm outline-none focus:border-[#1F3B2C]"
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block av-mono text-[10px] uppercase tracking-wider text-[#8A8072] mb-2">
                                    Status
                                </label>

                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full border border-[#DED7C9] px-4 py-3 rounded-sm outline-none focus:border-[#1F3B2C] bg-white"
                                >
                                    <option value="Completed">
                                        Completed
                                    </option>

                                    <option value="Pending">
                                        Pending
                                    </option>

                                    <option value="Overdue">
                                        Overdue
                                    </option>
                                </select>
                            </div>

                            {/* Buttons */}
                            <div className="md:col-span-2 flex justify-end gap-3 pt-2">

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingId(null);
                                        setFormData(EMPTY_FORM);
                                        setFormError("");
                                    }}
                                    className="px-5 py-3 border border-[#DED7C9] text-[#6B6255] rounded-sm av-mono text-[10px] uppercase tracking-wider hover:bg-[#F6F1E4] transition-colors"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-3 bg-[#1F3B2C] text-[#F6F1E4] rounded-sm av-mono text-[10px] uppercase tracking-wider hover:bg-[#2C4A37] disabled:opacity-50 transition-colors"
                                >
                                    {submitting
                                        ? editingId
                                            ? "Updating..."
                                            : "Adding..."
                                        : editingId
                                            ? "Update Vaccination"
                                            : "Add Vaccination"
                                    }
                                </button>

                            </div>

                        </form>

                    </div>
                )}

                {/* Empty state */}
                {vaccinations.length === 0 ? (

                    <div className="bg-white border border-[#DED7C9] rounded-sm p-8">

                        <p className="text-[#6B6255]">
                            No vaccination records found.
                        </p>

                    </div>

                ) : (

                    <div className="bg-white border border-[#DED7C9] rounded-sm overflow-hidden">

                        <div className="overflow-x-auto">

                            <table className="w-full text-sm">

                                <thead className="bg-[#1F3B2C] text-[#F6F1E4]">

                                    <tr>

                                        <th className="text-left px-6 py-4 av-mono text-[10px] tracking-[0.15em] uppercase font-medium text-[#D8E2D9]">
                                            Animal
                                        </th>

                                        <th className="text-left px-6 py-4 av-mono text-[10px] tracking-[0.15em] uppercase font-medium text-[#D8E2D9]">
                                            Vaccine
                                        </th>

                                        <th className="text-left px-6 py-4 av-mono text-[10px] tracking-[0.15em] uppercase font-medium text-[#D8E2D9]">
                                            Next Due
                                        </th>

                                        <th className="text-left px-6 py-4 av-mono text-[10px] tracking-[0.15em] uppercase font-medium text-[#D8E2D9]">
                                            Status
                                        </th>

                                        <th className="text-left px-6 py-4 av-mono text-[10px] tracking-[0.15em] uppercase font-medium text-[#D8E2D9]">
                                            Actions
                                        </th>

                                    </tr>

                                </thead>

                                <tbody className="divide-y divide-[#DED7C9]">

                                    {vaccinations.map((vaccination) => (

                                        <tr
                                            key={vaccination.vaccination_id}
                                            className="hover:bg-[#F6F1E4]/50 transition-colors"
                                        >

                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-[#2B2620]">
                                                        {vaccination.animal_name}
                                                    </p>

                                                    <p className="av-mono text-[10px] text-[#8A8072] mt-1">
                                                        {vaccination.tag_number}
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-[#6B6255]">
                                                {vaccination.vaccine_name}
                                            </td>

                                            <td className="px-6 py-4 text-[#6B6255]">
                                                {vaccination.next_due_date
                                                    ? new Date(
                                                        vaccination.next_due_date
                                                    ).toLocaleDateString()
                                                    : "—"}
                                            </td>

                                            <td className="px-6 py-4">

                                                <span
                                                    className={`inline-block px-2.5 py-1 av-mono text-[10px] uppercase tracking-wider ${
                                                        vaccination.status === "Completed"
                                                            ? "bg-[#1F3B2C]/10 text-[#1F3B2C]"
                                                            : "bg-[#D9A441]/10 text-[#8A651C]"
                                                    }`}
                                                >
                                                    {vaccination.status}
                                                </span>

                                            </td>

                                            <td className="px-6 py-4">
                                                {userRole !== "FARMER" && (
                                                    <div className="flex items-center gap-4">

                                                        <button
                                                            type="button"
                                                            onClick={() => handleEdit(vaccination)}
                                                            className="text-[#1F3B2C] av-mono text-[10px] uppercase tracking-wider hover:text-[#D9A441]"
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(vaccination.vaccination_id)
                                                            }
                                                            className="text-[#A8452F] av-mono text-[10px] uppercase tracking-wider hover:opacity-70"
                                                        >
                                                            Delete
                                                        </button>

                                                    </div>
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
console.log("CURRENT USER:", JSON.parse(localStorage.getItem("user")));

export default Vaccinations;