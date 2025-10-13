import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { auth } from "../lib/firebase";

export default function FriendsList() {
  const [friends, setFriends] = useState<any[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const unsub = onSnapshot(collection(db, "users", auth.currentUser.uid, "friends"), (snapshot) =>
      setFriends(snapshot.docs.map((doc) => doc.data()))
    );
    return () => unsub();
  }, [auth.currentUser]);

  return (
    <div className="mt-4 text-left">
      <h4 className="font-semibold mb-2">Friends</h4>
      <ul className="text-sm">
        {friends.map((f, i) => (
          <li key={i}>👤 {f.displayName}</li>
        ))}
      </ul>
    </div>
  );
}
