/* ============================================================
   THE ORACLE
   An intuitive recommender tied to the Allmer catalog.

   Mirrors the catalog's "functional medium" division. Starts
   directly at the medium question.

   Built so far:
     L0  medium → which studio (in catalog order)
     L1  journals → Which topic? → the volumes on that shelf
     L1  games  → Digital or physical?
     L2         → How many players?
     L3+        → nature, fate, the hour — but only while the games
                  still standing disagree. The moment one is left,
                  the Oracle speaks.
    Comics, Films and Music are "coming soon" leaves.

   Navigation is an ELEVATOR: each answer is a floor. You ride
   up/down through the floors you've visited (buttons, ↑/↓ keys),
   ←/→ move the highlighted choice, Space/Enter selects, Esc rides
   back up to the medium. Choosing a new option on a floor discards
   the floors below it.

   New catalog games slot into GAMES below — name, slug, brand,
   player counts, Bartle types, fate, minutes. Digital-only titles
   use digitalOnly(). New questions slot into QUESTIONS, in the
   order they should be asked.
   ============================================================ */

// Studio hues — worn by every floor below their branch.
const COMICS_COLOR = '#ef4444';
const FILMS_COLOR = '#3b82f6';
const MUSIC_COLOR = '#fbbf24';
const GAMES_COLOR = '#10b981';
const JOURNALS_COLOR = '#b8763a';

const ORACLE = {
    start: 'medium',
    nodes: {
        // ---- Entry: the functional branch ----
        medium: {
            label: 'Medium',
            color: '#c8a96a',
            eyebrow: 'The Oracle',
            prompt: 'Through which <em>medium</em> shall the Oracle speak?',
            sub: 'Five studios. Choose the one whose craft you desire.',
            choices: ['comics', 'films', 'music', 'games', 'journals'],
        },

        // ---- The five studios ----
        comics: {
            label: 'Comics',
            color: COMICS_COLOR,
            hint: 'Ink, panel, and page',
            eyebrow: 'By Genre',
            prompt: 'Which <em>genre</em> calls you?',
            sub: 'Two worlds are being drawn.',
            options: [
                {
                    label: 'Fantasy',
                    hint: 'The Art of Futory',
                    verdict: {
                        title: 'The Art of Futory',
                        body: 'A universe drawn before it is told.',
                        note: 'Ready yourself — Futory: Dragon Kingdom arrives next year.',
                        links: [['The Art of Futory', 'https://simonallmer.com/artoffutory']],
                    },
                },
                {
                    label: 'Historical Drama',
                    hint: 'American Portrait',
                    verdict: {
                        title: 'American Portrait',
                        body: 'A life told whole, in ink — the good and the bad, unflinching.',
                        note: 'In production. Patience: what is drawn slowly is drawn to last.',
                        links: [['American Portrait', 'https://simonallmer.com/americanportrait']],
                    },
                },
            ],
        },
        films: {
            label: 'Films',
            color: FILMS_COLOR,
            hint: 'Light in the dark',
            verdict: {
                title: 'American Portrait',
                body: 'Simon is at work on it now. The page holds an early look.',
                note: 'Patience is its own devotion. What is made slowly is made to last.',
                links: [['Early look', 'https://simonallmer.com/americanportrait']],
            },
        },
        music: {
            label: 'Music',
            color: MUSIC_COLOR,
            hint: 'Sound and score',
            eyebrow: 'By Ear',
            prompt: 'What do you wish to <em>hear</em>?',
            sub: 'Every recording lives on one page. The Oracle will name what to seek there.',
            options: [
                {
                    label: 'Pop',
                    hint: 'Simon',
                    verdict: {
                        title: 'Simon',
                        body: 'Pop, under his own name.',
                        note: 'Seek that name on the Audio page.',
                        links: [['Audio', 'https://simonallmer.com/audio']],
                    },
                },
                {
                    label: 'Soul',
                    hint: 'Soul Town',
                    verdict: {
                        title: 'Soul Town',
                        body: 'Soul, and the town it comes from.',
                        note: 'Seek that name on the Audio page.',
                        links: [['Audio', 'https://simonallmer.com/audio']],
                    },
                },
                {
                    label: 'Score',
                    hint: 'American Portrait',
                    verdict: {
                        title: 'American Portrait',
                        body: 'The score written for the American epic.',
                        note: 'Seek that name on the Audio page.',
                        links: [['Audio', 'https://simonallmer.com/audio']],
                    },
                },
            ],
        },
        games: {
            label: 'Games',
            color: GAMES_COLOR,
            hint: 'Play made design',
            eyebrow: 'By Form',
            prompt: 'Shall the play be <em>digital</em> or <em>physical</em>?',
            sub: 'Screen or table — the form decides which games can gather.',
            choices: ['digital', 'physical'],
        },

        // ---- The two forms of play ----
        // Each leads to its own player question, because the two forms
        // offer different table sizes (see playerCounts).
        digital: {
            label: 'Digital',
            color: GAMES_COLOR,
            hint: 'Screen, arcade, machine',
            mode: 'digital',
            eyebrow: 'By Players',
            prompt: 'How many <em>players</em> gather?',
            sub: 'Machines fill the empty seats — every game plays from one.',
            question: 'players',
        },
        physical: {
            label: 'Physical',
            color: GAMES_COLOR,
            hint: 'Cards, board, table',
            mode: 'physical',
            eyebrow: 'By Players',
            prompt: 'How many <em>players</em> gather?',
            sub: 'Every seat is a person — the Oracle will name the games for your table.',
            question: 'players',
        },
        journals: {
            label: 'Journals',
            color: JOURNALS_COLOR,
            hint: 'The written record',
            eyebrow: 'By Interest',
            prompt: 'What draws your <em>interest</em>?',
            sub: 'Choose the subject and the Oracle will hand you the volume.',
            question: 'topic',
        },
    },
};

