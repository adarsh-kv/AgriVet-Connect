import { NavLink, useNavigate } from "react-router-dom";

const BrandMark = ({ stroke = "#D9A441", size = 28 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 34 34"
        fill="none"
        aria-hidden="true"
    >
        <rect
            x="1"
            y="1"
            width="32"
            height="32"
            rx="8"
            stroke={stroke}
            strokeWidth="1.5"
        />

        <path
            d="M9 20 L14 12 L19 18 L25 9"
            stroke={stroke}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
        />

        <circle
            cx="25"
            cy="9"
            r="1.8"
            fill={stroke}
        />
    </svg>
);

const ContourTexture = () => (
    <svg
        className="absolute inset-0 w-full h-full opacity-[0.12]"
        viewBox="0 0 300 160"
        preserveAspectRatio="none"
        aria-hidden="true"
    >
        {[10, 40, 70, 100, 130, 160].map((y, i) => (
            <path
                key={y}
                d={`M -20 ${y} C 60 ${
                    y - 16 - (i % 3) * 6
                }, 120 ${y + 20}, 200 ${y - 6}
                    S 320 ${y + 14}, 340 ${y}`}
                fill="none"
                stroke="#F6F1E4"
                strokeWidth="1"
            />
        ))}
    </svg>
);


// ==========================================
// ICONS
// ==========================================

const DashboardIcon = () => (
    <path
        d="M4 4h7v7H4V4zM13 4h7v7h-7V4zM4 13h7v7H4v-7zM13 13h7v7h-7v-7z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
    />
);

const LivestockIcon = () => (
    <path
        d="M4 17c0-3.5 2.5-6 6-6h4c3.5 0 6 2.5 6 6M9 11V7a3 3 0 013-3 3 3 0 013 3v4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
    />
);

const HealthIcon = () => (
    <path
        d="M12 4v16M4 12h16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
    />
);

const VaccinationIcon = () => (
    <path
        d="M6 18 18 6M9 6l4 4M14 11l4 4M6 18l-2 2M6 18l3-1-2-2-1 3z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
    />
);

const VeterinarianIcon = () => (
    <path
        d="M12 20s-7-4-7-10a4 4 0 017-2 4 4 0 017 2c0 6-7 10-7 10z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
    />
);

const UsersIcon = () => (
    <>
        <circle
            cx="9"
            cy="8"
            r="3"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
        />

        <path
            d="M3 20c0-3.5 2.5-6 6-6s6 2.5 6 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
        />

        <path
            d="M16 5.5a3 3 0 010 5.8M18 14c2 .8 3 2.4 3 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
        />
    </>
);

const LogoutIcon = () => (
    <path
        d="M9 6l-5 6 5 6M4 12h12M14 4h4a2 2 0 012 2v12a2 2 0 01-2 2h-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
    />
);


// ==========================================
// SIDEBAR
// ==========================================

const Sidebar = () => {

    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    const role = user?.role;


    // ==========================================
    // FARMER MENU
    // ==========================================

    const farmerMenu = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: <DashboardIcon />
        },
        {
            name: "Livestock",
            path: "/livestock",
            icon: <LivestockIcon />
        },
        {
            name: "Health Records",
            path: "/health-records",
            icon: <HealthIcon />
        },
        {
            name: "Vaccinations",
            path: "/vaccinations",
            icon: <VaccinationIcon />
        },
        {
            name: "Veterinarian",
            path: "/veterinarian",
            icon: <VeterinarianIcon />
        }
    ];


    // ==========================================
    // VETERINARIAN MENU
    // ==========================================

    const veterinarianMenu = [
        {
            name: "Dashboard",
            path: "/vet/dashboard",
            icon: <DashboardIcon />
        },
        {
            name: "Health Records",
            path: "/health-records",
            icon: <HealthIcon />
        },
        {
            name: "Vaccinations",
            path: "/vaccinations",
            icon: <VaccinationIcon />
        },
        {
            name: "Requests",
            path: "/veterinarian/requests",
            icon: <VeterinarianIcon />
        }
    ];


    // ==========================================
    // ADMIN MENU
    // ==========================================

    const adminMenu = [
        {
            name: "Admin Dashboard",
            path: "/admin",
            icon: <DashboardIcon />
        },
        {
            name: "User Management",
            path: "/admin/users",
            icon: <UsersIcon />
        }
    ];


    // ==========================================
    // SELECT MENU BASED ON ROLE
    // ==========================================

    let menuItems = [];

    if (role === "FARMER") {
        menuItems = farmerMenu;
    } else if (role === "VETERINARIAN") {
        menuItems = veterinarianMenu;
    } else if (role === "ADMIN") {
        menuItems = adminMenu;
    }


    // ==========================================
    // LOGOUT
    // ==========================================

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };


    return (
        <aside className="w-64 min-h-screen bg-[#1F3B2C] text-[#F6F1E4] flex flex-col font-[Inter,sans-serif]">

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

                .av-serif {
                    font-family: 'Fraunces', serif;
                }

                .av-mono {
                    font-family: 'JetBrains Mono', monospace;
                }
            `}</style>


            {/* ==================================
                BRAND
            ================================== */}

            <div className="relative overflow-hidden px-6 py-7 border-b border-[#3F5C46]">

                <ContourTexture />

                <div className="relative z-10 flex items-center gap-3">

                    <BrandMark />

                    <div>

                        <p className="av-mono text-[10px] tracking-[0.22em] uppercase text-[#D9A441]">
                            AgriVet Connect
                        </p>

                        <h1 className="av-serif text-xl font-medium mt-0.5">
                            Farm Management
                        </h1>

                    </div>

                </div>

            </div>


            {/* ==================================
                USER ROLE
            ================================== */}

            <div className="px-6 py-4 border-b border-[#3F5C46]">

                <p className="av-mono text-[9px] tracking-[0.2em] uppercase text-[#7FA085]">
                    Signed in as
                </p>

                <p className="text-sm text-[#F6F1E4] mt-1">
                    {user?.full_name || "User"}
                </p>

                <p className="text-[10px] text-[#D9A441] mt-1">
                    {role || "UNKNOWN"}
                </p>

            </div>


            {/* ==================================
                NAVIGATION
            ================================== */}

            <nav className="flex-1 px-3 py-6">

                <p className="av-mono text-[10px] tracking-[0.22em] uppercase text-[#7FA085] px-3 mb-3">
                    Menu
                </p>


                <div className="space-y-1">

                    {menuItems.map((item) => (

                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-3 rounded-sm text-sm transition-colors ${
                                    isActive
                                        ? "bg-[#D9A441] text-[#1F3B2C] font-medium"
                                        : "text-[#D8E2D9] hover:bg-[#2C4A37]"
                                }`
                            }
                        >

                            <svg
                                width="17"
                                height="17"
                                viewBox="0 0 24 24"
                                className="shrink-0"
                                aria-hidden="true"
                            >
                                {item.icon}
                            </svg>

                            <span>
                                {item.name}
                            </span>

                        </NavLink>

                    ))}

                </div>

            </nav>


            {/* ==================================
                LOGOUT
            ================================== */}

            <div className="px-3 py-5 border-t border-[#3F5C46]">

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-3 text-sm text-[#D8E2D9] hover:bg-[#2C4A37] rounded-sm transition-colors"
                >

                    <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        className="shrink-0"
                        aria-hidden="true"
                    >
                        <LogoutIcon />
                    </svg>

                    <span>
                        Logout
                    </span>

                </button>

            </div>

        </aside>
    );
};

export default Sidebar;