import { useEffect, useState } from "react";
import API from "../services/api";

const HealthRecords = () => {
    const [records, setRecords] = useState([]);
    const EMPTY_FORM = {
        livestock_id: "",
        visit_date: "",
        diagnosis: "",
        treatment: "",
        medicine: "",
        remarks: ""
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

    const handleEdit = (record) => {
        setEditingId(record.record_id);

        setFormData({
            livestock_id: record.livestock_id || "",
            visit_date: record.visit_date
                ? new Date(record.visit_date).toISOString().split("T")[0]
                : "",
            diagnosis: record.diagnosis || "",
            treatment: record.treatment || "",
            medicine: record.medicine || "",
            remarks: record.remarks || ""
        });

        setShowForm(true);
    };

    const handleDelete = async (recordId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this health record?"
        );

        if (!confirmed) return;

        try {
            await API.delete(`/health/${recordId}`);

            // Reload the latest records
            const updatedResponse = await API.get("/health");
            setRecords(updatedResponse.data);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to delete health record"
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
                await API.put(`/health/${editingId}`, payload);
            } else {
                await API.post("/health", payload);
            }

            const updatedResponse = await API.get("/health");
            setRecords(updatedResponse.data);

            setFormData(EMPTY_FORM);
            setEditingId(null);
            setShowForm(false);

        } catch (error) {
            setFormError(
                error.response?.data?.message ||
                `Failed to ${editingId ? "update" : "add"} health record`
            );
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        const fetchHealthRecords = async () => {
            try {
                const response = await API.get("/health");
                setRecords(response.data);
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Failed to load health records"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchHealthRecords();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F6F1E4]">
                <p className="av-mono text-[11px] tracking-[0.2em] uppercase text-[#8A8072]">
                    Loading health records
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F6F1E4] px-6">
                <div className="border-l-2 border-[#A8452F] bg-[#A8452F]/[0.06] px-5 py-4 max-w-sm">
                    <p className="av-mono text-[10px] tracking-[0.2em] uppercase text-[#A8452F] mb-1.5">
                        Health records error
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
                <div className="mb-8">

                    <p className="av-mono text-[11px] tracking-[0.25em] uppercase text-[#A8452F] mb-3">
                        Animal Health
                    </p>

                    <h1 className="av-serif text-[2.1rem] font-medium text-[#2B2620]">
                        Health Records
                    </h1>

                    <p className="av-mono text-[11px] tracking-[0.12em] uppercase text-[#8A8072] mt-3">
                        {records.length}{" "}
                        {records.length === 1
                            ? "record"
                            : "records"}{" "}
                        recorded
                    </p>

                    <button
                        type="button"
                        onClick={() => setShowForm(true)}
                        className="bg-[#1F3B2C] text-[#F6F1E4] px-5 py-3 rounded-sm av-mono text-[10px] tracking-[0.15em] uppercase hover:bg-[#2C4A37] transition-colors"
                    >
                        + Add Health Record
                    </button>

                </div>

                {showForm && (
                    <div className="bg-white border border-[#DED7C9] rounded-sm p-7 mb-8">

                        <div className="mb-6">
                            <p className="av-mono text-[10px] tracking-[0.2em] uppercase text-[#A8452F]">
                                {editingId ? "Update Record" : "Medical Record"}
                            </p>

                            <h2 className="av-serif text-2xl text-[#2B2620] mt-2">
                                {editingId ? "Edit Health Record" : "Add Health Record"}
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

                            {/* Visit Date */}
                            <div>
                                <label className="block av-mono text-[10px] uppercase tracking-wider text-[#8A8072] mb-2">
                                    Visit Date
                                </label>

                                <input
                                    type="date"
                                    name="visit_date"
                                    value={formData.visit_date}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-[#DED7C9] px-4 py-3 rounded-sm outline-none focus:border-[#1F3B2C]"
                                />
                            </div>

                            {/* Diagnosis */}
                            <div>
                                <label className="block av-mono text-[10px] uppercase tracking-wider text-[#8A8072] mb-2">
                                    Diagnosis
                                </label>

                                <input
                                    name="diagnosis"
                                    value={formData.diagnosis}
                                    onChange={handleChange}
                                    placeholder="Mild Fever"
                                    required
                                    className="w-full border border-[#DED7C9] px-4 py-3 rounded-sm outline-none focus:border-[#1F3B2C]"
                                />
                            </div>

                            {/* Treatment */}
                            <div>
                                <label className="block av-mono text-[10px] uppercase tracking-wider text-[#8A8072] mb-2">
                                    Treatment
                                </label>

                                <input
                                    name="treatment"
                                    value={formData.treatment}
                                    onChange={handleChange}
                                    placeholder="Medication for 3 days"
                                    required
                                    className="w-full border border-[#DED7C9] px-4 py-3 rounded-sm outline-none focus:border-[#1F3B2C]"
                                />
                            </div>

                            {/* Medicine */}
                            <div>
                                <label className="block av-mono text-[10px] uppercase tracking-wider text-[#8A8072] mb-2">
                                    Medicine
                                </label>

                                <input
                                    name="medicine"
                                    value={formData.medicine}
                                    onChange={handleChange}
                                    placeholder="Paracetamol"
                                    className="w-full border border-[#DED7C9] px-4 py-3 rounded-sm outline-none focus:border-[#1F3B2C]"
                                />
                            </div>

                            {/* Remarks */}
                            <div>
                                <label className="block av-mono text-[10px] uppercase tracking-wider text-[#8A8072] mb-2">
                                    Remarks
                                </label>

                                <input
                                    name="remarks"
                                    value={formData.remarks}
                                    onChange={handleChange}
                                    placeholder="Monitor temperature"
                                    className="w-full border border-[#DED7C9] px-4 py-3 rounded-sm outline-none focus:border-[#1F3B2C]"
                                />
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
                                            ? "Update Record"
                                            : "Add Record"
                                    }
                                </button>

                            </div>

                        </form>

                    </div>
                )}

                {/* Empty state */}
                {records.length === 0 ? (

                    <div className="bg-white border border-[#DED7C9] rounded-sm p-8">

                        <p className="text-[#6B6255]">
                            No health records found.
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
                                            Visit Date
                                        </th>

                                        <th className="text-left px-6 py-4 av-mono text-[10px] tracking-[0.15em] uppercase font-medium text-[#D8E2D9]">
                                            Diagnosis
                                        </th>

                                        <th className="text-left px-6 py-4 av-mono text-[10px] tracking-[0.15em] uppercase font-medium text-[#D8E2D9]">
                                            Treatment
                                        </th>

                                        <th className="text-left px-6 py-4 av-mono text-[10px] tracking-[0.15em] uppercase font-medium text-[#D8E2D9]">
                                            Medicine
                                        </th>

                                        <th className="text-left px-6 py-4 av-mono text-[10px] tracking-[0.15em] uppercase font-medium text-[#D8E2D9]">
                                            Remarks
                                        </th>

                                        <th className="text-left px-6 py-4 av-mono text-[10px] tracking-[0.15em] uppercase font-medium text-[#D8E2D9]">
                                            Actions
                                        </th>

                                    </tr>

                                </thead>

                                <tbody className="divide-y divide-[#DED7C9]">

                                    {records.map((record) => (

                                        <tr
                                            key={record.record_id}
                                            className="hover:bg-[#F6F1E4]/50 transition-colors"
                                        >

                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-[#2B2620]">
                                                        {record.animal_name}
                                                    </p>

                                                    <p className="av-mono text-[10px] text-[#8A8072] mt-1">
                                                        {record.tag_number}
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-[#6B6255]">
                                                {record.visit_date
                                                    ? new Date(
                                                        record.visit_date
                                                    ).toLocaleDateString()
                                                    : "—"}
                                            </td>

                                            <td className="px-6 py-4 text-[#6B6255]">
                                                {record.diagnosis || "—"}
                                            </td>

                                            <td className="px-6 py-4 text-[#6B6255]">
                                                {record.treatment || "—"}
                                            </td>

                                            <td className="px-6 py-4 text-[#6B6255]">
                                                {record.medicine || "—"}
                                            </td>

                                            <td className="px-6 py-4 text-[#6B6255]">
                                                {record.remarks || "—"}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">

                                                    <button
                                                        type="button"
                                                        onClick={() => handleEdit(record)}
                                                        className="text-[#1F3B2C] av-mono text-[10px] uppercase tracking-wider hover:text-[#D9A441] transition-colors"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(record.record_id)}
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

export default HealthRecords;