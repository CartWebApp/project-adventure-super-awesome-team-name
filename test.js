// scriptCleaner.js

// ====================================================
// Global Variables & Canvas Setup
// ====================================================
var context, controller, player, loop, playerImage, coin, coinImage;

context = document.querySelector("canvas").getContext("2d");
context.canvas.height = innerHeight - 20;
context.canvas.width = innerWidth - 20;

var frameWidth = 270;
var frameHeight = 250;
var currentFrame = 0;
var frameCounter = 0;
var framesPerSecond = 15;

let lastTime = 0;
let start = true;
let rewardType;
let screen = 1;
let isTyping = false;
let currentText = "";
let waitingForChoice = false;
let typingInterval = null;


// Used for cutscene branches / choices in dialogue
let path = "fastPath";
let choice = 0;
let optionSelected;

// Scaling for player sprite
let scaleFactor;
let scaledWidth;
let scaledHeight;

let firstStorePotionEnter = true;

// ====================================================
// Game Object Lists
// ====================================================
let grass = [];
let homes = [];
let barrier = [];
let enemy = [];
let treasure = [];
let interactable = [];
let villager = [];

// Inventory array
let inventory = ["healingPotion"];

// ====================================================
// Image Declarations
// ====================================================
let treasureImage = new Image();
let bg = new Image();
playerImage = new Image();

playerImage.src = 'img/player/idle.png';
treasureImage.src = "img/rewards/coin.png";

// ====================================================
// Player Object
// ====================================================
player = {
    direction: "left",
    height: frameHeight,
    width: frameWidth,
    x: 1000,
    y: 900,
    playerAttackCooldown: 0,
    permanentCooldown: 0,
    attackedTime: 0,
    image: playerImage,
    attackDamage: 1,
    defense: 0,
    health: 100,
    speed: 6,
    shield: 0,
    money: 100
};

// ====================================================
// Factory Functions
// ====================================================
function createEnemy(width, height, xPosition, yPosition, Enemyimage) {
    const attackerImg = new Image();
    attackerImg.src = Enemyimage;
    return {
        width: width,
        height: height,
        x: xPosition,
        y: yPosition,
        preAttackX: xPosition,
        preAttackY: yPosition,
        state: "idle",
        attackTimer: 0,
        cooldown: 0,
        vx: 0,
        vy: 0,
        attackerImg,
        health: 100,
        maxHealth: 100,
        attackDamage: 50
    };
}

function createVillager(width, height, xPosition, yPosition) {
    return { width: width, height: height, x: xPosition, y: yPosition };
}

function createGrass(width, height, xPosition, yPosition) {
    return { width: width, height: height, x: xPosition, y: yPosition };
}

function createHome(width, height, x, y, img) {
    const mainHouse = new Image();
    mainHouse.src = img;
    return { width, height, x, y, mainHouse };
}

function createBarrier(width, height, x, y) {
    return { width, height, x, y };
}

function createDoor(width, height, x, y, houseNum) {
    return { width, height, x, y, houseNum };
}

function createTreasure(x, y, width, height, type) {
    return { width, height, x, y, type };
}

function createInteractable(width, height, x, y, type) {
    return { width, height, x, y, type };
}

// ====================================================
// Controller & Key Events
// ====================================================
controller = {
    left: false,
    right: false,
    up: false,
    down: false,
    keyListener: function (event) {
        if (waitingForChoice) return;
        var key_state = (event.type == "keydown");
        switch (event.keyCode) {
            case 37: // left arrow
            case 65: // A
                controller.left = key_state;
                break;
            case 87: // W
            case 38: // up arrow
                controller.up = key_state;
                break;
            case 39: // right arrow
            case 68: // D
                controller.right = key_state;
                break;
            case 83: // S
            case 40: // down arrow
                controller.down = key_state;
                break;
        }
    }
};

document.getElementById("potionHealing").addEventListener("click", () => potionBuy("heal"));
document.getElementById("potionShield").addEventListener("click", () => potionBuy("shield"));
document.getElementById("potionSpeed").addEventListener("click", () => potionBuy("speed"));
document.getElementById("potionStrength").addEventListener("click", () => potionBuy("strength"));

