import { requestJson } from "./api-client.js";
import { buildMailto, copyText, setPendingState, setStatus } from "./form-utils.js";

const form = document.getElementById("submit-form");
const submitButton = document.getElementById("submit-button");
const helper = document.getElementById("submit-helper");
const fallbackLink = document.getElementById("submit-mailto-fallback");
const copyButton = document.getElementById("submit-copy");

let lastCopyText = "";

if (form && submitButton && helper && fallbackLink && copyButton) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = String(document.getElementById("submit-email")?.value || "").trim();
    const note = String(document.getElementById("submit-note")?.value || "").trim();
    const website = String(document.getElementById("submit-website")?.value || "").trim();

    if (!email) {
      setStatus(helper, "Enter your email, then try again.", "error");
      return;
    }

    const subject = "St. Expedite Press — Submission";
    const lines = ["Submission inquiry", "", `Email: ${email}`, "", note || "(no note)"];
    const mailto = buildMailto("editor@stexpedite.press", subject, lines.join("\n"));
    fallbackLink.href = mailto;
    lastCopyText = `To: editor@stexpedite.press\nSubject: ${subject}\n\n${lines.join("\n")}`;

    setPendingState(submitButton, true, "Sending...");
    setStatus(helper, "Submitting your inquiry...", "info");

    try {
      const data = await requestJson("/api/submit", {
        method: "POST",
        body: { email, note, website },
      });
      setStatus(
        helper,
        data.id
          ? `Your inquiry was received. A confirmation email is on the way. Reference: ${data.id}`
          : "Your inquiry was received. A confirmation email is on the way.",
        "success",
      );
      form.reset();
    } catch {
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
