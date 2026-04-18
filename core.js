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
    if (player.avoidedDebt < 500) items.push('You took on avoidable debt — a $500 emergency fund would have absorbed most of your rough weeks.');
    if (player.scholar < 3)       items.push(`You only found ${player.scholar} scholarship opportunities. The ${player.character.name} profile is eligible for: ${player.character.start.aidEligible.join(', ')}.`);
    if (player.stress >= 70)      items.push('Stress stayed high — working more hours for income comes with a real cost to grades and health.');
    if (player.creditDelta < 0)   items.push('Your credit dropped. Next time, prioritize minimum payments + call creditors before missing anything.');
    if (player.cash < 0)          items.push('You finished the semester in the red. Campus emergency funds (free money, not loans) could have bridged the gap.');
    if (player.savingsRate < 0.05)items.push('Savings rate under 5% — try the 50/30/20 rule next semester: 50% needs, 30% wants, 20% savings.');
    if (gpa >= 3.7)               items.push("You're in the top tier. Keep this discipline and you'll be debt-free at graduation.");
    if (items.length === 0)       items.push('Balanced semester. No major red flags — keep building the emergency fund.');

    const aid = player.character.start.aidEligible;
    items.push(`Real opportunities for you: search for ${aid[0]} + ${aid[aid.length - 1]} on your campus aid portal this week.`);
    return items;
  }
}