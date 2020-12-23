class ExhaustPlume {
  constructor(thrusterPos, sourceVelMag, thrustVector, thrustMag, particleNum, lifetime) {
    this.particles = []
    this.particleNum = particleNum
    this.timer = new Time(1, 0)

    for(var i = 0; i < this.particleNum; i++) {
      this.particles[i] = new ExhaustParticle(thrusterPos, sourceVelMag, thrustVector, thrustMag, lifetime)
    }
  }

  update() {
    this.timer.update()
    for(var i = 0; i < this.particles.length; i++) {
      if(this.timer.timeSinceCreation < this.particles[i].lifetime) {
        this.particles[i].update()
      }
      else {
        this.particles.splice(i, 1)
      }
    }
  }

  show() {
    for(var i = 0; i < this.particles.length; i++) {
      this.particles[i].show()
    }
  }
}

class ExhaustParticle {
  constructor(thrusterPos, sourceVelMag, thrustVector, thrustMag, lifetime) {
    var angleRandFactor = 1/7
    var velRandFactor = 2
    var colorRandFactor = 50
    this.sourceVelMag = sourceVelMag
    this.color = color(200 + Math.random() * colorRandFactor, Math.random() * colorRandFactor, 0)
    this.velMag = thrustMag + Math.random() * velRandFactor
    this.thrustMag = thrustMag
    this.thrustVector = createVector(thrustVector.x + Math.random() * angleRandFactor, thrustVector.y + Math.random() * angleRandFactor)
    this.vel = p5.Vector.div(this.thrustVector, this.thrustVector.mag()).mult(this.velMag)
    this.lifetime = lifetime + Math.sign(Math.random() - 0.5) * Math.random() * lifetime / 2

    this.sourceVel = p5.Vector.div(this.thrustVector, this.thrustVector.mag()).mult(this.sourceVelMag)
    this.pos = createVector(thrusterPos.x, thrusterPos.y)
  }

  update() {
    this.pos = createVector(this.pos.x + this.vel.x + this.sourceVel.x, this.pos.y + this.vel.y + this.sourceVel.y)
  }

  show() {
    if(this.thrustMag > 0) {
      push()
      stroke(this.color, 100)
      strokeWeight(2)
      point(this.pos.x, this.pos.y)
      pop()
    }
  }
}
