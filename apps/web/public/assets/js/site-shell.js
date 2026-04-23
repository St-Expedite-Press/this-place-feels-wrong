import { requestJson } from "./api-client.js";
import { copyText, setPendingState, setStatus } from "./form-utils.js";

document.documentElement.classList.add("js");

const SUBSTACK = "https://ecoamericana.substack.com/s/ephemera";

const form = document.getElementById("hero-updates-form");
const emailEl = document.getElementById("hero-updates-email");
const btnEl = document.getElementById("hero-updates-btn");
const helper = document.getElementById("hero-updates-helper");
const openLink = document.getElementById("hero-updates-open");
const copyBtn = document.getElementById("hero-updates-copy");
const dismissBtn = document.getElementById("hero-updates-dismiss");

if (form && emailEl && btnEl && helper && openLink && copyBtn && dismissBtn) {
  openLink.href = SUBSTACK;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = String(emailEl.value ?? "").trim();
    if (!email) {
      setStatus(helper, "Enter your email first.", "error");
      return;
    }

    setPendingState(btnEl, true, "...");
    try {
      const data = await requestJson("/api/updates", {
        method: "POST",
        body: { email, source: "hero-bar" },
      });
      setStatus(helper, data.alreadySignedUp ? "Already on file." : "On the list.", "success");
    } catch {
      setStatus(helper, "Not saved — you can still reach us at the link below.", "error");
    } finally {
      setPendingState(btnEl, false);
    }
  });

  copyBtn.addEventListener("click", async () => {
    const ok = await copyText(SUBSTACK);
    setStatus(helper, ok ? "Copied." : "Copy dialog opened.", ok ? "success" : "info");
  });

  dismissBtn.addEventListener("click", () => {
    helper.hidden = true;
  });
}
