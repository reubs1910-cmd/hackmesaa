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
    emoji: '👩‍🍼',
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
    emoji: '👨',
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
  },
  {
    id: 'freshman',
    emoji: '🎒',
    name: 'The First Year',
    blurb: 'Fresh out of high school. No credit history, no financial literacy yet.',
    start: {
      cash: 500, credit: 300, stress: 20, debt: 0,
      income: 800, rent: 600,
      aidEligible: ['Pell', 'First-Gen Scholarship', 'Work-Study']
    },
    chips: [['No credit','warn'],['Full aid eligible','good'],['Learning curve','bad']]
  }
];

/**
 * EVENT_DATA - HARDER VERSION
 * Each entry becomes an EventCard.
 * Choice `effect` keys: cash, credit, stress, debt, coins, scholar, income, rent, avoidedDebt
 * Principles tested: Emergency fund, compound interest, opportunity cost, time value of money, debt avalanche vs snowball
 */
const EVENT_DATA = [
  { 
    icon: '💰', 
    title: 'Unexpected $500 windfall from tax refund', 
    text: 'You just got $500 back. You have $200 in savings and $800 in credit card debt at 22% APR.', 
    choices: [
      { label: 'Put all $500 toward credit card debt', sub: 'Debt avalanche method - highest interest first', effect: { cash: +500, debt: -500, coins: +30, avoidedDebt: +110, stress: -5 } },
      { label: 'Split: $250 to debt, $250 to savings', sub: 'Build emergency fund while paying debt', effect: { cash: +250, debt: -250, coins: +20, avoidedDebt: +55, stress: -2 } },
      { label: 'Keep it all in checking for "flexibility"', sub: 'Lifestyle creep risk - debt keeps growing', effect: { cash: +500, stress: +8 } },
      { label: 'Invest in a "guaranteed" crypto opportunity', sub: 'High risk, likely scam', effect: { cash: -500, stress: +25, credit: -10 } }
  ]},
  { 
    icon: '🏦', 
    title: 'High-yield savings account vs. checking', 
    text: 'You have $1,200 sitting in checking (0% interest). A high-yield savings offers 4.5% APY.', 
    choices: [
      { label: 'Move $1,000 to high-yield savings, keep $200 buffer', sub: 'Time value of money - earn $45/year passively', effect: { coins: +25, scholar: +1, cash: +45, stress: -3 } },
      { label: 'Leave it all in checking - easier access', sub: 'Opportunity cost: losing $45/year to inflation', effect: { stress: +5 } },
      { label: 'Put it in a CD with 5% but locked for 1 year', sub: 'Higher rate but no liquidity for emergencies', effect: { cash: -1000, stress: +15, coins: +10 } },
      { label: 'Keep $500 checking, $700 high-yield', sub: 'Balanced approach - liquidity + growth', effect: { coins: +15, cash: +30, stress: -1 } }
  ]},
  { 
    icon: '📊', 
    title: 'Credit card balance transfer offer', 
    text: 'You owe $1,200 at 24% APR. New card offers 0% APR for 18 months with 3% transfer fee ($36).', 
    choices: [
      { label: 'Transfer and pay $70/month to clear in 18mo', sub: 'Saves $216 in interest - smart arbitrage', effect: { debt: -1200, cash: -36, credit: +15, coins: +35, avoidedDebt: +216, stress: -8 } },
      { label: 'Keep current card, pay minimum only', sub: 'Compound interest trap - debt grows', effect: { debt: +288, credit: -20, stress: +15 } },
      { label: 'Transfer but keep spending on new card', sub: 'Defeats the purpose - double debt', effect: { debt: +600, credit: -15, stress: +20 } },
      { label: 'Ignore offer, pay $100/month on current card', sub: 'Slower payoff, more interest paid', effect: { debt: -400, cash: -100, stress: +5 } }
  ]},
  { 
    icon: '🎓', 
    title: 'Student loan: subsidized vs. unsubsidized', 
    text: 'You need $3,000 for tuition. Subsidized loan (no interest while in school) or unsubsidized (interest accrues now)?', 
    choices: [
      { label: 'Take subsidized loan - government pays interest', sub: 'Classical principle: free money while in school', effect: { cash: +3000, debt: +3000, coins: +30, scholar: +1, stress: -5 } },
      { label: 'Take unsubsidized - "same thing"', sub: 'Costs $450 more over 4 years at 5% interest', effect: { cash: +3000, debt: +3450, stress: +10 } },
      { label: 'Private loan at 8% - faster approval', sub: 'Predatory - costs $960 more than subsidized', effect: { cash: +3000, debt: +3960, credit: -10, stress: +15 } },
      { label: 'Work extra shifts + take subsidized for gap', sub: 'Minimize debt, maximize free money', effect: { cash: +2000, debt: +1000, income: +200, coins: +40, scholar: +1, stress: +8, avoidedDebt: +2000 } }
  ]},
  { 
    icon: '🚗', 
    title: 'Car repair: $800 or buy used for $3,000?', 
    text: 'Your car needs $800 in repairs. A "reliable" used car is $3,000. You have $1,500 saved.', 
    choices: [
      { label: 'Pay $800 repair - keep emergency fund intact', sub: 'Sunk cost fallacy avoided - preserve liquidity', effect: { cash: -800, coins: +25, stress: -5 } },
      { label: 'Buy $3,000 car with $1,500 down + $1,500 loan', sub: 'New debt for uncertain reliability', effect: { cash: -1500, debt: +1500, credit: -5, stress: +15 } },
      { label: 'Sell broken car for $500, buy $3,000 car cash', sub: 'Depletes emergency fund completely', effect: { cash: -2500, stress: +20 } },
      { label: 'Repair for $800, start $100/mo car fund', sub: 'Pay yourself first principle - plan ahead', effect: { cash: -800, income: -100, coins: +30, scholar: +1, stress: -3 } }
  ]},
  { 
    icon: '💳', 
    title: 'Credit utilization: maxed out card', 
    text: 'Your $2,000 limit card is at $1,900 (95% utilization). Credit score dropping. You have $500 cash.', 
    choices: [
      { label: 'Pay $500 to drop utilization to 70%', sub: 'Credit utilization rule: under 30% is ideal', effect: { cash: -500, debt: -500, credit: +25, coins: +30, stress: -8 } },
      { label: 'Pay minimum $50, keep cash for emergencies', sub: 'Short-term thinking - credit damage costs more', effect: { cash: -50, debt: -50, credit: -15, stress: +10 } },
      { label: 'Request credit limit increase to $4,000', sub: 'Lowers utilization without payment - smart hack', effect: { credit: +20, coins: +25, scholar: +1, stress: -5 } },
      { label: 'Open new card to spread balance', sub: 'Hard inquiry + temptation to overspend', effect: { credit: -10, stress: +12 } }
  ]},
  { 
    icon: '🏠', 
    title: 'Rent vs. roommate math', 
    text: 'You pay $900/mo solo. Roommate would split to $450 each, but you value privacy. You earn $2,000/mo.', 
    choices: [
      { label: 'Get roommate - save $5,400/year', sub: 'Opportunity cost: invest savings = $27,000 in 5yr', effect: { rent: -450, coins: +40, scholar: +1, cash: +450, stress: +8, avoidedDebt: +5400 } },
      { label: 'Stay solo - worth the premium', sub: 'Lifestyle inflation - $450/mo could build wealth', effect: { stress: -5 } },
      { label: 'Get roommate, invest $400/mo in Roth IRA', sub: 'Compound interest: $400/mo = $500k in 30yr', effect: { rent: -450, coins: +50, scholar: +2, cash: +50, stress: +5, avoidedDebt: +5400 } },
      { label: 'Negotiate rent down $100/mo', sub: 'Middle path - some savings, keep privacy', effect: { rent: -100, coins: +15, stress: -2 } }
  ]},
  { 
    icon: '📱', 
    title: 'Phone plan: $85/mo vs. $25/mo MVNO', 
    text: 'You pay $85/mo for Verizon. Mint Mobile (same network) is $25/mo prepaid. Annual = $300 vs. $1,020.', 
    choices: [
      { label: 'Switch to $25/mo plan - save $720/year', sub: 'Frugality principle: cut recurring costs first', effect: { cash: +60, rent: -60, coins: +35, scholar: +1, stress: -5, avoidedDebt: +720 } },
      { label: 'Stay on $85/mo - "better service"', sub: 'Sunk cost + status signaling - same network', effect: { stress: +8 } },
      { label: 'Downgrade to $45/mo plan', sub: 'Compromise - saves $480/year', effect: { cash: +40, rent: -40, coins: +20, stress: -2, avoidedDebt: +480 } },
      { label: 'Switch + invest $60/mo savings', sub: 'Compound effect: $60/mo = $75k in 30yr', effect: { cash: +60, rent: -60, coins: +45, scholar: +2, stress: -3, avoidedDebt: +720 } }
  ]},
  { 
    icon: '🎯', 
    title: 'Scholarship: $2,000 award vs. 10 hours work', 
    text: 'Scholarship needs 10 hours of essays. You earn $15/hr. Scholarship = $200/hr effective rate.', 
    choices: [
      { label: 'Write essays - $200/hr is unbeatable ROI', sub: 'Opportunity cost analysis: 13x your hourly rate', effect: { income: -150, scholar: +2, coins: +50, cash: +2000, stress: +10, avoidedDebt: +2000 } },
      { label: 'Work 10 hours instead - guaranteed $150', sub: 'Short-term thinking - miss $1,850 upside', effect: { income: +150, stress: +5 } },
      { label: 'Do both - sacrifice sleep', sub: 'Burnout risk - unsustainable', effect: { income: +150, scholar: +2, cash: +2000, stress: +30, avoidedDebt: +2000 } },
      { label: 'Skip both - "too busy"', sub: 'Missed opportunity - $2,150 left on table', effect: { stress: -5 } }
  ]},
  { 
    icon: '🍔', 
    title: 'Eating out: $12/day vs. meal prep $4/day', 
    text: 'You spend $12/day eating out ($360/mo). Meal prep costs $4/day ($120/mo). Difference = $240/mo.', 
    choices: [
      { label: 'Meal prep - save $2,880/year', sub: 'Latte factor: small daily savings = huge annual impact', effect: { cash: +240, coins: +35, scholar: +1, stress: +5, avoidedDebt: +2880 } },
      { label: 'Keep eating out - convenience matters', sub: 'Lifestyle creep - $240/mo could eliminate debt', effect: { cash: -240, stress: +10 } },
      { label: 'Hybrid: meal prep weekdays, eat out weekends', sub: 'Balanced - saves $1,920/year', effect: { cash: +160, coins: +25, stress: +2, avoidedDebt: +1920 } },
      { label: 'Meal prep + invest $200/mo savings', sub: 'Compound interest: $200/mo = $250k in 30yr', effect: { cash: +200, coins: +45, scholar: +2, stress: +8, avoidedDebt: +2400 } }
  ]},
  { 
    icon: '💼', 
    title: 'Side hustle: $500/mo or focus on grades?', 
    text: 'Tutoring gig pays $500/mo (10hrs). Your GPA is 3.2. Scholarships need 3.5+ ($3,000/yr).', 
    choices: [
      { label: 'Focus on GPA - $3,000 scholarship > $6,000 tutoring', sub: 'Opportunity cost: 2 years of tutoring = 1 scholarship', effect: { scholar: +2, coins: +40, cash: +1500, stress: -5, avoidedDebt: +3000 } },
      { label: 'Take tutoring gig - guaranteed income', sub: 'Short-term gain, long-term loss of scholarship', effect: { income: +500, stress: +15 } },
      { label: 'Do both - sacrifice sleep and health', sub: 'Burnout inevitable - grades will drop anyway', effect: { income: +500, stress: +35, credit: -10 } },
      { label: 'Tutor 5hrs/mo, focus on GPA rest of time', sub: 'Balanced - $250/mo + scholarship eligibility', effect: { income: +250, scholar: +1, coins: +25, cash: +750, stress: +8, avoidedDebt: +1500 } }
  ]},
  { 
    icon: '🏦', 
    title: 'Emergency fund: how much is enough?', 
    text: 'You have $2,000 saved. Rent is $700/mo. Experts say 3-6 months expenses ($2,100-$4,200).', 
    choices: [
      { label: 'Keep building to $3,000 (4+ months)', sub: 'Rule of thumb: 3-6mo expenses prevents debt spiral', effect: { cash: +1000, coins: +35, scholar: +1, stress: -10, avoidedDebt: +500 } },
      { label: 'Stop at $2,000 - "good enough"', sub: 'Underfunded - one emergency wipes you out', effect: { stress: +8 } },
      { label: 'Use $1,000 to pay off credit card debt', sub: 'Debt avalanche vs. emergency fund - risky trade', effect: { cash: -1000, debt: -1000, stress: +15 } },
      { label: 'Build to $4,200 (6mo) before any investing', sub: 'Financial foundation first - prevents forced debt', effect: { cash: +2200, coins: +50, scholar: +2, stress: -15, avoidedDebt: +1000 } }
  ]},
  { 
    icon: '🎓', 
    title: 'FAFSA: file now or wait for parent tax return?', 
    text: 'FAFSA opens Oct 1. Filing early = first access to limited aid. Parent taxes not ready until March.', 
    choices: [
      { label: 'File now with estimates, update later', sub: 'First-come-first-served: early filers get more aid', effect: { coins: +40, scholar: +2, cash: +800, stress: -5, avoidedDebt: +800 } },
      { label: 'Wait for perfect tax data in March', sub: 'Miss $2.6B in aid given to early filers', effect: { cash: -400, stress: +15 } },
      { label: 'Skip FAFSA - "too complicated"', sub: 'Leave $6,000+ average aid on the table', effect: { stress: +25, debt: +3000 } },
      { label: 'File early + set reminder to update', sub: 'Best practice: claim spot, refine later', effect: { coins: +50, scholar: +2, cash: +1000, stress: -8, avoidedDebt: +1000 } }
  ]},
  { 
    icon: '💳', 
    title: 'Debt payoff: avalanche vs. snowball method', 
    text: 'Card A: $3,000 at 24% APR. Card B: $800 at 18% APR. You have $500/mo to pay debt.', 
    choices: [
      { label: 'Avalanche: pay Card A first (highest interest)', sub: 'Math wins: saves $340 in interest over snowball', effect: { debt: -1500, coins: +40, scholar: +1, cash: +340, stress: -5, avoidedDebt: +340 } },
      { label: 'Snowball: pay Card B first (smallest balance)', sub: 'Psychological win but costs $340 more', effect: { debt: -800, coins: +20, stress: -8 } },
      { label: 'Split $250 to each card', sub: 'Worst strategy - maximizes interest paid', effect: { debt: -500, stress: +10 } },
      { label: 'Consolidate both to 0% balance transfer', sub: 'Arbitrage play: eliminate interest entirely', effect: { debt: -3800, credit: +20, coins: +50, scholar: +2, cash: +114, stress: -10, avoidedDebt: +800 } }
  ]},
  { 
    icon: '🚗', 
    title: 'Car loan: 5-year vs. 3-year term', 
    text: '$15,000 car. 5yr = $300/mo at 6% ($18,000 total). 3yr = $456/mo at 4% ($16,416 total).', 
    choices: [
      { label: 'Take 3-year loan - save $1,584 in interest', sub: 'Time value of money: shorter term = less interest', effect: { debt: +16416, cash: -456, coins: +35, scholar: +1, stress: +10, avoidedDebt: +1584 } },
      { label: 'Take 5-year loan - lower monthly payment', sub: 'Costs $1,584 more for "affordability"', effect: { debt: +18000, cash: -300, stress: +5 } },
      { label: 'Buy $8,000 used car cash', sub: 'Avoid debt entirely - opportunity cost of $7k', effect: { cash: -8000, coins: +50, scholar: +2, stress: -5, avoidedDebt: +18000 } },
      { label: 'Take 5yr loan, pay extra $156/mo to match 3yr', sub: 'Flexibility + savings - best of both worlds', effect: { debt: +16416, cash: -456, coins: +40, stress: +8, avoidedDebt: +1584 } }
  ]},
  { 
    icon: '📚', 
    title: 'Textbooks: rent, buy, or pirate?', 
    text: 'New: $680. Rent: $140. Used: $280. Pirated PDF: free but risky. You need them for 4 months.', 
    choices: [
      { label: 'Rent for $140 - best value for 4 months', sub: 'Opportunity cost analysis: $140 vs. $680 = $540 saved', effect: { cash: -140, coins: +30, scholar: +1, stress: -3, avoidedDebt: +540 } },
      { label: 'Buy new for $680 - "investment"', sub: 'Sunk cost fallacy - resale value is $80 max', effect: { cash: -680, stress: +10 } },
      { label: 'Buy used for $280, resell for $100', sub: 'Net cost $180 - slightly worse than renting', effect: { cash: -180, coins: +15, stress: +5 } },
      { label: 'Library reserve + pirated backup', sub: 'Free + legal gray area - highest risk/reward', effect: { cash: -20, coins: +40, scholar: +1, stress: +8, avoidedDebt: +660 } }
  ]},
  { 
    icon: '🏥', 
    title: 'Health insurance: campus plan vs. parent plan', 
    text: 'Campus plan: $2,400/yr. Stay on parent plan (ACA): free until 26. You\'re 22.', 
    choices: [
      { label: 'Stay on parent plan - save $9,600 over 4 years', sub: 'ACA provision: free money until 26', effect: { coins: +50, scholar: +2, cash: +2400, stress: -10, avoidedDebt: +9600 } },
      { label: 'Buy campus plan - "more independent"', sub: 'Ego costs $9,600 - financially illiterate', effect: { cash: -2400, stress: +15 } },
      { label: 'Go uninsured - "I\'m young and healthy"', sub: 'One ER visit = $5,000+ debt spiral', effect: { stress: +25, debt: +5000 } },
      { label: 'Parent plan + HSA contributions', sub: 'Triple tax advantage: deduct, grow, withdraw tax-free', effect: { coins: +60, scholar: +2, cash: +3000, stress: -12, avoidedDebt: +12000 } }
  ]},
  { 
    icon: '💰', 
    title: 'Tax refund: lump sum vs. adjust withholding', 
    text: 'You got $2,400 refund. That\'s $200/mo you overpaid. Adjust W-4 to get it in paychecks instead?', 
    choices: [
      { label: 'Adjust W-4 - get $200/mo throughout year', sub: 'Time value of money: use your money now, not later', effect: { income: +200, coins: +40, scholar: +2, cash: +200, stress: -8 } },
      { label: 'Keep overpaying - "forced savings"', sub: 'Interest-free loan to government - you lose', effect: { stress: +5 } },
      { label: 'Take refund, invest in index fund', sub: 'Lump sum investing - but delayed by 12 months', effect: { cash: +2400, coins: +25, stress: -5 } },
      { label: 'Adjust W-4 + auto-invest $200/mo', sub: 'Dollar-cost averaging: best of both worlds', effect: { income: +200, coins: +50, scholar: +2, cash: +400, stress: -10, avoidedDebt: +2400 } }
  ]},
  { 
    icon: '🎉', 
    title: 'Lifestyle inflation: $500 raise', 
    text: 'You got a $500/mo raise. Current savings rate: 5%. Rent is $700/mo.', 
    choices: [
      { label: 'Save entire $500 - boost savings rate to 25%', sub: 'Pay yourself first: avoid lifestyle inflation trap', effect: { income: +500, coins: +50, scholar: +2, cash: +500, stress: -10, avoidedDebt: +6000 } },
      { label: 'Spend entire $500 - "I earned it"', sub: 'Lifestyle creep: income up, wealth stays flat', effect: { income: +500, cash: -500, stress: +15 } },
      { label: 'Save $250, spend $250', sub: 'Balanced - savings rate jumps to 15%', effect: { income: +500, coins: +30, cash: +250, stress: -5, avoidedDebt: +3000 } },
      { label: 'Move to $1,200 apartment', sub: 'Lifestyle inflation: $500 raise = $500 rent increase', effect: { income: +500, rent: +500, stress: +20 } }
  ]}
];
