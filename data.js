/* =========================================================
   Financial Survival Semester — DATA
   All game content (characters + event cards) lives here.
   Pure data, no logic. Edit this file to add/tune content.
   ========================================================= */

/**
 * CHARACTER_DATA
 * Each entry becomes a playable persona via the Character class.
 * Starting stats reflect real community-college student profiles.
 */
const CHARACTER_DATA = [
  {
    id: 'parent',
    emoji: '🧑‍🍼',
    name: 'The Young Parent',
    blurb: 'Raising a kid, lower income, but eligible for Pell + childcare grants.',
    start: {
      cash: 300, credit: 620, stress: 35, debt: 0,
      income: 950, rent: 700,
      aidEligible: ['Pell', 'Childcare Grant', 'TANF']
    },
    chips: [['Pell eligible','good'],['Kid expenses','warn'],['Lower income','bad']]
  },
  {
    id: 'daca',
    emoji: '🌎',
    name: 'The DACA Student',
    blurb: 'No federal aid. Must hustle private scholarships to survive.',
    start: {
      cash: 450, credit: 640, stress: 30, debt: 0,
      income: 1200, rent: 650,
      aidEligible: ['Private Scholarships', 'State Dream Act']
    },
    chips: [['No federal aid','bad'],['Work authorized','good'],['Private $ only','warn']]
  },
  {
    id: 'returning',
    emoji: '👴',
    name: 'The Returning Adult',
    blurb: 'Older, steady work history, but car payment and kid in college too.',
    start: {
      cash: 800, credit: 710, stress: 25, debt: 4500,
      income: 2200, rent: 1100,
      aidEligible: ['Pell', 'Workforce Grant']
    },
    chips: [['Good credit','good'],['Car loan','warn'],['Higher bills','bad']]
  },
  {
    id: 'foster',
    emoji: '🏠',
    name: 'The Foster Alumni',
    blurb: 'Aged out at 18. Zero safety net — but special grants exist for you.',
    start: {
      cash: 180, credit: 580, stress: 40, debt: 0,
      income: 900, rent: 500,
      aidEligible: ['Chafee Grant', 'ETV', 'State Tuition Waiver']
    },
    chips: [['No safety net','bad'],['Chafee eligible','good'],['Low starting $','warn']]
  },
  {
    id: 'hustler',
    emoji: '💼',
    name: 'The Hustler',
    blurb: 'Two jobs. Barely sleeping. High income but high stress tax.',
    start: {
      cash: 600, credit: 670, stress: 55, debt: 800,
      income: 2400, rent: 900,
      aidEligible: ['Pell (partial)', 'Work-Study']
    },
    chips: [['High income','good'],['Burnout risk','bad'],['Some aid','warn']]
  }
];

/**
 * EVENT_DATA
 * Each entry becomes an EventCard.
 * Choice `effect` keys: cash, credit, stress, debt, coins, scholar, income, rent, avoidedDebt
 */
