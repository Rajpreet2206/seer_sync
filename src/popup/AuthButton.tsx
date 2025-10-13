import { useState, useEffect } from "react";
import { auth, provider } from "../lib/firebase";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";

export default function AuthButton() {
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  const login = async () => await signInWithPopup(auth, provider);
  const logout = async () => await signOut(auth);

  return (
    <div className="mt-3">
      {user ? (
        <button onClick={logout} className="bg-red-500 text-white p-2 rounded w-full">
          Sign out ({user.displayName})
        </button>
      ) : (
        <button onClick={login} className="bg-blue-600 text-white p-2 rounded w-full">
          Sign in with Google
        </button>
      )}
    </div>
  );
}
