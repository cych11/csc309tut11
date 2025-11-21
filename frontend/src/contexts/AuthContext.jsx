import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

// Production backend URL (no trailing slash!)
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    // Check token on mount
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const fetchUser = async () => {
            try {
                const res = await fetch(`${VITE_BACKEND_URL}/user/me`, {
                    headers: { "Authorization": `Bearer ${token}` },
                });

                if (!res.ok) {
                    localStorage.removeItem("token");
                    setUser(null);
                    return;
                }

                const data = await res.json();
                setUser(data.user);
            } catch {
                localStorage.removeItem("token");
                setUser(null);
            }
        };

        fetchUser();
    }, []);

    const login = async (username, password) => {
        try {
            const res = await fetch(`${VITE_BACKEND_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                const err = await res.json();
                return err.message || "Login failed.";
            }

            const { token } = await res.json();
            localStorage.setItem("token", token);

            // Fetch full user info after login
            const userRes = await fetch(`${VITE_BACKEND_URL}/user/me`, {
                headers: { "Authorization": `Bearer ${token}` },
            });
            const userData = await userRes.json();
            setUser(userData.user);

            navigate("/profile");
        } catch (error) {
            setUser(null);
            return error.message;
        }

        return "";
    };

    const register = async ({ username, firstname, lastname, password }) => {
        try {
            const res = await fetch(`${VITE_BACKEND_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, firstname, lastname, password }),
            });

            if (!res.ok) {
                const err = await res.json();
                return err.message || "Registration failed.";
            }

            navigate("/success");
        } catch (error) {
            return error.message;
        }

        return "";
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
