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
    this.stepSize = step
    this.initialStepSize = step
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
    this.elementValue = calculateElements(this.state, this.centralBody, this.stopCondition)
    this.valueHistory.push(this.elementValue)
    this.diffHistory.push(this.elementValue - this.stopValue)
    this.mostRecentAbsDiff = abs(this.valueHistory[this.valueHistory.length - 1] - this.valueHistory[this.valueHistory.length - 2])

    // console.log(this.stopCondition, this.stopValue, this.elementValue, this.mostRecentAbsDiff)
    // if(Math.random() > 0.99) {
    //   console.log(calculateElements(this.state, moon, "theta"))
    // }

    if(Math.abs(this.stopValue - this.elementValue) < 2 * this.mostRecentAbsDiff) {
      return true
    }
    else {
      return false
    }
  }

  // propagateToLocalExtrema(referenceBody, parameter, stepSize) {
  //   this.valueHistory = []
  //   this.stateHistory = []
  //   this.timeDirection = 1
  //   time.delta = this.stepSize //Still not sure
  //   this.stopCondition = parameter
  //   this.centralBody = referenceBody
  //
  //   var i = 0
  //
  //   this.integrator = new RungeKutta45(this.elapsedTime, this.state, this.stepSize, this.stepSize, 10 ** -6)
  //   this.results = this.integrator.iterate()
  //
  //   this.extractAndSetState()
  //   this.stateHistory.push(this.state)
  //   this.elapsedTime += this.stepSize
  //   this.valueHistory.push(calculateElements(this.state, earth, this.stopCondition))
  // }

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
    this.centralBody = referenceBody

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

    console.log(this.centralBody)

    // if(this.centralBody.r != 358000) {
    this.searchAndDestroy()
    // }

    console.log("We must propagate for ", this.elapsedTime.toFixed(3))
    toc("propagationTimer")
  }

  searchAndDestroy() {
    console.log("I got handed to S+D", this.elementValue)
    this.stepSize = this.stepSize / 4                                           //To make sure we can trigger the first halving
    this.searchStateHistory = [[], []]
    this.timeDirectionHistory = []
    var i = 0

    while(Math.abs(this.stopValue - this.elementValue) > 0.0000001 && i < 500) {
      console.log(this.elementValue)
      i += 1

      this.integrator = new RungeKutta45(this.elapsedTime, this.state, this.stepSize, this.stepSize, 10 ** -6)
      this.results = this.integrator.iterate()

      this.extractAndSetState()
      this.searchStateHistory.push(this.state)
      this.timeDirectionHistory.push(this.timeDirection)

      this.elapsedTime += this.stepSize * this.timeDirection

      this.elementValue = calculateElements(this.state, this.centralBody, this.stopCondition)

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

    if(!isNaN(this.elementValue)) { //Because a floating point error messes with propagating to theta = pi
      this.state[3] = this.state[3] * this.timeDirection
      this.state[4] = this.state[4] * this.timeDirection
      this.state[5] = this.state[5] * this.timeDirection

      this.stateHistory[this.stateHistory.length - 1] = this.state
    }
    else {
      this.previousState = this.searchStateHistory[this.searchStateHistory.length - 3]
      this.previousTimeDirection = this.timeDirectionHistory[this.timeDirectionHistory.length - 3]

      this.previousState[3] = this.previousState[3] * this.previousTimeDirection
      this.previousState[4] = this.previousState[4] * this.previousTimeDirection
      this.previousState[5] = this.previousState[5] * this.previousTimeDirection

      this.stateHistory[this.stateHistory.length - 1] = this.previousState
      this.elapsedTime -= this.stepSize
    }
    console.log("At the end of the propagation, time direction is: ", this.timeDirection, this.state[3])
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
