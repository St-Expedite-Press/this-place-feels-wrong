(function () {
  const STORAGE_KEY = 'sep-anglossic-compass-v1';
  const TOTAL_QUESTIONS = 55;

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

  function createInitialState() {
    const order = shuffleIds(Array.from(QUESTION_MAP.keys()));
    return {
      version: 1,
      order,
      activeId: order[0],
      answers: {},
      skipped: {},
      updatedAt: Date.now(),
    };
  }

  function loadState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return createInitialState();
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.order) || parsed.order.length !== TOTAL_QUESTIONS) {
        return createInitialState();
      }
      const order = parsed.order.filter((id) => QUESTION_MAP.has(id));
      if (order.length !== TOTAL_QUESTIONS) return createInitialState();
      return {
        version: 1,
        order,
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
    const ranked = ARCHETYPES
      .map((archetype) => ({
        ...archetype,
        similarity: cosineSimilarity(vector, AXIS_KEYS.map((axis) => archetype.vector[axis])),
      }))
      .sort((a, b) => b.similarity - a.similarity);

    const topThree = ranked.slice(0, 3);
    const weights = normalizeBlend(topThree.map((entry) => entry.similarity));
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
      return `You and the anchor type resolve ${axis.name} in the same direction, but with different intensity.`;
    }
    return `Your answers continue to divide between ${axis.negative} and ${axis.positive}; the anchor resolves this axis more strongly toward ${anchorLeaning}.`;
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

    if (!questionCard || !stats || !skippedList || !indexGrid || !resultPanel || !prevButton || !skipButton || !nextButton || !reviewButton || !resetButton) {
      return;
    }

    let state = loadState();

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
          <span class="compass-stat__label">Skipped</span>
          <span class="compass-stat__value">${counts.skipped}</span>
        </div>
        <div class="compass-stat">
          <span class="compass-stat__label">Remaining</span>
          <span class="compass-stat__value">${counts.remaining}</span>
        </div>
        <div class="compass-stat">
          <span class="compass-stat__label">Completion</span>
          <span class="compass-stat__value">${percent}%</span>
        </div>
      `;
    }

    function renderQuestion(counts) {
      const question = QUESTION_MAP.get(state.activeId);
      if (!question) return;
      const selected = state.answers[String(question.id)] || '';
      const queueIndex = findOrderIndex(state, question.id) + 1;
      questionCard.innerHTML = `
        <div class="compass-question__meta">
          <span>Session position ${queueIndex} / ${TOTAL_QUESTIONS}</span>
          <span>Question ${question.id}</span>
          <span>${escapeHtml(question.section)}</span>
        </div>
        <h3 class="compass-question__prompt">${escapeHtml(question.prompt)}</h3>
        <div class="compass-choice-list">
          ${question.choices.map((choice) => `
            <button
              class="compass-choice${selected === choice.key ? ' is-selected' : ''}"
              type="button"
              data-choice="${choice.key}"
            >
              <span class="compass-choice__key">${choice.key}</span>
              <span class="compass-choice__label">${escapeHtml(choice.label)}</span>
            </button>
          `).join('')}
        </div>
        <p class="compass-question__hint">
          Questions are shuffled for this session. You can skip any prompt and return through the review queue or the question index.
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
      nextButton.textContent = counts.remaining === 0 ? 'Review answers' : 'Next open';
    }

    function renderSkipped(counts) {
      const skippedIds = state.order.filter((id) => !state.answers[String(id)] && state.skipped[String(id)]);
      if (!skippedIds.length) {
        skippedList.innerHTML = '<p class="compass-empty">No skipped questions are waiting.</p>';
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
        resultPanel.hidden = false;
        resultPanel.innerHTML = `
          <div class="compass-result__locked">
            <h3>Result Locked</h3>
            <p>Complete every question to open the final archetypal blend. Skipped prompts remain open until they are answered.</p>
          </div>
        `;
        return;
      }

      resultPanel.hidden = false;
      resultPanel.innerHTML = `
        <div class="compass-result__header">
          <div>
            <p class="compass-result__eyebrow">Resultant Field</p>
            <h3>${escapeHtml(result.anchor.name)}</h3>
            <p class="compass-result__summary">${escapeHtml(result.anchor.summary)}</p>
          </div>
          <div class="compass-result__tension">
            <span class="compass-result__tension-label">Primary tension</span>
            <strong>${escapeHtml(AXES[result.tensionAxis].name)}</strong>
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
                  <span class="compass-archetype__label">Conceptual genealogy</span>
                  <p>${escapeHtml(entry.conceptual)}</p>
                </div>
                <div>
                  <span class="compass-archetype__label">Biographical genealogy</span>
                  <p>${escapeHtml(entry.biographical)}</p>
                </div>
              </div>
              <blockquote class="compass-archetype__quote">${escapeHtml(entry.witness.excerpt)}</blockquote>
              <p class="compass-archetype__citation">${escapeHtml(entry.witness.citation)}</p>
            </details>
          `).join('')}
        </div>
        <p class="compass-result__arc"><strong>Discovery arc:</strong> ${escapeHtml(result.discoveryArc)}</p>
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

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountCompass, { once: true });
  } else {
    mountCompass();
  }
})();
