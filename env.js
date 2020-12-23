class Moon {
  constructor(bodyMass, orbitRad, centralBody, thetaNaught, drawRadius) {
    this.mass = bodyMass
    this.mu = bodyMass * G
    this.r = orbitRad
    this.theta = thetaNaught
    this.thetaDot = -((G * earthMass / this.r) ** 0.5) / this.r * deltaT
    this.pos = createVector(0, 0)
    // this.SOIrad = this.r * (2 * this.mass / (5 * earth.mass)) ** 0.5
    this.SOIrad = 100
    this.period = -2 * PI / this.thetaDot
    this.drawRadius = drawRadius
    this.inertialViewPos = createVector(7 / 8 * w, 7 * h / 8)
  }

  update() {
    if(time.halt == 0) {
      this.theta += this.thetaDot
      this.pos = createVector(this.r * cos(this.theta) + earth.pos.x, this.r * sin(this.theta) + earth.pos.y)
      this.vel = createVector(-this.thetaDot * this.r * sin(this.theta), this.thetaDot * this.r * cos(this.theta))
    }
  }

  propagate(propDirection, targetObject) {
    this.theta += this.thetaDot * propDirection //here's where we'd change the prop direction
    this.pos = createVector(this.r * cos(this.theta) + earth.pos.x, this.r * sin(this.theta) + earth.pos.y)
    this.vel = createVector(-this.thetaDot * this.r * sin(this.theta), this.thetaDot * this.r * cos(this.theta))
  }

  show() {
    noStroke()
    fill(23, 107, 61)
    ellipse(this.pos.x, this.pos.y, 2 * this.drawRadius)
  }

  drawSOI() {
    if(time.halt == 0) {
      push()
      strokeWeight(1)
      noStroke()
      fill(30)
      ellipse(this.pos.x, this.pos.y, this.SOIrad * 2)
      stroke(51)
      noFill()
      ellipse(w / 2, h / 2, 2 * this.r)
      pop()
    }
  }
}

class Earth {
  constructor(bodyMass, bodyPosxi, bodyPosyi, drawRadius) {
    this.mass = bodyMass
    this.mu = bodyMass * G
    this.pos = createVector(bodyPosxi, bodyPosyi)
    this.drawRadius = drawRadius
  }

  show() {
    noStroke()
    fill(23, 107, 61)
    ellipse(this.pos.x, this.pos.y, 2 * this.drawRadius)
  }
}

class Time {
  constructor(deltaT, isMasterTime) {
    this.currentFrame = 0
    this.halt = 0
    this.delta = deltaT
    this.timeSinceCreation = 0
    this.keyPressedLastFrame = 0
    this.masterTime = isMasterTime
    this.burnMagnitude = 0
  }

  update() {
    if(this.halt == 0) {
      if(this.masterTime) {
        background(0)
      }
      this.currentFrame += 1
      this.timeSinceCreation += this.delta
    }
    if(this.halt == 1 && keyIsDown(ENTER)) {
      this.halt = 0
    }
  }
}

function addImages() {
  push()
  translate(earth.pos.x, earth.pos.y)
  rotate(time.timeSinceCreation * 0.002)
  image(earthImage, -earth.drawRadius - 1, -earth.drawRadius - 1)
  pop()

  push()
  translate(moon.pos.x, moon.pos.y)
  rotate(moon.theta)
  image(moonImage, -moon.drawRadius - 1, -moon.drawRadius - 1)
  pop()
}

function resizeImages() {
  satImage.resize(60, 60)
  earthImage.resize(earth.drawRadius * 2 + 2, earth.drawRadius * 2 + 2)
  moonImage.resize(moon.drawRadius * 2 + 2, moon.drawRadius * 2 + 2)
  scaledMoon.resize(moon.drawRadius * 2 / 3 + 2, moon.drawRadius * 2 / 3 + 2)
}

function moonRelativeOrbit() {
  var trailLength = falconMoonTrail.length
  push()
  translate(moon.inertialViewPos.x, moon.inertialViewPos.y)
  beginShape()
  stroke(200, 0, 200)
  for(var i = 0; i < trailLength; i++) {
    vertex(-falconMoonTrail[i][0] / 3, -falconMoonTrail[i][1] / 3)
  }
  endShape()
  stroke(255, 0, 0)
  strokeWeight(3)
  point(0, 0)

  stroke(200, 0, 200)
  fill(200, 0, 200)
  ellipse(-falconMoonTrail[trailLength - 1][0] / 3, -falconMoonTrail[trailLength - 1][1] / 3, satMass)
  pop()

  push()
  translate(moon.inertialViewPos.x - moon.drawRadius / 2, moon.inertialViewPos.y -  moon.drawRadius / 2)
  image(scaledMoon, 0, 0)
  pop()
}
