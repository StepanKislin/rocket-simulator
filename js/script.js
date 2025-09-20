const canvas = document.getElementById('game');
const ctx = canvas.getContext("2d");

const ground = new Image();
ground.src = "img/space.png";

const rocketImg = new Image();
rocketImg.src = "img/rocket.png";

const asteroidImg = new Image();
asteroidImg.src = "img/asteroid.png";

const moneyImg = new Image();
moneyImg.src = "img/money.png";

document.addEventListener('keydown', function(event) {
  if (event.code === 'Space') {

    $('#start-screen').css("display", "none");
    $('#game').css("display", "grid");

    let box = 64;
    let score = 0;

    let gameActive = true;

    let asteroids = [];

    let rocket = [];
    rocket[0] = {
      x: 4.5 * box,
      y: 9 * box
    };

    let coins = [];

    document.addEventListener("keydown", direction);

    let dir;

    function direction(event) {
      if (event.keyCode == 65) {        // A
        dir = "left";
      } else if (event.keyCode == 68) { // D
        dir = "right";
      }
    }

    let time = 60;
    const timer = setInterval(() => {
      time <= 0 ? clearInterval(timer) : time--;
    }, 1000);

    function createNewCoin() {
      let newCoin = {
        x: Math.floor(Math.random() * 10) * box,
        y: 0
      };
      coins.push(newCoin);
    }
    setInterval(createNewCoin, 2000);

    function createNewAsteroid() {
      let newAsteroid = {
        x: Math.floor(Math.random() * 10) * box,
        y: 0
      };
      asteroids.push(newAsteroid);
    }

    setInterval(createNewAsteroid, 2000);

    function drawGame() {
      ctx.drawImage(ground, 0, 0);


      ctx.drawImage(rocketImg, rocket[0].x, rocket[0].y);

      // Рисуем монеты
      for (let i = 0; i < coins.length; i++) {
        ctx.drawImage(moneyImg, coins[i].x, coins[i].y);
        coins[i].y += box / 6;
      }

      for (let i = 0; i < asteroids.length; i++) {
        ctx.drawImage(asteroidImg, asteroids[i].x, asteroids[i].y);
        asteroids[i].y += box / 5;
      }

      ctx.fillStyle = "white";
      ctx.font = "1rem Arial";
      ctx.fillText("Счет: " + score, box * 8, box * 11);

      let rocketX = rocket[0].x;
      let rocketY = rocket[0].y;


      if (rocketX > 576) {
        dir = "left";
      } else if (rocketX < 0) {
        dir = "right";
      }

      if (time <= 0) {
        $('#game-over').css("display", "grid");
        $('#game').css("display", "none");
        gameActive = false;
      }

      for (let i = 0; i < asteroids.length; i++) {
        if (
            rocketX < asteroids[i].x + box &&
            rocketX + box > asteroids[i].x &&
            rocketY < asteroids[i].y + box &&
            rocketY + box > asteroids[i].y
        ) {
          $('#game-over').css("display", "grid");
          $('#game').css("display", "none");
          gameActive = false;
          break;
        }
      }

      for (let i = 0; i < coins.length; i++) {
        if (
            rocketX < coins[i].x + box &&
            rocketX + box > coins[i].x &&
            rocketY < coins[i].y + box &&
            rocketY + box > coins[i].y
        ) {
          if (gameActive) {
            score++;
          }
          coins.splice(i, 1);
          break;
        }
      }

      ctx.fillStyle = "white";
      ctx.font = "1rem Arial";
      ctx.fillText("Таймер: " + time, box * 0, box * 11);

      if (dir === "left") rocketX -= box / 3;
      if (dir === "right") rocketX += box / 3;

      let newRocket = {
        x: rocketX,
        y: rocket[0].y
      };
      rocket.unshift(newRocket);

      // Обновляем DOM с финальным счётом
      document.getElementById("final-score").innerHTML = "Твой результат: " + score;
    }

    let game = setInterval(drawGame, 100);
  }
});

function reloadButton() {
  window.location.reload();
}