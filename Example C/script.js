let player1 = null;
let player2 = null;
let currentPlayer = 1;
let selectionPhase = 1;
const characters = {
  Shade: {
    name: "Shade",
    health: 10000,
    maxHealth: 10000, 
    ultMeter: 0,
    maxUltMeter: 10000,
    ultimate: "Abyssal Execution",
    abilities: [
      { name: "Shadow Strike", type: "offense", effect: () => dealDamage(1000, 1500, false) }, //main attack
      { name: "Soul Siphon", type: "offense", effect: () => dealDamage(500, 750, true) },
      { name: "Veil of Darkness", type: "defense", effect: () => applyDefense(1000) },
      { name: "Crippling Cut", type: "debuff", effect: () => applyDebuff("weaken", 1) },
      { name: "Night Step", type: "utility", effect: () => gainUlt(1000) }
    ]
  },
  Xiolin: {
    name: "Xiolin",
    health: 10000,
    maxHealth: 10000, 
    ultMeter: 0,
    maxUltMeter: 10000,
    ultimate: "Dragon Wrath",
    abilities: [
      { name: "Palm of Serenity", type: "offense", effect: () => dealDamage(800, 1400) }, // main attack
      { name: "Chi Barrier", type: "defense", effect: () => applyDefense(2000) },   
      { name: "Iron Body", type: "defense", effect: () => applyDefense(1000, 2, false) },
      { name: "Meditate", type: "utility", effect: () => gainUlt(1500) },
      { name: "Pressure Point", type: "debuff", effect: () => applyDebuff("stun", 1) }
    ]
  },
  Alice: {
    name: "Alice",
    health: 10000,
    maxHealth: 10000, 
    ultMeter: 0,
    maxUltMeter: 10000,
    ultimate: "Absolute Zero",
    abilities: [
      { name: "Ice Lance", type: "offense", effect: () => dealDamage(900, 1600) }, // 
        { name: "Chill Touch", type: "offense", effect: () => dealDamage(600, 1200, true) },
      { name: "Frozen Ward", type: "defense", effect: () => applyDefense(1000) },
      { name: "Snowblind", type: "debuff", effect: () => applyDebuff("accuracy", 1) },
      { name: "Blizzard Bloom", type: "utility", effect: () => gainUlt(1200) }
    ]
  }
};
function chooseCharacter(characterName) {
  if (selectionPhase === 1) {
    player1 = createPlayer(characterName);
    log(`Player 1 chose ${characterName}`);
    selectionPhase = 2;
    alert("Now Player 2 choose your character");
  } else {
    player2 = createPlayer(characterName);
    log(`Player 2 chose ${characterName}`);
    startGame();
  }
}
function createPlayer(characterName) {
  const base = { ...characters[characterName] };
  return {
    ...base,
    defense: 0,
    defenseTurns: 0,
    debuffs: {}
  };
}
function startGame() {
  document.getElementById("character-select").style.display = "none";
  document.getElementById("game-container").style.display = "block";
  updateUI();
  updateTurnMessage();
  playerturn();
  log(`Battle Start! ${player1.name} vs ${player2.name}`);
}
function performAction(type) {
  const current = currentPlayer === 1 ? player1 : player2;
  const opponent = currentPlayer === 1 ? player2 : player1;

  if (current.debuffs?.stun) {
    log(`${current.name} is stunned and skips the turn!`);
    current.debuffs.stun--;
    nextTurn();
    return;
  }

  if (type === "ultimate") {
    if (current.ultMeter >= 1000) {
      playAnimation(current.name, current.ultimate, true);
      opponent.health -= 3000;
      current.ultMeter = 0;
      log(`${current.name} uses ${current.ultimate} for 3000 damage!`);
    } else {
      log(`${current.name} doesn't have enough ultimate meter!`);
      return;
    }
  } else if (type === "item") {
    current.health = Math.min(current.health + 2000, current.maxHealth); // Cap health at maxHealth
    log(`${current.name} heals for 200 HP with an item.`);
  }

  updateUI();
  checkGameEnd();
  nextTurn();
}
function openAbilityMenu() {
  const current = currentPlayer === 1 ? player1 : player2;
  const menu = document.getElementById("ability-menu");
  menu.innerHTML = "<h3>Choose an Ability:</h3>";
  current.abilities.forEach((ability, index) => {
    const btn = document.createElement("button");
    btn.textContent = `${ability.name} (${ability.type})`;
    btn.onclick = () => useAbility(index);
    menu.appendChild(btn);
  });
  menu.style.display = "block";
}
function useAbility(index) {
  const current = currentPlayer === 1 ? player1 : player2;
  const ability = current.abilities[index];
  document.getElementById("ability-menu").style.display = "none";
  playAnimation(current.name, ability.name, false);
  log(`${current.name} uses ${ability.name}!`);
  ability.effect();
  updateUI();
  nextTurn();
}
function dealDamage(min, max, lifesteal = false) {
  const attacker = currentPlayer === 1 ? player1 : player2;
  const defender = currentPlayer === 1 ? player2 : player1;
  // Handle blinded debuff
  if (attacker.debuffs?.accuracy && Math.random() < 0.5) {
    log(`${attacker.name}'s attack missed due to blindness!`);
    attacker.debuffs.accuracy--;
    nextTurn();
    return;
  }
  //handle stun debuff
  if (attacker.debuffs?.stun) {
    log(`${attacker.name} is stunned and skips the turn!`);
    attacker.debuffs.stun--;
    return;
  }
  let damage = Math.floor(Math.random() * (max - min + 1)) + min;
  // Handle weaken debuff
  if (attacker.debuffs?.weaken) {
    damage = Math.max(1, damage - 700);
    attacker.debuffs.weaken--;
  }
  // Handle defense
  if (defender.defenseTurns > 0) {
    damage = typeof defender.defense === "number"
      ? Math.max(0, damage - defender.defense)
      : Math.floor(damage * (1 - defender.defense));
    defender.defenseTurns--;
    if (defender.defenseTurns <= 0) defender.defense = 0;
  }
  // Apply damage
  defender.health -= damage;
  attacker.ultMeter += damage;
  if (lifesteal) {
    const heal = Math.floor(damage / 2);
    attacker.health += heal;
    log(`${attacker.name} heals for ${heal} with lifesteal.`);
  }
  log(`${defender.name} takes ${damage} damage.`);
  updateUI();
  checkGameEnd();
}
function applyDefense(amount, turns = 1, isPercent = false) {
  const current = currentPlayer === 1 ? player1 : player2;
  current.defense = isPercent ? amount : amount;
  current.defenseTurns = turns;
  log(`${current.name} activates defense for ${turns} turn(s)!`);
}
function applyDebuff(type, turns) {
  const opponent = currentPlayer === 1 ? player2 : player1;
  opponent.debuffs[type] = turns;
  log(`${opponent.name} is affected by ${type} for ${turns} turn(s)!`);
}
function gainUlt(amount) {
  const current = currentPlayer === 1 ? player1 : player2;
  current.ultMeter += amount;
  log(`${current.name} gains ${amount} ultimate energy.`);
  updateUI();
}
function updateTurnMessage() {
  document.getElementById("turn-message").textContent = `It's ${currentPlayer === 1 ? "Player 1" : "Player 2"}'s Turn`;
}
function log(text) {
  const logBox = document.getElementById("battle-log");
  logBox.innerHTML += `<p>${text}</p>`;
  logBox.scrollTop = logBox.scrollHeight;
}
function nextTurn() {
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  updateTurnMessage();
  updateUI();
  playerturn();
}
function playerturn(){
  const player1 = document.getElementById("player1-hud");
const player2 = document.getElementById("player2-hud");
if (currentPlayer === 1) {
  player1.style.border = "5px solid red";
  player2.style.border = "5px solid #333";
} else {
  player1.style.border = "5px solid #333";
  player2.style.border = "5px solid red";
}
}
function checkGameEnd() {
  if (player1.health <= 0) {
    log(`Player 2 (${player2.name}) wins!`);
    disableActions();
    resetGame();
  } else if (player2.health <= 0) {
    log(`Player 1 (${player1.name}) wins!`);
    disableActions();
    resetGame();
  }
}
function resetGame() {
  //button to go back to home page
  const homeButton = document.createElement("button");
  homeButton.textContent = "Go to Home Page";
  homeButton.onclick = () => {
    window.location.href = "home.html"; // Change to your home page URL
  };
  document.getElementById("game-container").appendChild(homeButton);

}
function disableActions() {
  document.querySelectorAll('#player-actions button').forEach(btn => btn.disabled = true);
}
function updateUI() {
  document.getElementById("p1-name").textContent = player1.name;
  document.getElementById("p2-name").textContent = player2.name;

  // Calculate health bar width as a percentage of max health
  const p1HealthPercent = Math.max(0, (player1.health / player1.maxHealth) * 100);
  const p2HealthPercent = Math.max(0, (player2.health / player2.maxHealth) * 100);
   // Calculate ult bar width as a percentage of max ult bar
   const p1UltPercent = Math.max(0, (player1.ultMeter / player1.maxUltMeter) * 100);
   const p2UltPercent = Math.max(0, (player2.ultMeter / player2.maxUltMeter) * 100);
  // Update health bar widths
  document.getElementById("p1-health").style.width = `${p1HealthPercent}%`;
  document.getElementById("p2-health").style.width = `${p2HealthPercent}%`;

  // Update ult bar widths
  document.getElementById("p1-ult").style.width = `${p1UltPercent}%`;
  document.getElementById("p2-ult").style.width = `${p2UltPercent}%`;

  document.getElementById("p1-status").textContent = getStatus(player1);
  document.getElementById("p2-status").textContent = getStatus(player2);
  document.getElementById("p1-portrait").src = `portraits/${player1.name.toLowerCase()}.png`;
  document.getElementById("p2-portrait").src = `portraits/${player2.name.toLowerCase()}.png`;
}
function getStatus(player) {
  const statuses = [];
  if (player.defenseTurns > 0) statuses.push("Defending");
  if (player.debuffs?.stun) statuses.push("Stunned");
  if (player.debuffs?.weaken) statuses.push("Weakened");
  if (player.debuffs?.accuracy) statuses.push("Blinded");
  return statuses.length > 0 ? statuses.join(", ") : "None";
}
function playAnimation(characterName, moveName, isUltimate = false) {
  const video = document.getElementById("move-animation");
  const box = document.getElementById("animation-box");
  const fileName = `${characterName.toLowerCase()}_${moveName.toLowerCase().replace(/\s/g, "_")}`;
  const src = `animations/${fileName}.mp4`;
  video.pause();
  video.src = src;
  video.load();
  video.style.display = "block";
  box.className = "animation-box";
  if (isUltimate) {
    box.classList.add("ultimate-box");
    if (characterName === "Shade") box.classList.add("shade-ult");
    if (characterName === "Xiolin") box.classList.add("xiolin-ult");
    if (characterName === "Alice") box.classList.add("alice-ult");
  }
  video.onended = () => {
    video.style.display = "none";
    box.className = "animation-box";
  };
}

