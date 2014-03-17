function TinyFlap(cnvs) {
  // Colour lookup table
  this.colours = {
    '0' : "rgba(0,0,0,0.0)", // Alpha channel
    '1' : "#434343", // Grey
    '2' : "#FFF", // White
    // Bird (Yellow)
    '3' : "#F9F124", // Top
    '4' : "#FC684C", // Beak
    '5' : "#FBBB11", // Lower (Orange)
    // Bird (Blue)
    'A' : "#14AAB5", // Top
    'B' : "#116D9C", // Lower
    // Bird (Pink)
    'C' : "#F76DD5", // Top
    'D' : "#CF3CAA", // Lower
    // Bird (Purple)
    'E' : "#574FE8", // Top
    'F' : "#443EA8", // Lower
    // Bird (Green)
    'G' : "#68F056", // Top
    'H' : "#3DC92A", // Lower
    // Bird (Red)
    'I' : "#F0485B", // Top
    'J' : "#DB2C40", // Lower
    // Logo
    'K' : "#FF6A00", // Top Orange
    'L' : "#BD540D", // Bottom Orange
    'M' : "#2D2D2D", // Outline Bottom
    // Background
    '6' : "#74D59F", // Sky Green
    '7' : "#8DDE90", // Cloud Green
    '8' : "#38B045", // Outline Bush
    '9' : "#32B13A", // Inner Bush
  };

  // The images to generate
  this.images = {
    bird : {
      width : 19,
      height : 14,
      lookup : [
        "0.26#1.6#0.11#1122212210.9#122331222210.6#111133312221210000122221331222121000012.5#133122221000013222313331.6#00001333133314.6#10000111555141.6#0.5#15.6#14.5#10.6#115.5#1.5#0.9#1.5#0.27#",
        "0.26#1.6#0.11#1122212210.9#122331222210.7#12333312221210.5#111133312221210000122221333122221000012.5#13331.6#00013222313314.6#10001333155141.6#0.5#111555514.5#10.6#115.5#1.5#0.9#1.5#0.27#"
      ],
      data : [],
      scale : 1
    },
    bush : {
      width : 0,
      height : 0,
      lookup : [
        ""
      ],
      data : [],
      scale : 1
    },
    logo : {
      width : 52,
      height : 11,
      lookup : [
        "0.53#1.14#01.11#01.9#01.13#001K.6#1KK1KK111KK1KK11KK101AAAA1AA101A.5#1A.5#1001K.6#1KK1KKK11KK1KK11KK101AA111AA101AA1AA1AA1AA100111KK111KK1KK1K1KK1K.6#101AAAA1AA111AA1AA1A.5#100001KK101KK1KK11KKK111KK11101AA111AAAA1A.5#1AA111100001KK101KK1KK111KK101KK10001AA101AAAA1AA1AA1AA10.7#111101.7#0111101111000111101.15#0.7#MLLM0MLLMLLM0MLLM0MLLM000MBBM0MBBBBMBBMBBMBBM0.7#MMMM0M.7#0MMMM0MMMM000MMMM0M.15#0.56#"
      ],
      data : [],
      scale : 3
    }
  };

  // Game states
  this.Modes = {
    WAIT : 0,
    PLAY : 1,
    RETRY : 2,
    DIE : 3
  };

  this.bird = {
    // Location
    x : 0,
    y : 0,
    speedX : 0,
    speedY : 0,
    gravity : 9,
    // Flap
    flap : false,
    flapPower : 150,
    flaps : 6,
    flapCount : 0,
    // Stuff
    image : 0,
    swap : false,
    mode : 0,
    // Drift
    drift : 7,
    driftDir : 1 / 2,
    currentDrift : 0
  };

  this.pipes = {
    every : 100,
    width : 40,
    gap : 60,

    inView : [],
    cleared : 0,
    ground : 0
  };

  this.frames = {
    amount : 0,
    last : new Date(),
    current : 0,
  };

  this.font = {
    size : 10,
    font : "10px sans-serif"
  };
}

