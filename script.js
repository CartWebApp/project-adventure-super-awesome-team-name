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


let screen = 2;
let grass = []


playerImage = new Image();
playerImage.src = 'img/player/idle.png';

player = {
    name: "player",
    height: frameHeight,
    width: frameWidth,
    x: 1440,
    x_velocity: 0,
    y: 0,
    y_velocity: 0,
    image: playerImage
};

function createGrass(width, height, xPosition, yPosition) {
    return {
        width: width,
        height: height,
        x: xPosition,
        y: yPosition
    };
}

function createPath(width, height, xPosition, yPosition) {
    return {
        height: height,
        width: width,
        x: xPosition,
        y: yPosition
    };
}


// Load the image


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

let bg = new Image();


if (screen == 2) {
    grass = [
        createGrass(1030, 330, 0, 0),
        createGrass(870, 330, 1155, 0),
        createGrass(870, 160, 0, 480),
        createGrass(770, 160, 1255, 480),
    ];
    bg.src = "img/bg/bg3.png";
}


function loop() {
    updateAnimation();
    context.drawImage(bg, 0, 0, context.canvas.width, context.canvas.height);


    let inGrassSpeed = 1
    let scaleFactor = 0.4;








    grass.forEach(grass => {
        if (collisionDetection(player, grass)) {
            inGrassSpeed = 0.7;
        }
        context.fillStyle = "green";
        context.beginPath();
        context.rect(grass.x, grass.y, grass.width, grass.height);
        context.fill();

        context.strokeStyle = "red";
        context.lineWidth = 2;
        context.strokeRect(grass.x, grass.y, grass.width, grass.height);
    })
    

    if (controller.left) {
        player.x -= 6 * inGrassSpeed;
    }

    if (controller.right) {
        player.x += 6 * inGrassSpeed;

    }

    if (controller.up) {
        player.y -= 6 * inGrassSpeed;
    }

    if (controller.down) {
        player.y += 6 * inGrassSpeed;
    }




    if (playerImage.complete) {

        let scaledWidth = frameWidth * scaleFactor;
        let scaledHeight = frameHeight * scaleFactor;

        player.width = scaledWidth;
        player.height = scaledHeight;
        

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

        context.strokeStyle = "red";
        context.lineWidth = 2;
        context.strokeRect(player.x, player.y, scaledWidth, scaledHeight);
   
        
    }

    




    window.requestAnimationFrame(loop);
}

window.addEventListener("keydown", controller.keyListener);
window.addEventListener("keyup", controller.keyListener);
window.requestAnimationFrame(loop);




function collisionDetection(obj1, obj2) {

    let topBottom = Math.abs(obj1.y - (obj2.y + obj2.height));
    let rightLeft = Math.abs((obj1.x + obj1.width) - obj2.x);
    let leftRight = Math.abs(obj1.x - (obj2.x + obj2.width));
    let bottomTop = Math.abs((obj1.y + obj1.height) - obj2.y);

    if (obj1.x + obj1.width < obj2.x || obj1.x > obj2.x + obj2.width || obj1.y + obj1.height < obj2.y || obj1.y > obj2.y + obj2.height) {
        return false;
    }



    if ((obj1.y <= obj2.y + obj2.height && obj1.y + obj1.height > obj2.y + obj2.height) && (topBottom < rightLeft && topBottom < leftRight)) {
        return true;
    }


    if ((obj1.y + obj1.height >= obj2.y && obj1.y < obj2.y) && (bottomTop < rightLeft && bottomTop < leftRight)) {
        return true;
    }


    if ((obj1.x + obj1.width >= obj2.x && obj1.x < obj2.x) && (rightLeft < topBottom && rightLeft < bottomTop)) {
        return true;
    }


    if ((obj1.x <= obj2.x + obj2.width && obj1.x + obj1.width > obj2.x + obj2.width) && (leftRight < topBottom && leftRight < bottomTop)) {
        return true;
    }

    return false;

}

