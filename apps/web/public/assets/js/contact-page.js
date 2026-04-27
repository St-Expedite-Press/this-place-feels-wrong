import { requestJson } from "./api-client.js";
import { buildMailto, copyText, setPendingState, setStatus } from "./form-utils.js";

// --- General inquiry ---
const contactForm = document.getElementById("contact-form");
const contactSubmit = document.getElementById("contact-submit");
const contactHelper = document.getElementById("contact-helper");
const contactFallback = document.getElementById("contact-mailto-fallback");
const contactCopy = document.getElementById("contact-copy");

let contactCopyText = "";

if (contactForm && contactSubmit && contactHelper && contactFallback && contactCopy) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const reason = String(document.getElementById("contact-reason")?.value || "").trim();
    const email = String(document.getElementById("contact-email")?.value || "").trim();
    const message = String(document.getElementById("contact-message")?.value || "").trim();
    const website = String(document.getElementById("contact-website")?.value || "").trim();

    if (!email || !message) {
      setStatus(contactHelper, "Add your email and message, then try again.", "error");
      return;
    }

    const subject = `St. Expedite Press — Contact${reason ? ` (${reason})` : ""}`;
    const lines = ["Contact inquiry", "", reason ? `Reason: ${reason}` : "", `From: ${email}`, "", message].filter(Boolean);
    const mailto = buildMailto("editor@stexpedite.press", subject, lines.join("\n"));
    contactCopyText = `To: editor@stexpedite.press\nSubject: ${subject}\n\n${lines.join("\n")}`;
    contactFallback.href = mailto;

    setPendingState(contactSubmit, true, "Sending...");
    setStatus(contactHelper, "Sending your message...", "info");

    try {
      const data = await requestJson("/api/contact", {
        method: "POST",
        body: { reason, email, message, website },
      });
      setStatus(
        contactHelper,
        data.id
          ? `Message received. Reference: ${data.id}`
          : "Message received.",
        "success",
      );
      contactForm.reset();
    } catch {
      setStatus(contactHelper, "Automatic sending failed. Use the prepared email fallback below.", "error");
    } finally {
      setPendingState(contactSubmit, false);
    }
  });

  contactCopy.addEventListener("click", async () => {
    if (!contactCopyText) return;
    const ok = await copyText(contactCopyText);
    setStatus(contactHelper, ok ? "Copied." : "Copy dialog opened.", ok ? "success" : "info");
  });
}

// --- Submission inquiry ---
const submitForm = document.getElementById("submit-form");
const submitButton = document.getElementById("submit-button");
const submitHelper = document.getElementById("submit-helper");
const submitFallback = document.getElementById("submit-mailto-fallback");
const submitCopy = document.getElementById("submit-copy");

let submitCopyText = "";

if (submitForm && submitButton && submitHelper && submitFallback && submitCopy) {
  submitForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = String(document.getElementById("submit-email")?.value || "").trim();
    const note = String(document.getElementById("submit-note")?.value || "").trim();
    const website = String(document.getElementById("submit-website")?.value || "").trim();

    if (!email) {
      setStatus(submitHelper, "Enter your email, then try again.", "error");
      return;
    }

    const subject = "St. Expedite Press — Submission";
    const lines = ["Submission inquiry", "", `Email: ${email}`, "", note || "(no note)"];
    const mailto = buildMailto("editor@stexpedite.press", subject, lines.join("\n"));
    submitFallback.href = mailto;
    submitCopyText = `To: editor@stexpedite.press\nSubject: ${subject}\n\n${lines.join("\n")}`;

    setPendingState(submitButton, true, "Sending...");
    setStatus(submitHelper, "Submitting your inquiry...", "info");

    try {
      const data = await requestJson("/api/submit", {
        method: "POST",
        body: { email, note, website },
      });
      setStatus(
        submitHelper,
        data.id
          ? `Inquiry received. Reference: ${data.id}`
          : "Inquiry received.",
        "success",
      );
      submitForm.reset();
    } catch {
      setStatus(submitHelper, "Automatic sending failed. Use the prepared email fallback below.", "error");
    } finally {
      setPendingState(submitButton, false);
    }
  });

  submitCopy.addEventListener("click", async () => {
    if (!submitCopyText) return;
    const ok = await copyText(submitCopyText);
    setStatus(submitHelper, ok ? "Copied." : "Copy dialog opened.", ok ? "success" : "info");
  });
}