// Compression like 0.6# means 6 zeroes, if the sequence is greater than 4 obviously
TinyFlap.prototype.decompressLookup = function () {
  for (var i in this.images) {
    var obj = this.images[i];

    for (var l in obj.lookup) {
      var str = ''; // New lookup string
    
      var times = '';
      var multiple = false;
      var code = '';
      
      for(var c in obj.lookup[l]) {
        if(obj.lookup[l][c] == '.') {
          multiple = true; // A sequence must be generated from previous code
        } else if(obj.lookup[l][c] == '#') {
          // Apply
          for(var i = 1; i < parseInt(times); i++) {
            str += code;
          }
          
          // Reset
          multiple = false;
          times = '';
        } else if(multiple) {
          times += obj.lookup[l][c]; // How many times to apply
        } else {
          code = obj.lookup[l][c];
          str += code;
        }
      }
      
      obj.lookup[l] = str; // Update the lookup
    }
  }
}

TinyFlap.prototype.createAllBirds = function () {
  var replace = {
    '3' : '3',
    '5' : '5'
  };

  for (var i = 1; i < 6; i++) {
    switch (i) {
    case 1:
      replace['3'] = 'A';
      replace['5'] = 'B';
      break; // Blue
    case 2:
      replace['3'] = 'C';
      replace['5'] = 'D';
      break; // Pink
    case 3:
      replace['3'] = 'E';
      replace['5'] = 'F';
      break; // Purple
    case 4:
      replace['3'] = 'G';
      replace['5'] = 'H';
      break; // Green
    case 5:
      replace['3'] = 'I';
      replace['5'] = 'J'; // Red
    }

    // Make all the birds
    for (var x = 0; x < 2; x++) {
      var str = this.images.bird.lookup[x].substring(0, this.images.bird.lookup[x].length); // Get this one
      str = str.replace(/3/g, replace['3']).replace(/5/g, replace['5']); // Update this one
      this.images.bird.lookup.push(str);
    }
  }
}

// Make the birds different colours
TinyFlap.prototype.changeBirdColour = function (col) {
  this.bird.image = (2 * col);
}

// Make the images
TinyFlap.prototype.makeImages = function (cnvs, ctx) {
  for (var i in this.images) {
    var obj = this.images[i];

    obj.data = [];

    for (var a in obj.lookup) {
      if (obj.lookup[a].length == (obj.width * obj.height)) {
        cnvs.height = obj.height * obj.scale;
        cnvs.width = obj.width * obj.scale;

        for (var y = 0; y < obj.height; y++) {
          for (var x = 0; x < obj.width; x++) {
            ctx.fillStyle = this.colours[obj.lookup[a].charAt((y * obj.width) + x)]; // Get pixel colour
            ctx.fillRect(x * obj.scale, y * obj.scale, obj.scale, obj.scale); // Draw pixel
          }
        }

        var newImage = document.createElement("img"); // Store image
        newImage.src = cnvs.toDataURL();
        obj.data.push(newImage);

        ctx.clearRect(0, 0, cnvs.width, cnvs.height); // Reset for next image
      } else {
        console.log("Couldn't draw image: " + obj.lookup[a]);
      }
    }
  }
}

