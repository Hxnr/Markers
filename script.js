    /* Pure canvas by PubNub */

    var channel = 'draw'; // Setting up canvas
    var canvas = document.getElementById('drawCanvas');
    var ctx = canvas.getContext('2d');

    var lineID = document.getElementById("canvasLineTool"); // Line tool
    var lineStatus = false;

    // Default values
    ctx.lineWidth = '3'; // Line width
    ctx.lineCap = 'round'; // Line style
    ctx.lineJoin = 'round'; // Line style
    var color = 'black'; // Default color
    var mouseDown = false; // Set mouse to be up by default

    var brushInput = document.getElementById("brushSizeInput").value; // Brush size
    var setBrushDisplay = document.getElementById("brushSizeDisplay"); // To display the brush size in HTML
    setBrushDisplay.innerHTML = brushInput; // Displaying brush size

    var isActive = false; // Drawing status
    var plots = []; // Areas to draw

    canvas.addEventListener('mousedown', startDraw, false); // Begin drawing
    canvas.addEventListener('mousemove', draw, false); // Plot points
    canvas.addEventListener('mouseup', endDraw, false); // Releasing the mouse
    canvas.addEventListener('mouseout', endDraw, false); // No longer hovering canvas    
    canvas.addEventListener("click", setSinglePixel); // Single pixels
    canvas.addEventListener('mouseout', disablePixel, false); // Disable putting pixels if the mouse is not on the canvas
    lineID.addEventListener("click", lineToolStatus); // Enabling or disabling line tool
    canvas.addEventListener("click", runLineTool); // Running line tool if enabled

    function runColorCheck() { return color = document.getElementById("colorPicker").value; } // Get the color 

    function drawOnCanvas(color, plots) {
        ctx.strokeStyle = color;
        ctx.beginPath();
        for (var i = 1; i < plots.length; i++) { ctx.lineTo(plots[i].x, plots[i].y); }
        ctx.stroke();
    }

    function setSinglePixel(e) {      
        if (mouseDown) {
            if (!lineStatus) {    
                runColorCheck();       
                ctx.strokeStyle = color;
                var x = e.offsetX || e.layerX - canvas.offsetLeft;
                var y = e.offsetY || e.layerY - canvas.offsetTop;
                ctx.beginPath();
                ctx.lineTo(x, y);
                ctx.stroke();    
            } 
        }
    }

    function lineToolStatus(e) {
        if (!lineStatus) { lineStatus = true; } 
        else if (lineStatus) { lineStatus = false; }
    }

    function runLineTool(e) {   
        if (lineStatus) {     
            runColorCheck();
            ctx.strokeStyle = color;
            var x = e.offsetX || e.layerX - canvas.offsetLeft;
            var y = e.offsetY || e.layerY - canvas.offsetTop;
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    }

    function drawFromStream(message) {
        if (!message || message.plots.length < 1) return;
        drawOnCanvas(message.color, message.plots);
    }

    function draw(e) {
        if (!isActive) return;
        if (!lineStatus) {
            var x = e.offsetX || e.layerX - canvas.offsetLeft;
            var y = e.offsetY || e.layerY - canvas.offsetTop;
            plots.push({ x: x, y: y });
            runColorCheck();
            drawOnCanvas(color, plots);
        }
    }

    function startDraw(e) { isActive = true; mouseDown = true; }

    function endDraw(e) { isActive = false; plots = []; }
    function disablePixel(e) { mouseDown = false; }
    
    function runEraser() {
        color = '#fcfcfc';
        document.getElementById("colorPicker").value = '#fcfcfc';
        runColorCheck();
    }

    function runBackground() {
        runColorCheck();
        ctx.beginPath();
        ctx.rect(0, 0, 1000, 1000);
        ctx.fillStyle = color;
        ctx.fill();
    }

    function resetDrawing() {
        ctx.beginPath();
        ctx.rect(0, 0, 1000, 1000);
        ctx.fillStyle = '#fcfcfc';
        ctx.fill();
    }

    function changeBrushSize() {
        var brushInput = document.getElementById("brushSizeInput").value;
        var setBrushDisplay = document.getElementById("brushSizeDisplay");
        setBrushDisplay.innerHTML = brushInput;
        ctx.lineWidth = brushInput;
    }

    var picker = new CP(document.querySelector('input[type="text"]'));
    picker.on("change", function (color) {
        this.source.value = '#' + color;
    });    