class Targeter {
  constructor(targetObject, targetParameter, targetValue, propFidelity, propStopCondition, propStopValue, controlVariable, userGuess, attemptLimit, tolerance) {
    let tempSat = new GravSat(targetObject.distToEarth, 0, satMass, 0)
    let tempMoon = new Moon(parseFloat(moon.mass), parseFloat(moon.r), earth, parseFloat(moon.theta))
    targetObject.copy(tempSat)
    this.originalObject = targetObject
    this.targetObject = tempSat
    this.originalMoon = moon
    this.targetMoon = tempMoon
    this.targetParameter = targetParameter
    this.controlVariable = controlVariable
    this.propStopCondition = propStopCondition
    this.propStopValue = propStopValue
    this.propFidelity = propFidelity
    this.tolerance = tolerance
    this.currentControlValue = 0
    this.previousControlValue = 0
    this.equalityParameter = 0
    this.currentFcnValue = 0
    this.previousFcnValue = 0

    //SETS UP THE TARGET SEQUENCE PARAMETERS
    this.equalityCondition = targetValue
    this.currentControlValue = userGuess
    this.initialControlValue = userGuess
    this.attemptLimit = attemptLimit
  }

  findPropagateTime() {
    this.vary()
  }

  propagateStep(i, stopConditionValue, propFidelity) {
    this.targetMoon.propagate()
    this.targetObject.propagateSOI(this.targetMoon)
    this.propSuccess = parseInt(this.targetObject.orbitUpdate(0, propFidelity, this.targetMoon))

    //FINDING E AND THINGS
    if(i == 1 && stopConditionValue != "CORRECTING_DO_NOT_SUBCALL") {
      this.targetObject.correctThetaFindRs()
      // this.targetObject.displayElements()
    }

    this.targetObject.calculateElements(this.targetMoon)
    this.propTrail.push([this.targetObject.pos.x, this.targetObject.pos.y])
  }

  propagate(propFidelity, stopCondition, stopConditionValue) {
    this.convergenceStatus = "nominal"
    this.propTrail = []
    this.propSuccess = 1
    time.currentFrame += 1

    this.targetObject.executeManeuver(this.currentControlValue)

    switch(stopCondition) {
      case "framesElapsed":
        for(var j = 0; j < stopConditionValue; j++) {
          if(this.propSuccess == 1) {
            this.propagateStep(j, stopConditionValue, propFidelity)
          }
        }
        break

      case "showFrames":
        for(var j = 0; j < stopConditionValue; j++) {
          time.halt = 0
          if(this.propSuccess == 1) {
            this.propagateStep(j, stopConditionValue, propFidelity)
          }
        }
        break

      case "apoapsis":
        var i = 0
        var fixed = 0
        var secondPreviousR = 0
        var previousR = parseFloat(this.targetObject.distToEarth - 1)

        while((!(Math.sign(previousR - this.targetObject.distToEarth) == Math.sign(previousR - secondPreviousR)) || (previousR < this.targetObject.distToEarth)) && this.propSuccess == 1 && ((i < 2000) || i < 3)) {
          this.targetMoon.propagate()
          secondPreviousR = previousR
          previousR = parseFloat(this.targetObject.distToEarth)
          this.targetObject.propagateSOI(this.targetMoon)
          this.propSuccess = parseInt(this.targetObject.orbitUpdate(0, propFidelity, this.targetMoon))

          //FINDING E AND THINGS
          if(i == 1 && stopConditionValue != "CORRECTING_DO_NOT_SUBCALL") {
            this.targetObject.correctThetaFindRs()
          }

          this.targetObject.calculateElements(this.targetMoon)
          this.propTrail.push([this.targetObject.pos.x, this.targetObject.pos.y])
          i += 1
          if(secondPreviousR < previousR && fixed == 0) {
            secondPreviousR = previousR + 10
            fixed = 1
          }
        }
        //CHANGED
        this.targetObject.previousObjectState.copy(this.targetObject)
        break

        case "periapsis":
          var i = 0
          var fixed = 0
          var secondPreviousR = 0
          var previousR = parseFloat(this.targetObject.distToEarth - 1)

          while((!(Math.sign(previousR - this.targetObject.distToEarth) == Math.sign(previousR - secondPreviousR)) || (previousR > this.targetObject.distToEarth)) && this.propSuccess == 1 && ((i < 2000) || i < 10)) {
            this.targetMoon.propagate()
            secondPreviousR = previousR
            previousR = parseFloat(this.targetObject.distToEarth)
            this.targetObject.propagateSOI(this.targetMoon)
            this.propSuccess = parseInt(this.targetObject.orbitUpdate(0, propFidelity, this.targetMoon))

            //FINDING E AND THINGS
            if(i == 1 && stopConditionValue != "CORRECTING_DO_NOT_SUBCALL") {
              this.targetObject.correctThetaFindRs()
            }

            this.targetObject.calculateElements(this.targetMoon)
            this.propTrail.push([this.targetObject.pos.x, this.targetObject.pos.y])
            i += 1
          }
          break
          //CHANGED
          this.targetObject.previousObjectState.copy(this.targetObject)

        case "theta":
          var i = 0
          while(abs(this.targetObject.theta - stopConditionValue) > this.tolerance && this.propSuccess == 1 && i < 1000) {
            this.propagateStep(i, stopConditionValue, propFidelity)
            i += 1
          }
          break
    }

    push()
    beginShape()
    noFill()
    stroke(100, 100, 150)
    for(var i = 0; i < this.propTrail.length; i++) {
      vertex(this.propTrail[i][0], this.propTrail[i][1])
    }
    endShape()
    pop()
  }

