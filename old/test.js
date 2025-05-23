// scriptCleaner.js

// ====================================================
// Global Variables & Canvas Setup
// ====================================================
var context, controller, player, loop, coin, coinImage, fast, mom, mentor;

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
let fastBattle = false;

let speedPotionTimeout = null;
let strengthPotionTimeout = null;

let speedCountdownInterval = null;
let strengthCountdownInterval = null;



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
let circularBarrier = [];


// Inventory array
let inventory = ["healingPotion"];

// ====================================================
// Image Declarations
// ====================================================
let treasureImage = new Image();
let bg = new Image();
let fastImage = new Image();
let playerImage = new Image();
let momImage = new Image();
let mentorImage = new Image();

playerImage.src = 'img/player/idle.png';
fastImage.src = 'img/enemies/boss/fastboss2.png';
treasureImage.src = "img/rewards/coin.png";

momImage.src = 'img/characters/mom.png';
mentorImage.src = 'img/characters/mentor.png';


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

fast = {
    width: 250,
    height: 270,
    x: 500,
    y: 500,
    choasMode: false,
    image: fastImage,
    health: 500,
    maxHealth: 500,
    attackDamage: 25,
    attackTimer: 0,
    cooldown: 0,
}

mom = {
    width: 191 / 3.5,
    height: 399 / 3.5,
    x: 200,
    y: 550,
    image: momImage,
}

mentor = {
    width: 191 / 3,
    height: 399 / 3,
    x: 500,
    y: 700,
    image: mentorImage,
    moving: false,
    targetX: 0,
    targetY: 0,
    touchObject: "none"
}


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
        attackDamage: 5
    };
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

