import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import Livestock from "./pages/Livestock";
import HealthRecords from "./pages/HealthRecords";
import Vaccinations from "./pages/Vaccinations";
import Register from "./pages/Register";
import Veterinarian from "./pages/Veterinarian";
import VeterinarianRequests from "./pages/VeterinarianRequests";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import VeterinarianDashboard from "./pages/VeterinarianDashboard";
import Landing from "./pages/Landing";
import Farms from "./pages/Farm";
import Feed from "./pages/Feed";
import Schemes from "./pages/Schemes";
import AdminSchemes from "./pages/AdminSchemes";

const App = () => {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/"
                    element={<Landing />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={["FARMER"]}>
                            <Layout>
                                <Dashboard />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/livestock"
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                "FARMER",
                                "VETERINARIAN",
                                "ADMIN"
                            ]}
                        >
                            <Layout>
                                <Livestock />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/health-records"
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                "FARMER",
                                "VETERINARIAN",
                                "ADMIN"
                            ]}
                        >
                            <Layout>
                                <HealthRecords />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/vaccinations"
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                "FARMER",
                                "VETERINARIAN",
                                "ADMIN"
                            ]}
                        >
                            <Layout>
                                <Vaccinations />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/veterinarian"
                    element={
                        <ProtectedRoute allowedRoles={["FARMER"]}>
                            <Layout>
                                <Veterinarian />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/veterinarian/requests"
                    element={
                        <ProtectedRoute
                            allowedRoles={["VETERINARIAN"]}
                        >
                            <Layout>
                                <VeterinarianRequests />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/vet/dashboard"
                    element={
                        <ProtectedRoute
                            allowedRoles={["VETERINARIAN"]}
                        >
                            <Layout>
                                <VeterinarianDashboard />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ADMIN"]}
                        >
                            <Layout>
                                <AdminDashboard />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/users"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ADMIN"]}
                        >
                            <Layout>
                                <AdminUsers />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/farm"
                    element={
                        <ProtectedRoute allowedRoles={["FARMER"]}>
                            <Layout>
                                <Farms />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/feed"
                    element={
                        <ProtectedRoute allowedRoles={["FARMER"]}>
                            <Layout>
                                <Feed />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/schemes"
                    element={
                        <ProtectedRoute allowedRoles={["FARMER"]}>
                            <Layout>
                                <Schemes />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/schemes"
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                            <Layout>
                                <AdminSchemes />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

            </Routes>
        </BrowserRouter>
    );
};

export default App;