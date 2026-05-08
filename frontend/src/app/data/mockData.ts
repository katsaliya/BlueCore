// ─────────────────────────────────────────────────────────────────────────────
// mockData.ts
//
// STATUS: In Use
//
// WHAT THIS IS:
// Central data store for all mock/demo data used across the BlueCore app.
// Contains the current user profile, crew members, schedule, news feed,
// wellbeing data, and the hard-coded demo scripts for the pitch video demo.
//
// DEMO PROFILE:
// Rewritten for the pitch demo — current user is now Daniel Reyes,
// Second Engineer aboard MV Nordic Star. He fills the Engine Room Log
// and the USCG Oil Record Book Part I (Machinery Space Operations).
//
// CONNECTS TO:
// VoiceHome.tsx (demo scripts, greeting context, avatar)
// Profile/You screen (user details, voyage info)
// Connect/News screen (interests → news feed)
// Schedule screen (shift schedule)
// ─────────────────────────────────────────────────────────────────────────────

// ─── Current User ────────────────────────────────────────────────────────────
// Daniel Reyes — Second Engineer, MV Nordic Star
// Watch: 00:00–04:00 and 12:00–16:00 (standard engineer 4-on/8-off rotation)
// Responsible for: main engine monitoring, auxiliary machinery, bilge operations,
// oil record keeping, fuel management.
// Documents he files: Engine Room Log (every watch), Oil Record Book Part I
// (daily sludge entry, bunkering entries as required by MARPOL/USCG).

export const currentUser = {
  id: "u1",
  name: "Daniel Reyes",
  nickname: "Danny",
  role: "Second Engineer",
  rank: "2/E",
  vessel: "MV Nordic Star",
  vesselOfficialNumber: "703841",
  imoNumber: "9387621",
  grossTonnage: "28,400",
  flag: "United States",
  owner: "Nordic Shipping LLC",
  avatar:
    "https://images.unsplash.com/photo-1690399343439-7e5dc7a926cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWlsb3IlMjBjcmV3JTIwc2hpcCUyMHRlYW18ZW58MXx8fHwxNzcyODI0NDg5fDA&ixlib=rb-4.1.0&q=80&w=400",
  joinedDays: 52,
  homePort: "Houston, Texas",
  nextPortCall: "Hamburg, Germany",
  daysAtSea: 21,
  contractDays: 90, // standard US contract length for merchant marine engineers
  interests: [
    "Basketball",
    "Hip-hop",
    "Cooking",
    "Gaming",
    "MMA",
  ],
  // Engine watch: 12:00–16:00 (afternoon watch)
  // Second watch: 00:00–04:00 (midnight watch)
  // Standard 4-on/8-off rotation for engineers
  currentShift: {
    start: "12:00",
    end: "16:00",
    label: "Afternoon Watch",
    breakStart: "16:00",
    breakEnd: "20:00",
    secondWatchStart: "00:00",
    secondWatchEnd: "04:00",
  },
  // Pre-fill data for Engine Room Log
  // These fields are known and populated automatically by BlueCore
  engineRoomPrefill: {
    shipName: "MV Nordic Star",
    officialNumber: "703841",
    imoNumber: "9387621",
    grossTonnage: "28,400 GT",
    flag: "United States",
    date: "23 April 2025",
    watchPeriod: "12:00–16:00",
    engineerName: "Daniel Reyes",
    engineerRank: "Second Engineer (2/E)",
    mainEngineType: "MAN B&W 6S60ME-C10.5",
    mainEnginePower: "13,560 kW",
    propellerPitch: "Fixed pitch, 6.8m diameter",
    normalOperatingRPM: "105",
    normalFuelConsumption: "1.1 MT/hour (HFO)",
    fuelType: "Heavy Fuel Oil (HFO 380cSt)",
  },
  // Pre-fill data for Oil Record Book Part I (USCG CG-4602A)
  oilRecordPrefill: {
    shipName: "MV Nordic Star",
    officialNumber: "703841",
    imoNumber: "9387621",
    grossTonnage: "28,400 GT",
    owner: "Nordic Shipping LLC",
    periodFrom: "01 April 2025",
    operationType: "Machinery Space Operations (Part I)",
    date: "23 April 2025",
    engineerName: "Daniel Reyes",
    engineerRank: "Second Engineer (2/E)",
    sludgeTank: "Engine Room Sludge Tank No. 1",
    sludgeTankCapacity: "15.0 m³",
    bilgeTankCapacity: "8.5 m³",
  },
};

// ─── Demo Scripts ─────────────────────────────────────────────────────────────
// These drive the hard-coded demo in VoiceHome.tsx.
// When a document is selected from the dropdown, demoMode activates and
// BlueCore plays through these exchanges in sequence instead of random replies.
// user: null on the final entry = conversation ends, document complete.

