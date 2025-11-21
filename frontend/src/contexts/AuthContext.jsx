import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

// TODO: get the BACKEND_URL.
const VITE_BACKEND_URL = "http://localhost:3000";

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
    const [user, setUser] = useState(null); // TODO: Modify me.

    useEffect(() => {
        const token = localStorage.getItem("token"); // retrieve token from localStorage
        if (!token) { // if no token was retrieved, user isn't logged in
            setUser(null);
            return;
        }

        // validate token
        const fetchUser = async () => {
            try {
                // fetch user data
                const res = await fetch(`${VITE_BACKEND_URL}/user/me`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
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
            }
            catch (error) {
                setUser(null);
                return error.message;
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
        // TODO: complete me
        if (typeof username !== "string" || typeof password !== "string") {
            return "Invalid request body.";
        }
        try {
            // try to login with user credentials
            const res = await fetch(`${VITE_BACKEND_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password })
            });

            // login failed 
            if (!res.ok) {
                return "Login failed.";
            }

            // successfully logged in
            const data = await res.json();
            const token = data.token;
            localStorage.setItem("token", token);
            setUser({ username }); // update user context

            navigate("/profile");
        }
        catch (error) {
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
    const register = async (userData) => {
        // TODO: complete me
        const { username, firstname, lastname, password } = userData;
        if (typeof username !== "string" || typeof password !== "string"
            || typeof firstname !== "string" || typeof lastname !== "string") {
            return "Invalid request body.";
        }

        try {
            // try to login with user credentials
            const res = await fetch(`${VITE_BACKEND_URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData)
            });

            // registration failed
            if (!res.ok) {
                let errorMessage = "Registration failed.";

                try {
                    const errorData = await res.json();
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    // ignore parse errors (empty body)
                }

                return errorMessage;
            }

            navigate("/success");
        }
        catch (error) {
            setUser(null);
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

export const useAuth = () => {
    return useContext(AuthContext);
};
