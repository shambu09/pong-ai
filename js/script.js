function script() {
    var canvas = writer.canvas;

    var ctx = canvas.getContext("2d");

    circle();

    function circle() {
        var radius = (canvas.height / 2) * 0.90;
        ctx.translate(canvas.width / 2, canvas.height / 2);

        drawFace(radius);
    }


    function drawFace(radius) {
        var grad;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, 2 * Math.PI);
        ctx.fillStyle = "white";
        ctx.fill();

        grad = ctx.createRadialGradient(0, 0, radius * 0.95, 0, 0, radius * 1.05);
        grad.addColorStop(0, '#333');
        grad.addColorStop(0.5, 'palegreen');
        grad.addColorStop(1, '#333');

        ctx.strokeStyle = grad;
        ctx.lineWidth = radius * 0.1;
        ctx.stroke();

        ctx.beginPath()
        ctx.arc(0, 0, radius * 0.1, 0, 2 * Math.PI);
        ctx.fillStyle = "#333";
        ctx.fill();
    }
}