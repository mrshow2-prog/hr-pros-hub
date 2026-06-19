import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// CV template fonts (loaded once for all preview surfaces).
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/syne/400.css";
import "@fontsource/syne/700.css";
import "@fontsource/syne/800.css";
import "@fontsource/fraunces/400.css";
import "@fontsource/fraunces/700.css";

createRoot(document.getElementById("root")!).render(<App />);
