let climber;
let holds = [];
let selectedHold = null;
let camera = { x: 0, y: 0 };
let gameHeight = 2000;

function setup() {
  createCanvas(400, 800);

  // Initialize climber
  climber = {
    x: width / 2,
    y: height - 100,
    leftHand: null,
    rightHand: null,
    leftFoot: null,
    rightFoot: null,
    size: 40,
    reachDistance: 120,
  };

  // Generate climbing holds
  generateHolds();
}

function draw() {
  background(245, 245, 220);

  // Update camera to follow climber
  camera.y = lerp(camera.y, climber.y - height * 0.7, 0.05);

  push();
  translate(0, -camera.y);

  // Draw holds
  drawHolds();

  // Draw climber
  drawClimber();

  // Draw UI indicators
  drawUI();

  pop();

  // Draw fixed UI
  drawScore();
}

function generateHolds() {
  holds = [];

  // Starting holds at bottom
  holds.push({
    x: width / 2 - 40,
    y: height - 150,
    color: [100, 255, 100],
    type: "start",
  });
  holds.push({
    x: width / 2 + 40,
    y: height - 150,
    color: [100, 255, 100],
    type: "start",
  });

  // Generate holds going up with reduced empty spots and minimal overlap
  let prevRowHolds = [];
  for (let i = 0; i < 50; i++) {
    let y = height - 170 - i * random(80, 100); // slightly denser rows
    let numHolds = floor(random(4, 7)); // more holds per row

    let rowHolds = [];
    let attempts = 0;
    while (rowHolds.length < numHolds && attempts < numHolds * 10) {
      let size = random(18, 25);
      let x = random(60 + size / 2, width - 60 - size / 2);
      let yJitter = random(-20, 20);
      let newHold = {
        x: x,
        y: y + yJitter,
        color: [random(150, 255), random(100, 200), random(200, 255)],
        type: "hold",
        size: size,
      };

      // Avoid overlap with holds in this row
      let overlaps = rowHolds.some(
        (h) =>
          dist(h.x, h.y, newHold.x, newHold.y) < (h.size + newHold.size) * 0.7
      );
      // Avoid overlap with previous row
      if (!overlaps && prevRowHolds.length > 0) {
        overlaps = prevRowHolds.some(
          (h) =>
            dist(h.x, h.y, newHold.x, newHold.y) < (h.size + newHold.size) * 0.7
        );
      }

      if (!overlaps) {
        rowHolds.push(newHold);
        holds.push(newHold);
      }
      attempts++;
    }
    prevRowHolds = rowHolds;
  }

  // Finish hold at top
  holds.push({
    x: width / 2,
    y: -gameHeight + 200,
    color: [255, 215, 0],
    type: "finish",
    size: 30,
  });
}

function drawHolds() {
  for (let hold of holds) {
    push();

    // Highlight if reachable
    if (isHoldReachable(hold)) {
      stroke(255, 255, 0);
      strokeWeight(3);
    } else {
      noStroke();
    }

    // Hold color
    fill(hold.color[0], hold.color[1], hold.color[2]);

    // Draw hold shape
    let size = hold.size || 20;
    ellipse(hold.x, hold.y, size, size * 0.8);

    // Add grip texture
    fill(0, 50);
    ellipse(hold.x, hold.y, size * 0.6, size * 0.5);

    pop();
  }
}

function drawClimber() {
  push();

  // Body
  stroke(139, 69, 19);
  strokeWeight(8);
  line(climber.x, climber.y, climber.x, climber.y + 60);

  // Head
  fill(222, 184, 135);
  stroke(139, 69, 19);
  strokeWeight(2);
  ellipse(climber.x, climber.y - 15, 25, 25);

  // Shirt
  fill(255, 20, 147);
  noStroke();
  beginShape();
  vertex(climber.x - 12, climber.y + 5); // Top left
  vertex(climber.x + 12, climber.y + 5); // Top right
  vertex(climber.x + 10, climber.y + 55); // Bottom right (20 width)
  vertex(climber.x - 10, climber.y + 55); // Bottom left (20 width)
  endShape(CLOSE);

  // Shorts
  fill(0, 0, 139);
  rect(climber.x - 10, climber.y + 50, 20, 15);

  // Limbs
  stroke(139, 69, 19);
  strokeWeight(6);

  // Left arm
  if (climber.leftHand) {
    line(climber.x - 8, climber.y + 10, climber.leftHand.x, climber.leftHand.y);
  } else {
    line(climber.x - 8, climber.y + 10, climber.x - 25, climber.y + 30);
  }

  // Right arm
  if (climber.rightHand) {
    line(
      climber.x + 8,
      climber.y + 10,
      climber.rightHand.x,
      climber.rightHand.y
    );
  } else {
    line(climber.x + 8, climber.y + 10, climber.x + 25, climber.y + 30);
  }

  // Left leg
  if (climber.leftFoot) {
    line(climber.x - 5, climber.y + 60, climber.leftFoot.x, climber.leftFoot.y);
  } else {
    line(climber.x - 5, climber.y + 60, climber.x - 15, climber.y + 90);
  }

  // Right leg
  if (climber.rightFoot) {
    line(
      climber.x + 5,
      climber.y + 60,
      climber.rightFoot.x,
      climber.rightFoot.y
    );
  } else {
    line(climber.x + 5, climber.y + 60, climber.x + 15, climber.y + 90);
  }

  // Hands and feet
  fill(222, 184, 135);
  strokeWeight(2);

  if (climber.leftHand) ellipse(climber.leftHand.x, climber.leftHand.y, 12, 12);
  if (climber.rightHand)
    ellipse(climber.rightHand.x, climber.rightHand.y, 12, 12);
  if (climber.leftFoot) {
    fill(0);
    ellipse(climber.leftFoot.x, climber.leftFoot.y, 15, 8);
  }
  if (climber.rightFoot) {
    fill(0);
    ellipse(climber.rightFoot.x, climber.rightFoot.y, 15, 8);
  }

  pop();
}