  drawConvergence() {
    push()
    beginShape()
    noFill()
    stroke(0, 255, 0)
    for(var i = 0; i < this.propTrail.length; i++) {
      vertex(this.propTrail[i][0], this.propTrail[i][1])
    }
    endShape()
    pop()
    this.segmentTimer.timeSinceCreation += this.propTrail.length
    time.halt = 1
  }

  updateFunctions() {
    switch(this.targetParameter) {
      case "distToEarth":
        this.equalityParameter = parseFloat(this.targetObject.distToEarth)
        this.previousFcnValue = parseFloat(this.currentFcnValue)
        this.currentFcnValue = parseFloat(this.equalityParameter - this.equalityCondition)
        break

      case "period":
        this.equalityParameter = parseFloat(this.targetObject.period)
        this.previousFcnValue = parseFloat(this.currentFcnValue)
        this.currentFcnValue = parseFloat(this.equalityParameter - this.equalityCondition)
        break

      case "ecc":
        this.equalityParameter = parseFloat(this.targetObject.ecc)
        this.previousFcnValue = parseFloat(this.currentFcnValue)
        this.currentFcnValue = parseFloat(this.equalityParameter - this.equalityCondition)
        break

      case "h":
        this.equalityParameter = parseFloat(this.targetObject.h)
        this.previousFcnValue = parseFloat(this.currentFcnValue)
        this.currentFcnValue = parseFloat(this.equalityParameter - this.equalityCondition)
        break

      case "theta":
        this.equalityParameter = parseFloat(this.targetObject.theta)
        this.previousFcnValue = parseFloat(this.currentFcnValue)
        this.currentFcnValue = parseFloat(this.equalityParameter - this.equalityCondition)
        break

      case "specificE":
        this.equalityParameter = parseFloat(this.targetObject.specificE)
        this.previousFcnValue = parseFloat(this.currentFcnValue)
        this.currentFcnValue = parseFloat(this.equalityParameter - this.equalityCondition)
        break

      case "radapo":
        this.equalityParameter = parseFloat(this.targetObject.apoapsis)
        this.previousFcnValue = parseFloat(this.currentFcnValue)
        this.currentFcnValue = parseFloat(this.equalityParameter - this.equalityCondition)
        break

      case "radper":
        this.equalityParameter = parseFloat(this.targetObject.periapsis)
        this.previousFcnValue = parseFloat(this.currentFcnValue)
        this.currentFcnValue = parseFloat(this.equalityParameter - this.equalityCondition)
        break

      case "a":
        this.equalityParameter = parseFloat(this.targetObject.a)
        this.previousFcnValue = parseFloat(this.currentFcnValue)
        this.currentFcnValue = parseFloat(this.equalityParameter - this.equalityCondition)
        break

      case "velMoon":
        this.equalityParameter = parseFloat(this.targetObject.velMoon.mag())
        this.previousFcnValue = parseFloat(this.currentFcnValue)
        this.currentFcnValue = parseFloat(this.equalityParameter - this.equalityCondition)
        break

      case "posMoon":
        this.equalityParameter = parseFloat(this.targetObject.posMoon.mag())
        this.previousFcnValue = parseFloat(this.currentFcnValue)
        this.currentFcnValue = parseFloat(this.equalityParameter - this.equalityCondition)
        break

      default:
        break
    }
  }

  updateControlValue() {
    this.previousControlValue = parseFloat(this.currentControlValue)
  }

  vary() {
    var fprime
    var attempts = 0

    this.propagate(this.propFidelity, this.propStopCondition, this.propStopValue)
    this.updateFunctions()
    // console.log(this.currentFcnValue.toFixed(2), this.previousFcnValue.toFixed(2), this.previousControlValue.toFixed(2) , this.currentControlValue.toFixed(2))

    this.updateControlValue()

    this.currentControlValue += 0.04
    this.originalObject.copy(this.targetObject)
    this.propagate(this.propFidelity, this.propStopCondition, this.propStopValue)
    this.updateFunctions()
    // console.log(this.currentFcnValue.toFixed(2), this.previousFcnValue.toFixed(2), this.previousControlValue.toFixed(2) , this.currentControlValue.toFixed(2))

    while(abs(this.currentFcnValue) > this.tolerance && attempts < this.attemptLimit) {
      attempts += 1
      this.originalObject.copy(this.targetObject)
      fprime = (this.currentFcnValue - this.previousFcnValue) / (this.currentControlValue - this.previousControlValue)
      this.updateControlValue()
      this.currentControlValue += -this.currentFcnValue / fprime
      this.propagate(this.propFidelity, this.propStopCondition, this.propStopValue)
      // console.log(fprime, -this.equalityCondition / fprime, this.currentFcnValue.toFixed(2), this.previousFcnValue.toFixed(2), this.previousControlValue.toFixed(2) , this.currentControlValue.toFixed(2))
      this.updateFunctions()
    }
    if(abs(this.currentFcnValue) < this.tolerance) {
      console.log(abs(this.currentFcnValue),  this.tolerance, this.equalityParameter, this.equalityCondition)
      console.log("Targeter converged on a burn magnitude of " + this.currentControlValue.toFixed(5))
      this.targetObject.dvUsed += this.currentControlValue
      this.targetObject.calculateElements(this.targetMoon)
    }
    else {
      console.log(abs(this.currentFcnValue),  this.tolerance, this.equalityParameter, this.equalityCondition)
      this.originalObject.haltPropagation = 1
      alert("No convergence")
    }
  }
}
