/* =========================================================
   Financial Survival Semester — CORE
   Domain model + game logic. No DOM dependencies except for
   self-rendering helpers on Character/EventCard.
   Classes: Character, EventCard, EventDeck, Player, ScoreCalculator
   ========================================================= */

// =========================================================
// Character — one playable student archetype.
// =========================================================
class Character {
  constructor(data) {
    Object.assign(this, data); // id, emoji, name, blurb, start, chips
  }

  renderCard({ selected = false, onSelect }) {
    const el = document.createElement('div');
    el.className = 'char' + (selected ? ' selected' : '');
    el.addEventListener('click', () => onSelect(this));
    el.innerHTML = `
      <div class="emoji">${this.emoji}</div>
      <h3>${this.name}</h3>
      <p>${this.blurb}</p>
      <div class="stat-chips">
        ${this.chips.map(([t, k]) => `<span class="chip ${k}">${t}</span>`).join('')}
      </div>
      <div class="stat-chips" style="margin-top:8px;">
        <span class="chip">💵 $${this.start.cash}</span>
        <span class="chip">📈 ${this.start.credit}</span>
        <span class="chip">🧾 $${this.start.debt}</span>
      </div>
    `;
    return el;
  }

  static all()        { return CHARACTER_DATA.map(d => new Character(d)); }
  static byId(id)     { return Character.all().find(c => c.id === id); }
}

// =========================================================
// EventCard — one weekly curveball + its choices.
// EventDeck — non-repeating draw pile over all EventCards.
// =========================================================
class EventCard {
  constructor(data) {
    this.icon = data.icon;
    this.title = data.title;
    this.text = data.text;
    this.choices = data.choices;
  }

  renderCard(targetEl) {
    targetEl.innerHTML = `
      <div class="icon">${this.icon}</div>
      <h3>${this.title}</h3>
      <p>${this.text}</p>
    `;
  }

  renderChoices(containerEl, onChoose) {
    containerEl.innerHTML = '';
    this.choices.forEach(ch => {
      const btn = document.createElement('button');
      btn.className = 'choice';
      btn.innerHTML = `<div>${ch.label}</div><div class="sub">${ch.sub}</div>`;
      btn.addEventListener('click', () => onChoose(this, ch));
      containerEl.appendChild(btn);
    });
  }

  static all() { return EVENT_DATA.map(d => new EventCard(d)); }
}

class EventDeck {
  constructor(cards) {
    this.all = cards;
    this.used = new Set();
  }

  draw() {
    let pool = this.all.filter(c => !this.used.has(c.title));
    if (pool.length === 0) { this.used.clear(); pool = this.all; }
    const card = pool[Math.floor(Math.random() * pool.length)];
    this.used.add(card.title);
    return card;
  }
}

// =========================================================
// Player — mutable game state for the current run.
// All mutations go through applyEffect() so they're traceable.
// =========================================================
class Player {
  constructor(character) {
    this.character = character;

    // Current stats
    this.cash   = character.start.cash;
    this.credit = character.start.credit;
    this.stress = character.start.stress;
    this.debt   = character.start.debt;
    this.income = character.start.income;
    this.rent   = character.start.rent;

    // Scoring helpers
    this.startCredit = character.start.credit;
    this.coins = 0;
    this.scholar = 0;
    this.totalIncome = 0;
    this.totalSaved = 0;
    this.avoidedDebt = 0;

    this.week = 1;
  }

  /** Weekly paycheck + rent + burnout tick. */
  processWeeklyBudget() {
    const earned = Math.max(0, this.income);
    this.cash += earned - this.rent;
    this.totalIncome += earned;
    if (this.cash > this.totalSaved) this.totalSaved = this.cash;

    if (this.income >= 2000) this.stress += 2;
    let burnedOut = false;
    if (this.stress >= 80) {
      this.income = Math.max(600, this.income - 150);
      this.stress -= 5;
      burnedOut = true;
    }
    this.stress = Math.max(0, this.stress - 1);

    return { earned, rent: this.rent, burnedOut };
  }

