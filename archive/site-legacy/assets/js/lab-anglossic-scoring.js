import { ARCHETYPES, AXES, QUESTIONS } from "./lab-anglossic-data.js";

export function computeAxisMax() {
  return QUESTIONS.reduce((acc, question) => {
    for (const choice of question.choices) {
      for (const [axis, value] of Object.entries(choice.effects)) {
        acc[axis] = Math.max(acc[axis] || 0, Math.abs(value));
      }
    }
    return acc;
  }, {});
}

export function calculateResults(answers) {
  const totals = { F: 0, S: 0, A: 0, C: 0, N: 0 };
  for (const question of QUESTIONS) {
    const choice = question.choices.find((entry) => entry.key === answers[String(question.id)]);
    if (!choice) continue;
    for (const [axis, value] of Object.entries(choice.effects)) {
      totals[axis] += value;
    }
  }

  const match = ARCHETYPES
    .map((archetype) => ({
      ...archetype,
      score: Object.keys(AXES).reduce((sum, axis) => sum + Math.abs(totals[axis] - archetype.vector[axis]), 0),
    }))
    .sort((a, b) => a.score - b.score)[0];

  return { totals, archetype: match };
}
