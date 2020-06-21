function script() {
    var stop = false;
    var frameCount = 0;
    var fps, fpsInterval, startTime, now, then, elapsed;

    function start(fps) {
        fpsInterval = 1000 / fps;
        then = Date.now();
        startTime = then;
        play();
    }

    function play() {
        requestAnimationFrame(play);

        now = Date.now();
        elapsed = now - then;

        if (elapsed > fpsInterval) {
            then = now - (elapsed % fpsInterval);
            updateGameArea();
        }
    }

    var canvas = onLoad.canvas;
    canvas.width = canvas.parentElement.offsetWidth * 0.9;
    canvas.height = canvas.parentElement.offsetHeight * 0.9;
    canvas.addEventListener("mousemove", mouseMove);

    var ctx = canvas.getContext("2d");

    res = {
        paddle: {
            width: canvas.width / 100,
            height: canvas.height / 6
        },
        ball: {
            radius: canvas.width / 150
        }
    }

    left_paddle = new Paddle(canvas, ctx, 10, canvas.height / 2 - res.paddle.height / 2,
        res.paddle.width, res.paddle.height);

    right_paddle = new Paddle(canvas, ctx, canvas.width - 10 - res.paddle.width,
        canvas.height / 2 - res.paddle.height / 2,
        res.paddle.width,
        res.paddle.height)

    ball = new Ball(canvas, ctx, canvas.width / 2, canvas.height / 2, res.ball.radius);

    function mouseMove(event) {
        right_paddle.y = event.offsetY - right_paddle.height / 2;
        right_paddle.constraint();
    }

    function updateGameArea() {
        clear();
        update();
        requestAnimationFrame(updateGameArea);
    }
    requestAnimationFrame(updateGameArea);

    function clear() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function update() {
        left_paddle.draw();
        right_paddle.draw();
        ball.update(left_paddle, right_paddle);
        left_paddle.idiotAi(ball.y);
    }
}


class Paddle {
    constructor(canvas, ctx, x, y, width, height) {
        this.canvas = canvas;
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

    constraint() {
        if (this.y >= this.canvas.height - this.height) {
            this.y = this.canvas.height - this.height;
        } else if (this.y <= 0) {
            this.y = 0;
        }
    }

    idiotAi(y) {
        this.y = y - this.height / 2;
    }
}

class Ball {
    constructor(canvas, ctx, x, y, radius) {
        this.canvas = canvas
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.velocity = new Vector2D(15, ~~(Math.random() * 20) - 10);
        this.pInterB = null;
        this.angle = null;
        this.offsideLeft = true;
        this.offsideRight = true;
        this.upside = true;
        this.resetState = {
            x: x,
            y: y,
            radius: radius,
            pInterB: null,
            angle: null,
            offsideLeft: true,
            offsideRight: true,
            upside: true
        };
    }

    reset() {
        for (var stateProperty in this.resetState) {
            this[stateProperty] = this.resetState[stateProperty];
        }
        this.velocity = new Vector2D(15, ~~(Math.random() * 20) - 10);
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fill();
    }

    move() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }

    constraint(width, height) {
        if (this.y >= height || this.y <= 0 || this.x >= width || this.x <= 0) {
            this.reset();
        }

        if (this.y >= height - this.radius - 7 || this.y <= this.radius + 7) {

            if (this.upside) {
                this.velocity.y *= -1;
                this.y += this.velocity.y / Math.abs(this.velocity.y) * 7;
                this.upside = false;
            }

        } else if (this.y <= height - this.radius - 25 && this.y >= this.radius + 25) {
            this.upside = true
        }
    }

    update(paddleL, paddle) {
        this.draw();
        this.constraint(this.canvas.width, this.canvas.height);
        this.paddle_hit(paddle.x, paddle.y, paddle.height,
            paddle.width, paddleL.x, paddleL.y);
        this.move();
    }

    paddle_hit(x, y, height, width, x1, y1) {
        if (this.y >= y && this.y <= y + height) {
            if (this.x + this.radius + 3 >= x) {
                if (this.offsideRight) {
                    this.velocity.magnitude();
                    this.pInterB = (this.y - y - height / 2) / height;
                    this.x -= 2;
                    this.angle = 2 / 3 * Math.PI * this.pInterB;
                    this.velocity.x = -1 * (this.velocity.x / Math.abs(this.velocity.x)) *
                        this.velocity.length * 1.005 * Math.cos(this.angle);
                    this.velocity.y = this.velocity.length * 1.08 * Math.sin(this.angle);
                    this.offsideRight = false;
                }

            } else {
                this.offsideRight = true;
            }
        }

        if (this.y >= y1 && this.y <= y1 + height) {
            if (this.x - this.radius - 7 <= x1 + width) {

                if (this.offsideLeft) {
                    this.velocity.magnitude();
                    this.pInterB = (this.y - y1 - height / 2) / height;
                    this.x += 5;
                    this.angle = 2 / 3 * Math.PI * this.pInterB;
                    this.velocity.x = -1 * (this.velocity.x / Math.abs(this.velocity.x)) *
                        this.velocity.length * 1.005 * Math.cos(this.angle);
                    this.velocity.y = this.velocity.length * 1.08 * Math.sin(this.angle);
                    this.offsideLeft = false;
                }

            } else {
                this.offsideLeft = true;
            }
        }
    }
}

class Vector2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.length = this.magnitude();
    }

    magnitude() {
        this.length = Math.sqrt(this.x ** 2 + this.y ** 2);
        return this.length;
    }

    normalize(n) {
        n = n || 1;
        return {
            x: n * this.x / this.magnitude,
            y: n * this.y / this.magnitude
        };
    }

    multiply(n) {
        n = n || 1;
        this.x *= n;
        this.y *= n;
        this.length = this.magnitude();
    }
}