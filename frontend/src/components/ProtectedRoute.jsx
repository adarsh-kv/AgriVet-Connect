import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    // User is not logged in
    if (!token || !userData) {
        return <Navigate to="/login" replace />;
    }

    let user;

    try {
        user = JSON.parse(userData);
    } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        return <Navigate to="/login" replace />;
    }

    // User role is not allowed
    if (
        allowedRoles &&
        !allowedRoles.includes(user.role)
    ) {
        // Send user to their own page
        if (user.role === "VETERINARIAN") {
            return (
                <Navigate
                    to="/veterinarian/requests"
                    replace
                />
            );
        }

        if (user.role === "ADMIN") {
            return (
                <Navigate
                    to="/admin"
                    replace
                />
            );
        }

        if (user.role === "FARMER") {
            return (
                <Navigate
                    to="/dashboard"
                    replace
                />
            );
        }

        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;