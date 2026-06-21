import { requestJson } from "./api-client.js";
import { buildMailto, copyText, getTurnstileToken, resetTurnstile, setPendingState, setStatus } from "./form-utils.js";

// --- General inquiry ---
const contactForm = document.getElementById("contact-form");
const contactSubmit = document.getElementById("contact-submit");
const contactHelper = document.getElementById("contact-helper");
const contactFallback = document.getElementById("contact-mailto-fallback");
const contactCopy = document.getElementById("contact-copy");

let contactCopyText = "";

if (contactForm && contactSubmit && contactHelper && contactFallback && contactCopy) {
  const requestedReason = new URLSearchParams(window.location.search).get("reason");
  const reasonSelect = document.getElementById("contact-reason");
  if (requestedReason && reasonSelect instanceof HTMLSelectElement) {
    const matchingOption = Array.from(reasonSelect.options).find(
      (option) => option.value.toLowerCase() === requestedReason.toLowerCase(),
    );
    if (matchingOption) reasonSelect.value = matchingOption.value;
  }

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
        body: { reason, email, message, website, turnstileToken: getTurnstileToken() },
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
      resetTurnstile();
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
