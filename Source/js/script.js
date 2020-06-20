function script() {
    var canvas = onLoad.canvas;
    canvas.width = canvas.parentElement.offsetWidth * 0.9;
    canvas.height = canvas.parentElement.offsetHeight * 0.9;
    var ctx = canvas.getContext("2d");

    res = {
        paddle: {
            width: canvas.width / 100,
            height: canvas.height / 4
        },
        ball: {
            radius: canvas.width / 100
        }
    }

    left_paddle = new Paddle(ctx, 10, canvas.height / 2 - res.paddle.height / 2,
        res.paddle.width, res.paddle.height);

    right_paddle = new Paddle(ctx, canvas.width - 10 - res.paddle.width,
        canvas.height / 2 - res.paddle.height / 2,
        res.paddle.width,
        res.paddle.height)

    ball = new Ball(ctx, canvas.width / 2, canvas.height / 2, res.ball.radius);

    canvas.addEventListener("mousemove", mouseMove);

    left_paddle.draw();
    right_paddle.draw();
    ball.draw();


    setInterval(updateGameArea, 50);

    function updateGameArea() {
        clear();
        update();
    }

    function mouseMove(event) {
        right_paddle.y = event.offsetY;

    }

    function clear() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function update() {
        left_paddle.draw();
        right_paddle.draw();
        ball.draw();
    }

}


class Paddle {
    constructor(ctx, x, y, width, height) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw() {
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Ball {
    constructor(ctx, x, y, radius) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fill();
    }
}