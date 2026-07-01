import { requestJson } from "./api-client.js";
import { buildMailto, copyText, getTurnstileToken, resetTurnstile, setPendingState, setStatus } from "./form-utils.js";

const form = document.getElementById("connect-form");
const aboutSelect = document.getElementById("connect-about");
const noteLabel = document.getElementById("connect-note-label");
const submitButton = document.getElementById("connect-submit");
const helper = document.getElementById("connect-helper");
const fallbackLink = document.getElementById("connect-mailto-fallback");
const copyButton = document.getElementById("connect-copy");

let lastCopyText = "";

// Manuscript inquiries route to /api/submit; everything else to /api/contact.
function isManuscript() {
  return String(aboutSelect?.value || "").toLowerCase() === "manuscript";
}

function syncLabel() {
  if (!noteLabel) return;
  noteLabel.textContent = isManuscript() ? "Project note" : "Message";
}

if (form && aboutSelect && submitButton && helper && fallbackLink && copyButton) {
  // Preselect from ?about= (e.g. /connect?about=rights).
  const requested = new URLSearchParams(window.location.search).get("about");
  if (requested) {
    const match = Array.from(aboutSelect.options).find(
      (option) => option.value.toLowerCase() === requested.toLowerCase(),
    );
    if (match) aboutSelect.value = match.value;
  }
  syncLabel();
  aboutSelect.addEventListener("change", syncLabel);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const about = String(aboutSelect.value || "").trim();
    const email = String(document.getElementById("connect-email")?.value || "").trim();
    const note = String(document.getElementById("connect-note")?.value || "").trim();
    const website = String(document.getElementById("connect-website")?.value || "").trim();

    if (!email || !note) {
      setStatus(helper, "Add your email and message, then try again.", "error");
      return;
    }

    const manuscript = isManuscript();
    const subject = manuscript
      ? "St. Expedite Press — Submission"
      : `St. Expedite Press — Contact (${about})`;
    const lines = manuscript
      ? ["Submission inquiry", "", `Email: ${email}`, "", note]
      : ["Contact inquiry", "", `Reason: ${about}`, `From: ${email}`, "", note];
    fallbackLink.href = buildMailto("editor@stexpedite.press", subject, lines.join("\n"));
    lastCopyText = `To: editor@stexpedite.press\nSubject: ${subject}\n\n${lines.join("\n")}`;

    setPendingState(submitButton, true, "Sending...");
    setStatus(helper, "Sending your message...", "info");

    try {
      const turnstileToken = getTurnstileToken();
      const data = manuscript
        ? await requestJson("/api/submit", {
            method: "POST",
            body: { email, note, website, turnstileToken },
          })
        : await requestJson("/api/contact", {
            method: "POST",
            body: { reason: about, email, message: note, website, turnstileToken },
          });
      setStatus(
        helper,
        data.id ? `Received. Reference: ${data.id}` : "Received. A reply is on the way.",
        "success",
      );
      form.reset();
      syncLabel();
    } catch {
      setStatus(helper, "Automatic sending failed. Use the prepared email fallback below.", "error");
      resetTurnstile();
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
