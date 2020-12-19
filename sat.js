
class GravSat {
  constructor(r, t, satMass) {
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
    this.apoapsisVector = createVector(-1, 0)
    this.dvUsed = 0
  }

  orbitUpdate(halt, propFidelity) {
    if(halt == 0) {
      for(var i = 0; i < propFidelity; i++) {
        var gravVector = this.gravityVector.copy()

        var fmag = G * this.gravitySourceMass / gravVector.mag() ** 2
        this.acc = gravVector.div(gravVector.mag()).mult(fmag)
        this.vel = createVector(this.vel.x + this.acc.x * deltaT / propFidelity, this.vel.y + this.acc.y * deltaT / propFidelity)
        this.pos = createVector(this.pos.x + this.vel.x * deltaT / propFidelity, this.pos.y + this.vel.y * deltaT / propFidelity)

        this.distToEarth = createVector(earth.pos.x - this.pos.x, earth.pos.y - this.pos.y).mag()
        this.distToMoon = createVector(moon.pos.x - this.pos.x, moon.pos.y - this.pos.y).mag()
        this.a = (this.apoapsis + this.periapsis) / 2
      }
    }
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
    copyInto.dvUsed = parseFloat(this.dvUsed)
    copyInto.mass = parseFloat(this.mass)
  }

  checkSOI() {
    if(dist(this.pos.x, this.pos.y, moon.pos.x, moon.pos.y) < moon.SOIrad) {
      this.gravitySourceMass = moon.mass
      this.gravityVector = createVector(moon.pos.x - this.pos.x, moon.pos.y - this.pos.y)
    }
    else {
      this.gravitySourceMass = earth.mass
      this.gravityVector = createVector(earth.pos.x - this.pos.x, earth.pos.y - this.pos.y)
    }
  }

  propagateSOI(targetMoon) {
    if(dist(this.pos.x, this.pos.y, targetMoon.pos.x, targetMoon.pos.y) < targetMoon.SOIrad) {
      this.gravitySourceMass = targetMoon.mass
      this.gravityVector = createVector(targetMoon.pos.x - this.pos.x, targetMoon.pos.y - this.pos.y)
    }
    else {
      this.gravitySourceMass = earth.mass
      this.gravityVector = createVector(earth.pos.x - this.pos.x, earth.pos.y - this.pos.y)
    }
  }

  calculateElements() {
    this.theta = this.gravityVector.angleBetween(createVector(this.apoapsisVector.x, this.apoapsisVector.y)) + PI

    this.r_for_cross = createVector(this.pos.x - earth.pos.x, this.pos.y - earth.pos.y, 0)
    this.v_for_cross = createVector(this.vel.x, this.vel.y, 0)

    this.gamma = -this.vel.angleBetween(this.gravityVector) - PI / 2
    this.h = p5.Vector.cross(this.r_for_cross, this.v_for_cross)
    this.h = this.h.mag()
    this.specificE = - G * earth.mass / (2 * this.a)
    this.period = 2 * PI * ((this.a) ** 3 / (G * earth.mass)) ** 0.5
    this.ecc = (this.apoapsis - this.periapsis) / (this.apoapsis + this.periapsis)
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
    text("ecc: " + this.ecc.toFixed(4), 100, 200)
    text("apo: " + this.apoapsis.toFixed(1), 100, 220)
    text("peri: " + this.periapsis.toFixed(1), 100, 240)
    text("a: " + this.a.toFixed(4), 100, 260)
    text("disttoearth: " + this.distToEarth.toFixed(1), 100, 280)
    text("framerate: " + frameRate().toFixed(2), 100, 300)
    text("dvused: " + this.dvUsed.toFixed(2), 100, 320)
    pop()
  }

  displayFutureTrajectory(framesToProp) {
    var propagator = new Targeter(this, "noChange", null, 1, "apoapsis", null, "burnV", 0.00, 100, 0.01)
    propagator.propagate(propagator.propFidelity, "showFrames", framesToProp)
  }

  correctThetaFindRs() {
    var propagator = new Targeter(this, "noChange", null, 1, "apoapsis", null, "burnV", 0.00, 100, 0.01)
    propagator.propagate(propagator.propFidelity, "apoapsis", "CORRECTING_DO_NOT_SUBCALL")
    this.apoapsisVector = createVector(propagator.targetObject.gravityVector.x, propagator.targetObject.gravityVector.y)
    propagator.propagate(propagator.propFidelity, "periapsis", "CORRECTING_DO_NOT_SUBCALL")
    this.periapsisVector = createVector(propagator.targetObject.gravityVector.x, propagator.targetObject.gravityVector.y)
    this.apoapsis = this.apoapsisVector.mag()
    this.periapsis = this.periapsisVector.mag()
    this.a = (this.periapsis + this.apoapsis) / 2
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
}