// ============================================================
//  The Games — drawn from the catalog.
//  counts   = the table-sizes the game is designed for.
//             (Seven Wonders is exactly 2 OR 4 — never 3 — hence a set.)
//  physical = the sizes you can actually sit down and play in print.
//             An empty set means there is no physical edition yet, so
//             the title never appears on the physical floor and carries
//             no Product link.
//  types    = which players the game serves. Bartle's four, plus the
//             Solver — Bartle wrote for shared worlds, where the only
//             things to act on are the world and other people, so the
//             one who sits alone against a problem had no seat.
//  fate     = how much chance decides: none | some | much. A title can
//             hold two — American Playing Cards is many games in one
//             deck, Elements can be played hard or played light.
//  minutes  = the ceiling of its band: 5, 15 or 30. Nothing runs past
//             thirty, so you can always switch it up or play again.
//  Digitally every game plays from 1 up to its largest table, since
//  machines take the empty seats — see countsFor().
//  Slugs build the three links: /slug, /slugarcade, /slugdemo.
//  A title whose pages don't follow that pattern names its own in
//  `links` — both Futory sets share one product page and one pair
//  of Futory Cards doors.
//  TBA titles (Trinity, Capital, Equilibrium, Silk Road) are omitted
//  until made.
// ============================================================
// ------------------------------------------------------------
//  Shared pages — a temporary state, not the destination.
//  Every product is meant to have a page of its own; until then
//  some titles borrow a brand's. Where two doors on one row would
//  open the same page, doorsFor() shows it once, so the collapse
//  is visible as a missing button.
//
//  Still to be made, in Simon's order:
//    · Casino Camino — Fortuna and Ricochet share /camino as both
//      product and demo, so neither has a Demo door.
//    · Beat Race — no product page apart from /beatrace, so it
//      shows no Product door. (Crosslink is done: it has its own
//      three pages, and its override came down.)
//  Shared across titles rather than within a row, also unfinished:
//    · Futory Cards Unity and Duality share /futory and both
//      Futory Cards doors.
//    · Believe Objects rides entirely on the Believe pages.
//    · All fourteen Wonders share /sevenwondersarcade.
// ------------------------------------------------------------
const FUTORY_CARDS = {
    product: 'futory',
    arcade: 'futorycardsarcade',
    demo: 'futorycardsdemo',
};

// Fortuna and Ricochet are played on the road itself — one Camino page
// serves as both product and demo.
const CASINO_CAMINO = {
    product: 'camino',
    arcade: 'casinocaminoarcade',
    demo: 'camino',
};

// All fourteen Wonders share one arcade. Product and demo stay their
// own — /pyramid, /pyramiddemo — so only the arcade is named here.
const SEVEN_WONDERS = {
    arcade: 'sevenwondersarcade',
};

// Believe Objects lives behind the Believe pages.
const BELIEVE = {
    product: 'believe',
    arcade: 'believearcade',
    demo: 'believedemo',
};

