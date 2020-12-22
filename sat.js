
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
    this.mostRecentPath = []
    this.theta = 0
    this.specificE = 0
    this.eccMoon = 0

    if(!this.isPreviousState) {
      this.previousObjectState = new GravSat(100, 0, this.mass, 1)
    }
  }

  drawMostRecentPath() {
    push()
    beginShape()
    noFill()
    stroke(100, 100, 150)
    for(var i = 0; i < this.mostRecentPath.length; i++) {
      vertex(this.mostRecentPath[i][0], this.mostRecentPath[i][1])
    }
    endShape()
    pop()
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

        var moonGravVector = createVector(currentMoon.pos.x - this.pos.x, currentMoon.pos.y - this.pos.y)
        moonGravVector = p5.Vector.div(moonGravVector, moonGravVector.mag()).mult(G * currentMoon.mass / moonGravVector.mag() ** 2)
        var earthGravVector = p5.Vector.mult(gravUnitVector, fmag)

        this.acc = p5.Vector.add(earthGravVector, createVector(0, 0))
        this.vel = createVector(this.vel.x + this.acc.x * this.deltaT / propFidelity, this.vel.y + this.acc.y * this.deltaT / propFidelity)

        if(propDirection == -1 && this.velFlipped == 0) {
          this.vel = createVector(-this.vel.x + this.acc.x * this.deltaT / propFidelity, -this.vel.y + this.acc.y * this.deltaT / propFidelity)
          this.velFlipped = 1
        }

        this.pos = createVector(this.pos.x + this.vel.x * this.deltaT / propFidelity, this.pos.y + this.vel.y * this.deltaT / propFidelity)
        this.vectorToEarth = createVector(earth.pos.x - this.pos.x, earth.pos.y - this.pos.y)
        this.vectorToMoon = createVector(currentMoon.pos.x - this.pos.x, currentMoon.pos.y - this.pos.y)
        this.distToEarth = this.vectorToEarth.mag()
        this.distToMoon = this.vectorToMoon.mag()
        this.velMoon = createVector(-currentMoon.vel.x + this.vel.x, -currentMoon.vel.y + this.vel.y)
        this.posMoon = createVector(-currentMoon.pos.x + this.pos.x, -currentMoon.pos.y + this.pos.y)

        if(this.distToEarth < earth.drawRadius) {
          return 0
        }
        if(this.distToMoon < currentMoon.drawRadius) {
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
    copyInto.h = parseFloat(this.h)
    copyInto.p = parseFloat(this.p)
    copyInto.dvUsed = parseFloat(this.dvUsed)
    copyInto.mass = parseFloat(this.mass)
    copyInto.ecc = parseFloat(this.ecc)
    copyInto.deltaT = parseFloat(this.deltaT)
    copyInto.velMoon = createVector(this.velMoon.x, this.velMoon.y)
    copyInto.posMoon = createVector(this.posMoon.x, this.posMoon.y)
    copyInto.apoapsisVector = createVector(this.apoapsisVector.x, this.apoapsisVector.y)
    copyInto.periapsisVector = createVector(this.periapsisVector.x, this.periapsisVector.y)
    copyInto.moonAngle = parseFloat(this.moonAngle)
    copyInto.currentSOI = this.currentSOI.toString()
    copyInto.eccMoon = parseFloat(this.eccMoon)
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
    if(dist(this.pos.x, this.pos.y, targetMoon.pos.x, targetMoon.pos.y) < targetMoon.SOIrad && (initialSOI = "moon" || initialSOI == "any")) {
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
    this.mu = G * earth.mass
    this.gamma = -this.vel.angleBetween(this.gravityVector) - PI / 2
    this.r_for_cross = createVector(this.pos.x - earth.pos.x, this.pos.y - earth.pos.y, 0)
    this.RMAG = this.r_for_cross.mag()
    this.rUnit = p5.Vector.div(this.r_for_cross, this.r_for_cross.mag())
    this.v_for_cross = createVector(this.vel.x, this.vel.y, 0)
    this.VMAG = this.v_for_cross.mag()

    this.h = p5.Vector.cross(this.r_for_cross, this.v_for_cross).mag()
    this.p = this.h ** 2 / this.mu
    this.period = 2 * PI * ((this.a) ** 3 / (G * earth.mass)) ** 0.5
    this.theta = this.periapsisVector.angleBetween(this.vectorToEarth)

    if(this.theta > 0) {
      this.theta = 2 * PI - this.theta
    }
    if(this.theta < 0) {
      this.theta = -this.theta
    }

    this.S = this.velMoon
    this.T = p5.Vector.cross(this.velMoon, createVector(0, 0, 1))
    this.R = p5.Vector.cross(this.S, this.T)
    this.B = p5.Vector.cross(this.S, createVector(0, 0, 1))

    this.BdotR = p5.Vector.dot(this.B, this.R)
    this.BdotT = p5.Vector.dot(this.B, this.T)

    this.moonAngle = -this.vectorToEarth.angleBetween(createVector(earth.pos.x - currentMoon.pos.x, earth.pos.y - currentMoon.pos.y))
    this.hMoon = p5.Vector.cross(p5.Vector.mult(this.vectorToMoon, -1), this.velMoon).mag()

    this.pMoon = this.hMoon ** 2 / (moon.mass * G)
    var moonVxH = p5.Vector.cross(this.velMoon, createVector(0, 0, this.hMoon))
    var muMoon = G * moon.mass
    var moonUnitPosVector = p5.Vector.div(this.vectorToMoon, -this.vectorToMoon.mag())
    this.eccMoonVector = p5.Vector.div(moonVxH, muMoon).sub(moonUnitPosVector)
    this.eccMoon = this.eccMoonVector.mag()
    this.aMoon = this.moonPeriapsis / (1 - this.eccMoon)
  }

  displayElements() {
    push()
    noStroke()
    fill(255)
    text("timeElapsed in secs: " + time.timeSinceCreation, 100, 20)
    text("VMAG: " + this.VMAG.toFixed(2), 100, 60)
    text("RMAG: " + this.RMAG.toFixed(2), 100, 80)
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
    text("BdotR_moon: " + this.BdotR.toFixed(2), 100, 400)
    text("BdotT_moon: " + this.BdotT.toFixed(2), 100, 420)
    text("moonAngle: " + this.moonAngle.toFixed(2), 100, 440)
    text("hmoon: " + this.hMoon.toFixed(2), 100, 460)
    text("pmoon: " + this.pMoon.toFixed(2), 100, 480)
    text("eccmoon: " + this.eccMoon.toFixed(2), 100, 500)
    text("amoon: " + this.aMoon.toFixed(2), 100, 520)
    text("moonperiapsis: " + this.moonPeriapsis.toFixed(2), 100, 40)
    text("mooneccvec: " + (moon.thetaDot * moon.r), 100, 540)
    pop()
  }

  displayFutureTrajectory(framesToProp) {
    var propagator = new Targeter(this, "noChange", null, 1, "showFrames", null, "burnV", 0.00, 100, 0.01, null, null)
    propagator.propagate(propagator.propFidelity, "showFrames", framesToProp, 1, "any", "CORRECTING_DO_NOT_SUBCALL")
  }

  correctThetaFindRs(maxFrames) {
    var propagator = new Targeter(this, "noChange", null, 1, "moonperiapsis", null, "burnV", 0.00, 100, 0.01, maxFrames, null)
    propagator.propagate(propagator.propFidelity, "moonperiapsis", null, 1, "moon", "CORRECTING_DO_NOT_SUBCALL")
    this.moonPeriapsis = propagator.targetObject.distToMoon

    var propagator = new Targeter(this, "noChange", null, 1, "periapsis", null, "burnV", 0.00, 100, 0.01, 5000, null)
    propagator.propagate(propagator.propFidelity, "periapsis", null, -1, this.currentSOI, "CORRECTING_DO_NOT_SUBCALL")
    this.periapsisVector = createVector(propagator.targetObject.gravityVector.x, propagator.targetObject.gravityVector.y)

    if(this.periapsisVector.mag() > 1000) { //OCCURS WHEN WE"RE ON THE INCOMING HYPERBOLIC ASYMPTOTE
      var propagator = new Targeter(this, "noChange", null, 1, "periapsis", null, "burnV", 0.00, 100, 0.01, 5000, null)
      propagator.propagate(propagator.propFidelity, "periapsis", null, 1, this.currentSOI, "CORRECTING_DO_NOT_SUBCALL")
      this.periapsisVector = createVector(propagator.targetObject.gravityVector.x, propagator.targetObject.gravityVector.y)
    }

    if(propagator.propSuccess == 1) {
      // this.displayFutureTrajectory(this.period)
      this.periapsis = this.periapsisVector.mag()
    }

    this.ecc = this.p / this.periapsis - 1
    this.apoapsis = this.p / (1 - this.ecc)
    this.a = (this.apoapsis + this.periapsis) / 2
    this.specificE = -this.mu / (2 * this.a)
    this.period = 2 * PI * ((this.a) ** 3 / (G * earth.mass)) ** 0.5
  }

  executeManeuver(dv) {
    this.vel.setMag(dv + this.vel.mag())
  }

  undoLastTimeStep() { //THIS IS WRONG RIGHT NOW
    this.previousObjectState.copy(this)
  }

  standardTimestep() {
    this.stillInOnePiece = this.orbitUpdate(time.halt, 1, moon, 1)
    this.calculateElements(moon)
    this.displayElements()
    this.showSat()
  }
}
