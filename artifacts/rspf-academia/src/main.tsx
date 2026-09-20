import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const canonicalHost = "srmaacademy.com";
const isLegacyWwwHost = window.location.hostname === `www.${canonicalHost}`;

if (isLegacyWwwHost) {
  const canonicalUrl = new URL(window.location.href);
  canonicalUrl.hostname = canonicalHost;
  window.location.replace(canonicalUrl);
} else {
  createRoot(document.getElementById("root")!).render(<App />);
}

if (!isLegacyWwwHost && "serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).then((registration) => {
      void registration.update();
      const checkForUpdate = () => void registration.update();
      window.addEventListener("focus", checkForUpdate);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") checkForUpdate();
      });
    });
  });
}
