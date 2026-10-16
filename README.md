# ⚔️ Polytopia Combat & Damage Calculator

A responsive, deterministic combat calculator and siege sequence planner for **The Battle of Polytopia**.

---

## 🚀 Quick Start

### Option 1: Double-Click Launcher (Windows)
Simply double-click [`launch.bat`](file:///d:/code/polytopia_helper/launch.bat). It will automatically start a local server and launch the calculator in your default browser at `http://localhost:8080`.

### Option 2: Terminal Command
Run in PowerShell or Command Prompt:
```bash
python -m http.server 8080
```
Then navigate to [http://localhost:8080](http://localhost:8080).

---

## 🎯 Features

### 1. ⚔️ 1v1 Skirmish Calculator
* **Accurate Deterministic Math:** Uses the exact official Polytopia formula ($4.5$ accelerator, health scaling, pre-damage counter-attack snapshots).
* **Comprehensive Roster & Tribe-Specific Skins:** 
  * Select your active tribe (Imperius, Bardur, Xin-xi, Oumaji, Kickoo, Hoodrick, Luxidoor, Vengir, Zebasi, Ai-Mo, Quetzali, Yădakk, Cymanti, ∑∫ỹriȱŋ, Polaris, Aquarion, or All Tribes).
  * **Authentic Tribal Skins:** Unit portraits dynamically update to display the exact authentic in-game appearance and gear for that specific tribe (e.g. Bardur winter furs, Vengir skull masks, Oumaji turbans, Kickoo feathers, Hoodrick caps, etc.).
  * Special tribe replacements (such as Cymanti's Hexapods & Centipedes, Polaris's Gaamis & Sleds, or Aquarion's Tridentions & Sharks) are automatically organized.
* **Condition Modifiers:**
  * **Veteran (+5 Max HP)**
  * **Terrain / Unwalled City Defense ($1.5\times$)**
  * **City Wall Defense ($4.0\times$)** (with automatic warnings if unit lacks the Fortify skill)
  * **Poisoned** (reduces defense multiplier to $0.5\times$, $0.7\times$, or $2.0\times$)
  * **Frozen** (completely disables defender retaliation)
  * **Ranged vs. Melee distance** (prevents retaliation when striking out of range)
* **🖱️ Mouse Scroll Wheel Quick Controls:**
  * **Hover & Scroll Units:** Hover over any unit portrait or dropdown to cycle through all units in sequence.
  * **Hover & Scroll Health:** Hover over any HP bar or slider to increment or decrement health by 1 with each wheel notch.
  * **Hover & Scroll Modifiers:** Hover over defense position selectors to cycle through None ($1.0\times$), Terrain ($1.5\times$), and City Wall ($4.0\times$).
* **Step-by-Step Formula Breakdown:** Expandable math panel showing exact values for $\text{AttackForce}$, $\text{DefenseForce}$, $\text{TotalForce}$, and force ratios.
* **1-Click Swap:** Instantly switch attacker and defender.

### 2. 🛡️ Siege Planner (Multi-Attacker Sequence Simulator)
* Build custom assault waves against tough targets (e.g., 15 HP walled Defenders, 40 HP Giants, or Centipedes).
* Step-by-step turn progression showing target HP degradation and weakening counter-damage.
* **Auto-Optimize Sequence (`⚡`):** Tests attack permutations to find the order that minimizes friendly casualties and damage taken.

### 3. 📊 Hits-to-Kill Matrix
* Generates a live reference table showing how many direct hits from each unit type are needed to eliminate the configured target.

### 4. 📖 Unit Codex
* Searchable and filterable database of all unit stats (HP, Attack, Defense, Movement, Range, Cost) and special skills.

---

## 📐 Combat Formula Reference

$$\text{AttackForce} = \text{Attacker.Attack} \times \left(\frac{\text{Attacker.HP}}{\text{Attacker.MaxHP}}\right)$$

$$\text{DefenseForce} = \text{Defender.Defense} \times \left(\frac{\text{Defender.HP}}{\text{Defender.MaxHP}}\right) \times \text{DefenseBonus}$$

$$\text{DamageDealt} = \text{round}\left( \frac{\text{AttackForce}}{\text{AttackForce} + \text{DefenseForce}} \times \text{Attacker.Attack} \times 4.5 \right)$$

$$\text{CounterDamage} = \text{round}\left( \frac{\text{DefenseForce}}{\text{AttackForce} + \text{DefenseForce}} \times \text{Defender.Defense} \times 4.5 \right)$$
*(Counter-attack applies only if the defender survives, is not frozen, and has attack range reaching the attacker).*