const GAMES = [
    // Seven Wonders — designed for 2 or 4 players, no chance at all.
    // Only Pyramid and Statue are in print so far; the rest are screen-only.
    sw('Pyramid', 'pyramid', [2, 4]),
    sw('Gardens', 'gardens'),
    sw('Temple', 'temple'),
    sw('Statue', 'statue', [2]),
    sw('Mausoleum', 'mausoleum'),
    sw('Colossus', 'colossus'),
    sw('Pharos', 'pharos'),
    sw('Colosseum', 'colosseum'),
    sw('Great Wall', 'greatwall'),
    sw('Library', 'library'),
    sw('Tower', 'tower'),
    sw('Cathedral', 'cathedral'),
    sw('Palace', 'palace'),
    sw('Skyscraper', 'skyscraper'),

    // Futory — 2-4 (2-6 when several titles are combined).
    // Both sets live behind the one Futory page and the one pair of
    // Futory Cards doors.
    game('Futory Cards Unity', 'futorycardsunity', 'Futory',
        { min: 2, max: 4, types: 'achiever explorer', fate: 'some', minutes: 30, links: FUTORY_CARDS }),
    game('Futory Cards Duality', 'futorycardsduality', 'Futory',
        { min: 2, max: 4, types: 'achiever explorer', fate: 'some', minutes: 30, links: FUTORY_CARDS }),

    // Casino Camino — the road, the gamble
    // Many games in one deck — some of them lean on chance harder than others.
    game('American Playing Cards', 'americanplayingcards', 'Casino Camino',
        { min: 2, max: 6, types: 'socializer killer', fate: 'some much', minutes: 15 }),
    game('Fortuna', 'fortuna', 'Casino Camino',
        { min: 2, max: 8, types: 'socializer achiever', fate: 'much', minutes: 15, links: CASINO_CAMINO }),
    game('Ricochet', 'ricochet', 'Casino Camino',
        { min: 2, max: 8, types: 'killer socializer', fate: 'much', minutes: 15, links: CASINO_CAMINO }),

    // Believe — the story told on the spot. Purely social; the random
    // draw is the only place chance enters.
    game('Believe', 'believe', 'Believe',
        { min: 2, max: 8, types: 'socializer', fate: 'some', minutes: 15 }),
    game('Believe Objects', 'believeobjects', 'Believe',
        { min: 2, max: 8, types: 'socializer achiever', fate: 'some', minutes: 15, links: BELIEVE }),

    // Detective Noname — solo, screen only. One chapter ≈ 30 minutes.
    // The riddle itself is read at /noname; the brand page is its own.
    digitalOnly('Detective Noname and the Silent Circle', 'noname', 'Detective Noname',
        { min: 1, max: 1, types: 'solver explorer', fate: 'none', minutes: 30,
          links: { product: 'detectivenoname', arcade: 'detectivenonamearcade', demo: 'noname' } }),

    // Screen-born solo games — no physical edition
    digitalOnly('Beat Race', 'beatrace', '',
        { min: 1, max: 1, types: 'achiever', fate: 'none', minutes: 5,
          links: { product: 'beatrace', arcade: 'beatracearcade', demo: 'beatrace' } }),
    // No story to enter — only the problem.
    digitalOnly('Crosslink', 'crosslink', '',
        { min: 1, max: 1, types: 'solver', fate: 'none', minutes: 5 }),

    // Elements — learned in two minutes. You race to shed cards rather
    // than to beat anyone, and it stays light enough to talk over.
    // Playable strategically, though most won't — hence both fates.
    game('Elements', 'elements', 'Elements',
        { min: 2, max: 6, types: 'socializer achiever', fate: 'some much', minutes: 15 }),

    // Nectar (brand to be confirmed) — everything but an explorer's game
    game('Nectar', 'nectar', '',
        { min: 2, max: 6, types: 'achiever socializer killer', fate: 'some', minutes: 15 }),
];

const MAX_PLAYERS = 8;

function range(min, max) {
    const out = [];
    for (let i = min; i <= max; i++) out.push(i);
    return out;
}

// Every Seven Wonders title shares its nature: pure strategy, no chance,
// a full half-hour. `physical` is the only thing that differs — which of
// the 2/4 tables you can buy in a box (none by default).
function sw(name, slug, physical = []) {
    return game(name, slug, 'Seven Wonders',
        { counts: [2, 4], physical, types: 'achiever killer', fate: 'none', minutes: 30, links: SEVEN_WONDERS });
}

function game(name, slug, brand, o) {
    const counts = o.counts || range(o.min, o.max);
    return {
        name, slug, brand, counts,
        physical: o.physical || counts,   // in print at every size, unless told otherwise
        types: o.types.split(' '),
        fate: o.fate.split(' '),
        minutes: o.minutes,
        links: o.links || null,           // null = derive the three doors from the slug
    };
}

// A title that exists only on a screen — it never reaches the table.
function digitalOnly(name, slug, brand, o) {
    return game(name, slug, brand, { ...o, physical: [] });
}

// The three doors. Most titles derive them from the slug; a title that
// names its own in `links` wins.
//
// A door is only worth showing if it goes somewhere new: every title
// offers its product page, in print or not, and any door repeating a
// page already offered on the row is dropped. So Detective Noname shows
// all three (brand page, arcade, the riddle itself), while Beat Race —
// whose product page is its demo — shows two.
function linkFor(g, kind) {
    const derived = { product: g.slug, arcade: g.slug + 'arcade', demo: g.slug + 'demo' };
    return `https://simonallmer.com/${(g.links && g.links[kind]) || derived[kind]}`;
}

// Product, Arcade, Demo — minus any door that leads where another
// already goes.
//
// When one page answers to two names, the truer name keeps it: what
// you can buy is a Product first, but a screen-only title is somewhere
// you play, so its shared page shows as the Arcade.
const DOORS = ['product', 'arcade', 'demo'];
const DOOR_LABEL = { product: 'Product', arcade: 'Arcade', demo: 'Demo' };

function doorsFor(g) {
    const priority = inPrint(g)
        ? ['product', 'arcade', 'demo']
        : ['arcade', 'demo', 'product'];

    const owner = new Map();   // href -> the kind that gets to name it
    priority.forEach(kind => {
        const href = linkFor(g, kind);
        if (!owner.has(href)) owner.set(href, kind);
    });

    return DOORS
        .filter(kind => owner.get(linkFor(g, kind)) === kind)
        .map(kind => extLink(DOOR_LABEL[kind], linkFor(g, kind)))
        .join('');
}

