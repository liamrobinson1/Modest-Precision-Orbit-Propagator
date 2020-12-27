
class GravSat { //[1867.27869, -5349.42646, 3744.90429, 8.292274371, -0.820936859, -4.298237588]
  constructor(r, t, satMass) {
    // this.pos = new THREE.Vector3(earth.pos.x + r * cos(t), earth.pos.y + -r * sin(t))
    // this.vel = new THREE.Vector3(-sin(t), -cos(t) + 0.00001, .4).mult((G * earth.mass / r) ** 0.5)
    this.pos = new THREE.Vector3(1867.27869, -5349.42646, 3744.90429)
    this.vel = new THREE.Vector3(6.292274371, -0.820936859, -4.298237588)
    this.acc = new THREE.Vector3(0, 0, 0)
    this.gravityVector = new THREE.Vector3(0, 0, 0)
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
    this.initialPosition = new THREE.Vector3(earth.pos.x + r * Math.cos(t), earth.pos.y -r * Math.sin(t), 0)
    this.apoapsisVector = new THREE.Vector3(this.pos.x, this.pos.y, 0)
    this.periapsisVector = new THREE.Vector3(this.pos.x, this.pos.y, 0)
    this.dvUsed = 0
    this.stillInOnePiece = 1
    this.deltaT = deltaT
    this.missionSegment = 0
    this.haltPropagation = 0
    this.mostRecentPath = []
    this.theta = 0
    this.specificE = 0
    this.eccMoon = 0
    this.eccMoonVector = new THREE.Vector3(0, 0, 0)
    this.moonPos = new THREE.Vector3(0, 0, 0)
    this.earthPosVelAngle = 0
    this.state = [0, this.pos.x, this.pos.y, this.pos.z, this.vel.x, this.vel.y, this.vel.z]
    this.groundTrack = [[], [], []]
  }

  orbitUpdate(halt, step) {
    if(halt == 0) {
      var propagator = new Propagator(2 * step, step, [this.pos.x, this.pos.y, this.pos.z, this.vel.x, this.vel.y, this.vel.z], time.timeSinceCreation, "No Interp")
      this.state = propagator.propagate()

      this.vel = new THREE.Vector3(this.state[4][0][1], this.state[5][0][1], this.state[6][0][1])
      this.pos = new THREE.Vector3(this.state[1][0][1], this.state[2][0][1], this.state[3][0][1])

      if(this.distToEarth < earth.eqRad) {
        return 0
      }
      if(this.distToMoon < moon.drawRadius) {
        return 0
      }
    }
    return 1
  }

  showSat() {
  }

  calculateElements(body) { //CALCULATES ORBITAL ELEMENTS WITH RESPECT TO A BODY
    this.mu = G * body.mass

    this.rBody = new THREE.Vector3(this.pos.x - body.pos.x, this.pos.y - body.pos.y, this.pos.z - body.pos.z)
    this.vBody = new THREE.Vector3(this.vel.x - body.vel.x, this.vel.y - body.vel.y, this.vel.z - body.vel.z)

    //PLACEHOLDERS UNTIL I FIX
    this.distToEarth = new THREE.Vector3(this.pos.x - earth.pos.x, this.pos.y - earth.pos.y, this.pos.z - earth.pos.z).length()
    this.distToMoon = new THREE.Vector3(this.pos.x - moon.pos.x, this.pos.y - moon.pos.y, this.pos.z - moon.pos.z).length()

    this.rBodyHat = new THREE.Vector3(this.rBody.x / this.rBody.length(), this.rBody.y / this.rBody.length(), this.rBody.z / this.rBody.length())
    this.vBodyHat = new THREE.Vector3(this.vBody.x / this.vBody.length(), this.vBody.y / this.vBody.length(), this.vBody.z / this.vBody.length())

    this.RMAG = this.rBody.length()
    this.VMAG = this.vBody.length()

    this.vectorToBody = new THREE.Vector3()
    this.vectorToBody.multiplyVectors(this.rBody, -1)

    this.bodyPosVelAngle = this.rBody.angleTo(this.vectorToBody)

    this.hVector = new THREE.Vector3()
    this.hVector.crossVectors(this.rBody, this.vBody)
    this.h = this.hVector.length()

    this.orbitNormal = new THREE.Vector3(this.hVector.x / this.h, this.hVector.y / this.h, this.hVector.z / this.h)
    this.orbitBinormal = new THREE.Vector3()
    this.orbitBinormal.crossVectors(this.vBodyHat, this.orbitNormal)

    this.a = 1 / (2 / this.RMAG - this.VMAG ** 2 / this.mu)
    this.period = 2 * PI * ((this.a) ** 3 / this.mu) ** 0.5
    this.p = this.h ** 2 / this.mu
    this.e = -this.mu / (2 * this.a)
    this.ecc = (1 + 2 * this.e * this.h ** 2 / this.mu ** 2) ** 0.5
    // this.eccVector = p5.Vector.cross(this.vBody, this.hVector).div(this.mu).sub(this.rBodyHat)

    this.apoapsis = this.a * (1 + this.ecc)
    this.periapsis = this.a * (1 - this.ecc)

    this.gamma = Math.acos(this.h / (this.RMAG * this.VMAG))

    if(this.rBody.dot(this.vBody) > 0) {
      this.theta = Math.acos((this.p / this.RMAG - 1) / this.ecc)
    }
    else {
      this.theta = 2 * PI - Math.acos((this.p / this.RMAG - 1) / this.ecc)
    }

    if(this.ecc > 1) {
      // this.calculateHyperbolicParameters(body)
    }
  }

