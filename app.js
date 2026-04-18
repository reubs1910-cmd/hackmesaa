/* =========================================================
   Financial Survival Semester — APP
   Presentation + orchestration. All DOM lives here.
   Classes: Logger, Leaderboard, UI, Game + bootstrap.
   ========================================================= */

// =========================================================
// Logger — writes WIN/HIT/INFO entries to the log panel.
// =========================================================
class Logger {
  constructor(targetEl) {
    this.el = targetEl;
    this.entries = [];
  }

  clear() { this.el.innerHTML = ''; this.entries = []; }

  write(kind, msg) {
    this.entries.push({ kind, msg });
    const div = document.createElement('div');
    div.className = 'entry ' + kind;
    const tag = kind === 'good' ? '✓ WIN' : kind === 'bad' ? '✗ HIT' : 'ℹ INFO';
    div.innerHTML = `<span class="tag">${tag}</span>${msg}`;
    this.el.appendChild(div);
    this.el.scrollTop = this.el.scrollHeight;
  }

  info(msg) { this.write('info', msg); }
  good(msg) { this.write('good', msg); }
  bad(msg)  { this.write('bad', msg); }
}

// =========================================================
// Leaderboard — campus ranking with player injected.
// =========================================================
class Leaderboard {
  static PEERS = [
    { name: 'Maya R. (Nursing)',        gpa: 3.82 },
    { name: 'Jordan P. (Business)',     gpa: 3.41 },
    { name: 'Aisha N. (CS)',            gpa: 3.12 },
    { name: 'Diego M. (Welding)',       gpa: 2.88 },
    { name: 'Sam K. (Liberal Arts)',    gpa: 2.55 },
    { name: 'Priya V. (Biology)',       gpa: 2.21 },
    { name: 'Tony L. (Criminal Just.)', gpa: 1.94 }
  ];

  static rankWith(playerGpa) {
    return [...Leaderboard.PEERS, { name: 'YOU', gpa: playerGpa, isMe: true }]
      .sort((a, b) => b.gpa - a.gpa);
  }

  static render(targetEl, playerGpa) {
    targetEl.innerHTML = '';
    Leaderboard.rankWith(playerGpa).forEach((p, i) => {
      const row = document.createElement('div');
      row.className = 'row' + (p.isMe ? ' me' : '');
      row.innerHTML = `
        <div class="rank">#${i + 1}</div>
        <div class="name">${p.name}</div>
        <div class="score">${p.gpa.toFixed(2)}</div>
      `;
      targetEl.appendChild(row);
    });
  }
}

// =========================================================
// UI — owns ALL DOM queries and screen-level rendering.
// Game talks to UI; UI talks to DOM.
// =========================================================
class UI {
  static TOTAL_WEEKS = 12;

  constructor() {
    this.screens = {
      title:  document.getElementById('screen-title'),
      select: document.getElementById('screen-select'),
      game:   document.getElementById('screen-game'),
      end:    document.getElementById('screen-end')
    };

    this.howto = document.getElementById('howto');
    this.charGrid = document.getElementById('charGrid');
    this.startBtn = document.getElementById('startBtn');

    this.charLabel   = document.getElementById('charLabel');
    this.charTitle   = document.getElementById('charTitle');
    this.weekCounter = document.getElementById('weekCounter');
    this.weekTag     = document.getElementById('weekTag');
    this.scholarTag  = document.getElementById('scholarTag');
    this.eventCard   = document.getElementById('eventCard');
    this.choicesEl   = document.getElementById('choices');
    this.logEl       = document.getElementById('log');

    this.hud = {
      cash:      document.getElementById('hudCash'),
      credit:    document.getElementById('hudCredit'),
      stress:    document.getElementById('hudStress'),
      stressBar: document.getElementById('hudStressBar'),
      debt:      document.getElementById('hudDebt'),
      coins:     document.getElementById('hudCoins')
    };

    this.end = {
      charTag:     document.getElementById('endCharTag'),
      gpa:         document.getElementById('finalGPA'),
      tier:        document.getElementById('finalTier'),
      caption:     document.getElementById('finalCaption'),
      survival:    document.getElementById('mSurvival'),
      credit:      document.getElementById('mCredit'),
      savings:     document.getElementById('mSavings'),
      scholar:     document.getElementById('mScholar'),
      debt:        document.getElementById('mDebt'),
      debrief:     document.getElementById('debriefList'),
      leaderboard: document.getElementById('leaderboardList')
    };
  }

