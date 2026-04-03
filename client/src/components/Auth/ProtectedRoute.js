import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Loader from '../Common/Loader';
import toast from 'react-hot-toast';

const ProtectedRoute = ({ allowedRoles = [] }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');

            if (!token || !userStr) {
                setLoading(false);
                return;
            }

            try {
                const user = JSON.parse(userStr);
                setIsAuthenticated(true);

                if (allowedRoles.length === 0 || allowedRoles.includes(user.role)) {
                    setIsAuthorized(true);
                }
            } catch (error) {
                console.error('Auth check error:', error);
                localStorage.clear();
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [allowedRoles]);

    if (loading) {
        return <Loader fullScreen />;
    }

    if (!isAuthenticated) {
        // Redirect to login but save the attempted location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!isAuthorized) {
        toast.error('You do not have permission to access this page');
        // Redirect based on role
        const user = JSON.parse(localStorage.getItem('user'));
        if (user.role === 'rider') return <Navigate to="/rider" replace />;
        if (user.role === 'driver') return <Navigate to="/driver" replace />;
        if (user.role === 'admin') return <Navigate to="/admin" replace />;
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
