import { requestJson } from "./api-client.js";
import { setPendingState, setStatus } from "./form-utils.js";

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function mountSplashSignup({ form, emailInput, submitButton, helper, source = "splash" }) {
  if (!form || !emailInput || !submitButton || !helper) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = String(emailInput.value || "").trim();
    if (!EMAIL_SHAPE.test(email)) {
      setStatus(helper, "Enter a valid email address, then try again.", "error");
      emailInput.focus();
      return;
    }

    setPendingState(submitButton, true, "Saving...");

    try {
      const data = await requestJson("/api/updates", {
        method: "POST",
        body: { email, source },
      });
      setStatus(
        helper,
        data.alreadySignedUp
          ? "Your address is already on the list. Go through either door."
          : "You are on the list. Go through either door.",
        "success",
      );
      form.reset();
    } catch (error) {
      setStatus(helper, "Could not save your signup right now. Try again shortly.", "error");
    } finally {
      setPendingState(submitButton, false);
    }
  });
}
