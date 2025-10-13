import { db } from "./firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

export async function createOffer(uid: string, peerUid: string, offer: RTCSessionDescriptionInit) {
  await setDoc(doc(db, "calls", `${uid}_${peerUid}`), { offer });
}

export function listenForAnswer(uid: string, peerUid: string, callback: (answer: RTCSessionDescriptionInit) => void) {
  const ref = doc(db, "calls", `${peerUid}_${uid}`);
  return onSnapshot(ref, (snapshot) => {
    if (snapshot.exists() && snapshot.data().answer) {
      callback(snapshot.data().answer);
    }
  });
}
