import AuthButton from "./AuthButton";
import FriendsList from "./FriendsList";

export default function Popup() {
  return (
    <div className="p-4 w-64 text-center">
      <h3 className="font-bold text-lg">SeerSync</h3>
      <AuthButton />
      <FriendsList />
    </div>
  );
}
