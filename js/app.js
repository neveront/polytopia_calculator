import { UNITS, TRIBES, getUnitById, TRIBE_OPTIONS, getUnitsForTribe, getUnitImage, getTribeName, getTribeIcon } from './units.js';
import { calculateCombat, simulateSequence, hasFortifySkill } from './engine.js';

// --- STATE MANAGEMENT ---
const state = {
  activeTab: 'skirmish',

  // 1v1 Skirmish State
  attacker: {
    tribeId: 'all',
    unitId: 'warrior',
    currentHp: 10,
    maxHp: 10,
    isVeteran: false,
    isRangedDistance: false,
  },
  defender: {
    tribeId: 'all',
    unitId: 'warrior',
    currentHp: 10,
    maxHp: 10,
    isVeteran: false,
    defenseBonusType: 'none',
    isPoisoned: false,
    isFrozen: false,
  },

  // Siege Planner State
  siege: {
    target: {
      tribeId: 'all',
      unitId: 'defender',
      currentHp: 15,
      maxHp: 15,
      isVeteran: false,
      defenseBonusType: 'wall',
      isPoisoned: false,
      isFrozen: false,
    },
    queue: [
      { id: '1', unitId: 'archer', currentHp: 10, maxHp: 10, attackDistance: 2 },
      { id: '2', unitId: 'catapult', currentHp: 10, maxHp: 10, attackDistance: 3 },
      { id: '3', unitId: 'rider', currentHp: 10, maxHp: 10, attackDistance: 1 },
      { id: '4', unitId: 'swordsman', currentHp: 15, maxHp: 15, attackDistance: 1 },
    ]
  },

  // Codex Search & Filter
  codex: {
    search: '',
    tribeFilter: 'all',
    tribeSkin: 'all',
  }
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initUnitDropdowns();
  initSkirmishEvents();
  initFormulaAccordion();
  initSiegeEvents();
  initCodexEvents();
  initMouseWheelControls();

  // Initial updates
  updateSkirmishUI();
  updateSiegeUI();
  renderCodex();
});

// --- TAB SWITCHING ---
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });
}

function switchTab(tabName) {
  state.activeTab = tabName;
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-tab') === tabName);
  });
  document.querySelectorAll('.view-section').forEach(sec => {
    sec.classList.remove('active');
  });
  const activeSec = document.getElementById(`${tabName}-view`);
  if (activeSec) activeSec.classList.add('active');

  if (tabName === 'matrix') {
    renderHitsToKillMatrix();
  }
}

// --- POPULATE DROPDOWNS ---
function populateTribeSelect(selectElem, selectedTribeId = 'all') {
  if (!selectElem) return;
  selectElem.innerHTML = '';
  
  const groups = ['All', 'Standard', 'Special'];
  groups.forEach(groupName => {
    const groupTribes = TRIBE_OPTIONS.filter(t => t.group === groupName);
    if (groupTribes.length === 0) return;
    
    const optgroup = document.createElement('optgroup');
    optgroup.label = groupName === 'All' ? 'General' : `${groupName} Tribes`;
    
    groupTribes.forEach(tribe => {
      const opt = document.createElement('option');
      opt.value = tribe.id;
      opt.textContent = tribe.name;
      if (tribe.id === selectedTribeId) opt.selected = true;
      optgroup.appendChild(opt);
    });
    
    selectElem.appendChild(optgroup);
  });
}

function populateUnitSelect(selectElem, tribeId = 'all', selectedUnitId = null) {
  if (!selectElem) return null;
  selectElem.innerHTML = '';
  const units = getUnitsForTribe(tribeId);

  const categories = [...new Set(units.map(u => u.category || 'General'))];
  
  let hasSelected = false;
  categories.forEach(cat => {
    const catUnits = units.filter(u => (u.category || 'General') === cat);
    if (catUnits.length === 0) return;

    const optgroup = document.createElement('optgroup');
    optgroup.label = cat;

    catUnits.forEach(unit => {
      const opt = document.createElement('option');
      opt.value = unit.id;
      opt.textContent = `${unit.name} (Atk ${unit.attack} / Def ${unit.defense})`;
      if (unit.id === selectedUnitId) {
        opt.selected = true;
        hasSelected = true;
      }
      optgroup.appendChild(opt);
    });

    selectElem.appendChild(optgroup);
  });

  if (!hasSelected && units.length > 0) {
    selectElem.value = units[0].id;
    return units[0];
  }
  return getUnitById(selectElem.value);
}

function initUnitDropdowns() {
  const atkTribeSelect = document.getElementById('attacker-tribe-select');
  const defTribeSelect = document.getElementById('defender-tribe-select');
  const siegeTribeSelect = document.getElementById('siege-target-tribe-select');

  const atkUnitSelect = document.getElementById('attacker-select');
  const defUnitSelect = document.getElementById('defender-select');
  const siegeUnitSelect = document.getElementById('siege-target-select');

  populateTribeSelect(atkTribeSelect, state.attacker.tribeId);
  populateTribeSelect(defTribeSelect, state.defender.tribeId);
  populateTribeSelect(siegeTribeSelect, state.siege.target.tribeId);
  const codexTribeSelect = document.getElementById('codex-tribe-select');
  if (codexTribeSelect) populateTribeSelect(codexTribeSelect, state.codex.tribeSkin || 'all');

  populateUnitSelect(atkUnitSelect, state.attacker.tribeId, state.attacker.unitId);
  populateUnitSelect(defUnitSelect, state.defender.tribeId, state.defender.unitId);
  populateUnitSelect(siegeUnitSelect, state.siege.target.tribeId, state.siege.target.unitId);
}

