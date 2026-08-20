import { requestJson } from "./api-client.js";
import { getTurnstileToken, resetTurnstile, setPendingState, setStatus } from "./form-utils.js";

const form = document.getElementById("order-form");
const packageInput = document.getElementById("order-package");
const sizeField = document.getElementById("order-size-field");
const sizeInput = document.getElementById("order-size");
const submitButton = document.getElementById("order-submit");
const helper = document.getElementById("order-helper");

function selectedNeedsShirt() {
  const option = packageInput?.options[packageInput.selectedIndex];
  return option?.dataset?.shirt === "true";
}

function syncSizeField() {
  if (!sizeField) return;
  sizeField.hidden = !selectedNeedsShirt();
}

if (form && packageInput && submitButton && helper) {
  syncSizeField();
  packageInput.addEventListener("change", syncSizeField);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setPendingState(submitButton, true, "Opening checkout...");

    try {
      const payload = {
        packageId: packageInput.value,
        turnstileToken: getTurnstileToken(),
      };
      if (selectedNeedsShirt()) payload.shirtSize = sizeInput?.value || "";

      // The Worker resolves the price from its own catalog; nothing about the
      // amount is sent from here.
      const data = await requestJson("/api/orders/session", { method: "POST", body: payload });

      if (data?.url) {
        setStatus(helper, "Taking you to Stripe...", "info");
        window.location.assign(data.url);
        return;
      }
      setStatus(helper, "Checkout is unavailable right now. Try again shortly.", "error");
    } catch (error) {
      const message = error?.status === 400
        ? "Choose an edition, and a shirt size if the set includes one."
        : "Could not open checkout. Try again shortly.";
      setStatus(helper, message, "error");
    } finally {
      resetTurnstile();
      setPendingState(submitButton, false);
    }
  });
}
