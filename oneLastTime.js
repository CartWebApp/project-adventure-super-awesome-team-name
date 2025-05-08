let dialogueQueue = [];
let currentScene = "";
let currentChoice = -1;
let isProcessingDialogue = false;
let path = "fastPath";
let choice = 0;
let sceneFinished = false
let skills = [
    ["uppercut", "left Hook", "right Hook", "left Hook"],
    ["kick"],
    ["spit"]
]
let battle = false;
let menuSelectedTwice = false


// Updated choice event listeners use the new dialogue system's director function:
document.getElementById("choiceOne").addEventListener("click", () => director("One"));
document.getElementById("choiceTwo").addEventListener("click", () => director("Two"));
document.getElementById("choiceThree").addEventListener("click", () => director("Three"));

document.getElementById("attackOne").addEventListener("click", () => battleOptionSelected("one"));
document.getElementById("attackTwo").addEventListener("click", () => battleOptionSelected("two"));
document.getElementById("attackThree").addEventListener("click", () => battleOptionSelected("three"));
document.getElementById("Bag").addEventListener("click", () => battleOptionSelected("four"));


let player = {
    health : 100
}

let enemy = {
    health : 100
}

// ====================================================
// Dialogue / Cutscene System
// ====================================================

// Dialogue state variables and scene definitions.


const scenes = {
    bugEncounter: [
        { speaker: "Mom", text: "What is that?" },
        { speaker: "Jericho", choices: ["I'm not sure", "I think it's a bug", "I'll check it out"] },

    ],
    bugResponse: [
        { speaker: "Mom", text: "You should check it out, be careful though!" },

    ],
    bugResponseOffered: [
        { speaker: "Mom", text: "Well, be careful!" },


    ],
    bugAttackScene: [
        { action: () => moveCharacter("mom") },
        { action: () => moveCharacter("playerIdle") },
        { action: () => moveCharacter("playerAttack") },
        { action: () => moveCharacter("bug") },
        { speaker: "Jericho", text: "Wow, what are you?" },
        { speaker: "Bug", text: "%#@#&*$" },

        { action: () => startBattleTransition("bug") },
        { action: () => battle = true },
        { speaker: "narrator", text: "You prepare for battle" },
    ],

};





// Start a scene by setting up the dialogue queue
function startScene(sceneName) {
    console.log("Starting scene:", sceneName);


    currentScene = sceneName;
    dialogueQueue = [...scenes[sceneName]];
    processDialogue();
}



function processDialogue() {


    if (dialogueQueue.length === 0) {
        isProcessingDialogue = false;

        if (currentScene === "bugResponse" || currentScene === "bugResponseOffered") {

            startScene("bugAttackScene");
        }

        return;
    }
    isProcessingDialogue = true;
    const step = dialogueQueue.shift();

    if (step.text) {
        // document.getElementById("faces").src = `img/hud/faces/${step.face}.png`;
        document.getElementById("speakerName").innerText = step.speaker;
        if (battle) {
            typeText("battleText", step.text);
        } else {
            typeText("regularText", step.text);
        }

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
    if (currentScene === "bugEncounter") {
        if (currentChoice === 0 || currentChoice === 1) {
            startScene("bugResponse");
        }
        else if (currentChoice === 2) {
            startScene("bugResponseOffered");
        }

    }




}


// ====================================================
// Main Game Loop, Update, and Render Functions
// ====================================================
function loop() {
    update();
    requestAnimationFrame(loop);
}

function update() {
    document.getElementById("healthFillPlayer").style.width = player.health + "%";
    document.getElementById("healthFillEnemy").style.width = player.health + "%";


    if (!isProcessingDialogue && path === "fastPath" && choice === 0) {
        startScene("bugEncounter");
        choice = 1;
    }
}


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



function moveCharacter(character) {
    if (character === "playerAttack") {
        document.getElementById("playerImgAttack").classList.toggle("hidden")
    }

    if (character === "playerIdle") {
        document.getElementById("playerIdle").classList.toggle("hidden")
    }

    if (character === "mom") {
        document.getElementById("mom").classList.toggle("hidden")
    }

    if (character === "bug") {
        document.getElementById("bug").classList.toggle("hidden")
    }


}

function battleScene(type) {
    typeText("regularText", " ");
    document.getElementById("fightContainer").classList.toggle("hidden")
    if (type === "bug") {
        enemy.health = 100
        document.getElementById("gameContainer").style.backgroundImage = "url(img/background/battle.png)"
        document.getElementById("bug").classList.toggle("battleScene")
        document.getElementById("playerImgAttack").classList.toggle("battleScene")
        document.getElementById("HealthContainerPlayer").classList.toggle("hidden")
        document.getElementById("HealthContainerEnemy").classList.toggle("hidden")
    }
}



function battleOptionSelected(optionSelected) {
    let attackDamage = 0;
    if (optionSelected === "one") {
        if (menuSelectedTwice) {

            if(skills[0][0] === "jab"){
                typeText("battleText", "You use Jab Punch");
                attackDamage = Math.floor(Math.random() * 10) + 5;

                

                if(Math.floor(Math.random() * 20) === 1){
                    attackDamage = attackDamage * 2
                    enemy.health = enemy.health - attackDamage
                    typeText("battleText", `It did ${attackDamage}, critical hit!`);
                    
                }
                else{
                    enemy.health = enemy.health - attackDamage
                    typeText("battleText", `It did ${attackDamage}`);
                }


                
            }
                
            

        } else {
            document.getElementById("attackOne").innerText = "Jab Punch"
            document.getElementById("attackTwo").innerText = "Power Punch"
            document.getElementById("attackThree").innerText = "Paralyzing Punch"
            document.getElementById("Bag").innerText = "Flurry Punch"
            
           

            menuSelectedTwice = true

        }
    }
}

// ====================================================
// Final: Setup Event Listeners and Start Main Loop
// ====================================================

window.requestAnimationFrame(loop);

function startBattleTransition(type) {
    const flash = document.getElementById('flash-overlay');
    const blackout = document.getElementById('blackout-overlay');
    const gameArea = document.getElementById('gameContainer');

    // 1. Start shake
    gameArea.style.animation = 'shake 0.5s ease';

    // 2. Flash effect
    flash.style.animation = 'flash 0.8s ease';

    // 3. After flash ends, fade in black
    setTimeout(() => {
        flash.style.animation = '';
        blackout.style.animation = 'fadeIn 0.8s ease forwards';
    }, 800);

    // 4. End shake
    setTimeout(() => {
        gameArea.style.animation = '';
    }, 500);

    setTimeout(() => {
        blackout.style.animation = '';
        
        if(type === "bug"){
            battleScene("bug")
        }
        blackout.style.animation = 'fadeOut 0.8s ease forwards';
    }, 1800);
}