const EVENT_DATA = [
  { icon: '🚗', title: 'Your car broke down', text: 'Transmission issues. Repair is $400 up front.', choices: [
      { label: 'Pay the $400 repair', sub: 'Safe, but drains your cash', effect: { cash: -400, stress: 5 } },
      { label: 'Put it on a credit card', sub: 'Preserves cash, adds debt', effect: { debt: +400, credit: -10, stress: 8 } },
      { label: 'Take the bus — risk late shifts', sub: 'Free, but you lose income next week', effect: { income: -200, stress: 15 } },
      { label: 'Use campus emergency fund (grant)', sub: 'Requires applying — builds Scholarship IQ', effect: { scholar: +1, coins: +20, cash: -100, avoidedDebt: +300 } }
  ]},
  { icon: '📱', title: 'Phone bill vs. rent — both due', text: 'You have enough for one, not both. Rent is $700, phone is $85.', choices: [
      { label: 'Pay rent fully, phone late', sub: 'Roof first. Small late fee on phone.', effect: { cash: -750, credit: -5, stress: 6 } },
      { label: 'Pay phone, partial rent', sub: 'Landlord warning, big credit hit', effect: { cash: -500, credit: -25, stress: 15 } },
      { label: 'Call landlord, set payment plan', sub: 'Talk first — keeps credit intact', effect: { cash: -450, stress: 2, coins: +10 } }
  ]},
  { icon: '🎯', title: 'Scholarship alert: $1,500 private award', text: 'Due in 48 hours. Requires a 500-word essay on community impact.', choices: [
      { label: 'Apply — write the essay tonight', sub: 'Skip a shift, but real shot at $1,500', effect: { income: -120, scholar: +1, coins: +30, stress: 8, cash: +600, avoidedDebt: +900 } },
      { label: 'Skip — too busy', sub: 'Easy choice. Zero upside.', effect: { stress: -2 } },
      { label: 'Apply half-hearted', sub: 'Low chance of winning', effect: { scholar: +1, coins: +5, cash: +50 } }
  ]},
  { icon: '🏥', title: 'You got sick', text: 'Fever, cough, can barely stand. Urgent care is $120 without insurance.', choices: [
      { label: 'Go to urgent care', sub: 'Cash hit, but back to work in 2 days', effect: { cash: -120, stress: -5 } },
      { label: 'Tough it out', sub: 'Saves cash, but you miss work', effect: { income: -300, stress: +20 } },
      { label: 'Ask about campus health clinic', sub: 'Free or sliding scale — smart move', effect: { cash: -20, scholar: +1, coins: +15, stress: -3 } }
  ]},
  { icon: '💸', title: 'Your financial aid check is delayed 2 weeks', text: 'Books, food, and gas money — all in that check. What now?', choices: [
      { label: 'Payday loan @ 400% APR', sub: 'Instant cash, predatory trap', effect: { cash: +300, debt: +400, credit: -15, stress: +10 } },
      { label: 'Ask financial aid office for emergency grant', sub: 'Paperwork, but real help exists', effect: { cash: +250, scholar: +1, coins: +20, avoidedDebt: +400 } },
      { label: 'Eat ramen, defer everything', sub: 'Hard on body, preserves credit', effect: { stress: +20 } }
  ]},
  { icon: '📚', title: 'Textbook shock: $680 total', text: 'The professor requires new editions. Bookstore list hurts.', choices: [
      { label: 'Buy new from bookstore', sub: 'Convenient. Expensive.', effect: { cash: -680, stress: +5 } },
      { label: 'Find PDFs + rent used online', sub: 'Takes an hour of hustle', effect: { cash: -140, coins: +15, avoidedDebt: +540 } },
      { label: 'Library reserve + group share', sub: 'Free but limited hours', effect: { cash: -20, stress: +8, avoidedDebt: +660 } }
  ]},
  { icon: '👪', title: 'Family member asks for $300', text: 'A real emergency on their end. You have $300 in savings.', choices: [
      { label: 'Send it', sub: 'Kindness costs', effect: { cash: -300, stress: -5 } },
      { label: "Say no — you can't afford it", sub: 'Preserves your budget', effect: { stress: +10 } },
      { label: 'Send $100 + help them find resources', sub: 'Middle path, keeps boundary', effect: { cash: -100, scholar: +1, stress: +3 } }
  ]},
  { icon: '🛒', title: 'Grocery week', text: 'You need to eat. Budget, tradeoffs.', choices: [
      { label: 'Meal prep $60 for the week', sub: 'Healthy, cheap', effect: { cash: -60, stress: -3 } },
      { label: 'DoorDash + fast food', sub: 'Easy, drains cash', effect: { cash: -180, stress: +4 } },
      { label: 'Campus food pantry + $30 groceries', sub: 'Free pantry exists — use it', effect: { cash: -30, coins: +10, scholar: +1 } }
  ]},
  { icon: '🎓', title: 'FAFSA verification flag', text: 'Your aid is on hold until you submit one form.', choices: [
      { label: 'Submit same day', sub: 'Protects your entire aid package', effect: { coins: +25, scholar: +1, cash: +400, avoidedDebt: +600 } },
      { label: 'Put it off', sub: 'Aid frozen, stress spikes', effect: { cash: -200, stress: +18, credit: -5 } },
      { label: 'Email adviser for help', sub: 'Smart, lower stress', effect: { coins: +15, scholar: +1, cash: +350, avoidedDebt: +500, stress: -2 } }
  ]},
  { icon: '💳', title: 'Credit card pre-approval in the mail', text: '$5,000 limit, 29.99% APR. Tempting.', choices: [
      { label: 'Open it — "just in case"', sub: 'Temptation trap', effect: { credit: +5, stress: +3 } },
      { label: 'Open + spend $500 on clothes', sub: 'Real debt builds', effect: { debt: +500, credit: -8, stress: +6 } },
      { label: 'Shred it', sub: 'Avoids the trap entirely', effect: { coins: +15, avoidedDebt: +500 } },
      { label: 'Open with a $500 limit + pay in full', sub: 'Builds credit safely', effect: { credit: +20, coins: +10 } }
  ]},
  { icon: '🧾', title: 'Tax season approaches', text: 'You qualify for EITC. Free filing exists.', choices: [
      { label: 'Pay TurboTax $180', sub: 'Quick but expensive', effect: { cash: -180 } },
      { label: 'VITA (free campus tax help)', sub: 'Volunteers file for free', effect: { cash: +800, coins: +25, scholar: +1, avoidedDebt: +180 } },
      { label: "Don't file", sub: 'You leave a refund on the table', effect: { stress: +12, avoidedDebt: -800 } }
  ]},
  { icon: '🏠', title: 'Rent going up next month', text: 'Landlord raising rent $150. Options?', choices: [
      { label: 'Accept and absorb it', sub: 'Straightforward, hits budget', effect: { rent: +150, stress: +8 } },
      { label: 'Negotiate or sign longer lease', sub: 'Often works', effect: { rent: +50, coins: +15, stress: +2 } },
      { label: 'Find a roommate', sub: 'Rent drops significantly', effect: { rent: -200, stress: +5, coins: +20 } }
  ]},
  { icon: '🎉', title: 'Friends invite you out — $60 night', text: 'Community matters, but so does cash.', choices: [
      { label: 'Go all out', sub: 'Fun, costly', effect: { cash: -60, stress: -8 } },
      { label: 'Go, stick to $15', sub: 'Balanced choice', effect: { cash: -15, stress: -5 } },
      { label: 'Stay in, study', sub: 'Saves money, stress builds', effect: { stress: +6, coins: +5 } }
  ]},
  { icon: '💻', title: 'Your laptop died mid-paper', text: 'You need it for school. Repair or replace?', choices: [
      { label: 'Buy a new one — $700', sub: 'Cash drain', effect: { cash: -700, stress: +6 } },
      { label: 'Finance it — 0% APR 12mo', sub: 'Split payments, manage cash', effect: { debt: +700, credit: +3, stress: +3 } },
      { label: 'Ask campus about loaner laptops', sub: 'Free program many schools have', effect: { cash: -40, coins: +25, scholar: +1, avoidedDebt: +700 } }
  ]},
  { icon: '🕐', title: 'Midterm week — overwhelmed', text: 'Work is asking you to pick up extra shifts.', choices: [
      { label: 'Pick up all the shifts', sub: 'Great for cash, grades suffer', effect: { income: +300, stress: +20 } },
      { label: 'Decline — focus on midterms', sub: 'Protects your GPA + brain', effect: { stress: -5 } },
      { label: 'Take one shift, study the rest', sub: 'Balanced', effect: { income: +100, stress: +5 } }
  ]},
  { icon: '🚨', title: 'Identity theft alert', text: 'A strange $400 charge appears on your card.', choices: [
      { label: 'Ignore it — "probably a mistake"', sub: 'Big mistake', effect: { debt: +400, credit: -30, stress: +15 } },
      { label: 'Call bank, dispute immediately', sub: 'Standard, effective', effect: { credit: +5, coins: +15, avoidedDebt: +400 } },
      { label: 'Freeze credit + dispute', sub: 'Maximum protection', effect: { credit: +10, coins: +25, scholar: +1, avoidedDebt: +400 } }
  ]},
  { icon: '🎖️', title: 'Workforce grant offered ($1,000)', text: 'Covers tuition for a trade certificate. Small essay required.', choices: [
      { label: 'Apply', sub: 'Real opportunity', effect: { coins: +30, scholar: +1, cash: +500, avoidedDebt: +1000, stress: +5 } },
      { label: 'Skip — "not my field"', sub: 'Missed chance', effect: {} },
      { label: 'Apply + attend info session', sub: 'Great networking too', effect: { coins: +40, scholar: +2, cash: +600, avoidedDebt: +1000, stress: +8 } }
  ]},
  { icon: '🍔', title: 'Hunger hits mid-week', text: "You're low on food. Pantry closed until Monday.", choices: [
      { label: 'Uber Eats — $28', sub: 'Fast, pricey', effect: { cash: -28 } },
      { label: 'Cook with what you have', sub: 'Save cash, slight stress', effect: { stress: +3 } },
      { label: 'Campus free-meal program', sub: 'Many schools run this', effect: { coins: +10, scholar: +1 } }
  ]}
];