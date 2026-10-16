/**
 * Polytopia Units Database
 * Includes all standard units, Naval Rework units, and Special Tribes (Cymanti, Elyrion, Polaris, Aquarion).
 */

export const TRIBES = {
  STANDARD: 'Standard Tribes',
  NAVAL: 'Naval (Ocean Update)',
  CYMANTI: 'Cymanti',
  ELYRION: '∑∫ỹriȱŋ',
  POLARIS: 'Polaris',
  AQUARION: 'Aquarion',
};

export const UNITS = [
  // --- STANDARD LAND UNITS ---
  {
    id: 'warrior',
    name: 'Warrior',
    tribe: TRIBES.STANDARD,
    category: 'Land',
    hp: 10,
    maxHp: 10,
    attack: 2,
    defense: 2,
    movement: 1,
    range: 1,
    cost: 2,
    skills: ['Dash', 'Fortify'],
    canBeVeteran: true,
    image: 'assets/units/warrior.png',
    description: 'Basic frontline infantry with balanced attack and defense.'
  },
  {
    id: 'rider',
    name: 'Rider',
    tribe: TRIBES.STANDARD,
    category: 'Land',
    hp: 10,
    maxHp: 10,
    attack: 2,
    defense: 1,
    movement: 2,
    range: 1,
    cost: 3,
    skills: ['Dash', 'Escape'],
    canBeVeteran: true,
    image: 'assets/units/rider.png',
    description: 'Fast cavalry that can hit and move away safely.'
  },
  {
    id: 'archer',
    name: 'Archer',
    tribe: TRIBES.STANDARD,
    category: 'Land',
    hp: 10,
    maxHp: 10,
    attack: 2,
    defense: 1,
    movement: 1,
    range: 2,
    cost: 3,
    skills: ['Dash', 'Fortify'],
    canBeVeteran: true,
    image: 'assets/units/archer.png',
    description: 'Ranged unit capable of firing from 2 tiles away without taking retaliation.'
  },
  {
    id: 'defender',
    name: 'Defender',
    tribe: TRIBES.STANDARD,
    category: 'Land',
    hp: 15,
    maxHp: 15,
    attack: 1,
    defense: 3,
    movement: 1,
    range: 1,
    cost: 3,
    skills: ['Fortify'],
    canBeVeteran: true,
    image: 'assets/units/defender.png',
    description: 'High health and defense shield-bearer. Formidable inside city walls.'
  },
  {
    id: 'swordsman',
    name: 'Swordsman',
    tribe: TRIBES.STANDARD,
    category: 'Land',
    hp: 15,
    maxHp: 15,
    attack: 3,
    defense: 3,
    movement: 1,
    range: 1,
    cost: 5,
    skills: ['Dash', 'Fortify'],
    canBeVeteran: true,
    image: 'assets/units/swordsman.png',
    description: 'Heavy shock troop with 3 attack and 3 defense.'
  },
  {
    id: 'catapult',
    name: 'Catapult',
    tribe: TRIBES.STANDARD,
    category: 'Land',
    hp: 10,
    maxHp: 10,
    attack: 4,
    defense: 0,
    movement: 1,
    range: 3,
    cost: 8,
    skills: [],
    canBeVeteran: true,
    image: 'assets/units/catapult.png',
    description: 'Devastating siege engine with range 3. Dies easily if exposed.'
  },
  {
    id: 'knight',
    name: 'Knight',
    tribe: TRIBES.STANDARD,
    category: 'Land',
    hp: 10,
    maxHp: 10,
    attack: 3.5,
    defense: 1,
    movement: 3,
    range: 1,
    cost: 8,
    skills: ['Dash', 'Escape', 'Persist'],
    canBeVeteran: true,
    image: 'assets/units/knight.png',
    description: 'Devastating shock cavalry with Persist, chaining kills across multiple weak units.'
  },
  {
    id: 'mind_bender',
    name: 'Mind Bender',
    tribe: TRIBES.STANDARD,
    category: 'Support',
    hp: 10,
    maxHp: 10,
    attack: 0,
    defense: 1,
    movement: 1,
    range: 1,
    cost: 5,
    skills: ['Heal', 'Convert'],
    canBeVeteran: false,
    image: 'assets/units/mind_bender.png',
    description: 'Heals adjacent allies or converts adjacent enemy units.'
  },
  {
    id: 'cloak',
    name: 'Cloak',
    tribe: TRIBES.STANDARD,
    category: 'Infiltrator',
    hp: 10,
    maxHp: 10,
    attack: 0,
    defense: 0.5,
    movement: 2,
    range: 1,
    cost: 8,
    skills: ['Infiltrate', 'Stealth'],
    canBeVeteran: false,
    image: 'assets/units/cloak.png',
    description: 'Invisible spy that infiltrates enemy cities to spawn Daggers.'
  },
  {
    id: 'dagger',
    name: 'Dagger',
    tribe: TRIBES.STANDARD,
    category: 'Land',
    hp: 10,
    maxHp: 10,
    attack: 2,
    defense: 2,
    movement: 2,
    range: 1,
    cost: 0,
    skills: ['Dash', 'Surprise'],
    canBeVeteran: true,
    image: 'assets/units/dagger.png',
    description: 'Insurgent fighter spawned around an infiltrated city.'
  },
  {
    id: 'giant',
    name: 'Giant',
    tribe: TRIBES.STANDARD,
    category: 'Super Unit',
    hp: 40,
    maxHp: 40,
    attack: 5,
    defense: 4,
    movement: 1,
    range: 1,
    cost: 0,
    skills: [],
    canBeVeteran: false,
    image: 'assets/units/giant.png',
    description: 'Massive 40 HP behemoth. Does not get City Wall defense bonuses.'
  },

  // --- NAVAL REWORK (PATH OF THE OCEAN) ---
  {
    id: 'raft',
    name: 'Raft',
    tribe: TRIBES.NAVAL,
    category: 'Naval',
    hp: 10,
    maxHp: 10,
    attack: 0,
    defense: 1,
    movement: 2,
    range: 1,
    cost: 0,
    skills: [],
    canBeVeteran: false,
    image: 'assets/units/raft.png',
    description: 'Unarmed transport raft.'
  },
  {
    id: 'scout',
    name: 'Scout',
    tribe: TRIBES.NAVAL,
    category: 'Naval',
    hp: 10,
    maxHp: 10,
    attack: 2,
    defense: 1,
    movement: 3,
    range: 2,
    cost: 5,
    skills: ['Dash'],
    canBeVeteran: false,
    image: 'assets/units/scout.png',
    description: 'Fast, agile naval skirmisher with range 2.'
  },
  {
    id: 'rammer',
    name: 'Rammer',
    tribe: TRIBES.NAVAL,
    category: 'Naval',
    hp: 10,
    maxHp: 10,
    attack: 3,
    defense: 3,
    movement: 3,
    range: 1,
    cost: 8,
    skills: ['Dash'],
    canBeVeteran: false,
    image: 'assets/units/rammer.png',
    description: 'Sturdy frontline warship designed to ram enemy ships.'
  },
  {
    id: 'bomber',
    name: 'Bomber',
    tribe: TRIBES.NAVAL,
    category: 'Naval',
    hp: 10,
    maxHp: 10,
    attack: 3,
    defense: 2,
    movement: 2,
    range: 3,
    cost: 15,
    skills: ['Splash'],
    canBeVeteran: false,
    image: 'assets/units/bomber.png',
    description: 'Long-range naval artillery with area splash damage.'
  },
  {
    id: 'juggernaut',
    name: 'Juggernaut',
    tribe: TRIBES.NAVAL,
    category: 'Super Naval',
    hp: 40,
    maxHp: 40,
    attack: 4,
    defense: 4,
    movement: 2,
    range: 1,
    cost: 0,
    skills: ['Dash', 'Splash'],
    canBeVeteran: false,
    image: 'assets/units/juggernaut.png',
    description: 'Giant-embarked dreadnought dominating the high seas.'
  },

  // --- CYMANTI ---
  {
    id: 'shaman',
    name: 'Shaman',
    tribe: TRIBES.CYMANTI,
    category: 'Support',
    hp: 10,
    maxHp: 10,
    attack: 1,
    defense: 1,
    movement: 1,
    range: 1,
    cost: 3,
    skills: ['Convert', 'Swarm'],
    canBeVeteran: false,
    image: 'assets/units/shaman.png',
    description: 'Cymanti mystical leader that can Swarm friendly units and convert foes.'
  },
  {
    id: 'hexapod',
    name: 'Hexapod',
    tribe: TRIBES.CYMANTI,
    category: 'Land',
    hp: 5,
    maxHp: 5,
    attack: 3,
    defense: 1,
    movement: 2,
    range: 1,
    cost: 3,
    skills: ['Sneak', 'Creep', 'Escape'],
    canBeVeteran: true,
    image: 'assets/units/hexapod.png',
    description: 'Fragile glass cannon with high speed and escape ability.'
  },
  {
    id: 'kiton',
    name: 'Kiton',
    tribe: TRIBES.CYMANTI,
    category: 'Land',
    hp: 15,
    maxHp: 15,
    attack: 1,
    defense: 3,
    movement: 1,
    range: 1,
    cost: 3,
    skills: ['Poison', 'Fortify'],
    canBeVeteran: true,
    image: 'assets/units/kiton.png',
    description: 'Poisonous tank with Fortify and strong defensive counter.'
  },
  {
    id: 'phychi',
    name: 'Phychi',
    tribe: TRIBES.CYMANTI,
    category: 'Flying',
    hp: 5,
    maxHp: 5,
    attack: 1.5,
    defense: 1,
    movement: 1,
    range: 2,
    cost: 3,
    skills: ['Flying', 'Poison'],
    canBeVeteran: true,
    image: 'assets/units/phychi.png',
    description: 'Flying ranged bug that inflicts poison from safety.'
  },
  {
    id: 'exis',
    name: 'Exida',
    tribe: TRIBES.CYMANTI,
    category: 'Land',
    hp: 10,
    maxHp: 10,
    attack: 3,
    defense: 0,
    movement: 1,
    range: 3,
    cost: 8,
    skills: ['Creep', 'Poison'],
    canBeVeteran: true,
    image: 'assets/units/exida.png',
    description: 'Cymanti artillery crawler that launches poison-filled spore bombs from range.'
  },
  {
    id: 'raychi',
    name: 'Raychi',
    tribe: TRIBES.CYMANTI,
    category: 'Naval',
    hp: 15,
    maxHp: 15,
    attack: 3,
    defense: 2,
    movement: 3,
    range: 1,
    cost: 8,
    skills: ['Explode', 'Water'],
    canBeVeteran: true,
    image: 'assets/units/raychi.png',
    description: 'Aquatic Cymanti creature that can explode into algae and poison.'
  },
  {
    id: 'doomux',
    name: 'Doomux',
    tribe: TRIBES.CYMANTI,
    category: 'Land',
    hp: 20,
    maxHp: 20,
    attack: 4,
    defense: 2,
    movement: 3,
    range: 1,
    cost: 10,
    skills: ['Explode', 'Creep'],
    canBeVeteran: true,
    image: 'assets/units/doomux.png',
    description: 'High-damage monstrous insect that can explode upon death.'
  },
  {
    id: 'centipede',
    name: 'Centipede',
    tribe: TRIBES.CYMANTI,
    category: 'Super Unit',
    hp: 20,
    maxHp: 20,
    attack: 4,
    defense: 3,
    movement: 2,
    range: 1,
    cost: 0,
    skills: ['Creep', 'Eat'],
    canBeVeteran: false,
    image: 'assets/units/centipede.png',
    description: 'Super unit that grows new Segments whenever it kills an enemy.'
  },
  {
    id: 'segment',
    name: 'Segment',
    tribe: TRIBES.CYMANTI,
    category: 'Super Unit',
    hp: 10,
    maxHp: 10,
    attack: 2,
    defense: 2,
    movement: 2,
    range: 1,
    cost: 0,
    skills: ['Creep', 'Poison'],
    canBeVeteran: false,
    image: 'assets/units/segment.png',
    description: 'Trailing segment spawned behind a Centipede.'
  },

  // --- ∑∫ỸRIȱŊ ---
  {
    id: 'polytaur',
    name: 'Polytaur',
    tribe: TRIBES.ELYRION,
    category: 'Land',
    hp: 15,
    maxHp: 15,
    attack: 3,
    defense: 1,
    movement: 1,
    range: 1,
    cost: 2,
    skills: ['Dash'],
    canBeVeteran: false,
    image: 'assets/units/polytaur.png',
    description: 'Enchanted forest beast with high attack and health.'
  },
  {
    id: 'baby_dragon',
    name: 'Baby Dragon',
    tribe: TRIBES.ELYRION,
    category: 'Flying',
    hp: 15,
    maxHp: 15,
    attack: 3,
    defense: 3,
    movement: 2,
    range: 1,
    cost: 0,
    skills: ['Flying'],
    canBeVeteran: false,
    image: 'assets/units/baby_dragon.png',
    description: 'Young dragon growing towards adulthood.'
  },
  {
    id: 'fire_dragon',
    name: 'Fire Dragon',
    tribe: TRIBES.ELYRION,
    category: 'Super Unit',
    hp: 20,
    maxHp: 20,
    attack: 4,
    defense: 3,
    movement: 3,
    range: 2,
    cost: 0,
    skills: ['Flying', 'Splash'],
    canBeVeteran: false,
    image: 'assets/units/fire_dragon.png',
    description: 'Majestic flying super-unit with range 2 splash attacks.'
  },

  // --- POLARIS ---
  {
    id: 'mooni',
    name: 'Mooni',
    tribe: TRIBES.POLARIS,
    category: 'Support',
    hp: 10,
    maxHp: 10,
    attack: 0,
    defense: 1,
    movement: 1,
    range: 1,
    cost: 3,
    skills: ['Freeze', 'Auto-Freeze'],
    canBeVeteran: false,
    image: 'assets/units/mooni.png',
    description: 'Spreads ice and freezes nearby enemies.'
  },
  {
    id: 'battle_sled',
    name: 'Battle Sled',
    tribe: TRIBES.POLARIS,
    category: 'Land',
    hp: 15,
    maxHp: 15,
    attack: 3,
    defense: 2,
    movement: 2,
    range: 1,
    cost: 5,
    skills: ['Escape'],
    canBeVeteran: true,
    image: 'assets/units/battle_sled.png',
    description: 'Fast ice skater that speeds across frozen terrain.'
  },
  {
    id: 'ice_archer',
    name: 'Ice Archer',
    tribe: TRIBES.POLARIS,
    category: 'Land',
    hp: 10,
    maxHp: 10,
    attack: 0.1,
    defense: 1,
    movement: 1,
    range: 2,
    cost: 3,
    skills: ['Freeze'],
    canBeVeteran: true,
    image: 'assets/units/ice_archer.png',
    description: 'Freezes target from range, shutting down enemy retaliation.'
  },
  {
    id: 'ice_fortress',
    name: 'Ice Fortress',
    tribe: TRIBES.POLARIS,
    category: 'Land',
    hp: 20,
    maxHp: 20,
    attack: 4,
    defense: 3,
    movement: 2,
    range: 2,
    cost: 8,
    skills: [],
    canBeVeteran: true,
    image: 'assets/units/ice_fortress.png',
    description: 'Heavy armored ranged fortress.'
  },
  {
    id: 'gaami',
    name: 'Gaami',
    tribe: TRIBES.POLARIS,
    category: 'Super Unit',
    hp: 30,
    maxHp: 30,
    attack: 4,
    defense: 4,
    movement: 2,
    range: 1,
    cost: 0,
    skills: ['Auto-Freeze'],
    canBeVeteran: false,
    image: 'assets/units/gaami.png',
    description: 'Polaris avatar that automatically freezes surrounding tiles.'
  },

  // --- AQUARION ---
  {
    id: 'amphibian',
    name: 'Amphibian',
    tribe: TRIBES.AQUARION,
    category: 'Amphibious',
    hp: 10,
    maxHp: 10,
    attack: 2,
    defense: 1,
    movement: 2,
    range: 1,
    cost: 3,
    skills: ['Dash', 'Escape', 'Amphibious'],
    canBeVeteran: true,
    image: 'assets/units/amphibian.png',
    description: 'Fast amphibious scout capable of navigating flooded land.'
  },
  {
    id: 'tridention',
    name: 'Tridention',
    tribe: TRIBES.AQUARION,
    category: 'Amphibious',
    hp: 10,
    maxHp: 10,
    attack: 2.5,
    defense: 1,
    movement: 2,
    range: 2,
    cost: 8,
    skills: ['Persist', 'Amphibious'],
    canBeVeteran: true,
    image: 'assets/units/tridention.png',
    description: 'Ranged triton with Persist, chaining kills from afar.'
  },
  {
    id: 'shark',
    name: 'Shark',
    tribe: TRIBES.AQUARION,
    category: 'Naval',
    hp: 15,
    maxHp: 15,
    attack: 3,
    defense: 2,
    movement: 3,
    range: 1,
    cost: 5,
    skills: ['Dash', 'Surprise'],
    canBeVeteran: true,
    image: 'assets/units/shark.png',
    description: 'Fast and fierce sea predator with 15 HP.'
  },
  {
    id: 'puffer',
    name: 'Puffer',
    tribe: TRIBES.AQUARION,
    category: 'Amphibious',
    hp: 10,
    maxHp: 10,
    attack: 4,
    defense: 0,
    movement: 2,
    range: 3,
    cost: 8,
    skills: ['Drench', 'Creep'],
    canBeVeteran: true,
    image: 'assets/units/puffer.png',
    description: 'Aquarion siege artillery with 2 movement and terrain flooding.'
  },
  {
    id: 'yelly_belly',
    name: 'Jelly',
    tribe: TRIBES.AQUARION,
    category: 'Amphibious',
    hp: 15,
    maxHp: 15,
    attack: 3,
    defense: 2,
    movement: 2,
    range: 3,
    cost: 12,
    skills: ['Splash', 'Creep'],
    canBeVeteran: false,
    image: 'assets/units/yelly_belly.png',
    description: 'Floats across water and flooded land delivering AoE tentacle strikes.'
  },
  {
    id: 'crab',
    name: 'Crab',
    tribe: TRIBES.AQUARION,
    category: 'Super Unit',
    hp: 40,
    maxHp: 40,
    attack: 4,
    defense: 4,
    movement: 1,
    range: 1,
    cost: 0,
    skills: ['Creep', 'Auto-Flood'],
    canBeVeteran: false,
    image: 'assets/units/crab.png',
    description: 'Colossal amphibious crustacean super unit.'
  }
];