// --- 1V1 SKIRMISH LOGIC ---
function initSkirmishEvents() {
  const atkTribeSelect = document.getElementById('attacker-tribe-select');
  const defTribeSelect = document.getElementById('defender-tribe-select');
  const attackerSelect = document.getElementById('attacker-select');
  const defenderSelect = document.getElementById('defender-select');

  atkTribeSelect.addEventListener('change', (e) => {
    state.attacker.tribeId = e.target.value;
    const activeUnit = populateUnitSelect(attackerSelect, state.attacker.tribeId, state.attacker.unitId);
    state.attacker.unitId = activeUnit.id;
    state.attacker.isVeteran = false;
    state.attacker.maxHp = activeUnit.maxHp;
    state.attacker.currentHp = activeUnit.maxHp;
    state.attacker.isRangedDistance = activeUnit.range > 1;
    updateSkirmishUI();
  });

  defTribeSelect.addEventListener('change', (e) => {
    state.defender.tribeId = e.target.value;
    const activeUnit = populateUnitSelect(defenderSelect, state.defender.tribeId, state.defender.unitId);
    state.defender.unitId = activeUnit.id;
    state.defender.isVeteran = false;
    state.defender.maxHp = activeUnit.maxHp;
    state.defender.currentHp = activeUnit.maxHp;
    updateSkirmishUI();
  });

  attackerSelect.addEventListener('change', (e) => {
    const unit = getUnitById(e.target.value);
    state.attacker.unitId = unit.id;
    state.attacker.isVeteran = false;
    state.attacker.maxHp = unit.maxHp;
    state.attacker.currentHp = unit.maxHp;
    state.attacker.isRangedDistance = unit.range > 1;
    updateSkirmishUI();
  });

  defenderSelect.addEventListener('change', (e) => {
    const unit = getUnitById(e.target.value);
    state.defender.unitId = unit.id;
    state.defender.isVeteran = false;
    state.defender.maxHp = unit.maxHp;
    state.defender.currentHp = unit.maxHp;
    updateSkirmishUI();
  });

  // HP Sliders
  const atkSlider = document.getElementById('atk-hp-slider');
  const defSlider = document.getElementById('def-hp-slider');

  atkSlider.addEventListener('input', (e) => {
    state.attacker.currentHp = parseInt(e.target.value, 10);
    updateSkirmishUI();
  });

  defSlider.addEventListener('input', (e) => {
    state.defender.currentHp = parseInt(e.target.value, 10);
    updateSkirmishUI();
  });

  // Presets
  document.querySelectorAll('.preset-btn[data-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetKey = btn.getAttribute('data-target') === 'atk' ? 'attacker' : 'defender';
      const action = btn.getAttribute('data-action');
      const maxHp = state[targetKey].maxHp;

      if (action === 'full') {
        state[targetKey].currentHp = maxHp;
      } else if (action === 'minus1') {
        state[targetKey].currentHp = Math.max(1, state[targetKey].currentHp - 1);
      } else if (action === 'half') {
        state[targetKey].currentHp = Math.max(1, Math.ceil(maxHp / 2));
      } else if (action === 'one') {
        state[targetKey].currentHp = 1;
      }
      updateSkirmishUI();
    });
  });

  // Veteran Toggles
  const atkVeteranToggle = document.getElementById('atk-veteran-toggle');
  atkVeteranToggle.addEventListener('change', (e) => {
    state.attacker.isVeteran = e.target.checked;
    const baseUnit = getUnitById(state.attacker.unitId);
    state.attacker.maxHp = baseUnit.maxHp + (state.attacker.isVeteran ? 5 : 0);
    state.attacker.currentHp = Math.min(state.attacker.maxHp, state.attacker.currentHp + (state.attacker.isVeteran ? 5 : 0));
    updateSkirmishUI();
  });

  const defVeteranToggle = document.getElementById('def-veteran-toggle');
  defVeteranToggle.addEventListener('change', (e) => {
    state.defender.isVeteran = e.target.checked;
    const baseUnit = getUnitById(state.defender.unitId);
    state.defender.maxHp = baseUnit.maxHp + (state.defender.isVeteran ? 5 : 0);
    state.defender.currentHp = Math.min(state.defender.maxHp, state.defender.currentHp + (state.defender.isVeteran ? 5 : 0));
    updateSkirmishUI();
  });

  // Ranged Distance Toggle
  const atkDistanceToggle = document.getElementById('atk-distance-toggle');
  atkDistanceToggle.addEventListener('change', (e) => {
    state.attacker.isRangedDistance = e.target.checked;
    updateSkirmishUI();
  });

  // Defender Modifiers
  const defBonusSelect = document.getElementById('def-bonus-select');
  defBonusSelect.addEventListener('change', (e) => {
    state.defender.defenseBonusType = e.target.value;
    updateSkirmishUI();
  });

  const defPoisonToggle = document.getElementById('def-poison-toggle');
  defPoisonToggle.addEventListener('change', (e) => {
    state.defender.isPoisoned = e.target.checked;
    updateSkirmishUI();
  });

  const defFrozenToggle = document.getElementById('def-frozen-toggle');
  defFrozenToggle.addEventListener('change', (e) => {
    state.defender.isFrozen = e.target.checked;
    updateSkirmishUI();
  });

  // Swap Roles Button
  document.getElementById('swap-roles-btn').addEventListener('click', () => {
    const tempAttacker = { ...state.attacker };
    state.attacker = {
      tribeId: state.defender.tribeId,
      unitId: state.defender.unitId,
      currentHp: state.defender.currentHp,
      maxHp: state.defender.maxHp,
      isVeteran: state.defender.isVeteran,
      isRangedDistance: getUnitById(state.defender.unitId).range > 1,
    };
    state.defender = {
      tribeId: tempAttacker.tribeId,
      unitId: tempAttacker.unitId,
      currentHp: tempAttacker.currentHp,
      maxHp: tempAttacker.maxHp,
      isVeteran: tempAttacker.isVeteran,
      defenseBonusType: 'none',
      isPoisoned: false,
      isFrozen: false,
    };

    document.getElementById('attacker-tribe-select').value = state.attacker.tribeId;
    document.getElementById('defender-tribe-select').value = state.defender.tribeId;
    populateUnitSelect(document.getElementById('attacker-select'), state.attacker.tribeId, state.attacker.unitId);
    populateUnitSelect(document.getElementById('defender-select'), state.defender.tribeId, state.defender.unitId);
    updateSkirmishUI();
  });

  // Send to Siege Planner Button
  document.getElementById('send-to-siege-btn').addEventListener('click', () => {
    state.siege.target = { ...state.defender };
    const siegeTribeSelect = document.getElementById('siege-target-tribe-select');
    const siegeUnitSelect = document.getElementById('siege-target-select');
    if (siegeTribeSelect) siegeTribeSelect.value = state.siege.target.tribeId;
    populateUnitSelect(siegeUnitSelect, state.siege.target.tribeId, state.siege.target.unitId);
    updateSiegeUI();
    switchTab('siege');
  });
}