function drawUI() {
  // Show which limb is selected
  if (selectedHold) {
    push();
    stroke(255, 0, 0);
    strokeWeight(3);
    noFill();
    ellipse(selectedHold.x, selectedHold.y, 40, 40);
    pop();
  }
}

function drawScore() {
  push();
  fill(0);
  textSize(20);
  text(
    `Height: ${Math.max(0, Math.floor((height - climber.y) / 10))}m`,
    20,
    30
  );
  text("Tap holds to climb!", 20, 60);
  pop();
}

function mousePressed() {
  handleInput(mouseX, mouseY);
}

function touchStarted() {
  if (touches.length > 0) {
    handleInput(touches[0].x, touches[0].y);
  }
  return false; // Prevent default
}

function handleInput(x, y) {
  // Convert screen coordinates to world coordinates
  let worldY = y + camera.y;

  // Find clicked hold
  for (let hold of holds) {
    let d = dist(x, worldY, hold.x, hold.y);
    if (d < 30 && isHoldReachable(hold)) {
      moveToHold(hold);
      break;
    }
  }
}

function isHoldReachable(hold) {
  let d = dist(climber.x, climber.y, hold.x, hold.y);
  return d < climber.reachDistance;
}

function moveToHold(hold) {
  // Simple climbing logic - move closest available limb
  let distances = [];

  if (!climber.leftHand)
    distances.push({
      limb: "leftHand",
      dist: dist(climber.x - 8, climber.y + 10, hold.x, hold.y),
    });
  if (!climber.rightHand)
    distances.push({
      limb: "rightHand",
      dist: dist(climber.x + 8, climber.y + 10, hold.x, hold.y),
    });
  if (!climber.leftFoot)
    distances.push({
      limb: "leftFoot",
      dist: dist(climber.x - 5, climber.y + 60, hold.x, hold.y),
    });
  if (!climber.rightFoot)
    distances.push({
      limb: "rightFoot",
      dist: dist(climber.x + 5, climber.y + 60, hold.x, hold.y),
    });

  if (distances.length > 0) {
    distances.sort((a, b) => a.dist - b.dist);
    let closestLimb = distances[0].limb;

    climber[closestLimb] = hold;

    // Update climber position based on holds
    updateClimberPosition();
  }
}

function updateClimberPosition() {
  let attachedHolds = [];
  if (climber.leftHand)
    attachedHolds.push({ hold: climber.leftHand, weight: 1 });
  if (climber.rightHand)
    attachedHolds.push({ hold: climber.rightHand, weight: 1 });
  if (climber.leftFoot)
    attachedHolds.push({ hold: climber.leftFoot, weight: 0.5 });
  if (climber.rightFoot)
    attachedHolds.push({ hold: climber.rightFoot, weight: 0.5 });

  if (attachedHolds.length > 0) {
    let totalWeight = 0;
    let avgX = 0;
    let avgY = 0;

    for (let item of attachedHolds) {
      avgX += item.hold.x * item.weight;
      avgY += item.hold.y * item.weight;
      totalWeight += item.weight;
    }

    // Increase lerp factor for faster movement and reduce offset for more balanced limb length
    climber.x = lerp(climber.x, avgX / totalWeight, 0.6);
    climber.y = lerp(climber.y, avgY / totalWeight + 15, 0.6);
  }
}

function keyPressed() {
  // Release holds with number keys
  if (key === "1") climber.leftHand = null;
  if (key === "2") climber.rightHand = null;
  if (key === "3") climber.leftFoot = null;
  if (key === "4") climber.rightFoot = null;
  if ((key = "p")) {
    // the player pulls all his limbs to the minimum distance, keeping all the holds
    // by moving the climber to the average position of all holds
    let attachedHolds = [];
    if (climber.leftHand) attachedHolds.push(climber.leftHand);
    if (climber.rightHand) attachedHolds.push(climber.rightHand);
    if (climber.leftFoot) attachedHolds.push(climber.leftFoot);
    if (climber.rightFoot) attachedHolds.push(climber.rightFoot);
    if (attachedHolds.length > 0) {
      let avgX = 0;
      let avgY = 0;
      for (let hold of attachedHolds) {
        avgX += hold.x;
        avgY += hold.y;
      }
      avgX /= attachedHolds.length;
      avgY /= attachedHolds.length;

      // Move the climber a bit higher above the average of the holds
      climber.x = lerp(climber.x, avgX, 0.6);
      climber.y = lerp(climber.y, avgY - 10, 0.6); // subtract 10 to move up more
    }
  }
}
