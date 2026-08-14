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

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
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

        try {
            setLoading(true);

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

                    <div className="mb-8">
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
                            Register as a farmer to get started.
                        </p>
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
                            {loading ? "Creating Account…" : "Create Account"}
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