let cheatCodeBuffer = [];
const cheatCodes = {
  ninju: () => {
    const current = currentPlayer === 1 ? player1 : player2;
    current.ultMeter = current.maxUltMeter;
    log(`${current.name} something happened`);
    updateUI();
  },
  healu: () => {
    const current = currentPlayer === 1 ? player1 : player2;
    current.health = Math.min(current.maxHealth, current.maxHealth); 
    log(`${current.name} nothing happened`);
    updateUI();
  },

  klkll: () => {
    const opponent = currentPlayer === 1 ? player2 : player1;
    opponent.health = Math.max(0, opponent.health - 5000); // Deal 5000 damage
    log(`${opponent.name} took 5000 damage from the cheat code!`);
    updateUI();
    checkGameEnd();
  },
  polpo: () => {
    const current = currentPlayer === 1 ? player1 : player2;
  
    log(`${current.name} this game is still in development, please wait for the full release! and later we will add more soon to the game`);
    updateUI();
  },
};

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  cheatCodeBuffer.push(key);

  // Limit buffer size to 5 keys
  if (cheatCodeBuffer.length > 5) {
    cheatCodeBuffer.shift();
  }

  // Check for cheat code match
  const cheatCodeString = cheatCodeBuffer.join("");
  if (cheatCodes[cheatCodeString]) {
    cheatCodes[cheatCodeString]();
    cheatCodeBuffer = []; // Reset buffer after activation
  }
});