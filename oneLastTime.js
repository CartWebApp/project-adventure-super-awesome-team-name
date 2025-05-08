let dialogueQueue = [];
let currentScene = "";
let currentChoice = -1;
let isProcessingDialogue = false;
let path = "fastPath";
let choice = 0;
let sceneFinished = false

// Updated choice event listeners use the new dialogue system's director function:
document.getElementById("choiceOne").addEventListener("click", () => director("One"));
document.getElementById("choiceTwo").addEventListener("click", () => director("Two"));
document.getElementById("choiceThree").addEventListener("click", () => director("Three"));

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
        { speaker: "Bug", text: "Wow, what are you?" },
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



function moveCharacter(character){
    if(character === "playerAttack"){
        document.getElementById("playerImgAttack").classList.toggle("hidden")
    }

    if(character === "playerIdle"){
        document.getElementById("playerIdle").classList.toggle("hidden")
    }

    if(character === "mom"){
        document.getElementById("mom").classList.toggle("hidden")
    }

    if(character === "bug"){
        document.getElementById("bug").classList.toggle("hidden")
    }

    
}




// ====================================================
// Final: Setup Event Listeners and Start Main Loop
// ====================================================

window.requestAnimationFrame(loop);

// function typeTextWithGlitch(elementOrId, text, callback, delay = 30, glitchChance = 0.1) {
//     const element = typeof elementOrId === "string"
//         ? document.getElementById(elementOrId)
//         : elementOrId;

//     if (!element) {
//         console.warn("typeText: Element not found");
//         return;
//     }

//     element.textContent = "";
//     let index = 0;
//     isTyping = true;
//     currentText = text; // Save the full text for skipping

//     const glitchChars = "!@#$%^&*()_+[]{}|;:',.<>?/"; // Characters for the glitch effect

//     const interval = setInterval(() => {
//         if (!isTyping) {
//             clearInterval(interval);
//             element.textContent = currentText; // Display the full text
//             isTyping = false;
//             if (callback) callback();
//             return;
//         }

//         if (index < text.length) {
//             // Randomly decide whether to show a glitched character
//             const char = Math.random() < glitchChance
//                 ? glitchChars[Math.floor(Math.random() * glitchChars.length)]
//                 : text[index];

//             element.textContent += char;
//             index++;
//         } else {
//             clearInterval(interval);
//             isTyping = false;
//             if (callback) callback();
//         }
//     }, delay);

//     // Add an event listener to skip typing
//     const skipTyping = (event) => {
//         if (event.code === "KeyE") {
//             isTyping = false; // Stop typing
//             window.removeEventListener("keydown", skipTyping); // Remove the listener
//         }
//     };

//     window.addEventListener("keydown", skipTyping);
// }