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

    var i = 0

    tic("propagationTimer")
    while(this.evaluateStoppingCondition() == false && i < 1000) {
      i += 1
      this.integrator = new RungeKutta45(this.elapsedTime, this.state, this.stepSize, 1, 10 ** -6)
      this.results = this.integrator.iterate()

      this.extractAndSetState()
      this.elapsedTime += this.stepSize
      this.adaptStepSize() //ENSURES THAT WE DON'T SKIP OUR VALUE
    }
    console.log("We must propagate for ", this.elapsedTime, this.valueHistory)
    toc("propagationTimer")
    return this.elapsedTime
  }

  adaptStepSize() {
    if(Math.abs(this.valueHistory[this.valueHistory.length - 1] - this.valueHistory[0]) / Math.abs(this.stopValue - this.valueHistory[0]) > 0.6) {
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