function updateSkirmishUI() {
  const atkUnit = getUnitById(state.attacker.unitId);
  const defUnit = getUnitById(state.defender.unitId);

  // --- ATTACKER CARD SYNC ---
  const atkImgUrl = getUnitImage(atkUnit, state.attacker.tribeId);
  document.getElementById('attacker-icon').innerHTML = `<img src="${atkImgUrl}" alt="${atkUnit.name}" onerror="this.onerror=null; this.src='assets/units/${atkUnit.id}.png';">`;
  const atkTribeLabel = state.attacker.tribeId !== 'all' ? getTribeName(state.attacker.tribeId) : atkUnit.tribe;
  const atkTribeIcon = getTribeIcon(state.attacker.tribeId);
  const atkTribeBadgeImg = document.getElementById('atk-tribe-badge-img');
  const atkTribeNameLabel = document.getElementById('atk-tribe-name-label');
  if (atkTribeBadgeImg) atkTribeBadgeImg.src = atkTribeIcon;
  if (atkTribeNameLabel) atkTribeNameLabel.textContent = atkTribeLabel;
  document.getElementById('atk-stat-attack').textContent = atkUnit.attack;
  document.getElementById('atk-stat-defense').textContent = atkUnit.defense;
  document.getElementById('atk-stat-range').textContent = atkUnit.range;
  document.getElementById('atk-stat-movement').textContent = atkUnit.movement;

  document.getElementById('atk-hp-current').textContent = state.attacker.currentHp;
  document.getElementById('atk-hp-max').textContent = state.attacker.maxHp;
  
  const atkSlider = document.getElementById('atk-hp-slider');
  atkSlider.max = state.attacker.maxHp;
  atkSlider.value = state.attacker.currentHp;

  const atkHpPct = Math.round((state.attacker.currentHp / state.attacker.maxHp) * 100);
  const atkHpBar = document.getElementById('atk-hp-bar');
  atkHpBar.style.width = `${atkHpPct}%`;
  atkHpBar.style.backgroundColor = getHpColor(atkHpPct);

  // Veteran toggle visibility
  const atkVetWrap = document.getElementById('atk-veteran-label');
  if (atkUnit.canBeVeteran) {
    atkVetWrap.style.display = 'flex';
    document.getElementById('atk-veteran-toggle').checked = state.attacker.isVeteran;
    atkVetWrap.classList.toggle('active', state.attacker.isVeteran);
  } else {
    atkVetWrap.style.display = 'none';
    state.attacker.isVeteran = false;
  }

  // Ranged toggle visibility
  const atkDistWrap = document.getElementById('atk-distance-label');
  if (atkUnit.range > 1) {
    atkDistWrap.style.display = 'flex';
    document.getElementById('atk-distance-toggle').checked = state.attacker.isRangedDistance;
    atkDistWrap.classList.toggle('active', state.attacker.isRangedDistance);
  } else {
    atkDistWrap.style.display = 'none';
    state.attacker.isRangedDistance = false;
  }

  // --- DEFENDER CARD SYNC ---
  const defImgUrl = getUnitImage(defUnit, state.defender.tribeId);
  document.getElementById('defender-icon').innerHTML = `<img src="${defImgUrl}" alt="${defUnit.name}" onerror="this.onerror=null; this.src='assets/units/${defUnit.id}.png';">`;
  const defTribeLabel = state.defender.tribeId !== 'all' ? getTribeName(state.defender.tribeId) : defUnit.tribe;
  const defTribeIcon = getTribeIcon(state.defender.tribeId);
  const defTribeBadgeImg = document.getElementById('def-tribe-badge-img');
  const defTribeNameLabel = document.getElementById('def-tribe-name-label');
  if (defTribeBadgeImg) defTribeBadgeImg.src = defTribeIcon;
  if (defTribeNameLabel) defTribeNameLabel.textContent = defTribeLabel;
  document.getElementById('def-stat-attack').textContent = defUnit.attack;
  document.getElementById('def-stat-defense').textContent = defUnit.defense;
  document.getElementById('def-stat-range').textContent = defUnit.range;
  document.getElementById('def-stat-movement').textContent = defUnit.movement;

  document.getElementById('def-hp-current').textContent = state.defender.currentHp;
  document.getElementById('def-hp-max').textContent = state.defender.maxHp;

  const defSlider = document.getElementById('def-hp-slider');
  defSlider.max = state.defender.maxHp;
  defSlider.value = state.defender.currentHp;

  const defHpPct = Math.round((state.defender.currentHp / state.defender.maxHp) * 100);
  const defHpBar = document.getElementById('def-hp-bar');
  defHpBar.style.width = `${defHpPct}%`;
  defHpBar.style.backgroundColor = getHpColor(defHpPct);

  // Veteran toggle
  const defVetWrap = document.getElementById('def-veteran-label');
  if (defUnit.canBeVeteran) {
    defVetWrap.style.display = 'flex';
    document.getElementById('def-veteran-toggle').checked = state.defender.isVeteran;
    defVetWrap.classList.toggle('active', state.defender.isVeteran);
  } else {
    defVetWrap.style.display = 'none';
    state.defender.isVeteran = false;
  }

  // Poison & Frozen
  document.getElementById('def-poison-toggle').checked = state.defender.isPoisoned;
  document.getElementById('def-poison-label').classList.toggle('active', state.defender.isPoisoned);

  document.getElementById('def-frozen-toggle').checked = state.defender.isFrozen;
  document.getElementById('def-frozen-label').classList.toggle('active', state.defender.isFrozen);

  // City wall warning if lacking Fortify
  const defBonusSelect = document.getElementById('def-bonus-select');
  defBonusSelect.value = state.defender.defenseBonusType;

  const wallWarning = document.getElementById('def-wall-warning');
  const unitFortified = hasFortifySkill(defUnit);
  if (state.defender.defenseBonusType === 'wall' && !unitFortified) {
    wallWarning.style.display = 'block';
  } else {
    wallWarning.style.display = 'none';
  }

  // --- RUN COMBAT ENGINE CALCULATION ---
  const distance = state.attacker.isRangedDistance ? atkUnit.range : 1;
  const combatResult = calculateCombat(
    {
      ...atkUnit,
      currentHp: state.attacker.currentHp,
      maxHp: state.attacker.maxHp,
    },
    {
      ...defUnit,
      currentHp: state.defender.currentHp,
      maxHp: state.defender.maxHp,
      defenseBonusType: state.defender.defenseBonusType,
      isPoisoned: state.defender.isPoisoned,
      isFrozen: state.defender.isFrozen,
    },
    { distance }
  );

  // Update Result Display
  const damageDealtEl = document.getElementById('res-damage-dealt');
  const retalDealtEl = document.getElementById('res-retal-dealt');
  const defenderHpEl = document.getElementById('res-defender-hp');
  const attackerHpEl = document.getElementById('res-attacker-hp');
  const retalNoteEl = document.getElementById('res-retaliation-note');
  const outcomeBadge = document.getElementById('outcome-badge');

  damageDealtEl.textContent = combatResult.attackerDamageDealt;
  retalDealtEl.textContent = combatResult.defenderRetaliationDealt;

  defenderHpEl.textContent = combatResult.defenderKilled
    ? 'Defender: 0 HP (ELIMINATED)'
    : `Defender: ${combatResult.defenderRemainingHp} HP remaining`;

  attackerHpEl.textContent = combatResult.attackerKilled
    ? 'Attacker: 0 HP (ELIMINATED)'
    : `Attacker: ${combatResult.attackerRemainingHp} HP remaining`;

  // Outcome status badge
  if (combatResult.defenderKilled) {
    outcomeBadge.className = 'outcome-status-badge status-kill';
    outcomeBadge.textContent = 'DEFENDER ELIMINATED';
  } else if (combatResult.attackerKilled) {
    outcomeBadge.className = 'outcome-status-badge status-counter-kill';
    outcomeBadge.textContent = 'ATTACKER KILLED BY RETALIATION';
  } else {
    outcomeBadge.className = 'outcome-status-badge status-survived';
    outcomeBadge.textContent = 'BOTH UNITS SURVIVED';
  }

  // Retaliation Note
  if (!combatResult.canRetaliate) {
    retalNoteEl.textContent = `No Counter-Attack: ${combatResult.retaliationReason}`;
  } else {
    retalNoteEl.textContent = `Defender retaliates with ${combatResult.defenderRetaliationDealt} damage`;
  }

  // Mathematical Formula Breakdown
  document.getElementById('math-atk-force').textContent = combatResult.stats.attackForce;
  document.getElementById('math-def-force').textContent = combatResult.stats.defenseForce;
  document.getElementById('math-total-force').textContent = combatResult.stats.totalForce;
  document.getElementById('math-def-bonus').textContent = `${combatResult.stats.effectiveDefenseBonus}x`;
}

