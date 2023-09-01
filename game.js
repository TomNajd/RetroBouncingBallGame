// Our currentScene variable which keeps track of the scene we're currently in : 
let currentScene = 2;

// All of our scenes : 
let scenes = {
    splashScene: 0,
    mainMenu: 1,
    level1: 2,
    level2: 3,
    leaderboard: 4
}

// This object keeps track of our mouse's x and y coordinates, but for the time being they are set to undefined : 
let mouse = {
    x: undefined,
    y: undefined
}

// Our canvas size object : 
let canvas = {
    width: innerWidth,
    height: innerHeight
}
// Our preload function which loads all our assets and sounds :
let splash_img;
let soundOnBtn;
let soundOffBtn;
let menu_logo;
let play_btn;
let soundImg;
let track1;
let track2;
let map1;
let map2;
let bricks;
let data;
function preload() {
    // Loading our images : 
    splash_img = loadImage("Assets/splash_logo.png");
    menu_logo = loadImage("Assets/menu_logo.png");
    play_btn = loadImage("Assets/play.png");
    soundOnBtn = loadImage("Assets/SoundOnBtn.png");
    soundOffBtn = loadImage("Assets/SoundOffBtn.png");
    // Loading our level1 map : 
    map1 = loadStrings("Levels/level1_data.txt");
    // Loading our level2 map : 
    map2 = loadStrings("Levels/level2_data.txt");
    // Loading our json data :
    data = loadJSON("data.json");
    // Loading our sounds : 
    track1 = loadSound("Sounds/track1.wav");
    track2 = loadSound("Sounds/click.mp3");

}
let enemyVel = -1.5;
// Our setup function which sets up our game environment : 
function setup() {
    new Canvas(canvas.width, canvas.height);
    world.gravity.y = 10;
}

let drawSoundImg = true;
let i = 0;
let pointRectCollision = true;
let drawLev = true;
let playerSpeed = 5;
let playerJumpSpeed = 30;
let player;
let traps;
let enemy;
let exit;
let score = 0;
let tiles;
let j = 0;
let drawSplashScreen = true;
let nameEntered = false;
let inp;
// Our draw function that acts as our animation loop : 
function draw() {
    // Starting the music : 
    if (!track1.isPlaying()) {
        track1.play();
    }
    if (localStorage.getItem("level") == "3") {
        drawSplashScreen = false;
        currentScene = scenes.level2;
    }
    // Loading scene : 
    if (currentScene == scenes.splashScene) {
        // Our background : 
        background(175, 207, 240)
        image(splash_img, 0, 0, canvas.width, canvas.height)
    }
    // Main menu scene : 
    else if (currentScene == scenes.mainMenu) {
        // Our background :
        background(175, 207, 240);
        menu_logo.width = 300;
        menu_logo.height = 200;
        image(menu_logo, (canvas.width / 2) - menu_logo.width / 2, canvas.height / 6);
        // Now drawing buttons : 
        // Play button : 
        play_btn.width = 140;
        play_btn.height = 60;
        image(play_btn, (canvas.width / 2) - play_btn.width / 2, canvas.height / 2);
        if (pointRectDist(mouse.x, mouse.y, (canvas.width / 2) - play_btn.width / 2, canvas.height / 2, play_btn.width, play_btn.height)) {
            inp = createInput('');
            textSize(20);
            text("Write your name and press enter .",canvas.width / 2 - 150, 80);
            inp.position(canvas.width / 2 - 50, 100);
            inp.size(100);
            inp.input(myInputEvent);
        }
        if (drawSoundImg) {
            soundImg = soundOnBtn;
        }
        // Sound on/off button :
        soundImg.width = 140;
        soundImg.height = 60;
        // Drawing our sound button image : 
        image(soundImg, (canvas.width / 2) - soundOnBtn.width / 2, canvas.height / 1.5);
        if (pointRectDist(mouse.x, mouse.y, (canvas.width / 2) - soundImg.width / 2, canvas.height / 1.5, soundImg.width, soundImg.height) && pointRectCollision) {
            i++
            soundImg = soundOffBtn;
            if (i % 2 == 0) {
                drawSoundImg = true;
                pointRectCollision = true;
            }
            else {
                drawSoundImg = false;
                pointRectCollision = false;
                track1.stop();
            }
        }
    }
    // Level 1 : 
    else if (currentScene == scenes.level1) {
        let inpTags = document.querySelectorAll("input");
        for(let i = 0; i < inpTags.length; i++){
            inpTags[i].remove();
        }
        // Drawing the background : 
        background(175, 207, 240);
        // Drawing the level : 
        drawLevel(map1);
        // Displaying the score : 
        textSize(32);
        textAlign(CENTER)
        text('Score :', canvas.width / 2, 70);
        text(`${score}`, canvas.width / 2 + 100, 70);
        score = Math.floor(player.x - 245);
        // Background scrolling : 
        if (player.x >= 576) {
            camera.x = player.x;
        }
        // Collision of player with traps : 
        traps.forEach(trap => {
            if (player.collides(trap)) {
                resetLevel()
            }
        });
        // Handling player (ball) movement : 
        if (kb.pressed('up')) player.vel.y = playerJumpSpeed;
        else if (kb.pressing('left')) player.vel.x = -playerSpeed;
        else if (kb.pressing('right')) player.vel.x = playerSpeed;
        else player.vel.x = 0;
        // Handling enemy movement and collision with player: 
        bricks.forEach(brick => {
            enemy.forEach(enem => {
                if (enem.y + enem.vel.y < enem.dest.y - 100 || enem.collides(brick)) {
                    enemyVel = -enemyVel
                }
                enem.vel.y = enemyVel;
                // Collision with player : 
                if (player.collides(enem)) {
                    resetLevel();
                }
            })
        })
        // Collision with exit : (Going to the next level)
        exit.forEach(ex => {
            if (player.collides(ex)) {
                drawLev = true;
                player.x = 250;
                player.y = 150;
                allSprites.remove();
                camera.x = (player.x + canvas.width / 2) - 250;
                // localStorage.setItem("score", score);
                currentScene = scenes.level2;
                // localStorage.setItem("level", currentScene);
                // location.reload();
            }
        })
    }
    // Level 2 : 
    else if (currentScene == scenes.level2) {
        if (!track1.isPlaying()) {
            track1.play();
        }
        if (localStorage.getItem("score") != null) {
            score = localStorage.getItem("score");
        }
        // Drawing the background : 
        background(175, 207, 240);
        // Drawing the map : 
        drawLevel(map2);
        // Displaying the score : 
        textSize(32);
        textAlign(CENTER)
        text('Score :', canvas.width / 2, 70);
        text(`${score}`, canvas.width / 2 + 100, 70);
        // Background scrolling : 
        if (player.x >= 576) {
            camera.x = player.x;
        }
        // Collision of player with traps : 
        traps.forEach(trap => {
            if (player.collides(trap)) {
                resetLevel()
            }
        });
        // Handling player (ball) movement : 
        if (kb.pressed('up')) player.vel.y = playerJumpSpeed;
        else if (kb.pressing('left')) {
            player.vel.x = -playerSpeed;
            if(score != null){
                score = Number(score) - 1;
            }
        }
        else if (kb.pressing('right')) {
            player.vel.x = playerSpeed;
            if(score != null){
                score = Number(score) + 1;
            }
        }
        else player.vel.x = 0;
        // Handling enemy movement and collision with player: 
        bricks.forEach(brick => {
            enemy.forEach(enem => {
                if (enem.y + enem.vel.y < enem.dest.y - 100 || enem.collides(brick)) {
                    enemyVel = -enemyVel
                }
                enem.vel.y = enemyVel;
                // Collision with player : 
                if (player.collides(enem)) {
                    resetLevel()
                }
            })
        })
        // Collision with exit : (Going to the next level)
        exit.forEach(ex => {
            if (player.collides(ex)) {
                // location.reload();
                allSprites.remove()
                currentScene = scenes.leaderboard;
                localStorage.clear();
            }
        })
        j++;
        if (j > 50) {
            localStorage.clear();
        }
    }
    // Leaderboard scene : 
    else if (currentScene == scenes.leaderboard) {
        background(0);
        textSize(30);
        fill(245, 10, 10);
        text("Rank", canvas.width / 2 - canvas.width / 4, 250);
        fill(7, 11, 245);
        text("Name", canvas.width / 2 - canvas.width / 15, 250);
        fill(2, 250, 93);
        text("Score", innerWidth - canvas.width / 2.6, 250);
        textSize(35);
        fill(225,0,0);
        textAlign(CENTER);
        text("Leaderboard",canvas.width / 2,100);
        let arr = data.players;
        let y = 250;
        arr.forEach(player => {
            y += 100;
            fill(245, 10, 10);
            text(player.rank, canvas.width / 2 - canvas.width / 4, y);
            fill(7, 11, 245);
            text(player.name, canvas.width / 2 - canvas.width / 15, y);
            fill(2, 250, 93);
            text(player.score, innerWidth - canvas.width / 2.6, y);
        })
    }

}

