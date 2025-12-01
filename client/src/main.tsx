import "@fontsource/nunito";
import "@fontsource/quicksand";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }
  createRoot(rootElement).render(<App />);
} catch (e) {
  console.error("Startup error:", e);
  document.body.innerHTML = `<div style="color: red; padding: 20px;">
    <h1>Startup Error</h1>
    <pre>${e instanceof Error ? e.message : String(e)}</pre>
  </div>`;
}