export function getUnitById(id) {
  return UNITS.find(u => u.id === id) || UNITS[0];
}

export const TRIBE_OPTIONS = [
  { id: 'all', name: 'All Tribes (Any Unit)', group: 'All', icon: 'assets/icons/star.png' },
  // Regular Tribes
  { id: 'imperius', name: 'Imperius', group: 'Standard', icon: 'assets/icons/tribes/imperius.png' },
  { id: 'bardur', name: 'Bardur', group: 'Standard', icon: 'assets/icons/tribes/bardur.png' },
  { id: 'xin_xi', name: 'Xin-xi', group: 'Standard', icon: 'assets/icons/tribes/xin_xi.png' },
  { id: 'oumaji', name: 'Oumaji', group: 'Standard', icon: 'assets/icons/tribes/oumaji.png' },
  { id: 'kickoo', name: 'Kickoo', group: 'Standard', icon: 'assets/icons/tribes/kickoo.png' },
  { id: 'hoodrick', name: 'Hoodrick', group: 'Standard', icon: 'assets/icons/tribes/hoodrick.png' },
  { id: 'luxidoor', name: 'Luxidoor', group: 'Standard', icon: 'assets/icons/tribes/luxidoor.png' },
  { id: 'vengir', name: 'Vengir', group: 'Standard', icon: 'assets/icons/tribes/vengir.png' },
  { id: 'zebasi', name: 'Zebasi', group: 'Standard', icon: 'assets/icons/tribes/zebasi.png' },
  { id: 'ai_mo', name: 'Ai-Mo', group: 'Standard', icon: 'assets/icons/tribes/ai_mo.png' },
  { id: 'quetzali', name: 'Quetzali', group: 'Standard', icon: 'assets/icons/tribes/quetzali.png' },
  { id: 'yadakk', name: 'Yădakk', group: 'Standard', icon: 'assets/icons/tribes/yadakk.png' },
  // Special Tribes
  { id: 'cymanti', name: 'Cymanti', group: 'Special', icon: 'assets/icons/tribes/cymanti.png' },
  { id: 'elyrion', name: '∑∫ỹriȱŋ', group: 'Special', icon: 'assets/icons/tribes/elyrion.png' },
  { id: 'polaris', name: 'Polaris', group: 'Special', icon: 'assets/icons/tribes/polaris.png' },
  { id: 'aquarion', name: 'Aquarion', group: 'Special', icon: 'assets/icons/tribes/aquarion.png' },
];