  displayElements() {
    var txt = ""
    txt += "timeElapsed in secs: " + time.timeSinceCreation + "\n"
    txt += "VMAG: " + this.VMAG + "\n"
    txt += "disttoearth: " + this.distToEarth + "\n"
    txt += "RMAG: " + this.RMAG + "\n"
    txt += "gamma: " + this.gamma + "\n"
    txt += "h: " + this.h + "\n"
    txt += "theta: " + this.theta + "\n"
    txt += "specificE: " + this.e + "\n"
    txt += "period: " + this.period + "\n"
    txt += "ecc: " + this.ecc + "\n"
    txt += "apo: " + this.apoapsis + "\n"
    txt += "peri: " + this.periapsis + "\n"
    txt += "a: " + this.a + "\n"

    document.getElementById("info").innerText = txt
  }

  calculateHyperbolicParameters() {
    this.betaAngle = Math.acos(1 / this.ecc)
    //
    // var s1 = p5.Vector.mult(this.eccVector, cos(this.betaAngle))
    // var s2 = p5.Vector.mult(p5.Vector.cross(this.orbitNormal, this.eccVector), sin(this.betaAngle))

    this.S = p5.Vector.add(s1, s2)

    var t1 = p5.Vector.cross(this.S, this.orbitNormal)

    this.T = p5.Vector.div(t1, t1.length())
    this.R = p5.Vector.cross(this.S, this.T)

    var b1 = abs(this.a) * (this.ecc ** 2 - 1) ** 0.5
    var b2 = p5.Vector.cross(this.S, this.orbitNormal)

    this.B = p5.Vector.mult(b2, b1)

    this.BdotR = p5.Vector.dot(this.B, this.R)
    this.BdotT = p5.Vector.dot(this.B, this.T)
  }

  displayFutureTrajectory(framesToProp, rb) {
    var propagator = new Propagator(framesToProp, 10, [this.pos.x - rb.pos.x, this.pos.y - rb.pos.y, this.pos.z - rb.pos.z, this.vel.x - rb.vel.x, this.vel.y - rb.vel.y, this.vel.z - rb.vel.z], time.timeSinceCreation, "No Interp")
    this.futureState = propagator.propagate()

    var drawPoints = []
    for(var i = 0; i < this.futureState[1][0].length; i++) {
      if(i % 20 == 0) {
        drawPoints.push(new THREE.Vector3(this.futureState[1][0][i], this.futureState[2][0][i], this.futureState[3][0][i]))
      }
    }
    showVertexPath(drawPoints, new THREE.Color('rgb(0, 255, 0)'))
  }