document.getElementById("healingPotionInventory").addEventListener("click", () => usePotion("healingPotion"));
document.getElementById("shieldPotionInventory").addEventListener("click", () => usePotion("shieldingPotion"));
document.getElementById("speedPotionInventory").addEventListener("click", () => usePotion("speedPotion"));
document.getElementById("strengthPotionInventory").addEventListener("click", () => usePotion("strengthPotion"));

// Updated choice event listeners use the new dialogue system's director function:
document.getElementById("choiceOne").addEventListener("click", () => director("One"));
document.getElementById("choiceTwo").addEventListener("click", () => director("Two"));
document.getElementById("choiceThree").addEventListener("click", () => director("Three"));

// ====================================================
// Dialogue / Cutscene System
// ====================================================

// Dialogue state variables and scene definitions.
let dialogueQueue = [];
let currentScene = "";
let currentChoice = -1;
let isProcessingDialogue = false;

const scenes = {
    tutorialIntro: [
        { speaker: "Mom", face: "jeremy", text: "What is that?" },
        { speaker: "Jericho", face: "jericho", choices: ["I'm not sure", "I think it's a bug", "I'll check it out"] }
    ],
    bugResponse: [
        { speaker: "Mom", face: "jeremy", text: "Well, be careful!" },
        { action: () => hudChange("town") }
    ]
};


// Start a scene by setting up the dialogue queue
function startScene(sceneName) {
    currentScene = sceneName;
    dialogueQueue = [...scenes[sceneName]];
    processDialogue();
}

// Process the dialogue queue step by step.
function processDialogue() {
    if (dialogueQueue.length === 0) {
        isProcessingDialogue = false;
        waitingForChoice = false;
        return;
    }
    isProcessingDialogue = true;
    const step = dialogueQueue.shift();
    if (step.text) {
        
        typeText("regularText", "");
        document.getElementById("faces").src = `img/hud/faces/${step.face}.png`;
        document.getElementById("speakerName").innerText = step.speaker;
        typeText("regularText", step.text);
        setTimeout(processDialogue, 5000);
    } else if (step.choices) {
        waitingForChoice = true;
        showChoices(step.choices);
    } else if (step.action) {
        step.action();
        processDialogue();
    }
}

// Displays choices in the HUD.
function showChoices(choices) {
    const choiceIDs = ["choiceOne", "choiceTwo", "choiceThree"];
    const textIDs = ["choiceTextone", "choiceTexttwo", "choiceTextthree"];
    choices.forEach((text, i) => {
        const el = document.getElementById(choiceIDs[i]);
        const textEl = document.getElementById(textIDs[i]);
        el.classList.remove("hidden");
        el.classList.add("show");
        textEl.innerText = text;
    });
}

// Director function for handling choice button clicks.
function director(selected) {
    const index = { One: 0, Two: 1, Three: 2 }[selected];
    onChoice(index);
}

// Branch based on the chosen dialogue option.
function onChoice(index) {
    waitingForChoice = false;
    // Hide all choices:
    ["choiceOne", "choiceTwo", "choiceThree"].forEach(id => {
        document.getElementById(id).classList.add("hidden");
        document.getElementById(id).classList.remove("show");
    });
    currentChoice = index;
    // For this example, we branch from the tutorial scene:
    if (currentScene === "tutorialIntro") {
        startScene("bugResponse");
    }
}



// ====================================================
// Main Game Loop, Update, and Render Functions
// ====================================================
function loop() {
    update();   // Update game logic
    render();   // Render game screen
    requestAnimationFrame(loop); // Schedule next frame
}