// DOCUMENT 1: Engine Room Log — Afternoon Watch (12:00–16:00)
// Pre-filled by BlueCore (from currentUser.engineRoomPrefill):
//   Ship name, official number, IMO number, gross tonnage, date,
//   watch period, engineer name and rank, main engine type, fuel type.
// BlueCore asks for: RPM, engine load, fuel consumption, pressure readings,
//   exhaust temperatures, tank levels, incidents, handoff.

export const DEMO_SCRIPT_ENGINE_ROOM = [
  {
    ai:
      "Hey Danny — starting your Engine Room Log for the 12:00 to 16:00 watch. " +
      "I've pre-filled the vessel particulars, your name, rank, watch period, and today's date. " +
      "Let's get the main engine readings. What was your average RPM " +
      "and engine load across the watch?",
    user: "Average RPM was 104, engine load about 76 percent.",
    fieldsUpdated: ["Avg RPM → 104", "Engine Load → 76%"],
  },
  {
    ai:
      "Got it — 104 RPM, 76 percent load. " +
      "What was fuel consumption for the four-hour period, " +
      "and what's your heavy fuel oil remaining on board?",
    user:
      "Fuel consumption was 4.4 metric tons for the watch. " +
      "HFO remaining on board is 284 metric tons.",
    fieldsUpdated: [
      "Fuel Consumption (4hr) → 4.4 MT",
      "HFO ROB → 284 MT",
    ],
  },
  {
    ai:
      "Noted. Any pressure or temperature readings outside normal range — " +
      "jacket cooling water, lube oil pressure, or exhaust temperatures?",
    user:
      "All within normal range. JCW pressure steady at 3.1 bar, " +
      "lube oil bearing pressure 4.0 bar. Exhaust temperatures " +
      "across all six units between 345 and 365 Celsius.",
    fieldsUpdated: [
      "JCW Pressure → 3.1 bar",
      "Lube Oil Bearing Pressure → 4.0 bar",
      "Exhaust Temps → 345–365°C (all 6 units, normal range)",
    ],
  },
  {
    ai:
      "All normal — logged. Any incidents, alarms, or machinery observations " +
      "from the watch worth recording?",
    user:
      "No incidents. Auxiliary generator three ran a high temperature alarm " +
      "at 14:20 — cleared itself within two minutes, no action required. " +
      "Watch handed off to Chief Engineer at 16:00.",
    fieldsUpdated: [
      "Incidents → Aux Gen 3: high temp alarm 14:20, self-cleared, no action",
      "Handoff → Chief Engineer, 16:00",
    ],
  },
  {
    ai:
      "Engine Room Log complete — all fields filled. " +
      "I'm preparing the filled PDF for review and export.",
    user: null,
    fieldsUpdated: [],
  },
];

// DOCUMENT 2: Oil Record Book Part I — Section C: Sludge Collection
// USCG CG-4602A, required under MARPOL 73/78 Annex I and 33 CFR 151.25.
// This is a daily required entry for machinery space operations.
//
// Pre-filled by BlueCore (from currentUser.oilRecordPrefill):
//   Ship name, official number, IMO number, gross tonnage, owner,
//   operation period, date, engineer name and rank, operation type (Section C),
//   sludge tank identity and capacity (from vessel engineering record).
// BlueCore asks for: current retention quantity, manual collection amount,
//   any transfer or disposal operations.

export const DEMO_SCRIPT_OIL_RECORD = [
  {
    ai:
      "Hey Danny — opening an Oil Record Book entry for today, " +
      "Section C: collection of oil residues. " +
      "I've pre-filled the vessel particulars, your name, today's date, " +
      "and the sludge tank identity and capacity from the vessel record. " +
      "What's the total quantity of sludge currently retained on board?",
    user: "Total retention is 4.2 cubic meters.",
    fieldsUpdated: ["Item 11.3 → Total retention: 4.2 m³"],
  },
  {
    ai:
      "4.2 cubic meters retained — logged. " +
      "Was any sludge collected by manual operation during your watch today, " +
      "and if so, how much?",
    user: "Yes, 0.6 cubic meters collected manually from the bilge separator.",
    fieldsUpdated: [
      "Item 11.4 → Manual collection: 0.6 m³ (bilge separator)",
    ],
  },
  {
    ai:
      "0.6 cubic meters manually collected — noted. " +
      "Any transfer or disposal of sludge to record today, " +
      "or is this a collection-only entry?",
    user: "Collection only. No transfer or disposal today.",
    fieldsUpdated: ["Item 12 → No transfer or disposal this entry"],
  },
  {
    ai:
      "Oil Record Book entry complete — Section C logged. " +
      "This entry is compliant with MARPOL 73/78 Annex I " +
      "and 33 CFR 151.25. I'm preparing the filled PDF for review and export.",
    user: null,
    fieldsUpdated: [],
  },
];

