import { requestJson } from "./api-client.js";
import { buildMailto, copyText, setPendingState, setStatus } from "./form-utils.js";
import { mountUpdatesSignup } from "./updates-signup.js";

const form = document.getElementById("contact-form");
const submitButton = document.getElementById("contact-submit");
const helper = document.getElementById("contact-helper");
const fallbackLink = document.getElementById("contact-mailto-fallback");
const copyButton = document.getElementById("contact-copy");

let lastCopyText = "";

if (form && submitButton && helper && fallbackLink && copyButton) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const reason = String(document.getElementById("contact-reason")?.value || "").trim();
    const email = String(document.getElementById("contact-email")?.value || "").trim();
    const message = String(document.getElementById("contact-message")?.value || "").trim();
    const website = String(document.getElementById("contact-website")?.value || "").trim();

    if (!email || !message) {
      setStatus(helper, "Add your email and message, then try again.", "error");
      return;
    }

    const subject = `St. Expedite Press — Contact${reason ? ` (${reason})` : ""}`;
    const lines = ["Contact form submission", "", reason ? `Reason: ${reason}` : "", `From: ${email}`, "", message].filter(Boolean);
    const mailto = buildMailto("editor@stexpedite.press", subject, lines.join("\n"));
    lastCopyText = `To: editor@stexpedite.press\nSubject: ${subject}\n\n${lines.join("\n")}`;
    fallbackLink.href = mailto;

    setPendingState(submitButton, true, "Sending...");
    setStatus(helper, "Sending your message...", "info");

    try {
      const data = await requestJson("/api/contact", {
        method: "POST",
        body: { reason, email, message, website },
      });
      setStatus(
        helper,
        data.id
          ? `Your message was received. A confirmation email is on the way. Reference: ${data.id}`
          : "Your message was received. A confirmation email is on the way.",
        "success",
      );
      form.reset();
    } catch (error) {
      setStatus(helper, "Automatic sending failed. Use the prepared email fallback below.", "error");
    } finally {
      setPendingState(submitButton, false);
    }
  });

  copyButton.addEventListener("click", async () => {
    if (!lastCopyText) return;
    const ok = await copyText(lastCopyText);
    setStatus(helper, ok ? "Copied the fallback email text." : "Copy dialog opened.", ok ? "success" : "info");
  });
}

mountUpdatesSignup({
  emailInput: document.getElementById("contact-updates-email"),
  submitButton: document.getElementById("contact-updates-submit"),
  helper: document.getElementById("contact-updates-helper"),
  openLink: document.getElementById("contact-updates-open"),
  copyButton: document.getElementById("contact-updates-copy"),
  dismissButton: document.getElementById("contact-updates-dismiss"),
  source: "contact",
});
