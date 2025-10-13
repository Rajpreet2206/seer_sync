import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import AuthButton from './AuthButton';
import FriendsList from './FriendsList';
function App() {
    return (_jsxs("div", { className: "p-4", children: [_jsx("h1", { className: "text-xl font-bold", children: "SeerSync" }), _jsx("p", { children: "Extension popup content here" }), _jsx(AuthButton, {}), _jsx(FriendsList, {})] }));
}
export default App;
