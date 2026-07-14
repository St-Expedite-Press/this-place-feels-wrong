import { createDialogController } from "./dialog.js";
import { QUESTIONS } from "./lab-anglossic-data.js";
import { getCurrentQuestion, getNextUnanswered, getPreviousQuestionId, loadState, resetState, saveState } from "./lab-anglossic-state.js";
import { mountCompassUI } from "./lab-anglossic-ui.js";

const state = loadState();
if (!state.currentId) {
  state.currentId = QUESTIONS[0]?.id || null;
  saveState(state);
}

const modal = document.getElementById("compass-modal");
const dialog = document.getElementById("compass-dialog");
const gateModal = document.getElementById("compass-gate");
const gateDialog = document.getElementById("compass-gate-dialog");

const gateController = createDialogController({
  container: gateModal,
  dialog: gateDialog,
  closeButtons: [
    document.getElementById("compass-gate-close"),
    document.getElementById("compass-gate-skip"),
  ],
  initialFocus: document.getElementById("compass-gate-email"),
});

const compassController = createDialogController({
  trigger: document.getElementById("compass-launch"),
  container: modal,
  dialog,
  closeButtons: [document.getElementById("compass-close")],
  initialFocus: document.getElementById("compass-next"),
});

let bindGateSubmit = () => {};
const render = mountCompassUI({
  question: document.getElementById("compass-question"),
  progress: document.getElementById("compass-progress"),
  held: document.getElementById("compass-held"),
  index: document.getElementById("compass-index"),
  results: document.getElementById("compass-results"),
  gateHelper: document.getElementById("compass-gate-helper"),
  gateEmail: document.getElementById("compass-gate-email"),
  gateSubmit: document.getElementById("compass-gate-submit"),
}, state, {
  openGate() {
    gateController.open();
  },
  closeGate() {
    gateController.close();
  },
  bindGateSubmit(submitHandler, dismissHandler) {
    const submit = document.getElementById("compass-gate-submit");
    const skip = document.getElementById("compass-gate-skip");
    if (submit && !submit.dataset.bound) {
      submit.dataset.bound = "true";
      submit.addEventListener("click", submitHandler);
    }
    if (skip && !skip.dataset.bound) {
      skip.dataset.bound = "true";
      skip.addEventListener("click", () => {
        dismissHandler();
        gateController.close();
      });
    }
    bindGateSubmit = submitHandler;
  },
});

document.getElementById("compass-prev")?.addEventListener("click", () => {
  state.currentId = getPreviousQuestionId(state);
  saveState(state);
  render();
});

document.getElementById("compass-next")?.addEventListener("click", () => {
  state.currentId = getNextUnanswered(state) || getCurrentQuestion(state)?.id;
  saveState(state);
  render();
});

document.getElementById("compass-hold")?.addEventListener("click", () => {
  if (state.currentId && !state.held.includes(state.currentId)) {
    state.held.push(state.currentId);
  }
  state.currentId = getNextUnanswered(state) || state.currentId;
  saveState(state);
  render();
});

document.getElementById("compass-reset")?.addEventListener("click", () => {
  const fresh = resetState();
  Object.assign(state, fresh);
  render();
});

render();
