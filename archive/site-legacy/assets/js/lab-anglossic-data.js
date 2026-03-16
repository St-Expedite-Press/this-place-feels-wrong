export const STORAGE_KEY = "sep-anglossic-compass-v3";

export const AXES = {
  F: { label: "Freedom", negative: "Decree", positive: "Will" },
  S: { label: "Form", negative: "Order", positive: "Spirit" },
  A: { label: "Authority", negative: "Hierarchy", positive: "Conscience" },
  C: { label: "Collectivity", negative: "Commonwealth", positive: "Singularity" },
  N: { label: "Nature", negative: "Material", positive: "Transcendence" },
};

export const QUESTIONS = [
  {
    id: 1,
    section: "Freedom and Decree",
    prompt: "When failure arrives, which explanation feels closest to the truth?",
    choices: [
      { key: "A", label: "Order was violated and the consequence followed.", effects: { F: -2, A: -1 } },
      { key: "B", label: "Systems are indifferent to worth.", effects: { F: -1, C: -1 } },
      { key: "C", label: "Responsibility and chance were mixed together.", effects: { F: 0, C: 0 } },
      { key: "D", label: "The will still has room to answer.", effects: { F: 1, S: 1 } },
      { key: "E", label: "A hidden pattern is asking for recognition.", effects: { F: 2, N: 2 } }
    ]
  },
  {
    id: 2,
    section: "Freedom and Decree",
    prompt: "Freedom feels most real when:",
    choices: [
      { key: "A", label: "obedience aligns with reality", effects: { F: -2, S: -1 } },
      { key: "B", label: "constraints are understood and managed", effects: { F: -1, C: -1 } },
      { key: "C", label: "duty and preference hold in tension", effects: { F: 0, A: 0 } },
      { key: "D", label: "desire can author a new course", effects: { F: 1, S: 1 } },
      { key: "E", label: "self and world disclose a deeper unity", effects: { F: 2, N: 2 } }
    ]
  },
  {
    id: 3,
    section: "Form and Spirit",
    prompt: "In art, form is chiefly:",
    choices: [
      { key: "A", label: "a discipline that carries truth", effects: { S: -2, A: -1 } },
      { key: "B", label: "a shell built by institutions", effects: { S: -1, C: -1 } },
      { key: "C", label: "a frame that can help or hinder", effects: { S: 0, A: 0 } },
      { key: "D", label: "a living container for sensibility", effects: { S: 1, F: 1 } },
      { key: "E", label: "a threshold where spirit becomes visible", effects: { S: 2, N: 2 } }
    ]
  },
  {
    id: 4,
    section: "Form and Spirit",
    prompt: "Ritual is most valuable when it:",
    choices: [
      { key: "A", label: "binds a community to durable order", effects: { S: -2, C: -1 } },
      { key: "B", label: "makes power legible", effects: { S: -1, A: -1 } },
      { key: "C", label: "teaches repetition without superstition", effects: { S: 0, C: 0 } },
      { key: "D", label: "creates a humane cadence for meaning", effects: { S: 1, F: 1 } },
      { key: "E", label: "opens an encounter with the sacred", effects: { S: 2, N: 2 } }
    ]
  },
  {
    id: 5,
    section: "Authority and Conscience",
    prompt: "Authority is most legitimate when it:",
    choices: [
      { key: "A", label: "guards inherited order", effects: { A: -2, S: -1 } },
      { key: "B", label: "controls instability effectively", effects: { A: -1, C: -1 } },
      { key: "C", label: "can justify itself in public reason", effects: { A: 0, C: 0 } },
      { key: "D", label: "answers to moral witness", effects: { A: 1, F: 1 } },
      { key: "E", label: "serves a reality beyond administration", effects: { A: 2, N: 2 } }
    ]
  },
  {
    id: 6,
    section: "Authority and Conscience",
    prompt: "Disobedience becomes duty when:",
    choices: [
      { key: "A", label: "the order commands what should never be done", effects: { A: -2, N: 1 } },
      { key: "B", label: "the system turns openly predatory", effects: { A: -1, C: -1 } },
      { key: "C", label: "law loses public legitimacy", effects: { A: 0, C: 0 } },
      { key: "D", label: "conscience can no longer remain silent", effects: { A: 1, F: 1 } },
      { key: "E", label: "the soul must answer a deeper claim", effects: { A: 2, N: 2 } }
    ]
  },
  {
    id: 7,
    section: "Collectivity and Singularity",
    prompt: "The common good is best understood as:",
    choices: [
      { key: "A", label: "the right arrangement of ranks and duties", effects: { C: -2, A: -1 } },
      { key: "B", label: "an interest usually captured by power", effects: { C: -1, A: -1 } },
      { key: "C", label: "the practical balance of plural claims", effects: { C: 0, A: 0 } },
      { key: "D", label: "a frame that protects the singular person", effects: { C: 1, F: 1 } },
      { key: "E", label: "many lives participating in one life", effects: { C: 2, N: 2 } }
    ]
  },
  {
    id: 8,
    section: "Collectivity and Singularity",
    prompt: "True community requires above all:",
    choices: [
      { key: "A", label: "shared hierarchy", effects: { C: -2, A: -1 } },
      { key: "B", label: "coordination and management", effects: { C: -1, S: -1 } },
      { key: "C", label: "mutual obligations made explicit", effects: { C: 0, A: 0 } },
      { key: "D", label: "friendship and chosen loyalty", effects: { C: 1, F: 1 } },
      { key: "E", label: "a spiritual recognition of belonging", effects: { C: 2, N: 2 } }
    ]
  },
  {
    id: 9,
    section: "Nature and Transcendence",
    prompt: "Nature reveals:",
    choices: [
      { key: "A", label: "a hierarchy that disciplines the observer", effects: { N: -2, S: -1 } },
      { key: "B", label: "material process without consolation", effects: { N: -1, C: -1 } },
      { key: "C", label: "law demanding prudence", effects: { N: 0, A: 0 } },
      { key: "D", label: "a mirror for imagination and care", effects: { N: 1, F: 1 } },
      { key: "E", label: "the visible edge of transcendence", effects: { N: 2, S: 2 } }
    ]
  },
  {
    id: 10,
    section: "Nature and Transcendence",
    prompt: "The most truthful poem is one that:",
    choices: [
      { key: "A", label: "perfects inherited measure", effects: { S: -2, N: -1 } },
      { key: "B", label: "names the cold fact plainly", effects: { N: -1, S: -1 } },
      { key: "C", label: "balances image and judgment", effects: { N: 0, S: 0 } },
      { key: "D", label: "frees language into new pressure", effects: { N: 1, F: 1 } },
      { key: "E", label: "discloses a hidden fire in things", effects: { N: 2, S: 2 } }
    ]
  },
  {
    id: 11,
    section: "Thresholds",
    prompt: "A ruin is beautiful when it:",
    choices: [
      { key: "A", label: "shows the endurance of form", effects: { S: -2, N: 0 } },
      { key: "B", label: "exposes material indifference", effects: { N: -1, S: -1 } },
      { key: "C", label: "teaches transience without romance", effects: { N: 0, S: 0 } },
      { key: "D", label: "releases imagination through fracture", effects: { S: 1, F: 1 } },
      { key: "E", label: "shines as broken revelation", effects: { N: 2, S: 2 } }
    ]
  },
  {
    id: 12,
    section: "Thresholds",
    prompt: "To build a dwelling well is to:",
    choices: [
      { key: "A", label: "express stable order through durable form", effects: { S: -2, A: -1 } },
      { key: "B", label: "submit design to utility", effects: { S: -1, N: -1 } },
      { key: "C", label: "fit purpose with proportion", effects: { S: 0, A: 0 } },
      { key: "D", label: "leave room for changing life", effects: { S: 1, F: 1 } },
      { key: "E", label: "make shelter translucent to the sacred", effects: { S: 2, N: 2 } }
    ]
  }
];

