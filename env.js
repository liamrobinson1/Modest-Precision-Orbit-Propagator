class Moon {
  constructor(bodyMass, orbitRad, centralBody, thetaNaught, drawRadius) {
    this.mass = bodyMass
    this.mu = bodyMass * G
    this.r = orbitRad
    this.theta = thetaNaught
    this.thetaDot = -((G * earthMass / this.r) ** 0.5) / this.r * deltaT
    this.pos = createVector(0, 0, 0)
    this.period = -2 * PI / this.thetaDot
    this.drawRadius = drawRadius
  }

  update() {
    if(time.halt == 0) {
      this.theta += this.thetaDot
      this.pos = createVector(this.r * sin(this.theta) + earth.pos.y, 0, this.r * cos(this.theta) + earth.pos.x)
      this.vel = createVector(this.thetaDot * this.r * cos(this.theta), 0, -this.thetaDot * this.r * sin(this.theta))
    }
  }

  propagate(propDirection, targetObject) {
    this.theta += this.thetaDot * propDirection //here's where we'd change the prop direction
    this.pos = createVector(this.r * cos(this.theta) + earth.pos.x, this.r * sin(this.theta) + earth.pos.y)
    this.vel = createVector(-this.thetaDot * this.r * sin(this.theta), this.thetaDot * this.r * cos(this.theta))
  }

  show() {
    push()
    translate(this.pos.x / SF, this.pos.y / SF, this.pos.z / SF)
    texture(moonTex)
    sphere(this.drawRadius, 100)
    pop()
    push()
    stroke(0, 255, 0)
    noFill()
    rotateX(PI / 2)
    ellipse(0, 0, 2 * this.r / SF, 2 * this.r / SF, 24)
    pop()
  }

  queryPosition(time) {
    return createVector(this.r * sin(this.thetaDot * time) + earth.pos.x, earth.pos.y, this.r * cos(this.thetaDot * time) + earth.pos.z)
  }
}

class Earth {
  constructor(bodyMass, bodyPosxi, bodyPosyi, eqRad, polRad, omega, axisTilt) {
    this.mass = bodyMass
    this.mu = bodyMass * G
    this.pos = createVector(bodyPosxi, bodyPosyi, 0)
    this.eqRad = eqRad
    this.polRad = polRad
    this.vel = createVector(0, 0, 0)
    this.omega = omega
    this.axisTilt = axisTilt
  }

  show() {
    this.rotation = this.omega * time.timeSinceCreation
    push()
    noStroke()
    translate(this.pos.x, this.pos.y, this.pos.z)
    rotateZ(this.axisTilt)
    rotateY(this.rotation)
    texture(earthTex)
    // this.approximateSun()
    ellipsoid(this.eqRad / SF, this.polRad / SF, this.eqRad / SF, 100, 100)
    pop()
  }

  approximateSun() {
    var lightNum = 2
    for(var i = 0; i < lightNum; i++) {
      pointLight(255, 255, 255, createVector(this.eqRad / SF * 100, 0, 0))
    }
    lightFalloff(0.0, 0.00, 0)
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

function cameraSetup() {
  // frustum([left], [right], [bottom], [top], [near], [far])
  earthCam = createCamera()
  satCam = createCamera()
  moonCam = createCamera()
  currentCam = "earth"
}

function cameraControl() {
  if(keyIsDown(83) || currentCam == "sat") {
    satCam.lookAt(sat.pos.x / SF, sat.pos.y / SF, sat.pos.z / SF)
    satCam.setPosition(sat.orbitBinormal.x * 100, sat.orbitBinormal.y * 100, sat.orbitBinormal.z * 100)
    setCamera(satCam)
    currentCam = "sat"
  }
  if(keyIsDown(69) || currentCam == "earth") {
    earthCam.lookAt(0, 0, 0)
    setCamera(earthCam)
    currentCam = "earth"
  }
  if(keyIsDown(77) || currentCam == "moon") {
    moonCam.lookAt(moon.pos.x / SF, moon.pos.y / SF, moon.pos.z / SF)
    moonCam.setPosition(moon.pos.x / SF, moon.pos.y / SF + 100, moon.pos.z / SF + 100)
    setCamera(moonCam)
    currentCam = "moon"
  }
  if(keyIsDown(81)) {
    currentCam = "none"
  }
}

function drawVectors() {
  var earthAcc = p5.Vector.mult(sat.pos, -earth.mu / sat.pos.mag() ** 3).setMag(8)
  var moonPS = p5.Vector.sub(sat.pos, moon.pos)
  var moonAcc = p5.Vector.mult(moonPS, -moon.mu / moonPS.mag() ** 3).setMag(8)

  clif("earthAcc", earthAcc)

  push()
  translate(earth.pos.x / SF, earth.pos.y / SF, earth.pos.z / SF)
  stroke(0, 255, 0)
  line(0, 0, 0, sat.pos.x / SF, sat.pos.y / SF, sat.pos.z / SF)
  stroke(200)
  translate(sat.pos.x / SF, sat.pos.y / SF, sat.pos.z / SF)
  line(0, 0, 0, (moon.pos.x - sat.pos.x) / SF, (moon.pos.y - sat.pos.y) / SF, (moon.pos.z - sat.pos.z) / SF)
  strokeWeight(2)
  stroke(255, 0, 0)
  line(0, 0, 0, earthAcc.x, earthAcc.y, earthAcc.z)
  line(0, 0, 0, moonAcc.x, moonAcc.y, moonAcc.z)
  pop()
}

function drawEcliptic() {
  push()
  stroke(255)
  noFill()
  rotateX(PI / 2)
  plane(300, 300)
  pop()
}
