# American Anglossic Compass: Scoring And Archetypes

## Axis System

| Code | Axis | Negative Pole | Positive Pole |
| --- | --- | --- | --- |
| `F` | Freedom <-> Decree | Determinism / necessity | Will / authorship |
| `S` | Form <-> Spirit | Structure / hierarchy | Spontaneity / inspiration |
| `A` | Authority <-> Conscience | Obedience / law | Inner moral intuition |
| `C` | Collectivity <-> Singularity | Civic / communal order | Individual / universal consciousness |
| `N` | Nature <-> Transcendence | Material / empirical | Mystical / immanent divine |

## Scoring Rules

1. Record the respondent's chosen answer for each question.
2. Apply the two weighted axis effects attached to that answer.
3. Sum all raw axis values across all 55 questions.
4. Normalize each axis using the actual maximum possible absolute movement for that axis.
5. Compare the normalized five-axis vector against all archetype centroids using cosine similarity.
6. Return a blended top-three result instead of only a single winner.

Question order has no scoring significance. The runtime may present questions in any order so long as stable question ids and answer mappings are preserved.

## Completion And Skip Rules

- unanswered questions do not contribute to scoring
- skipped questions are treated as unanswered, not neutral
- the canonical final result is locked until all 55 questions have recorded answers
- changing an earlier answer should recompute the full result immediately

Session state should track at least:

- `answered_count`
- `skipped_count`
- `remaining_count`
- per-question answer value or null

If a provisional preview is ever added later, it should be clearly labeled as non-final. The default build should not expose provisional archetype assignment.

## Normalization

Use exact normalization based on the question bank, not a rough estimate.

Recommended formula:

`max_axis = sum over all questions of max(abs(min_weight_for_axis_in_question)), abs(max_weight_for_axis_in_question))`

Then:

`normalized_axis = raw_axis / max_axis`

For display, scale the normalized value into `-5 .. +5`.

## Result Assembly

For each respondent, compute:

- `Anchor`: highest cosine similarity
- `Counterweight`: second-highest cosine similarity
- `Horizon`: third-highest cosine similarity if meaningfully near the second

Then present:

- the top-three blend percentages
- the strongest axis tension
- an optional discovery arc if the top three form a coherent historical path

Result assembly should only run after the session reaches full completion.

## Archetype Field

The build should use these `14` archetypes.

| Archetype | F | S | A | C | N | Summary |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Civic-Sacramental Federalist | -2 | -3 | -3 | -2 | -1 | Order as beauty; hierarchical classicist |
| Systemic Puritan | -4 | +1 | -1 | -3 | 0 | Moral determinism; repentant institutionalist |
| Constitutional Republican | -1 | -1 | 0 | -1 | -1 | Virtue within law |
| Conscience-Liberal Independent | +2 | +1 | +3 | +1 | +1 | Moral individualist |
| Mystic-Democratic Gnostic | +3 | +3 | +4 | +3 | +4 | Decentralized spiritual egalitarian |
| Secular Enlightener | +1 | 0 | +1 | 0 | -3 | Empirical rationalist |
| Transcendental Revivalist | +1 | +2 | 0 | +2 | +5 | Aesthetic mystic cosmopolitan |
| Hobbesian Magistrate | -3 | -1 | -3 | -1 | -5 | Disenchanted order, force, necessity |
| Covenantal Commonwealthsman | -1 | -1 | -1 | +3 | +1 | Communal vow without mystical dissolution |
| Levelling Republican | +2 | 0 | +2 | +3 | 0 | Democratic conscience and anti-rank equality |
| Romantic Dissenter | +3 | +3 | +2 | -1 | +2 | Solitary visionary individualism |
| Latitudinarian Steward | 0 | -1 | +1 | +1 | -1 | Humane moderation with conscience |
| Sacramental Communitarian | -1 | -2 | -1 | +2 | +3 | Shared form and organic common life |
| Melancholic Naturalist | 0 | +1 | 0 | -1 | -5 | Tragic finitude without transcendence |

## Result Copy: Core Summaries

### Civic-Sacramental Federalist

The world is a hierarchy of beauty; order is the moral imagination made visible.

### Systemic Puritan

History is judgment; freedom is the capacity to endure necessity with righteousness.

### Constitutional Republican

Virtue is self-government under law; liberty requires the discipline of form.

### Conscience-Liberal Independent

The moral imagination is sovereign; law begins in the individual act of conscience.

### Mystic-Democratic Gnostic

All souls are sparks of the same fire; the Kingdom is immanent and plural.

### Secular Enlightener

Truth is what survives experiment; the sacred is the intelligible.

### Transcendental Revivalist

The world is a living symbol; beauty and revelation are one.

### Hobbesian Magistrate

Order is the shield erected against chaos; peace is bought by lucid power.

### Covenantal Commonwealthsman

A people becomes free through vows held in common.

### Levelling Republican

No soul is born for dominion; equality is the civic form of conscience.

### Romantic Dissenter

Vision begins where the soul refuses inherited measure.

### Latitudinarian Steward

The world is governed best by humane judgment, modest belief, and temperate care.

### Sacramental Communitarian

Fellowship becomes holy when shared form bears a common spirit.

### Melancholic Naturalist

The world is beautiful because it perishes; truth begins in finitude.

## Result Interpretation Logic

Each result needs three layers:

1. `Placement`
   - the top-three blend and axis fingerprint

2. `Interpretation`
   - what the respondent's blend implies about order, freedom, law, community, beauty, and transcendence

3. `Tension`
   - the unresolved axis conflict or historical split inside the respondent's profile

## Discovery Arc Examples

- `Federalist -> Republican -> Steward`
- `Independent -> Levelling Republican -> Gnostic`
- `Enlightener -> Naturalist -> Dissenter`
- `Federalist -> Commonwealthsman -> Communitarian`
- `Puritan -> Republican -> Enlightener`

## Implementation Warning

Do not flatten the result to a one-label-only output unless you intentionally want a less subtle instrument. The point of the expanded model is that respondents should discover a position in a field, not merely be assigned a mascot.
