import { requestJson } from "./api-client.js";
import { getTurnstileToken, resetTurnstile, setPendingState, setStatus } from "./form-utils.js";

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const form = document.getElementById("schedule-form");
const email = document.getElementById("schedule-email");
const name = document.getElementById("schedule-name");
const subject = document.getElementById("schedule-subject");
const length = document.getElementById("schedule-length");
const timezone = document.getElementById("schedule-timezone");
const note = document.getElementById("schedule-note");
const submitButton = document.getElementById("schedule-submit");
const helper = document.getElementById("schedule-helper");

// Prefill the time zone so the reply can propose times that make sense.
if (timezone && !timezone.value) {
  try {
    timezone.value = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    /* leave it for the visitor to fill in */
  }
}

if (form && email && name && note && submitButton && helper) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const address = String(email.value || "").trim();
    if (!EMAIL_SHAPE.test(address)) {
      setStatus(helper, "Enter a valid email address, then try again.", "error");
      email.focus();
      return;
    }
    if (!String(note.value || "").trim()) {
      setStatus(helper, "Describe what you are trying to build, then try again.", "error");
      note.focus();
      return;
    }

    const chosenWindows = Array.from(form.querySelectorAll('input[name="window"]:checked'))
      .map((input) => input.value);

    const message = [
      `Name: ${String(name.value || "").trim() || "(not given)"}`,
      `Concerns: ${subject?.value || "(not given)"}`,
      `Length: ${length?.value || "(not given)"}`,
      `Availability: ${chosenWindows.length ? chosenWindows.join("; ") : "(not given)"}`,
      `Time zone: ${String(timezone?.value || "").trim() || "(not given)"}`,
      "",
      String(note.value || "").trim(),
    ].join("\n");

    setPendingState(submitButton, true, "Sending...");

    try {
      const data = await requestJson("/api/contact", {
        method: "POST",
        body: {
          email: address,
          reason: "Lab — scheduling request",
          message,
          turnstileToken: getTurnstileToken(),
        },
      });
      setStatus(
        helper,
        data?.id
          ? `Sent. Your reference is ${data.id}. A reply with proposed times usually arrives within a working day.`
          : "Sent. A reply with proposed times usually arrives within a working day.",
        "success",
      );
      form.reset();
    } catch (error) {
      setStatus(helper, "Could not send that request. Try again shortly, or write to editor@stexpedite.press.", "error");
    } finally {
      resetTurnstile();
      setPendingState(submitButton, false);
    }
  });
}
