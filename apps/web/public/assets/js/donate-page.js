import { requestJson } from "./api-client.js";
import { setPendingState, setStatus } from "./form-utils.js";

const form = document.getElementById("donate-form");
const helper = document.getElementById("donate-helper");
const submitButton = document.getElementById("donate-submit");
const amountInput = document.getElementById("donate-amount");
const amountLabel = document.getElementById("donate-selected-amount");
const presetButtons = Array.from(document.querySelectorAll("[data-donation-amount]"));

function formatUsd(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function syncPresetState() {
  const value = String(amountInput?.value || "").trim();
  const numeric = Number(value);

  presetButtons.forEach((button) => {
    const matches = Number(button.dataset.donationAmount) === numeric;
    button.dataset.selected = matches ? "true" : "false";
    button.setAttribute("aria-pressed", matches ? "true" : "false");
  });

  if (!amountLabel) return;
  if (!numeric || !Number.isFinite(numeric)) {
    amountLabel.textContent = "Choose an amount to continue.";
    return;
  }
  amountLabel.textContent = `Selected amount: ${formatUsd(numeric)}`;
}

if (amountInput) {
  amountInput.addEventListener("input", syncPresetState);
}

for (const button of presetButtons) {
  button.addEventListener("click", () => {
    if (!amountInput) return;
    amountInput.value = String(button.dataset.donationAmount || "");
    syncPresetState();
    amountInput.focus();
  });
}

if (form && helper && submitButton && amountInput) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const amount = String(amountInput.value || "").trim();
    const numeric = Number(amount);

    if (!amount || !Number.isFinite(numeric)) {
      setStatus(helper, "Enter a valid donation amount.", "error");
      return;
    }

    setPendingState(submitButton, true, "Redirecting...");
    setStatus(helper, "Creating secure checkout...", "info");

    try {
      const data = await requestJson("/api/donate/session", {
        method: "POST",
        body: { amount },
      });

      if (!data?.url) {
        throw new Error("Missing checkout URL");
      }

      setStatus(helper, "Redirecting to Stripe Checkout...", "success");
      window.location.assign(String(data.url));
    } catch {
      setStatus(helper, "Donation checkout is unavailable right now. Please try again shortly.", "error");
      setPendingState(submitButton, false);
    }
  });

  syncPresetState();
}