function inPrint(g) {
    return g.physical.length > 0;
}

// Digitally you can just turn on computers: any number of people from
// one up to the largest table the game was designed for.
function countsFor(g, mode) {
    return mode === 'digital' ? range(1, Math.max(...g.counts)) : g.physical;
}

function gamesFor(n, mode) {
    return GAMES.filter(g => countsFor(g, mode).includes(n));
}

// Only offer a number the catalog can actually answer. Every solo title
// is digital-only, so 1 simply doesn't appear on the physical floor.
function playerCounts(mode) {
    return range(1, MAX_PLAYERS).filter(n => gamesFor(n, mode).length > 0);
}

// ============================================================
//  The Journals — the catalog's J-numbers, in their own order.
//  topic = the shelf it stands on. scope narrows a crowded shelf
//  (two Chronicles, one of the world and one of America), so the
//  Oracle can always come down to a single volume.
// ============================================================
const JOURNALS = [
    journal('Simon Allmer World', 'world', 'Simon Allmer', 'Photography', 2020),
    journal('Society Review', 'societyreview', 'Society Review', 'Current Affairs', 2021),
    journal('Chronicle: Years of Change', 'chronicle', 'Chronicle', 'History', 2023, 'World'),
    // ACRONYM (Conspiracy, 2025) is held back until it is polished.
    // Restore this line and the topic returns on its own.
    // journal('ACRONYM', 'acronym', 'Detective Noname', 'Conspiracy', 2025),
    journal('Cosmographia', 'cosmographia', 'Cosmographia', 'Lexicon', 2026),
    journal('American Chronicle', 'americanchronicle', 'Chronicle', 'History', 2026, 'American'),
];

function journal(name, slug, brand, topic, year, scope = '') {
    return { name, slug, brand, topic, year, scope };
}

function journalsMatching(q) {
    return JOURNALS.filter(j =>
        (!q.topic || j.topic === q.topic) &&
        (!q.scope || j.scope === q.scope)
    );
}

// In publication order, so the shelf reads as a history.
function distinct(values) {
    const out = [];
    values.forEach(v => { if (v && !out.includes(v)) out.push(v); });
    return out;
}

// The same rule the games branch follows: ask only while the volumes
// still standing disagree, and stop the moment one is left.
function nextJournalQuestion(q) {
    const rest = journalsMatching(q);
    if (rest.length <= 1) return null;

    if (!q.topic) {
        return {
            key: 'topic',
            eyebrow: 'By Interest',
            prompt: 'What draws your <em>interest</em>?',
            sub: 'Choose the subject and the Oracle will hand you the volume.',
            options: distinct(rest.map(j => j.topic)).map(t => option(t, journalsMatching({ topic: t }))),
        };
    }

    const scopes = distinct(rest.map(j => j.scope));
    if (!q.scope && scopes.length > 1) {
        return {
            key: 'scope',
            eyebrow: 'By Scope',
            prompt: `Which <em>${q.topic.toLowerCase()}</em> do you seek?`,
            sub: 'The shelf holds more than one. Narrow it.',
            options: scopes.map(sc => option(sc, rest.filter(j => j.scope === sc))),
        };
    }
    return null;
}

// A valve names what stands behind it: the volume itself when one
// does, the count when several do.
function option(value, held) {
    return {
        value,
        label: value,
        hint: held.length === 1 ? held[0].name : `${held.length} volumes`,
    };
}

// ============================================================
//  The questions of appetite — asked after the table is set.
//
//  Order matters: the most telling question comes first, so a lone
//  survivor is named at once instead of surviving three more floors.
//  Bartle's four players discriminate hardest, then fate, then the hour.
// ============================================================
// What resists you names you: a person (Achiever, Killer), a world
// (Explorer), or a problem (Solver).
const ARCHETYPES = [
    { value: 'achiever', label: 'Achiever', hint: 'Points, status, the win recorded' },
    { value: 'explorer', label: 'Explorer', hint: 'A world to enter, and its deep lore' },
    { value: 'solver', label: 'Solver', hint: 'Riddles, deduction, the answer earned' },
    { value: 'socializer', label: 'Socializer', hint: 'Talk, alliance, the table itself' },
    { value: 'killer', label: 'Killer', hint: 'Competition, dominance, the other beaten' },
];

// `said` is how an answer is echoed back on the result floor, where the
// bare label ("None") would read wrong.
const FATES = [
    { value: 'none', label: 'None', hint: 'Every outcome earned', said: 'No fate' },
    { value: 'some', label: 'Some', hint: 'Chance deals, skill decides', said: 'Some fate' },
    { value: 'much', label: 'Much', hint: 'Surrender to the draw', said: 'Much fate' },
];

const SPANS = [
    { value: 5, label: '0–5 min', hint: 'A round between two things' },
    { value: 15, label: '5–15 min', hint: 'A sitting' },
    { value: 30, label: '15–30 min', hint: 'A chapter, a full game' },
];