function update() {
    // Example: trigger dialogue when reaching a certain choice state.
    // (Replace this with your own condition based on game events.)
    if (start) {
        screen = 1;
        screenChange(1);
        start = false;
    }
    if ((player.y <= -82) && (player.x >= 967) && (player.x <= 1150) && screen === 1) {
        screen = 2;
        screenChange(2);
        player.y = 909;
    }
    if ((player.y >= 963) && (player.x >= 933) && (player.x <= 1105) && screen === 2) {
        screen = 1;
        screenChange(1);
        player.y = -60;
    }
    if ((player.y <= -81) && (player.x >= 996) && (player.x <= 1128) && screen === 2) {
        screen = 3;
        screenChange(3);
        player.y = 909;
    }
    if ((player.y >= 976) && (player.x >= 999) && (player.x <= 1137) && screen === 3) {
        screen = 2;
        screenChange(2);
        player.y = -69;
    }
    if ((player.y >= 967) && (player.x >= 865) && (player.x <= 1056.5) && screen === 105) {
        screen = 3;
        screenChange(3);
        player.y = 680;
    }

    // Calculate grass effect on movement.
    let inGrassSpeed = 1;
    grass.forEach(gr => {
        if (collisionDetectionOverlap(player, gr)) {
            inGrassSpeed = 0.7;
        }
    });

    // Movement handling.
    if (controller.left) {
        player.x -= player.speed * inGrassSpeed;
        player.direction = "left";
    }
    if (controller.right) {
        player.x += player.speed * inGrassSpeed;
        player.direction = "right";
    }
    if (controller.up) {
        player.y -= player.speed * inGrassSpeed;
        player.direction = "up";
    }
    if (controller.down) {
        player.y += player.speed * inGrassSpeed;
        player.direction = "down";
    }

    // IFrame timers for player attacks.
    if (player.attackedTime > 0) {
        player.attackedTime--;
    }
    if (player.playerAttackCooldown > 0) {
        player.playerAttackCooldown = player.playerAttackCooldown - 1.00;
        updateCooldown(player.playerAttackCooldown);
    }

    // Enemy AI loop.
    enemy.forEach(attacker => {
        if (waitingForChoice) return;
        if (attacker.cooldown > 0) { attacker.cooldown--; }
        let dx = player.x - attacker.x;
        let dy = player.y - attacker.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (attacker.state === "idle" && attacker.cooldown === 0 && distance <= 700) {
            if (distance > 125) {
                let vx = (dx / distance) * 5;
                let vy = (dy / distance) * 5;
                attacker.x += vx;
                attacker.y += vy;
            } else {
                attacker.state = "attacking";
                attacker.attackTimer = 0;
                attacker.vx = (dx / distance) * 5;
                attacker.vy = (dy / distance) * 5;
                attacker.preAttackX = attacker.x;
                attacker.preAttackY = attacker.y;
                attacker.cooldown = 90;
            }
        }
        if (attacker.state === "attacking") {
            attacker.x += attacker.vx * 2;
            attacker.y += attacker.vy * 2;
            attacker.attackTimer++;
            if (collisionDetectionOverlap(player, attacker) && player.attackedTime === 0) {
                player.attackedTime = 30;
                attacker.state = "returning";
                attacker.attackTimer = 0;
                if (player.shield > 0) {
                    player.shield = Math.max(0, player.shield - attacker.attackDamage);
                    document.getElementById("shieldFill").style.width = player.shield + "%";
                    if (player.shield === 0) {
                        player.health = Math.max(0, player.health + player.shield);
                        document.getElementById("healthFill").style.width = player.health + "%";
                    }
                } else {
                    player.health = Math.max(0, player.health - attacker.attackDamage);
                    document.getElementById("healthFill").style.width = player.health + "%";
                }
            }
        }
        if (attacker.state === "returning") {
            let returnDx = attacker.preAttackX - attacker.x;
            let returnDy = attacker.preAttackY - attacker.y;
            let returnDistance = Math.sqrt(returnDx * returnDx + returnDy * returnDy);
            if (returnDistance > 10) {
                let returnVx = (returnDx / returnDistance) * 5;
                let returnVy = (returnDy / returnDistance) * 5;
                attacker.x += returnVx;
                attacker.y += returnVy;
            } else {
                attacker.x = attacker.preAttackX;
                attacker.y = attacker.preAttackY;
                attacker.state = "idle";
            }
        }
        if (attacker.health === 0) {
            attacker.state = "idle";
            enemyDie(attacker);
        }
    });

    // Treasure collection.
    treasure.forEach(loot => {
        if (collisionDetectionOverlap(player, loot)) {
            if (loot.type === "gem") {
                player.money += 5;
            } else {
                player.money += 1;
            }
            document.getElementById("moneyGained").innerText = player.money;
            treasure.splice(treasure.indexOf(loot), 1);
        }
    });

    // Example: Trigger dialogue for a branch (replace with your own condition).
    // For instance, when choice === -1 or when reaching a specific area.
    // Uncomment the next lines to start the dialogue sequence:
    //
    if (!isProcessingDialogue && path === "fastPath" && choice === 0) {
        enemy = [
            createEnemy(100, 100, 1900, 800, "img/enemies/bugs/blueBug.png")
        ]
        hudChange("room");
        startScene("tutorialIntro");
        choice = 1; // Mark it as triggered
    }
}

