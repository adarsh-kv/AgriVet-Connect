import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Form inputs state
    const [formData, setFormData] = useState({
        full_name: "",
        phone: "",
        specialization: ""
    });

    const [isEditing, setIsEditing] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let isMounted = true;

        const loadProfile = async () => {
            try {
                const res = await API.get("/auth/profile");
                if (isMounted) {
                    const data = res.data;
                    setProfile(data);
                    setFormData({
                        full_name: data.user?.full_name || "",
                        phone: data.user?.phone || "",
                        specialization: data.verification?.specialization || ""
                    });
                }
            } catch (err) {
                console.error("Failed to load profile:", err);
                if (isMounted) {
                    setError(err.response?.data?.message || "Failed to load profile information.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadProfile();

        return () => {
            isMounted = false;
        };
    }, [refreshKey]);

    const handleRetry = () => {
        setLoading(true);
        setError("");
        setRefreshKey((k) => k + 1);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        if (!formData.full_name.trim()) {
            setError("Full name cannot be empty.");
            return;
        }

        try {
            setSaving(true);
            const payload = {
                full_name: formData.full_name.trim(),
                phone: formData.phone.trim() || null
            };

            if (profile?.user?.role === "VETERINARIAN") {
                payload.specialization = formData.specialization.trim() || null;
            }

            const res = await API.put("/auth/profile", payload);
            const updated = res.data;

            setProfile(updated);
            setIsEditing(false);
            setSuccessMessage(updated.message || "Profile updated successfully!");

            // Update user in localStorage
            const localUser = JSON.parse(localStorage.getItem("user") || "{}");
            const newLocalUser = {
                ...localUser,
                full_name: updated.user.full_name,
                phone: updated.user.phone
            };
            localStorage.setItem("user", JSON.stringify(newLocalUser));

            // Notify components (Sidebar, Layout) of updated user
            window.dispatchEvent(new Event("userUpdated"));
        } catch (err) {
            console.error("Error updating profile:", err);
            setError(err.response?.data?.message || "Failed to save profile changes.");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (profile) {
            setFormData({
                full_name: profile.user?.full_name || "",
                phone: profile.user?.phone || "",
                specialization: profile.verification?.specialization || ""
            });
        }
        setIsEditing(false);
        setError("");
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            return new Date(dateString).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric"
            });
        } catch {
            return dateString;
        }
    };

    const role = profile?.user?.role;

    const getRoleBadge = (userRole) => {
        switch (userRole) {
            case "VETERINARIAN":
                return "bg-teal-100 text-teal-900 border-teal-200";
            case "ADMIN":
                return "bg-purple-100 text-purple-900 border-purple-200";
            case "FARMER":
            default:
                return "bg-emerald-100 text-emerald-900 border-emerald-200";
        }
    };

    const getVerificationBadge = (status) => {
        switch (status) {
            case "APPROVED":
                return "bg-emerald-50 text-emerald-800 border-emerald-300";
            case "REJECTED":
                return "bg-red-50 text-red-800 border-red-300";
            case "PENDING":
            default:
                return "bg-amber-50 text-amber-800 border-amber-300";
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-[#1C1917] p-4 sm:p-6 lg:p-8 font-[Inter,sans-serif]">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

                .av-serif {
                    font-family: 'Fraunces', serif;
                }

                .av-mono {
                    font-family: 'JetBrains Mono', monospace;
                }

                .av-input {
                    border: 1px solid #DED7C9;
                    border-radius: 4px;
                    padding: 9px 13px;
                    outline: none;
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                }

                .av-input:focus {
                    border-color: #D9A441;
                    box-shadow: 0 0 0 2px rgba(217, 164, 65, 0.15);
                }
            `}</style>

            <div className="max-w-6xl mx-auto space-y-6">

                {/* BREADCRUMB & HEADER */}
                <div className="border-b border-[#EFE9DC] pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-[#F3EFE6] text-[#6B5E4F] border border-[#E5DEC9]">
                                Account Settings
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500 font-medium">
                                Personal & Credential Profile
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-semibold av-serif text-[#1C1917]">
                            My Profile
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            View and maintain your personal contact information, verified role status, and operational records.
                        </p>
                    </div>

                    {!loading && !isEditing && (
                        <button
                            type="button"
                            onClick={() => {
                                setIsEditing(true);
                                setSuccessMessage("");
                                setError("");
                            }}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#1F3B2C] hover:bg-[#2C4A37] text-white rounded text-xs font-semibold shadow-xs transition-colors self-start md:self-auto"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            <span>Edit Profile</span>
                        </button>
                    )}
                </div>

                {/* FEEDBACK BANNERS */}
                {successMessage && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-700 shrink-0">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>{successMessage}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSuccessMessage("")}
                            className="text-emerald-700 hover:text-emerald-950 text-xs font-bold"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600 shrink-0">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <span>{error}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setError("")}
                            className="text-red-700 hover:text-red-950 text-xs font-bold"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <div className="w-8 h-8 border-3 border-emerald-800 border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-sm font-medium">Loading profile details...</p>
                    </div>
                ) : !profile ? (
                    <div className="bg-white border border-[#EFE9DC] rounded-xl p-8 text-center">
                        <p className="text-gray-600 mb-4">Unable to load profile data.</p>
                        <button
                            type="button"
                            onClick={handleRetry}
                            className="px-4 py-2 bg-emerald-800 text-white rounded text-xs font-semibold"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <>
                        {/* HERO CARD */}
                        <div className="bg-white border border-[#EFE9DC] rounded-xl p-6 sm:p-7 shadow-xs">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                                <div className="flex items-center gap-4 sm:gap-5">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#1F3B2C] text-[#D9A441] border-2 border-[#D9A441] flex items-center justify-center text-2xl sm:text-3xl font-bold av-serif shrink-0 shadow-sm">
                                        {profile.user?.full_name ? profile.user.full_name.charAt(0).toUpperCase() : "U"}
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <h2 className="text-xl sm:text-2xl font-bold text-[#1C1917]">
                                                {profile.user?.full_name || "User"}
                                            </h2>
                                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${getRoleBadge(role)}`}>
                                                {role || "USER"}
                                            </span>
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                {profile.user?.status || "ACTIVE"}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                                            <div className="flex items-center gap-1.5">
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                                    <polyline points="22,6 12,13 2,6" />
                                                </svg>
                                                <span>{profile.user?.email || "No email"}</span>
                                            </div>
                                            {profile.user?.phone && (
                                                <div className="flex items-center gap-1.5">
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                                    </svg>
                                                    <span>{profile.user.phone}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1.5">
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                                    <line x1="16" y1="2" x2="16" y2="6" />
                                                    <line x1="8" y1="2" x2="8" y2="6" />
                                                    <line x1="3" y1="10" x2="21" y2="10" />
                                                </svg>
                                                <span>Joined {formatDate(profile.user?.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* TWO COLUMN GRID */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* LEFT COLUMN: PERSONAL DETAILS & EDIT FORM */}
                            <div className="lg:col-span-2 bg-white border border-[#EFE9DC] rounded-xl p-6 sm:p-7 shadow-xs">
                                <div className="flex items-center justify-between border-b border-[#EFE9DC] pb-4 mb-5">
                                    <div>
                                        <h3 className="text-base font-semibold text-[#1C1917]">
                                            Personal Details
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {isEditing ? "Edit your contact information below." : "Your primary personal and contact information."}
                                        </p>
                                    </div>
                                    {isEditing && (
                                        <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                                            Editing Active
                                        </span>
                                    )}
                                </div>

                                <form onSubmit={handleSave} className="space-y-4">
                                    {/* FULL NAME */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                                            Full Name <span className="text-red-600">*</span>
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="full_name"
                                                value={formData.full_name}
                                                onChange={handleChange}
                                                required
                                                className="av-input w-full text-sm bg-white"
                                                placeholder="Enter full name"
                                            />
                                        ) : (
                                            <div className="px-3.5 py-2.5 bg-[#FAF8F5] border border-[#EFE9DC] rounded text-sm text-gray-800 font-medium">
                                                {profile.user?.full_name || "—"}
                                            </div>
                                        )}
                                    </div>

                                    {/* EMAIL (IMMUTABLE) */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Email Address
                                            </label>
                                            <span className="text-[10px] text-gray-400 av-mono">
                                                Fixed / Identity
                                            </span>
                                        </div>
                                        <div className="px-3.5 py-2.5 bg-[#F4EFE6]/60 border border-[#E8DFC8] rounded text-sm text-gray-600 flex items-center justify-between">
                                            <span>{profile.user?.email || "—"}</span>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                            </svg>
                                        </div>
                                        <p className="text-[11px] text-gray-400 mt-1">
                                            Email is bound to your authentication account and cannot be modified.
                                        </p>
                                    </div>

                                    {/* PHONE NUMBER */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                                            Phone Number
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="av-input w-full text-sm bg-white"
                                                placeholder="e.g. 9876543210"
                                            />
                                        ) : (
                                            <div className="px-3.5 py-2.5 bg-[#FAF8F5] border border-[#EFE9DC] rounded text-sm text-gray-800 font-medium">
                                                {profile.user?.phone || <span className="text-gray-400 font-normal">Not provided</span>}
                                            </div>
                                        )}
                                    </div>

                                    {/* VETERINARIAN SPECIALIZATION */}
                                    {role === "VETERINARIAN" && (
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                                                Clinical Specialization
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="specialization"
                                                    value={formData.specialization}
                                                    onChange={handleChange}
                                                    className="av-input w-full text-sm bg-white"
                                                    placeholder="e.g. Large Animal Surgery, Bovine Reproduction, Herd Health"
                                                />
                                            ) : (
                                                <div className="px-3.5 py-2.5 bg-[#FAF8F5] border border-[#EFE9DC] rounded text-sm text-gray-800 font-medium">
                                                    {profile.verification?.specialization || <span className="text-gray-400 font-normal">General Veterinary Medicine</span>}
                                                </div>
                                            )}
                                            <p className="text-[11px] text-gray-400 mt-1">
                                                Update your clinical focus and domain expertise for farmer consultation requests.
                                            </p>
                                        </div>
                                    )}

                                    {/* ACTIONS BUTTONS */}
                                    {isEditing && (
                                        <div className="pt-4 flex items-center gap-3">
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded text-xs font-semibold shadow-xs transition-colors"
                                            >
                                                {saving ? "Saving Changes..." : "Save Changes"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCancel}
                                                disabled={saving}
                                                className="px-4 py-2.5 bg-[#F3EFE6] hover:bg-[#EAE2D4] border border-[#DED7C9] text-gray-700 rounded text-xs font-semibold transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </div>

                            {/* RIGHT COLUMN: ROLE-SPECIFIC CREDENTIALS & RECORDS */}
                            <div className="space-y-6">

                                {/* VETERINARIAN CREDENTIALS CARD */}
                                {role === "VETERINARIAN" && (
                                    <div className="bg-white border border-[#EFE9DC] rounded-xl p-6 shadow-xs">
                                        <div className="flex items-center justify-between border-b border-[#EFE9DC] pb-3 mb-4">
                                            <h3 className="text-sm font-semibold text-[#1C1917]">
                                                Professional Credentials
                                            </h3>
                                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getVerificationBadge(profile.verification?.verification_status)}`}>
                                                {profile.verification?.verification_status || "PENDING"}
                                            </span>
                                        </div>

                                        {profile.verification ? (
                                            <div className="space-y-3.5 text-xs">
                                                <div>
                                                    <span className="text-gray-400 block font-medium">Degree / Certificate</span>
                                                    <span className="font-semibold text-gray-800 text-sm">
                                                        {profile.verification.certificate_name || "Veterinary Degree"}
                                                    </span>
                                                </div>

                                                <div>
                                                    <span className="text-gray-400 block font-medium">Registration / License Number</span>
                                                    <span className="font-semibold text-gray-800 av-mono">
                                                        {profile.verification.certificate_number || "Not specified"}
                                                    </span>
                                                </div>

                                                <div>
                                                    <span className="text-gray-400 block font-medium">Submitted For Verification</span>
                                                    <span className="text-gray-700">
                                                        {formatDate(profile.verification.submitted_at)}
                                                    </span>
                                                </div>

                                                {profile.verification.verified_at && (
                                                    <div>
                                                        <span className="text-gray-400 block font-medium">Approved Date</span>
                                                        <span className="text-emerald-700 font-medium">
                                                            {formatDate(profile.verification.verified_at)}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="pt-2 text-[11px] text-gray-500 bg-[#FDFBF7] p-3 rounded border border-[#EFE9DC]">
                                                    <p>
                                                        Official credentials are authenticated by system administrators. Certificate documents on file remain protected in the compliance registry.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-500">
                                                No verification credentials on file.
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* FARMER REGISTERED FARMS CARD */}
                                {role === "FARMER" && (
                                    <div className="bg-white border border-[#EFE9DC] rounded-xl p-6 shadow-xs">
                                        <div className="flex items-center justify-between border-b border-[#EFE9DC] pb-3 mb-4">
                                            <div>
                                                <h3 className="text-sm font-semibold text-[#1C1917]">
                                                    My Farm Holdings
                                                </h3>
                                                <p className="text-[11px] text-gray-400 mt-0.5">
                                                    {profile.farms?.length || 0} registered farm{profile.farms?.length === 1 ? "" : "s"}
                                                </p>
                                            </div>
                                            <Link
                                                to="/farm"
                                                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:underline"
                                            >
                                                Manage Farms →
                                            </Link>
                                        </div>

                                        {profile.farms && profile.farms.length > 0 ? (
                                            <div className="space-y-3">
                                                {profile.farms.map((farm) => (
                                                    <div
                                                        key={farm.farm_id}
                                                        className="p-3 bg-[#FAF8F5] border border-[#EFE9DC] rounded-lg text-xs"
                                                    >
                                                        <div className="flex items-center justify-between gap-2 mb-1">
                                                            <span className="font-semibold text-gray-800 text-sm">
                                                                {farm.farm_name}
                                                            </span>
                                                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-semibold">
                                                                {farm.farm_type || "General"}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-600">
                                                            {farm.location || "Location not set"}
                                                        </p>
                                                        {farm.description && (
                                                            <p className="text-gray-400 text-[11px] mt-1 line-clamp-2">
                                                                {farm.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 bg-[#FAF8F5] border border-[#EFE9DC] rounded-lg">
                                                <p className="text-xs text-gray-500 mb-2">No farms registered yet.</p>
                                                <Link
                                                    to="/farm"
                                                    className="inline-block px-3 py-1.5 bg-emerald-800 text-white rounded text-xs font-semibold hover:bg-emerald-900 transition-colors"
                                                >
                                                    + Register Your First Farm
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ADMIN PRIVILEGES CARD */}
                                {role === "ADMIN" && (
                                    <div className="bg-white border border-[#EFE9DC] rounded-xl p-6 shadow-xs">
                                        <div className="border-b border-[#EFE9DC] pb-3 mb-4">
                                            <h3 className="text-sm font-semibold text-[#1C1917]">
                                                Administrator Access
                                            </h3>
                                            <p className="text-[11px] text-gray-400 mt-0.5">
                                                System wide governance & security permissions
                                            </p>
                                        </div>

                                        <div className="space-y-3 text-xs">
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                                <span>User Management & Role Verification</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                                <span>Official Schemes Directory Publishing</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                                <span>Public Insurance Advisory Management</span>
                                            </div>

                                            <div className="pt-3 border-t border-[#EFE9DC] flex flex-col gap-2">
                                                <Link
                                                    to="/admin/users"
                                                    className="block text-center py-2 px-3 bg-[#FAF8F5] hover:bg-[#F3EFE6] border border-[#DED7C9] rounded font-semibold text-gray-800 transition-colors"
                                                >
                                                    Manage Users & Roles →
                                                </Link>
                                                <Link
                                                    to="/admin/schemes"
                                                    className="block text-center py-2 px-3 bg-[#FAF8F5] hover:bg-[#F3EFE6] border border-[#DED7C9] rounded font-semibold text-gray-800 transition-colors"
                                                >
                                                    Manage Schemes & Insurance →
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ACCOUNT SUMMARY CARD */}
                                <div className="bg-white border border-[#EFE9DC] rounded-xl p-6 shadow-xs text-xs space-y-3">
                                    <h3 className="text-sm font-semibold text-[#1C1917] border-b border-[#EFE9DC] pb-2">
                                        Account Summary
                                    </h3>
                                    <div className="flex justify-between items-center py-1.5 border-b border-[#FAF8F5]">
                                        <span className="text-gray-500 font-medium">Role:</span>
                                        <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border ${getRoleBadge(role)}`}>
                                            {role || "USER"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-1.5 border-b border-[#FAF8F5]">
                                        <span className="text-gray-500 font-medium">Status:</span>
                                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                            {profile.user?.status || "ACTIVE"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-1.5">
                                        <span className="text-gray-500 font-medium">Member Since:</span>
                                        <span className="font-medium text-gray-800">
                                            {formatDate(profile.user?.created_at)}
                                        </span>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
};

export default Profile;
