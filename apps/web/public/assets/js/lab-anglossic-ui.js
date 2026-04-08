import { AXES, QUESTIONS } from "./lab-anglossic-data.js";
import { calculateResults, computeAxisMax } from "./lab-anglossic-scoring.js";
import { getAnsweredCount, getCurrentQuestion, getNextUnanswered, getPreviousQuestionId, getQuestionById, saveState } from "./lab-anglossic-state.js";
import { requestJson } from "./api-client.js";
import { setPendingState, setStatus } from "./form-utils.js";

const AXIS_MAX = computeAxisMax();

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function mountCompassUI(elements, state, controllers) {
  const {
    question,
    progress,
    held,
    index,
    results,
    gateHelper,
    gateEmail,
    gateSubmit,
  } = elements;

  function renderProgress() {
    progress.innerHTML = `
      <div class="stack">
        <div class="section-heading">Progress</div>
        <p class="section-copy">${getAnsweredCount(state)} of ${QUESTIONS.length} prompts answered.</p>
      </div>
    `;
  }

  function renderHeld() {
    held.innerHTML = state.held.length
      ? state.held.map((id) => `<button class="lab-button" type="button" data-held-id="${id}">Return to prompt ${id}</button>`).join("")
      : `<p class="section-copy">No prompts are currently held aside.</p>`;
    held.querySelectorAll("[data-held-id]").forEach((button) => {
      button.addEventListener("click", () => {
        state.currentId = Number(button.dataset.heldId);
        saveState(state);
        renderAll();
      });
    });
  }

  function renderIndex() {
    index.innerHTML = state.order.map((id) => {
      const isAnswered = Boolean(state.answers[String(id)]);
      const isActive = id === state.currentId;
      return `<button class="lab-button${isActive ? " is-active" : ""}" type="button" data-question-id="${id}">Q${id}${isAnswered ? " // answered" : ""}</button>`;
    }).join("");
    index.querySelectorAll("[data-question-id]").forEach((button) => {
      button.addEventListener("click", () => {
        state.currentId = Number(button.dataset.questionId);
        saveState(state);
        renderAll();
      });
    });
  }

  function renderQuestion() {
    const current = getCurrentQuestion(state);
    if (!current) return;
    question.innerHTML = `
      <div class="stack">
        <p class="page-intro__kicker">${escapeHtml(current.section)} // Prompt ${current.id}</p>
        <h3 class="section-heading">${escapeHtml(current.prompt)}</h3>
        <div class="choice-list">
          ${current.choices.map((choice) => `
            <button class="choice-button${state.answers[String(current.id)] === choice.key ? " is-selected" : ""}" type="button" data-choice-key="${choice.key}">
              ${escapeHtml(choice.label)}
            </button>
          `).join("")}
        </div>
      </div>
    `;
    question.querySelectorAll("[data-choice-key]").forEach((button) => {
      button.addEventListener("click", () => {
        state.answers[String(current.id)] = button.dataset.choiceKey;
        state.held = state.held.filter((id) => id !== current.id);
        const next = getNextUnanswered(state);
        if (next) state.currentId = next;
        saveState(state);
        renderAll();
      });
    });
  }

  function renderResults() {
    const complete = getAnsweredCount(state) === QUESTIONS.length;
    if (!complete) {
      results.hidden = true;
      results.innerHTML = "";
      return;
    }

    if (state.gateStatus !== "submitted" && state.gateStatus !== "dismissed") {
      controllers.openGate();
      results.hidden = true;
      return;
    }

    const computed = calculateResults(state.answers);
    results.hidden = false;
    results.innerHTML = `
      <div class="stack">
        <div>
          <p class="page-intro__kicker">Reading</p>
          <h3 class="section-heading">${escapeHtml(computed.archetype.name)}</h3>
          <p class="section-copy">${escapeHtml(computed.archetype.summary)}</p>
        </div>
        <div class="results-grid">
          ${Object.entries(AXES).map(([axis, info]) => {
            const value = computed.totals[axis];
            const max = Math.max(AXIS_MAX[axis] * QUESTIONS.length, 1);
            return `
              <div class="axis-row">
                <strong>${escapeHtml(info.label)}</strong>
                <span class="section-copy">${value < 0 ? info.negative : info.positive} (${value})</span>
                <progress max="${max}" value="${Math.abs(value)}"></progress>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  async function submitGate() {
    const email = String(gateEmail.value || "").trim();
    if (!email) {
      setStatus(gateHelper, "Enter an email or continue without one.", "error");
      return;
    }
    setPendingState(gateSubmit, true, "Saving...");
    try {
      await requestJson("/api/updates", {
        method: "POST",
        body: { email, source: "anglossic-compass-results" },
      });
      state.gateStatus = "submitted";
      saveState(state);
      controllers.closeGate();
      renderAll();
    } catch {
      setStatus(gateHelper, "Could not save the email right now. You can continue without it.", "error");
    } finally {
      setPendingState(gateSubmit, false);
    }
  }

  controllers.bindGateSubmit(submitGate, () => {
    state.gateStatus = "dismissed";
    saveState(state);
    renderAll();
  });

  return function renderAll() {
    renderProgress();
    renderHeld();
    renderIndex();
    renderQuestion();
    renderResults();
  };
}
