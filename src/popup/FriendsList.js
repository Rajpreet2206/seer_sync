import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { auth } from "../lib/firebase";
export default function FriendsList() {
    const [friends, setFriends] = useState([]);
    useEffect(() => {
        if (!auth.currentUser)
            return;
        const unsub = onSnapshot(collection(db, "users", auth.currentUser.uid, "friends"), (snapshot) => setFriends(snapshot.docs.map((doc) => doc.data())));
        return () => unsub();
    }, [auth.currentUser]);
    return (_jsxs("div", { className: "mt-4 text-left", children: [_jsx("h4", { className: "font-semibold mb-2", children: "Friends" }), _jsx("ul", { className: "text-sm", children: friends.map((f, i) => (_jsxs("li", { children: ["\uD83D\uDC64 ", f.displayName] }, i))) })] }));
}
