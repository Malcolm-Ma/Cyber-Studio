/**
 * this file contains the functions to control the drawing on the canvas
 */
let room;
let userId;
let thickness = 4;

/**
 * it inits the image canvas to draw on. It sets up the events to respond to (click, mouse on, etc.)
 * it is also the place where the data should be sent  via socket.io
 * @param sckt the open socket to register events on
 * @param imageUrl the image url to download
 * @param color color of line
 * @param roomID id of room used for save draw in database
 * @param username username used for save draw in database
 */
function initCanvas(sckt, imageUrl, color, roomID, username) {
  socket = sckt;
  let flag = false,
    prevX, prevY, currX, currY = 0;
  let canvas = $('#canvas');
  let cvx = document.getElementById('canvas');
  let img = document.getElementById('image');
  let ctx = cvx.getContext('2d');
  img.src = imageUrl;

  // store object of draw
  let drawObject = [];
  let drawsNum = 0;

  // event on the canvas when the mouse is on it
  canvas.on('mousemove mousedown mouseup mouseout', function (e) {
    prevX = currX;
    prevY = currY;
    currX = e.clientX - canvas.position().left;
    currY = e.clientY - canvas.position().top;

    if (e.type === 'mousedown') {
      flag = true;
    }
    if (e.type === 'mouseup' || e.type === 'mouseout') {
      // end drawing, send it to database and clear list
      if (drawObject.length > 0) {
        drawsNum ++;
        sendDrawToDB(roomID, username, drawsNum, drawObject);
      }
      drawObject = [];
      flag = false;
    }
    // if the flag is up, the movement of the mouse draws on the canvas
    if (e.type === 'mousemove') {
      if (flag) {
        drawOnCanvas(canvas.width, canvas.height, prevX, prevY, currX, currY, color, thickness);
        // @todo if you draw on the canvas, you may want to let everyone know via socket.io (socket.emit...)  by sending them
        const data = {
          px:prevX,
          py: prevY,
          x: currX,
          y: currY,
          lineColor: color
        }

        // push into list
        drawObject.push({
          canvasWidth: canvas.width,
          canvasHeight: canvas.height,
          px: prevX,
          py: prevY,
          x: currX,
          y: currY,
          lineColor: color,
          thick: thickness
        });
        socket.emit('mouse', data);
      }
    }
  });

  socket.on('sendmouse', data => {
    socketPrevX = data.px
    socketPrevY = data.py
    socketCurrX = data.x
    socketCurrY = data.y
    socketColor = data.lineColor
    drawOnCanvas(canvas.width, canvas.height, socketPrevX, socketPrevY, socketCurrX, socketCurrY, socketColor, thickness)
  })

  // this is code left in case you need to  provide a button clearing the canvas (it is suggested that you implement it)
  $('#canvas-clear').on('click', function (e) {
    e.preventDefault()
    let c_width = canvas.width
    let c_height = canvas.height
    ctx.clearRect(0, 0, c_width, c_height);
    // @todo if you clear the canvas, you want to let everyone know via socket.io (socket.emit...)

  });

  // @todo here you want to capture the event on the socket when someone else is drawing on their canvas (socket.on...)
  // I suggest that you receive userId, canvasWidth, canvasHeight, x1, y21, x2, y2, color, thickness
  // and then you call
  //     let ctx = canvas[0].getContext('2d');
  //     drawOnCanvas(ctx, canvasWidth, canvasHeight, x1, y21, x2, y2, color, thickness)

  // this is called when the src of the image is loaded
  // this is an async operation as it may take time
  img.addEventListener('load', () => {
    // it takes time before the image size is computed and made available
    // here we wait until the height is set, then we resize the canvas based on the size of the image
    let poll = setInterval(function () {
      if (img.naturalHeight) {
        clearInterval(poll);
        // resize the canvas
        let ratioX = 1;
        let ratioY = 1;
        // if the screen is smaller than the img size we have to reduce the image to fit
        if (img.clientWidth > window.innerWidth)
          ratioX = window.innerWidth / img.clientWidth;
        if (img.clientHeight > window.innerHeight)
          ratioY = img.clientHeight / window.innerHeight;
        let ratio = Math.min(ratioX, ratioY);
        // resize the canvas to fit the screen and the image
        cvx.width = canvas.width = img.clientWidth * ratio;
        cvx.height = canvas.height = img.clientHeight * ratio;
        // draw the image onto the canvas
        drawImageScaled(img, cvx, ctx);
        // hide the image element as it is not needed
        img.style.display = 'none';
      }
    }, 10);
  });

}

/**
 * called when it is required to draw the image on the canvas. We have resized the canvas to the same image size
 * so ti is simpler to draw later
 * @param img
 * @param canvas
 * @param ctx
 */
function drawImageScaled(img, canvas, ctx) {
  // get the scale
  let scale = Math.min(canvas.width / img.width, canvas.height / img.height);
  // get the top left position of the image
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let x = (canvas.width / 2) - (img.width / 2) * scale;
  let y = (canvas.height / 2) - (img.height / 2) * scale;
  ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
}


/**
 * this is called when we want to display what we (or any other connected via socket.io) draws on the canvas
 * note that as the remote provider can have a different canvas size (e.g. their browser window is larger)
 * we have to know what their canvas size is so to map the coordinates
 * @param ctx the canvas context
 * @param canvasWidth the originating canvas width
 * @param canvasHeight the originating canvas height
 * @param prevX the starting X coordinate
 * @param prevY the starting Y coordinate
 * @param currX the ending X coordinate
 * @param currY the ending Y coordinate
 * @param color of the line
 * @param thickness of the line
 */
function drawOnCanvas(canvasWidth, canvasHeight, prevX, prevY, currX, currY, color, thickness) {
  //get the ration between the current canvas and the one it has been used to draw on the other comuter
  ctx = document.getElementById('canvas').getContext('2d');
  let ratioX = canvas.width / canvasWidth;
  let ratioY = canvas.height / canvasHeight;
  // update the value of the points to draw
  prevX *= ratioX;
  prevY *= ratioY;
  currX *= ratioX;
  currY *= ratioY;
  ctx.beginPath();
  ctx.moveTo(prevX, prevY);
  ctx.lineTo(currX, currY);
  ctx.strokeStyle = color;
  ctx.lineWidth = thickness;
  ctx.stroke();
  ctx.closePath();
}

/**
 * send draw as object to indexedDB and save
 * @param roomID id of current room
 * @param username username who created this draw
 * @param drawsNum number of draw in the whole history of this room
 * @param drawObject object used for draw canvas on image
 */
async function sendDrawToDB(roomID, username, drawsNum, drawObject) {
  console.log(roomID, username, drawsNum, drawObject);
  await storeCanvas({
    roomId: roomID,
    username: username,
    drawsNum: drawsNum,
    drawObject: drawObject
  });
}

