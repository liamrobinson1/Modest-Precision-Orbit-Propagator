class Moon {
  constructor(bodyMass, orbitRad, centralBody, thetaNaught, drawRadius, omega) {
    this.mass = bodyMass
    this.mu = bodyMass * G
    this.r = orbitRad
    this.theta = thetaNaught
    this.thetaDot = omega
    this.pos = new THREE.Vector3(0, 0, 0)
    this.period = -2 * PI / this.thetaDot
    this.drawRadius = drawRadius
  }

  update() {
    if(time.halt == 0) {
      this.pos = new THREE.Vector3(this.r * Math.sin(this.thetaDot * time.timeSinceCreation) + earth.pos.y, 0, this.r * Math.cos(this.thetaDot * time.timeSinceCreation) + earth.pos.x)
      this.vel = new THREE.Vector3(this.thetaDot * this.r * Math.cos(this.thetaDot * time.timeSinceCreation), 0, -this.thetaDot * this.r * Math.sin(this.thetaDot * time.timeSinceCreation))
    }
  }

  queryPosition(time) {
    return new THREE.Vector3(this.r * Math.sin(this.thetaDot * time) + earth.pos.x, earth.pos.y, this.r * Math.cos(this.thetaDot * time) + earth.pos.z)
  }

  show() {
    push()
    translate(this.pos.x , this.pos.y , this.pos.z )
    sphere(this.drawRadius, 100)
    pop()
    push()
    stroke(0, 255, 0)
    noFill()
    ellipse(0, 0, 2 * this.r , 2 * this.r , 24)
    pop()
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
    this.rotationIncrement = this.omega * time.delta
  }

  show() {
    if(animator.animating == false) {
      this.rotationIncrement = this.omega * time.delta
    }
    else {
      this.rotationIncrement = this.omega * animator.timeStep
    }

    this.rotation += this.rotationIncrement
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
      if(animator.animating == false) {
        this.delta = timeSlider.value()
      }
    }

    if(this.halt == 1 && p5.keyIsDown(ENTER)) {
      this.halt = 0
    }
    if(this.timeSinceCreation == mission.executionTime) {
      mission.ready = true
    }
  }
}

function environmentalUpdates() {
  moon.update()
  moonRender.position.x = moon.pos.x
  moonRender.position.y = moon.pos.y
  moonRender.position.z = moon.pos.z
  sunRender.position.x = sunOrbitalRadius
  earth.show()
}
