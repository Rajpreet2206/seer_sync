import { db } from "./firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
export async function createOffer(uid, peerUid, offer) {
    await setDoc(doc(db, "calls", `${uid}_${peerUid}`), { offer });
}
export function listenForAnswer(uid, peerUid, callback) {
    const ref = doc(db, "calls", `${peerUid}_${uid}`);
    return onSnapshot(ref, (snapshot) => {
        if (snapshot.exists() && snapshot.data().answer) {
            callback(snapshot.data().answer);
        }
    });
}
