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

if (!isLegacyWwwHost && "serviceWorker" in navigator) {
  void navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      void registration.unregister();
    }
  });
}