function render() {
    // Update scaling for current screen
    if (screen === 105) {
        scaleFactor = 0.7;
    } else {
        scaleFactor = 0.4;
    }
    scaledWidth = frameWidth * scaleFactor;
    scaledHeight = frameHeight * scaleFactor;
    player.width = scaledWidth;
    player.height = scaledHeight;
    context.drawImage(bg, 0, 0, context.canvas.width, context.canvas.height);
    homes.forEach(home => {
        if (home.mainHouse.complete) {
            context.drawImage(home.mainHouse, home.x, home.y, home.width, home.height - 50);
        }
    });
    enemy.forEach(attacker => {
        context.drawImage(attacker.attackerImg, attacker.x, attacker.y, attacker.width, attacker.height);
        const barWidth = attacker.width;
        const barHeight = 6;
        const barX = attacker.x;
        const barY = attacker.y - 10;
        const healthPercent = attacker.health / attacker.maxHealth;
        context.fillStyle = "gray";
        context.fillRect(barX, barY, barWidth, barHeight);
        context.fillStyle = "red";
        context.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    });
    treasure.forEach(loot => {
        if (loot.type === "gem") {
            treasureImage.src = (rewardType <= 5) ? "img/rewards/greenGem.png" : "img/rewards/redGem.png";
        } else {
            treasureImage.src = "img/rewards/coin.png";
        }
        context.drawImage(treasureImage, loot.x, loot.y, loot.width, loot.height);
    });
    grass.forEach(gr => {
        // Draw grass if needed; currently commented out.
    });

    barrier.forEach(bar => {
        // Draw grass if needed; currently commented out.
        collisionDetection(player, bar);
    });

    villager.forEach(villager => {
        context.fillStyle = "blue";
        context.fillRect(villager.x, villager.y, villager.width, villager.height);
    });
    context.drawImage(
        playerImage,
        currentFrame * frameWidth,
        0,
        frameWidth,
        frameHeight,
        player.x,
        player.y,
        scaledWidth,
        scaledHeight
    );
    window.addEventListener("mousedown", (e) => {
        if (e.button === 0) { playerAttack(); }
    });
    updateAnimation();
}

// ====================================================
// Animation and Screen Change Functions
// ====================================================
function updateAnimation() {
    frameCounter++;
    if (frameCounter >= framesPerSecond) {
        frameCounter = 0;
        if (controller.right) {
            playerImage.src = 'img/player/right2.png';
            frameWidth = 155;
            currentFrame = (currentFrame + 1) % 4;
            framesPerSecond = 9;
        } else if (controller.left) {
            playerImage.src = 'img/player/left2.png';
            frameWidth = 155;
            currentFrame = (currentFrame + 1) % 4;
            framesPerSecond = 9;
        } else {
            playerImage.src = 'img/player/idle2.png';
            frameWidth = 155;
            currentFrame = (currentFrame + 1) % 4;
            framesPerSecond = 20;
        }
    }
}

