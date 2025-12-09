import { createRoot } from "react-dom/client";
import App from "./App.tsx";

// Darkone React Template SCSS (primary styles)
import "./assets/scss/style.scss";

// Keeping Tailwind temporarily until shadcn components are replaced in Phase 3
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
