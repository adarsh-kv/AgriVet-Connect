import Sidebar from "./Sidebar";
import NotificationBell from "./NotificationBell";

const Layout = ({ children }) => {
    const user = JSON.parse(localStorage.getItem("user") || "null");

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
                <header className="h-16 px-8 border-b border-[#DED7C9] bg-white/70 backdrop-blur-xs flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <span className="av-mono text-[10px] uppercase tracking-[0.22em] text-[#8A8072]">
                            AgriVet Connect
                        </span>
                        <span className="text-xs text-[#DED7C9]">/</span>
                        <span className="text-xs font-medium text-[#2B2620]">
                            {getPortalLabel()}
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <NotificationBell />
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