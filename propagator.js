class Propagator {
  constructor(framesElapsed, step, initialState, initialTime, interp, resolution) {
    this.toInterp = interp
    this.framesToPropagate = framesElapsed
    this.initialState = initialState
    this.state = initialState
    this.initialTime = initialTime
    this.integrator = new RungeKutta45(initialTime, initialState, step, framesElapsed, 10 ** -6)
    this.resolutionForDisplay = resolution
  }

  evaluateStoppingCondition() {
    var elementValue = calculateElements(this.state, earth, this.stopCondition)
    this.valueHistory.push(elementValue)
    if(Math.abs(this.stopValue - elementValue) < this.tolerance) {
      return true
    }
    else {
      return false
    }
  }

  propagate() {
    if(time.timeSinceCreation % (100 * time.delta) == 0) {
      tic("500 frame prop")
    }

    this.results = this.integrator.iterate()
    var x = this.integrator.extract(0)
    var y = this.integrator.extract(1)
    var z = this.integrator.extract(2)
    var vx = this.integrator.extract(3)
    var vy = this.integrator.extract(4)
    var vz = this.integrator.extract(5)
    var t = this.integrator.extract("t")

    if(this.toInterp != "No Interp") {
      var xinterp = interpolate(t, x, this.resolutionForDisplay)
      var yinterp = interpolate(t, y, this.resolutionForDisplay)
      var zinterp = interpolate(t, z, this.resolutionForDisplay)
    }
    if(time.timeSinceCreation % (100 * time.delta) == 0) {
      toc("500 frame prop")
    }
    return [[t], [x], [y], [z], [vx], [vy], [vz]]
  }

  propagateToValue(referenceBody, stopCondition, stopValue, tolerance, stepSize) {
    this.stopCondition = stopCondition
    this.stopValue = stopValue
    this.tolerance = tolerance
    this.elapsedTime = 0
    this.stepSize = stepSize
    this.initialStepSize = stepSize
    this.valueHistory = []
    this.stateHistory = []

    var i = 0

    console.log(this.stopCondition, this.stepSize, this.stopValue, this.tolerance)

    tic("propagationTimer")
    while((this.evaluateStoppingCondition() == false && i < 10000) || i < 100) {
      i += 1
      this.integrator = new RungeKutta45(this.elapsedTime, this.state, this.stepSize, this.stepSize, 10 ** -6)
      this.results = this.integrator.iterate()

      this.extractAndSetState()
      this.stateHistory.push(this.state)
      this.elapsedTime += this.stepSize
      this.adaptStepSize() //ENSURES THAT WE DON'T SKIP OUR VALUE
    }
    console.log("We must propagate for ", this.elapsedTime, this.valueHistory)
    toc("propagationTimer")
  }

  adaptStepSize() {
    if(Math.abs(this.valueHistory[this.valueHistory.length - 1] - this.valueHistory[0]) / Math.abs(this.stopValue - this.valueHistory[0]) > 0.94) {
      if(Math.abs(this.valueHistory[this.valueHistory.length - 1] - this.valueHistory[this.valueHistory.length - 2]) > this.tolerance / 2) {
        this.stepSize = this.stepSize * 0.8
      }
    }
  }

  extractAndSetState() {
    var x = this.integrator.extract(0)
    var y = this.integrator.extract(1)
    var z = this.integrator.extract(2)
    var vx = this.integrator.extract(3)
    var vy = this.integrator.extract(4)
    var vz = this.integrator.extract(5)
    var t = this.integrator.extract("t")

    var pointsComputed = t.length

    this.state = [x[1], y[1], z[1], vx[1], vy[1], vz[1]]
  }
}


class Animator {
  constructor(framesMod) {
    this.framesMod = framesMod
    this.trajectoryArray = []
    this.i = 0
    this.animating = false
  }

  showNextStep() {
    var nextPoint = this.trajectoryArray[this.i]
    sat.pos.x = nextPoint[0]
    sat.pos.y = nextPoint[1]
    sat.pos.z = nextPoint[2]
    sat.vel.x = nextPoint[3]
    sat.vel.y = nextPoint[4]
    sat.vel.z = nextPoint[5]

    sat.animateTimestep()
    environmentalUpdates()

    this.i += this.framesMod
    time.timeSinceCreation += animator.stepSize
    time.delta = animator.stepSize

    if(this.i >= this.trajectoryArray.length - 1) {
      sat.pos.x = this.trajectoryArray[this.trajectoryArray.length - 1][0]
      sat.pos.y = this.trajectoryArray[this.trajectoryArray.length - 1][1]
      sat.pos.z = this.trajectoryArray[this.trajectoryArray.length - 1][2]
      sat.vel.x = this.trajectoryArray[this.trajectoryArray.length - 1][3]
      sat.vel.y = this.trajectoryArray[this.trajectoryArray.length - 1][4]
      sat.vel.z = this.trajectoryArray[this.trajectoryArray.length - 1][5]
      sat.calculateElements(earth)

      this.endAnimation()
    }
  }

  endAnimation() {
    time.halt = 1
    this.animating = false
    this.i = 0
    this.trajectoryArray = []
    time.delta = deltaT
    time.timeSinceCreation -= time.timeSinceCreation % time.delta
  }
}
