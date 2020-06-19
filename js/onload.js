document.addEventListener("DOMContentLoaded", 
    function (event) {
        var writer = {};  //Onload namespace

        var canvas = document.getElementById("game-area");
        writer.canvas = canvas;
        window.writer = writer;

        script();

    }
);