import { useEffect, useMemo, useState } from "react";
import API from "../services/api";

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");

    // ==========================================
    // LOAD USERS
    // ==========================================

    useEffect(() => {
        let cancelled = false;

        const loadUsers = async () => {
            try {
                const response = await API.get("/admin/users");

                if (!cancelled) {
                    console.log("ADMIN USERS:", response.data);

                    setUsers(response.data);
                    setError("");
                    setLoading(false);
                }
            } catch (error) {
                if (!cancelled) {
                    console.error("ADMIN USERS ERROR:", error);

                    setError(
                        error.response?.data?.message ||
                        "Failed to load users"
                    );

                    setLoading(false);
                }
            }
        };

        loadUsers();

        return () => {
            cancelled = true;
        };
    }, []);

    // ==========================================
    // USER COUNTS
    // ==========================================

    const totalUsers = users.length;

    const farmerCount = users.filter(
        (user) => user.role_name === "FARMER"
    ).length;

    const veterinarianCount = users.filter(
        (user) => user.role_name === "VETERINARIAN"
    ).length;

    const adminCount = users.filter(
        (user) => user.role_name === "ADMIN"
    ).length;

    // ==========================================
    // SEARCH + FILTER
    // ==========================================

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {

            const searchText = search.toLowerCase();

            const matchesSearch =
                user.full_name?.toLowerCase().includes(searchText) ||
                user.email?.toLowerCase().includes(searchText) ||
                user.phone?.toLowerCase().includes(searchText);

            const matchesRole =
                roleFilter === "ALL" ||
                user.role_name === roleFilter;

            return matchesSearch && matchesRole;
        });
    }, [users, search, roleFilter]);

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F6F1E4]">

                <div className="text-center">

                    <div className="h-8 w-8 mx-auto rounded-full border-2 border-[#DED7C9] border-t-[#1F3B2C] animate-spin" />

                    <p className="text-[11px] tracking-[0.2em] uppercase text-[#8A8072] mt-4">
                        Loading users
                    </p>

                </div>

            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F6F1E4] px-6 py-12">

            <main className="max-w-7xl mx-auto">

                {/* ==================================
                    HEADER
                ================================== */}

                <div className="mb-10">

                    <p className="text-[11px] tracking-[0.25em] uppercase text-[#A8452F] mb-3">
                        Administration
                    </p>

                    <h1 className="text-[2.1rem] font-medium text-[#2B2620]">
                        User Management
                    </h1>

                    <p className="text-sm text-[#8A8072] mt-3">
                        Manage and monitor registered users across AgriVet Connect.
                    </p>

                </div>


                {/* ==================================
                    ERROR
                ================================== */}

                {error && (
                    <div className="mb-6 border-l-2 border-[#A8452F] bg-[#A8452F]/[0.06] px-5 py-4">

                        <p className="text-[10px] tracking-[0.15em] uppercase text-[#A8452F] mb-1">
                            Error
                        </p>

                        <p className="text-sm text-[#A8452F]">
                            {error}
                        </p>

                    </div>
                )}


                {/* ==================================
                    STATISTICS
                ================================== */}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">

                    {/* Total */}

                    <div className="bg-white border border-[#DED7C9] rounded-sm p-6 relative overflow-hidden">

                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#1F3B2C]" />

                        <p className="text-[10px] tracking-[0.18em] uppercase text-[#8A8072]">
                            Total Users
                        </p>

                        <p className="text-4xl font-medium text-[#1F3B2C] mt-4">
                            {totalUsers}
                        </p>

                        <p className="text-xs text-[#8A8072] mt-2">
                            Registered accounts
                        </p>

                    </div>


                    {/* Farmers */}

                    <div className="bg-white border border-[#DED7C9] rounded-sm p-6 relative overflow-hidden">

                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#D9A441]" />

                        <p className="text-[10px] tracking-[0.18em] uppercase text-[#8A8072]">
                            Farmers
                        </p>

                        <p className="text-4xl font-medium text-[#8A651C] mt-4">
                            {farmerCount}
                        </p>

                        <p className="text-xs text-[#8A8072] mt-2">
                            Livestock owners
                        </p>

                    </div>


                    {/* Veterinarians */}

                    <div className="bg-white border border-[#DED7C9] rounded-sm p-6 relative overflow-hidden">

                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#A8452F]" />

                        <p className="text-[10px] tracking-[0.18em] uppercase text-[#8A8072]">
                            Veterinarians
                        </p>

                        <p className="text-4xl font-medium text-[#A8452F] mt-4">
                            {veterinarianCount}
                        </p>

                        <p className="text-xs text-[#8A8072] mt-2">
                            Veterinary professionals
                        </p>

                    </div>


                    {/* Admins */}

                    <div className="bg-white border border-[#DED7C9] rounded-sm p-6 relative overflow-hidden">

                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#1F3B2C]" />

                        <p className="text-[10px] tracking-[0.18em] uppercase text-[#8A8072]">
                            Administrators
                        </p>

                        <p className="text-4xl font-medium text-[#1F3B2C] mt-4">
                            {adminCount}
                        </p>

                        <p className="text-xs text-[#8A8072] mt-2">
                            System administrators
                        </p>

                    </div>

                </div>


                {/* ==================================
                    FILTERS
                ================================== */}

                <div className="bg-white border border-[#DED7C9] rounded-sm p-5 mb-6">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        {/* Search */}

                        <div className="md:col-span-2">

                            <label className="block text-[10px] tracking-[0.15em] uppercase text-[#8A8072] mb-2">
                                Search Users
                            </label>

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                placeholder="Search by name, email or phone..."
                                className="w-full border border-[#DED7C9] rounded-sm px-4 py-3 bg-[#F6F1E4] text-[#2B2620] outline-none focus:border-[#1F3B2C]"
                            />

                        </div>


                        {/* Role */}

                        <div>

                            <label className="block text-[10px] tracking-[0.15em] uppercase text-[#8A8072] mb-2">
                                Filter by Role
                            </label>

                            <select
                                value={roleFilter}
                                onChange={(e) =>
                                    setRoleFilter(e.target.value)
                                }
                                className="w-full border border-[#DED7C9] rounded-sm px-4 py-3 bg-[#F6F1E4] text-[#2B2620] outline-none focus:border-[#1F3B2C]"
                            >

                                <option value="ALL">
                                    All Roles
                                </option>

                                <option value="FARMER">
                                    Farmers
                                </option>

                                <option value="VETERINARIAN">
                                    Veterinarians
                                </option>

                                <option value="ADMIN">
                                    Administrators
                                </option>

                            </select>

                        </div>

                    </div>

                </div>


                {/* ==================================
                    RESULTS
                ================================== */}

                <div className="flex items-center justify-between mb-4">

                    <div>

                        <p className="text-[10px] tracking-[0.2em] uppercase text-[#A8452F]">
                            Registered Accounts
                        </p>

                        <h2 className="text-xl font-medium text-[#2B2620] mt-1">
                            Users
                        </h2>

                    </div>

                    <p className="text-xs text-[#8A8072]">
                        Showing {filteredUsers.length} of {totalUsers}
                    </p>

                </div>


                {/* ==================================
                    USER TABLE
                ================================== */}

                {filteredUsers.length === 0 ? (

                    <div className="bg-white border border-[#DED7C9] rounded-sm p-8">

                        <p className="text-sm text-[#8A8072]">
                            No users match your search or filter.
                        </p>

                    </div>

                ) : (

                    <div className="bg-white border border-[#DED7C9] rounded-sm overflow-hidden">

                        <div className="overflow-x-auto">

                            <table className="w-full text-sm">

                                <thead className="bg-[#1F3B2C] text-[#F6F1E4]">

                                    <tr>

                                        <th className="text-left px-6 py-4 font-medium">
                                            ID
                                        </th>

                                        <th className="text-left px-6 py-4 font-medium">
                                            Name
                                        </th>

                                        <th className="text-left px-6 py-4 font-medium">
                                            Email
                                        </th>

                                        <th className="text-left px-6 py-4 font-medium">
                                            Phone
                                        </th>

                                        <th className="text-left px-6 py-4 font-medium">
                                            Role
                                        </th>

                                        <th className="text-left px-6 py-4 font-medium">
                                            Registered
                                        </th>

                                    </tr>

                                </thead>


                                <tbody className="divide-y divide-[#DED7C9]">

                                    {filteredUsers.map((user) => (

                                        <tr
                                            key={user.user_id}
                                            className="hover:bg-[#F6F1E4]/50 transition-colors"
                                        >

                                            {/* ID */}

                                            <td className="px-6 py-4 text-[#8A8072]">
                                                #{user.user_id}
                                            </td>


                                            {/* NAME */}

                                            <td className="px-6 py-4">

                                                <p className="font-medium text-[#2B2620]">
                                                    {user.full_name}
                                                </p>

                                            </td>


                                            {/* EMAIL */}

                                            <td className="px-6 py-4 text-[#6B6255]">
                                                {user.email}
                                            </td>


                                            {/* PHONE */}

                                            <td className="px-6 py-4 text-[#6B6255]">
                                                {user.phone || "—"}
                                            </td>


                                            {/* ROLE */}

                                            <td className="px-6 py-4">

                                                <span
                                                    className={`inline-block px-3 py-1 text-[10px] uppercase tracking-wider ${
                                                        user.role_name === "ADMIN"
                                                            ? "bg-[#1F3B2C]/10 text-[#1F3B2C]"
                                                            : user.role_name === "VETERINARIAN"
                                                            ? "bg-[#A8452F]/10 text-[#A8452F]"
                                                            : "bg-[#D9A441]/10 text-[#8A651C]"
                                                    }`}
                                                >
                                                    {user.role_name}
                                                </span>

                                            </td>


                                            {/* REGISTERED */}

                                            <td className="px-6 py-4 text-[#8A8072]">

                                                {user.created_at
                                                    ? new Date(
                                                          user.created_at
                                                      ).toLocaleDateString(
                                                          "en-IN"
                                                      )
                                                    : "—"}

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

export default AdminUsers;