function screenChange(screen) {
    switch (screen) {
        case 1:
            bg = new Image();
            bg.src = "img/bg/Homebg.png";
            grass = [
                createGrass(980, 409, 0, 0),
                createGrass(1040, 409, 0, 560),
                createGrass(830, 409, 1195, 0),
                createGrass(840, 409, 1185, 560)
            ];
            homes = [
                createHome(700, 600, -100, 50, "img/homes/home1.png"),
                createHome(600, 600, 450, 85, "img/homes/home2.png"),
                createHome(600, 600, 1100, 75, "img/homes/home3.png"),
                createHome(600, 600, 1500, 40, "img/homes/home4.png")
            ];
            barrier = [ createBarrier(280, 10, 110, 360) ];
            door = [ createDoor(90, 90, 205, 370, 1) ];
            interactable = [];
            enemy = [];
            break;
        case 2:
            grass = [
                createGrass(1020, 300, 0, 0),
                createGrass(860, 300, 1165, 0),
                createGrass(780, 90, 0, 510),
                createGrass(810, 90, 1210, 510),
                createGrass(1030, 210, 0, 785),
                createGrass(830, 210, 1190, 785)
            ];
            homes = [];
            barrier = [];
            door = [];
            enemy = [];
            interactable = [];
            bg = new Image();
            bg.src = "img/bg/pathways.png";
            break;
        case 3:
            grass = [
                createGrass(350, 550, 0, 470),
                createGrass(350, 260, 0, 0),
                createGrass(1520, 260, 505, 0),
                createGrass(1355, 230, 505, 465),
                createGrass(670, 90, 350, 900),
                createGrass(850, 90, 1170, 900)
            ];
            homes = [];
            barrier = [ createBarrier(90, 10, 1050, 670) ];
            door = [ createDoor(90, 90, 1050, 670, 5) ];
            enemy = [];
            interactable = [];
            bg = new Image();
            bg.src = "img/bg/town.png";
            hudChange("town");
            break;
        case 101:
            bg = new Image();
            bg.src = "img/bg/rooms/homeFloorOne.png";
            grass = [];
            homes = [];
            barrier = [];
            door = [];
            interactable = [];
            break;
        case 105:
            bg = new Image();
            bg.src = "img/bg/rooms/potion.png";
            grass = [];
            homes = [];
            barrier = [
                createBarrier(370, 260, 830, 220),
                createBarrier(1910, 10, 59, 220),
                createBarrier(25, 700, 59, 220),
                createBarrier(25, 700, 1944, 220),
                createBarrier(280, 320, 59, 590),
                createBarrier(200, 211, 1750, 709),
                createBarrier(525, 10, 340, 885),
                createBarrier(525, 10, 1165, 885),
                createBarrier(10, 100, 1165, 885),
                createBarrier(10, 100, 855, 885)
            ];
            door = [];
            interactable = [
                createInteractable(394, 160, 115, 230, "shelf"),
                createInteractable(394, 160, 1526, 230, "shelf"),
                createInteractable(260, 160, 80, 585, "book"),
                createInteractable(200, 200, 1745, 705, "bag"),
                createInteractable(370, 160, 830, 480, "desk")
            ];
            player.y = 525;
            hudChange("room");
            break;
    }
}

// ====================================================
// Collision Detection Functions
// ====================================================
function collisionDetectionOverlap(obj1, obj2) {
    if (obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y) {
        return true;
    }
    return false;
}

