
class GravSat {
  constructor(r, t, satMass, isPreviousState) {
    this.pos = createVector(earth.pos.x + r * cos(t), earth.pos.y + -r * sin(t))
    this.vel = createVector(-sin(t), cos(t)).mult((G * earth.mass / r) ** 0.5)
    this.acc = createVector(0, 0)
    this.gravityVector = createVector(0, 0)
    this.gravitySourceMass = 0
    this.distToEarth = 0
    this.distToMoon = 0
    this.r1 = 0
    this.r2 = 0
    this.apoapsis = 0
    this.periapsis = 0
    this.transferComplete = 0
    this.period = 0
    this.a = 0
    this.mass = satMass
    this.initialPosition = createVector(earth.pos.x + r * cos(t), earth.pos.y + -r * sin(t))
    this.apoapsisVector = createVector(this.pos.x, this.pos.y)
    this.periapsisVector = createVector(this.pos.x, this.pos.y)
    this.dvUsed = 0
    this.isPreviousState = isPreviousState
    this.stillInOnePiece = 1
    this.deltaT = deltaT
    this.missionSegment = 0
    this.haltPropagation = 0
    this.velMoon = createVector(0, 0)
    this.posMoon = createVector(0, 0)
    this.velFlipped = 0
    this.currentSOI = "earth"

    if(!this.isPreviousState) {
      this.previousObjectState = new GravSat(100, 0, this.mass, 1)
    }
  }

  orbitUpdate(halt, propFidelity, currentMoon, propDirection) {
    //SAVE THIS STATE
    if(!this.isPreviousState) {
      this.copy(this.previousObjectState)
    }

    if(halt == 0) {
      for(var i = 0; i < propFidelity; i++) {
        var gravVector = this.gravityVector.copy()
        var gravUnitVector = p5.Vector.div(gravVector, gravVector.mag())
        var fmag = G * this.gravitySourceMass / gravVector.mag() ** 2

        this.acc = p5.Vector.mult(gravUnitVector, fmag)

        this.vel = createVector(this.vel.x + this.acc.x * this.deltaT / propFidelity, this.vel.y + this.acc.y * this.deltaT / propFidelity)

        if(propDirection == -1 && this.velFlipped == 0) {
          this.vel = createVector(-this.vel.x + this.acc.x * this.deltaT / propFidelity, -this.vel.y + this.acc.y * this.deltaT / propFidelity)
          this.velFlipped = 1
        }

        this.pos = createVector(this.pos.x + this.vel.x * this.deltaT / propFidelity, this.pos.y + this.vel.y * this.deltaT / propFidelity)

        this.distToEarth = createVector(earth.pos.x - this.pos.x, earth.pos.y - this.pos.y).mag()
        this.distToMoon = createVector(currentMoon.pos.x - this.pos.x, currentMoon.pos.y - this.pos.y).mag()

        if(this.distToEarth * 2 < earth.mass) {
          return 0
        }
        if(this.distToMoon * 2 < currentMoon.mass) {
          return 0
        }
      }
    }
    return 1
  }

  showSat() {
    push()
    stroke(0, 200, 200)
    fill(0, 200, 200)
    ellipse(this.pos.x, this.pos.y, satMass, satMass)
    pop()
  }

  copy(copyInto) {
    copyInto.pos = createVector(this.pos.x, this.pos.y)
    copyInto.vel = createVector(this.vel.x, this.vel.y)
    copyInto.acc = createVector(this.acc.x, this.acc.y)
    copyInto.gravityVector = createVector(this.gravityVector.x, this.gravityVector.y)
    copyInto.gravitySourceMass = parseFloat(this.gravitySourceMass)
    copyInto.distToEarth = parseFloat(this.distToEarth)
    copyInto.distToMoon = parseFloat(this.distToMoon)
    copyInto.r1 = parseFloat(this.r1)
    copyInto.r2 = parseFloat(this.r2)
    copyInto.apoapsis = parseFloat(this.apoapsis)
    copyInto.periapsis = parseFloat(this.periapsis)
    copyInto.transferComplete = parseInt(this.transferComplete)
    copyInto.period = parseFloat(this.period)
    copyInto.a = parseFloat(this.a)
    copyInto.p = parseFloat(this.p)
    copyInto.dvUsed = parseFloat(this.dvUsed)
    copyInto.mass = parseFloat(this.mass)
    copyInto.ecc = parseFloat(this.ecc)
    copyInto.deltaT = parseFloat(this.deltaT)
    copyInto.velMoon = createVector(this.velMoon.x, this.velMoon.y)
    copyInto.posMoon = createVector(this.posMoon.x, this.posMoon.y)
    copyInto.apoapsisVector = createVector(this.apoapsisVector.x, this.apoapsisVector.y)
    copyInto.periapsisVector = createVector(this.periapsisVector.x, this.periapsisVector.y)
  }

