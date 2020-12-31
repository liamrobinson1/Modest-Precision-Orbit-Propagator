class Propagator {
  constructor(framesElapsed, step, initialState, initialTime, interp, resolution) {
    this.toInterp = interp
    this.framesToPropagate = framesElapsed
    this.initialState = initialState
    this.state = initialState
    this.initialTime = initialTime
    this.integrator = new RungeKutta45(initialTime, initialState, step, framesElapsed, 10 ** -6)
    this.resolutionForDisplay = resolution
    this.diffHistory = []
  }

  propagate() {
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

    return [[t], [x], [y], [z], [vx], [vy], [vz]]
  }

  evaluateStoppingCondition() {
    this.elementValue = calculateElements(this.state, earth, this.stopCondition)
    this.valueHistory.push(this.elementValue)
    this.diffHistory.push(this.elementValue - this.stopValue)
    this.mostRecentAbsDiff = abs(this.valueHistory[this.valueHistory.length - 1] - this.valueHistory[this.valueHistory.length - 2])

    if(Math.abs(this.stopValue - this.elementValue) < 2 * this.mostRecentAbsDiff) {
      return true
    }
    else {
      return false
    }
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
    this.timeDirection = 1
    time.delta = this.stepSize //TESTING THIS HERE, NOT SURE IF CORRECT

    var i = 0
    console.log(this.stopCondition, this.stepSize, this.stopValue, this.tolerance)

    tic("propagationTimer")
    while((this.evaluateStoppingCondition() == false && i < 10000) || i < 10) {
      i += 1
      this.integrator = new RungeKutta45(this.elapsedTime, this.state, this.stepSize, this.stepSize, 10 ** -6)
      this.results = this.integrator.iterate()

      this.extractAndSetState()
      this.stateHistory.push(this.state)
      this.elapsedTime += this.stepSize
    }
    this.searchAndDestroy()

    console.log("We must propagate for ", this.elapsedTime.toFixed(3))
    toc("propagationTimer")
  }

  searchAndDestroy() {
    this.stepSize = this.stepSize / 4 //To make sure we can trigger the first halving
    this.searchStateHistory = [[], []]
    var i = 0

    while(Math.abs(this.stopValue - this.elementValue) > 0.0000001 && i < 500) {
      i += 1

      this.integrator = new RungeKutta45(this.elapsedTime, this.state, this.stepSize, this.stepSize, 10 ** -6)
      this.results = this.integrator.iterate()

      this.extractAndSetState()
      this.searchStateHistory.push(this.state)

      this.elapsedTime += this.stepSize * this.timeDirection

      this.elementValue = calculateElements(this.state, earth, this.stopCondition)

      if(this.timeDirection == -1) { //Because reversing time has consequences
        this.elementValue = 2 * PI - this.elementValue
      }

      this.valueHistory.push(this.elementValue)
      this.diffHistory.push(this.elementValue - this.stopValue)

      this.mostRecentDiff = this.diffHistory[this.diffHistory.length - 1]
      this.previousDiff = this.diffHistory[this.diffHistory.length - 2]

      if(Math.sign(this.mostRecentDiff) != Math.sign(this.previousDiff)) { //Then we know we've passsed it. time to reverse time and half our step size
        this.stepSize = this.stepSize / 2
        this.timeDirection = -this.timeDirection
        this.state[3] = -this.state[3]
        this.state[4] = -this.state[4]
        this.state[5] = -this.state[5]
      }
    }

    this.state[3] = this.state[3] * this.timeDirection
    this.state[4] = this.state[4] * this.timeDirection
    this.state[5] = this.state[5] * this.timeDirection

    if(!isNaN(this.elementValue)) { //Because a floating point error messes with propagating to theta = pi
      this.stateHistory[this.stateHistory.length - 1] = this.state
    }
    else {
      console.log("reverting to previous pt")
      this.stateHistory[this.stateHistory.length - 1] = this.searchStateHistory[this.searchStateHistory.length - 3]
      this.elapsedTime -= this.stepSize
    }

    console.log("At the end of animation, we should be at: ", this.stateHistory[this.stateHistory.length - 1], this.elapsedTime + time.timeSinceCreation)
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
  constructor(frames) {
    this.framesToAnimate = frames
    this.trajectoryArray = [] //Updated by the propagator
    this.i = 0
    this.animating = false
  }

  showNextStep() {
    this.stepSize = Math.ceil(this.trajectoryArray.length / this.framesToAnimate)
    var nextPoint = this.trajectoryArray[this.i]
    sat.pos.x = nextPoint[0]
    sat.pos.y = nextPoint[1]
    sat.pos.z = nextPoint[2]
    sat.vel.x = nextPoint[3]
    sat.vel.y = nextPoint[4]
    sat.vel.z = nextPoint[5]

    sat.animateTimestep()
    environmentalUpdates()

    this.i += this.stepSize
    time.timeSinceCreation += this.stepSize

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
    time.delta = timeSlider.value()
    time.timeSinceCreation = this.finalTime

    console.log("At the end of animation, we're really at: ", sat.state, time.timeSinceCreation)
  }
}
