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
    var controller = document.getElementById("control-pad");
    var finger = document.getElementById("finger");
    finger.style.backgroundColor = "white";
    this.time = 0;

    window.addEventListener("resize", reset, false);
    canvas.addEventListener("mousemove", mouseMove);
    controller.addEventListener("touchmove", touchMove);
    var ctx = canvas.getContext("2d");

    function mapper(y, x, radius) {
        radius = 2 * radius;
        if (x > controller.offsetWidth - radius) {
            x = controller.offsetWidth - radius;
        } else if (x < 0) {
            x = 0;
        }
        if (y > controller.offsetHeight - radius) {
            y = controller.offsetHeight - radius;
        } else if (y < 0) {
            y = 0;
        }
        finger.setAttribute("style", `width:${radius}px; height:${radius}px; top:${y}px; left:${x}px`);
        x = controller.offsetWidth * (1 - x / controller.offsetWidth);
        var slope = canvas.height / (0.6 * controller.offsetWidth + 2.5 * controller.offsetHeight);
        return ~~(slope * (0.6 * x + 2.5 * y));
    }


    function reset() {
        canvas.width = canvas.parentElement.offsetWidth * 0.9;
        canvas.height = canvas.parentElement.offsetHeight * 0.9;
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
    }

    reset();

    function mouseMove(event) {
        right_paddle.y = event.offsetY;
        right_paddle.constraint();
    }

    function touchMove(event) {
        event.preventDefault();
        right_paddle.y = mapper((event.touches[0].clientY - window.innerHeight + controller.offsetHeight),
            event.touches[0].clientX,
            event.touches[0].radiusX) - right_paddle.height / 2;
        right_paddle.constraint();
    }

    function updateGameArea() {
        this.time += 1;
        if (this.time >= 60) { this.time = 60; }
        clear();
        update();
        requestAnimationFrame(updateGameArea);
    }
    requestAnimationFrame(updateGameArea);

    function clear() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function update() {
        ball.update(left_paddle, right_paddle);
        left_paddle.draw();
        right_paddle.draw();
        left_paddle.idiotAi(ball, this.time);
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
        this.ai = {
            impactDistance: null,
            impactTime: null,
            speed: null,
            targetY: null,
        };
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

    idiotAi(ball, delta) {
        this.ai.speed = 0.35;
        if (ball.velocity.x < 0) {
            this.ai.impactDistance = ball.x - ball.radius;
            this.ai.impactTime = this.ai.impactDistance / ball.velocity.x;
            this.ai.targetY = ball.y + ball.velocity.y * this.ai.impactTime;

            if (this.ai.targetY < this.y + this.height / 2) {
                this.ai.speed = -this.ai.speed;
            }

            this.ai.speed *= delta
            this.y += this.ai.speed;
        }
        this.constraint();
    }
}

class Ball {
    constructor(canvas, ctx, x, y, radius) {
        this.canvas = canvas
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.velocity = new Vector2D(17, ~~(Math.random() * 22) - 10);
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
        if (this.y + this.radius + 5 > this.canvas.height || this.y < this.radius + 5) {
            this.velocity.y *= -1;
            this.upside = false;
            this.y += this.velocity.y;
        }

        this.y += this.velocity.y;
        this.x += this.velocity.x;
        this.constraint()
    }

    constraint() {
        if (this.x >= this.canvas.width || this.x <= 0) {
            this.reset();
        }
    }

    update(paddleL, paddle) {
        this.draw();
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