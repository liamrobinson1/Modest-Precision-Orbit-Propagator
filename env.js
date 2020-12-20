class Moon {
  constructor(bodyMass, orbitRad, centralBody, thetaNaught) {
    this.mass = bodyMass
    this.mu = bodyMass * G
    this.r = orbitRad
    this.theta = thetaNaught
    this.thetaDot = -((G * earthMass / this.r) ** 0.5) / this.r
    this.pos = createVector(0, 0)
    this.SOIrad = this.r * (this.mass / (3 * earth.mass)) ** 0.5
  }

  update() {
    if(time.halt == 0) {
      this.theta += this.thetaDot
      this.pos = createVector(this.r * cos(this.theta) + earth.pos.x, this.r * sin(this.theta) + earth.pos.y)
      this.vel = createVector(this.thetaDot * cos(this.theta), this.thetaDot * sin(this.theta))
    }
  }

  propagate(propDirection) {
      this.theta += this.thetaDot * propDirection //here's where we'd change the prop direction
      this.pos = createVector(this.r * cos(this.theta) + earth.pos.x, this.r * sin(this.theta) + earth.pos.y)
      this.vel = createVector(this.thetaDot * cos(this.theta), this.thetaDot * sin(this.theta))
  }

  show() {
  }

  drawSOI() {
    if(time.halt == 0) {
      push()
      strokeWeight(1)
      noStroke()
      fill(30)
      ellipse(this.pos.x, this.pos.y, this.SOIrad * 2)
      stroke(255)
      noFill()
      ellipse(w / 2, h / 2, 500)
      pop()
    }
  }
}

class Earth {
  constructor(bodyMass, bodyPosxi, bodyPosyi) {
    this.mass = bodyMass
    this.mu = bodyMass * G
    this.pos = createVector(bodyPosxi, bodyPosyi)
  }

  show() {
    noStroke()
    fill(23, 107, 61)
    ellipse(this.pos.x, this.pos.y, this.mass, this.mass)
  }
}

class Time {
  constructor(deltaT) {
    this.currentFrame = 0
    this.halt = 0
    this.delta = deltaT
    this.timeSinceCreation = 0
  }

  update() {
    if(this.halt == 0) {
      background(0)
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
  rotate(moon.theta * 30)
  image(earthImage, -earth.mass / 2 - 1, -earth.mass / 2 - 1)
  pop()

  push()
  translate(moon.pos.x, moon.pos.y)
  rotate(moon.theta)
  image(moonImage, -moon.mass / 2 - 1, -moon.mass / 2 - 1)
  pop()
}

function resizeImages() {
  satImage.resize(60, 60)
  earthImage.resize(earth.mass + 2, earth.mass + 2)
  moonImage.resize(moon.mass + 2, moon.mass + 2)
}
