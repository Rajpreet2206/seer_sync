import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { auth, provider } from "../lib/firebase";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
export default function AuthButton() {
    const [user, setUser] = useState(auth.currentUser);
    useEffect(() => onAuthStateChanged(auth, setUser), []);
    const login = async () => await signInWithPopup(auth, provider);
    const logout = async () => await signOut(auth);
    return (_jsx("div", { className: "mt-3", children: user ? (_jsxs("button", { onClick: logout, className: "bg-red-500 text-white p-2 rounded w-full", children: ["Sign out (", user.displayName, ")"] })) : (_jsx("button", { onClick: login, className: "bg-blue-600 text-white p-2 rounded w-full", children: "Sign in with Google" })) }));
}