  saveGroundTrack(body) {
    if(time.timeSinceCreation % (10 * time.delta) == 0) {
      var pt = new THREE.Vector3()
      pt.copy(this.rBodyHat)
      pt.multiplyScalar(earth.eqRad + 20)
      this.groundTrack[0].push(pt.x)
      this.groundTrack[1].push(pt.y)
      this.groundTrack[2].push(pt.z)
    }
    for(var i = 0; i < this.groundTrack[0].length; i++) {
      this.groundTrack[0][i] = this.groundTrack[0][i] * Math.cos(earth.omega) + this.groundTrack[2][i] * Math.sin(earth.omega)
      this.groundTrack[2][i] = -this.groundTrack[0][i] * Math.sin(earth.omega) + this.groundTrack[2][i] * Math.cos(earth.omega)
    }
  }

  showGroundTrack() {
    var points = []
    for(var i = this.groundTrack[0].length - 1; i >= 0; i--) {
      points.push(new THREE.Vector3(this.groundTrack[0][i], this.groundTrack[1][i], this.groundTrack[2][i]))
    }
    showVertexPath(points, new THREE.Color("rgb(255, 0, 255)"))
  }

  executeManeuver(axis, dv) {
    switch(axis) {
      case "V":
        this.vel.setLength(dv + this.vel.length())
        break
      case "N":
        var dvVector = new THREE.Vector3()
        dvVector.copy(this.orbitNormal)
        this.vel.add(dvVector.multiplyScalar(dv))
        break
      case "B":
      var dvVector = new THREE.Vector3()
      dvVector.copy(this.orbitBinormal)
      this.vel.add(dvVector.multiplyScalar(dv))
      break
    }
  }

  standardTimestep() {
    if(this.stillInOnePiece == 1) {
      // this.showSat()
      this.calculateElements(earth)
      this.stillInOnePiece = this.orbitUpdate(time.halt, time.delta)
      this.showTrail()
      this.saveGroundTrack(earth)
      this.showGroundTrack()
    }
    sat.displayFutureTrajectory(1000, earth)

    if(time.timeSinceCreation % (4 * time.delta) == 0) {
      sat.displayElements()
    }
  }

  showTrail() {
    if(sat.stillInOnePiece == 1 && time.halt == 0 && time.timeSinceCreation % (5 * time.delta) == 0) {
      pastPoints.push(new THREE.Vector3(sat.pos.x, sat.pos.y, sat.pos.z))
    }
    showVertexPath(pastPoints, new THREE.Color('rgb(255, 0, 0)'))
  }

  //ORBITAL MANEUVERS
  propToApoapsis(body) {
    var propagator = new Propagator(2, 1, [this.pos.x, this.pos.y, this.pos.z, this.vel.x, this.vel.y, this.vel.z], time.timeSinceCreation, "No Interp", 1)
    var timeToPropagate = propagator.propagateToValue(body, "theta", PI, 0.01, 1)
    this.displayFutureTrajectory(timeToPropagate)
    time.halt = 1
  }

  propToPeriapsis(body) {
    var propagator = new Propagator(2, 1, [this.pos.x, this.pos.y, this.pos.z, this.vel.x, this.vel.y, this.vel.z], time.timeSinceCreation, "No Interp", 1)
    var timeToPropagate = propagator.propagateToValue(body, "theta", 2 * PI, 0.01, 1)
    this.displayFutureTrajectory(timeToPropagate)
    time.halt = 1
  }

  propToTheta(body, thetaValue) {
    var propagator = new Propagator(2, 1, [this.pos.x, this.pos.y, this.pos.z, this.vel.x, this.vel.y, this.vel.z], time.timeSinceCreation, "No Interp", 1)
    var timeToPropagate = propagator.propagateToValue(body, "theta", thetaValue, 0.01, 1)
    this.displayFutureTrajectory(timeToPropagate)
    time.halt = 1
  }

  propToPosVelAngle(body, angle) {
    console.log(angle)
    var propagator = new Propagator(2, 1, [this.pos.x, this.pos.y, this.pos.z, this.vel.x, this.vel.y, this.vel.z], time.timeSinceCreation, "No Interp", 1)
    var timeToPropagate = propagator.propagateToValue(body, "bodyAngle", angle, 0.01, 1)
    this.displayFutureTrajectory(timeToPropagate)
    time.halt = 1
  }
}
