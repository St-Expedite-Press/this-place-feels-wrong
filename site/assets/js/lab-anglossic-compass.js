(function () {
  const STORAGE_KEY = 'sep-anglossic-compass-v2';
  const TOTAL_QUESTIONS = 55;
  const UPDATES_ENDPOINT = '/api/updates';

  const AXES = {
    F: {
      name: 'Freedom <-> Decree',
      negative: 'Determinism / necessity',
      positive: 'Will / authorship',
    },
    S: {
      name: 'Form <-> Spirit',
      negative: 'Structure / hierarchy',
      positive: 'Spontaneity / inspiration',
    },
    A: {
      name: 'Authority <-> Conscience',
      negative: 'Obedience / law',
      positive: 'Inner moral intuition',
    },
    C: {
      name: 'Collectivity <-> Singularity',
      negative: 'Civic / communal order',
      positive: 'Individual / universal consciousness',
    },
    N: {
      name: 'Nature <-> Transcendence',
      negative: 'Material / empirical',
      positive: 'Mystical / immanent divine',
    },
  };

  const QUESTIONS = [[1, "I. Freedom and Decree", "When you encounter failure, what do you believe most?", [["A", "Fate instructs the willing.", "F-2", "N+0.5"], ["B", "Chance rules, not meaning.", "F-1", "N0"], ["C", "Structure failed the just.", "F0", "S-0.5"], ["D", "Will remakes the pattern.", "F+1", "S+0.5"], ["E", "All outcomes are revelations.", "F+2", "N+1"]]], [2, "I. Freedom and Decree", "Freedom is best described as:", [["A", "Harmony with eternal law.", "F-2", "A-0.5"], ["B", "Predictable operation within order.", "F-1", "C-0.5"], ["C", "Space between duties.", "F0", "C0"], ["D", "Creative authorship.", "F+1", "N+0.5"], ["E", "Self-recognition in the divine.", "F+2", "N+1"]]], [3, "I. Freedom and Decree", "When misfortune strikes, you think:", [["A", "Providence chastens toward virtue.", "F-2", "A-1"], ["B", "Systems grind the innocent.", "F-1", "C-1"], ["C", "Tragedy is the cost of progress.", "F0", "S0"], ["D", "Meaning emerges through struggle.", "F+1", "S+0.5"], ["E", "All pain hides invitation.", "F+2", "N+1"]]], [4, "I. Freedom and Decree", "The phrase \"everything happens for a reason\" is:", [["A", "Sacredly true.", "F-2", "N+1"], ["B", "Tool of social control.", "F-1", "C-1"], ["C", "Sometimes functional.", "F0", "A0"], ["D", "Sentimental comfort.", "F+1", "S+0.5"], ["E", "True only as love's paradox.", "F+2", "N+1"]]], [5, "I. Freedom and Decree", "To repent means:", [["A", "Return to ordained design.", "F-2", "A-1"], ["B", "Accept futility, adapt.", "F-1", "S-0.5"], ["C", "Re-enter civic responsibility.", "F0", "C0"], ["D", "Redirect the will.", "F+1", "S+0.5"], ["E", "Awaken to unity.", "F+2", "N+1"]]], [6, "I. Freedom and Decree", "Freedom feels most real when:", [["A", "Obedience aligns with grace.", "F-2", "A-1"], ["B", "Constraints are known and mastered.", "F-1", "S0"], ["C", "Law and choice coincide.", "F0", "C0"], ["D", "Desire acts unhindered.", "F+1", "S+0.5"], ["E", "Chooser and chosen disappear.", "F+2", "N+1"]]], [7, "I. Freedom and Decree", "Fate itself is:", [["A", "Moral fabric of creation.", "F-2", "N+0.5"], ["B", "Mechanical causation.", "F-1", "S-0.5"], ["C", "Human story we tell.", "F0", "S0"], ["D", "Field of potential.", "F+1", "N+0.5"], ["E", "Divine imagination playing.", "F+2", "N+1"]]], [8, "I. Freedom and Decree", "Freedom's greatest enemy is:", [["A", "Sin.", "F-2", "A-1"], ["B", "Power concentration.", "F-1", "C-1"], ["C", "Ignorance.", "F0", "S0"], ["D", "Fear.", "F+1", "N+0.5"], ["E", "Forgetfulness of unity.", "F+2", "N+1"]]], [9, "II. Form and Spirit", "Beauty teaches that:", [["A", "Order mirrors heaven.", "S-2", "A-1"], ["B", "Control conceals decay.", "S-1", "C-1"], ["C", "Harmony breeds virtue.", "S0", "C0"], ["D", "Sincerity redeems form.", "S+1", "A+0.5"], ["E", "Spirit inhabits pattern.", "S+2", "N+1"]]], [10, "II. Form and Spirit", "Liturgy and ritual are:", [["A", "Binding agents of civilization.", "S-2", "A-1"], ["B", "Masks of power.", "S-1", "C-1"], ["C", "Useful civic myth.", "S0", "C0"], ["D", "Expressive tradition.", "S+1", "F+0.5"], ["E", "Pathways to the eternal.", "S+2", "N+1"]]], [11, "II. Form and Spirit", "The artist's duty is:", [["A", "Moral instruction.", "S-2", "A-1"], ["B", "Propaganda of truth.", "S-1", "C-0.5"], ["C", "Honest balance.", "S0", "A0"], ["D", "Self-revelation.", "S+1", "F+0.5"], ["E", "Communion beyond self.", "S+2", "N+1"]]], [12, "II. Form and Spirit", "Architecture's highest good is:", [["A", "Awe and hierarchy.", "S-2", "A-1"], ["B", "Functional clarity.", "S-1", "C-0.5"], ["C", "Rational order.", "S0", "A0"], ["D", "Human proportion.", "S+1", "C+0.5"], ["E", "Transparency to spirit.", "S+2", "N+1"]]], [13, "II. Form and Spirit", "Innovation without tradition yields:", [["A", "Hubris and ruin.", "S-2", "A-1"], ["B", "Profit, then amnesia.", "S-1", "C-1"], ["C", "Civic forgetfulness.", "S0", "C0"], ["D", "Spark without roots.", "S+1", "F+0.5"], ["E", "Pure experiment of spirit.", "S+2", "N+1"]]], [14, "II. Form and Spirit", "Order in art is:", [["A", "Virtue incarnate.", "S-2", "A-1"], ["B", "Instrument of elites.", "S-1", "C-1"], ["C", "Aesthetic discipline.", "S0", "A0"], ["D", "Frame for freedom.", "S+1", "F+0.5"], ["E", "Moment of revelation.", "S+2", "N+1"]]], [15, "II. Form and Spirit", "Public education should produce:", [["A", "Obedient citizens.", "S-2", "A-1"], ["B", "Efficient workers.", "S-1", "C-1"], ["C", "Competent republicans.", "S0", "C0"], ["D", "Self-directed thinkers.", "S+1", "F+0.5"], ["E", "Awakened souls.", "S+2", "N+1"]]], [16, "II. Form and Spirit", "Fashion is:", [["A", "Decay of form.", "S-2", "A-1"], ["B", "Market illusion.", "S-1", "C-1"], ["C", "Social language.", "S0", "C0"], ["D", "Self-expression.", "S+1", "F+0.5"], ["E", "Collective dream.", "S+2", "N+1"]]], [17, "III. Authority and Conscience", "Government authority originates in:", [["A", "Divine ordination.", "A-2", "C-1"], ["B", "Control of material power.", "A-1", "C-0.5"], ["C", "Consent.", "A0", "C0"], ["D", "Moral agency of citizens.", "A+1", "C+0.5"], ["E", "Shared spiritual covenant.", "A+2", "N+1"]]], [18, "III. Authority and Conscience", "Disobedience becomes duty when:", [["A", "The sovereign commands sin.", "A-2", "C-1"], ["B", "Systems oppress truth.", "A-1", "F-0.5"], ["C", "Law loses legitimacy.", "A0", "C0"], ["D", "Conscience demands.", "A+1", "F+0.5"], ["E", "Spirit moves against form.", "A+2", "N+1"]]], [19, "III. Authority and Conscience", "The Court's moral role is:", [["A", "Priesthood of order.", "A-2", "S-1"], ["B", "Mask of domination.", "A-1", "C-1"], ["C", "Balance of powers.", "A0", "C0"], ["D", "Voice of evolving conscience.", "A+1", "F+0.5"], ["E", "Temporary sign of eternal law.", "A+2", "N+1"]]], [20, "III. Authority and Conscience", "Power's corruption lies chiefly in:", [["A", "Pride against hierarchy.", "A-2", "S-1"], ["B", "Centralization.", "A-1", "C-1"], ["C", "Loss of checks.", "A0", "C0"], ["D", "Hypocrisy of elites.", "A+1", "F+0.5"], ["E", "Forgetting sacred stewardship.", "A+2", "N+1"]]], [21, "III. Authority and Conscience", "Duty without faith is:", [["A", "Service still holy.", "A-2", "S-1"], ["B", "Empty compliance.", "A-1", "C-1"], ["C", "Necessary compromise.", "A0", "C0"], ["D", "Moral exhaustion.", "A+1", "F+0.5"], ["E", "Path to awakening.", "A+2", "N+1"]]], [22, "III. Authority and Conscience", "Leadership demands:", [["A", "Obedience to order.", "A-2", "S-1"], ["B", "Control of outcomes.", "A-1", "C-1"], ["C", "Prudence and moderation.", "A0", "C0"], ["D", "Moral imagination.", "A+1", "F+0.5"], ["E", "Vision of unity.", "A+2", "N+1"]]], [23, "III. Authority and Conscience", "Authority's best symbol is:", [["A", "Crown.", "A-2", "S-1"], ["B", "Bureaucracy.", "A-1", "C-1"], ["C", "Constitution.", "A0", "C0"], ["D", "Conscience.", "A+1", "F+0.5"], ["E", "Flame.", "A+2", "N+1"]]], [24, "III. Authority and Conscience", "To obey rightly is to:", [["A", "Mirror cosmic hierarchy.", "A-2", "S-1"], ["B", "Perform necessity.", "A-1", "C-1"], ["C", "Sustain community.", "A0", "C0"], ["D", "Affirm mutual respect.", "A+1", "F+0.5"], ["E", "Yield into the whole.", "A+2", "N+1"]]], [25, "IV. Collectivity and Singularity", "The common good is:", [["A", "Eternal moral order.", "C-2", "A-1"], ["B", "Mask for class interest.", "C-1", "S-1"], ["C", "Civic equilibrium.", "C0", "A0"], ["D", "Liberty's shared frame.", "C+1", "F+0.5"], ["E", "Realization of one life in many.", "C+2", "N+1"]]], [26, "IV. Collectivity and Singularity", "Patriotism at its purest feels like:", [["A", "Worship without altar.", "C-2", "A-1"], ["B", "Manufactured nostalgia.", "C-1", "S-1"], ["C", "Public gratitude.", "C0", "A0"], ["D", "Personal affection.", "C+1", "F+0.5"], ["E", "Longing for the divine.", "C+2", "N+1"]]], [27, "IV. Collectivity and Singularity", "Protest signifies:", [["A", "Breach of covenant.", "C-2", "A-1"], ["B", "Inevitable revolt.", "C-1", "F-0.5"], ["C", "Civic feedback.", "C0", "C0"], ["D", "Moral renewal.", "C+1", "F+0.5"], ["E", "Spirit correcting form.", "C+2", "N+1"]]], [28, "IV. Collectivity and Singularity", "\"We the People\" means:", [["A", "Consecrated body.", "C-2", "A-1"], ["B", "Veil for power.", "C-1", "S-1"], ["C", "Republican promise.", "C0", "A0"], ["D", "Chorus of persons.", "C+1", "F+0.5"], ["E", "One soul in many forms.", "C+2", "N+1"]]], [29, "IV. Collectivity and Singularity", "Charity is:", [["A", "Stewardship of station.", "C-2", "A-1"], ["B", "Delaying revolution.", "C-1", "S-1"], ["C", "Civic obligation.", "C0", "A0"], ["D", "Choice of empathy.", "C+1", "F+0.5"], ["E", "Recognition of unity.", "C+2", "N+1"]]], [30, "IV. Collectivity and Singularity", "The crowd online is:", [["A", "Babel renewed.", "C-2", "S-1"], ["B", "Market of egos.", "C-1", "F-0.5"], ["C", "Digital polis.", "C0", "A0"], ["D", "Self in chorus.", "C+1", "F+0.5"], ["E", "Proto-conscious mind.", "C+2", "N+1"]]], [31, "IV. Collectivity and Singularity", "True community requires:", [["A", "Hierarchy.", "C-2", "A-1"], ["B", "Management.", "C-1", "S-1"], ["C", "Law.", "C0", "A0"], ["D", "Friendship.", "C+1", "F+0.5"], ["E", "Shared spirit.", "C+2", "N+1"]]], [32, "IV. Collectivity and Singularity", "The worst civic sin is:", [["A", "Rebellion.", "C-2", "A-1"], ["B", "Apathy.", "C-1", "S-1"], ["C", "Corruption.", "C0", "A0"], ["D", "Conformity.", "C+1", "F+0.5"], ["E", "Forgetting divine fellowship.", "C+2", "N+1"]]], [33, "V. Nature and Transcendence", "Nature reveals:", [["A", "Hierarchy and harmony.", "N-2", "S-1"], ["B", "Indifference beneath beauty.", "N-1", "S0"], ["C", "Law demanding prudence.", "N0", "S0"], ["D", "Mirror of imagination.", "N+1", "S+0.5"], ["E", "Presence of God.", "N+2", "S+1"]]], [34, "V. Nature and Transcendence", "Science's moral role is:", [["A", "To confirm order.", "N-2", "A-1"], ["B", "To master nature.", "N-1", "F-0.5"], ["C", "To guide civic reason.", "N0", "C0"], ["D", "To extend creation.", "N+1", "F+0.5"], ["E", "To reveal unity.", "N+2", "S+1"]]], [35, "V. Nature and Transcendence", "Death teaches:", [["A", "Obedience to cosmic law.", "N-2", "S-1"], ["B", "Cruelty of matter.", "N-1", "S0"], ["C", "Value of justice.", "N0", "C0"], ["D", "Urgency of creation.", "N+1", "F+0.5"], ["E", "Illusion of separation.", "N+2", "S+1"]]], [36, "V. Nature and Transcendence", "Evil works mainly through:", [["A", "Revolt against order.", "N-2", "A-1"], ["B", "Structural violence.", "N-1", "C-1"], ["C", "Neglect of virtue.", "N0", "A0"], ["D", "Self-betrayal.", "N+1", "F+0.5"], ["E", "Forgetting unity.", "N+2", "S+1"]]], [37, "V. Nature and Transcendence", "Environmental collapse would be:", [["A", "Judgment.", "N-2", "A-1"], ["B", "End of an epoch.", "N-1", "S-0.5"], ["C", "Policy failure.", "N0", "C0"], ["D", "Consequence of hubris.", "N+1", "F+0.5"], ["E", "Birth pang of new consciousness.", "N+2", "S+1"]]], [38, "V. Nature and Transcendence", "Technology's true test is whether it:", [["A", "Serves dignity.", "N-2", "A-1"], ["B", "Obeys profit.", "N-1", "C-1"], ["C", "Strengthens law.", "N0", "A0"], ["D", "Expands empathy.", "N+1", "F+0.5"], ["E", "Reunites matter and spirit.", "N+2", "S+1"]]], [39, "V. Nature and Transcendence", "The good life consists in:", [["A", "Duty with grace.", "N-2", "A-1"], ["B", "Awareness within survival.", "N-1", "S0"], ["C", "Service to community.", "N0", "C0"], ["D", "Freedom through creation.", "N+1", "F+0.5"], ["E", "Union with the whole.", "N+2", "S+1"]]], [40, "V. Nature and Transcendence", "History's purpose is:", [["A", "Redemption.", "N-2", "A-1"], ["B", "Recurrence.", "N-1", "S-0.5"], ["C", "Progress.", "N0", "C0"], ["D", "Experiment.", "N+1", "F+0.5"], ["E", "Revelation.", "N+2", "S+1"]]], [41, "VI. Mediation and Thresholds", "A free people endures by:", [["A", "obedience to inherited station", "F-2", "C-1"], ["B", "restraint enforced by necessity", "F-1", "C-0.5"], ["C", "common discipline under law", "F0", "C0"], ["D", "voluntary association", "F+1", "C+0.5"], ["E", "inward unity discovered among all persons", "F+2", "C+1"]]], [42, "VI. Mediation and Thresholds", "Revolution fails when it:", [["A", "dethrones the sacred bond", "F-2", "C-1"], ["B", "destroys order faster than it feeds the people", "F-1", "C-0.5"], ["C", "confuses zeal with government", "F0", "C0"], ["D", "forgets the dignity of persons", "F+1", "C+0.5"], ["E", "stops short of universal fellowship", "F+2", "C+1"]]], [43, "VI. Mediation and Thresholds", "Property is most just when it:", [["A", "reflects rank and duty", "F-2", "C-1"], ["B", "secures peace through clear possession", "F-1", "C-0.5"], ["C", "protects household independence", "F0", "C0"], ["D", "enlarges the sphere of choice", "F+1", "C+0.5"], ["E", "becomes stewardship held for all", "F+2", "C+1"]]], [44, "VI. Mediation and Thresholds", "A covenant differs from a contract because it:", [["A", "binds souls before wills", "F-2", "C-1"], ["B", "survives by necessity alone", "F-1", "C-0.5"], ["C", "organizes mutual obligation", "F0", "C0"], ["D", "expresses chosen trust", "F+1", "C+0.5"], ["E", "reveals many selves as one life", "F+2", "C+1"]]], [45, "VI. Mediation and Thresholds", "The citizen is highest when:", [["A", "keeping faith with inherited order", "F-2", "C-1"], ["B", "accepting the limits imposed by force and hunger", "F-1", "C-0.5"], ["C", "balancing liberty and duty", "F0", "C0"], ["D", "authoring allegiance by consent", "F+1", "C+0.5"], ["E", "awakening together with the people", "F+2", "C+1"]]], [46, "VI. Mediation and Thresholds", "The ruler answers finally to:", [["A", "divine ordinance", "A-2", "N+0.5"], ["B", "force and circumstance", "A-1", "N-1"], ["C", "inherited law", "A0", "N0"], ["D", "conscience before command", "A+1", "N+0.5"], ["E", "the living spirit in all things", "A+2", "N+1"]]], [47, "VI. Mediation and Thresholds", "Punishment is justified when it:", [["A", "restores violated order", "A-2", "N0"], ["B", "deters disorder efficiently", "A-1", "N-1"], ["C", "preserves the peace", "A0", "N0"], ["D", "recalls the soul to responsibility", "A+1", "N+0.5"], ["E", "heals the sundered whole", "A+2", "N+1"]]], [48, "VI. Mediation and Thresholds", "The magistrate errs most when:", [["A", "forsaking sacred precedent", "A-2", "N+0.5"], ["B", "mistaking persons for machinery", "A-1", "N-1"], ["C", "acting without prudence", "A0", "N0"], ["D", "silencing rightful witness", "A+1", "N+0.5"], ["E", "hardening against the light in things", "A+2", "N+1"]]], [49, "VI. Mediation and Thresholds", "Law becomes dead when it:", [["A", "is severed from sacred memory", "A-2", "N+0.5"], ["B", "serves only force", "A-1", "N-1"], ["C", "is no longer intelligible", "A0", "N0"], ["D", "ignores inward conviction", "A+1", "N+0.5"], ["E", "ceases to mediate living presence", "A+2", "N+1"]]], [50, "VI. Mediation and Thresholds", "To govern the land well is to:", [["A", "keep each creature in ordained place", "A-2", "N+0.5"], ["B", "extract use without illusion", "A-1", "N-1"], ["C", "administer just limits", "A0", "N0"], ["D", "heed the claims of conscience and care", "A+1", "N+0.5"], ["E", "steward a living creation", "A+2", "N+1"]]], [51, "VI. Mediation and Thresholds", "A ruin is most beautiful when it:", [["A", "witnesses the endurance of form", "S-2", "N0"], ["B", "exposes matter's indifference", "S-1", "N-1"], ["C", "instructs the mind in transience", "S0", "N0"], ["D", "frees imagination through fracture", "S+1", "N+0.5"], ["E", "shines as broken revelation", "S+2", "N+1"]]], [52, "VI. Mediation and Thresholds", "The map fails the traveler when it:", [["A", "neglects rightful boundaries", "S-2", "N0"], ["B", "mistakes the world for dead extension", "S-1", "N-1"], ["C", "omits the scale of things", "S0", "N0"], ["D", "forgets the path is made in walking", "S+1", "N+0.5"], ["E", "cannot show the soul of the land", "S+2", "N+1"]]], [53, "VI. Mediation and Thresholds", "Ceremony at harvest should chiefly:", [["A", "bless rank and order", "S-2", "N0"], ["B", "mark necessity without enchantment", "S-1", "N-1"], ["C", "give thanks in measured custom", "S0", "N0"], ["D", "awaken mutual delight", "S+1", "N+0.5"], ["E", "reveal creation as liturgy", "S+2", "N+1"]]], [54, "VI. Mediation and Thresholds", "The most truthful poem is one that:", [["A", "perfects inherited measure", "S-2", "N0"], ["B", "names the cold fact plainly", "S-1", "N-1"], ["C", "balances image and judgment", "S0", "N0"], ["D", "invents a freer music", "S+1", "N+0.5"], ["E", "discloses the hidden fire in things", "S+2", "N+1"]]], [55, "VI. Mediation and Thresholds", "To build a dwelling well is to:", [["A", "express station through durable form", "S-2", "N0"], ["B", "submit design to climate and utility alone", "S-1", "N-1"], ["C", "fit purpose with proportion", "S0", "N0"], ["D", "leave room for changing life", "S+1", "N+0.5"], ["E", "make shelter translucent to the sacred", "S+2", "N+1"]]]];

  const ARCHETYPES = [
    {
      name: 'Civic-Sacramental Federalist',
      summary: 'The world is a hierarchy of beauty; order is the moral imagination made visible.',
      conceptual: 'natural law -> liturgical order -> mixed constitution -> civic reverence',
      biographical: 'Richard Hooker -> John Adams',
      witness: {
        excerpt: 'Richard Hooker, law as cosmic harmony: "her voice the harmony of the world."',
        citation: 'Richard Hooker, Of the Lawes of Ecclesiastical Politie, 1593.',
      },
      vector: { F: -2, S: -3, A: -3, C: -2, N: -1 },
    },
    {
      name: 'Systemic Puritan',
      summary: 'History is judgment; freedom is the capacity to endure necessity with righteousness.',
      conceptual: 'depravity -> providence -> covenant discipline -> collective judgment',
      biographical: 'John Calvin -> John Winthrop',
      witness: {
        excerpt: 'John Winthrop, covenantal public scrutiny: "we shall be as a city upon a hill."',
        citation: 'John Winthrop, A Model of Christian Charity, 1630.',
      },
      vector: { F: -4, S: 1, A: -1, C: -3, N: 0 },
    },
    {
      name: 'Constitutional Republican',
      summary: 'Virtue is self-government under law; liberty requires the discipline of form.',
      conceptual: 'mixed government -> checks and balances -> reverence for law -> civic restraint',
      biographical: 'James Madison -> Abraham Lincoln',
      witness: {
        excerpt: 'James Madison, constitutional control of power: "If men were angels, no government would be necessary."',
        citation: 'James Madison, The Federalist No. 51, 1788.',
      },
      vector: { F: -1, S: -1, A: 0, C: -1, N: -1 },
    },
    {
      name: 'Conscience-Liberal Independent',
      summary: 'The moral imagination is sovereign; law begins in the individual act of conscience.',
      conceptual: 'liberty of conscience -> anti-conformity -> inward law -> moral self-authorship',
      biographical: 'John Milton -> Ralph Waldo Emerson',
      witness: {
        excerpt: 'Ralph Waldo Emerson, inward law over inherited custom: "No law can be sacred to me but that of my nature."',
        citation: 'Ralph Waldo Emerson, Self-Reliance, 1841.',
      },
      vector: { F: 2, S: 1, A: 3, C: 1, N: 1 },
    },
    {
      name: 'Mystic-Democratic Gnostic',
      summary: 'All souls are sparks of the same fire; the Kingdom is immanent and plural.',
      conceptual: 'inner light -> direct revelation -> spiritual equality -> many-in-one unity',
      biographical: 'George Fox -> William Blake',
      witness: {
        excerpt: 'George Fox, direct inward guidance: "There is one, even Christ Jesus, that can speak to thy condition."',
        citation: 'George Fox, Journal, 1694.',
      },
      vector: { F: 3, S: 3, A: 4, C: 3, N: 4 },
    },
    {
      name: 'Secular Enlightener',
      summary: 'Truth is what survives experiment; the sacred is the intelligible.',
      conceptual: 'empiricism -> public reason -> lawful liberty -> evidential belief',
      biographical: 'John Locke -> David Hume',
      witness: {
        excerpt: 'David Hume, belief proportioned to evidence: "A wise man, therefore, proportions his belief to the evidence."',
        citation: 'David Hume, An Enquiry Concerning Human Understanding, 1748.',
      },
      vector: { F: 1, S: 0, A: 1, C: 0, N: -3 },
    },
    {
      name: 'Transcendental Revivalist',
      summary: 'The world is a living symbol; beauty and revelation are one.',
      conceptual: 'nature as symbol -> immanent spirit -> poetic revelation -> aesthetic theurgy',
      biographical: 'Henry David Thoreau -> Walt Whitman',
      witness: {
        excerpt: 'Walt Whitman, matter made sacred: "I make holy whatever I touch."',
        citation: 'Walt Whitman, Leaves of Grass, 1855.',
      },
      vector: { F: 1, S: 2, A: 0, C: 2, N: 5 },
    },
    {
      name: 'Hobbesian Magistrate',
      summary: 'Order is the shield erected against chaos; peace is bought by lucid power.',
      conceptual: 'necessity -> security -> force-backed covenant -> political realism',
      biographical: 'Niccolo Machiavelli -> Thomas Hobbes',
      witness: {
        excerpt: 'Thomas Hobbes, order requires enforceable power: "covenants being but words and breath, have no force."',
        citation: 'Thomas Hobbes, Leviathan, 1651.',
      },
      vector: { F: -3, S: -1, A: -3, C: -1, N: -5 },
    },
    {
      name: 'Covenantal Commonwealthsman',
      summary: 'A people becomes free through vows held in common.',
      conceptual: 'mutual obligation -> common good -> consent under God -> disciplined fellowship',
      biographical: 'John Winthrop -> Samuel Rutherford',
      witness: {
        excerpt: 'Samuel Rutherford, popular origin of government: "they were made kings by the people."',
        citation: 'Samuel Rutherford, Lex, Rex, 1644.',
      },
      vector: { F: -1, S: -1, A: -1, C: 3, N: 1 },
    },
    {
      name: 'Levelling Republican',
      summary: 'No soul is born for dominion; equality is the civic form of conscience.',
      conceptual: 'natural equality -> consent of the governed -> anti-rank politics -> democratic conscience',
      biographical: 'Thomas Rainsborough -> Thomas Paine',
      witness: {
        excerpt: 'Thomas Rainsborough, equal title to political voice: "the poorest he ... hath a life to live, as the greatest he."',
        citation: 'Thomas Rainsborough, The Putney Debates, 1647.',
      },
      vector: { F: 2, S: 0, A: 2, C: 3, N: 0 },
    },
    {
      name: 'Romantic Dissenter',
      summary: 'Vision begins where the soul refuses inherited measure.',
      conceptual: 'imagination -> revolt against measure -> visionary singularity -> poetic insurgency',
      biographical: 'William Blake -> Percy Bysshe Shelley',
      witness: {
        excerpt: 'William Blake, wisdom through imaginative revolt: "The road of excess leads to the palace of wisdom."',
        citation: 'William Blake, The Marriage of Heaven and Hell, 1793.',
      },
      vector: { F: 3, S: 3, A: 2, C: -1, N: 2 },
    },
    {
      name: 'Latitudinarian Steward',
      summary: 'The world is governed best by humane judgment, modest belief, and temperate care.',
      conceptual: 'moral constitution -> prudence -> conscience under proportion -> local affection',
      biographical: 'Joseph Butler -> Edmund Burke',
      witness: {
        excerpt: 'Edmund Burke, small-scale affection as civic root: "to love the little platoon we belong to in society."',
        citation: 'Edmund Burke, Reflections on the Revolution in France, 1790.',
      },
      vector: { F: 0, S: -1, A: 1, C: 1, N: -1 },
    },
    {
      name: 'Sacramental Communitarian',
      summary: 'Fellowship becomes holy when shared form bears a common spirit.',
      conceptual: 'shared form -> feast and labor -> fellowship -> organic common life',
      biographical: 'John Ruskin -> William Morris',
      witness: {
        excerpt: 'William Morris, fellowship as common life: "fellowship is life, and lack of fellowship is death."',
        citation: 'William Morris, A Dream of John Ball, 1888.',
      },
      vector: { F: -1, S: -2, A: -1, C: 2, N: 3 },
    },
    {
      name: 'Melancholic Naturalist',
      summary: 'The world is beautiful because it perishes; truth begins in finitude.',
      conceptual: 'finitude -> disenchantment -> tragic beauty -> lucid endurance',
      biographical: 'Thomas Hardy -> George Santayana',
      witness: {
        excerpt: 'George Santayana, finitude without redemption: "There is no cure for birth and death save to enjoy the interval."',
        citation: 'George Santayana, Soliloquies in England, 1922.',
      },
      vector: { F: 0, S: 1, A: 0, C: -1, N: -5 },
    },
  ];

  const QUESTION_MAP = new Map(
    QUESTIONS.map(([id, section, prompt, choices]) => [
      id,
      {
        id,
        section,
        prompt,
        choices: choices.map(([key, label, primary, secondary]) => ({
          key,
          label,
          effects: [primary, secondary].map(parseEffect),
        })),
      },
    ]),
  );

  const AXIS_KEYS = ['F', 'S', 'A', 'C', 'N'];
  const AXIS_MAX = computeAxisMaxima();

  function parseEffect(token) {
    const axis = token.charAt(0);
    const value = Number(token.slice(1));
    return { axis, value };
  }

  function computeAxisMaxima() {
    const maxima = {};
    AXIS_KEYS.forEach((axis) => {
      maxima[axis] = 0;
    });

    for (const question of QUESTION_MAP.values()) {
      AXIS_KEYS.forEach((axis) => {
        let localMax = 0;
        question.choices.forEach((choice) => {
          choice.effects.forEach((effect) => {
            if (effect.axis === axis) {
              localMax = Math.max(localMax, Math.abs(effect.value));
            }
          });
        });
        maxima[axis] += localMax;
      });
    }

    return maxima;
  }

  function getRandomInt(max) {
    if (window.crypto && typeof window.crypto.getRandomValues === 'function') {
      const buffer = new Uint32Array(1);
      window.crypto.getRandomValues(buffer);
      return buffer[0] % max;
    }
    return Math.floor(Math.random() * max);
  }

  function shuffleIds(ids) {
    const copy = ids.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = getRandomInt(i + 1);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function buildChoiceOrder() {
    const choiceOrder = {};
    QUESTION_MAP.forEach((question, id) => {
      choiceOrder[String(id)] = shuffleIds(question.choices.map((choice) => choice.key));
    });
    return choiceOrder;
  }

  function normalizeChoiceOrder(rawChoiceOrder) {
    const normalized = {};
    QUESTION_MAP.forEach((question, id) => {
      const questionKey = String(id);
      const expectedKeys = question.choices.map((choice) => choice.key);
      const candidate = rawChoiceOrder && Array.isArray(rawChoiceOrder[questionKey])
        ? rawChoiceOrder[questionKey].filter((key) => expectedKeys.includes(key))
        : [];

      if (candidate.length !== expectedKeys.length) {
        normalized[questionKey] = shuffleIds(expectedKeys);
        return;
      }

      normalized[questionKey] = candidate;
    });
    return normalized;
  }

  function getOrderedChoices(question, state) {
    const choiceOrder = state.choiceOrder[String(question.id)] || question.choices.map((choice) => choice.key);
    return choiceOrder
      .map((key) => question.choices.find((choice) => choice.key === key))
      .filter(Boolean);
  }

  const CHOICE_DISPLAY_OVERRIDES = {
    1: {
      A: 'Failure is usually providential correction, not mere defeat.',
      B: 'Failure usually shows how little mastery we really have over circumstance.',
      C: 'Failure often shows that our institutions or preparations were unequal to the moment.',
      D: 'Failure is the resistance by which the will discovers a stronger form.',
      E: 'Failure is one more revelation by which the soul is led onward.',
    },
    2: {
      A: 'Freedom is right action in accord with a higher law.',
      B: 'Freedom is the room to act effectively within the limits of necessity.',
      C: 'Freedom is the space preserved for judgment within law and duty.',
      D: 'Freedom is the power to author a life from within.',
      E: 'Freedom is the soul awakening to its divine source.',
    },
    3: {
      A: 'Misfortune is providence correcting pride and schooling virtue.',
      B: 'Misfortune is what happens in a world moved more by force than by justice.',
      C: 'Misfortune is part of mortal life, and decent institutions are meant to bear it.',
      D: 'Misfortune is the trial through which meaning is made.',
      E: 'Misfortune is a hidden summons toward transformation.',
    },
    4: {
      A: 'It is true, because providence wastes nothing.',
      B: 'It is often a consoling phrase laid over events we barely understand.',
      C: 'It is sometimes a useful saying, but not one that explains the world.',
      D: 'It is too quickly used to spare us the burden of judgment.',
      E: 'It is true only if reason is deeper than sequence and nearer to love.',
    },
    5: {
      A: 'To repent is to return to the order one was made for.',
      B: 'To repent is to accept the limits of the world and live more soberly.',
      C: 'To repent is to amend one\'s conduct and resume one\'s duties.',
      D: 'To repent is to redirect the will toward a better life.',
      E: 'To repent is to wake from separation into unity.',
    },
    6: {
      A: 'Freedom is most real when obedience and grace become one act.',
      B: 'Freedom is most real when the boundaries of action are clear and manageable.',
      C: 'Freedom is most real when law and choice coincide.',
      D: 'Freedom is most real when desire can shape its own course.',
      E: 'Freedom is most real when the self moves without division.',
    },
    7: {
      A: 'Fate is the moral texture of a created order.',
      B: 'Fate is the chain of causes that cares nothing for our wishes.',
      C: 'Fate is the name we give events once they have hardened into history.',
      D: 'Fate is a field of possibility that answers to courage.',
      E: 'Fate is the divine imagination moving through time.',
    },
    8: {
      A: 'Freedom\'s greatest enemy is sin, which disorders the will.',
      B: 'Freedom\'s greatest enemy is domination by powers one cannot answer.',
      C: 'Freedom\'s greatest enemy is ignorance of oneself and one\'s obligations.',
      D: 'Freedom\'s greatest enemy is fear, which teaches self-betrayal.',
      E: 'Freedom\'s greatest enemy is forgetfulness of our deeper unity.',
    },
    9: {
      A: 'Beauty teaches that order is a likeness of heaven.',
      B: 'Beauty teaches how often polish is used to conceal decay.',
      C: 'Beauty teaches the discipline by which harmony trains the affections.',
      D: 'Beauty teaches that form lives only when it carries sincerity.',
      E: 'Beauty teaches that spirit can shine through any worthy form.',
    },
    10: {
      A: 'Liturgy and ritual bind a people to order across time.',
      B: 'Liturgy and ritual are techniques by which authority steadies conduct.',
      C: 'Liturgy and ritual are shared forms that teach a people how to live together.',
      D: 'Liturgy and ritual keep tradition alive by making it expressive again.',
      E: 'Liturgy and ritual are doors through which the eternal enters time.',
    },
    11: {
      A: 'The artist\'s duty is to instruct desire by beauty.',
      B: 'The artist\'s duty is to state uncomfortable truth without ornament.',
      C: 'The artist\'s duty is to hold truth and beauty in honest proportion.',
      D: 'The artist\'s duty is to reveal the inner life in its singularity.',
      E: 'The artist\'s duty is to open a communion larger than the self.',
    },
    12: {
      A: 'Architecture is highest when it inspires reverence and rightful order.',
      B: 'Architecture is highest when it serves use with exact clarity.',
      C: 'Architecture is highest when proportion, usefulness, and civic dignity meet.',
      D: 'Architecture is highest when it honors the scale of lived human life.',
      E: 'Architecture is highest when stone and light become transparent to spirit.',
    },
    13: {
      A: 'Innovation without tradition yields arrogance and eventual ruin.',
      B: 'Innovation without tradition yields efficiency, novelty, and then amnesia.',
      C: 'Innovation without tradition yields a people more ingenious than wise.',
      D: 'Innovation without tradition yields brilliance that must invent its own form.',
      E: 'Innovation without tradition can become pure experiment, and spirit is sometimes born that way.',
    },
    14: {
      A: 'Order in art is virtue made visible.',
      B: 'Order in art is often the taste of ruling classes made universal.',
      C: 'Order in art is a discipline of measure and restraint.',
      D: 'Order in art is a frame within which freedom can sing.',
      E: 'Order in art is the moment when revelation takes form.',
    },
    15: {
      A: 'Public education should produce disciplined citizens fit for inheritance.',
      B: 'Public education should produce capable adults able to survive a competitive world.',
      C: 'Public education should produce citizens able to govern themselves and their republic.',
      D: 'Public education should produce independent minds, not merely compliant ones.',
      E: 'Public education should produce souls awake to truth and vocation.',
    },
    16: {
      A: 'Fashion is a symptom of form forgetting its discipline.',
      B: 'Fashion is the marketplace teaching desire to imitate itself.',
      C: 'Fashion is a social language of rank, taste, and belonging.',
      D: 'Fashion is one way a person composes a visible self.',
      E: 'Fashion is a collective dream momentarily taking cloth and color.',
    },
    17: {
      A: 'Government authority originates in a divine charge laid upon office.',
      B: 'Government authority originates wherever power is organized and enforced.',
      C: 'Government authority originates in consent disciplined by law.',
      D: 'Government authority originates in the moral agency of the governed.',
      E: 'Government authority originates in a covenant of souls before it becomes a state.',
    },
    18: {
      A: 'Disobedience becomes duty when rulers command what God forbids.',
      B: 'Disobedience becomes duty when institutions become instruments of plain oppression.',
      C: 'Disobedience becomes duty when law has manifestly lost legitimacy.',
      D: 'Disobedience becomes duty when conscience can no longer evade the demand.',
      E: 'Disobedience becomes duty when living spirit breaks a dead form.',
    },
    19: {
      A: 'The court\'s moral role is to guard order with grave impartiality.',
      B: 'The court\'s moral role is limited, because courts are never free from power.',
      C: 'The court\'s moral role is to preserve the balance and continuity of the constitution.',
      D: 'The court\'s moral role is to hear claims of conscience history had excluded.',
      E: 'The court\'s moral role is to witness, however imperfectly, to a higher law.',
    },
    20: {
      A: 'Power is corrupted chiefly by pride against rightful order.',
      B: 'Power is corrupted chiefly when it gathers beyond the reach of answer or limit.',
      C: 'Power is corrupted chiefly when checks fail and office outruns law.',
      D: 'Power is corrupted chiefly by hypocrisy that asks sacrifice only of others.',
      E: 'Power is corrupted chiefly when stewardship forgets the sacredness of persons.',
    },
    21: {
      A: 'Duty without faith is still honorable service within the order of things.',
      B: 'Duty without faith is compliance that can sustain order but not love.',
      C: 'Duty without faith is a necessary compromise of civic life.',
      D: 'Duty without faith is exhausting, because the soul cannot live forever on obligation alone.',
      E: 'Duty without faith can become the first discipline by which awakening arrives.',
    },
    22: {
      A: 'Leadership demands fidelity to inherited order and burden.',
      B: 'Leadership demands command over outcomes in an unruly world.',
      C: 'Leadership demands prudence, moderation, and steadiness under pressure.',
      D: 'Leadership demands moral imagination equal to human complexity.',
      E: 'Leadership demands a vision of common life deeper than interest.',
    },
    23: {
      A: 'The best symbol of authority is a crown that makes hierarchy visible.',
      B: 'The best symbol of authority is an office that can administer without illusion.',
      C: 'The best symbol of authority is a constitution that outlasts the hour.',
      D: 'The best symbol of authority is the answering voice of conscience.',
      E: 'The best symbol of authority is a flame, living and indivisible.',
    },
    24: {
      A: 'To obey rightly is to mirror the order woven into the world.',
      B: 'To obey rightly is to recognize necessity and act without self-deception.',
      C: 'To obey rightly is to sustain the lawful order of a community.',
      D: 'To obey rightly is to give assent without surrendering moral judgment.',
      E: 'To obey rightly is to yield the separate will back into the whole.',
    },
    25: {
      A: 'The common good is the moral order by which each estate finds its place.',
      B: 'The common good is the settlement by which rival interests are kept from open war.',
      C: 'The common good is the equilibrium of a well-kept republic.',
      D: 'The common good is the frame of liberty within which persons can flourish together.',
      E: 'The common good is the one life of a people shining through many persons.',
    },
    26: {
      A: 'At its purest, patriotism is love of country bordering on reverence.',
      B: 'At its purest, patriotism is loyalty disciplined by historical reality rather than myth.',
      C: 'At its purest, patriotism is gratitude for a shared inheritance and constitution.',
      D: 'At its purest, patriotism is chosen affection for a people and place.',
      E: 'At its purest, patriotism is love of the divine image disclosed in a people.',
    },
    27: {
      A: 'Protest signifies a breach in covenant that ought to grieve the whole body.',
      B: 'Protest signifies that ordinary channels have failed to absorb real pressure.',
      C: 'Protest signifies a republican people correcting its own course.',
      D: 'Protest signifies conscience refusing to become merely obedient.',
      E: 'Protest signifies spirit breaking through forms that have gone rigid.',
    },
    28: {
      A: '"We the People" names a body politic almost consecrated by its charge.',
      B: '"We the People" names the source of legitimacy, though ambitious men are always tempted to misuse it.',
      C: '"We the People" names the promise of shared republican self-government.',
      D: '"We the People" names a chorus of distinct persons consenting to stand together.',
      E: '"We the People" names one life speaking through many voices.',
    },
    29: {
      A: 'Charity is the duty of those entrusted with more toward those entrusted with less.',
      B: 'Charity is mercy that relieves suffering but cannot by itself reorder the world.',
      C: 'Charity is an obligation owed to neighbor and stranger alike.',
      D: 'Charity is the free act by which one person recognizes another\'s claim.',
      E: 'Charity is the recognition that no soul is truly separate from another.',
    },
    30: {
      A: 'The crowd online is Babel under electrical conditions.',
      B: 'The crowd online is a theater of appetite, vanity, and reaction.',
      C: 'The crowd online is a noisy but real extension of the public square.',
      D: 'The crowd online is a new chorus in which persons test their voices.',
      E: 'The crowd online is the first rough register of a wider common mind.',
    },
    31: {
      A: 'True community requires recognized rank, duty, and mutual care.',
      B: 'True community requires administration strong enough to prevent disintegration.',
      C: 'True community requires law sturdy enough to bind strangers into common life.',
      D: 'True community requires friendship freely given, not merely order imposed.',
      E: 'True community requires a shared spirit felt inwardly as well as outwardly.',
    },
    32: {
      A: 'The worst civic sin is rebellion against rightful order.',
      B: 'The worst civic sin is indifference to the fate of the commonwealth.',
      C: 'The worst civic sin is corruption of office and trust.',
      D: 'The worst civic sin is conformity that abandons judgment.',
      E: 'The worst civic sin is forgetting the divine fellowship of persons.',
    },
    33: {
      A: 'Nature reveals a hierarchy that chastens and instructs us.',
      B: 'Nature reveals beauty resting upon processes indifferent to our hopes.',
      C: 'Nature reveals an order that rewards prudence and respect for limits.',
      D: 'Nature reveals a field in which imagination discovers meaning.',
      E: 'Nature reveals the presence of God immanent in created things.',
    },
    34: {
      A: 'The moral role of science is to confirm the intelligibility of creation.',
      B: 'The moral role of science is to master conditions so life becomes more secure.',
      C: 'The moral role of science is to guide public reason through disciplined knowledge.',
      D: 'The moral role of science is to enlarge human possibility without denying wonder.',
      E: 'The moral role of science is to disclose a deeper unity in the world.',
    },
    35: {
      A: 'Death teaches reverence before the law of creation.',
      B: 'Death teaches that matter does not bend for our consolations.',
      C: 'Death teaches the urgency of justice within a mortal span.',
      D: 'Death teaches that a life must be made, not merely endured.',
      E: 'Death teaches that separation is not the final truth of things.',
    },
    36: {
      A: 'Evil works mainly through revolt against rightful order.',
      B: 'Evil works mainly through conditions that train ordinary people into hardness.',
      C: 'Evil works mainly through the slow neglect of virtue and responsibility.',
      D: 'Evil works mainly through the moments when one betrays one\'s own better light.',
      E: 'Evil works mainly through forgetting the unity that binds creature to creature.',
    },
    37: {
      A: 'Environmental collapse would be a judgment upon disorderly dominion.',
      B: 'Environmental collapse would be the predictable cost of appetites without limit.',
      C: 'Environmental collapse would be a failure of policy, stewardship, and restraint.',
      D: 'Environmental collapse would be nature\'s answer to human arrogance.',
      E: 'Environmental collapse would be a terrible threshold through which consciousness is forced to change.',
    },
    38: {
      A: 'Technology is justified only if it serves dignity and rightful order.',
      B: 'Technology\'s true test is whether it answers to real use rather than fantasy.',
      C: 'Technology\'s true test is whether it strengthens law, trust, and public life.',
      D: 'Technology\'s true test is whether it enlarges sympathy and human possibility.',
      E: 'Technology\'s true test is whether it helps reunite matter, mind, and spirit.',
    },
    39: {
      A: 'The good life consists in duty carried with grace.',
      B: 'The good life consists in lucid endurance under mortal conditions.',
      C: 'The good life consists in service to the community and those near to hand.',
      D: 'The good life consists in freedom exercised through making and choosing.',
      E: 'The good life consists in union with the larger life that sustains all things.',
    },
    40: {
      A: 'History\'s purpose is the working-out of redemption through time.',
      B: 'History has no final purpose beyond recurring struggle and adjustment.',
      C: 'History\'s purpose is the gradual improvement of civil life.',
      D: 'History\'s purpose is the widening experiment of human freedom.',
      E: 'History\'s purpose is revelation becoming visible in time.',
    },
    41: {
      A: 'A free people endures by keeping faith with inherited stations and obligations.',
      B: 'A free people endures by accepting the disciplines necessity imposes.',
      C: 'A free people endures by common discipline under law.',
      D: 'A free people endures by voluntary association and chosen loyalty.',
      E: 'A free people endures by discovering inward unity across outward differences.',
    },
    42: {
      A: 'Revolution fails when it destroys the sacred bond before it can replace it.',
      B: 'Revolution fails when it topples order faster than it can feed and govern.',
      C: 'Revolution fails when it mistakes zeal for the patient work of government.',
      D: 'Revolution fails when it forgets the dignity of the persons it claims to free.',
      E: 'Revolution fails when it stops at regime change and never becomes fellowship.',
    },
    43: {
      A: 'Property is most just when it reflects duty, station, and stewardship.',
      B: 'Property is most just when it gives clear possession and prevents conflict.',
      C: 'Property is most just when it secures household independence.',
      D: 'Property is most just when it enlarges the sphere of responsible choice.',
      E: 'Property is most just when it is held as stewardship for the sake of all.',
    },
    44: {
      A: 'A covenant differs from a contract because it binds persons before it bargains with wills.',
      B: 'A covenant differs from a contract mostly in language; both endure only while the parties still need them.',
      C: 'A covenant differs from a contract because it organizes mutual obligation across time.',
      D: 'A covenant differs from a contract because it expresses trust freely given.',
      E: 'A covenant differs from a contract because it reveals many selves participating in one life.',
    },
    45: {
      A: 'The citizen is highest when one keeps faith with inherited order.',
      B: 'The citizen is highest when one accepts hard limits without political fantasy.',
      C: 'The citizen is highest when one balances liberty with duty.',
      D: 'The citizen is highest when one authors allegiance through consent.',
      E: 'The citizen is highest when one awakens together with the people into common life.',
    },
    46: {
      A: 'The ruler answers finally to divine ordinance.',
      B: 'The ruler answers finally to force, circumstance, and the limits of command.',
      C: 'The ruler answers finally to inherited law.',
      D: 'The ruler answers finally to conscience before command.',
      E: 'The ruler answers finally to the living spirit moving through all things.',
    },
    47: {
      A: 'Punishment is justified when it restores violated order.',
      B: 'Punishment is justified when it deters disorder and secures peace.',
      C: 'Punishment is justified when it preserves the peace of the commonwealth.',
      D: 'Punishment is justified when it recalls the soul to responsibility.',
      E: 'Punishment is justified when it helps heal a broken whole.',
    },
    48: {
      A: 'The magistrate errs most when forsaking sacred precedent.',
      B: 'The magistrate errs most when treating persons as machinery.',
      C: 'The magistrate errs most when acting without prudence.',
      D: 'The magistrate errs most when silencing rightful witness.',
      E: 'The magistrate errs most when hardening against the light within things.',
    },
    49: {
      A: 'Law becomes dead when it is severed from sacred memory.',
      B: 'Law becomes dead when it becomes nothing but force in procedural dress.',
      C: 'Law becomes dead when the people can no longer understand it.',
      D: 'Law becomes dead when it refuses inward conviction any place within judgment.',
      E: 'Law becomes dead when it can no longer mediate living presence.',
    },
    50: {
      A: 'To govern the land well is to keep each creature in its ordained place.',
      B: 'To govern the land well is to use it soberly, without pastoral illusion.',
      C: 'To govern the land well is to administer just limits.',
      D: 'To govern the land well is to heed both conscience and care.',
      E: 'To govern the land well is to steward a living creation.',
    },
    51: {
      A: 'A ruin is most beautiful when it shows form enduring beyond use.',
      B: 'A ruin is most beautiful when it strips away sentiment and leaves the fact of time.',
      C: 'A ruin is most beautiful when it instructs the mind in transience.',
      D: 'A ruin is most beautiful when fracture frees the imagination.',
      E: 'A ruin is most beautiful when broken form still glows with revelation.',
    },
    52: {
      A: 'The map fails the traveler when it neglects rightful boundaries.',
      B: 'The map fails the traveler when it mistakes the world for dead extension.',
      C: 'The map fails the traveler when it loses scale and relation.',
      D: 'The map fails the traveler when it forgets that a path is made in walking.',
      E: 'The map fails the traveler when it cannot show the soul of the land.',
    },
    53: {
      A: 'Ceremony at harvest should chiefly bless rank, labor, and order.',
      B: 'Ceremony at harvest should chiefly mark necessity without pretending enchantment.',
      C: 'Ceremony at harvest should chiefly give thanks in measured custom.',
      D: 'Ceremony at harvest should chiefly awaken mutual delight and gratitude.',
      E: 'Ceremony at harvest should chiefly reveal creation itself as liturgy.',
    },
    54: {
      A: 'The most truthful poem is one that perfects inherited measure.',
      B: 'The most truthful poem is one that names the hard fact without disguise.',
      C: 'The most truthful poem is one that balances image with judgment.',
      D: 'The most truthful poem is one that invents a freer music for living speech.',
      E: 'The most truthful poem is one that discloses the hidden fire in things.',
    },
    55: {
      A: 'To build a dwelling well is to give durable form to station and use.',
      B: 'To build a dwelling well is to submit design to climate, need, and economy.',
      C: 'To build a dwelling well is to fit purpose with proportion.',
      D: 'To build a dwelling well is to leave room for changing life.',
      E: 'To build a dwelling well is to make shelter translucent to the sacred.',
    },
  };

  const CHOICE_LINEAGES = {
    A: 'Covenant / order',
    B: 'Necessity / realism',
    C: 'Law / prudence',
    D: 'Conscience / imagination',
    E: 'Vision / inward light',
  };

  function getDisplayChoiceLabel(question, choice) {
    const override = CHOICE_DISPLAY_OVERRIDES[question.id] && CHOICE_DISPLAY_OVERRIDES[question.id][choice.key];
    return override || choice.label;
  }

  function buildChoiceSentence(question, choice) {
    const label = String(getDisplayChoiceLabel(question, choice) || '').trim();
    if (!label) return '';
    return /[.!?]$/.test(label) ? label : `${label}.`;
  }

  function normalizeResultGate(rawResultGate) {
    const status = rawResultGate && (rawResultGate.status === 'submitted' || rawResultGate.status === 'dismissed')
      ? rawResultGate.status
      : 'pending';

    return {
      status,
      email: rawResultGate && typeof rawResultGate.email === 'string' ? rawResultGate.email : '',
    };
  }

  function canRevealResults(state) {
    return state.resultGate.status === 'submitted' || state.resultGate.status === 'dismissed';
  }

  function createInitialState() {
    const order = shuffleIds(Array.from(QUESTION_MAP.keys()));
    return {
      version: 2,
      order,
      choiceOrder: buildChoiceOrder(),
      resultGate: normalizeResultGate(),
      activeId: order[0],
      answers: {},
      skipped: {},
      updatedAt: Date.now(),
    };
  }

  function loadState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const legacyRaw = window.localStorage.getItem('sep-anglossic-compass-v1');
        if (!legacyRaw) return createInitialState();
        return migrateLegacyState(legacyRaw);
      }
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== 2 || !Array.isArray(parsed.order) || parsed.order.length !== TOTAL_QUESTIONS) {
        return createInitialState();
      }
      const order = parsed.order.filter((id) => QUESTION_MAP.has(id));
      if (order.length !== TOTAL_QUESTIONS) return createInitialState();
      return {
        version: 2,
        order,
        choiceOrder: normalizeChoiceOrder(parsed.choiceOrder),
        resultGate: normalizeResultGate(parsed.resultGate),
        activeId: QUESTION_MAP.has(parsed.activeId) ? parsed.activeId : order[0],
        answers: parsed.answers && typeof parsed.answers === 'object' ? parsed.answers : {},
        skipped: parsed.skipped && typeof parsed.skipped === 'object' ? parsed.skipped : {},
        updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : Date.now(),
      };
    } catch {
      return createInitialState();
    }
  }

  function migrateLegacyState(legacyRaw) {
    try {
      const parsed = JSON.parse(legacyRaw);
      if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.order) || parsed.order.length !== TOTAL_QUESTIONS) {
        return createInitialState();
      }
      const order = parsed.order.filter((id) => QUESTION_MAP.has(id));
      if (order.length !== TOTAL_QUESTIONS) return createInitialState();
      return {
        version: 2,
        order,
        choiceOrder: buildChoiceOrder(),
        resultGate: normalizeResultGate(),
        activeId: QUESTION_MAP.has(parsed.activeId) ? parsed.activeId : order[0],
        answers: parsed.answers && typeof parsed.answers === 'object' ? parsed.answers : {},
        skipped: parsed.skipped && typeof parsed.skipped === 'object' ? parsed.skipped : {},
        updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : Date.now(),
      };
    } catch {
      return createInitialState();
    }
  }

  function saveState(state) {
    state.updatedAt = Date.now();
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage failures
    }
  }

  function getCounts(state) {
    let answered = 0;
    let skipped = 0;
    QUESTION_MAP.forEach((question, id) => {
      const answer = state.answers[String(id)];
      if (answer) {
        answered += 1;
      } else if (state.skipped[String(id)]) {
        skipped += 1;
      }
    });
    return {
      answered,
      skipped,
      remaining: TOTAL_QUESTIONS - answered,
    };
  }

  function findOrderIndex(state, id) {
    return state.order.indexOf(id);
  }

  function findPreviousQuestionId(state, id) {
    const index = findOrderIndex(state, id);
    if (index <= 0) return state.order[state.order.length - 1];
    return state.order[index - 1];
  }

  function findNextUnansweredId(state, id) {
    const startIndex = Math.max(0, findOrderIndex(state, id));
    for (let offset = 1; offset <= state.order.length; offset += 1) {
      const candidate = state.order[(startIndex + offset) % state.order.length];
      if (!state.answers[String(candidate)]) {
        return candidate;
      }
    }
    return id;
  }

  function findFirstSkippedId(state) {
    for (const id of state.order) {
      if (!state.answers[String(id)] && state.skipped[String(id)]) {
        return id;
      }
    }
    return null;
  }

  function calculateResults(state) {
    const counts = getCounts(state);
    if (counts.remaining !== 0) return null;

    const raw = { F: 0, S: 0, A: 0, C: 0, N: 0 };
    QUESTION_MAP.forEach((question, id) => {
      const answerKey = state.answers[String(id)];
      const choice = question.choices.find((entry) => entry.key === answerKey);
      if (!choice) return;
      choice.effects.forEach((effect) => {
        raw[effect.axis] += effect.value;
      });
    });

    const display = {};
    AXIS_KEYS.forEach((axis) => {
      display[axis] = Number(((raw[axis] / AXIS_MAX[axis]) * 5).toFixed(2));
    });

    const vector = AXIS_KEYS.map((axis) => display[axis]);
    // Near-neutral result vectors have almost no stable direction, so rank them by proximity instead.
    const lowAmplitudeReading = vectorMagnitude(vector) < 1;
    const ranked = ARCHETYPES
      .map((archetype) => {
        const archetypeVector = AXIS_KEYS.map((axis) => archetype.vector[axis]);
        const similarity = cosineSimilarity(vector, archetypeVector);
        const proximity = 1 / (1 + euclideanDistance(vector, archetypeVector));
        return {
          ...archetype,
          similarity,
          proximity,
          rankingScore: lowAmplitudeReading ? proximity : similarity,
        };
      })
      .sort((a, b) => (b.rankingScore - a.rankingScore) || (b.similarity - a.similarity) || (b.proximity - a.proximity));

    const topThree = ranked.slice(0, 3);
    const weights = normalizeBlend(topThree.map((entry) => entry.rankingScore));
    topThree.forEach((entry, index) => {
      entry.blend = weights[index];
    });

    const anchor = topThree[0];
    const tensionAxis = AXIS_KEYS
      .map((axis) => ({
        axis,
        delta: Math.abs(display[axis] - anchor.vector[axis]),
      }))
      .sort((a, b) => b.delta - a.delta)[0].axis;

    return {
      display,
      anchor,
      topThree,
      tensionAxis,
      tensionLine: buildTensionLine(tensionAxis, display[tensionAxis], anchor.vector[tensionAxis]),
      discoveryArc: topThree.map((entry) => entry.name).join(' -> '),
    };
  }

  function cosineSimilarity(a, b) {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i += 1) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    if (!normA || !normB) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  function vectorMagnitude(vector) {
    return Math.sqrt(vector.reduce((sum, value) => sum + (value * value), 0));
  }

  function euclideanDistance(a, b) {
    let total = 0;
    for (let i = 0; i < a.length; i += 1) {
      const delta = a[i] - b[i];
      total += delta * delta;
    }
    return Math.sqrt(total);
  }

  function normalizeBlend(similarities) {
    const shifted = similarities.map((value) => Math.max(0.001, value + 1));
    const total = shifted.reduce((sum, value) => sum + value, 0);
    return shifted.map((value) => Math.round((value / total) * 100));
  }

  function buildTensionLine(axisKey, actual, anchor) {
    const axis = AXES[axisKey];
    const leaning = actual >= 0 ? axis.positive : axis.negative;
    const anchorLeaning = anchor >= 0 ? axis.positive : axis.negative;
    if (leaning === anchorLeaning) {
      return `This is the clearest point of departure: you and this alignment both face toward ${anchorLeaning}, but with different intensity.`;
    }
    return `This is the clearest point of departure: your answers lean toward ${leaning}, while the alignment leans toward ${anchorLeaning}.`;
  }

  function buildAxisInterpretation(axisKey, value) {
    const axis = AXES[axisKey];
    const absValue = Math.abs(value);

    if (absValue < 0.75) {
      return `Here you stay near the midpoint between ${axis.negative} and ${axis.positive}.`;
    }

    const leaning = value >= 0 ? axis.positive : axis.negative;
    const strength = absValue < 1.75
      ? 'lean slightly'
      : absValue < 3.25
        ? 'lean distinctly'
        : 'lean strongly';

    return `Here your answers ${strength} toward ${leaning}.`;
  }

  function buildDiscoveryArcLine(topThree) {
    const names = topThree.map((entry) => entry.name);
    if (names.length < 3) return names.join(', ');
    return `Beyond the nearest alignment, the reading also draws on ${names[1]} and ${names[2]}.`;
  }

  function humanizeChain(chain) {
    const parts = String(chain || '')
      .split('->')
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length <= 1) return parts[0] || '';
    if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
    return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`;
  }

  function buildReadMoreLineage(entry) {
    return `In thought it runs from ${humanizeChain(entry.conceptual)}. In historical company it keeps near ${humanizeChain(entry.biographical)}.`;
  }

  function buildReadMoreInterpretation(entry) {
    return `${entry.name} is the historical temperament nearest to your answers. It does not claim you whole; it names the voice that most nearly matches what your pattern trusts, resists, and finds beautiful.`;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function mountCompass() {
    const moduleLaunch = document.getElementById('compassLaunch');
    const moduleModal = document.getElementById('compassModal');
    const moduleDialog = document.getElementById('compassDialog');
    const moduleClose = document.getElementById('compassClose');
    const questionCard = document.getElementById('compassQuestionCard');
    const stats = document.getElementById('compassStats');
    const skippedList = document.getElementById('compassSkippedList');
    const indexGrid = document.getElementById('compassIndex');
    const resultPanel = document.getElementById('compassResults');
    const prevButton = document.getElementById('compassPrev');
    const skipButton = document.getElementById('compassSkip');
    const nextButton = document.getElementById('compassNext');
    const reviewButton = document.getElementById('compassReview');
    const resetButton = document.getElementById('compassReset');
    const leadModal = document.getElementById('compassLeadModal');
    const leadDialog = document.getElementById('compassLeadDialog');
    const leadForm = document.getElementById('compassLeadForm');
    const leadEmail = document.getElementById('compassLeadEmail');
    const leadHelper = document.getElementById('compassLeadHelper');
    const leadSkip = document.getElementById('compassLeadSkip');
    const leadClose = document.getElementById('compassLeadClose');

    if (!moduleLaunch || !moduleModal || !moduleDialog || !moduleClose || !questionCard || !stats || !skippedList || !indexGrid || !resultPanel || !prevButton || !skipButton || !nextButton || !reviewButton || !resetButton) {
      return;
    }

    let state = loadState();
    let moduleOpen = false;
    let moduleCleanup = null;
    let moduleReturnFocus = null;
    let gateOpen = false;
    let gateAutoPrompted = false;
    let gateCleanup = null;
    let gateReturnFocus = null;

    function syncBodyModalState() {
      document.body.classList.toggle('is-modal-open', moduleOpen || gateOpen);
    }

    function releaseModuleTrap() {
      if (typeof moduleCleanup === 'function') {
        moduleCleanup();
      }
      moduleCleanup = null;
    }

    function activateModuleTrap() {
      if (!moduleOpen || !moduleDialog) return;
      releaseModuleTrap();
      moduleCleanup = window.SEP && window.SEP.modal && typeof window.SEP.modal.trap === 'function'
        ? window.SEP.modal.trap(moduleDialog, { initialFocusEl: prevButton || moduleClose, onEscape: closeCompass })
        : null;
    }

    function setGateMessage(message) {
      if (!leadHelper) return;
      leadHelper.textContent = message;
    }

    function openCompass(triggerEl) {
      if (!moduleModal || !moduleDialog || moduleOpen) return;
      moduleOpen = true;
      moduleReturnFocus = triggerEl || document.activeElement;
      moduleModal.hidden = false;
      syncBodyModalState();
      activateModuleTrap();
      render();
    }

    function closeCompass() {
      if (!moduleModal || !moduleOpen) return;
      closeResultGate();
      moduleOpen = false;
      moduleModal.hidden = true;
      releaseModuleTrap();
      syncBodyModalState();
      if (moduleReturnFocus && typeof moduleReturnFocus.focus === 'function') {
        try {
          moduleReturnFocus.focus();
        } catch {
          // ignore focus restoration failures
        }
      }
      moduleReturnFocus = null;
    }

    function closeResultGate() {
      if (!leadModal || !leadDialog || !gateOpen) return;
      gateOpen = false;
      leadModal.hidden = true;
      if (typeof gateCleanup === 'function') {
        gateCleanup();
      }
      gateCleanup = null;
      if (moduleOpen) {
        activateModuleTrap();
      } else {
        releaseModuleTrap();
      }
      syncBodyModalState();
      if (gateReturnFocus && typeof gateReturnFocus.focus === 'function') {
        try {
          gateReturnFocus.focus();
        } catch {
          // ignore focus restoration failures
        }
      }
      gateReturnFocus = null;
    }

    function openResultGate(triggerEl) {
      if (!leadModal || !leadDialog || gateOpen || canRevealResults(state)) return;
      gateOpen = true;
      gateReturnFocus = triggerEl || document.activeElement;
      releaseModuleTrap();
      leadModal.hidden = false;
      syncBodyModalState();
      if (leadEmail) {
        leadEmail.value = state.resultGate.email || '';
      }
      setGateMessage('');
      gateCleanup = window.SEP && window.SEP.modal && typeof window.SEP.modal.trap === 'function'
        ? window.SEP.modal.trap(leadDialog, { initialFocusEl: leadEmail, onEscape: closeResultGate })
        : null;
    }

    function unlockResults(status, email) {
      state.resultGate = normalizeResultGate({ status, email });
      saveState(state);
      closeResultGate();
      render();
    }

    function submitResultGate(email) {
      const normalizedEmail = String(email || '').trim();
      if (!normalizedEmail) {
        setGateMessage('Leave an email to open the reading, or continue without it.');
        if (leadEmail) leadEmail.focus();
        return;
      }

      setGateMessage('Receiving your address...');

      fetch(UPDATES_ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, source: 'anglossic-compass-results' }),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json().catch(() => ({}));
        })
        .then(() => {
          unlockResults('submitted', normalizedEmail);
        })
        .catch(() => {
          state.resultGate.email = normalizedEmail;
          saveState(state);
          setGateMessage('That did not go through just now. You can still continue without email.');
        });
    }

    function setActive(id) {
      if (!QUESTION_MAP.has(id)) return;
      state.activeId = id;
      saveState(state);
      render();
    }

    function answerQuestion(id, key) {
      state.answers[String(id)] = key;
      delete state.skipped[String(id)];
      const counts = getCounts(state);
      if (counts.remaining > 0) {
        state.activeId = findNextUnansweredId(state, id);
      }
      saveState(state);
      render();
    }

    function skipQuestion(id) {
      if (state.answers[String(id)]) return;
      state.skipped[String(id)] = true;
      const nextId = findNextUnansweredId(state, id);
      state.activeId = nextId;
      saveState(state);
      render();
    }

    function resetSession() {
      if (!window.confirm('Reset the current session and reshuffle the Compass?')) return;
      closeResultGate();
      gateAutoPrompted = false;
      state = createInitialState();
      saveState(state);
      render();
    }

    function renderStatsPanel(counts) {
      const percent = Math.round((counts.answered / TOTAL_QUESTIONS) * 100);
      stats.innerHTML = `
        <div class="compass-stat">
          <span class="compass-stat__label">Answered</span>
          <span class="compass-stat__value">${counts.answered}</span>
        </div>
        <div class="compass-stat">
          <span class="compass-stat__label">Set Aside</span>
          <span class="compass-stat__value">${counts.skipped}</span>
        </div>
        <div class="compass-stat">
          <span class="compass-stat__label">Unanswered</span>
          <span class="compass-stat__value">${counts.remaining}</span>
        </div>
        <div class="compass-stat">
          <span class="compass-stat__label">Progress</span>
          <span class="compass-stat__value">${percent}%</span>
        </div>
      `;
    }

    function renderQuestion(counts) {
      const question = QUESTION_MAP.get(state.activeId);
      if (!question) return;
      const selected = state.answers[String(question.id)] || '';
      const queueIndex = findOrderIndex(state, question.id) + 1;
      const orderedChoices = getOrderedChoices(question, state);
      questionCard.innerHTML = `
        <div class="compass-question__meta">
          <span>Session position ${queueIndex} / ${TOTAL_QUESTIONS}</span>
          <span>Question ${question.id}</span>
          <span>${escapeHtml(question.section)}</span>
        </div>
        <h3 class="compass-question__prompt">${escapeHtml(question.prompt)}</h3>
        <div class="compass-choice-list">
          ${orderedChoices.map((choice) => `
            <button
              class="compass-choice${selected === choice.key ? ' is-selected' : ''}"
              type="button"
              data-choice="${choice.key}"
            >
              <span class="compass-choice__key">${choice.key}</span>
              <span class="compass-choice__body">
                <span class="compass-choice__lineage">${escapeHtml(CHOICE_LINEAGES[choice.key] || '')}</span>
                <span class="compass-choice__label">${escapeHtml(buildChoiceSentence(question, choice))}</span>
              </span>
            </button>
          `).join('')}
        </div>
        <p class="compass-question__hint">
          The sequence wanders by design. If a prompt needs more time, set it aside; the rail and the map will hold your place.
        </p>
      `;

      questionCard.querySelectorAll('[data-choice]').forEach((button) => {
        button.addEventListener('click', () => {
          const key = button.getAttribute('data-choice');
          if (!key) return;
          answerQuestion(question.id, key);
        });
      });

      skipButton.disabled = Boolean(selected);
      nextButton.textContent = counts.remaining === 0 ? 'Review the reading' : 'Next unanswered';
    }

    function renderSkipped(counts) {
      const skippedIds = state.order.filter((id) => !state.answers[String(id)] && state.skipped[String(id)]);
      if (!skippedIds.length) {
        skippedList.innerHTML = '<p class="compass-empty">Nothing is waiting here.</p>';
        reviewButton.disabled = counts.skipped === 0;
        return;
      }
      skippedList.innerHTML = skippedIds.map((id) => {
        const question = QUESTION_MAP.get(id);
        return `
          <button class="compass-jump chip chip--skipped" type="button" data-jump="${id}">
            <span>Q${id}</span>
            <span>${escapeHtml(question.prompt)}</span>
          </button>
        `;
      }).join('');
      reviewButton.disabled = false;
      skippedList.querySelectorAll('[data-jump]').forEach((button) => {
        button.addEventListener('click', () => {
          const id = Number(button.getAttribute('data-jump'));
          setActive(id);
        });
      });
    }

    function renderIndex() {
      indexGrid.innerHTML = state.order.map((id) => {
        const answered = Boolean(state.answers[String(id)]);
        const skipped = !answered && Boolean(state.skipped[String(id)]);
        const isActive = id === state.activeId;
        const statusClass = answered ? 'is-answered' : skipped ? 'is-skipped' : 'is-unseen';
        return `
          <button
            type="button"
            class="compass-index__item ${statusClass}${isActive ? ' is-active' : ''}"
            data-jump="${id}"
            aria-label="Jump to question ${id}"
          >
            ${id}
          </button>
        `;
      }).join('');

      indexGrid.querySelectorAll('[data-jump]').forEach((button) => {
        button.addEventListener('click', () => {
          setActive(Number(button.getAttribute('data-jump')));
        });
      });
    }

    function renderResults() {
      const result = calculateResults(state);
      if (!result) {
        gateAutoPrompted = false;
        resultPanel.hidden = false;
        resultPanel.innerHTML = `
          <div class="compass-result__locked">
            <h3>The Reading Is Not Yet Settled</h3>
            <p>Finish every prompt to bring the pattern into focus. Anything held aside still belongs to the reading until you return to it.</p>
          </div>
        `;
        return;
      }

      if (!canRevealResults(state)) {
        resultPanel.hidden = false;
        resultPanel.innerHTML = `
          <div class="compass-result__gate">
            <p class="compass-result__eyebrow">Reading Ready</p>
            <h3>Examine My Results</h3>
            <p>Your pattern has settled. Leave an email to open the reading and keep a line back to future modules, or continue without it if you prefer.</p>
            <div class="compass-result__gate-actions">
              <button class="compass-result__gate-button" id="compassExamineResults" type="button">Open the reading</button>
            </div>
          </div>
        `;

        const gateButton = document.getElementById('compassExamineResults');
        if (gateButton) {
          gateButton.addEventListener('click', () => openResultGate(gateButton));
        }

        if (!gateAutoPrompted && !gateOpen && moduleOpen) {
          gateAutoPrompted = true;
          window.requestAnimationFrame(() => openResultGate(gateButton));
        }
        return;
      }

      resultPanel.hidden = false;
        resultPanel.innerHTML = `
        <div class="compass-result__header">
          <div>
            <p class="compass-result__eyebrow">Nearest Alignment</p>
            <h3>${escapeHtml(result.anchor.name)}</h3>
            <p class="compass-result__summary">${escapeHtml(result.anchor.summary)} Your answers keep nearest company with this tradition, though other currents remain active beneath it.</p>
            <details class="compass-result__read-more">
              <summary>Read More</summary>
              <p>${escapeHtml(buildReadMoreInterpretation(result.anchor))}</p>
              <p>${escapeHtml(buildReadMoreLineage(result.anchor))}</p>
              <p>${escapeHtml(result.anchor.witness.excerpt)}</p>
              <p class="compass-archetype__citation">${escapeHtml(result.anchor.witness.citation)}</p>
            </details>
          </div>
          <div class="compass-result__tension">
            <span class="compass-result__tension-label">Point of departure</span>
            <p>${escapeHtml(result.tensionLine)}</p>
          </div>
        </div>
        <div class="compass-blend">
          ${result.topThree.map((entry) => `
            <article class="compass-blend__card">
              <div class="compass-blend__percent">${entry.blend}%</div>
              <div class="compass-blend__name">${escapeHtml(entry.name)}</div>
              <div class="compass-blend__tagline">${escapeHtml(entry.summary)}</div>
            </article>
          `).join('')}
        </div>
        <div class="compass-axes">
          ${AXIS_KEYS.map((axisKey) => {
            const axis = AXES[axisKey];
            const value = result.display[axisKey];
            const width = Math.min(100, Math.abs(value) * 20);
            return `
              <div class="compass-axis">
                <div class="compass-axis__head">
                  <span>${axisKey}</span>
                  <span>${escapeHtml(axis.name)}</span>
                  <strong>${value > 0 ? '+' : ''}${value.toFixed(2)}</strong>
                </div>
                <div class="compass-axis__rail">
                  <div class="compass-axis__fill${value >= 0 ? ' is-positive' : ' is-negative'}" style="width:${width}%"></div>
                </div>
                <div class="compass-axis__poles">
                  <span>${escapeHtml(axis.negative)}</span>
                  <span>${escapeHtml(axis.positive)}</span>
                </div>
                <p>${escapeHtml(buildAxisInterpretation(axisKey, value))}</p>
              </div>
            `;
          }).join('')}
        </div>
        <div class="compass-result__codex">
          ${result.topThree.map((entry) => `
            <details class="compass-archetype">
              <summary>${escapeHtml(entry.name)} <span>${entry.blend}%</span></summary>
              <p>${escapeHtml(entry.summary)}</p>
              <div class="compass-archetype__genealogy">
                <div>
                  <span class="compass-archetype__label">Conceptual Line</span>
                  <p>${escapeHtml(entry.conceptual)}</p>
                </div>
                <div>
                  <span class="compass-archetype__label">Historical Company</span>
                  <p>${escapeHtml(entry.biographical)}</p>
                </div>
              </div>
              <blockquote class="compass-archetype__quote">${escapeHtml(entry.witness.excerpt)}</blockquote>
              <p class="compass-archetype__citation">${escapeHtml(entry.witness.citation)}</p>
            </details>
          `).join('')}
        </div>
        <p class="compass-result__arc"><strong>Secondary currents:</strong> ${escapeHtml(buildDiscoveryArcLine(result.topThree))}</p>
      `;
    }

    function render() {
      const counts = getCounts(state);
      renderStatsPanel(counts);
      renderQuestion(counts);
      renderSkipped(counts);
      renderIndex();
      renderResults();
    }

    prevButton.addEventListener('click', () => {
      setActive(findPreviousQuestionId(state, state.activeId));
    });

    skipButton.addEventListener('click', () => {
      skipQuestion(state.activeId);
    });

    nextButton.addEventListener('click', () => {
      setActive(findNextUnansweredId(state, state.activeId));
    });

    reviewButton.addEventListener('click', () => {
      const skippedId = findFirstSkippedId(state);
      if (skippedId) setActive(skippedId);
    });

    resetButton.addEventListener('click', resetSession);

    moduleLaunch.addEventListener('click', () => {
      openCompass(moduleLaunch);
    });

    moduleClose.addEventListener('click', closeCompass);

    moduleModal.addEventListener('click', (event) => {
      if (event.target === moduleModal) {
        closeCompass();
      }
    });

    if (leadModal && leadDialog) {
      leadModal.addEventListener('click', (event) => {
        if (event.target === leadModal) {
          closeResultGate();
        }
      });
    }

    if (leadForm) {
      leadForm.addEventListener('submit', (event) => {
        event.preventDefault();
        submitResultGate(leadEmail ? leadEmail.value : '');
      });
    }

    if (leadSkip) {
      leadSkip.addEventListener('click', () => {
        unlockResults('dismissed', leadEmail ? String(leadEmail.value || '').trim() : '');
      });
    }

    if (leadClose) {
      leadClose.addEventListener('click', closeResultGate);
    }

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountCompass, { once: true });
  } else {
    mountCompass();
  }
})();