function createEllipticalBarrier(width, height, centerX, centerY) {
    return {
        width: width,
        height: height,
        x: centerX,
        y: centerY,
        type: "elliptical"
    };
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
        if (waitingForChoice) {
            // Reset movement when waiting for a choice
            controller.left = false;
            controller.right = false;
            controller.up = false;
            controller.down = false;
            return;
        }

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
document.getElementById("shieldPotionInventory").addEventListener("click", () => usePotion("shieldPotion"));
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
        { speaker: "Mom", face: "mom", text: "What is that?" },
        { speaker: "Jericho", face: "mom", choices: ["I'm not sure", "I think it's a bug", "I'll check it out"] },
    ],
    bugResponse: [
        { speaker: "Mom", face: "mom", text: "You should check it out, be careful though!" },
        { action: () => hudChange("town") },
        { action: () => waitingForChoice = false },
    ],
    bugResponseOffered: [
        { speaker: "Mom", face: "mom", text: "Well, be careful!" },
        { action: () => hudChange("town") },
        { action: () => waitingForChoice = false },
    ],
    mentorHelp: [
        { speaker: "???", face: "mark", text: "looks like you need help!" },
        { action: () => mentorMove("touchPlayer") },
    ],
    mentorKillBug: [
        { speaker: "???", face: "mark", text: "AHHHHHHHH" },
        { action: () => enemyDie(enemy[0]) },
        { speaker: "???", face: "mark", text: "Damn Bugs" },
        { speaker: "Mark", face: "mark", text: "Hi I'm Mark, you must be Jericho" },
        { speaker: "Jericho", face: "jericho", text: "Yes, I am!" },
        { speaker: "Mark", face: "mark", text: "Nice to meet you, I heard about your dad" },
        { speaker: "Jericho", face: "jericho", text: "..." },
        { speaker: "Mark", face: "mark", text: "These bugs appeared when your dad dissapeared" },
        { speaker: "Mark", face: "mark", text: "Maybe they are connected. You want me to show you how to defeat them" },
        // { speaker: "Jericho", face: "jericho", choices: ["Yes if it'll help my dad", "No, My dad wouldn't want me too"] },
        { speaker: "Jericho", face: "jericho", choices: ["Yes if it'll help my dad"] },
    ],
    showAround: [
        { speaker: "Mark", face: "mark", text: "Great!" },
        { speaker: "Mark", face: "mark", text: "First, let me take you to town" },
        { action: () => mentorMove("moveHouse") },
        { action: () => hudChange("town") },
        { action: () => waitingForChoice = false },

    ],
    mentorMoveMore: [
        { action: () => hudChange("town") },
        { action: () => mentorMove("moveSecond") },

    ],

    MentorOutsidePotionShop: [
        { speaker: "Mark", face: "mark", text: "Man your slow, come inside the potion shop" },
        { action: () => hudChange("town") },
        { action: () => mentor.x = 4000 },
        { action: () => waitingForChoice = false },

    ],

    mentorInsidePotionShop: [
        { speaker: "Mark", face: "mark", text: "Heres the potion shop, you can buy magical potions" },
        { speaker: "Mark", face: "mark", text: "take a look around meet me outside" },
        { action: () => mentorMove("leaveShop") },
        { speaker: "jericho", face: "jericho", text: " " },
    ],

    bugFight: [
        { speaker: "Mark", face: "mark", text: "now the hard part, fighting the bugs" },
        { action: () => mentorMove("bugLearn") },
        { action: () => hudChange("town") },

    ],

    bugLearn: [
        { speaker: "Mark", face: "mark", text: "Your powerful now, look at him when you hit and win" },
        { action: () => hudChange("town") },
        { action: () => waitingForChoice = false },
    ],

    momComes: [
        { speaker: "Mark", face: "mark", text: "Dang that was amazing, just one-" },
        { speaker: "Mom", face: "mom", text: "Jericho!" },
        { speaker: "Mom", face: "mom", text: "Are you okay?" },
        { speaker: "Mom", face: "mom", text: "I heard a loud noise" },
        { speaker: "Mom", face: "mom", text: "I thought you were in danger" },
        { speaker: "Jericho", face: "jericho", text: "I'm fine, I was just training" },
        { speaker: "Mom", face: "mom", text: "You should be careful, I don't want to lose you too" },
        { speaker: "Mom", face: "mom", text: "You look so much like dad right now" },
        { speaker: "Jericho", face: "jericho", choices: ["Mom I can save him", "..."] },


    ],

    ICanSaveHim: [
        // { speaker: "Mom", face: "jeremy", text: "No you can't look what happened to dad" },
        // { speaker: "Mom", face: "jeremy", text: "Time to go come on" },

        // {action: () => screen = 1 },
        // {action: () => screenChange(1) },
        // {action: () => player.x = 217 },
        // {action: () => player.y = 370 },
        // { speaker: "jericho", face: "jericho", text: "Omg, I shouldn't be sneaking away" },
        // { speaker: "jericho", face: "jericho", text: "what would dad think..." },
        // { speaker: "jericho", face: "jericho", text: "well since I'm out where should I go" },
        // { speaker: "jericho", face: "jericho", choices: ["Cart", "Mall"] },
        // { action: () => startScene("bossFightFast") }, // AFTER choice
    ],

    sayNothing: [
        // { speaker: "Mom", face: "jeremy", text: "well its Time to go come on" },

        // {action: () => screen = 1 },
        // {action: () => screenChange(1) },
        // {action: () => player.x = 217 },
        // {action: () => player.y = 370 },
        // { speaker: "jericho", face: "jericho", text: "Omg, I shouldn't be sneaking away" },
        // { speaker: "jericho", face: "jericho", text: "what would dad think..." },
        // { speaker: "jericho", face: "jericho", text: "well since I'm out where should I go" },
        // { speaker: "jericho", face: "jericho", choices: ["Cart", "Mall"] },
        // { action: () => startScene("bossFightFast") }, // AFTER choice

    ],




    bossFightFast: [
        { speaker: "jericho", face: "jericho", text: "You think you can defeat me?" },
        { speaker: "jericho", face: "jericho", text: "pitiful, let the battle comence" },
        { action: () => hudChange("town") },
        { action: () => FastBoss() },
    ]

};





