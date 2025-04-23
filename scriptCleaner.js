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


//list of objects in game
let grass = []
let homes = []
let barrier = []
let enemy = []
let treasure = [];

//images to add to game
let treasureImage = new Image();
let bg = new Image();
playerImage = new Image();

//image sources
playerImage.src = 'img/player/idle.png';
treasureImage.src = "img/rewards/coin.png";


//objects being made
player = {
    direction: "left",
    height: frameHeight,
    width: frameWidth,
    x: 1440,
    y: 0,
    playerAttackCooldown: 0,
    permanentCooldown: 0,
    attackedTime: 0,
    image: playerImage,
    attackDamage: 100,
    defense: 0,
    health: 100,
    money: 0
};

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
        attackDamage: 10
    };
}


function createGrass(width, height, xPosition, yPosition) {
    return {
        width: width,
        height: height,
        x: xPosition,
        y: yPosition
    };
}

function createHome(width, height, x, y, img) {
    const mainHouse = new Image();

    mainHouse.src = img;

    return {
        width,
        height,
        x,
        y,
        mainHouse
    };
}

function createBarrier(width, height, x, y) {
    return {
        width,
        height,
        x,
        y
    };
}
function createDoor(width, height, x, y, houseNum) {
    return {
        width,
        height,
        x,
        y,
        houseNum
    };
}

function createTreasure(x, y, width, height, type) {
    return {
        width,
        height,
        x,
        y,
        type,

    };
}

//movement
controller = {
    left: false,
    right: false,
    up: false,
    down: false,
    keyListener: function (event) {
        var key_state = (event.type == "keydown");

        switch (event.keyCode) {
            case 37: // left key
                controller.left = key_state;
                break;
            case 65: // A key
                controller.left = key_state;
                break;
            case 87: // W key
                controller.up = key_state;
                break;
            case 38: // up key
                controller.up = key_state;
                break;
            case 39: // right key
                controller.right = key_state;
                break;
            case 68: // D key
                controller.right = key_state;
                break;
            case 83: // S key
                controller.down = key_state;
                break;
            case 40: // down key
                controller.down = key_state;
                break;
        }
    }
};


//directs stuff
function loop() {
    update();   // Handle game state updates
    render();   // Draw everything to the screen

    requestAnimationFrame(loop); // Loop continues on the next frame
}


