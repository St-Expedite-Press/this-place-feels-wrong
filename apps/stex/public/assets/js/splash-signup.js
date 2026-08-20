import { requestJson } from "./api-client.js";
import { setPendingState, setStatus } from "./form-utils.js";

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The splash renders a desktop and a mobile form, so each carries its own
// Turnstile widget. Read the token from inside the submitted form rather than
// with a global query, which would pick up the hidden surface's empty field.
function scopedTurnstileToken(form) {
  return String(form.querySelector('[name="cf-turnstile-response"]')?.value ?? "").trim();
}

function resetScopedTurnstile(form) {
  const widget = form.querySelector(".cf-turnstile");
  try {
    if (widget && window.turnstile) window.turnstile.reset(widget);
  } catch {
    /* the widget resets itself on the next challenge */
  }
}

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
        body: { email, source, turnstileToken: scopedTurnstileToken(form) },
      });
      setStatus(
        helper,
        data.alreadySignedUp
          ? "You are already on the list."
          : "You are on the list.",
        "success",
      );
      form.reset();
    } catch (error) {
      setStatus(helper, "Could not save your signup. Try again in a moment.", "error");
    } finally {
      resetScopedTurnstile(form);
      setPendingState(submitButton, false);
    }
  });
}