setTimeout(() => {
    if (drawSplashScreen) {
        // currentScene = 1;
    }
}, 2000)

// Our resize event listener function : 
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

addEventListener("click", (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
    // Starting the music : 
    if (!track1.isPlaying()) {
        track1.play();
    }
    track2.play();
})

// Takes a circle and rectangle's coordinates and tells if they are colliding : 
function pointRectDist(px, py, rx, ry, rwidth, rheight) {
    if (px >= rx &&         // right of the left edge AND
        px <= rx + rwidth &&    // left of the right edge AND
        py >= ry &&         // below the top AND
        py <= ry + rheight) // above the bottom
    {
        return true;
    }
    else {
        return false;
    }
}


function drawLevel(map) {
    if (drawLev) {
        // Creating our bricks : 
        bricks = new Group();
        bricks.img = "Assets/Tiles/1.png";
        bricks.w = 15;
        bricks.h = 15;
        bricks.tile = '=';
        bricks.collider = "static";
        // Creating traps : 
        traps = new Group();
        traps.img = "Assets/Tiles/11.png";
        traps.w = 15;
        traps.h = 15;
        traps.tile = "-";
        traps.collider = "static"
        // Creating our enemy : 
        enemy = new Group();
        enemy.img = "Assets/enemy.png";
        enemy.tile = "*";
        enemy.scale = 1.5;
        enemy.w = 20;
        enemy.h = 20;
        // Creating our exit : 
        exit = new Group();
        exit.img = "Assets/Exit/tile11.png";
        exit.tile = "&";
        exit.scale = 1.5;
        exit.collider = "static"
        // Drawing the map on the screen : 
        tiles = new Tiles(
            map,
            10,
            10,
            bricks.w,
            bricks.h + 2
        );
        // Drawing the player : 
        player = new Sprite();
        player.x = 250;
        player.y = 100;
        player.scale = 1.5;
        player.img = 'Assets/ball2.png';
        player.diameter = 30;
        drawLev = false;
    }
}

function resetLevel() {
    player.x = 250;
    player.y =  100;
    camera.x = (player.x + canvas.width / 2) - 250;
    location.reload();
}

function myInputEvent(){
    window.addEventListener("keydown",(e) => {
    if(e.key == "Enter"){
        localStorage.setItem(`name${random(1,500)}`,this.value());
            currentScene = scenes.level1;
        }
    })
}
