import { Link } from "react-router-dom";

const BrandMark = ({ stroke = "#D9A441", size = 34 }) => (
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


const Landing = () => {
    return (
        <div className="min-h-screen bg-[#F6F1E4] text-[#2B2620]">

            {/* =========================================
                NAVBAR
            ========================================= */}

            <nav className="border-b border-[#DED7C9] bg-[#F6F1E4]">

                <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

                    {/* Logo */}

                    <Link
                        to="/"
                        className="flex items-center gap-3"
                    >

                        <BrandMark />

                        <div>

                            <p className="text-[10px] tracking-[0.22em] uppercase text-[#D9A441] font-medium">
                                AgriVet Connect
                            </p>

                            <p className="text-lg font-medium text-[#1F3B2C]">
                                Farm Management
                            </p>

                        </div>

                    </Link>


                    {/* Navigation */}

                    <div className="hidden md:flex items-center gap-8">

                        <a
                            href="#features"
                            className="text-sm text-[#6B6255] hover:text-[#1F3B2C] transition-colors"
                        >
                            Features
                        </a>

                        <a
                            href="#how-it-works"
                            className="text-sm text-[#6B6255] hover:text-[#1F3B2C] transition-colors"
                        >
                            How It Works
                        </a>

                        <Link
                            to="/login"
                            className="text-sm text-[#1F3B2C] hover:text-[#A8452F] transition-colors"
                        >
                            Login
                        </Link>

                        <Link
                            to="/register"
                            className="bg-[#1F3B2C] text-[#F6F1E4] px-5 py-2.5 text-sm rounded-sm hover:bg-[#2D523D] transition-colors"
                        >
                            Get Started
                        </Link>

                    </div>

                </div>

            </nav>


            {/* =========================================
                HERO
            ========================================= */}

            <section className="relative overflow-hidden">

                {/* Decorative background */}

                <div className="absolute inset-0 pointer-events-none opacity-[0.08]">

                    <svg
                        className="w-full h-full"
                        viewBox="0 0 1200 600"
                        preserveAspectRatio="none"
                    >

                        <path
                            d="M-50 430 C200 250 350 520 600 320 S1000 180 1250 350"
                            fill="none"
                            stroke="#1F3B2C"
                            strokeWidth="2"
                        />

                        <path
                            d="M-50 500 C200 320 350 590 600 390 S1000 250 1250 420"
                            fill="none"
                            stroke="#1F3B2C"
                            strokeWidth="2"
                        />

                    </svg>

                </div>


                <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">

                    <div className="max-w-4xl">

                        <p className="text-[11px] tracking-[0.3em] uppercase text-[#A8452F] mb-5">
                            Connected livestock care
                        </p>


                        <h1 className="text-5xl md:text-7xl leading-[1.05] font-medium text-[#1F3B2C]">

                            Smarter livestock care.

                            <span className="block text-[#A8452F] mt-2">
                                Connected.
                            </span>

                        </h1>


                        <p className="mt-7 max-w-2xl text-lg md:text-xl leading-relaxed text-[#6B6255]">

                            AgriVet Connect brings farmers, livestock health
                            records and veterinarians together in one
                            centralized platform for better animal care.

                        </p>


                        <div className="flex flex-col sm:flex-row gap-4 mt-9">

                            <Link
                                to="/register"
                                className="inline-flex justify-center items-center bg-[#1F3B2C] text-[#F6F1E4] px-7 py-3.5 text-sm rounded-sm hover:bg-[#2D523D] transition-colors"
                            >
                                Get Started
                            </Link>


                            <Link
                                to="/login"
                                className="inline-flex justify-center items-center border border-[#1F3B2C] text-[#1F3B2C] px-7 py-3.5 text-sm rounded-sm hover:bg-[#1F3B2C] hover:text-[#F6F1E4] transition-colors"
                            >
                                Sign In
                            </Link>

                        </div>

                    </div>

                </div>

            </section>


            {/* =========================================
                FEATURES
            ========================================= */}

            <section
                id="features"
                className="bg-white border-y border-[#DED7C9]"
            >

                <div className="max-w-7xl mx-auto px-6 py-20">

                    <div className="max-w-2xl mb-12">

                        <p className="text-[10px] tracking-[0.25em] uppercase text-[#A8452F] mb-3">
                            Platform
                        </p>

                        <h2 className="text-3xl md:text-4xl font-medium text-[#1F3B2C]">
                            Everything needed for better livestock management.
                        </h2>

                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#DED7C9] border border-[#DED7C9]">

                        {/* Livestock */}

                        <div className="bg-white p-7">

                            <div className="w-10 h-10 rounded-sm bg-[#1F3B2C] text-[#D9A441] flex items-center justify-center text-lg mb-6">
                                01
                            </div>

                            <h3 className="text-xl font-medium text-[#1F3B2C]">
                                Livestock
                            </h3>

                            <p className="text-sm leading-relaxed text-[#6B6255] mt-3">
                                Maintain organized records for animals,
                                including identification, breed, species
                                and other important details.
                            </p>

                        </div>


                        {/* Health */}

                        <div className="bg-white p-7">

                            <div className="w-10 h-10 rounded-sm bg-[#1F3B2C] text-[#D9A441] flex items-center justify-center text-lg mb-6">
                                02
                            </div>

                            <h3 className="text-xl font-medium text-[#1F3B2C]">
                                Health Records
                            </h3>

                            <p className="text-sm leading-relaxed text-[#6B6255] mt-3">
                                Keep medical history, diagnoses,
                                treatments and veterinary visits
                                organized in one place.
                            </p>

                        </div>


                        {/* Vaccination */}

                        <div className="bg-white p-7">

                            <div className="w-10 h-10 rounded-sm bg-[#1F3B2C] text-[#D9A441] flex items-center justify-center text-lg mb-6">
                                03
                            </div>

                            <h3 className="text-xl font-medium text-[#1F3B2C]">
                                Vaccinations
                            </h3>

                            <p className="text-sm leading-relaxed text-[#6B6255] mt-3">
                                Track vaccination history, upcoming
                                doses and important vaccination
                                information for each animal.
                            </p>

                        </div>


                        {/* Veterinarian */}

                        <div className="bg-white p-7">

                            <div className="w-10 h-10 rounded-sm bg-[#1F3B2C] text-[#D9A441] flex items-center justify-center text-lg mb-6">
                                04
                            </div>

                            <h3 className="text-xl font-medium text-[#1F3B2C]">
                                Veterinarians
                            </h3>

                            <p className="text-sm leading-relaxed text-[#6B6255] mt-3">
                                Farmers can choose veterinarians and
                                send requests for assistance with
                                their livestock.
                            </p>

                        </div>

                    </div>

                </div>

            </section>


            {/* =========================================
                HOW IT WORKS
            ========================================= */}

            <section
                id="how-it-works"
                className="max-w-7xl mx-auto px-6 py-20"
            >

                <div className="max-w-2xl mb-12">

                    <p className="text-[10px] tracking-[0.25em] uppercase text-[#A8452F] mb-3">
                        Simple workflow
                    </p>

                    <h2 className="text-3xl md:text-4xl font-medium text-[#1F3B2C]">
                        From registration to better care.
                    </h2>

                </div>


                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                    <div>

                        <p className="text-5xl font-medium text-[#D9A441]">
                            01
                        </p>

                        <h3 className="text-xl font-medium text-[#1F3B2C] mt-4">
                            Register
                        </h3>

                        <p className="text-sm text-[#6B6255] mt-2 leading-relaxed">
                            Create your account and access the platform
                            based on your role.
                        </p>

                    </div>


                    <div>

                        <p className="text-5xl font-medium text-[#D9A441]">
                            02
                        </p>

                        <h3 className="text-xl font-medium text-[#1F3B2C] mt-4">
                            Add Livestock
                        </h3>

                        <p className="text-sm text-[#6B6255] mt-2 leading-relaxed">
                            Record and manage your animals and their
                            important information.
                        </p>

                    </div>


                    <div>

                        <p className="text-5xl font-medium text-[#D9A441]">
                            03
                        </p>

                        <h3 className="text-xl font-medium text-[#1F3B2C] mt-4">
                            Connect
                        </h3>

                        <p className="text-sm text-[#6B6255] mt-2 leading-relaxed">
                            Select a veterinarian and request
                            professional assistance.
                        </p>

                    </div>


                    <div>

                        <p className="text-5xl font-medium text-[#D9A441]">
                            04
                        </p>

                        <h3 className="text-xl font-medium text-[#1F3B2C] mt-4">
                            Manage Care
                        </h3>

                        <p className="text-sm text-[#6B6255] mt-2 leading-relaxed">
                            Maintain health and vaccination records
                            for better livestock care.
                        </p>

                    </div>

                </div>

            </section>


            {/* =========================================
                ROLES
            ========================================= */}

            <section className="bg-[#1F3B2C] text-[#F6F1E4]">

                <div className="max-w-7xl mx-auto px-6 py-20">

                    <div className="max-w-2xl mb-12">

                        <p className="text-[10px] tracking-[0.25em] uppercase text-[#D9A441] mb-3">
                            One platform
                        </p>

                        <h2 className="text-3xl md:text-4xl font-medium">
                            Built for everyone involved in livestock care.
                        </h2>

                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        <div className="border border-[#3F5C46] p-7">

                            <p className="text-[10px] tracking-[0.2em] uppercase text-[#D9A441]">
                                Farmer
                            </p>

                            <h3 className="text-2xl font-medium mt-4">
                                Manage your animals.
                            </h3>

                            <p className="text-sm text-[#C9D5CB] mt-3 leading-relaxed">
                                Manage livestock, monitor health,
                                track vaccinations and connect with
                                veterinarians.
                            </p>

                        </div>


                        <div className="border border-[#3F5C46] p-7">

                            <p className="text-[10px] tracking-[0.2em] uppercase text-[#D9A441]">
                                Veterinarian
                            </p>

                            <h3 className="text-2xl font-medium mt-4">
                                Provide better care.
                            </h3>

                            <p className="text-sm text-[#C9D5CB] mt-3 leading-relaxed">
                                Review farmer requests and manage
                                relevant health and vaccination
                                information.
                            </p>

                        </div>


                        <div className="border border-[#3F5C46] p-7">

                            <p className="text-[10px] tracking-[0.2em] uppercase text-[#D9A441]">
                                Administrator
                            </p>

                            <h3 className="text-2xl font-medium mt-4">
                                Manage the platform.
                            </h3>

                            <p className="text-sm text-[#C9D5CB] mt-3 leading-relaxed">
                                Monitor platform data and manage
                                registered users across the system.
                            </p>

                        </div>

                    </div>

                </div>

            </section>


            {/* =========================================
                CTA
            ========================================= */}

            <section className="max-w-7xl mx-auto px-6 py-20">

                <div className="border border-[#DED7C9] bg-white px-8 py-14 text-center">

                    <p className="text-[10px] tracking-[0.25em] uppercase text-[#A8452F]">
                        Get started
                    </p>

                    <h2 className="text-3xl md:text-4xl font-medium text-[#1F3B2C] mt-3">
                        Bring your livestock care together.
                    </h2>

                    <p className="max-w-xl mx-auto text-sm text-[#6B6255] mt-4 leading-relaxed">
                        Create your AgriVet Connect account and start
                        managing your livestock and veterinary care.
                    </p>

                    <Link
                        to="/register"
                        className="inline-block mt-7 bg-[#1F3B2C] text-[#F6F1E4] px-7 py-3.5 text-sm rounded-sm hover:bg-[#2D523D] transition-colors"
                    >
                        Create an Account
                    </Link>

                </div>

            </section>


            {/* =========================================
                FOOTER
            ========================================= */}

            <footer className="border-t border-[#DED7C9]">

                <div className="max-w-7xl mx-auto px-6 py-7 flex flex-col md:flex-row items-center justify-between gap-3">

                    <div className="flex items-center gap-3">

                        <BrandMark size={28} />

                        <div>

                            <p className="text-sm font-medium text-[#1F3B2C]">
                                AgriVet Connect
                            </p>

                            <p className="text-[10px] text-[#8A8072]">
                                Farm Management Platform
                            </p>

                        </div>

                    </div>


                    <p className="text-xs text-[#8A8072]">
                        © 2026 AgriVet Connect. All rights reserved.
                    </p>

                </div>

            </footer>

        </div>
    );
};

export default Landing;