// ─── Crew Members ─────────────────────────────────────────────────────────────
export const crewMembers = [
  {
    id: "u2",
    name: "Elena Petrov",
    role: "Navigation Officer",
    avatar:
      "https://images.unsplash.com/photo-1741762700232-2b7a6aac4557?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJpdGltZSUyMHdvcmtlciUyMHNoaXAlMjBkZWNrJTIwb2NlYW58ZW58MXx8fHwxNzcyODI0NDg4fDA&ixlib=rb-4.1.0&q=80&w=200",
    breakTime: "16:00–20:00",
    compatibility: 88,
    sharedInterests: ["Cooking", "Gaming"],
    lastSpoke: "Yesterday",
    mood: "good",
    status: "On Watch",
  },
  {
    id: "u3",
    name: "Marcus Osei",
    role: "Chief Engineer",
    avatar:
      "https://images.unsplash.com/flagged/photo-1578152887081-37132e7bf082?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaGlwJTIwZW5naW5lZXIlMjBiZWxvdyUyMGRlY2slMjBtYXJpdGltZXxlbnwxfHx8fDE3NzI4MjQ0ODl8MA&ixlib=rb-4.1.0&q=80&w=200",
    breakTime: "16:00–18:00",
    compatibility: 92,
    sharedInterests: ["Basketball", "MMA"],
    lastSpoke: "Today",
    mood: "good",
    status: "On Break",
  },
  {
    id: "u4",
    name: "James Calloway",
    role: "Chief Officer",
    avatar:
      "https://images.unsplash.com/photo-1760331840305-e5c81446c158?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaGlwJTIwY3JldyUyMGx1bmNoJTIwYnJlYWslMjBzb2NpYWx8ZW58MXx8fHwxNzcyODI0NDkzfDA&ixlib=rb-4.1.0&q=80&w=200",
    breakTime: "12:00–13:30",
    compatibility: 81,
    sharedInterests: ["Cooking", "MMA"],
    lastSpoke: "3 days ago",
    mood: "neutral",
    status: "On Watch",
  },
  {
    id: "u5",
    name: "Ravi Sharma",
    role: "Third Engineer",
    avatar:
      "https://images.unsplash.com/photo-1751563696363-abb675273f59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvY2VhbiUyMHN1bnNldCUyMGhvcml6b24lMjBwZWFjZWZ1bHxlbnwxfHx8fDE3NzI3NTQwNjZ8MA&ixlib=rb-4.1.0&q=80&w=200",
    breakTime: "16:00–20:00",
    compatibility: 85,
    sharedInterests: ["Gaming", "Hip-hop"],
    lastSpoke: "2 days ago",
    mood: "tired",
    status: "Off Watch",
  },
];

// ─── Schedule ─────────────────────────────────────────────────────────────────
// Engineer 4-on/8-off rotation. Afternoon watch: 12:00–16:00.
// Second watch: 00:00–04:00 (shown as next day).

export const schedule = [
  { time: "08:00", label: "Pre-Watch Inspection", type: "task", done: true },
  { time: "10:00", label: "Auxiliary Engine Service Check", type: "task", done: true },
  { time: "11:30", label: "Oil Record Book Entry Due", type: "task", done: false },
  { time: "12:00", label: "Afternoon Watch Begins", type: "duty", done: false, current: true },
  { time: "13:00", label: "Main Engine Parameter Readings", type: "task", done: false },
  { time: "14:00", label: "Bilge Separator Check", type: "task", done: false },
  { time: "15:00", label: "Fuel Oil ROB Calculation", type: "task", done: false },
  { time: "16:00", label: "Watch Handover to Chief Engineer", type: "duty", done: false },
  { time: "16:00", label: "Engine Room Log Submission", type: "task", done: false },
];

// ─── News Feed ────────────────────────────────────────────────────────────────
// Tailored to Daniel's interests: Basketball, Hip-hop, Cooking, Gaming, MMA

