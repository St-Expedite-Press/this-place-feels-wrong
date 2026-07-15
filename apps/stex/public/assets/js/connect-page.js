import { requestJson } from "./api-client.js";
import { buildMailto, copyText, getTurnstileToken, resetTurnstile, setPendingState, setStatus } from "./form-utils.js";

const form = document.getElementById("connect-form");
const aboutSelect = document.getElementById("connect-about");
const noteLabel = document.getElementById("connect-note-label");
const manuscriptFields = document.getElementById("connect-manuscript-fields");
const submitButton = document.getElementById("connect-submit");
const assurance = document.getElementById("connect-assurance");
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
  const manuscript = isManuscript();
  noteLabel.textContent = manuscript ? "Project note" : "Message";
  if (submitButton) submitButton.textContent = manuscript ? "Submit manuscript" : "Send message";
  if (assurance) {
    assurance.textContent = manuscript
      ? "The document goes through the protected submission service, not the chatbot. A successful handoff returns a reference number."
      : "Replies come from a person. Your email is used only to reply.";
  }
  if (manuscriptFields) {
    manuscriptFields.hidden = !manuscript;
    manuscriptFields.querySelectorAll("input").forEach((input) => {
      if (input.id === "connect-genre") return;
      input.required = manuscript;
    });
  }
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
    const authorName = String(document.getElementById("connect-author-name")?.value || "").trim();
    const workTitle = String(document.getElementById("connect-work-title")?.value || "").trim();
    const genre = String(document.getElementById("connect-genre")?.value || "").trim();
    const file = document.getElementById("connect-file")?.files?.[0];
    const consent = Boolean(document.getElementById("connect-consent")?.checked);

    if (!email || !note) {
      setStatus(helper, "Add your email and message, then try again.", "error");
      return;
    }

    const manuscript = isManuscript();
    if (manuscript && (!authorName || !workTitle || !file || !consent)) {
      setStatus(helper, "Add the author, work title, manuscript file, and submission confirmation.", "error");
      return;
    }
    const subject = manuscript
      ? "St. Expedite Press — Submission"
      : `St. Expedite Press — Contact (${about})`;
    const lines = manuscript
      ? ["Submission", "", `Email: ${email}`, `Author: ${authorName}`, `Work: ${workTitle}`, genre ? `Genre: ${genre}` : "", file ? `Attachment: ${file.name}` : "", "", note].filter(Boolean)
      : ["Contact inquiry", "", `Reason: ${about}`, `From: ${email}`, "", note];
    fallbackLink.href = buildMailto("editor@stexpedite.press", subject, lines.join("\n"));
    lastCopyText = `To: editor@stexpedite.press\nSubject: ${subject}\n\n${lines.join("\n")}`;

    setPendingState(submitButton, true, "Sending...");
    setStatus(helper, "Sending your message...", "info");

    try {
      const turnstileToken = getTurnstileToken();
      const submission = new FormData();
      if (manuscript) {
        submission.set("email", email);
        submission.set("authorName", authorName);
        submission.set("workTitle", workTitle);
        submission.set("genre", genre);
        submission.set("note", note);
        submission.set("website", website);
        submission.set("consent", String(consent));
        submission.set("turnstileToken", turnstileToken);
        submission.set("file", file);
      }
      const data = manuscript
        ? await requestJson("/api/submit", { method: "POST", body: submission, timeout: 60_000 })
        : await requestJson("/api/contact", {
            method: "POST",
            body: { reason: about, email, message: note, website, turnstileToken },
          });
      setStatus(
        helper,
        data.id ? `${manuscript ? "Submission" : "Message"} received. Reference: ${data.id}` : "Received. A reply is on the way.",
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