function collisionDetection(obj1, obj2) {
    let topBottom = Math.abs(obj1.y - (obj2.y + obj2.height));
    let rightLeft = Math.abs((obj1.x + obj1.width) - obj2.x);
    let leftRight = Math.abs(obj1.x - (obj2.x + obj2.width));
    let bottomTop = Math.abs((obj1.y + obj1.height) - obj2.y);
    if (obj1.x + obj1.width < obj2.x || obj1.x > obj2.x + obj2.width ||
        obj1.y + obj1.height < obj2.y || obj1.y > obj2.y + obj2.height) {
        return false;
    }
    if ((obj1.y <= obj2.y + obj2.height && obj1.y + obj1.height > obj2.y + obj2.height) &&
        (topBottom < rightLeft && topBottom < leftRight)) {
        obj1.y = obj2.y + obj2.height;
        return true;
    }
    if ((obj1.y + obj1.height >= obj2.y && obj1.y < obj2.y) &&
        (bottomTop < rightLeft && bottomTop < leftRight)) {
        obj1.y = obj2.y - obj1.height;
        return true;
    }
    if ((obj1.x + obj1.width >= obj2.x && obj1.x < obj2.x) &&
        (rightLeft < topBottom && rightLeft < bottomTop)) {
        obj1.x = obj2.x - obj1.width;
        return true;
    }
    if ((obj1.x <= obj2.x + obj2.width && obj1.x + obj1.width > obj2.x + obj2.width) &&
        (leftRight < topBottom && leftRight < bottomTop)) {
        obj1.x = obj2.x + obj2.width;
        return true;
    }
}

// ====================================================
// Player Attack, Cooldown, and Enemy Death Functions
// ====================================================
function playerAttack() {
    if (player.playerAttackCooldown === 0) {
        player.permanentCooldown = 100;
        player.playerAttackCooldown = 100;
        let attackRange = 150;
        enemy.forEach(attacker => {
            let dx = attacker.x - player.x;
            let dy = attacker.y - player.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < attackRange) {
                if (
                    (player.direction === "right" && dx > 0 && Math.abs(dx) > Math.abs(dy)) ||
                    (player.direction === "left" && dx < 0 && Math.abs(dx) > Math.abs(dy)) ||
                    (player.direction === "up" && dy < 0 && Math.abs(dy) > Math.abs(dx)) ||
                    (player.direction === "down" && dy > 0 && Math.abs(dy) > Math.abs(dx))
                ) {
                    attacker.health -= player.attackDamage;
                    attacker.state = "returning";
                    attacker.attackTimer = 0;
                }
            }
        });
    }
}

function updateCooldown(percent) {
    let mutiple = player.permanentCooldown / 100;
    percent = percent * mutiple;
    const cooldown = document.getElementById("cooldownFill");
    const accent = document.getElementById("cooldownFillAccent");
    cooldown.style.width = percent + "%";
    accent.style.width = percent + "%";
    if (percent === 0) {
        cooldown.style.width = "100%";
        accent.style.width = "100%";
    }
}

function enemyDie(attacker) {
    enemy.splice(enemy.indexOf(attacker), 1);
    let chance = Math.floor(Math.random() * 11);
    chance = 1; // For testing, force drop gem.
    if (chance === 1) {
        treasure.push(createTreasure(attacker.x, attacker.y, 50, 50, "gem"));
        rewardType = Math.floor(Math.random() * 11);
    } else {
        treasure.push(createTreasure(attacker.x, attacker.y, 50, 50, "coin"));
    }
}

// ====================================================
// HUD, Shop, and Potion Functions
// ====================================================
function hudChange(form) {
    document.getElementById("moneyGained").innerText = player.money;
    if (form === "room") {
        document.getElementById("rightSide").style.animation = "stuff 2.5s forwards";
        setTimeout(() => document.getElementById("leftSide").style.animation = "Shrink 2s forwards", 800);
        setTimeout(() => document.getElementById("right").style.animation = "textWidth 1s forwards", 1200);
    }
    if (form === "town") {
        document.getElementById("rightSide").style.animation = "gone 2.5s forwards";
        setTimeout(() => document.getElementById("leftSide").style.animation = "grow 2s forwards", 800);
    }
}