// Update the pipe infotmation
TinyFlap.prototype.pipeLoc = function () {
  var lastPipe = (this.canvas.width / 2) + this.pipes.every;

  // Relative position
  var birdBack = this.bird.x + (this.canvas.width / 2) + this.images.bird.scale;
  var birdFront = this.bird.x + (this.canvas.width / 2) + this.images.bird.data[this.bird.image].width - this.images.bird.scale;

  var birdTop = this.bird.y + this.images.bird.scale;
  var birdBottom = this.bird.y + this.images.bird.data[this.bird.image].height - this.images.bird.scale;

  // console.log("(" + birdBack + ", " + birdFront + ")");

  // Update pipes
  for (var i in this.pipes.inView) {
    var cPipe = this.pipes.inView[i];

    // Update draw location
    cPipe.x = cPipe.acX - this.bird.x;
    lastPipe = cPipe.acX + this.pipes.width;

    // Check that it's within colision area
    if (birdFront > cPipe.acX && birdBack < lastPipe) {
      if (birdTop > cPipe.up && birdBottom < cPipe.down) {
        // The bird is between the pipe gap
      } else {
        console.log("pipe - col(" + cPipe.acX + ", " + cPipe.up + ", " + cPipe.down + ") - birdBT(" + birdBack + ", " + birdTop + ") - birdFB(" + birdFront + ", " + birdBottom + ")");
        this.bird.mode = this.Modes.DIE;
      }
    } else if (birdFront > lastPipe && !this.pipes.inView[i].passed) {
      cPipe.passed = true;
      this.pipes.cleared++;
    }

    // Don't draw this pipe anymore
    if (cPipe.x + this.pipes.width <= 0) {
      this.pipes.inView.splice(i, 1);
    }
  }

  // Check that there's enough pipes
  for (var i = 0; i < (4 - this.pipes.inView.length); i++) {
    // Y location for the pipe
    var diffMid = (Math.random() * (this.canvas.height / 2)); // Check it's in bounds

    if (diffMid < (this.pipes.gap / 2)) {
      diffMid += (this.pipes.gap / 2);
    } else if (diffMid > (this.pipes.ground + (this.pipes.gap / 2))) {
      diffMid -= (this.pipes.gap / 2);
    }

    var topPipe = diffMid - (this.pipes.gap / 2);
    var bottomPipe = diffMid + (this.pipes.gap / 2);

    // X location for the pipe
    var locX = lastPipe + this.pipes.every;
    var diffX = locX - this.bird.x;

    // Add pipe to the ones to draw
    this.pipes.inView.push({
      acX : locX,
      x : diffX,
      up : topPipe, // This should be the H of the top of the pipe
      down : bottomPipe, // This should be the Y of the bottom of the pipe
      passed : false
    });

    // Update last pipe
    lastPipe = locX + this.pipes.width;
  }
}

// KeyDown
TinyFlap.prototype.keyDown = function (event) {
  var key = String.fromCharCode(event.keyCode);

  if (key == "F" || key == "L" || key == "A" || key == "P") {
    if (this.bird.mode == this.Modes.WAIT) {
      this.bird.mode = this.Modes.PLAY; // Start the game
    } else if (this.bird.mode == this.Modes.PLAY) {
      this.bird.flap = true; // Flap the bird
    } else if (this.bird.mode == this.Modes.RETRY) {
      this.bird.mode = this.Modes.WAIT; // Player wishes to retry
    }
  } else if (key == "C") {
    if (this.bird.mode == this.Modes.WAIT) {
      this.changeBirdColour(Math.floor(Math.random() * 6)); // Change the bird colour
    }
  }
}

// Draw to the canvas
TinyFlap.prototype.draw = function (ctx) {
  // Draw the background
  ctx.fillStyle = this.colours["6"];
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Draw the pipe
  ctx.fillStyle = this.colours["H"];
  for (var i in this.pipes.inView) {
    var cPipe = this.pipes.inView[i];

    ctx.fillRect(cPipe.x, 0, this.pipes.width, cPipe.up); // Top one
    ctx.fillRect(cPipe.x, cPipe.down, this.pipes.width, this.pipes.ground); // Bottom one
  }

  // Draw the bird
  var midView = (ctx.canvas.width / 2) - (this.images.bird.data[this.bird.image].width / 2);
  ctx.drawImage(this.images.bird.data[this.bird.image + this.bird.swap], midView, this.bird.y);

  // Press to play
  ctx.fillStyle = this.colours["2"];

  if (this.bird.mode == this.Modes.WAIT) {
    ctx.drawImage(this.images.logo.data[0], (ctx.canvas.width / 2) - (this.images.logo.data[0].width / 2), (ctx.canvas.height / 4));

    var str = "Press F, L, A, P to play!";
    ctx.fillText(str, (ctx.canvas.width / 2) - ((str.length / 4) * this.font.size), (ctx.canvas.height / 2) + this.font.size + this.bird.drift + 20);
  } else if (this.bird.mode == this.Modes.RETRY) {
    var str = "Press F, L, A, P to retry!";
    ctx.fillText(str, (ctx.canvas.width / 2) - ((str.length / 4) * this.font.size), ctx.canvas.height / 2);
  }

  // Draw the score
  if (this.bird.mode != this.Modes.WAIT) {
    var str = this.pipes.cleared.toString();
    ctx.fillText(str, (ctx.canvas.width / 2) - ((str.length / 4) * this.font.size), (ctx.canvas.height / 6) + this.font.size);
  }

  // Draw the ground
  ctx.fillStyle = this.colours["8"];
  ctx.fillRect(0, ctx.canvas.height - 10, ctx.canvas.width, ctx.canvas.height);

  // Update the frame counter
  this.frames.amount++;
}