export function getTribeIcon(tribeId) {
  const tribe = TRIBE_OPTIONS.find(t => t.id === tribeId);
  return tribe && tribe.icon ? tribe.icon : 'assets/icons/star.png';
}

const STANDARD_UNIT_IDS = [
  'warrior', 'rider', 'archer', 'defender', 'swordsman',
  'catapult', 'knight', 'mind_bender', 'cloak', 'dagger', 'giant',
  'raft', 'scout', 'rammer', 'bomber', 'juggernaut'
];

const CYMANTI_UNIT_IDS = [
  'shaman', 'hexapod', 'kiton', 'phychi', 'exis',
  'raychi', 'doomux', 'centipede', 'segment', 'cloak', 'dagger'
];

const ELYRION_UNIT_IDS = [
  'polytaur', 'baby_dragon', 'fire_dragon',
  'warrior', 'rider', 'archer', 'defender', 'swordsman',
  'catapult', 'knight', 'mind_bender', 'cloak', 'dagger',
  'raft', 'scout', 'rammer', 'bomber'
];

const POLARIS_UNIT_IDS = [
  'mooni', 'battle_sled', 'ice_archer', 'ice_fortress', 'gaami',
  'warrior', 'swordsman', 'catapult', 'knight', 'mind_bender', 'cloak', 'dagger'
];