function potionBuy(type) {
    if (type === "heal") {
        if (player.money >= 5) {
            player.money -= 5;
            document.getElementById("shopCoin").innerText = player.money;
            typeText("regularText", "You bought a healing potion!");
            inventory.push("healingPotion");
        } else {
            typeText("regularText", "You don't have enough money!");
        }
    } else if (type === "shield") {
        if (player.money >= 5) {
            player.money -= 5;
            document.getElementById("shopCoin").innerText = player.money;
            typeText("regularText", "You bought a shield potion!");
            inventory.push("shieldPotion");
        } else {
            typeText("regularText", "You don't have enough money!");
        }
    } else if (type === "speed") {
        if (player.money >= 5) {
            player.money -= 5;
            document.getElementById("shopCoin").innerText = player.money;
            typeText("regularText", "You bought a speed potion!");
            inventory.push("speedPotion");
        } else {
            typeText("regularText", "You don't have enough money!");
        }
    } else if (type === "strength") {
        if (player.money >= 5) {
            player.money -= 5;
            document.getElementById("shopCoin").innerText = player.money;
            typeText("regularText", "You bought a strength potion!");
            inventory.push("strengthPotion");
        } else {
            typeText("regularText", "You don't have enough money!");
        }
    }
}

function usePotion(type) {
    const threeMinutes = 60 * 3;
    let display = document.querySelector('#timerSpeed');
    if (type === "healingPotion") {
        if (player.health < 100) {
            player.health = Math.min(100, player.health + 5);
            document.getElementById("healthFill").style.width = player.health + "%";
            inventory.splice(inventory.indexOf(type), 1);
        }
    } else if (type === "shieldingPotion") {
        player.shield += 5;
        document.getElementById("shieldFill").style.width = player.shield + "%";
        inventory.splice(inventory.indexOf(type), 1);
    } else if (type === "speedPotion") {
        let speed = player.speed;
        player.speed += 1;
        inventory.splice(inventory.indexOf(type), 1);
        display = document.querySelector('#timerSpeed');
        setTimeout(() => { player.speed = speed; }, 180000);
    } else if (type === "strengthPotion") {
        let attack = player.attackDamage;
        player.attackDamage += 5;
        inventory.splice(inventory.indexOf(type), 1);
        display = document.querySelector('#timerStrength');
        startCountdown(threeMinutes, display);
        setTimeout(() => { player.attackDamage = attack; }, 180000);
    }
    startCountdown(threeMinutes, display);
    updateInventory();
}

function updateInventory() {
    let healingPotion = 0, shieldPotion = 0, speedPotion = 0, strengthPotion = 0;
    inventory.forEach(item => {
        if (item === "healingPotion") healingPotion++;
        if (item === "shieldPotion") shieldPotion++;
        if (item === "speedPotion") speedPotion++;
        if (item === "strengthPotion") strengthPotion++;
    });
    if (healingPotion > 0) {
        document.getElementById("healingPotionInventory").style.visibility = "visible";
        document.getElementById("healingCount").style.visibility = "visible";
        document.getElementById("healingCount").innerText = "X " + healingPotion;
    } else {
        document.getElementById("healingPotionInventory").style.visibility = "hidden";
        document.getElementById("healingCount").style.visibility = "hidden";
    }
    if (shieldPotion > 0) {
        document.getElementById("shieldPotionInventory").style.visibility = "visible";
        document.getElementById("shieldingCount").style.visibility = "visible";
        document.getElementById("shieldingCount").innerText = "X " + shieldPotion;
    } else {
        document.getElementById("shieldPotionInventory").style.visibility = "hidden";
        document.getElementById("shieldingCount").style.visibility = "hidden";
    }
    if (speedPotion > 0) {
        document.getElementById("speedPotionInventory").style.visibility = "visible";
        document.getElementById("speedCount").style.visibility = "visible";
        document.getElementById("speedCount").innerText = "X " + speedPotion;
    } else {
        document.getElementById("speedPotionInventory").style.visibility = "hidden";
        document.getElementById("speedCount").style.visibility = "hidden";
    }
    if (strengthPotion > 0) {
        document.getElementById("strengthPotionInventory").style.visibility = "visible";
        document.getElementById("strengthCount").style.visibility = "visible";
        document.getElementById("strengthCount").innerText = "X " + strengthPotion;
    } else {
        document.getElementById("strengthPotionInventory").style.visibility = "hidden";
        document.getElementById("strengthCount").style.visibility = "hidden";
    }
}

