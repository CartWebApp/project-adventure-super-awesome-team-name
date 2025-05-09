let paralyzed = false;
let dialogueQueue = [];
let currentScene = "";
let currentChoice = -1;
let isProcessingDialogue = false;
let path = "fastPath";
let choice = 0;
let sceneFinished = false
let skills = [
    ["jab", "Power Punch", "Paralyzing Punch", "Flurry Punch"],
    ["kick", "spinning kick", "curb stomp", "vaulting strike"],
    ["spit", "dirt toss", "rest", "screech",]
]

let enemyAttacks = [
    "glitch Scratch",
    "glitchRay",
    "404 Bite",
    "Blue Screen"
]

let battle = false;
let menuSelectedTwice = false
let menu = 0;





// Updated choice event listeners use the new dialogue system's director function:
document.getElementById("choiceOne").addEventListener("click", () => director("One"));
document.getElementById("choiceTwo").addEventListener("click", () => director("Two"));
document.getElementById("choiceThree").addEventListener("click", () => director("Three"));

document.getElementById("attackOne").addEventListener("click", () => battleOptionSelected("one"));
document.getElementById("attackTwo").addEventListener("click", () => battleOptionSelected("two"));
document.getElementById("attackThree").addEventListener("click", () => battleOptionSelected("three"));
document.getElementById("Bag").addEventListener("click", () => battleOptionSelected("four"));


let player = {
    health: 100
}