  checkSOI(propDirection) {
    if(dist(this.pos.x, this.pos.y, moon.pos.x, moon.pos.y) < moon.SOIrad && propDirection == 1) {
      this.gravitySourceMass = moon.mass
      this.gravityVector = createVector(moon.pos.x - this.pos.x, moon.pos.y - this.pos.y)
    }
    else {
      this.gravitySourceMass = earth.mass
      this.gravityVector = createVector(earth.pos.x - this.pos.x, earth.pos.y - this.pos.y)
    }
  }

  propagateSOI(targetMoon, propDirection, isCorrecting, initialSOI) {
    if(dist(this.pos.x, this.pos.y, targetMoon.pos.x, targetMoon.pos.y) < targetMoon.SOIrad && (initialSOI == "moon" || initialSOI == "any")) {
      this.gravitySourceMass = targetMoon.mass
      this.gravityVector = createVector(targetMoon.pos.x - this.pos.x, targetMoon.pos.y - this.pos.y)
      this.currentSOI = "moon"
    }
    else {
      this.gravitySourceMass = earth.mass
      this.gravityVector = createVector(earth.pos.x - this.pos.x, earth.pos.y - this.pos.y)
      this.currentSOI = "earth"
    }
  }

  calculateElements(currentMoon) {
    this.ecc = (this.apoapsis - this.periapsis) / (this.apoapsis + this.periapsis)
    this.gamma = -this.vel.angleBetween(this.gravityVector) - PI / 2
    this.r_for_cross = createVector(this.pos.x - earth.pos.x, this.pos.y - earth.pos.y, 0)
    this.v_for_cross = createVector(this.vel.x, this.vel.y, 0)

    this.h = p5.Vector.cross(this.r_for_cross, this.v_for_cross)
    this.h = this.h.mag()
    this.specificE = - G * earth.mass / (2 * this.a)
    this.theta = this.gravityVector.angleBetween(createVector(this.periapsisVector.x, this.periapsisVector.y))

    if(this.ecc > 0) {
      this.a = (this.periapsis + this.apoapsis) / 2
      this.period = 2 * PI * ((this.a) ** 3 / (G * earth.mass)) ** 0.5
      this.p = this.a * (1 - this.ecc ** 2)
    }
    else if(this.periapsis * 2 < this.h ** 2 / (earth.mass * G)){
      this.p = this.h ** 2 / (earth.mass * G)
      this.ecc = this.p / this.periapsis - 1
      this.a = this.periapsis / (1 - this.ecc)
    }
    else { //APPROXIMATES VALUES FOR WHEN CLOSE TO PARABOLA
      this.apoapsis = 1 * 10 ** 6
      this.a = (this.periapsis + this.apoapsis) / 2
      this.ecc = (this.apoapsis - this.periapsis) / (this.apoapsis + this.periapsis)
      this.specificE = - G * earth.mass / (2 * this.a)
      this.period = 2 * PI * ((this.a) ** 3 / (G * earth.mass)) ** 0.5
      this.p = this.a * (1 - this.ecc ** 2)
    }

    this.vectorToEarth = createVector(earth.pos.x - this.pos.x, earth.pos.y - this.pos.y)
    this.vectorToMoon = createVector(currentMoon.pos.x - this.pos.x, currentMoon.pos.y - this.pos.y)
    this.velMoon = createVector(-currentMoon.vel.x + this.vel.x, -currentMoon.vel.y + this.vel.y)
    this.posMoon = createVector(-currentMoon.pos.x + this.pos.x, -currentMoon.pos.y + this.pos.y)
  }

