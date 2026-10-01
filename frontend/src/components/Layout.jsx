import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import NotificationBell from "./NotificationBell";

const Layout = ({ children }) => {
    const [user, setUser] = useState(() =>
        JSON.parse(localStorage.getItem("user") || "null")
    );

    useEffect(() => {
        const handleUpdate = () => {
            setUser(JSON.parse(localStorage.getItem("user") || "null"));
        };
        window.addEventListener("userUpdated", handleUpdate);
        window.addEventListener("storage", handleUpdate);
        return () => {
            window.removeEventListener("userUpdated", handleUpdate);
            window.removeEventListener("storage", handleUpdate);
        };
    }, []);

    const getPortalLabel = () => {
        if (!user?.role) return "Portal";
        switch (user.role) {
            case "FARMER":
                return "Farmer Portal";
            case "VETERINARIAN":
                return "Veterinarian Portal";
            case "ADMIN":
                return "Admin Portal";
            default:
                return "Portal";
        }
    };

    return (
        <div className="min-h-screen flex bg-[#F6F1E4] font-[Inter,sans-serif]">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                {/* TOP HEADER */}
                <header className="h-16 px-6 sm:px-8 border-b border-[#DED7C9] bg-white/70 backdrop-blur-xs flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <span className="av-mono text-[10px] uppercase tracking-[0.22em] text-[#8A8072]">
                            AgriVet Connect
                        </span>
                        <span className="text-xs text-[#DED7C9]">/</span>
                        <span className="text-xs font-medium text-[#2B2620]">
                            {getPortalLabel()}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                        <NotificationBell />

                        <Link
                            to="/profile"
                            className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white border border-[#DED7C9] text-xs font-medium text-[#2B2620] hover:border-[#D9A441] hover:bg-[#FDFBF7] transition-all shadow-2xs"
                            title="My Profile"
                        >
                            <div className="w-6 h-6 rounded-full bg-[#1F3B2C] text-[#D9A441] flex items-center justify-center font-bold text-[11px] shrink-0">
                                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                            </div>
                            <span className="hidden sm:inline-block max-w-[120px] truncate text-xs text-gray-700">
                                {user?.full_name || "Profile"}
                            </span>
                        </Link>
                    </div>
                </header>

                <main className="flex-1 min-w-0">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;