function update() {

    

    let inGrassSpeed = 1
    if (start) {
        screen = 2
        screenChange(2)
        start = false
    }
    if ((player.y <= -82) && (player.x >= 967) && (player.x <= 1150) && screen === 1) {
        screen = 2
        screenChange(2)
        player.y = 909
    }
    if ((player.y >= 963) && (player.x >= 933) && (player.x <= 1105) && screen === 2) {
        screen = 1
        screenChange(1)
        player.y = -60
    }
    if ((player.y <= -81) && (player.x >= 996) && (player.x <= 1128) && screen === 2) {
        screen = 3
        screenChange(3)
        player.y = 909
    }

    if ((player.y >= 976) && (player.x >= 999) && (player.x <= 1137) && screen === 3) {
        screen = 2
        screenChange(2)
        player.y = -69
        
    }




    //calculate grass so it can effect movement
    grass.forEach(grass => {
        if (collisionDetectionOverlap(player, grass)) {
            inGrassSpeed = 0.7;
        }

        
    });


    //movement
    if (controller.left) {
        player.x -= 6 * inGrassSpeed;
        player.direction = "left"
    }

    if (controller.right) {
        player.x += 6 * inGrassSpeed;
        player.direction = "right"
    }

    if (controller.up) {
        player.y -= 6 * inGrassSpeed;
        player.direction = "up"
    }

    if (controller.down) {
        player.y += 6 * inGrassSpeed;
        player.direction = "down"
    }

    //iframes
    if (player.attackedTime > 0) {
        player.attackedTime--
    }

    //player cooldown
    if (player.playerAttackCooldown > 0) {
        player.playerAttackCooldown = player.playerAttackCooldown - 1.00;
        updateCooldown(player.playerAttackCooldown)
    }


    //foreach stuff



    enemy.forEach(attacker => {
        if (attacker.cooldown > 0) {
            attacker.cooldown--;
        }

        let dx = player.x - attacker.x;
        let dy = player.y - attacker.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (attacker.state === "idle" && attacker.cooldown === 0 && distance <= 700) {
            if (distance > 125) {
                let vx = (dx / distance) * 5;
                let vy = (dy / distance) * 5;
                attacker.x += vx;
                attacker.y += vy;
            }
            else {
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
                player.attackedTime = 30

                attacker.state = "returning";
                attacker.attackTimer = 0;


                player.health = player.health - attacker.attackDamage
                document.getElementById("healthFill").style.width = player.health + "%";
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
            attacker.state = "idle"

            enemyDie(attacker);
        }

    });

    barrier.forEach(bar => {
        collisionDetection(player, bar)
    });

    door.forEach(door => {
        if (collisionDetectionOverlap(player, door)) {
            document.addEventListener('keyup', (e) => {
                if (e.code === "KeyE") {
                    screen = 101
                    screenChange(101)
                }
            });
        }
    });

    treasure.forEach(loot => {
        if (collisionDetectionOverlap(player, loot)) {
            if (loot.type === "gem") {
                player.money = player.money + 5
            }
            else {
                player.money = player.money + 1
            }
            document.getElementById("moneyGained").innerText = player.money
            treasure.splice(loot, 1)
        }
    });




}





function render() {

    let scaleFactor = 0.35;
    let scaledWidth = frameWidth * scaleFactor;
    let scaledHeight = frameHeight * scaleFactor;

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

    // barrier.forEach(bar => {
    //     context.fillStyle = "red";
    //     context.fillRect(bar.x, bar.y, bar.width, bar.height)
    // });

    // door.forEach(door => {
    //     context.fillStyle = "orange";
    //     context.fillRect(door.x, door.y, door.width, door.height);
    // });

    treasure.forEach(loot => {

        if (loot.type === "gem") {
            if (rewardType <= 5) {
                treasureImage.src = "img/rewards/greenGem.png";

            }
            else {
                treasureImage.src = "img/rewards/redGem.png";

            }
        }
        else {
            treasureImage.src = "img/rewards/coin.png";
        }


        context.drawImage(treasureImage, loot.x, loot.y, loot.width, loot.height);
    });

    grass.forEach(grass => {
        if (collisionDetectionOverlap(player, grass)) {
            inGrassSpeed = 0.7;
        }
        context.fillStyle = "orange";
        context.fillRect(grass.x, grass.y, grass.width, grass.height);
        
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
        if (e.button === 0) {
            playerAttack();
        }
    });

    updateAnimation();
}


//animation updating
function updateAnimation() {
    frameCounter++;
    if (frameCounter >= framesPerSecond) {

        frameCounter = 0;
        if (controller.right) {
            playerImage.src = 'img/player/right2.png';
            frameWidth = 155
            currentFrame = (currentFrame + 1) % 4;
            framesPerSecond = 9
        }
        else if (controller.left) {
            playerImage.src = 'img/player/left2.png';
            frameWidth = 155
            currentFrame = (currentFrame + 1) % 4;
            framesPerSecond = 9
        }
        else {
            playerImage.src = 'img/player/idle2.png';

            frameWidth = 155
            currentFrame = (currentFrame + 1) % 4;
            framesPerSecond = 20
        }



    }
}

//screen changer
function screenChange(screen) {
    switch (screen) {
        case 1:
            bg = new Image();
            bg.src = "img/bg/Homebg.png";
            
            grass = [
                createGrass(980, 409, 0, 0),
                createGrass(1040, 409, 0, 560),
                createGrass(830, 409, 1195, 0),
                createGrass(840, 409, 1185, 560),
            ];

            homes = [
                createHome(700, 600, -100, 50, "img/homes/home1.png"),
                createHome(600, 600, 450, 85, "img/homes/home2.png"),
                createHome(600, 600, 1100, 75, "img/homes/home3.png"),
                createHome(600, 600, 1500, 40, "img/homes/home4.png"),
            ];

            barrier = [
                createBarrier(280, 10, 110, 360)

            ]
            door = [
                createDoor(90, 90, 205, 370, 1)
            ]
            break;
        case 2:
            

            grass = [
                createGrass(1020, 300, 0, 0),
                createGrass(860, 300, 1165, 0),
                createGrass(780, 90, 0, 510),
                createGrass(810, 90, 1210, 510),
                createGrass(870, 210, 1155, 785),
                createGrass(870, 210, 0, 785),
            ];
            homes = []
            barrier = []
            door = []


            enemy = [
                createEnemy(100, 100, 100, 480, "img/enemies/bugs/blueBug.png")
            ]


            bg = new Image();
            // bg.src = "img/bg/bg3.png";

            bg.src = "img/bg/pathways.png";

            break;
        case 3:

            

            grass = [
                createGrass(350, 550, 0, 470),
                createGrass(350, 260, 0, 0),
                createGrass(1520, 260, 505, 0),
                createGrass(1355, 230, 505, 465),
                createGrass(670, 90, 350, 900),
                createGrass(850, 90, 1170, 900),
            ]
            homes = []
            barrier = []
            door = []
            enemy = []
            bg = new Image();
            bg.src = "img/bg/town.png";
            break;
        case 101:
            bg = new Image();
            bg.src = "img/bg/rooms/roomtest.png";
            grass = [];
            homes = [];
            barrier = [];
            door = [];
            break;
    }

}


//cant enter
function collisionDetectionOverlap(obj1, obj2) {
    if (obj1.x < obj2.x + obj2.width) {
        if (obj1.x + obj1.width > obj2.x) {
            if (obj1.y < obj2.y + obj2.height) {
                if (obj1.y + obj1.height > obj2.y) {
                    return true;
                }
            }
        }
    }

    return false;
}

//can enter

function collisionDetection(obj1, obj2) {

    let topBottom = Math.abs(obj1.y - (obj2.y + obj2.height));
    let rightLeft = Math.abs((obj1.x + obj1.width) - obj2.x);
    let leftRight = Math.abs(obj1.x - (obj2.x + obj2.width));
    let bottomTop = Math.abs((obj1.y + obj1.height) - obj2.y);

    if (obj1.x + obj1.width < obj2.x || obj1.x > obj2.x + obj2.width || obj1.y + obj1.height < obj2.y || obj1.y > obj2.y + obj2.height) {
        return false;
    }





    if ((obj1.y <= obj2.y + obj2.height && obj1.y + obj1.height > obj2.y + obj2.height) && (topBottom < rightLeft && topBottom < leftRight)) {
        obj1.y = obj2.y + obj2.height;

        return true
    }


    if ((obj1.y + obj1.height >= obj2.y && obj1.y < obj2.y) && (bottomTop < rightLeft && bottomTop < leftRight)) {
        obj1.y = obj2.y - obj1.height;

        return true

    }


    if ((obj1.x + obj1.width >= obj2.x && obj1.x < obj2.x) && (rightLeft < topBottom && rightLeft < bottomTop)) {
        obj1.x = obj2.x - obj1.width;

        return true
    }


    if ((obj1.x <= obj2.x + obj2.width && obj1.x + obj1.width > obj2.x + obj2.width) && (leftRight < topBottom && leftRight < bottomTop)) {
        obj1.x = obj2.x + obj2.width;

        return true
    }

}

//tracks player
function enemyTracking(distance, dx, dy) {
    enemy.forEach(attacker => {
        if (attacker.state === "idle" && attacker.cooldown === 0) {
            let vx = (dx / distance) * 4;
            let vy = (dy / distance) * 4;

            if (distance > 150 && distance <= 700) {

                attacker.x += vx;
                attacker.y += vy;
            } else if (distance <= 150) {

                attacker.state = "attacking";
                attacker.attackTimer = 0;
                attacker.vx = (dx / distance) * 10;
                attacker.vy = (dy / distance) * 10;

                attacker.preAttackX = attacker.x;
                attacker.preAttackY = attacker.y;

                attacker.cooldown = 90;
            }
        }
    });
}

//attacking for player
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
                    attacker.health = attacker.health - player.attackDamage
                    attacker.state = "returning";
                    attacker.attackTimer = 0;


                }
            }
        });
    }

}

//attack cooldown
function updateCooldown(percent) {

    let mutiple = player.permanentCooldown / 100

    percent = percent * mutiple


    const cooldown = document.getElementById("cooldownFill");
    const accent = document.getElementById("cooldownFillAccent");



    cooldown.style.width = percent + "%";
    accent.style.width = percent + "%";

    if (percent == 0) {
        cooldown.style.width = 100 + "%";
        accent.style.width = 100 + "%";
    }

}

//enemy dies
function enemyDie(attacker) {
    enemy.splice(attacker, 1)

    let chance = Math.floor(Math.random() * (10 - 0 + 1)) + 0;
    chance = 1


    if (chance === 1) {
        treasure = [createTreasure(attacker.x, attacker.y, 50, 50, "gem")]

        rewardType = Math.floor(Math.random() * (10 - 0 + 1)) + 0;

    }
    else {
        treasure = [createTreasure(attacker.x, attacker.y, 50, 50, "coin")]



    }

}




window.addEventListener("keydown", controller.keyListener);
window.addEventListener("keyup", controller.keyListener);
window.requestAnimationFrame(loop);