// --- FORMULA ACCORDION ---
function initFormulaAccordion() {
  const toggle = document.getElementById('formula-toggle');
  const content = document.getElementById('formula-content');
  const arrow = document.getElementById('formula-arrow');

  toggle.addEventListener('click', () => {
    const isOpen = content.classList.contains('open');
    content.classList.toggle('open', !isOpen);
    arrow.textContent = isOpen ? '▼' : '▲';
  });
}

// --- SIEGE PLANNER LOGIC ---
function initSiegeEvents() {
  const siegeTribeSelect = document.getElementById('siege-target-tribe-select');
  const targetSelect = document.getElementById('siege-target-select');

  siegeTribeSelect?.addEventListener('change', (e) => {
    state.siege.target.tribeId = e.target.value;
    const activeUnit = populateUnitSelect(targetSelect, state.siege.target.tribeId, state.siege.target.unitId);
    state.siege.target.unitId = activeUnit.id;
    state.siege.target.maxHp = activeUnit.maxHp;
    state.siege.target.currentHp = activeUnit.maxHp;
    updateSiegeUI();
  });

  targetSelect.addEventListener('change', (e) => {
    const unit = getUnitById(e.target.value);
    state.siege.target.unitId = unit.id;
    state.siege.target.maxHp = unit.maxHp;
    state.siege.target.currentHp = unit.maxHp;
    updateSiegeUI();
  });

  const hpSlider = document.getElementById('siege-target-hp-slider');
  hpSlider.addEventListener('input', (e) => {
    state.siege.target.currentHp = parseInt(e.target.value, 10);
    updateSiegeUI();
  });

  const bonusSelect = document.getElementById('siege-target-bonus');
  bonusSelect.addEventListener('change', (e) => {
    state.siege.target.defenseBonusType = e.target.value;
    updateSiegeUI();
  });

  const poisonToggle = document.getElementById('siege-target-poison');
  poisonToggle.addEventListener('change', (e) => {
    state.siege.target.isPoisoned = e.target.checked;
    poisonToggle.closest('.toggle-pill').classList.toggle('active', e.target.checked);
    updateSiegeUI();
  });

  const frozenToggle = document.getElementById('siege-target-frozen');
  frozenToggle.addEventListener('change', (e) => {
    state.siege.target.isFrozen = e.target.checked;
    frozenToggle.closest('.toggle-pill').classList.toggle('active', e.target.checked);
    updateSiegeUI();
  });

  // Quick Add Buttons
  document.querySelectorAll('.quick-unit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const unitId = btn.getAttribute('data-unit');
      const unit = getUnitById(unitId);
      state.siege.queue.push({
        id: Math.random().toString(36).substr(2, 9),
        unitId: unit.id,
        currentHp: unit.maxHp,
        maxHp: unit.maxHp,
        attackDistance: unit.range > 1 ? unit.range : 1,
      });
      updateSiegeUI();
    });
  });

  // Clear Queue
  document.getElementById('clear-queue-btn').addEventListener('click', () => {
    state.siege.queue = [];
    updateSiegeUI();
  });

  // Auto Optimize Button
  document.getElementById('optimize-sequence-btn').addEventListener('click', () => {
    optimizeSiegeSequence();
  });
}

function updateSiegeUI() {
  const targetUnit = getUnitById(state.siege.target.unitId);
  const targetImgUrl = getUnitImage(targetUnit, state.siege.target.tribeId);
  document.getElementById('siege-target-icon').innerHTML = `<img src="${targetImgUrl}" alt="${targetUnit.name}" onerror="this.onerror=null; this.src='assets/units/${targetUnit.id}.png';">`;
  const targetTribeLabel = state.siege.target.tribeId !== 'all' ? getTribeName(state.siege.target.tribeId) : targetUnit.tribe;
  const targetTribeIcon = getTribeIcon(state.siege.target.tribeId);
  const targetTribeBadgeImg = document.getElementById('siege-tribe-badge-img');
  const targetTribeNameLabel = document.getElementById('siege-tribe-name-label');
  if (targetTribeBadgeImg) targetTribeBadgeImg.src = targetTribeIcon;
  if (targetTribeNameLabel) targetTribeNameLabel.textContent = targetTribeLabel;
  document.getElementById('siege-target-hp-cur').textContent = state.siege.target.currentHp;
  document.getElementById('siege-target-hp-max').textContent = state.siege.target.maxHp;

  const slider = document.getElementById('siege-target-hp-slider');
  slider.max = state.siege.target.maxHp;
  slider.value = state.siege.target.currentHp;

  const pct = Math.round((state.siege.target.currentHp / state.siege.target.maxHp) * 100);
  const bar = document.getElementById('siege-target-hp-bar');
  bar.style.width = `${pct}%`;
  bar.style.backgroundColor = getHpColor(pct);

  // Render Queue
  renderSiegeQueue();

  // Run Simulation
  const attackersToSimulate = state.siege.queue.map(q => {
    const base = getUnitById(q.unitId);
    return {
      ...base,
      ...q,
      currentHp: q.currentHp,
      maxHp: q.maxHp,
      attackDistance: q.attackDistance || 1,
    };
  });

  const simResult = simulateSequence(attackersToSimulate, {
    ...targetUnit,
    currentHp: state.siege.target.currentHp,
    maxHp: state.siege.target.maxHp,
    defenseBonusType: state.siege.target.defenseBonusType,
    isPoisoned: state.siege.target.isPoisoned,
    isFrozen: state.siege.target.isFrozen,
  });

  // Update Summary Metrics
  const targetStatusEl = document.getElementById('siege-summary-target-status');
  const targetRemainingHpEl = document.getElementById('siege-summary-remaining-hp');
  const lossesEl = document.getElementById('siege-summary-losses');
  const dmgTakenEl = document.getElementById('siege-summary-dmg-taken');

  if (simResult.targetEliminated) {
    targetStatusEl.textContent = 'ELIMINATED';
    targetStatusEl.style.color = '#86efac';
  } else {
    targetStatusEl.textContent = 'SURVIVED';
    targetStatusEl.style.color = '#d4d4d8';
  }

  targetRemainingHpEl.textContent = `${simResult.finalTargetHp} HP`;
  lossesEl.textContent = simResult.totalAttackerLosses;
  dmgTakenEl.textContent = `${simResult.totalAttackerDamageTaken} dmg`;

  // Render Steps
  renderSiegeSteps(simResult.steps);
}