const QUESTIONS = [
    {
        key: 'type',
        options: ARCHETYPES,
        color: GAMES_COLOR,
        eyebrow: 'By Nature',
        prompt: 'Which <em>player</em> are you?',
        sub: 'Choose the nature that is yours — the Oracle offers only those a game here can answer.',
        test: (g, v) => g.types.includes(v),
    },
    {
        key: 'fate',
        options: FATES,
        color: GAMES_COLOR,
        eyebrow: 'By Fate',
        prompt: 'How much <em>fate</em> shall you encounter?',
        sub: 'The Oracle asks how much it may decide on your behalf.',
        test: (g, v) => g.fate.includes(v),
    },
    {
        key: 'span',
        options: SPANS,
        color: GAMES_COLOR,
        eyebrow: 'By The Hour',
        prompt: 'How long shall it <em>last</em>?',
        sub: 'Nothing here runs past thirty minutes — switch it up, or play again.',
        test: (g, v) => g.minutes === v,
    },
];

// Everything still standing under the answers given so far.
function matching(q) {
    return gamesFor(q.players, q.mode).filter(g =>
        QUESTIONS.every(x => q[x.key] === undefined || x.test(g, q[x.key]))
    );
}

// A question earns its floor only when the survivors disagree about it.
// One game left, one live answer, or an answer that changes nothing —
// and the Oracle skips straight ahead rather than asking for form's sake.
function nextQuestion(q) {
    const rest = matching(q);
    if (rest.length <= 1) return null;

    for (const x of QUESTIONS) {
        if (q[x.key] !== undefined) continue;
        const live = x.options.filter(o => rest.some(g => x.test(g, o.value)));
        const splits = live.some(o => rest.filter(g => x.test(g, o.value)).length < rest.length);
        if (live.length > 1 && splits) return { ...x, options: live };
    }
    return null;
}

// The answers given, in the Oracle's own words.
function saidSoFar(q) {
    return QUESTIONS
        .filter(x => q[x.key] !== undefined)
        .map(x => {
            const option = x.options.find(o => o.value === q[x.key]);
            return option.said || option.label;
        });
}

// ============================================================
//  Engine — the elevator
// ============================================================
class Oracle {
    constructor() {
        this.column = document.getElementById('column');
        this.elUp = document.getElementById('elUp');
        this.elDown = document.getElementById('elDown');
        this.elevFloors = document.getElementById('elevFloors');

        this.floors = [];   // [{ el, node, kind, chosenIndex, accent }]
        this.current = 0;   // active floor
        this.focusIndex = 0;
        this.keyboardMode = false; // highlight a choice only once keys are used
        this.locked = false;

        this.elUp.addEventListener('click', () => this.up());
        this.elDown.addEventListener('click', () => this.down());
        window.addEventListener('keydown', e => this.onKey(e));

        this.reset();
    }

    reset() {
        this.column.innerHTML = '';
        this.floors = [];
        this.current = 0;
        this.locked = false;
        this.appendFloor(this.makeNodeFloor(ORACLE.nodes[ORACLE.start]));

        const entrance = deepLink();
        if (entrance) this.openAt(entrance);
        else { this.setActive(0); this.armFloor(0); }
        this.updateChrome();
    }

    // Show the medium floor as already answered and ride straight in.
    // The floor above stays real, so ↑ still reaches the other studios.
    openAt({ id, index }) {
        const child = ORACLE.nodes[id];
        const floor = this.floors[0];
        const valve = floor.el.querySelectorAll('.valve')[index];

        floor.chosenIndex = index;
        floor.accent = child.color;
        floor.el.querySelector('.valves').classList.add('choosing');
        valve.classList.add('chosen', 'filled');
        floor.el.querySelector('.level-orb').style.opacity = '0';

        this.appendFloor(this.makeNodeFloor(child));
        this.current = 1;
        this.setActive(1);
        this.armFloor(1);
    }

    setActive(index) {
        this.column.style.setProperty('--active', index);
    }

    // ---- Floor construction ----
    makeNodeFloor(node) {
        const idx = this.floors.length; // the index this floor will occupy
        let el, kind;
        if (node.choices) { el = this.buildChoiceLevel(node, idx); kind = 'choice'; }
        else if (node.verdict) { el = this.buildVerdictLevel(node.verdict, node.color); kind = 'leaf'; }
        else if (node.options) {
            el = this.buildQuestionLevel(node, idx, option =>
                this.makeVerdictFloor(option.verdict, node.color));
            kind = 'choice';
        }
        else if (node.question === 'players') { el = this.buildPlayersLevel(node, idx); kind = 'players'; }
        else if (node.question === 'topic') {
            const question = nextJournalQuestion({});
            el = this.buildQuestionLevel({ ...question, color: node.color }, idx, option =>
                this.makeJournalsFloor({ [question.key]: option.value }));
            kind = 'choice';
        }
        else { el = this.buildLeafLevel(node); kind = 'leaf'; }
        return { el, node, kind, chosenIndex: null, accent: node.color };
    }

    // The games branch below the player count: ask the next question
    // that still separates them, or — when one stands alone — speak.
    makeGamesFloor(query) {
        const question = nextQuestion(query);
        return question
            ? this.makeQuestionFloor(question, option =>
                this.makeGamesFloor({ ...query, [question.key]: option.value }))
            : this.makeResultFloor(query);
    }