  /** Apply a choice's effect object → returns human-readable summary. */
  applyEffect(effect = {}) {
    if (effect.cash)        this.cash += effect.cash;
    if (effect.credit)      this.credit = Math.max(300, Math.min(850, this.credit + effect.credit));
    if (effect.stress)      this.stress = Math.max(0, Math.min(100, this.stress + effect.stress));
    if (effect.debt)        this.debt += effect.debt;
    if (effect.coins)       this.coins += effect.coins;
    if (effect.scholar)     this.scholar += effect.scholar;
    if (effect.income)      this.income = Math.max(0, this.income + effect.income);
    if (effect.rent)        this.rent = Math.max(0, this.rent + effect.rent);
    if (effect.avoidedDebt) this.avoidedDebt += effect.avoidedDebt;

    const parts = [];
    if (effect.cash)        parts.push(`${effect.cash > 0 ? '+' : ''}$${effect.cash} cash`);
    if (effect.debt)        parts.push(`${effect.debt > 0 ? '+' : ''}$${effect.debt} debt`);
    if (effect.credit)      parts.push(`${effect.credit > 0 ? '+' : ''}${effect.credit} credit`);
    if (effect.stress)      parts.push(`${effect.stress > 0 ? '+' : ''}${effect.stress} stress`);
    if (effect.coins)       parts.push(`+${effect.coins} EduCoins`);
    if (effect.scholar)     parts.push(`+${effect.scholar} scholarship`);
    if (effect.income)      parts.push(`${effect.income > 0 ? '+' : ''}$${effect.income} income`);
    if (effect.avoidedDebt) parts.push(`+$${effect.avoidedDebt} debt avoided`);
    return parts.join(', ') || 'no major impact';
  }

  static categorizeEffect(e = {}) {
    const good = e.avoidedDebt || (e.coins && e.coins > 10) || (e.credit && e.credit > 0);
    const bad  = (e.debt && e.debt > 0) || (e.stress && e.stress > 10) || (e.credit && e.credit < -10);
    return good ? 'good' : bad ? 'bad' : 'info';
  }

  get netWorth()    { return this.cash - this.debt; }
  get creditDelta() { return this.credit - this.startCredit; }
  get savingsRate() { return this.totalIncome > 0 ? Math.max(0, this.totalSaved / this.totalIncome) : 0; }
  get isBankrupt()  { return this.cash < -500; }
}

// =========================================================
// ScoreCalculator — pure math → 0.0-4.0 Financial GPA + debrief.
// =========================================================
class ScoreCalculator {
  static WEIGHTS = { survival: 0.35, credit: 0.15, savings: 0.20, scholar: 0.15, avoided: 0.15 };

  static calculate(player) {
    const clamp01 = v => Math.max(0, Math.min(1, v));

    const survivalScore = player.cash >= 0
      ? clamp01(0.7 + Math.min(0.3, player.netWorth / 4000))
      : clamp01(0.5 + player.netWorth / 1000);

    const creditScore  = clamp01(0.5 + player.creditDelta / 60);
    const savingsScore = clamp01(player.savingsRate * 4);
    const scholarScore = clamp01(player.scholar / 6);
    const avoidedScore = clamp01(player.avoidedDebt / 3000);

    const w = ScoreCalculator.WEIGHTS;
    const composite =
      survivalScore * w.survival + creditScore * w.credit +
      savingsScore  * w.savings  + scholarScore * w.scholar +
      avoidedScore  * w.avoided;

    let gpa = composite * 4.0;
    if (player.isBankrupt) gpa = 0.0;
    gpa = Math.max(0, Math.min(4.0, gpa));

    return { gpa, tier: ScoreCalculator.tierFor(gpa, player.isBankrupt) };
  }

  static tierFor(gpa, bankrupt) {
    if (bankrupt)    return { name: 'Dropped Out',        emoji: '💀', caption: 'You ran out of money before the semester ended.' };
    if (gpa >= 3.7)  return { name: "Dean's List",        emoji: '👑', caption: 'Elite money moves. You survived AND built wealth.' };
    if (gpa >= 3.0)  return { name: 'Honor Roll',         emoji: '🎓', caption: 'Strong semester. Solid financial decisions.' };
    if (gpa >= 2.0)  return { name: 'Passing',            emoji: '📚', caption: 'You made it. Room to grow next semester.' };
    return             { name: 'Academic Probation',      emoji: '😬', caption: 'Tight semester. Debt and stress piled up.' };
  }

