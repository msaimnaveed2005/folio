import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);

/*
index.html: <div id="root">
   └── StrictMode
        └── BrowserRouter
             └── AuthProvider
                  └── App

<StrictMode> (Outermost dev helper):
A React development-only tool. It intentionally mounts components twice in development to verify our code doesn't have accidental memory leaks or broken side-effects. (It does nothing in production).

<BrowserRouter> (Routing Context):
Listens to the browser's address bar (window.location) and intercepts link clicks. It allows any component inside it to use hooks like useNavigate() and <Link>.

<AuthProvider> (Global Auth Memory):
Placed inside <BrowserRouter> and outside <App>. Because it wraps <App>, every single page and component inside your entire application has direct access to user, login, and logout via useAuth()!
  
<App /> (The Application Router):
The central traffic controller that decides which page component to display based on the current URL.
*/