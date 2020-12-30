class Moon {
  constructor(bodyMass, orbitRad, centralBody, thetaNaught, drawRadius) {
    this.mass = bodyMass
    this.mu = bodyMass * G
    this.r = orbitRad
    this.theta = thetaNaught
    this.thetaDot = -((G * earthMass / this.r) ** 0.5) / this.r * time.delta
    this.pos = new THREE.Vector3(0, 0, 0)
    this.period = -2 * PI / this.thetaDot
    this.drawRadius = drawRadius
  }

  update() {
    if(time.halt == 0) {
      this.theta += this.thetaDot
      this.pos = new THREE.Vector3(this.r * Math.sin(this.theta) + earth.pos.y, 0, this.r * Math.cos(this.theta) + earth.pos.x)
      this.vel = new THREE.Vector3(this.thetaDot * this.r * Math.cos(this.theta), 0, -this.thetaDot * this.r * Math.sin(this.theta))
    }
  }

  propagate(propDirection, targetObject) {
    this.theta += this.thetaDot * propDirection //here's where we'd change the prop direction
    this.pos = new THREE.Vector3(this.r * Math.cos(this.theta) + earth.pos.x, this.r * Math.sin(this.theta) + earth.pos.y)
    this.vel = new THREE.Vector3(-this.thetaDot * this.r * Math.sin(this.theta), this.thetaDot * this.r * Math.cos(this.theta))
  }

  show() {
    push()
    translate(this.pos.x , this.pos.y , this.pos.z )
    // texture(moonTex)
    sphere(this.drawRadius, 100)
    pop()
    push()
    stroke(0, 255, 0)
    noFill()
    // rotateX(PI / 2)
    ellipse(0, 0, 2 * this.r , 2 * this.r , 24)
    pop()
  }

  queryPosition(time) {
    return new THREE.Vector3(this.r * Math.sin(this.thetaDot * time) + earth.pos.x, earth.pos.y, this.r * Math.cos(this.thetaDot * time) + earth.pos.z)
  }
}

class Earth {
  constructor(bodyMass, bodyPosxi, bodyPosyi, eqRad, polRad, omega, axisTilt) {
    this.mass = bodyMass
    this.mu = bodyMass * G
    this.pos = new THREE.Vector3(bodyPosxi, bodyPosyi, 0)
    this.eqRad = eqRad
    this.polRad = polRad
    this.vel = new THREE.Vector3(0, 0, 0)
    this.omega = omega
    this.axisTilt = axisTilt
    this.toEc = new THREE.Matrix3()
    this.toEc.set(1, 0, 0, 0, Math.cos(-this.axisTilt), Math.sin(-this.axisTilt), 0, -Math.sin(-this.axisTilt), Math.cos(-this.axisTilt))
    this.toEq = new THREE.Matrix3()
    this.toEq.set(1, 0, 0, 0, Math.cos(-this.axisTilt), -Math.sin(-this.axisTilt), 0, Math.sin(-this.axisTilt), Math.cos(-this.axisTilt))
    this.rotation = 0
  }

  show() {
    if(animator.animating == false) {
      this.rotation += this.omega * time.delta
    }
    else {
      this.rotation += this.omega * animator.framesMod * time.delta
    }
    earthRender.rotation.y = this.rotation
    earthRender.rotation.x = this.axisTilt
  }
}

class Time {
  constructor(deltaT, isMasterTime) {
    this.currentFrame = 0
    this.halt = 1
    this.delta = deltaT
    this.timeSinceCreation = 0
    this.keyPressedLastFrame = 0
    this.masterTime = isMasterTime
    this.burnMagnitude = 0
  }

  update() {
    if(this.halt == 0) {
      this.currentFrame += 1
      this.timeSinceCreation += this.delta
    }

    if(this.halt == 1 && p5.keyIsDown(ENTER)) {
      this.halt = 0
    }
    if(this.timeSinceCreation == mission.executionTime) {
      mission.ready = true
    }
  }
}

// function drawVectors() {
//   var earthAcc = p5.Vector.mult(sat.pos, -earth.mu / sat.pos.mag() ** 3).setMag(8)
//   var moonPS = p5.Vector.sub(sat.pos, moon.pos)
//   var moonAcc = p5.Vector.mult(moonPS, -moon.mu / moonPS.mag() ** 3).setMag(8)
//
//   clif("earthAcc", earthAcc)
//
//   push()
//   translate(earth.pos.x , earth.pos.y , earth.pos.z )
//   stroke(0, 255, 0)
//   line(0, 0, 0, sat.pos.x , sat.pos.y , sat.pos.z )
//   stroke(200)
//   translate(sat.pos.x , sat.pos.y , sat.pos.z )
//   line(0, 0, 0, (moon.pos.x - sat.pos.x) , (moon.pos.y - sat.pos.y) , (moon.pos.z - sat.pos.z) )
//   strokeWeight(2)
//   stroke(255, 0, 0)
//   line(0, 0, 0, earthAcc.x, earthAcc.y, earthAcc.z)
//   line(0, 0, 0, moonAcc.x, moonAcc.y, moonAcc.z)
//   pop()
// }

// function drawEcliptic() {
//   push()
//   stroke(255)
//   noFill()
//   // rotateX(PI / 2)
//   plane(300, 300)
//   pop()
// }

function environmentalUpdates() {
  moon.update()
  moonRender.position.x = moon.pos.x
  moonRender.position.y = moon.pos.y
  moonRender.position.z = moon.pos.z
  sunRender.position.x = sunOrbitalRadius
  earth.show()
}
