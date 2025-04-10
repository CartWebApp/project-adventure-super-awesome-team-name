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
let homes = []
let barrier = []

let bg = new Image();


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

function createHome(width, height, x, y, backImgSrc, frontImgSrc) {
    const backImage = new Image();
    const frontImage = new Image();
    backImage.src = backImgSrc;
    frontImage.src = frontImgSrc;

    return {
        width, 
        height,
        x, 
        y,
        backImage,
        frontImage
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


function screenChange(screen){
    if(screen === 1){
        bg = new Image();
        bg.src = "img/bg/bg5.png";
        grass = [
            createGrass(980, 409, 0, 0),
            createGrass(1040, 409, 0, 560),
            createGrass(830, 409, 1195, 0),
            createGrass(840, 409, 1185, 560),
        ];

        homes = [
            createHome(300, 200, 200, 300, "img/homes/home1_back.png", "img/homes/home1_front.png"),
        ];

        barrier = [
            createBarrier(300, 200, 100, 100)
        ]
    }
    else if(screen === 2){
        grass = [
            createGrass(1030, 330, 0, 0),
            createGrass(870, 330, 1155, 0),
            createGrass(870, 160, 0, 480),
            createGrass(770, 160, 1255, 480),
            createGrass(870, 210, 1155, 785),
            createGrass(870, 210, 0, 785),
        ];
        bg = new Image();
        bg.src = "img/bg/bg3.png";


    }
}




function loop() {
    updateAnimation();
    context.drawImage(bg, 0, 0, context.canvas.width, context.canvas.height);

    let inGrassSpeed = 1
    let scaleFactor = 0.35;


    if((player.x > 941 && player.x < 1089) && (player.y >= 993) && screen == 2){
        screen = 1
        console.log("test")
        screenChange(1)
        player.y = 0
    }


    if (screen == 2) {
        screenChange(2)
    }
    

    screen = 1
        
        screenChange(1)





    grass.forEach(grass => {
        if (collisionDetection(player, grass)) {
            inGrassSpeed = 0.7;
        }

        // context.fillStyle = "green";
        // context.beginPath();
        // context.rect(grass.x, grass.y, grass.width, grass.height);
        // context.fill();
        
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




    homes.forEach(home => {
        if (home.backImage.complete) {
            context.drawImage(home.backImage, home.x, home.y, home.width, home.height- 50);
        }
        
        context.strokeRect(home.x, home.y, home.width, home.height);
        context.strokeStyle = "red";
        context.lineWidth = 2;



        context.fillStyle = "#FFFFFF";
        context.beginPath();
        context.rect(barrier.x, barrier.y, barrier.width, barrier.height);
        context.fill();

        
    });


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

       
   
        
    }

    
    homes.forEach(home => {
        if (home.frontImage.complete) {
            home.y = home.y - 250;
            home.height = home.height + 50;
            context.drawImage(home.frontImage, home.x, home.y, home.width, home.height);
        }

        // context.strokeStyle = "red";
        // context.lineWidth = 2;
        // context.strokeRect(home.x, home.y, home.width, home.height);
        
    });








    window.requestAnimationFrame(loop);
}

window.addEventListener("keydown", controller.keyListener);
window.addEventListener("keyup", controller.keyListener);
window.requestAnimationFrame(loop);




function collisionDetection(obj1, obj2) {
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