function startCountdown(duration, display) {
    let timer = duration, minutes, seconds;
    const intervalId = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        display.textContent = minutes + ":" + seconds;
        if (--timer < 0) {
            clearInterval(intervalId);
            display.textContent = "Time's up!";
        }
    }, 1000);
}

// ====================================================
// Event Listeners for Shop and Inventory Toggling
// ====================================================
let isBrowsingShop = false;

document.addEventListener("keyup", (e) => {
    if (waitingForChoice) return;
    if (e.code === "KeyE") {
        if (isTyping) {
            isTyping = false;
            document.getElementById("regularText").textContent = currentText;
            return;
        }
        interactable.forEach((int) => {
            if (collisionDetectionOverlap(player, int)) {
                switch (int.type) {
                    case "shelf":
                        typeText("regularText", "It's just a shelf");
                        break;
                    case "book":
                        typeText("regularText", "book");
                        break;
                    case "bag":
                        typeText("regularText", "bag");
                        break;
                    case "desk":
                        if (isBrowsingShop) {
                            openShop();
                            return;
                        }
                        document.getElementById("faces").src = "img/hud/faces/jeremy.png";
                        document.getElementById("speakerName").innerText = "Jeremy";
                        if (firstStorePotionEnter === true) {
                            typeText("regularText", "Hello, I am Jeremy the potion maker. I can make you potions to help you on your journey. If you have the money, of course. Press E to browse our selection of potions");
                            firstStorePotionEnter = false;
                        } else {
                            typeText("regularText", "Welcome back, would you like to browse our selection of potions?");
                        }
                        isBrowsingShop = true;
                        break;
                }
            }
        });
        door.forEach((door) => {
            if (collisionDetectionOverlap(player, door)) {
                switch (door.houseNum) {
                    case 1:
                        screen = 101;
                        screenChange(101);
                        break;
                    case 5:
                        screen = 105;
                        screenChange(105);
                        break;
                }
            }
        });
    }
    if (e.code === "KeyI") {
        document.getElementById("inventory").classList.toggle("show");
        document.getElementById("inventory").classList.toggle("hidden");
        updateInventory();
    }
});

function openShop() {
    typeText("regularText", "Welcome to the potion shop! Here are the items available:");
    document.getElementById("PotionShop").classList.add("show");
    document.getElementById("PotionShop").classList.remove("hidden");
    document.getElementById("shopCoin").innerText = player.money;
}

function closeShop() {
    document.getElementById("PotionShop").classList.remove("show");
    document.getElementById("PotionShop").classList.add("hidden");
    isBrowsingShop = false;
}

document.getElementById("Close").addEventListener("click", () => {
    closeShop();
    typeText("regularText", "Thank you for visiting the potion shop! If you need anything else, just let me know.");
    if (isTyping) {
        isTyping = false;
        document.getElementById("regularText").textContent = currentText;
    }
});

// ====================================================
// Typewriter Effect for Text Display
// ====================================================
function typeText(elementId, text, callback, delay = 30) {
    const element = document.getElementById(elementId);

    // Stop any ongoing typing
    if (typingInterval) {
        clearInterval(typingInterval);
        typingInterval = null;
        const el = document.getElementById("regularText");
        el.textContent = currentText;
        return;
    }
    

    currentText = text;
    element.textContent = "";
    let index = 0;

    typingInterval = setInterval(() => {
        if (index < text.length) {
            element.textContent += text[index++];
        } else {
            clearInterval(typingInterval);
            typingInterval = null;
            if (callback) callback();
        }
    }, delay);
}



// ====================================================
// Final: Setup Event Listeners and Start Main Loop
// ====================================================
window.addEventListener("keydown", controller.keyListener);
window.addEventListener("keyup", controller.keyListener);
window.requestAnimationFrame(loop);