    makeQuestionFloor(question, next) {
        return {
            el: this.buildQuestionLevel(question, this.floors.length, next),
            node: { color: question.color },
            kind: 'choice',
            chosenIndex: null,
            accent: question.color,
        };
    }

    // Journals descend by the same rule as games: ask what still
    // separates the volumes, and speak the moment one stands alone.
    makeVerdictFloor(verdict, color) {
        return { el: this.buildVerdictLevel(verdict, color), node: { color }, kind: 'leaf', chosenIndex: null, accent: color };
    }

    makeJournalsFloor(query) {
        const question = nextJournalQuestion(query);
        if (!question) {
            return {
                el: this.buildJournalsLevel(query),
                node: null,
                kind: 'leaf',
                chosenIndex: null,
                accent: JOURNALS_COLOR,
            };
        }
        return this.makeQuestionFloor({ ...question, color: JOURNALS_COLOR }, option =>
            this.makeJournalsFloor({ ...query, [question.key]: option.value }));
    }

    makeResultFloor(query) {
        return { el: this.buildResultLevel(query), node: null, kind: 'leaf', chosenIndex: null, accent: GAMES_COLOR };
    }

    appendFloor(floor) {
        this.column.appendChild(floor.el);
        this.floors.push(floor);
        floor.el.style.setProperty('--depth', Math.min(this.floors.length - 1, 4));
    }

    truncateForward(index) {
        for (let k = this.floors.length - 1; k > index; k--) {
            this.floors[k].el.remove();
            this.floors.pop();
        }
    }

    buildChoiceLevel(node, floorIndex) {
        const level = document.createElement('section');
        level.className = 'level';
        level.innerHTML = `
            <div class="level-voice">
                ${node.eyebrow ? `<div class="level-eyebrow">${node.eyebrow}</div>` : ''}
                <div class="level-prompt">${node.prompt}</div>
                ${node.sub ? `<div class="level-sub">${node.sub}</div>` : ''}
            </div>
            <div class="valves"></div>
            <div class="level-orb floating"></div>
        `;
        this.tintOrb(level.querySelector('.level-orb'), node.color);

        const valves = level.querySelector('.valves');
        node.choices.forEach((childId, i) => {
            const child = ORACLE.nodes[childId];
            const valve = document.createElement('button');
            valve.className = 'valve';
            if (child.dev) valve.classList.add('is-dev');
            valve.style.setProperty('--vc', child.color || 'var(--champagne)');
            valve.style.animationDelay = `${0.35 + i * 0.08}s`;
            valve.innerHTML = `
                <div class="socket"></div>
                <div class="valve-label">${child.label}</div>
                ${child.hint ? `<div class="valve-hint">${child.hint}</div>` : ''}
            `;
            valve.addEventListener('click', () =>
                this.commit(floorIndex, valve, i, child.color, () => this.makeNodeFloor(child))
            );
            valves.appendChild(valve);
        });
        return level;
    }

    buildPlayersLevel(node, floorIndex) {
        const level = document.createElement('section');
        level.className = 'level';
        level.innerHTML = `
            <div class="level-voice">
                <div class="level-eyebrow">${node.eyebrow}</div>
                <div class="level-prompt">${node.prompt}</div>
                <div class="level-sub">${node.sub}</div>
            </div>
            <div class="valves players"></div>
            <div class="level-orb floating"></div>
        `;
        this.tintOrb(level.querySelector('.level-orb'), node.color);

        const valves = level.querySelector('.valves');
        playerCounts(node.mode).forEach((n, i) => {
            const valve = document.createElement('button');
            valve.className = 'valve valve-num';
            valve.style.setProperty('--vc', node.color);
            valve.style.animationDelay = `${0.35 + i * 0.06}s`;
            valve.innerHTML = `<div class="socket"><span class="numeral">${n}</span></div>`;
            valve.addEventListener('click', () =>
                this.commit(floorIndex, valve, i, node.color, () =>
                    this.makeGamesFloor({ mode: node.mode, players: n }))
            );
            valves.appendChild(valve);
        });
        return level;
    }

    // `next(option)` builds whatever floor the answer leads to, so the
    // same level serves the games branch and the journals branch alike.
    buildQuestionLevel(question, floorIndex, next) {
        const level = document.createElement('section');
        level.className = 'level';
        level.innerHTML = `
            <div class="level-voice">
                <div class="level-eyebrow">${question.eyebrow}</div>
                <div class="level-prompt">${question.prompt}</div>
                <div class="level-sub">${question.sub}</div>
            </div>
            <div class="valves"></div>
            <div class="level-orb floating"></div>
        `;
        this.tintOrb(level.querySelector('.level-orb'), question.color);

        const valves = level.querySelector('.valves');
        question.options.forEach((option, i) => {
            const valve = document.createElement('button');
            valve.className = 'valve';
            valve.style.setProperty('--vc', question.color);
            valve.style.animationDelay = `${0.35 + i * 0.08}s`;
            valve.innerHTML = `
                <div class="socket"></div>
                <div class="valve-label">${option.label}</div>
                <div class="valve-hint">${option.hint}</div>
            `;
            valve.addEventListener('click', () =>
                this.commit(floorIndex, valve, i, question.color, () => next(option))
            );
            valves.appendChild(valve);
        });
        return level;
    }