function renderSiegeQueue() {
  const queueList = document.getElementById('siege-queue-list');
  queueList.innerHTML = '';

  if (state.siege.queue.length === 0) {
    queueList.innerHTML = `
      <div style="text-align: center; color: var(--text-dim); padding: 20px; font-size: 0.88rem;">
        Queue is empty. Click "+ Add" buttons above to build an assault wave!
      </div>
    `;
    return;
  }

  state.siege.queue.forEach((item, index) => {
    const unit = getUnitById(item.unitId);
    const itemImgUrl = getUnitImage(unit, item.tribeId || state.attacker.tribeId || 'all');
    const itemEl = document.createElement('div');
    itemEl.className = 'queue-item';

    itemEl.innerHTML = `
      <div class="queue-item-left">
        <div class="queue-index">${index + 1}</div>
        <div class="queue-unit-thumb-wrap" title="Scroll wheel to cycle unit" style="width: 48px; height: 48px; min-width: 48px; display: flex; align-items: center; justify-content: center; cursor: ns-resize;">
          <img src="${itemImgUrl}" alt="${unit.name}" class="unit-thumb-md" onerror="this.onerror=null; this.src='assets/units/${unit.id}.png';">
        </div>
        <div class="queue-unit-info">
          <div class="queue-unit-name">${unit.name}</div>
          <div class="queue-unit-hp-ctrl" title="Scroll wheel to adjust HP">
            <span>HP:</span>
            <input type="number" min="1" max="${unit.maxHp}" value="${item.currentHp}" 
                   style="width: 44px; background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border-color); border-radius: 4px; padding: 2px 4px; font-weight: 700; cursor: ns-resize;"
                   data-action="change-hp" data-index="${index}">
            <label style="margin-left: 8px; cursor: pointer; display: ${unit.range > 1 ? 'inline-flex' : 'none'}; align-items: center; gap: 4px;">
              <input type="checkbox" ${item.attackDistance > 1 ? 'checked' : ''} data-action="toggle-range" data-index="${index}">
              Ranged
            </label>
          </div>
        </div>
      </div>
      <div class="queue-actions">
        <button class="icon-btn" data-action="up" data-index="${index}" title="Move Up" ${index === 0 ? 'disabled style="opacity:0.3;"' : ''}>▲</button>
        <button class="icon-btn" data-action="down" data-index="${index}" title="Move Down" ${index === state.siege.queue.length - 1 ? 'disabled style="opacity:0.3;"' : ''}>▼</button>
        <button class="icon-btn btn-delete" data-action="delete" data-index="${index}" title="Remove">✕</button>
      </div>
    `;

    // Event listeners on queue items
    const hpInput = itemEl.querySelector('[data-action="change-hp"]');
    hpInput?.addEventListener('change', (e) => {
      const val = parseInt(e.target.value, 10);
      state.siege.queue[index].currentHp = Math.max(1, Math.min(unit.maxHp, isNaN(val) ? unit.maxHp : val));
      updateSiegeUI();
    });

    // Scroll wheel on HP
    const hpContainer = itemEl.querySelector('.queue-unit-hp-ctrl');
    hpContainer?.addEventListener('wheel', (e) => {
      e.preventDefault();
      const change = e.deltaY < 0 ? 1 : -1;
      const newHp = Math.max(1, Math.min(unit.maxHp, state.siege.queue[index].currentHp + change));
      if (newHp !== state.siege.queue[index].currentHp) {
        state.siege.queue[index].currentHp = newHp;
        updateSiegeUI();
      }
    }, { passive: false });

    // Scroll wheel to cycle unit in queue
    const thumbWrap = itemEl.querySelector('.queue-unit-thumb-wrap');
    thumbWrap?.addEventListener('wheel', (e) => {
      e.preventDefault();
      const change = e.deltaY > 0 ? 1 : -1;
      const nextUnit = cycleUnit(item.unitId, change);
      state.siege.queue[index].unitId = nextUnit.id;
      state.siege.queue[index].maxHp = nextUnit.maxHp;
      state.siege.queue[index].currentHp = nextUnit.maxHp;
      state.siege.queue[index].attackDistance = nextUnit.range > 1 ? nextUnit.range : 1;
      updateSiegeUI();
    }, { passive: false });

    itemEl.querySelector('[data-action="toggle-range"]')?.addEventListener('change', (e) => {
      state.siege.queue[index].attackDistance = e.target.checked ? unit.range : 1;
      updateSiegeUI();
    });

    itemEl.querySelector('[data-action="up"]')?.addEventListener('click', () => {
      if (index > 0) {
        const temp = state.siege.queue[index];
        state.siege.queue[index] = state.siege.queue[index - 1];
        state.siege.queue[index - 1] = temp;
        updateSiegeUI();
      }
    });

    itemEl.querySelector('[data-action="down"]')?.addEventListener('click', () => {
      if (index < state.siege.queue.length - 1) {
        const temp = state.siege.queue[index];
        state.siege.queue[index] = state.siege.queue[index + 1];
        state.siege.queue[index + 1] = temp;
        updateSiegeUI();
      }
    });

    itemEl.querySelector('[data-action="delete"]')?.addEventListener('click', () => {
      state.siege.queue.splice(index, 1);
      updateSiegeUI();
    });

    queueList.appendChild(itemEl);
  });
}