// Start a scene by setting up the dialogue queue
function startScene(sceneName) {
    console.log("Starting scene:", sceneName);
    waitingForChoice = true;
    hudChange("room");
    currentScene = sceneName;
    dialogueQueue = [...scenes[sceneName]];
    processDialogue();
}



function processDialogue() {


    if (dialogueQueue.length === 0) {
        isProcessingDialogue = false;

        return;
    }
    isProcessingDialogue = true;
    const step = dialogueQueue.shift();

    if (step.text) {
        document.getElementById("faces").src = `img/hud/faces/${step.face}.png`;
        document.getElementById("speakerName").innerText = step.speaker;
        typeText("regularText", step.text);
        setTimeout(processDialogue, 2500);
    } else if (step.choices) {
        showChoices(step.choices);
    } else if (step.action) {
        step.action();
        processDialogue();
    }
    console.log("Processing step in scene:", currentScene, step);
}

// Displays choices in the HUD.
function showChoices(choices) {
    typeText("regularText", "");

    const choiceIDs = ["choiceOne", "choiceTwo", "choiceThree"];
    const textIDs = ["choiceTextone", "choiceTexttwo", "choiceTextthree"];

    // Clear all choice text areas first
    textIDs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = "";
    });

    choices.forEach((text, i) => {
        const el = document.getElementById(choiceIDs[i]);
        const textEl = document.getElementById(textIDs[i]);
        if (!el || !textEl) return;

        el.classList.remove("hidden");
        el.classList.add("show");

        // Display the correct text for each choice
        textEl.textContent = text; // Directly set the text
    });
}


// Director function for handling choice button clicks.
function director(selected) {
    const index = { One: 0, Two: 1, Three: 2 }[selected];
    onChoice(index);
}

// Branch based on the chosen dialogue option.
function onChoice(index) {

    // Hide all choices:
    ["choiceOne", "choiceTwo", "choiceThree"].forEach(id => {
        document.getElementById(id).classList.add("hidden");
        document.getElementById(id).classList.remove("show");
    });
    currentChoice = index;
    console.log("Choice made:", currentChoice);
    // For this example, we branch from the tutorial scene:
    if (currentScene === "tutorialIntro") {
        if (currentChoice === 0 || currentChoice === 1) {
            startScene("bugResponse");
        }
        else if (currentChoice === 2) {
            startScene("bugResponseOffered");
        }

    }

    if (currentScene === "mentorKillBug") {
        if (currentChoice === 0) {
            startScene("showAround");
        }
    }

    if (currentScene === "momComes") {

        if (currentChoice === 0) {
            hudChange("town")
            waitingForChoice = false
        }
        else if (currentChoice === 1) {
            hudChange("town")
            waitingForChoice = false
        }
    }




}