    // A leaf that actually answers: a name, a word on it, and the door.
    buildVerdictLevel(verdict, color) {
        const level = document.createElement('section');
        level.className = 'level';
        level.style.setProperty('--vc', color || 'var(--champagne)');
        level.innerHTML = `
            <div class="leaf">
                <div class="leaf-medallion" style="--vc:${color}"><span class="dot"></span></div>
                <div class="level-eyebrow">The Oracle Speaks</div>
                <div class="leaf-title">${verdict.title}</div>
                <div class="leaf-body">${verdict.body}</div>
                ${verdict.note ? `<div class="leaf-note">${verdict.note}</div>` : ''}
                <div class="leaf-links">
                    ${verdict.links.map(([label, href]) => extLink(label, href)).join('')}
                </div>
            </div>
        `;
        return level;
    }

    buildLeafLevel(node) {
        const level = document.createElement('section');
        level.className = 'level';
        const color = node.color || 'var(--champagne)';
        level.innerHTML = `
            <div class="leaf ${node.dev ? 'is-dev' : ''}">
                <div class="leaf-medallion" style="--vc:${color}"><span class="dot"></span></div>
                <div class="leaf-title">${node.leafTitle || node.label}</div>
                <div class="leaf-body">${node.leafBody || 'The Oracle has not yet formed this vision.'}</div>
                <div class="leaf-tag">Coming Soon</div>
            </div>
        `;
        return level;
    }

    buildResultLevel(query) {
        const level = document.createElement('section');
        level.className = 'level level-result';
        level.style.setProperty('--vc', GAMES_COLOR);

        const games = matching(query);
        const label = query.players === 1 ? 'Solo' : `${query.players} Players`;
        const count = games.length;
        const where = query.mode === 'digital' ? 'on screen' : 'for your table';
        const said = saidSoFar(query).join(' · ');

        const rows = games.map(g => `
            <div class="game">
                <div class="game-info">
                    <span class="game-name">${g.name}</span>
                    ${g.brand ? `<span class="game-brand">${g.brand}</span>` : ''}
                </div>
                <div class="game-actions">${doorsFor(g)}</div>
            </div>
        `).join('');

        level.innerHTML = `
            <div class="suggest">
                <div class="level-eyebrow">The Oracle Speaks</div>
                <h2 class="suggest-title">${label}</h2>
                <p class="suggest-sub">${count} ${count === 1 ? 'game' : 'games'} ${where}.</p>
                ${said ? `<p class="suggest-said">${said}</p>` : ''}
                <div class="game-list">${rows}</div>
            </div>
        `;
        return level;
    }

