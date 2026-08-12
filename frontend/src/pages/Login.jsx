import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const TRACK_NODES = [
    { id: "TAG-0231", label: "Vitals normal", top: "22%" },
    { id: "TAG-0559", label: "Grazing · Sector 4", top: "48%" },
    { id: "TAG-0844", label: "Checked 6m ago", top: "74%" },
];

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await API.post("/auth/login", {
                email,
                password
            });

            const { token, user } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            navigate("/dashboard");

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Login failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#F6F1E4] font-[Inter,sans-serif]">

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

                .av-serif { font-family: 'Fraunces', serif; }
                .av-mono { font-family: 'JetBrains Mono', monospace; }

                @keyframes av-pulse {
                    0%   { box-shadow: 0 0 0 0 rgba(217,164,65,0.55); }
                    70%  { box-shadow: 0 0 0 10px rgba(217,164,65,0); }
                    100% { box-shadow: 0 0 0 0 rgba(217,164,65,0); }
                }
                .av-node-dot {
                    animation: av-pulse 2.6s ease-out infinite;
                }
                .av-node:nth-child(2) .av-node-dot { animation-delay: 0.7s; }
                .av-node:nth-child(3) .av-node-dot { animation-delay: 1.4s; }

                .av-field-input {
                    background: transparent;
                    border: none;
                    border-bottom: 1px solid rgba(43,38,32,0.25);
                    border-radius: 0;
                    padding: 10px 2px;
                    transition: border-color 0.2s ease;
                }
                .av-field-input:focus {
                    outline: none;
                    border-bottom-color: #D9A441;
                }

                @media (prefers-reduced-motion: reduce) {
                    .av-node-dot { animation: none; }
                }
            `}</style>

            {/* Left panel — field map */}
            <div className="hidden lg:flex lg:w-[46%] relative flex-col justify-between overflow-hidden bg-[#1F3B2C] text-[#F6F1E4] px-14 py-12">

                {/* Contour line texture */}
                <svg
                    className="absolute inset-0 w-full h-full opacity-[0.14]"
                    viewBox="0 0 600 800"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                >
                    {[80, 160, 240, 320, 400, 480, 560, 640, 720].map((y, i) => (
                        <path
                            key={y}
                            d={`M -20 ${y} C 100 ${y - 30 - (i % 3) * 10}, 200 ${y + 40}, 320 ${y - 10}
                                S 520 ${y + 30}, 640 ${y}`}
                            fill="none"
                            stroke="#F6F1E4"
                            strokeWidth="1.4"
                        />
                    ))}
                </svg>

                {/* Brand mark */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
                            <rect x="1" y="1" width="32" height="32" rx="8" stroke="#D9A441" strokeWidth="1.5" />
                            <path d="M9 20 L14 12 L19 18 L25 9" stroke="#D9A441" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            <circle cx="25" cy="9" r="1.8" fill="#D9A441" />
                        </svg>
                        <span className="av-mono text-xs tracking-[0.2em] uppercase text-[#D9A441]">
                            AgriVet Connect
                        </span>
                    </div>
                </div>

                {/* Headline */}
                <div className="relative z-10 max-w-sm">
                    <p className="av-mono text-[11px] tracking-[0.25em] uppercase text-[#D9A441] mb-4">
                        Field Access
                    </p>
                    <h1 className="av-serif text-[2.6rem] leading-[1.12] font-medium">
                        Every animal, accounted for.
                    </h1>
                    <p className="text-[#D8E2D9] mt-5 text-[15px] leading-relaxed">
                        Sign in to check vitals, treatments, and herd records
                        across your farm — updated as it happens.
                    </p>
                </div>

                {/* Live tracking strip — signature element */}
                <div className="relative z-10 border-t border-[#33513E] pt-6">
                    <p className="av-mono text-[10px] tracking-[0.2em] uppercase text-[#7FA085] mb-4">
                        Live herd signal
                    </p>
                    <div className="space-y-4">
                        {TRACK_NODES.map((node) => (
                            <div key={node.id} className="av-node flex items-center gap-3">
                                <span className="relative flex h-2 w-2 shrink-0">
                                    <span className="av-node-dot absolute inline-flex h-2 w-2 rounded-full bg-[#D9A441]" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#D9A441]" />
                                </span>
                                <span className="av-mono text-[11px] text-[#D8E2D9] tracking-wide">
                                    {node.id}
                                </span>
                                <span className="text-[12px] text-[#8FA792]">
                                    {node.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right panel — form */}
            <div className="flex-1 flex items-center justify-center px-6 py-14 sm:px-10">
                <div className="w-full max-w-[380px]">

                    {/* Mobile-only brand header */}
                    <div className="flex lg:hidden items-center gap-3 mb-10">
                        <svg width="30" height="30" viewBox="0 0 34 34" fill="none" aria-hidden="true">
                            <rect x="1" y="1" width="32" height="32" rx="8" stroke="#1F3B2C" strokeWidth="1.5" />
                            <path d="M9 20 L14 12 L19 18 L25 9" stroke="#1F3B2C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            <circle cx="25" cy="9" r="1.8" fill="#1F3B2C" />
                        </svg>
                        <span className="av-mono text-xs tracking-[0.2em] uppercase text-[#1F3B2C]">
                            AgriVet Connect
                        </span>
                    </div>

                    <p className="av-mono text-[11px] tracking-[0.25em] uppercase text-[#A8452F] mb-3">
                        Sign In
                    </p>

                    <h2 className="av-serif text-3xl font-medium text-[#2B2620] mb-2">
                        Welcome back
                    </h2>

                    <p className="text-[#6B6255] text-[14px] mb-9 leading-relaxed">
                        Enter your credentials to open today&apos;s herd log.
                    </p>

                    <form onSubmit={handleLogin} className="space-y-7">

                        {/* Email */}
                        <div>
                            <label className="av-mono block text-[10px] tracking-[0.18em] uppercase text-[#8A8072] mb-1.5">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@yourfarm.com"
                                required
                                className="av-field-input w-full text-[#2B2620] text-[15px] placeholder:text-[#B4AA9B] w-full"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="av-mono block text-[10px] tracking-[0.18em] uppercase text-[#8A8072] mb-1.5">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="av-field-input w-full text-[#2B2620] text-[15px] placeholder:text-[#B4AA9B]"
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="border-l-2 border-[#A8452F] bg-[#A8452F]/[0.06] px-4 py-3 text-[13px] text-[#A8452F]">
                                {error}
                            </div>
                        )}

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="av-mono w-full bg-[#1F3B2C] hover:bg-[#16291D] disabled:bg-[#5C7566] text-[#F6F1E4] text-[12px] tracking-[0.15em] uppercase font-medium py-3.5 rounded-sm transition-colors"
                        >
                            {loading ? "Signing in…" : "Sign In"}
                        </button>

                    </form>

                    <p className="text-center text-[12px] text-[#B4AA9B] mt-10">
                        AgriVet Connect · Field ops since 2026
                    </p>

                </div>
            </div>

        </div>
    );
};

export default Login;