const AQUARION_UNIT_IDS = [
  'amphibian', 'tridention', 'shark', 'puffer', 'yelly_belly', 'crab',
  'warrior', 'archer', 'defender', 'swordsman', 'mind_bender', 'cloak', 'dagger'
];

export function getUnitsForTribe(tribeId) {
  if (!tribeId || tribeId === 'all') return UNITS;

  let allowedIds = STANDARD_UNIT_IDS;
  if (tribeId === 'cymanti') allowedIds = CYMANTI_UNIT_IDS;
  else if (tribeId === 'elyrion') allowedIds = ELYRION_UNIT_IDS;
  else if (tribeId === 'polaris') allowedIds = POLARIS_UNIT_IDS;
  else if (tribeId === 'aquarion') allowedIds = AQUARION_UNIT_IDS;

  return UNITS.filter(u => allowedIds.includes(u.id));
}

export function getTribeName(tribeId) {
  const found = TRIBE_OPTIONS.find(t => t.id === tribeId);
  return found ? found.name : 'All Tribes';
}

/**
 * Returns the appropriate image path for a unit given a tribe context.
 * Standard and naval units will use their official tribe-specific skin if available.
 */
export function getUnitImage(unitOrId, tribeId = 'all') {
  const unit = typeof unitOrId === 'string' ? getUnitById(unitOrId) : unitOrId;
  if (!unit) return 'assets/units/warrior.png';

  if (tribeId && tribeId !== 'all') {
    const tribeSkinUnits = [
      'warrior', 'rider', 'archer', 'defender', 'swordsman',
      'catapult', 'knight', 'mind_bender', 'cloak', 'dagger', 'giant',
      'raft', 'scout', 'rammer', 'bomber', 'juggernaut'
    ];

    if (tribeSkinUnits.includes(unit.id)) {
      if (tribeId === 'elyrion' && unit.id === 'giant') {
        return 'assets/units/fire_dragon.png';
      }
      if (tribeId === 'polaris' && unit.id === 'giant') {
        return 'assets/units/gaami.png';
      }
      if (tribeId === 'cymanti' && unit.id === 'giant') {
        return 'assets/units/centipede.png';
      }
      if (tribeId === 'aquarion' && unit.id === 'giant') {
        return 'assets/units/crab.png';
      }
      return `assets/units/tribes/${tribeId}/${unit.id}.png`;
    }
  }

  return unit.image || `assets/units/${unit.id}.png`;
}