  static buildDebrief(player, gpa) {
    const items = [];
    
    // Detailed analysis based on actual performance
    const netWorth = player.netWorth;
    const creditDelta = player.creditDelta;
    const savingsRate = player.savingsRate;
    const scholarships = player.scholar;
    const debtAvoided = player.avoidedDebt;
    const finalStress = player.stress;
    const finalDebt = player.debt;
    
    // Net Worth Analysis (35% of grade)
    if (netWorth < -500) {
      items.push(`💀 BANKRUPTCY: You ended at $${netWorth.toLocaleString()} net worth. This means you couldn't afford basic necessities. Key mistake: No emergency fund. Even $500 saved at the start would have prevented this spiral.`);
    } else if (netWorth < 0) {
      items.push(`⚠️ NEGATIVE NET WORTH: You ended at $${netWorth.toLocaleString()}. You're technically insolvent. The debt avalanche method (pay highest interest first) would have saved you $${Math.abs(netWorth * 0.2).toFixed(0)} in interest charges.`);
    } else if (netWorth < 500) {
      items.push(`📊 SURVIVAL MODE: Net worth of $${netWorth.toLocaleString()} means you're living paycheck-to-paycheck. Build a $500-1000 emergency fund BEFORE paying extra on debt. This prevents the debt spiral when unexpected expenses hit.`);
    } else if (netWorth < 2000) {
      items.push(`💰 BUILDING WEALTH: $${netWorth.toLocaleString()} net worth is solid progress. Next goal: 3-6 months expenses saved ($${(player.rent * 3).toLocaleString()}-$${(player.rent * 6).toLocaleString()}). This is your financial foundation.`);
    } else {
      items.push(`🏆 WEALTH BUILDER: $${netWorth.toLocaleString()} net worth is elite. You understand opportunity cost and compound interest. At this rate, investing $200/mo in index funds = $250,000 in 30 years at 7% returns.`);
    }

    // Credit Score Analysis (15% of grade)
    if (creditDelta < -30) {
      items.push(`📉 CREDIT DAMAGE: Your score dropped ${Math.abs(creditDelta)} points. This costs you thousands in higher interest rates. Key lesson: Credit utilization over 30% tanks your score. Pay down balances or request limit increases to fix this.`);
    } else if (creditDelta < 0) {
      items.push(`⚠️ CREDIT SLIP: Score dropped ${Math.abs(creditDelta)} points. Likely cause: high utilization or late payments. One late payment stays on your report for 7 years. Set up autopay for minimums to prevent this.`);
    } else if (creditDelta < 20) {
      items.push(`📊 CREDIT MAINTAINED: Score changed by ${creditDelta} points. To actively build credit: keep utilization under 30%, pay on time, and consider becoming an authorized user on a parent's old card (inherits their history).`);
    } else {
      items.push(`📈 CREDIT BUILDER: Score jumped ${creditDelta} points! You understand the game: low utilization, on-time payments, and credit age. A 750+ score saves you $50,000+ over a lifetime in lower interest rates.`);
    }

    // Savings Rate Analysis (20% of grade)
    const savingsPercent = (savingsRate * 100).toFixed(1);
    if (savingsRate < 0.05) {
      items.push(`💸 LIFESTYLE INFLATION: ${savingsPercent}% savings rate means you spent almost everything you earned. The 50/30/20 rule: 50% needs, 30% wants, 20% savings. You're at ${savingsPercent}% when you need 20%. Cut recurring costs first (phone plan, subscriptions).`);
    } else if (savingsRate < 0.15) {
      items.push(`📊 BELOW TARGET: ${savingsPercent}% savings rate is below the 20% benchmark. The "latte factor": $5/day on coffee = $1,825/year. Find your latte factor and redirect it to savings. Small daily costs compound into huge annual waste.`);
    } else if (savingsRate < 0.25) {
      items.push(`💰 SOLID SAVER: ${savingsPercent}% savings rate beats the 20% rule. You're avoiding lifestyle inflation. Next level: automate savings ("pay yourself first"). Money you don't see, you don't spend.`);
    } else {
      items.push(`🏆 SUPER SAVER: ${savingsPercent}% savings rate is elite. You've mastered delayed gratification. At this rate, you'll hit financial independence decades before your peers. Keep investing in index funds for compound growth.`);
    }

    // Scholarship IQ Analysis (15% of grade)
    if (scholarships === 0) {
      items.push(`🎯 MISSED OPPORTUNITIES: You found ZERO scholarships. There's $2.6 billion in unclaimed aid annually. Spending 10 hours on scholarship essays = $200/hour effective rate (vs. your $${(player.income/160).toFixed(0)}/hr job). This is the highest ROI activity available to students.`);
    } else if (scholarships < 3) {
      items.push(`📚 SCHOLARSHIP BEGINNER: You found ${scholarships} scholarship(s), but left money on the table. Your profile (${player.character.name}) is eligible for: ${player.character.start.aidEligible.join(', ')}. Set a goal: apply to 2 scholarships per week. Even $500 awards add up to thousands.`);
    } else if (scholarships < 5) {
      items.push(`🎓 SCHOLARSHIP HUNTER: ${scholarships} scholarships found shows you understand free money > loans. Pro tip: Local scholarships have less competition than national ones. Check your city's community foundation and employer scholarships.`);
    } else {
      items.push(`👑 SCHOLARSHIP MASTER: ${scholarships} scholarships is elite hustle. You understand opportunity cost: 10 hours of essays at $200/hr beats 10 hours of minimum wage work. This skill alone could save you $20,000+ in student debt.`);
    }

    // Debt Avoided Analysis (15% of grade)
    if (debtAvoided < 500) {
      items.push(`⚠️ PREDATORY DEBT TRAP: You avoided only $${debtAvoided.toLocaleString()} in bad debt. Payday loans at 400% APR turn $300 into $1,200 in one year. Campus emergency grants exist for this exact reason - they're FREE money, not loans. Always ask financial aid office first.`);
    } else if (debtAvoided < 2000) {
      items.push(`📊 DEBT AWARENESS: You avoided $${debtAvoided.toLocaleString()} in predatory debt. Good instincts, but you can do better. Key principle: Subsidized loans (government pays interest) > Unsubsidized > Private loans > Credit cards > Payday loans. Always take the cheapest money first.`);
    } else if (debtAvoided < 4000) {
      items.push(`💰 DEBT AVOIDER: $${debtAvoided.toLocaleString()} in predatory debt sidestepped. You understand the debt hierarchy. Next level: 0% balance transfer arbitrage. Move high-interest debt to 0% cards, pay off during promo period. This is free money.`);
    } else {
      items.push(`🏆 DEBT MASTER: $${debtAvoided.toLocaleString()} in predatory debt avoided is elite. You understand compound interest works AGAINST you in debt. Every $1,000 of 20% APR debt costs you $200/year. You're saving thousands in interest by making smart choices.`);
    }

    // Stress Analysis (not graded but important)
    if (finalStress >= 80) {
      items.push(`🧠 BURNOUT WARNING: Stress at ${finalStress}/100 is unsustainable. High stress = lower grades = lost scholarships = more debt. This is a vicious cycle. Consider: reduce work hours, apply for more aid, use campus mental health resources (usually free).`);
    } else if (finalStress >= 60) {
      items.push(`⚠️ HIGH STRESS: ${finalStress}/100 stress is manageable but risky. Remember: your mental health is part of your net worth. Burning out and dropping out costs more than any short-term income gain. Balance is key.`);
    }

    // Final Debt Analysis
    if (finalDebt > 5000) {
      items.push(`💳 HIGH DEBT LOAD: You're carrying $${finalDebt.toLocaleString()} in debt. If this is high-interest (>10% APR), prioritize paying it off before investing. The guaranteed "return" of eliminating 20% APR debt beats any stock market investment.`);
    } else if (finalDebt > 0) {
      items.push(`📊 MANAGEABLE DEBT: $${finalDebt.toLocaleString()} in debt is controllable. Use the debt avalanche method: pay minimums on everything, throw extra money at the highest interest rate debt. This mathematically minimizes total interest paid.`);
    }

    // Overall Performance Summary
    if (gpa >= 3.7) {
      items.push(`🎓 FINANCIAL EXCELLENCE: ${gpa.toFixed(2)} GPA means you understand the core principles: emergency fund first, avoid high-interest debt, hunt for scholarships, keep credit utilization low, and save 20%+. You're in the top 10% of financial literacy. Keep this discipline and you'll retire early.`);
    } else if (gpa >= 3.0) {
      items.push(`📚 SOLID FOUNDATION: ${gpa.toFixed(2)} GPA shows good financial instincts. You made mostly smart choices. To reach 3.7+: focus on the areas above where you scored lowest. Small improvements in each category compound into major GPA gains.`);
    } else if (gpa >= 2.0) {
      items.push(`⚠️ ROOM FOR GROWTH: ${gpa.toFixed(2)} GPA means you survived but made costly mistakes. Review the specific feedback above. The difference between 2.0 and 3.5 GPA is often just 2-3 better decisions per semester. Learn from this run and try again.`);
    } else if (gpa > 0) {
      items.push(`🚨 FINANCIAL CRISIS: ${gpa.toFixed(2)} GPA indicates serious financial mistakes. You likely: ignored scholarships, took predatory loans, had no emergency fund, and overspent. The good news: financial literacy is learnable. Read "The Total Money Makeover" and try again with this knowledge.`);
    }

    // Actionable next steps
    const aid = player.character.start.aidEligible;
    items.push(`🎯 ACTION PLAN: This week, do these 3 things: (1) Apply for ${aid[0]} on your campus aid portal, (2) Open a high-yield savings account (4.5% APY vs. 0% checking), (3) Set up autopay for minimum payments on all debts. These 3 actions take 2 hours and could save you $5,000+ this year.`);
    
    return items;
  }
}