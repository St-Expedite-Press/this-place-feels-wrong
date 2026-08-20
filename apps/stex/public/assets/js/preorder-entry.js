import { requestJson } from "./api-client.js";
import { getTurnstileToken, resetTurnstile, setPendingState, setStatus } from "./form-utils.js";

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const form = document.getElementById("preorder-form");
const emailInput = document.getElementById("preorder-email");
const packageInput = document.getElementById("preorder-package");
const submitButton = document.getElementById("preorder-submit");
const helper = document.getElementById("preorder-helper");

if (form && emailInput && packageInput && submitButton && helper) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = String(emailInput.value || "").trim();
    if (!EMAIL_SHAPE.test(email)) {
      setStatus(helper, "Enter a valid email address, then try again.", "error");
      emailInput.focus();
      return;
    }

    const choice = String(packageInput.value || "").trim();
    const chosenLabel = packageInput.options[packageInput.selectedIndex]?.textContent?.trim() || choice;

    setPendingState(submitButton, true, "Reserving...");

    try {
      await requestJson("/api/updates", {
        method: "POST",
        // The reservation is recorded against the signup's source field; no
        // payment rail exists for books yet, so nothing is charged here.
        body: {
          email,
          // source is capped at 80 chars server-side; keep the campaign key short.
          source: `preorder:lwlh:${choice}`.slice(0, 80),
          turnstileToken: getTurnstileToken(),
        },
      });
      setStatus(
        helper,
        `Reserved — ${chosenLabel}. Nothing has been charged. The press writes to you when the edition is ready.`,
        "success",
      );
    } catch (error) {
      setStatus(helper, "Could not record the reservation right now. Try again shortly.", "error");
    } finally {
      resetTurnstile();
      setPendingState(submitButton, false);
    }
  });
}
