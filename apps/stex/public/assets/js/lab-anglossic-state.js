import { QUESTIONS, STORAGE_KEY } from "./lab-anglossic-data.js";

function shuffle(list) {
  const copy = [...list];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

export function createInitialState() {
  return {
    order: shuffle(QUESTIONS.map((question) => question.id)),
    answers: {},
    held: [],
    currentId: QUESTIONS[0]?.id || null,
    gateStatus: "idle",
  };
}

export function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw);
    return {
      ...createInitialState(),
      ...parsed,
    };
  } catch {
    return createInitialState();
  }
}

export function saveState(state) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
  const state = createInitialState();
  saveState(state);
  return state;
}

export function getCurrentQuestion(state) {
  return QUESTIONS.find((question) => question.id === state.currentId) || QUESTIONS[0];
}

export function getQuestionById(id) {
  return QUESTIONS.find((question) => question.id === id) || null;
}

export function getAnsweredCount(state) {
  return Object.keys(state.answers).length;
}

export function getNextUnanswered(state) {
  for (const id of state.order) {
    if (!state.answers[String(id)]) return id;
  }
  return null;
}

export function getPreviousQuestionId(state) {
  const index = state.order.indexOf(state.currentId);
  return index > 0 ? state.order[index - 1] : state.currentId;
}