function renderSiegeSteps(steps) {
  const container = document.getElementById('siege-timeline-steps');
  container.innerHTML = '';

  if (steps.length === 0) {
    container.innerHTML = `<div style="font-size: 0.8rem; color: var(--text-dim);">No steps to simulate.</div>`;
    return;
  }

  steps.forEach(s => {
    const stepEl = document.createElement('div');
    stepEl.className = 'timeline-step';
    const stepAtkImg = getUnitImage(s.attacker, s.attacker.tribeId || state.attacker.tribeId || 'all');

    if (s.skipped) {
      stepEl.innerHTML = `
        <div class="step-badge" style="color: var(--text-dim); border-color: var(--border-color);">Step ${s.step}</div>
        <div class="step-desc" style="color: var(--text-dim);">
          <img src="${stepAtkImg}" alt="${s.attacker.name}" class="unit-thumb-sm" style="margin-right: 4px;" onerror="this.onerror=null; this.src='assets/units/${s.attacker.id}.png';"> <strong>${s.attacker.name}</strong> skipped — target is already defeated!
        </div>
      `;
    } else {
      const res = s.combatResult;
      const retalText = res.canRetaliate 
        ? `<span class="retal-tag">took ${res.defenderRetaliationDealt} retaliation</span> (attacker left with ${res.attackerRemainingHp} HP)` 
        : `<span style="color: var(--text-dim);">took 0 retaliation (${res.retaliationReason})</span>`;

      const fatalTag = res.attackerKilled 
        ? `<span style="color: #ef4444; font-weight: 800;">[ATTACKER LOST]</span>` 
        : '';

      const targetDiedTag = res.defenderKilled 
        ? `<span style="color: #22c55e; font-weight: 800;">[TARGET KILLED]</span>` 
        : `target left with <strong>${res.defenderRemainingHp} HP</strong>`;

      stepEl.innerHTML = `
        <div class="step-badge">Step ${s.step}</div>
        <div class="step-desc">
          <img src="${stepAtkImg}" alt="${s.attacker.name}" class="unit-thumb-sm" style="margin-right: 4px;" onerror="this.onerror=null; this.src='assets/units/${s.attacker.id}.png';"> <strong>${s.attacker.name}</strong> dealt <span class="dmg-tag">${res.attackerDamageDealt} dmg</span>, 
          ${retalText}. ${fatalTag} Target: ${targetDiedTag}.
        </div>
      `;
    }

    container.appendChild(stepEl);
  });
}

/**
 * Permutes assault queue to find the order that minimizes friendly casualties and damage.
 */
function optimizeSiegeSequence() {
  if (state.siege.queue.length <= 1) return;

  const targetUnit = getUnitById(state.siege.target.unitId);
  const targetConfig = {
    ...targetUnit,
    currentHp: state.siege.target.currentHp,
    maxHp: state.siege.target.maxHp,
    defenseBonusType: state.siege.target.defenseBonusType,
    isPoisoned: state.siege.target.isPoisoned,
    isFrozen: state.siege.target.isFrozen,
  };

  // Generate permutations (capped to 7 items for instant responsiveness)
  const items = [...state.siege.queue];
  const perms = getPermutations(items.slice(0, 7));

  let bestPerm = items;
  let bestScore = Infinity; // Lower score is better: casualties * 1000 + friendly damage taken - target damage dealt

  perms.forEach(perm => {
    const attackers = perm.map(q => ({
      ...getUnitById(q.unitId),
      ...q,
      currentHp: q.currentHp,
      maxHp: q.maxHp,
    }));

    const result = simulateSequence(attackers, targetConfig);
    // Score criteria: prioritize eliminating target, then minimize friendly losses, then minimize retaliation dmg
    let score = (result.totalAttackerLosses * 1000) + result.totalAttackerDamageTaken + (result.finalTargetHp * 20);
    if (!result.targetEliminated) {
      score += 5000;
    }

    if (score < bestScore) {
      bestScore = score;
      bestPerm = perm;
    }
  });

  state.siege.queue = bestPerm;
  updateSiegeUI();
}

function getPermutations(arr) {
  if (arr.length <= 1) return [arr];
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    const remaining = arr.slice(0, i).concat(arr.slice(i + 1));
    const remainingPerms = getPermutations(remaining);
    for (let p of remainingPerms) {
      result.push([current].concat(p));
    }
  }
  return result;
}

// --- HITS-TO-KILL MATRIX ---
function renderHitsToKillMatrix() {
  const targetUnit = getUnitById(state.defender.unitId);
  const matrixTargetName = document.getElementById('matrix-target-name');
  const matrixTargetBonus = document.getElementById('matrix-target-bonus');
  const tbody = document.getElementById('matrix-table-body');

  const defTribeText = state.defender.tribeId !== 'all' ? ` (${getTribeName(state.defender.tribeId)})` : '';
  matrixTargetName.textContent = `${targetUnit.name}${defTribeText} (${state.defender.currentHp} HP)`;
  matrixTargetBonus.textContent = state.defender.defenseBonusType === 'wall'
    ? 'City Wall (4.0x)'
    : state.defender.defenseBonusType === 'terrain'
    ? 'Terrain (1.5x)'
    : 'No Bonus (1.0x)';

  tbody.innerHTML = '';

  const defenderState = {
    ...targetUnit,
    currentHp: state.defender.currentHp,
    maxHp: state.defender.maxHp,
    defenseBonusType: state.defender.defenseBonusType,
    isPoisoned: state.defender.isPoisoned,
    isFrozen: state.defender.isFrozen,
  };

  // Test all offensive units
  const offensiveUnits = UNITS.filter(u => u.attack > 0);

  offensiveUnits.forEach(atk => {
    // 1st hit calculation (with target at current HP)
    const distance = atk.range > 1 ? atk.range : 1;
    const firstHit = calculateCombat(
      { ...atk, currentHp: atk.maxHp },
      defenderState,
      { distance }
    );

    // Cumulative simulation to find hits to kill
    let hitsNeeded = 0;
    let simTargetHp = defenderState.currentHp;
    let simAttackerHp = atk.maxHp;
    let attackerDiedInSim = false;

    for (let i = 1; i <= 20; i++) {
      hitsNeeded = i;
      const hit = calculateCombat(
        { ...atk, currentHp: simAttackerHp },
        { ...defenderState, currentHp: simTargetHp },
        { distance }
      );

      simTargetHp = hit.defenderRemainingHp;
      simAttackerHp = hit.attackerRemainingHp;
      if (hit.attackerKilled) attackerDiedInSim = true;

      if (simTargetHp <= 0) break;
    }

    const tr = document.createElement('tr');
    const badgeClass = hitsNeeded === 1 ? 'hits-1' : hitsNeeded <= 2 ? 'hits-2' : hitsNeeded <= 3 ? 'hits-3' : 'hits-high';
    const atkImgUrl = getUnitImage(atk, state.attacker.tribeId);
    const atkTribeDisplay = state.attacker.tribeId !== 'all' ? getTribeName(state.attacker.tribeId) : atk.tribe;

    tr.innerHTML = `
      <td><img src="${atkImgUrl}" alt="${atk.name}" class="unit-thumb-sm" style="margin-right: 6px;" onerror="this.onerror=null; this.src='assets/units/${atk.id}.png';"> <strong>${atk.name}</strong></td>
      <td style="color: var(--text-dim); font-size: 0.8rem;">${atkTribeDisplay}</td>
      <td>${atk.attack}</td>
      <td style="color: var(--color-attacker); font-weight: 800;">${firstHit.attackerDamageDealt} dmg</td>
      <td style="color: var(--color-defender);">${firstHit.canRetaliate ? `${firstHit.defenderRetaliationDealt} dmg` : '0 (Safe)'}</td>
      <td>${firstHit.attackerKilled ? '<span style="color: #ef4444; font-weight: 700;">No (Dies)</span>' : '<span style="color: #22c55e; font-weight: 700;">Yes</span>'}</td>
      <td><span class="hits-badge ${badgeClass}">${hitsNeeded} ${hitsNeeded === 1 ? 'Hit' : 'Hits'}</span></td>
    `;

    tbody.appendChild(tr);
  });
}

