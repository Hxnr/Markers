    console.log("Markers!")
    
    /* Pure canvas by PubNub */

    var de1 = $(window).width();
    var de2 = $(window).height();
    document.getElementById("e1").innerHTML = 'screen width: ' + de1 + '<br> screen height: ' + de2;
    
    $(window).resize(function () {
        var de1 = $(window).width();
        var de2 = $(window).height();
        document.getElementById("e1").innerHTML = 'screen width: ' + de1 + '<br> screen height: ' + de2;
    });

    var channel = 'draw'; // Setting up canvas
    var canvas = document.getElementById('drawCanvas');
    var ctx = canvas.getContext('2d');

    var lineID = document.getElementById("canvasLineTool"); // Line tool
    var lineStatus = false;

    var eraserStatus = false;

    // Default values
    ctx.lineWidth = '3'; // Line width
    ctx.lineCap = 'round'; // Line style
    ctx.lineJoin = 'round'; // Line style
    var color = '#000000'; // Default color
    var mouseDown = false; // Set mouse to be up by default

    var brushInput = document.getElementById("brushSizeInput").value; // Brush size
    var setBrushDisplay = document.getElementById("brushSizeDisplay"); // To display the brush size in HTML
    setBrushDisplay.innerHTML = brushInput; // Displaying brush size

    var isActive = false; // Drawing status
    var plots = []; // Areas to draw
    var colorList = []; // Store previous color to reset to after erasing

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
        var oldcolor = color;

        colorList.push(oldcolor);
        if (!eraserStatus) {
            color = '#fcfcfc';
            document.getElementById("colorPicker").value = '#fcfcfc';
            runColorCheck();
            $('.tmU1').css('border', '1px solid green');
            eraserStatus = true;
        } else {
            $('.tmU1').css('border', '1px solid white');
            eraserStatus = false; 
            document.getElementById("colorPicker").value = (colorList.slice(-2)[0]);
         }
    }

    function lineToolStatus(e) {
        if (!lineStatus) { lineStatus = true; $('.tmU2').css('border', '1px solid green'); }
        else if (lineStatus) { lineStatus = false; $('.tmU2').css('border', '1px solid white'); }
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
        $('#canvasEraser').css('font-weight', 'normal');
        $('.tmU1').css('border', '1px solid white');   
        eraserStatus = false;
        lineStatus = false; $('.tmU2').css('border', '1px solid white');
        document.getElementById("colorPicker").value = (colorList.slice(-2)[0]);
        if (document.getElementById("colorPicker").value === 'undefined') { // in case the user hasnt had a past color
            document.getElementById("colorPicker").value = '#000000';
        }
    }

    function changeBrushSize() {
        var brushInput = document.getElementById("brushSizeInput").value;
        var setBrushDisplay = document.getElementById("brushSizeDisplay");
        setBrushDisplay.innerHTML = brushInput;
        ctx.lineWidth = brushInput;
    }

    function joinGame() {
        $('.MASTER-GAME-WIDGET').css('display', 'block');
        $('.MASTER-CONNECT-WIDGET').css('display', 'none');
    }
 
    var picker = new CP(document.querySelector('input[type="text"]'));
    picker.on("change", function (color) {
        this.source.value = '#' + color;
        eraserStatus = false; 
        $('#canvasEraser').css('font-weight', 'normal');
        tempColor = '#' + color;
        $('#colorPicker').css('background', tempColor); 
        var r = parseInt(color.substr(0, 2), 16);
        var g = parseInt(color.substr(2, 2), 16);
        var b = parseInt(color.substr(4, 2), 16);
        var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        if (yiq >= 128) {
            $('#colorPicker').css('color', 'black'); 
        } else { $('#colorPicker').css('color', 'white'); }
    });    

    // detect browser
    if ((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1) { document.getElementById('e2').innerHTML = 'browser: opera'; } else if (navigator.userAgent.indexOf("Chrome") != -1) { document.getElementById('e2').innerHTML = 'browser: chrome'; } else if (navigator.userAgent.indexOf("Safari") != -1) { document.getElementById('e2').innerHTML = 'browser: safari'; } else if (navigator.userAgent.indexOf("Firefox") != -1) { document.getElementById('e2').innerHTML = 'browser: firefox'; } else if ((navigator.userAgent.indexOf("MSIE") != -1) || (!!document.documentMode == true)) { document.getElementById('e2').innerHTML = 'browser: internet explorer / microsoft edge'; } else { document.getElementById('e2').innerHTML = 'browser: unknown'; }