export const newsItems = [
  {
    id: "n1",
    category: "Basketball",
    headline: "NBA Playoffs: Thunder Eliminate Nuggets in Five — Shai Gilgeous-Alexander Drops 40",
    summary:
      "OKC advances to the Western Conference Finals for the first time since 2016. SGA was unstoppable in the deciding game.",
    source: "ESPN",
    time: "3h ago",
    readTime: "3 min",
    emoji: "🏀",
    image:
      "https://images.unsplash.com/photo-1546519638405-a4a2a2f6a0b4?w=400&q=80",
  },
  {
    id: "n2",
    category: "MMA",
    headline: "UFC 302: Main Event Set — Islam Makhachev Defends Title Against Poirier",
    summary:
      "The lightweight championship bout is confirmed. Poirier enters as underdog but analysts say his grappling has never looked sharper.",
    source: "MMA Fighting",
    time: "6h ago",
    readTime: "4 min",
    emoji: "🥊",
    image:
      "https://images.unsplash.com/photo-1517438476312-10d79c077509?w=400&q=80",
  },
  {
    id: "n3",
    category: "Cooking",
    headline: "Gordon Ramsay Opens New Waterfront Restaurant in Amsterdam Harbour District",
    summary:
      "The Michelin-starred chef's latest venture focuses on Nordic seafood. The tasting menu has already sold out for the next three months.",
    source: "Food & Wine",
    time: "1d ago",
    readTime: "3 min",
    emoji: "🍽️",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80",
  },
  {
    id: "n4",
    category: "Hip-hop",
    headline: "Kendrick Lamar Announces 'Grand National' Tour — European Dates Confirmed",
    summary:
      "Following his Super Bowl performance, Lamar has added Amsterdam and Hamburg to the European leg. Tickets on sale Friday.",
    source: "Rolling Stone",
    time: "1d ago",
    readTime: "4 min",
    emoji: "🎤",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80",
  },
  {
    id: "n5",
    category: "Gaming",
    headline: "GTA VI Releases New Gameplay Footage — PC Specs Revealed",
    summary:
      "Rockstar dropped 12 minutes of gameplay overnight. The PC requirements are steep but the visuals are unlike anything seen before.",
    source: "IGN",
    time: "2d ago",
    readTime: "5 min",
    emoji: "🎮",
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80",
  },
];

// ─── Wellbeing Data ───────────────────────────────────────────────────────────
// Passive data — not shown as a dashboard, only surfaced by BlueCore
// when fatigue is detected via voice analysis.

export const wellbeingData = {
  mood: [
    { day: "Mon", score: 71 },
    { day: "Tue", score: 66 },
    { day: "Wed", score: 74 },
    { day: "Thu", score: 60 },
    { day: "Fri", score: 68 },
    { day: "Sat", score: 75 },
    { day: "Sun", score: 70 },
  ],
  sleep: [
    { day: "Mon", hours: 7.0 },
    { day: "Tue", hours: 6.5 },
    { day: "Wed", hours: 7.5 },
    { day: "Thu", hours: 5.8 },
    { day: "Fri", hours: 7.2 },
    { day: "Sat", hours: 8.0 },
    { day: "Sun", hours: 6.9 },
  ],
  steps: [
    { day: "Mon", steps: 2800 },
    { day: "Tue", steps: 2200 },
    { day: "Wed", steps: 3400 },
    { day: "Thu", steps: 1900 },
    { day: "Fri", steps: 3100 },
    { day: "Sat", steps: 3700 },
    { day: "Sun", steps: 2600 },
  ],
  // Voice session fatigue readings — detected passively, not manually logged
  fatigueReadings: [
    { date: "Mon 21 Apr", level: "low", sessions: 2 },
    { date: "Tue 22 Apr", level: "moderate", sessions: 3 },
    { date: "Wed 23 Apr", level: "moderate", sessions: 2 },
  ],
};

// ─── AI Check-in Messages ─────────────────────────────────────────────────────
// Used in ConversationView — Danny's existing conversation history.

export const aiCheckInMessages = [
  {
    role: "assistant",
    text:
      "Hey Danny — afternoon watch starting at 12:00. You've got the Oil Record Book entry due before then. Want to knock that out now while it's quiet?",
    time: "11:32",
  },
  {
    role: "user",
    text: "Yeah let's do it. Generator three ran a high temp alarm earlier but it cleared itself.",
    time: "11:33",
  },
  {
    role: "assistant",
    text:
      "Got it — I'll log the auxiliary engine alarm under observations. No action required, self-cleared. That still needs to go in the Engine Room Log at end of watch, just so it's on record.",
    time: "11:33",
  },
  {
    role: "user",
    text: "Right, I'll make sure of it.",
    time: "11:34",
  },
  {
    role: "assistant",
    text:
      "Also picked up on some tension in your voice this morning — you're 21 days into a 90-day contract. That's a stretch. Marcus is off watch from 16:00 if you want someone to decompress with. Just something to consider.",
    time: "11:34",
  },
];

// ─── Completed Documents ─────────────────────────────────────────────────────
// Seeded with the filled CG-4602A PDF so Past Docs has a submitted record
// available immediately for the pitch demo. VoiceHomeV2 can append to this
// list when a scripted demo completes.
export type CompletedDoc = {
  docType: "engine-room" | "oil-record";
  title: string;
  timestamp: Date;
};

export const completedDocs: CompletedDoc[] = [
  {
    docType: "oil-record",
    title: "Oil Record Book Part I — 23 Apr 2025",
    timestamp: new Date("2025-04-23T16:00:00"),
  },
];
