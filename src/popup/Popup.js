import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import AuthButton from "./AuthButton";
import FriendsList from "./FriendsList";
export default function Popup() {
    return (_jsxs("div", { className: "p-4 w-64 text-center", children: [_jsx("h3", { className: "font-bold text-lg", children: "SeerSync" }), _jsx(AuthButton, {}), _jsx(FriendsList, {})] }));
}
