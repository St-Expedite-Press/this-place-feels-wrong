# American Anglossic Compass: Product Spec

## Purpose

The quiz is not a casual personality test. It is a metaphysical-political instrument meant to classify a respondent's underlying grammar of order, freedom, conscience, community, and transcendence.

The build should preserve four core qualities:

- historical rather than topical language
- literary seriousness rather than internet-quiz tone
- weighted discovery rather than obvious type sorting
- result output as a blended field, not only a single hard label

## User-Facing Promise

The respondent is told that the quiz does not measure ordinary opinion. It measures how they intuit law, form, power, solidarity, beauty, nature, and spirit.

The result should feel like:

- a map of temperament
- a diagnosis of moral-aesthetic instinct
- a placement within an Anglossic historical field

## Quiz Structure

The build should use `55` questions across `6` sections:

1. Freedom and Decree
2. Form and Spirit
3. Authority and Conscience
4. Collectivity and Singularity
5. Nature and Transcendence
6. Mediation and Thresholds

Every question has five responses, `A` through `E`.

Questions should not be presented in canonical authoring order during normal play. The authored order exists for content maintenance and section balancing, not for the respondent-facing sequence.

The response pattern is stable:

- `A`: strong pull toward the negative pole
- `B`: moderate pull toward the negative pole
- `C`: centered or balancing answer
- `D`: moderate pull toward the positive pole
- `E`: strong pull toward the positive pole

## Interaction Model

The quiz should behave as a non-linear instrument rather than a forced march.

Requirements:

- questions are presented in no necessary thematic or numerical order
- the system may shuffle the full question set at session start
- respondents may skip any question without penalty
- skipped questions remain open and must be easy to revisit
- the interface must expose counts for `answered`, `skipped`, and `remaining`
- respondents must be able to move backward, forward, or jump into a review queue

Recommended question states:

- `unseen`
- `answered`
- `skipped`

Recommended session views:

1. active question view
2. review queue for skipped items
3. question index or progress drawer for jumping back to prior items

The authored section structure should still exist in data, but it should serve analysis and authoring rather than dictate presentation sequence.

## Axis Model

The quiz scores five axes:

| Code | Axis | Negative Pole | Positive Pole |
| --- | --- | --- | --- |
| `F` | Freedom <-> Decree | Determinism / necessity | Will / authorship |
| `S` | Form <-> Spirit | Structure / hierarchy | Spontaneity / inspiration |
| `A` | Authority <-> Conscience | Obedience / law | Inner moral intuition |
| `C` | Collectivity <-> Singularity | Civic / communal order | Individual / universal consciousness |
| `N` | Nature <-> Transcendence | Material / empirical | Mystical / immanent divine |

## Scoring Philosophy

Each answer affects two axes:

- one primary axis
- one secondary cross-axis

This is essential. The quiz should not feel gameable by obvious ideological self-sorting.

The final result should be generated from:

1. raw weighted axis accumulation
2. normalized axis scores
3. cosine similarity against a field of archetype centroids
4. a blended top-three result

The canonical result should only be computed once all questions are answered. A partial session may show progress and completion state, but not the final archetypal output.

## Result Model

The quiz should score against `14` archetypes, not `7`.

The output should include:

- `Anchor`: strongest similarity match
- `Counterweight`: second-strongest similarity match
- `Horizon`: third-strongest match when meaningfully close
- a blend percentage across the top three
- a strongest axis tension
- an optional discovery arc

Example shape:

- `41% Constitutional Republican`
- `33% Latitudinarian Steward`
- `26% Secular Enlightener`

Axis tension example:

- `Primary tension: Form vs Spirit`

Discovery arc example:

- `Republican -> Steward -> Enlightener`

## Result Page Requirements

Every result page should have:

1. archetype name
2. summary line
3. short interpretive paragraph
4. axis fingerprint
5. conceptual genealogy
6. biographical genealogy
7. witness excerpts
8. blend and counterweight presentation

The tone should stay essayistic, not therapeutic.

## Content Requirements

The build depends on three content bodies:

- question copy and weights
- archetype and scoring logic
- interpretive and genealogical content

These are separated into the other three documents in this folder.

## Implementation Notes

Use a content/data model that can represent:

- section
- question id
- prompt
- answers `A-E`
- per-answer weighted axis effects
- question state in session: `unseen|answered|skipped`
- presentation order distinct from authored order
- archetype centroid vectors
- result copy
- conceptual genealogy
- biographical genealogy
- witness excerpts with citation

## UX Requirements

The quiz module inside the Lab page should include:

- randomized or otherwise non-sequential question delivery
- a visible `Skip for now` action
- a persistent `Review skipped questions` control
- saved in-progress state in the browser so a respondent can return later
- a final completion gate that prevents result generation until no questions remain unanswered

## What This Folder Now Contains

- [01_product_spec.md](/mnt/c/Users/rberr/Desktop/PROJECTS/press-page/archive/anglossic_quiz/01_product_spec.md)
- [02_question_bank.md](/mnt/c/Users/rberr/Desktop/PROJECTS/press-page/archive/anglossic_quiz/02_question_bank.md)
- [03_scoring_and_archetypes.md](/mnt/c/Users/rberr/Desktop/PROJECTS/press-page/archive/anglossic_quiz/03_scoring_and_archetypes.md)
- [04_interpretive_library.md](/mnt/c/Users/rberr/Desktop/PROJECTS/press-page/archive/anglossic_quiz/04_interpretive_library.md)
