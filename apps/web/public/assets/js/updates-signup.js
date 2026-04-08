import { requestJson } from "./api-client.js";
import { copyText, setPendingState, setStatus } from "./form-utils.js";

export function mountUpdatesSignup(config) {
  const {
    emailInput,
    submitButton,
    helper,
    openLink,
    copyButton,
    dismissButton,
    source,
    continueUrl = "https://ecoamericana.substack.com/s/ephemera",
  } = config;

  if (!emailInput || !submitButton || !helper || !openLink || !copyButton) return;

  let lastCopyText = continueUrl;

  submitButton.addEventListener("click", async () => {
    const email = String(emailInput.value || "").trim();
    if (!email) {
      setStatus(helper, "Enter your email, then try again.", "error");
      openLink.href = continueUrl;
      return;
    }

    setPendingState(submitButton, true, "Saving...");
    openLink.href = continueUrl;
    lastCopyText = continueUrl;

    try {
      const data = await requestJson("/api/updates", {
        method: "POST",
        body: { email, source },
      });
      setStatus(
        helper,
        data.alreadySignedUp
          ? "We already have your email on file. Continue to Substack if you want the hosted feed as well."
          : "Your address was saved. Continue to Substack if you want the hosted feed as well.",
        "success",
      );
    } catch (error) {
      setStatus(helper, "Could not save your signup right now. You can still continue to the hosted feed.", "error");
    } finally {
      setPendingState(submitButton, false);
    }
  });

  copyButton.addEventListener("click", async () => {
    const ok = await copyText(lastCopyText);
    setStatus(helper, ok ? "Copied the Substack link." : "Copy dialog opened.", ok ? "success" : "info");
  });

  dismissButton?.addEventListener("click", () => {
    helper.hidden = true;
  });
}