// Update the game
TinyFlap.prototype.update = function (ctx) {
  var now = new Date();
  var diff = now - this.frames.last;

  if (this.bird.mode == this.Modes.PLAY) {
    // Detect location
    if (this.bird.y >= this.pipes.ground) {
      this.bird.y = this.pipes.ground;
      this.bird.mode = this.Modes.RETRY;
    } else {
      // Apply forces
      if (!this.bird.flap) {
        this.bird.speedY += this.bird.gravity / 60;
      } else {
        if (this.bird.flapCount < this.bird.flaps) {
          this.bird.speedY =  - (this.bird.flapPower / 60);
          this.bird.flapCount++;
        } else {
          this.bird.flapCount = 0;
          this.bird.flap = false;
        }
      }

      // Move the bird
      this.bird.x++;

      this.bird.y += this.bird.speedY;
    }

    // Update the pipes
    this.pipeLoc();
  } else if (this.bird.mode == this.Modes.WAIT) {
    if (Math.abs(this.bird.currentDrift) > this.bird.drift) {
      this.bird.driftDir = -this.bird.driftDir;
    }

    this.bird.y = ((ctx.canvas.height / 2) - (this.images.bird.data[this.bird.image].height / 2)) + this.bird.currentDrift;
    this.bird.currentDrift += this.bird.driftDir;

    this.bird.speedY = 0;
    this.bird.x = 0;
    this.pipes.inView = [];

    this.pipes.cleared = 0;
  } else if (this.bird.mode == this.Modes.DIE) {
    if (this.bird.y >= this.pipes.ground) { // Bird hit the ground
      this.bird.y = this.pipes.ground;
      this.bird.mode = this.Modes.RETRY;
    } else {
      if (this.bird.speedY < 0) {
        this.bird.speedY = 0;
      }

      this.bird.speedY += this.bird.gravity / 60;
      this.bird.y += this.bird.speedY;
    }
  }

  // Animate bird
  if (this.bird.mode == this.Modes.PLAY || this.bird.mode == this.Modes.WAIT) {
    if (diff.valueOf() % 200 > 100) {
      if (!this.bird.swap) {
        this.bird.swap = true;
      }
    } else {
      if (this.bird.swap) {
        this.bird.swap = false;
      }
    }
  }

  // The FPS
  if (diff.valueOf() >= 1000) {
    this.frames.current = this.frames.amount; // Store the curent frame count
    this.frames.last = now; // Update the last changed
    this.frames.amount = 0; // Reset
  }
}

// This is the main function
TinyFlap.prototype.run = function () {
  this.draw(this.bufferContext); // Draw to the buffer
  this.update(this.bufferContext); // Update the game
  this.context.drawImage(this.buffer, 0, 0); // Draw buffer to canvas
}

TinyFlap.prototype.create = function (cnvs) {
  var game = this;
  
  // Decompress lookup
  game.decompressLookup();

  // Choose colour
  game.changeBirdColour(Math.floor(Math.random() * 6));

  // Create canvas
  game.canvas = document.getElementById(cnvs); // Store the canvas
  game.context = game.canvas.getContext("2d"); // Set up canvas

  // Set up buffer
  game.buffer = document.createElement("canvas"); // 'Double' buffer
  game.bufferContext = game.buffer.getContext("2d");

  // Make the graphics we will use
  game.createAllBirds();
  game.makeImages(game.buffer, game.bufferContext);

  // Restore buffer
  game.buffer.height = game.canvas.height;
  game.buffer.width = game.canvas.width;

  // Set up ground
  game.pipes.ground = game.canvas.height - game.images.bird.data[game.bird.image].height - 10;

  // Key Information
  game.canvas.tabIndex = 0;
  game.canvas.addEventListener("keydown", function (event) {
    game.keyDown(event);
  });

  // Run the game
  setInterval(function () {
    game.run();
  }, 1000 / 60);

  return game;
}
