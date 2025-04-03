var context, controller, player, loop, playerImage, coin, coinImage;

context = document.querySelector("canvas").getContext("2d");

context.canvas.height = innerHeight - 20;
context.canvas.width = innerWidth - 20;

var frameWidth = 270;  // Width of each frame in the sprite sheet
var frameHeight = 270; // Height of each frame in the sprite sheet
var currentFrame = 0; // Track the current frame for animation
var frameCounter = 0; // Frame counter to control the animation speed
var framesPerSecond = 15; // How many frames per second (FPS) for the animation speed

playerImage = new Image();
playerImage.src = 'img/player/idle.png';

player = {
    name: "player",
    height: frameHeight,
    width: frameWidth,
    x: 144,
    x_velocity: 0,
    y: 0,
    y_velocity: 0,
    image: playerImage
};

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
            playerImage.src = 'img/player/right.png';
            frameWidth = 270
            currentFrame = (currentFrame + 1) % 4;
            framesPerSecond = 9
        }
        else if (controller.left) {
            playerImage.src = 'img/player/left3.png';
            frameWidth = 270
            currentFrame = (currentFrame + 1) % 4;
            framesPerSecond = 9
        }
        else {
            playerImage.src = 'img/player/idle.png';
            
            frameWidth = 270
            currentFrame = (currentFrame + 1) % 4;
            framesPerSecond = 20
        }

    }
}

let bg = new Image();
bg.src = "img/bg/bg3.png";

function loop() {
    updateAnimation();

    if (controller.left) {
        player.x -= 10;
    }

    if (controller.right) {
        player.x += 10;
    }

    if (controller.up) {
        player.y -= 10;
    }

    if (controller.down) {
        player.y += 10;
    }

     


    context.drawImage(bg, 0, 0, context.canvas.width, context.canvas.height);

    let scaleFactor = 0.6; // Change this value to scale up/down the sprite



    if (playerImage.complete) {
        let scaledWidth = frameWidth * scaleFactor;
        let scaledHeight = frameHeight * scaleFactor;
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
    }

   

    window.requestAnimationFrame(loop);
}

window.addEventListener("keydown", controller.keyListener);
window.addEventListener("keyup", controller.keyListener);
window.requestAnimationFrame(loop);