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
    amountLabel.textContent = "Choose an amount. Seal it.";
    return;
  }
  amountLabel.textContent = `${formatUsd(numeric)} selected. Seal it.`;
}

if (amountInput) {
  amountInput.addEventListener("input", syncPresetState);
  window.addEventListener("load", syncPresetState, { once: true });
  window.addEventListener("pageshow", syncPresetState);
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
      setStatus(helper, "Enter an amount to continue.", "error");
      return;
    }

    setPendingState(submitButton, true, "Sealing...");
    setStatus(helper, "Opening secure checkout...", "info");

    try {
      const data = await requestJson("/api/donate/session", {
        method: "POST",
        body: { amount },
      });

      if (!data?.url) {
        throw new Error("Missing checkout URL");
      }

      setStatus(helper, "Opening Stripe checkout...", "success");
      window.location.assign(String(data.url));
    } catch {
      setStatus(helper, "Secure checkout is unavailable right now. Please try again shortly.", "error");
      setPendingState(submitButton, false);
    }
  });

  syncPresetState();
}