// --- UNIT CODEX ---
function initCodexEvents() {
  const searchInput = document.getElementById('codex-search');
  searchInput.addEventListener('input', (e) => {
    state.codex.search = e.target.value.toLowerCase().trim();
    renderCodex();
  });

  const codexTribeSelect = document.getElementById('codex-tribe-select');
  if (codexTribeSelect) {
    populateTribeSelect(codexTribeSelect, state.codex.tribeSkin || 'all');
    codexTribeSelect.addEventListener('change', (e) => {
      state.codex.tribeSkin = e.target.value;
      renderCodex();
    });
  }

  const filterPills = document.querySelectorAll('.filter-pill');
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.codex.tribeFilter = pill.getAttribute('data-filter');
      renderCodex();
    });
  });
}

function renderCodex() {
  const grid = document.getElementById('codex-grid');
  grid.innerHTML = '';

  const codexTribe = state.codex.tribeSkin || 'all';
  const codexTribeBadgeImg = document.getElementById('codex-tribe-badge-img');
  if (codexTribeBadgeImg) codexTribeBadgeImg.src = getTribeIcon(codexTribe);

  const filtered = UNITS.filter(u => {
    const matchesTribe = state.codex.tribeFilter === 'all' || u.tribe === state.codex.tribeFilter;
    const matchesSearch = state.codex.search === '' || 
      u.name.toLowerCase().includes(state.codex.search) ||
      u.tribe.toLowerCase().includes(state.codex.search) ||
      u.skills.some(s => s.toLowerCase().includes(state.codex.search));
    return matchesTribe && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-dim); padding: 40px;">No units match your search.</div>`;
    return;
  }

  filtered.forEach(unit => {
    const card = document.createElement('div');
    card.className = 'codex-card';

    const unitImg = getUnitImage(unit, codexTribe);

    const skillsHtml = unit.skills.length > 0 
      ? unit.skills.map(s => `<span class="skill-tag">${s}</span>`).join('') 
      : '<span class="skill-tag" style="opacity: 0.5;">None</span>';

    card.innerHTML = `
      <div class="codex-top">
        <div class="codex-icon"><img src="${unitImg}" alt="${unit.name}" onerror="this.onerror=null; this.src='assets/units/${unit.id}.png';"></div>
        <div>
          <div class="codex-name">${unit.name}</div>
          <div class="codex-tribe">${codexTribe !== 'all' ? getTribeName(codexTribe) : unit.tribe} • ${unit.category}</div>
        </div>
      </div>

      <div class="stat-chips-grid" style="margin-bottom: 8px;">
        <div class="stat-chip" title="Health"><div class="label"><img src="assets/icons/heart.svg" class="chip-svg" alt=""> HP</div><div class="val">${unit.hp}</div></div>
        <div class="stat-chip" title="Attack"><div class="label"><img src="assets/icons/attack.svg" class="chip-svg" alt=""> ATK</div><div class="val">${unit.attack}</div></div>
        <div class="stat-chip" title="Defense"><div class="label"><img src="assets/icons/defense.svg" class="chip-svg" alt=""> DEF</div><div class="val">${unit.defense}</div></div>
        <div class="stat-chip" title="Range"><div class="label"><img src="assets/icons/range.svg" class="chip-svg" alt=""> RNG</div><div class="val">${unit.range}</div></div>
      </div>

      <div class="skills-tags">
        ${skillsHtml}
      </div>

      <p style="font-size: 0.78rem; color: var(--text-muted); margin-top: auto; line-height: 1.4;">
        ${unit.description || ''}
      </p>
    `;

    grid.appendChild(card);
  });
}

// --- UTILITY HELPERS ---
function getHpColor(pct) {
  if (pct > 50) return 'var(--hp-green)';
  if (pct > 25) return 'var(--hp-yellow)';
  return 'var(--hp-red)';
}

// --- MOUSE WHEEL CONTROLS ---
function cycleUnit(currentUnitId, step, tribeId = 'all') {
  const availableUnits = getUnitsForTribe(tribeId);
  const currentIndex = availableUnits.findIndex(u => u.id === currentUnitId);
  if (currentIndex === -1) return availableUnits[0] || UNITS[0];
  const nextIndex = (currentIndex + step + availableUnits.length) % availableUnits.length;
  return availableUnits[nextIndex];
}

function cycleTribe(currentTribeId, step) {
  const currentIndex = TRIBE_OPTIONS.findIndex(t => t.id === currentTribeId);
  if (currentIndex === -1) return TRIBE_OPTIONS[0];
  const nextIndex = (currentIndex + step + TRIBE_OPTIONS.length) % TRIBE_OPTIONS.length;
  return TRIBE_OPTIONS[nextIndex];
}

function makeWheelStepHandler(onStep, threshold = 40) {
  let accumulator = 0;
  return function(e) {
    e.preventDefault();
    accumulator += e.deltaY;
    if (Math.abs(accumulator) >= threshold) {
      const step = accumulator > 0 ? 1 : -1;
      accumulator = 0;
      onStep(step);
    }
  };
}