let enemy = {
    health: 100
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
    bugTutorialEnd: [
        { action: () => battle = false },
        { action: () => moveCharacter("playerAttack") },
        { action: () => moveCharacter("bug") },
        { action: () => moveCharacter("playerIdle") },
        { action: () => moveCharacter("mentor") },
       
        { speaker: "Mentor", text: "Hi you must be Jericho" },
        { speaker: "Jericho", text: "Oh hi" },
        { speaker: "Mentor", text: "that bug is crazy how'd you beat him" },
        { speaker: "Jericho", text: "I don't know, it was crazy" },
        { speaker: "Mentor", text: "Hey, you want to see the town" },
        { speaker: "Jericho", choices: ["Yes", "No"]},
    ],
    LookThroughTown : [
        { action: () => document.getElementById("gameContainer").style.backgroundImage = "url(img/background/town.png)" },
        { speaker: "Mentor", text: "Welcome, to the town" },
        { speaker: "Jericho", text: "Wow, its pretty cool" },
        { speaker: "Mentor", text: "Yup, lets check out the store" },
        { action: () => document.getElementById("gameContainer").style.backgroundImage = "url(img/background/potionshop.png)" },
        { speaker: "Mentor", text: "this is the potion shop, you can buy lots of potions" },
        { action: () => document.getElementById("gameContainer").style.backgroundImage = "url(img/background/potionshop.png)" },
        { speaker: "Mentor", text: "this is the weapons shop, you can buy lots of weapons" },
        { action: () => document.getElementById("gameContainer").style.backgroundImage = "url(img/background/potionshop.png)" },
        { speaker: "Mentor", text: "this is the armor shop, you can buy lots of armor" },
        
        
        { action: () => document.getElementById("gameContainer").style.backgroundImage = "url(img/background/town.png)" },
        { action: () => moveCharacter("mentor") },
        { action: () => moveCharacter("mom") },
        { speaker: "Mom", text: "Jerichoooo, wow you look like dad" },
        { speaker: "Jericho", choices: ["I can save him", "..."]},
    ],

    noYouCant: [
        { speaker: "Mom", text: "No you cant lets go" },
        { action: () => startScene("sneakOut") },
    ],

    dotdotdot: [
        { speaker: "Mom", text: "lets go home" },
        { action: () => startScene("sneakOut") },
    ],

    sneakOut: [
        { action: () => moveCharacter("mom") },
        { action: () => document.getElementById("gameContainer").style.backgroundImage = "url(img/background/homes.png)" },
        { speaker: "Jericho", text: "Where should I go" },
        { speaker: "Jericho", choices: ["Cart", "Mall"]},
    ],

    cart: [
        { action: () => document.getElementById("gameContainer").style.backgroundImage = "url(img/background/cart.png)" },
        { speaker: "Jericho", text: "Okay I made it, time to go inside" },
        { action: () => document.getElementById("gameContainer").style.backgroundImage = "url(img/background/InsideCart.png)" },
    ],

    mall: [
        { action: () => document.getElementById("gameContainer").style.backgroundImage = "url(img/background/mall.png)" },
        { speaker: "Jericho", text: "Okay I made it, time to go inside" },
        { action: () => document.getElementById("gameContainer").style.backgroundImage = "url(img/background/cart.png)" },
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

        // if(currentScene === "noYouCant" || currentScene === "dotdotdot"){
        //     startScene("sneakOut");
            
        // }

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

    if(currentScene === "bugTutorialEnd"){
        if(currentChoice === 0){
            startScene("LookThroughTown")
            currentChoice = -1
        }
        if(currentChoice === 1){
            
        }
    }

    if(currentScene === "LookThroughTown"){
        if(currentChoice === 0){
            startScene("noYouCant")
        }
        if(currentChoice === 1){
            startScene("dotdotdot")
            
        }
    }

    if(currentScene === "sneakOut"){
        if(currentChoice === 0){
            startScene("cart")
        }
        if(currentChoice === 1){
            startScene("mall")
            
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
    if (player.health > 100) {
        player.health = 100
    }
    if (enemy.health <= 0) {
        enemy.health = 0
        enemyDie()
    }
    document.getElementById("healthFillPlayer").style.width = player.health + "%";
    document.getElementById("healthFillEnemy").style.width = enemy.health + "%";


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

    if(character === "mentor"){
        document.getElementById("mentor").classList.toggle("hidden")
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

function removeBattleScene(type) {
    typeText("regularText", " ");
    document.getElementById("fightContainer").classList.toggle("hidden")
    if (type === "bugTutorial") {
        enemy.health = 1
        document.getElementById("bug").classList.toggle("battleScene")
        document.getElementById("gameContainer").style.backgroundImage = "url(img/background/homes.png)"
        document.getElementById("playerImgAttack").classList.toggle("battleScene")
        document.getElementById("HealthContainerPlayer").classList.toggle("hidden")
        document.getElementById("HealthContainerEnemy").classList.toggle("hidden")
    }
}

//Math.floor(Math.random() * (max - min + 1)) + min;




function battleOptionSelected(optionSelected) {
    let attackDamage = 0;
    if (!paralyzed) {
        if (optionSelected === "one") {
            if (menuSelectedTwice) {
                if (menu === 1) {
                    if (skills[0][0] === "jab") {
                        typeText("battleText", "You use Jab Punch");
                        attackDamage = Math.floor(Math.random() * (10 - 5 + 1)) + 5;
                        let ran = Math.floor(Math.random() * (20 - 0 + 1)) + 0;
                        if (ran === 1) {
                            attackDamage = attackDamage * 2
                            enemy.health = enemy.health - attackDamage
                            setTimeout(() => {
                                typeText("battleText", `It did ${attackDamage} HP, critical hit!`)
                            }, 1000);
                        }
                        else {
                            enemy.health = enemy.health - attackDamage

                            setTimeout(() => {
                                typeText("battleText", `It did ${attackDamage} HP`)
                            }, 1000);
                        }
                        menuSelectedTwice = false

                        document.getElementById("attackOne").innerText = "Attack"
                        document.getElementById("attackTwo").innerText = "Secondary"
                        document.getElementById("attackThree").innerText = "Special"
                        document.getElementById("Bag").innerText = "Bag"

                        setTimeout(() => {
                            enemyAttack("bug")
                        }, 2500);


                    }

                }
                else if (menu === 2) {

                    if (skills[1][0] === "kick") {
                        typeText("battleText", "You use kick");
                        attackDamage = Math.floor(Math.random() * (15 - 10 + 1)) + 10;

                        let ran = Math.floor(Math.random() * (20 - 0 + 1)) + 0;
                        if (ran === 1) {
                            attackDamage = attackDamage * 2
                            enemy.health = enemy.health - attackDamage
                            setTimeout(() => {
                                typeText("battleText", `It did ${attackDamage} HP, critical hit!`)
                            }, 1000);
                        }
                        else {
                            enemy.health = enemy.health - attackDamage

                            setTimeout(() => {
                                typeText("battleText", `It did ${attackDamage} HP`)
                            }, 1000);
                        }
                        menuSelectedTwice = false

                        document.getElementById("attackOne").innerText = "Attack"
                        document.getElementById("attackTwo").innerText = "Secondary"
                        document.getElementById("attackThree").innerText = "Special"
                        document.getElementById("Bag").innerText = "Bag"

                        setTimeout(() => {
                            enemyAttack("bug")
                        }, 2500);
                    }

                }
                else if (menu === 3) {

                    if (skills[2][0] === "spit") {
                        typeText("battleText", "You use spit");
                        attackDamage = Math.floor(Math.random() * (5 - 0 + 1)) + 0;

                        let ran = Math.floor(Math.random() * (20 - 0 + 1)) + 0;
                        if (ran === 1) {
                            attackDamage = attackDamage * 2
                            enemy.health = enemy.health - attackDamage
                            setTimeout(() => {
                                typeText("battleText", `It did ${attackDamage} HP, the bug looks suprised it did that much`)
                            }, 1000);
                        }
                        else {
                            enemy.health = enemy.health - attackDamage

                            setTimeout(() => {
                                typeText("battleText", `It did ${attackDamage} HP, the bug... enjoyed it?`)
                            }, 1000);
                        }
                        menuSelectedTwice = false

                        document.getElementById("attackOne").innerText = "Attack"
                        document.getElementById("attackTwo").innerText = "Secondary"
                        document.getElementById("attackThree").innerText = "Special"
                        document.getElementById("Bag").innerText = "Bag"

                        setTimeout(() => {
                            enemyAttack("bug")
                        }, 2500);
                    }

                }


            } else {
                document.getElementById("attackOne").innerText = skills[0][0]
                document.getElementById("attackTwo").innerText = skills[0][1]
                document.getElementById("attackThree").innerText = skills[0][2]
                document.getElementById("Bag").innerText = skills[0][3]
                menu = 1
                menuSelectedTwice = true
            }



        }
        else if (optionSelected === "two") {
            if (menuSelectedTwice) {
                if (menu === 1) {


                    if (skills[0][1] === "Power Punch") {

                        let CHT = Math.floor(Math.random() * (10 - 0 + 1)) + 0;

                        if (CHT <= 2) {
                            typeText("battleText", "You slip and completly miss");
                        }
                        else {

                            typeText("battleText", "You use Power Punch");

                            attackDamage = Math.floor(Math.random() * (30 - 15 + 1)) + 15;

                            let ran = Math.floor(Math.random() * (20 - 0 + 1)) + 0;

                            if (ran === 1) {
                                attackDamage = attackDamage * 2
                                enemy.health = enemy.health - attackDamage
                                setTimeout(() => {
                                    typeText("battleText", `It did ${attackDamage} HP, critical hit!`)
                                }, 1000);
                            }
                            else {
                                enemy.health = enemy.health - attackDamage

                                setTimeout(() => {
                                    typeText("battleText", `It did ${attackDamage} HP`)
                                }, 1000);
                            }


                        }
                        menuSelectedTwice = false
                        document.getElementById("attackOne").innerText = "Attack"
                        document.getElementById("attackTwo").innerText = "Secondary"
                        document.getElementById("attackThree").innerText = "Special"
                        document.getElementById("Bag").innerText = "Bag"

                        setTimeout(() => {
                            enemyAttack("bug")
                        }, 2500);

                    }
                }
                else if (menu === 2) {

                    if (skills[1][1] === "spinning kick") {
                        typeText("battleText", "You use spinning kick");
                        attackDamage = Math.floor(Math.random() * (20 - 10 + 1)) + 10;

                        let ran = Math.floor(Math.random() * (20 - 0 + 1)) + 0;
                        if (ran === 1) {
                            attackDamage = attackDamage * 2
                            enemy.health = enemy.health - attackDamage
                            setTimeout(() => {
                                typeText("battleText", `It did ${attackDamage} HP, critical hit!`)
                            }, 1000);
                        }
                        else if (ran === 2 || ran === 3) {
                            attackDamage = attackDamage * 3
                            enemy.health = enemy.health - attackDamage
                            setTimeout(() => {
                                typeText("battleText", `It did ${attackDamage} HP, TRIPLE hit!`)
                            }, 1000);
                        }
                        else {
                            enemy.health = enemy.health - attackDamage

                            setTimeout(() => {
                                typeText("battleText", `It did ${attackDamage} HP`)
                            }, 1000);
                        }
                        menuSelectedTwice = false

                        document.getElementById("attackOne").innerText = "Attack"
                        document.getElementById("attackTwo").innerText = "Secondary"
                        document.getElementById("attackThree").innerText = "Special"
                        document.getElementById("Bag").innerText = "Bag"

                        setTimeout(() => {
                            enemyAttack("bug")
                        }, 2500);
                    }

                }
                else if (menu === 3) {

                    if (skills[2][1] === "dirt toss") {
                        typeText("battleText", "You use Dirt Toss");
                        attackDamage = Math.floor(Math.random() * (5 - 0 + 1)) + 0;

                        let ran = Math.floor(Math.random() * (1 - 0 + 1)) + 0;

                        if (ran === 1) {
                            paralyzed = true
                            enemy.health = enemy.health - attackDamage
                            setTimeout(() => {
                                typeText("battleText", `It did ${attackDamage} HP, It also paralyzed`)
                            }, 1000);
                        }
                        else {
                            enemy.health = enemy.health - attackDamage

                            setTimeout(() => {
                                typeText("battleText", `It did ${attackDamage} HP`)
                            }, 1000);
                        }
                        menuSelectedTwice = false

                        document.getElementById("attackOne").innerText = "Attack"
                        document.getElementById("attackTwo").innerText = "Secondary"
                        document.getElementById("attackThree").innerText = "Special"
                        document.getElementById("Bag").innerText = "Bag"

                        setTimeout(() => {
                            enemyAttack("bug")
                        }, 2500);
                    }

                }


            } else {
                document.getElementById("attackOne").innerText = skills[1][0]
                document.getElementById("attackTwo").innerText = skills[1][1]
                document.getElementById("attackThree").innerText = skills[1][2]
                document.getElementById("Bag").innerText = skills[1][3]
                menuSelectedTwice = true
                menu = 2
            }
        }
        else if (optionSelected === "three") {
            if (menuSelectedTwice) {

                if (menu === 1) {

                    if (skills[0][2] === "Paralyzing Punch") {

                        let CHT = Math.floor(Math.random() * (10 - 0 + 1)) + 0;

                        if (CHT <= 2) {
                            typeText("battleText", "You slip and completly miss");
                        }
                        else {

                            typeText("battleText", "You use Paralyzing Punch");

                            attackDamage = Math.floor(Math.random() * (20 - 10 + 1)) + 10;

                            let ran = Math.floor(Math.random() * (20 - 0 + 1)) + 0;

                            if (ran === 1) {
                                attackDamage = attackDamage * 2
                                enemy.health = enemy.health - attackDamage
                                setTimeout(() => {
                                    typeText("battleText", `It did ${attackDamage} HP, critical hit!`)
                                }, 1000);
                            }
                            else if (ran === 2 || ran === 3) {

                                paralyzed = true;

                                enemy.health = enemy.health - attackDamage

                                setTimeout(() => {
                                    typeText("battleText", `It did ${attackDamage} HP, It also paralyzed him!`)
                                }, 1000);
                            }
                            else {
                                enemy.health = enemy.health - attackDamage

                                setTimeout(() => {
                                    typeText("battleText", `It did ${attackDamage} HP`)
                                }, 1000);
                            }


                        }
                        menuSelectedTwice = false
                        document.getElementById("attackOne").innerText = "Attack"
                        document.getElementById("attackTwo").innerText = "Secondary"
                        document.getElementById("attackThree").innerText = "Special"
                        document.getElementById("Bag").innerText = "Bag"

                        setTimeout(() => {
                            enemyAttack("bug")
                        }, 2500);

                    }
                }
                else if (menu === 2) {

                    if (skills[1][2] === "curb stomp") {
                        typeText("battleText", "You use curb stomp");
                        attackDamage = Math.floor(Math.random() * (20 - 0 + 1)) + 0;

                        if (player.health < 51) {
                            attackDamage * 2
                        }

                        enemy.health = enemy.health - attackDamage

                        setTimeout(() => {
                            typeText("battleText", `It did ${attackDamage} HP`)
                        }, 1000);


                        menuSelectedTwice = false

                        document.getElementById("attackOne").innerText = "Attack"
                        document.getElementById("attackTwo").innerText = "Secondary"
                        document.getElementById("attackThree").innerText = "Special"
                        document.getElementById("Bag").innerText = "Bag"

                        setTimeout(() => {
                            enemyAttack("bug")
                        }, 2500);
                    }


                }
                else if (menu === 3) {

                    if (skills[2][2] === "rest") {
                        typeText("battleText", "You use rest");
                        attackDamage = Math.floor(Math.random() * (20 - 0 + 1)) + 0;


                        player.health = player.health + attackDamage

                        setTimeout(() => {
                            typeText("battleText", `It healed ${attackDamage} HP`)
                        }, 1000);

                        menuSelectedTwice = false

                        document.getElementById("attackOne").innerText = "Attack"
                        document.getElementById("attackTwo").innerText = "Secondary"
                        document.getElementById("attackThree").innerText = "Special"
                        document.getElementById("Bag").innerText = "Bag"

                        setTimeout(() => {
                            enemyAttack("bug")
                        }, 2500);

                    }


                }


            } else {
                console.log("yesysad")
                document.getElementById("attackOne").innerText = skills[2][0]
                document.getElementById("attackTwo").innerText = skills[2][1]
                document.getElementById("attackThree").innerText = skills[2][2]
                document.getElementById("Bag").innerText = skills[2][3]
                menuSelectedTwice = true
                menu = 3
            }
        }
        else if (optionSelected === "four") {
            if (menuSelectedTwice) {
                if (menu === 1) {
                    if (skills[0][3] === "Flurry Punch") {

                        let fightCount = Math.floor(Math.random() * (5 - 2 + 1)) + 2;
                        let totalDamage = 0;

                        typeText("battleText", "You use flurry Punch");

                        for (i = 0; i < fightCount; i++) {
                            attackDamage = Math.floor(Math.random() * (10 - 0 + 1)) + 0;
                            totalDamage = totalDamage + attackDamage
                        }

                        enemy.health = enemy.health - totalDamage

                        setTimeout(() => {
                            typeText("battleText", `It did ${totalDamage} HP`)
                        }, 1000);




                        menuSelectedTwice = false
                        document.getElementById("attackOne").innerText = "Attack"
                        document.getElementById("attackTwo").innerText = "Secondary"
                        document.getElementById("attackThree").innerText = "Special"
                        document.getElementById("Bag").innerText = "Bag"

                        setTimeout(() => {
                            enemyAttack("bug")
                        }, 2500);

                    }
                }
                else if (menu === 2) {
                    if (skills[1][3] === "vaulting strike") {
                        typeText("battleText", "You use vaulting strike");
                        attackDamage = Math.floor(Math.random() * (15 - 5 + 1)) + 5;

                        let ran = Math.floor(Math.random() * (2 - 0 + 1)) + 0;



                        if (enemy.health < 51) {
                            attackDamage * 0.5
                            enemy.health = enemy.health - attackDamage
                            setTimeout(() => {
                                typeText("battleText", `It did ${attackDamage} HP`)
                            }, 1000);
                        }
                        else {
                            enemy.health = enemy.health - attackDamage

                            setTimeout(() => {
                                typeText("battleText", `It did ${attackDamage} HP`)
                            }, 1000);
                        }
                        menuSelectedTwice = false

                        document.getElementById("attackOne").innerText = "Attack"
                        document.getElementById("attackTwo").innerText = "Secondary"
                        document.getElementById("attackThree").innerText = "Special"
                        document.getElementById("Bag").innerText = "Bag"

                        setTimeout(() => {
                            enemyAttack("bug")
                        }, 2500);
                    }
                }
                else if (menu === 3) {
                    if (skills[2][3] === "screech") {
                        typeText("battleText", "You use screech");
                        attackDamage = Math.floor(Math.random() * (20 - 0 + 1)) + 0;


                        let ran = Math.floor(Math.random() * (2 - 0 + 2)) + 0;

                        enemy.health = enemy.health - attackDamage

                        if (ran === 1) {
                            paralyzed = true
                            setTimeout(() => {
                                typeText("battleText", `It did ${attackDamage} HP, It also paralyzed`)
                            }, 1000);
                        }
                        else {


                            setTimeout(() => {
                                typeText("battleText", `It did ${attackDamage} HP`)
                            }, 1000);
                        }

                        menuSelectedTwice = false

                        document.getElementById("attackOne").innerText = "Attack"
                        document.getElementById("attackTwo").innerText = "Secondary"
                        document.getElementById("attackThree").innerText = "Special"
                        document.getElementById("Bag").innerText = "Bag"

                        setTimeout(() => {
                            enemyAttack("bug")
                        }, 2500);

                    }
                }
            }
            else {
                document.getElementById("attackOne").innerText = "Jab awd"
                document.getElementById("attackTwo").innerText = "Power qewwqe"
                document.getElementById("attackThree").innerText = "qwewqeew Punch"
                document.getElementById("Bag").innerText = "Flurry yukyuk"
                menuSelectedTwice = true
            }
        }
    }
    else {
        setTimeout(() => {
            typeText("battleText", `your paralyzed`)
        }, 2000);
        paralyzed = false;
        enemyAttack("bug")
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

        if (type === "bug") {
            battleScene("bug")
        }

        if (type === "bugTutorialEnd") {

            removeBattleScene("bugTutorial")

            startScene("bugTutorialEnd")
        }

        blackout.style.animation = 'fadeOut 0.8s ease forwards';
    }, 1800);
}

function enemyDie() {
    if (currentScene === "bugAttackScene") {
        enemy.health = 1
        startBattleTransition("bugTutorialEnd")
    }
}


function enemyAttack(type) {

    if (enemy.health >= 0) {



        typeText("battleText", ``);

        if (!paralyzed) {

            if (type === "bug") {

                let attackDamage = 0;
                let ran = Math.floor(Math.random() * (10 - 0 + 1)) + 0;
                let enemyAttackChoice;

                if (ran <= 3) {

                    enemyAttackChoice = enemyAttacks[0]

                    typeText("battleText", `Bug used ${enemyAttackChoice}`);


                    attackDamage = Math.floor(Math.random() * (10 - 0 + 1)) + 0;
                    let ran = Math.floor(Math.random() * (20 - 0 + 1)) + 0;
                    if (ran === 1) {

                        attackDamage = attackDamage * 2
                        player.health = player.health - attackDamage

                        setTimeout(() => {
                            typeText("battleText", `It did ${attackDamage} HP, critical hit!`)
                        }, 1000);
                    }
                    else {
                        player.health = player.health - attackDamage

                        setTimeout(() => {
                            typeText("battleText", `It did ${attackDamage} HP`)
                        }, 1000);
                    }

                }
                else if (ran >= 4 && ran <= 6) {
                    enemyAttackChoice = enemyAttacks[1]


                    let CHT = Math.floor(Math.random() * (10 - 0 + 1)) + 0;

                    if (CHT <= 2) {
                        typeText("battleText", "He slips and misses");
                    }
                    else {

                        typeText("battleText", `Bug used ${enemyAttackChoice}`);

                        attackDamage = Math.floor(Math.random() * (30 - 15 + 1)) + 15;

                        let ran = Math.floor(Math.random() * (20 - 0 + 1)) + 0;

                        if (ran === 1) {
                            attackDamage = attackDamage * 2
                            player.health = player.health - attackDamage
                            setTimeout(() => {
                                typeText("battleText", `It did ${attackDamage} HP, critical hit!`)
                            }, 1000);
                        }
                        else {
                            player.health = player.health - attackDamage

                            setTimeout(() => {
                                typeText("battleText", `It did ${attackDamage} HP`)
                            }, 1000);
                        }
                    }

                }
                else if (ran >= 7 && ran <= 9) {
                    enemyAttackChoice = enemyAttacks[2]

                    let CHT = Math.floor(Math.random() * (10 - 0 + 1)) + 0;

                    if (CHT <= 2) {
                        typeText("battleText", "He slips and misses");
                    }
                    else {

                        typeText("battleText", `Bug used ${enemyAttackChoice}`);

                        attackDamage = Math.floor(Math.random() * (10 - 0 + 1)) + 0;

                        let ran = Math.floor(Math.random() * (20 - 0 + 1)) + 0;

                        if (ran === 1) {
                            attackDamage = attackDamage * 2
                            player.health = player.health - attackDamage
                            setTimeout(() => {
                                typeText("battleText", `It did ${attackDamage} HP, critical hit!`)
                            }, 1000);
                        }
                        else {
                            player.health = player.health - attackDamage

                            setTimeout(() => {
                                typeText("battleText", `It did ${attackDamage} HP`)
                            }, 1000);
                        }
                    }

                }
                else if (ran === 10) {
                    enemyAttackChoice = enemyAttacks[3]


                    typeText("battleText", `Bug used ${enemyAttackChoice}`);
                    attackDamage = Math.floor(Math.random() * (10 - 0 + 1)) + 0;
                    let ran = Math.floor(Math.random() * (20 - 0 + 1)) + 0;
                    if (ran === 1) {

                        attackDamage = attackDamage * 2
                        player.health = player.health - attackDamage

                        setTimeout(() => {
                            typeText("battleText", `It did ${attackDamage} HP, critical hit! Your also Paralyzed`)
                        }, 1000);
                    }
                    else {
                        player.health = player.health - attackDamage

                        setTimeout(() => {
                            typeText("battleText", `It did ${attackDamage} HP, Your also Paralyzed`)
                        }, 1000);
                    }

                    paralyzed = true

                }
            }

        }
        else {
            setTimeout(() => {
                typeText("battleText", `Hes paralyzed`)
            }, 1000);
            paralyzed = false;
        }

    }
}