export const ARCHETYPES = [
  { name: "Custodian", vector: { F: -2, S: -2, A: -2, C: -1, N: 0 }, summary: "You lean toward order, durable form, and stewardship." },
  { name: "Realist", vector: { F: -1, S: -1, A: -1, C: -1, N: -2 }, summary: "You expect institutions and matter to remain stubbornly real." },
  { name: "Civic Moderate", vector: { F: 0, S: 0, A: 0, C: 0, N: 0 }, summary: "You seek balance, intelligibility, and public justification." },
  { name: "Renewer", vector: { F: 1, S: 1, A: 1, C: 1, N: 0 }, summary: "You favor conscience, personality, and the chance of remaking form." },
  { name: "Mystic", vector: { F: 2, S: 2, A: 2, C: 2, N: 2 }, summary: "You look for hidden unity and revelation across structures." },
  { name: "Republican Formalist", vector: { F: 0, S: -1, A: 0, C: -1, N: 0 }, summary: "You trust disciplined public form more than personal intensity." },
  { name: "Romantic Dissenter", vector: { F: 2, S: 1, A: 1, C: 1, N: 1 }, summary: "You favor inward witness, imagination, and meaningful revolt." },
  { name: "Steward of Commons", vector: { F: -1, S: 0, A: -1, C: -2, N: 1 }, summary: "You think in terms of shared order and inherited obligations." }
];