    buildJournalsLevel(query) {
        const level = document.createElement('section');
        level.className = 'level level-result';
        level.style.setProperty('--vc', JOURNALS_COLOR);

        const held = journalsMatching(query);
        const title = query.scope ? `${query.scope} ${query.topic}` : query.topic;
        const rows = held.map(j => `
            <div class="game">
                <div class="game-info">
                    <span class="game-name">${j.name}</span>
                    <span class="game-brand">${j.brand} · ${j.year}</span>
                </div>
                <div class="game-actions">
                    ${extLink('Read', `https://simonallmer.com/${j.slug}`)}
                </div>
            </div>
        `).join('');

        level.innerHTML = `
            <div class="suggest">
                <div class="level-eyebrow">The Oracle Speaks</div>
                <h2 class="suggest-title">${title}</h2>
                <p class="suggest-sub">${held.length} ${held.length === 1 ? 'volume' : 'volumes'} on the shelf.</p>
                <div class="game-list">${rows}</div>
            </div>
        `;
        return level;
    }

    tintOrb(orb, color) {
        if (!orb || !color) return;
        orb.style.setProperty('--vc', color);
        orb.classList.add('tinted');
    }

    // ---- Choosing (commit an answer on a floor) ----
    commit(floorIndex, valve, valveIndex, accent, nextFactory) {
        if (this.locked || floorIndex !== this.current) return;
        this.locked = true;

        this.truncateForward(floorIndex);
        const floor = this.floors[floorIndex];
        floor.chosenIndex = valveIndex;
        floor.accent = accent;

        this.dropOrb(floor.el, valve, accent, () => {
            this.appendFloor(nextFactory());
            this.current = floorIndex + 1;
            this.setActive(this.current);
            this.armFloor(this.current);
            this.updateChrome();
            this.locked = false;
        });
    }

    // Roll the crystal ball down into a valve, then run `done`.
    dropOrb(levelEl, valve, accent, done) {
        const orb = levelEl.querySelector('.level-orb');
        const socket = valve.querySelector('.socket');

        levelEl.querySelector('.valves').classList.add('choosing');
        valve.classList.add('chosen');

        const oR = orb.getBoundingClientRect();
        const sR = socket.getBoundingClientRect();
        const dx = (sR.left + sR.width / 2) - (oR.left + oR.width / 2);
        const dy = (sR.top + sR.height / 2) - (oR.top + oR.height / 2);

        orb.classList.remove('floating');
        orb.classList.add('dropping');
        if (accent) {
            orb.style.setProperty('--vc', accent);
            orb.classList.add('tinted');
        }
        orb.style.transform = `translate(${dx}px, ${dy}px) scale(0.62)`;

        setTimeout(() => {
            valve.classList.add('filled');
            orb.style.opacity = '0';
        }, 620);
        setTimeout(done, 900);
    }

    // ---- Elevator movement ----
    armFloor(index) {
        this.floors.forEach((f, k) => f.el.classList.toggle('past', k !== index));

        const floor = this.floors[index];
        const wrap = floor.el.querySelector('.valves');
        if (wrap) wrap.classList.remove('choosing');
        floor.el.querySelectorAll('.valve').forEach(v =>
            v.classList.remove('chosen', 'filled', 'focused')
        );

        const orb = floor.el.querySelector('.level-orb');
        if (orb) {
            orb.classList.remove('dropping', 'tinted');
            orb.style.transform = '';
            orb.style.opacity = '';
            orb.style.removeProperty('--vc');
            this.tintOrb(orb, floor.node && floor.node.color); // restore this floor's own hue
            orb.classList.add('floating');
        }

        const valves = floor.el.querySelectorAll('.valve');
        this.focusIndex = valves.length ? Math.min(floor.chosenIndex ?? 0, valves.length - 1) : 0;
        this.applyFocus();
    }

    applyFocus() {
        const valves = this.floors[this.current].el.querySelectorAll('.valve');
        valves.forEach((v, i) =>
            v.classList.toggle('focused', this.keyboardMode && i === this.focusIndex)
        );
    }

    moveFocus(dir) {
        const valves = this.floors[this.current].el.querySelectorAll('.valve');
        if (!valves.length) return;
        this.focusIndex = (this.focusIndex + dir + valves.length) % valves.length;
        this.applyFocus();
    }

    activateFocused() {
        const valves = this.floors[this.current].el.querySelectorAll('.valve');
        if (!valves.length) return;
        valves[this.focusIndex].click();
    }

    up() {
        if (this.locked || this.current <= 0) return;
        this.locked = true;
        this.current--;
        this.setActive(this.current);
        this.armFloor(this.current);
        this.updateChrome();
        setTimeout(() => { this.locked = false; }, 450);
    }

    down() {
        if (this.locked || this.current >= this.floors.length - 1) return;
        const floor = this.floors[this.current];
        const valve = floor.el.querySelectorAll('.valve')[floor.chosenIndex];
        if (!valve) return;
        this.locked = true;
        this.dropOrb(floor.el, valve, floor.accent, () => {
            this.current++;
            this.setActive(this.current);
            this.armFloor(this.current);
            this.updateChrome();
            this.locked = false;
        });
    }

    esc() {
        if (this.locked || this.current === 0) return;
        this.locked = true;
        this.current = 0;
        this.setActive(0);
        this.armFloor(0);
        this.updateChrome();
        setTimeout(() => { this.locked = false; }, 450);
    }

    updateChrome() {
        const atTop = this.current <= 0;
        const atBottom = this.current >= this.floors.length - 1;
        this.elUp.classList.toggle('disabled', atTop);
        this.elDown.classList.toggle('disabled', atBottom);
        this.elUp.disabled = atTop;
        this.elDown.disabled = atBottom;

        // Floor indicator pips
        this.elevFloors.innerHTML = '';
        this.floors.forEach((f, k) => {
            const pip = document.createElement('span');
            pip.className = 'elev-pip' + (k === this.current ? ' active' : '');
            this.elevFloors.appendChild(pip);
        });
    }

    onKey(e) {
        if (['ArrowLeft', 'ArrowRight', 'Enter', ' ', 'Spacebar'].includes(e.key)) {
            this.keyboardMode = true;
        }
        switch (e.key) {
            case 'ArrowLeft': e.preventDefault(); this.moveFocus(-1); break;
            case 'ArrowRight': e.preventDefault(); this.moveFocus(1); break;
            case 'ArrowUp': e.preventDefault(); this.up(); break;
            case 'ArrowDown': e.preventDefault(); this.down(); break;
            case 'Enter': e.preventDefault(); this.activateFocused(); break;
            case ' ': case 'Spacebar': e.preventDefault(); this.activateFocused(); break;
            case 'Escape': this.esc(); break;
        }
    }
}

// A deep link opens the Oracle inside one studio — /#games, or
// /?start=games. Anything else is ignored and the descent starts
// at the medium, as always.
function deepLink() {
    const asked = (new URLSearchParams(location.search).get('start')
        || location.hash.replace('#', '')).trim().toLowerCase();
    const index = ORACLE.nodes[ORACLE.start].choices.indexOf(asked);
    return index === -1 ? null : { id: asked, index };
}

function extLink(label, href) {
    return `<a class="ext" href="${href}" target="_blank" rel="noopener">${label}<span class="ext-i" aria-hidden="true">↗</span></a>`;
}

document.addEventListener('DOMContentLoaded', () => new Oracle());