  displayElements() {
    push()
    noStroke()
    fill(255)
    text("current frame: " + time.currentFrame, 100, 80)
    text("gamma: " + this.gamma.toFixed(4), 100, 100)
    text("h: " + this.h.toFixed(4), 100, 120)
    text("theta: " + this.theta.toFixed(4), 100, 140)
    text("specificE: " + this.specificE.toFixed(4), 100, 160)
    text("period: " + this.period.toFixed(1), 100, 180)
    text("ecc: " + this.ecc.toFixed(6), 100, 200)
    text("apo: " + this.apoapsis.toFixed(1), 100, 220)
    text("peri: " + this.periapsis.toFixed(1), 100, 240)
    text("a: " + this.a.toFixed(4), 100, 260)
    text("disttoearth: " + this.distToEarth.toFixed(1), 100, 280)
    text("framerate: " + frameRate().toFixed(2), 100, 300)
    text("dvused: " + this.dvUsed.toFixed(2), 100, 320)
    text("velmoon: " + this.velMoon.x.toFixed(2) + ", " + this.velMoon.y.toFixed(2), 100, 340)
    text("posmoon: " + this.posMoon.x.toFixed(2) + ", " + this.posMoon.y.toFixed(2), 100, 360)
    text("p: " + this.p.toFixed(2), 100, 380)
    pop()
  }

  displayFutureTrajectory(framesToProp) {
    var propagator = new Targeter(this, "noChange", null, 1, "apoapsis", null, "burnV", 0.00, 100, 0.01)
    propagator.propagate(propagator.propFidelity, "showFrames", framesToProp, 1, "any")
  }

  correctThetaFindRs() {
    var propagator = new Targeter(this, "noChange", null, 1, "periapsis", null, "burnV", 0.00, 100, 0.01)
    propagator.propagate(propagator.propFidelity, "periapsis", "CORRECTING_DO_NOT_SUBCALL", -1, this.currentSOI)
    this.periapsisVector = createVector(propagator.targetObject.gravityVector.x, propagator.targetObject.gravityVector.y)

    if(this.periapsisVector.mag() > 1000) { //OCCURS WHEN WE"RE ON THE INCOMING HYPERBOLIC ASYMPTOTE
      var propagator = new Targeter(this, "noChange", null, 1, "periapsis", null, "burnV", 0.00, 100, 0.01)
      propagator.propagate(propagator.propFidelity, "periapsis", "CORRECTING_DO_NOT_SUBCALL", 1, this.currentSOI)
      this.periapsisVector = createVector(propagator.targetObject.gravityVector.x, propagator.targetObject.gravityVector.y)
    }

    if(propagator.propSuccess == 1) {
      propagator = new Targeter(this, "noChange", null, 1, "apoapsis", null, "burnV", 0.00, 100, 0.01)
      propagator.propagate(propagator.propFidelity, "apoapsis", "CORRECTING_DO_NOT_SUBCALL", 1, this.currentSOI)
    }

    this.apoapsisVector = createVector(propagator.targetObject.gravityVector.x, propagator.targetObject.gravityVector.y)

    if(propagator.propSuccess == 1) {
      propagator.propagate(propagator.propFidelity, "periapsis", "CORRECTING_DO_NOT_SUBCALL", 1, this.currentSOI)
      this.apoapsis = this.apoapsisVector.mag()
      this.periapsis = this.periapsisVector.mag()
    }
    else { //IF WE"RE HYPERBOLIC
      this.apoapsis = this.periapsisVector.mag() - 1 //TO TRIGGER HYPERBOLIC LOGIC IN CALCULATE ELEMENTS
      this.periapsis = this.periapsisVector.mag()
    }


  }

  executeManeuver(dv) {
    this.vel.setMag(dv + this.vel.mag())
  }

  enterTransfer() {
    this.r1 = createVector(earth.pos.x - this.pos.x, earth.pos.y - this.pos.y).mag()
    this.r2 = moon.r
    this.apoapsis = this.r2
    this.periapsis = this.r1

    var targeter = new Targeter(this, "distToEarth", 200, 1, "framesElapsed", 1000, "burnV", 0.00, 100, 0.01)
    targeter.findPropagateTime()
    // console.log(propagator.targetObject, propagator.equalityParameter, propagator.equalityCondition)
  }

  undoLastTimeStep() { //THIS IS WRONG RIGHT NOW
    this.previousObjectState.copy(this)
  }
}
