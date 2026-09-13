import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

const BrandMark = ({ stroke = "#D9A441", size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="32" height="32" rx="8" stroke={stroke} strokeWidth="1.5" />
        <path d="M9 20 L14 12 L19 18 L25 9" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="25" cy="9" r="1.8" fill={stroke} />
    </svg>
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
    `}</style>
);

const Register = () => {
    const navigate = useNavigate();

    const [roleType, setRoleType] = useState("FARMER");

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });

    const [vetData, setVetData] = useState({
        certificate_name: "",
        specialization: "",
        certificate_number: "",
        certificate_file: null
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleVetChange = (e) => {
        setVetData({
            ...vetData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setVetData({
                ...vetData,
                certificate_file: e.target.files[0]
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (
            !formData.full_name ||
            !formData.email ||
            !formData.password
        ) {
            setError("Please fill in all required fields");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (roleType === "VETERINARIAN") {
            if (!vetData.certificate_name) {
                setError("Please provide your certificate name / qualification");
                return;
            }

            if (!vetData.specialization || !vetData.specialization.trim()) {
                setError("Please provide your specialization / area of practice");
                return;
            }

            if (!vetData.certificate_file) {
                setError("Please upload your veterinary certificate file (.pdf, .jpg, .png)");
                return;
            }
        }

        try {
            setLoading(true);

            if (roleType === "FARMER") {
                await API.post("/auth/register", {
                    full_name: formData.full_name,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                    role_id: 1
                });

                setSuccess("Registration successful. Redirecting to login...");

                setTimeout(() => {
                    navigate("/login");
                }, 1500);

            } else {
                const payload = new FormData();
                payload.append("full_name", formData.full_name);
                payload.append("email", formData.email);
                payload.append("phone", formData.phone);
                payload.append("password", formData.password);
                payload.append("certificate_name", vetData.certificate_name);
                payload.append("specialization", vetData.specialization.trim());
                if (vetData.certificate_number) {
                    payload.append("certificate_number", vetData.certificate_number);
                }
                payload.append("certificate", vetData.certificate_file);

                const response = await API.post(
                    "/auth/register-veterinarian",
                    payload,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data"
                        }
                    }
                );

                setSuccess(
                    response.data.message ||
                    "Veterinarian registration submitted. Awaiting administrator approval."
                );

                setTimeout(() => {
                    navigate("/login");
                }, 2500);
            }

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Registration failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F6F1E4] flex items-center justify-center px-6 py-12 font-[Inter,sans-serif]">
            {sharedStyles}

            <div className="w-full max-w-md">

                <div className="relative bg-white border border-[#DED7C9] rounded-sm p-8 overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#1F3B2C]" />

                    <div className="mb-6">
                        <div className="flex items-center gap-2.5 mb-4">
                            <BrandMark stroke="#1F3B2C" size={24} />
                            <p className="av-mono text-[10px] tracking-[0.2em] uppercase text-[#A8452F]">
                                AgriVet Connect
                            </p>
                        </div>

                        <h1 className="av-serif text-3xl font-medium text-[#1F3B2C]">
                            Create Account
                        </h1>

                        <p className="text-sm text-[#8A8072] mt-2">
                            {roleType === "FARMER"
                                ? "Register as a farmer to get started."
                                : "Register as a veterinarian to join our verified network."}
                        </p>
                    </div>

                    {/* ROLE SELECTOR */}
                    <div className="grid grid-cols-2 gap-2 p-1 mb-6 bg-[#F6F1E4] border border-[#DED7C9] rounded-sm">
                        <button
                            type="button"
                            onClick={() => {
                                setRoleType("FARMER");
                                setError("");
                                setSuccess("");
                            }}
                            className={`py-2 text-[11px] av-mono uppercase tracking-[0.1em] transition-all rounded-xs ${
                                roleType === "FARMER"
                                    ? "bg-[#1F3B2C] text-[#F6F1E4] font-medium shadow-xs"
                                    : "text-[#5F574D] hover:text-[#2B2620]"
                            }`}
                        >
                            Farmer
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setRoleType("VETERINARIAN");
                                setError("");
                                setSuccess("");
                            }}
                            className={`py-2 text-[11px] av-mono uppercase tracking-[0.1em] transition-all rounded-xs ${
                                roleType === "VETERINARIAN"
                                    ? "bg-[#1F3B2C] text-[#F6F1E4] font-medium shadow-xs"
                                    : "text-[#5F574D] hover:text-[#2B2620]"
                            }`}
                        >
                            Veterinarian
                        </button>
                    </div>

                    {error && (
                        <div className="mb-5 border-l-2 border-[#A8452F] bg-[#A8452F]/[0.06] px-4 py-3">
                            <p className="text-sm text-[#A8452F]">
                                {error}
                            </p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-5 border-l-2 border-[#1F3B2C] bg-[#1F3B2C]/[0.06] px-4 py-3">
                            <p className="text-sm text-[#1F3B2C]">
                                {success}
                            </p>
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        <div>
                            <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-2">
                                Full Name *
                            </label>

                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                className="av-input w-full text-sm text-[#2B2620] placeholder:text-[#B4AA9B]"
                            />
                        </div>

                        <div>
                            <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-2">
                                Email *
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                className="av-input w-full text-sm text-[#2B2620] placeholder:text-[#B4AA9B]"
                            />
                        </div>

                        <div>
                            <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-2">
                                Phone
                            </label>

                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter your phone number"
                                className="av-input w-full text-sm text-[#2B2620] placeholder:text-[#B4AA9B]"
                            />
                        </div>

                        {roleType === "VETERINARIAN" && (
                            <>
                                <div>
                                    <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-2">
                                        Certificate Name / Qualification *
                                    </label>

                                    <input
                                        type="text"
                                        name="certificate_name"
                                        value={vetData.certificate_name}
                                        onChange={handleVetChange}
                                        placeholder="e.g. BVSc & AH Degree, State Veterinary License"
                                        className="av-input w-full text-sm text-[#2B2620] placeholder:text-[#B4AA9B]"
                                    />
                                </div>

                                <div>
                                    <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-2">
                                        Specialization / Area of Practice *
                                    </label>

                                    <input
                                        type="text"
                                        name="specialization"
                                        value={vetData.specialization}
                                        onChange={handleVetChange}
                                        placeholder="e.g. Large Animal / Cattle, Poultry, Small Animal"
                                        className="av-input w-full text-sm text-[#2B2620] placeholder:text-[#B4AA9B]"
                                    />
                                </div>

                                <div>
                                    <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-2">
                                        Certificate / Registration Number
                                    </label>

                                    <input
                                        type="text"
                                        name="certificate_number"
                                        value={vetData.certificate_number}
                                        onChange={handleVetChange}
                                        placeholder="e.g. VCI-2024-8849 (Optional)"
                                        className="av-input w-full text-sm text-[#2B2620] placeholder:text-[#B4AA9B]"
                                    />
                                </div>

                                <div>
                                    <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-2">
                                        Veterinary Certificate File *
                                    </label>

                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={handleFileChange}
                                        className="av-input w-full text-xs text-[#2B2620] file:mr-3 file:py-1.5 file:px-3 file:border-0 file:text-[10px] file:uppercase file:tracking-[0.1em] file:av-mono file:bg-[#1F3B2C] file:text-[#F6F1E4] file:rounded-xs hover:file:bg-[#2C4A37] file:cursor-pointer"
                                    />
                                    <p className="text-[10px] text-[#8A8072] mt-1.5">
                                        Accepted formats: PDF, JPG, PNG (Max 5MB)
                                    </p>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-2">
                                Password *
                            </label>

                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a password"
                                className="av-input w-full text-sm text-[#2B2620] placeholder:text-[#B4AA9B]"
                            />
                        </div>

                        <div>
                            <label className="block av-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8072] mb-2">
                                Confirm Password *
                            </label>

                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                className="av-input w-full text-sm text-[#2B2620] placeholder:text-[#B4AA9B]"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#1F3B2C] text-[#F6F1E4] py-3.5 rounded-sm av-mono text-[10px] tracking-[0.15em] uppercase hover:bg-[#2C4A37] transition-colors disabled:opacity-60"
                        >
                            {loading
                                ? (roleType === "FARMER" ? "Creating Account…" : "Submitting Application…")
                                : (roleType === "FARMER" ? "Create Account" : "Submit Registration")}
                        </button>

                    </form>

                    <div className="mt-7 text-center">
                        <p className="text-sm text-[#8A8072]">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="text-[#1F3B2C] font-medium hover:text-[#D9A441] transition-colors"
                            >
                                Login
                            </Link>
                        </p>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default Register;