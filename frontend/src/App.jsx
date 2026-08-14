import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import Livestock from "./pages/Livestock";
import HealthRecords from "./pages/HealthRecords";
import Vaccinations from "./pages/Vaccinations";
import Register from "./pages/Register";
import Veterinarian from "./pages/Veterinarian";
import VeterinarianRequests from "./pages/VeterinarianRequests";

const App = () => {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/login" element={<Login />} />

                <Route
                    path="/"
                    element={<Navigate to="/login" replace />}
                />
                <Route path="/register" element={<Register />} />
                
                <Route
                    path="/dashboard"
                    element={
                        <Layout>
                            <Dashboard />
                        </Layout>
                    }
                />

                <Route
                    path="/livestock"
                    element={
                        <Layout>
                            <Livestock />
                        </Layout>
                    }
                />

                <Route
                    path="/health-records"
                    element={
                        <Layout>
                            <HealthRecords />
                        </Layout>
                    }
                />

                <Route
                    path="/vaccinations"
                    element={
                        <Layout>
                            <Vaccinations />
                        </Layout>
                    }
                />

                <Route
                    path="/veterinarian"
                    element={<Veterinarian />}
                />

                <Route
                    path="/veterinarian/requests"
                    element={<VeterinarianRequests />}
                />

            </Routes>
        </BrowserRouter>
    );
};

export default App;