function mentorMove(condition) {
    if (condition === "touchPlayer") {
        mentor.touchObject = "player";
        mentor.moving = true;
        mentor.targetX = player.x;
        mentor.targetY = player.y;

    }

    if (condition === "moveHouse") {
        mentor.touchObject = "firstMove";
        mentor.moving = true;
        mentor.targetX = 1050;
        mentor.targetY = -200;
    }

    if (condition === "moveSecond") {
        mentor.touchObject = "secondMove";
        mentor.y = 400;
        mentor.moving = true;
        mentor.targetX = 1050;
        mentor.targetY = -200;


    }

    if (condition === "leaveShop") {
        mentor.touchObject = "leaveShop";
        mentor.moving = true;
        mentor.targetX = 1000;
        mentor.targetY = 1000;


    }

    if (condition === "bugLearn") {
        mentor.touchObject = "bugLearn";
        mentor.moving = true;
        mentor.targetX = -150;
        mentor.targetY = 300;


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

    if (waitingForChoice) {
        controller.left = false;
        controller.right = false;
        controller.up = false;
        controller.down = false;
    }

    if (start) {
        screen = 1;
        screenChange(1);
        start = false;
    }



    if ((player.y <= -82) && (player.x >= 967) && (player.x <= 1150) && screen === 1 && currentScene === "showAround") {
        screen = 2;
        screenChange(2);
        player.y = 909;
        mentor.x = 1050
        mentor.y = 700

        startScene("mentorMoveMore");
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

    if ((player.y <= -81) && (player.x >= 996) && (player.x <= 1128) && screen === 2 && currentScene === "mentorMoveMore") {
        screen = 3;
        screenChange(3);
        player.y = 909;
        mentor.x = 1050
        mentor.y = 700

        startScene("MentorOutsidePotionShop");
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

        if (currentScene === "mentorInsidePotionShop") {
            screen = 3;
            screenChange(3);
            player.y = 680;
            mentor.x = 1050
            mentor.y = 700

            player.health = 100;


            startScene("bugFight");
        }
        else {
            screen = 3;
            screenChange(3);
            player.y = 680;
        }
    }

    if ((player.x <= -57) && (player.y >= 281) && (player.y <= 384) && screen === 3) {

        if (currentScene === "bugFight") {
            screen = 4;
            screenChange(4);
            player.x = context.canvas.width - player.width;
            mentor.x = context.canvas.width - mentor.width
            player.y = 600

            enemy = [createEnemy(100, 100, 100, 300, "img/enemies/bugs/blueBug.png")]
            player.attackDamage = 20;
            enemy[0].attackDamage = 5;
            startScene("bugLearn");
        }
        else {
            screen = 4;
            screenChange(4);
            player.x = context.canvas.width - player.width;
            player.attackDamage = 20;

            enemy = [
                createEnemy(100, 100, 100, 300, "img/enemies/bugs/blueBug.png"),
                createEnemy(100, 100, 100, 500, "img/enemies/bugs/blueBug.png"),
                createEnemy(100, 100, 100, 700, "img/enemies/bugs/blueBug.png"),
                createEnemy(100, 100, 100, 900, "img/enemies/bugs/blueBug.png"),
                createEnemy(100, 100, 100, 1100, "img/enemies/bugs/blueBug.png")
            ]
        }
    }

    if ((player.x >= 2000 + player.width) && (player.y >= 268) && (player.y <= 508) && screen === 4) {


        screen = 3;
        screenChange(3);

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


    if (fastBattle) {

        context.drawImage(fastImage, fast.x, fast.y, fast.width, fast.height);

        const barWidth = fast.width;
        const barHeight = 6;
        const barX = fast.x;
        const barY = fast.y - 10;
        const healthPercent = fast.health / fast.maxHealth;
        context.fillStyle = "gray";
        context.fillRect(barX, barY, barWidth, barHeight);
        context.fillStyle = "red";
        context.fillRect(barX, barY, barWidth * healthPercent, barHeight);


    }



    if (mentor.moving) {
        if (mentor.touchObject === "player") {
            if (!collisionDetectionOverlap(player, mentor)) {

                let dx = mentor.targetX - mentor.x;
                let dy = mentor.targetY - mentor.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance > 5) {
                    let vx = (dx / distance) * 5;
                    let vy = (dy / distance) * 5;
                    mentor.x += vx;
                    mentor.y += vy;
                }




            }
            else {
                mentor.moving = false; // Stop moving once the mentor reaches the target
                if (currentScene === "mentorHelp") {
                    startScene("mentorKillBug");

                }
            }

        }


        if (mentor.touchObject === "firstMove") {
            // Check if within tolerance range of target position
            if (Math.abs(mentor.x - mentor.targetX) > 2 || Math.abs(mentor.y - mentor.targetY) > 2) {

                let dx = mentor.targetX - mentor.x;
                let dy = mentor.targetY - mentor.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let vx = (dx / distance) * 5;
                let vy = (dy / distance) * 5;
                mentor.x += vx;
                mentor.y += vy;
            } else {
                mentor.moving = false;
                waitingForChoice = false;
            }
        }


        if (mentor.touchObject === "secondMove" || mentor.touchObject === "leaveShop" || mentor.touchObject === "bugLearn") {
            // Check if within tolerance range of target position
            if (Math.abs(mentor.x - mentor.targetX) > 2 || Math.abs(mentor.y - mentor.targetY) > 2) {

                let dx = mentor.targetX - mentor.x;
                let dy = mentor.targetY - mentor.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let vx = (dx / distance) * 5;
                let vy = (dy / distance) * 5;
                mentor.x += vx;
                mentor.y += vy;
            } else {
                mentor.moving = false;
                waitingForChoice = false;
            }
        }




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

                // ====================================================
                // Fast Quest healing check
                // ====================================================

                if (currentScene === "bugResponse" || currentScene === "bugResponseOffered") {

                    if (player.health <= 50) {
                        console.log("test:")
                        startScene("mentorHelp");
                    }
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
        if (attacker.health <= 0) {
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

    circularBarrier.forEach(ellipse => {
        detectCircularCollision(player, ellipse)
    });
    
    
    


    // Example: Trigger dialogue for a branch (replace with your own condition).
    // For instance, when choice === -1 or when reaching a specific area.
    // Uncomment the next lines to start the dialogue sequence:
    //
    if (!isProcessingDialogue && path === "fastPath" && choice === 0) {
        player.x = 217
        player.y = 370
        enemy = [
            createEnemy(100, 80, 1900, 800, "img/enemies/bugs/blueBug.png")
        ]

        enemy[0].attackDamage = 50;
        hudChange("room");
        // startScene("tutorialIntro");
        // startScene("bugFight");
        choice = 1; // Mark it as triggered

        mentor.x = 1050;
        mentor.y = -300;

        console.log("apple")
    }
}

function render() {
    // Update scaling for current screen
    if (screen === 105) {
        scaleFactor = 0.7;
    } else {
        scaleFactor = 0.35;
    }
    scaledWidth = frameWidth * scaleFactor * 1.2;
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

        context.fillStyle = "red";
        context.fillRect(bar.x, bar.y, bar.width, bar.height);

        collisionDetection(player, bar);
    });

    circularBarrier.forEach(ellipse => {
        context.beginPath();
        context.ellipse(
            ellipse.x,
            ellipse.y,
            ellipse.width / 2,
            ellipse.height / 2,
            0,
            0,
            Math.PI * 2
        );
        context.strokeStyle = "blue";
        context.lineWidth = 3;
        context.stroke();
    });
    





    context.drawImage(momImage, mom.x, mom.y, mom.width, mom.height);
    context.drawImage(mentorImage, mentor.x, mentor.y, mentor.width, mentor.height);

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

function resetScreen() {
    grass = [];
    homes = [];
    barrier = [];
    door = [];
    interactable = [];
    enemy = [];
    circularBarrier = []
}

function screenChange(screen) {
    let left = context.canvas.width - context.canvas.width
    let right = context.canvas.width
    let top = context.canvas.height - context.canvas.height
    let bottom = context.canvas.height



    switch (screen) {
        case 1:
            bg = new Image();
            bg.src = "img/bg/home.png";
            barrier = [

                //borders
                createBarrier(10, context.canvas.height, right, top),
                createBarrier(10, context.canvas.height, left, top),
                createBarrier(context.canvas.width, 10, left, bottom),
                createBarrier(context.canvas.width / 2.3, 10, left, top),
                createBarrier(context.canvas.width / 2.3, 10, right - 870, top),

                //house
                createBarrier(350, 320, left + 500, top),

                //other


            ]

            circularBarrier = [
                createEllipticalBarrier(360, 250, 295, 130),
                createEllipticalBarrier(430, 120, 320, 700)
            ];
            break;
        case 2:
            grass = [];
            homes = [];
            barrier = [];
            door = [];
            enemy = [];
            interactable = [];
            bg = new Image();
            bg.src = "img/bg/bg.png";
            break;
        case 3:
            grass = [];
            homes = [];
            barrier = [];
            door = [createDoor(90, 90, 1050, 670, 5)];
            enemy = [];
            interactable = [];
            bg = new Image();
            bg.src = "img/bg/town.png";
            hudChange("town");
            break;
        case 4:
            grass = []
            homes = [];
            barrier = [];
            door = [];
            enemy = [];
            interactable = [];
            bg = new Image();
            bg.src = "img/bg/enemySpawner.png";
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


    if (currentScene === "bugLearn") {
        startScene("momComes");
    }
}

// ====================================================
// HUD, Shop, and Potion Functions
// ====================================================
function hudChange(form) {
    // document.getElementById("moneyGained").innerText = player.money;
    // document.getElementById("faces").src = `img/hud/faces/jericho.png`;
    // document.getElementById("speakerName").innerText = "Jericho";
    // typeText("regularText", " ");
    // if (form === "room") {
    //     document.getElementById("rightSide").style.animation = "stuff 2.5s forwards";
    //     setTimeout(() => document.getElementById("leftSide").style.animation = "Shrink 2s forwards", 800);
    //     setTimeout(() => document.getElementById("right").style.animation = "textWidth 1s forwards", 1200);
    // }
    // if (form === "town") {
    //     document.getElementById("rightSide").style.animation = "gone 2.5s forwards";
    //     setTimeout(() => document.getElementById("leftSide").style.animation = "grow 2s forwards", 800);
    // }
}

function potionBuy(type) {
    if (type === "heal") {
        if (player.money >= 5) {
            player.money -= 5;
            document.getElementById("shopCoin").innerText = player.money;
            if (isTyping) {
                typeText("regularText", "");
            }
            typeText("regularText", "You bought a healing potion!");
            inventory.push("healingPotion");
        } else {
            typeText("regularText", "You don't have enough money!");
        }
    } else if (type === "shield") {
        if (player.money >= 5) {
            player.money -= 5;
            document.getElementById("shopCoin").innerText = player.money;
            if (isTyping) {
                typeText("regularText", "");
            }
            typeText("regularText", "You bought a shield potion!");
            inventory.push("shieldPotion");
        } else {
            typeText("regularText", "You don't have enough money!");
        }
    } else if (type === "speed") {
        if (player.money >= 5) {
            player.money -= 5;
            document.getElementById("shopCoin").innerText = player.money;
            if (isTyping) {
                typeText("regularText", "");
            }
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
    const threeMinutes = 180; // in seconds

    const displayMap = {
        speedPotion: '#timerSpeed',
        strengthPotion: '#timerStrength'
    };

    const potionEffects = {
        healingPotion: () => {
            if (player.health < 100) {
                player.health = Math.min(100, player.health + 5);
                document.getElementById("healthFill").style.width = player.health + "%";
            } else {
                return false; // Don't consume potion if at full health
            }
        },
        shieldPotion: () => {
            player.shield += 5;
            document.getElementById("shieldFill").style.width = player.shield + "%";
        },
        speedPotion: () => {
            const oldSpeed = 6; // original speed
            player.speed = oldSpeed + 1;

            // Clear previous timer
            if (speedPotionTimeout) clearTimeout(speedPotionTimeout);

            speedPotionTimeout = setTimeout(() => {
                player.speed = oldSpeed;
                speedPotionTimeout = null;
            }, threeMinutes * 1000);
        },
        strengthPotion: () => {
            const oldAttack = 1; // original attack damage
            player.attackDamage = oldAttack + 5;

            // Clear previous timer
            if (strengthPotionTimeout) clearTimeout(strengthPotionTimeout);

            strengthPotionTimeout = setTimeout(() => {
                player.attackDamage = oldAttack;
                strengthPotionTimeout = null;
            }, threeMinutes * 1000);
        }

    };

    const effect = potionEffects[type];

    if (!effect) {
        console.warn(`Potion type "${type}" not recognized.`);
        return;
    }

    const success = effect();

    if (success === false) return; // Don't consume if healing is unnecessary

    // Remove one potion from inventory
    const index = inventory.indexOf(type);
    if (index !== -1) {
        inventory.splice(index, 1);
    }

    // Start timer display if applicable
    const displaySelector = displayMap[type];
    if (displaySelector) {
        const display = document.querySelector(displaySelector);
        if (display) {
            const effectType = type.replace("Potion", "").toLowerCase(); // "speed" or "strength"
            startCountdown(threeMinutes, display, effectType);
        }
    }

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

function startCountdown(duration, display, type) {
    let timer = duration;
    let minutes, seconds;

    // Clear the old interval if it exists
    if (type === "speed" && speedCountdownInterval) {
        clearInterval(speedCountdownInterval);
    }
    if (type === "strength" && strengthCountdownInterval) {
        clearInterval(strengthCountdownInterval);
    }

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

    // Store interval reference
    if (type === "speed") {
        speedCountdownInterval = intervalId;
    } else if (type === "strength") {
        strengthCountdownInterval = intervalId;
    }
}


// ====================================================
// Event Listeners for Shop and Inventory Toggling
// ====================================================
let isBrowsingShop = false;



document.addEventListener("keyup", (e) => {
    if (waitingForChoice) return;

    if (e.code === "KeyE") {
        if (isTyping) {
            // Skip dialogue
            isTyping = false;

            document.getElementById("regularText").textContent = currentText;
            return;
        }



        // Handle interactions with objects
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

        // Handle interactions with doors
        door.forEach((door) => {
            if (collisionDetectionOverlap(player, door)) {
                switch (door.houseNum) {
                    case 1:
                        screen = 101;
                        screenChange(101);
                        break;
                    case 5:
                        if (currentScene === "MentorOutsidePotionShop") {
                            screen = 105;
                            screenChange(105);
                            mentor.x = 600
                            mentor.y = 400

                            startScene("mentorInsidePotionShop");
                        } else {
                            screen = 105;
                            screenChange(105);
                        }
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

    document.getElementById("hud").style.visibility = "hidden";
    document.getElementById("shopCoin").innerText = player.money;
}

function closeShop() {
    document.getElementById("hud").style.visibility = "visible";
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

let typingTarget = null;

function typeText(elementOrId, text, callback, delay = 30) {
    const element = typeof elementOrId === "string"
        ? document.getElementById(elementOrId)
        : elementOrId;

    if (!element) {
        console.warn("typeText: Element not found");
        return;
    }

    element.textContent = "";
    let index = 0;
    isTyping = true;
    currentText = text; // Save the full text for skipping

    const interval = setInterval(() => {
        if (!isTyping) {
            clearInterval(interval);
            element.textContent = currentText; // Display the full text
            isTyping = false;
            if (callback) callback();
            return;
        }

        if (index < text.length) {
            element.textContent += text[index++];
        } else {
            clearInterval(interval);
            isTyping = false;
            if (callback) callback();
        }
    }, delay);

    // Add an event listener to skip typing
    const skipTyping = (event) => {
        if (event.code === "KeyE") {
            isTyping = false; // Stop typing
            window.removeEventListener("keydown", skipTyping); // Remove the listener
        }
    };

    window.addEventListener("keydown", skipTyping);
}




function FastBoss() {
    fastBattle = true

}

function detectCircularCollision(player, barrier) {
    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;

    const dx = playerCenterX - barrier.x;
    const dy = playerCenterY - barrier.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const playerRadius = Math.min(player.width, player.height) / 7;
    const barrierRadius = Math.max(barrier.width, barrier.height) / 2;

    if (distance < playerRadius + barrierRadius) {
        console.log("Collision with circular barrier!");
        return true;
    }

    return false;
}

  



// ====================================================
// Final: Setup Event Listeners and Start Main Loop
// ====================================================
window.addEventListener("keydown", controller.keyListener);
window.addEventListener("keyup", controller.keyListener);
window.requestAnimationFrame(loop);