  goTo(name) {
    Object.entries(this.screens).forEach(([k, el]) => el.classList.toggle('hidden', k !== name));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleHowTo() { this.howto.classList.toggle('hidden'); }

  renderCharacterGrid(characters, selectedId, onSelect) {
    this.charGrid.innerHTML = '';
    characters.forEach(c => this.charGrid.appendChild(c.renderCard({ selected: c.id === selectedId, onSelect })));
    this.startBtn.disabled = !selectedId;
  }

  setGameHeader(character) {
    this.charLabel.textContent = `${character.emoji} ${character.name}`;
    this.charTitle.textContent = character.name;
  }

  updateHUD(player) {
    this.hud.cash.textContent   = `$${Math.round(player.cash).toLocaleString()}`;
    this.hud.credit.textContent = player.credit;
    this.hud.stress.textContent = player.stress;
    this.hud.stressBar.style.width = player.stress + '%';
    this.hud.debt.textContent   = `$${Math.round(player.debt).toLocaleString()}`;
    this.hud.coins.textContent  = player.coins;
  }

  updateWeekTicker(week, scholarCount) {
    this.weekTag.textContent     = `Week ${week} of ${UI.TOTAL_WEEKS}`;
    this.weekCounter.textContent = `Week ${week} of ${UI.TOTAL_WEEKS}`;
    this.scholarTag.textContent  = `🎯 Scholarships: ${scholarCount} found`;
  }

  renderEvent(event, onChoose) {
    event.renderCard(this.eventCard);
    event.renderChoices(this.choicesEl, onChoose);
  }

  renderEndScreen({ player, score, debrief }) {
    this.end.charTag.textContent = `${player.character.emoji} ${player.character.name}`;
    this.end.gpa.textContent     = score.gpa.toFixed(2);
    this.end.tier.innerHTML      = `${score.tier.emoji} ${score.tier.name}`;
    this.end.caption.textContent = score.tier.caption;

    this.end.survival.textContent = `$${Math.round(player.netWorth).toLocaleString()}`;
    this.end.credit.textContent   = (player.creditDelta >= 0 ? '+' : '') + player.creditDelta + ' pts';
    this.end.savings.textContent  = (player.savingsRate * 100).toFixed(1) + '%';
    this.end.scholar.textContent  = `${player.scholar} found`;
    this.end.debt.textContent     = `$${player.avoidedDebt.toLocaleString()}`;

    this.end.debrief.innerHTML = '';
    debrief.forEach(line => {
      const li = document.createElement('li');
      li.textContent = line;
      this.end.debrief.appendChild(li);
    });

    Leaderboard.render(this.end.leaderboard, score.gpa);
  }
}

// =========================================================
// Game — top-level orchestrator. Wires Player, UI, Deck, Logger.
// =========================================================
class Game {
  constructor() {
    this.ui = new UI();
    this.logger = new Logger(this.ui.logEl);
    this.characters = Character.all();
    this.deck = new EventDeck(EventCard.all());
    this.selectedCharId = null;
    this.player = null;

    this.bindActions();
    this.ui.goTo('title');
  }

  bindActions() {
    document.body.addEventListener('click', (e) => {
      const action = e.target.closest('[data-action]')?.dataset.action;
      if (!action) return;
      switch (action) {
        case 'start':         this.ui.goTo('select'); return this.refreshCharSelect();
        case 'toggleHowTo':   return this.ui.toggleHowTo();
        case 'backToTitle':   return this.ui.goTo('title');
        case 'beginSemester': return this.beginSemester();
        case 'playAgain':     return location.reload();
        case 'shareScore':    return this.shareScore();
      }
    });
    this.refreshCharSelect();
  }

  refreshCharSelect() {
    this.ui.renderCharacterGrid(this.characters, this.selectedCharId, (c) => {
      this.selectedCharId = c.id;
      this.refreshCharSelect();
    });
  }

  beginSemester() {
    const character = Character.byId(this.selectedCharId);
    if (!character) return;
    this.player = new Player(character);
    this.deck = new EventDeck(EventCard.all());
    this.logger.clear();
    this.ui.setGameHeader(character);
    this.logger.info(`Semester begins. Welcome, ${character.name}.`);
    this.ui.goTo('game');
    this.tickWeek();
  }

  tickWeek() {
    if (this.player.week > UI.TOTAL_WEEKS || this.player.isBankrupt) return this.endGame();

    const { earned, rent, burnedOut } = this.player.processWeeklyBudget();
    if (burnedOut) this.logger.bad('Burnout: you missed shifts this week. Income drops.');
    this.logger.info(`Week ${this.player.week}: Paycheck +$${earned}, Rent −$${rent}.`);

    this.ui.updateHUD(this.player);
    this.ui.updateWeekTicker(this.player.week, this.player.scholar);

    const event = this.deck.draw();
    this.ui.renderEvent(event, (evt, choice) => this.onChoice(evt, choice));
  }

  onChoice(event, choice) {
    const summary = this.player.applyEffect(choice.effect);
    const kind = Player.categorizeEffect(choice.effect);
    this.logger.write(kind, `${event.icon} ${choice.label} → ${summary}`);

    this.player.week += 1;
    this.ui.updateHUD(this.player);
    setTimeout(() => this.tickWeek(), 350);
  }

  endGame() {
    const score = ScoreCalculator.calculate(this.player);
    const debrief = ScoreCalculator.buildDebrief(this.player, score.gpa);
    this.ui.renderEndScreen({ player: this.player, score, debrief });
    this.ui.goTo('end');
  }

  shareScore() {
    const gpa = this.ui.end.gpa.textContent;
    const name = this.player?.character?.name || 'a student';
    const txt = `I scored ${gpa} Financial GPA as ${name} in Financial Survival Semester (EduCents)!`;
    navigator.clipboard?.writeText(txt);
    alert('Score copied to clipboard!\n\n' + txt);
  }
}

// =========================================================
// Bootstrap
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});