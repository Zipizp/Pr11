const rulesBtn = document.getElementById("rules-btn");
const closeBtn = document.getElementById("close-btn");
const rules = document.getElementById("rules");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const gameOverMessage = document.getElementById("game-over-message");
const INITIAL_BALL_SPEED = 2;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

rulesBtn.addEventListener("click", () => rules.classList.add("show"));
closeBtn.addEventListener("click", () => rules.classList.remove("show"));
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

let animationId;
let gameStarted = false;

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 10,
  speed: INITIAL_BALL_SPEED,
  dx: INITIAL_BALL_SPEED,
  dy: -INITIAL_BALL_SPEED
};

const paddle = {
  x: canvas.width / 2 - 40,
  y: canvas.height - 20,
  w: 80,
  h: 10,
  speed: 8,
  dx: 0
};

const brickInfo = {
  w: 70,
  h: 20,
  padding: 10,
  offsetX: 45,
  offsetY: 60,
  visible: true
};

const brickRowCount = 9;
const brickColumnCount = 5;

let bricks = [];
let score = 0;

function createBricks() {
  bricks = [];
  const centerX = canvas.width / 2;

  for (let row = 0; row < brickColumnCount; row++) {
    bricks[row] = [];

    const bricksInRow = brickRowCount - row;
    const totalWidth = bricksInRow * (brickInfo.w + brickInfo.padding);
    const startX = centerX - totalWidth / 2;

    for (let col = 0; col < bricksInRow; col++) {
      const x = startX + col * (brickInfo.w + brickInfo.padding);
      const y = brickInfo.offsetY + row * (brickInfo.h + brickInfo.padding);
      bricks[row][col] = { x, y, ...brickInfo };
    }
  }
}

createBricks();

function drawScore() {
  ctx.font = "20px Arial";
  ctx.textAlign = "right";
  ctx.fillStyle = "#000";
  if (score >= 25) {
    ctx.fillText("ІПЗ найкращі!!!", canvas.width - 10, 30);
  } else {
    ctx.fillText(`Score: ${score}`, canvas.width - 10, 30);
  }
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
  ctx.fillStyle = '#0095dd';
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddle.x, paddle.y, paddle.w, paddle.h);
  ctx.fillStyle = '#0095dd';
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  bricks.forEach(column => {
    column.forEach(brick => {
      ctx.beginPath();
      ctx.rect(brick.x, brick.y, brick.w, brick.h);
      ctx.fillStyle = brick.visible ? '#0095dd' : 'transparent';
      ctx.fill();
      ctx.closePath();
    });
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawScore();
  drawBall();
  drawPaddle();
  drawBricks();
}

function movePaddle() {
  paddle.x += paddle.dx;

  if (paddle.x + paddle.w > canvas.width) {
    paddle.x = canvas.width - paddle.w;
  }

  if (paddle.x < 0) {
    paddle.x = 0;
  }
}

function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.x + ball.size > canvas.width || ball.x - ball.size < 0) {
    ball.dx *= -1;
  }

  if (ball.y - ball.size < 0) {
    ball.dy *= -1;
  }

  if (
    ball.x - ball.size > paddle.x &&
    ball.x + ball.size < paddle.x + paddle.w &&
    ball.y + ball.size > paddle.y
  ) {
    ball.dy = -ball.speed;
  }

  bricks.forEach(column => {
    column.forEach(brick => {
      if (brick.visible) {
        if (
          ball.x - ball.size > brick.x &&
          ball.x + ball.size < brick.x + brick.w &&
          ball.y + ball.size > brick.y &&
          ball.y - ball.size < brick.y + brick.h
        ) {
          ball.dy *= -1;
          brick.visible = false;
          increaseScore();
        }
      }
    });
  });

  if (ball.y + ball.size > canvas.height) {
    endGame();
  }
}

function increaseScore() {
  score++;

  if (score % 10 === 0) {
    ball.speed += 1;
    ball.dx = ball.dx > 0 ? ball.speed : -ball.speed;
    ball.dy = ball.dy > 0 ? ball.speed : -ball.speed;
  }

  if (score % (brickRowCount * brickColumnCount) === 0) {
    showAllBricks();
  }
}

function showAllBricks() {
  bricks.forEach(column => {
    column.forEach(brick => (brick.visible = true));
  });
}

function update() {
  if (!gameStarted) return;

  movePaddle();
  moveBall();
  draw();

  animationId = requestAnimationFrame(update);
}

function keyDown(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    paddle.dx = paddle.speed;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    paddle.dx = -paddle.speed;
  }
}

function keyUp(e) {
  if (
    e.key === "Right" ||
    e.key === "ArrowRight" ||
    e.key === "Left" ||
    e.key === "ArrowLeft"
  ) {
    paddle.dx = 0;
  }
}

document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

function startGame() {
  gameOverMessage.style.display = "none";
  startBtn.style.display = "none";
  rules.classList.remove("show");

  score = 0;
  paddle.x = canvas.width / 2 - paddle.w / 2;
  paddle.dx = 0;

  ball.speed = INITIAL_BALL_SPEED;
  ball.x = Math.random() * (canvas.width - ball.size * 2) + ball.size;
  ball.y = canvas.height / 2;
  ball.dx = (Math.random() < 0.5 ? -1 : 1) * INITIAL_BALL_SPEED;
  ball.dy = -INITIAL_BALL_SPEED;

  createBricks();
  gameStarted = true;

  cancelAnimationFrame(animationId);
  update();
}

function endGame() {
  gameStarted = false;
  cancelAnimationFrame(animationId);
  gameOverMessage.style.display = "block";
  startBtn.style.display = "none";
}