function initMouseWheelControls() {
  const bonusOptions = ['none', 'terrain', 'wall'];

  // 1. Attacker Tribe Scroll
  const atkTribeSelect = document.getElementById('attacker-tribe-select');
  atkTribeSelect?.addEventListener('wheel', makeWheelStepHandler((step) => {
    const nextTribe = cycleTribe(state.attacker.tribeId, step);
    state.attacker.tribeId = nextTribe.id;
    atkTribeSelect.value = nextTribe.id;
    const activeUnit = populateUnitSelect(document.getElementById('attacker-select'), state.attacker.tribeId, state.attacker.unitId);
    state.attacker.unitId = activeUnit.id;
    state.attacker.isVeteran = false;
    state.attacker.maxHp = activeUnit.maxHp;
    state.attacker.currentHp = activeUnit.maxHp;
    state.attacker.isRangedDistance = activeUnit.range > 1;
    updateSkirmishUI();
  }, 40), { passive: false });

  // 2. Attacker Unit Scroll
  const attackerUnitElements = [
    document.getElementById('attacker-icon'),
    document.getElementById('attacker-select'),
    document.querySelector('.attacker-card .card-top-info')
  ];

  const onAttackerUnitWheel = makeWheelStepHandler((step) => {
    const nextUnit = cycleUnit(state.attacker.unitId, step, state.attacker.tribeId);
    state.attacker.unitId = nextUnit.id;
    state.attacker.isVeteran = false;
    state.attacker.maxHp = nextUnit.maxHp;
    state.attacker.currentHp = nextUnit.maxHp;
    state.attacker.isRangedDistance = nextUnit.range > 1;
    document.getElementById('attacker-select').value = nextUnit.id;
    updateSkirmishUI();
  }, 40);

  attackerUnitElements.forEach(el => {
    el?.addEventListener('wheel', onAttackerUnitWheel, { passive: false });
  });

  // 3. Attacker HP Scroll
  const attackerHpBox = document.querySelector('.attacker-card .hp-control-box');
  attackerHpBox?.addEventListener('wheel', makeWheelStepHandler((step) => {
    const change = step < 0 ? 1 : -1; // up = +1, down = -1
    const newHp = Math.max(1, Math.min(state.attacker.maxHp, state.attacker.currentHp + change));
    if (newHp !== state.attacker.currentHp) {
      state.attacker.currentHp = newHp;
      updateSkirmishUI();
    }
  }, 25), { passive: false });

  // 4. Defender Tribe Scroll
  const defTribeSelect = document.getElementById('defender-tribe-select');
  defTribeSelect?.addEventListener('wheel', makeWheelStepHandler((step) => {
    const nextTribe = cycleTribe(state.defender.tribeId, step);
    state.defender.tribeId = nextTribe.id;
    defTribeSelect.value = nextTribe.id;
    const activeUnit = populateUnitSelect(document.getElementById('defender-select'), state.defender.tribeId, state.defender.unitId);
    state.defender.unitId = activeUnit.id;
    state.defender.isVeteran = false;
    state.defender.maxHp = activeUnit.maxHp;
    state.defender.currentHp = activeUnit.maxHp;
    updateSkirmishUI();
  }, 40), { passive: false });

  // 5. Defender Unit Scroll
  const defenderUnitElements = [
    document.getElementById('defender-icon'),
    document.getElementById('defender-select'),
    document.querySelector('.defender-card .card-top-info')
  ];

  const onDefenderUnitWheel = makeWheelStepHandler((step) => {
    const nextUnit = cycleUnit(state.defender.unitId, step, state.defender.tribeId);
    state.defender.unitId = nextUnit.id;
    state.defender.isVeteran = false;
    state.defender.maxHp = nextUnit.maxHp;
    state.defender.currentHp = nextUnit.maxHp;
    document.getElementById('defender-select').value = nextUnit.id;
    updateSkirmishUI();
  }, 40);

  defenderUnitElements.forEach(el => {
    el?.addEventListener('wheel', onDefenderUnitWheel, { passive: false });
  });

  // 6. Defender HP Scroll
  const defenderHpBox = document.querySelector('.defender-card .hp-control-box');
  defenderHpBox?.addEventListener('wheel', makeWheelStepHandler((step) => {
    const change = step < 0 ? 1 : -1;
    const newHp = Math.max(1, Math.min(state.defender.maxHp, state.defender.currentHp + change));
    if (newHp !== state.defender.currentHp) {
      state.defender.currentHp = newHp;
      updateSkirmishUI();
    }
  }, 25), { passive: false });

  // 7. Defender Defense Bonus Scroll
  const defBonusElem = document.getElementById('def-bonus-select');
  defBonusElem?.addEventListener('wheel', makeWheelStepHandler((step) => {
    const currentIdx = bonusOptions.indexOf(state.defender.defenseBonusType);
    const nextIdx = (currentIdx + step + bonusOptions.length) % bonusOptions.length;
    state.defender.defenseBonusType = bonusOptions[nextIdx];
    defBonusElem.value = state.defender.defenseBonusType;
    updateSkirmishUI();
  }, 35), { passive: false });

  // 8. Siege Target Tribe Scroll
  const siegeTribeSelect = document.getElementById('siege-target-tribe-select');
  siegeTribeSelect?.addEventListener('wheel', makeWheelStepHandler((step) => {
    const nextTribe = cycleTribe(state.siege.target.tribeId, step);
    state.siege.target.tribeId = nextTribe.id;
    siegeTribeSelect.value = nextTribe.id;
    const activeUnit = populateUnitSelect(document.getElementById('siege-target-select'), state.siege.target.tribeId, state.siege.target.unitId);
    state.siege.target.unitId = activeUnit.id;
    state.siege.target.maxHp = activeUnit.maxHp;
    state.siege.target.currentHp = activeUnit.maxHp;
    updateSiegeUI();
  }, 40), { passive: false });

  // 9. Siege Target Unit Scroll
  const siegeTargetElements = [
    document.getElementById('siege-target-icon'),
    document.getElementById('siege-target-select'),
    document.querySelector('.siege-target-card .card-top-info')
  ];

  const onSiegeTargetWheel = makeWheelStepHandler((step) => {
    const nextUnit = cycleUnit(state.siege.target.unitId, step, state.siege.target.tribeId);
    state.siege.target.unitId = nextUnit.id;
    state.siege.target.maxHp = nextUnit.maxHp;
    state.siege.target.currentHp = nextUnit.maxHp;
    document.getElementById('siege-target-select').value = nextUnit.id;
    updateSiegeUI();
  }, 40);

  siegeTargetElements.forEach(el => {
    el?.addEventListener('wheel', onSiegeTargetWheel, { passive: false });
  });

  // 10. Siege Target HP Scroll
  const siegeHpBox = document.querySelector('.siege-target-card .hp-control-box');
  siegeHpBox?.addEventListener('wheel', makeWheelStepHandler((step) => {
    const change = step < 0 ? 1 : -1;
    const newHp = Math.max(1, Math.min(state.siege.target.maxHp, state.siege.target.currentHp + change));
    if (newHp !== state.siege.target.currentHp) {
      state.siege.target.currentHp = newHp;
      updateSiegeUI();
    }
  }, 25), { passive: false });

  // 11. Siege Target Defense Bonus Scroll
  const siegeBonusElem = document.getElementById('siege-target-bonus');
  siegeBonusElem?.addEventListener('wheel', makeWheelStepHandler((step) => {
    const currentIdx = bonusOptions.indexOf(state.siege.target.defenseBonusType);
    const nextIdx = (currentIdx + step + bonusOptions.length) % bonusOptions.length;
    state.siege.target.defenseBonusType = bonusOptions[nextIdx];
    siegeBonusElem.value = state.siege.target.defenseBonusType;
    updateSiegeUI();
  }, 35), { passive: false });
}
