import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dotenv from "dotenv";

dotenv.config();

const AuthContext = createContext(null);
const VITE_BACKEND_URL = process.env.VITE_BACKEND_URL || "https://csc309tut11-production-a7b0.up.railway.app";

/*
 * This provider should export a `user` context state that is 
 * set (to non-null) when:
 *     1. a hard reload happens while a user is logged in.
 *     2. the user just logged in.
 * `user` should be set to null when:
 *     1. a hard reload happens when no users are logged in.
 *     2. the user just logged out.
 */
export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    // Check token and fetch user on mount
    useEffect(() => {
        const token = localStorage.getItem("token");  // retrieve token from localStorage
        if (!token) return;  // if no token was retrieved, user isn't logged in

        // validate token
        const fetchUser = async () => {
            try {
                // fetch user data
                const res = await fetch(`${VITE_BACKEND_URL}/user/me`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });

                // token no longer valid, remove it and log out
                if (!res.ok) {
                    localStorage.removeItem("token");
                    setUser(null);
                    return;
                }

                // update user context state
                const data = await res.json();
                setUser(data.user);
            } catch {
                localStorage.removeItem("token");
                setUser(null);
            }
        };

        fetchUser();
    }, []);

    /*
     * Logout the currently authenticated user.
     *
     * @remarks This function will always navigate to "/".
     */
    const logout = () => {
        // TODO: complete me

        localStorage.removeItem("token");
        setUser(null);
        navigate("/");
    };

    /**
     * Login a user with their credentials.
     *
     * @remarks Upon success, navigates to "/profile". 
     * @param {string} username - The username of the user.
     * @param {string} password - The password of the user.
     * @returns {string} - Upon failure, Returns an error message.
     */
    const login = async (username, password) => {
        try {
            // try to login with user credentials
            const res = await fetch(`${VITE_BACKEND_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            // login failed 
            if (!res.ok) {
                const err = await res.json();
                return err.message || "Login failed.";
            }
            const { token } = await res.json();
            localStorage.setItem("token", token);

            // success, fetch user info after login
            const userRes = await fetch(`${VITE_BACKEND_URL}/user/me`, {
                headers: { "Authorization": `Bearer ${token}` },
            });
            const userData = await userRes.json();
            setUser(userData.user); // update user context

            navigate("/profile");
        } catch (error) {
            setUser(null);
            return error.message;
        }
        return "";
    };

    /**
     * Registers a new user. 
     * 
     * @remarks Upon success, navigates to "/".
     * @param {Object} userData - The data of the user to register.
     * @returns {string} - Upon failure, returns an error message.
     */
    const register = async ({ username, firstname, lastname, password }) => {
        try {
            // try to login with user credentials
            const res = await fetch(`${VITE_BACKEND_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, firstname, lastname, password }),
            });

            // registration failed
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

    return (
        <AuthContext.Provider value={{ user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
