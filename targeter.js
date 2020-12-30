// class Targeter {
//   constructor(targetObject, targetParameter, targetValue, propFidelity, propStopCondition, propStopValue, controlVariable, userGuess, attemptLimit, tolerance, propStepLimit, sensetivity) {
//     let tempSat = new GravSat(targetObject.distToEarth, 0, satMass)
//     let tempMoon = new Moon(parseFloat(moon.mass), parseFloat(moon.r), earth, parseFloat(moon.theta), moon.drawRadius)
//     targetObject.copy(tempSat)
//     this.originalObject = targetObject
//     this.targetObject = tempSat
//     this.originalMoon = moon
//     this.targetMoon = tempMoon
//     this.targetParameter = targetParameter
//     this.controlVariable = controlVariable
//     this.propStopCondition = propStopCondition
//     this.propStopValue = propStopValue
//     this.propFidelity = propFidelity
//     this.tolerance = tolerance
//     this.currentControlValue = 0
//     this.previousControlValue = 0
//     this.equalityParameter = 0
//     this.currentFcnValue = 0
//     this.previousFcnValue = 0
//     this.sensetivity = sensetivity
//
//     //SETS UP THE TARGET SEQUENCE PARAMETERS
//     this.equalityCondition = targetValue
//     this.currentControlValue = userGuess
//     this.initialControlValue = userGuess
//     this.attemptLimit = attemptLimit
//     this.propStepLimit = propStepLimit
//   }
//
//   propagateStep(i, stopConditionValue, propFidelity, propDirection, initialSOI) {
//     this.targetMoon.propagate(propDirection, this.targetObject)
//     this.targetObject.propagateSOI(this.targetMoon, 1, initialSOI)
//     this.propSuccess = parseInt(this.targetObject.orbitUpdate(0, propFidelity, this.targetMoon, propDirection))
//
//     //FINDING E AND THINGS
//     if(i == 1 && isCorrecting != "CORRECTING_DO_NOT_SUBCALL") {
//       this.targetObject.correctThetaFindRs(2000)
//     }
//
//     this.targetObject.calculateElements(earth)
//     this.propTrail.push([this.targetObject.pos.x, this.targetObject.pos.y])
//   }
//
//   propagate(propFidelity, stopCondition, stopConditionValue, propDirection, initialSOI, isCorrecting) {
//     tic("propagation time")
//     // console.log(this.propStepLimit + " PROP STEP LIMIT USED, LOOKING FOR " + stopCondition + " with value " + stopConditionValue, propDirection, initialSOI, isCorrecting)
//     this.targetMoon = new Moon(parseFloat(moon.mass), parseFloat(moon.r), earth, parseFloat(moon.theta), moon.drawRadius)
//     this.propTrail = []
//     this.propSuccess = 1
//     time.currentFrame += 1
//
//     this.targetObject.executeManeuver(this.currentControlValue)
//
//     switch(stopCondition) {
//       case "framesElapsed":
//         for(var j = 0; j < stopConditionValue; j++) {
//           if(this.propSuccess == 1) {
//             this.propagateStep(j, stopConditionValue, propFidelity, propDirection, "any")
//           }
//         }
//         //FINDING E AND THINGS
//         if(i == 1 && isCorrecting != "CORRECTING_DO_NOT_SUBCALL") {
//           this.targetObject.correctThetaFindRs(5000)
//         }
//         break
//
//       case "showFrames":
//         for(var j = 0; j < stopConditionValue; j++) {
//           time.halt = 0
//           if(this.propSuccess == 1) {
//             this.propagateStep(j, stopConditionValue, propFidelity, propDirection, "moon")
//           }
//         }
//         break
//
//       case "moonAngle":
//         var i = 0
//         while(abs(this.targetObject.moonAngle - stopConditionValue) > this.tolerance && this.propSuccess == 1 && i < this.propStepLimit) {
//           time.halt = 0
//           this.propagateStep(j, stopConditionValue, propFidelity, propDirection, "moon")
//           i += 1
//         }
//         //FINDING E AND THINGS
//         if(i == 1 && isCorrecting != "CORRECTING_DO_NOT_SUBCALL") {
//           this.targetObject.correctThetaFindRs(5000)
//         }
//         break
//
//       case "earthPosVelAngle":
//         var i = 0
//         while(abs(this.targetObject.earthPosVelAngle - stopConditionValue) > this.tolerance && this.propSuccess == 1 && i < this.propStepLimit) {
//           time.halt = 0
//           this.propagateStep(j, stopConditionValue, propFidelity, propDirection, "moon")
//           i += 1
//         }
//         //FINDING E AND THINGS
//         if(i == 1 && isCorrecting != "CORRECTING_DO_NOT_SUBCALL") {
//           this.targetObject.correctThetaFindRs(5000)
//         }
//         break
//
//       case "apoapsis":
//         var i = 0
//         var fixed = 0
//         var secondPreviousR = 0
//         var previousR = parseFloat(this.targetObject.distToEarth - 1)
//
//         while((!(Math.sign(previousR - this.targetObject.distToEarth) == Math.sign(previousR - secondPreviousR)) || (previousR < this.targetObject.distToEarth)) && this.propSuccess == 1 && ((i < this.propStepLimit) || i < 6)) {
//           this.targetMoon.propagate(propDirection, this.targetObject)
//           secondPreviousR = previousR
//           previousR = parseFloat(this.targetObject.distToEarth)
//           this.targetObject.propagateSOI(this.targetMoon, 1, initialSOI)
//           this.propSuccess = parseInt(this.targetObject.orbitUpdate(0, propFidelity, this.targetMoon, propDirection))
//
//           //FINDING E AND THINGS
//           if(i == 1 && isCorrecting != "CORRECTING_DO_NOT_SUBCALL") {
//             this.targetObject.correctThetaFindRs(5000)
//           }
//
//           this.targetObject.calculateElements(earth)
//           this.propTrail.push([this.targetObject.pos.x, this.targetObject.pos.y])
//           i += 1
//           if(secondPreviousR < previousR && fixed == 0) {
//             secondPreviousR = previousR + 10
//             fixed = 1
//           }
//         }
//         //CHANGED
//         if(i == this.propStepLimit) {
//           this.propSuccess = 0
//           console.log("failure due to step limit", i, stopCondition)
//         }
//         this.targetObject.previousObjectState.copy(this.targetObject)
//         break
//
//       case "periapsis":
//         var i = 0
//         var fixed = 0
//         var secondPreviousR = 0
//         var previousR = parseFloat(this.targetObject.distToEarth - 1)
//
//         while((!(Math.sign(previousR - this.targetObject.distToEarth) == Math.sign(previousR - secondPreviousR)) || (previousR > this.targetObject.distToEarth)) && this.propSuccess == 1 && ((i < this.propStepLimit) || i < 10)) {
//           this.targetMoon.propagate(propDirection, this.targetObject)
//           secondPreviousR = previousR
//           previousR = parseFloat(this.targetObject.distToEarth)
//           this.targetObject.propagateSOI(this.targetMoon, 1, initialSOI)
//           this.propSuccess = parseInt(this.targetObject.orbitUpdate(0, propFidelity, this.targetMoon, propDirection))
//
//           //FINDING E AND THINGS
//           if(i == 1 && isCorrecting != "CORRECTING_DO_NOT_SUBCALL") {
//             this.targetObject.correctThetaFindRs(5000)
//           }
//
//           this.targetObject.calculateElements(earth)
//           this.propTrail.push([this.targetObject.pos.x, this.targetObject.pos.y])
//           i += 1
//         }
//         break
//         //CHANGED
//         // this.targetObject.previousObjectState.copy(this.targetObject) //MAYBE THIS IS MEANT TO BE HERE?
//
//       case "moonperiapsis":
//         var i = 0
//         var fixed = 0
//         var secondPreviousR = 0
//         var previousR = parseFloat(this.targetObject.distToMoon - 1)
//
//         while((!(Math.sign(previousR - this.targetObject.distToMoon) == Math.sign(previousR - secondPreviousR)) || (previousR > this.targetObject.distToMoon)) && this.propSuccess == 1 && ((i < this.propStepLimit) || i < 10)) {
//           this.targetMoon.propagate(propDirection, this.targetObject)
//           secondPreviousR = previousR
//           previousR = parseFloat(this.targetObject.distToMoon)
//           this.targetObject.propagateSOI(this.targetMoon, 1, "moon")
//           this.propSuccess = parseInt(this.targetObject.orbitUpdate(0, propFidelity, this.targetMoon, propDirection))
//
//           //FINDING E AND THINGS
//           if(i == 1 && isCorrecting != "CORRECTING_DO_NOT_SUBCALL") {
//             this.targetObject.correctThetaFindRs(5000)
//           }
//
//           this.targetObject.calculateElements(earth)
//           this.propTrail.push([this.targetObject.pos.x, this.targetObject.pos.y])
//           i += 1
//         }
//         break
//
//       case "theta":
//         var i = 0
//         while(abs(this.targetObject.theta - stopConditionValue) > this.tolerance && this.propSuccess == 1 && i < this.propStepLimit) {
//           this.propagateStep(i, stopConditionValue, propFidelity, propDirection, initialSOI)
//           i += 1
//         }
//         //FINDING E AND THINGS
//         if(i == 1 && isCorrecting != "CORRECTING_DO_NOT_SUBCALL") {
//           this.targetObject.correctThetaFindRs(5000)
//         }
//         break
//     }
//     if(isCorrecting == "CORRECTING_DO_NOT_SUBCALL") {
//       this.originalObject.mostRecentPath = this.propTrail
//     }
//
//     if(isCorrecting == "varying") {
//       push()
//       beginShape()
//       noFill()
//       stroke(200, 0, 100)
//       for(var i = 0; i < this.propTrail.length; i++) {
//         vertex(this.propTrail[i][0], this.propTrail[i][1])
//       }
//       endShape()
//       pop()
//     }
//     toc("propagation time")
//   }
//
//   drawConvergence() {
//     push()
//     beginShape()
//     noFill()
//     stroke(50, 255, 50)
//     strokeWeight(2)
//     for(var i = 0; i < this.propTrail.length; i++) {
//       vertex(this.propTrail[i][0], this.propTrail[i][1])
//     }
//     endShape()
//     pop()
//     this.segmentTimer.timeSinceCreation += this.propTrail.length
//     time.halt = 1
//   }
//
//   updateFunctions() {
//     switch(this.targetParameter) {
//       case "distToEarth":
//         this.equalityParameter = parseFloat(this.targetObject.distToEarth)
//         this.previousFcnValue = parseFloat(this.currentFcnValue)
//         this.currentFcnValue = parseFloat(this.equalityParameter - this.equalityCondition)
//         break
//
//       case "period":
//         this.equalityParameter = parseFloat(this.targetObject.period)
//         this.previousFcnValue = parseFloat(this.currentFcnValue)
//         this.currentFcnValue = parseFloat(this.equalityParameter - this.equalityCondition)
//         break
//
//       case "ecc":
//         // console.log("WE'RE in: ", this.targetObject.currentSOI)
//         this.equalityParameter = parseFloat(this.targetObject.ecc)
//         if(this.targetObject.currentSOI == "moon") {
//             this.equalityParameter = parseFloat(this.targetObject.instaEccEarth)
//         }
//         this.previousFcnValue = parseFloat(this.currentFcnValue)
//         this.currentFcnValue = parseFloat(this.equalityParameter - this.equalityCondition)
//         break
//
//       case "h":
//         this.equalityParameter = parseFloat(this.targetObject.h)
//         this.previousFcnValue = parseFloat(this.currentFcnValue)
//         this.currentFcnValue = parseFloat(this.equalityParameter - this.equalityCondition)
//         break
//
//       case "theta":
//         this.equalityParameter = parseFloat(this.targetObject.theta)
//         this.previousFcnValue = parseFloat(this.currentFcnValue)
//         this.currentFcnValue = parseFloat(this.equalityParameter - this.equalityCondition)
//         break
//
//       case "specificE":
//         this.equalityParameter = parseFloat(this.targetObject.specificE)
//         this.previousFcnValue = parseFloat(this.currentFcnValue)
//         this.currentFcnValue = parseFloat(this.equalityParameter - this.equalityCondition)
//         break
//
//       case "radapo":
//         this.equalityParameter = parseFloat(this.targetObject.apoapsis)
//         this.previousFcnValue = parseFloat(this.currentFcnValue)
//         this.currentFcnValue = parseFloat(this.equalityParameter - this.equalityCondition)
//         break
//
//       case "radper":
//         this.equalityParameter = parseFloat(this.targetObject.periapsis)
//         this.previousFcnValue = parseFloat(this.currentFcnValue)
//         this.currentFcnValue = parseFloat(this.equalityParameter - this.equalityCondition)
//         break
//
//       case "a":
//         this.equalityParameter = parseFloat(this.targetObject.a)
//         this.previousFcnValue = parseFloat(this.currentFcnValue)
//         this.currentFcnValue = parseFloat(this.equalityParameter - this.equalityCondition)
//         break
//
//       case "velMoon":
//         this.equalityParameter = parseFloat(this.targetObject.velMoon.mag())
//         this.previousFcnValue = parseFloat(this.currentFcnValue)
//         this.currentFcnValue = parseFloat(this.equalityParameter - this.equalityCondition)
//         break
//
//       case "posMoon":
//         this.equalityParameter = parseFloat(this.targetObject.posMoon.mag())
//         this.previousFcnValue = parseFloat(this.currentFcnValue)
//         this.currentFcnValue = parseFloat(this.equalityParameter - this.equalityCondition)
//         break
//
//       case "BdotT":
//         this.equalityParameter = parseFloat(this.targetObject.BdotT)
//         this.previousFcnValue = parseFloat(this.currentFcnValue)
//         this.currentFcnValue = parseFloat(this.equalityParameter - this.equalityCondition)
//         break
//
//       case "moonAngle":
//         this.equalityParameter = parseFloat(this.targetObject.moonAngle)
//         this.previousFcnValue = parseFloat(this.currentFcnValue)
//         this.currentFcnValue = parseFloat(this.equalityParameter - this.equalityCondition)
//         break
//
//       case "earthPosVelAngle":
//         this.equalityParameter = parseFloat(this.earthPosVelAngle)
//         this.previousFcnValue = parseFloat(this.currentFcnValue)
//         this.currentFcnValue = parseFloat(this.equalityParameter - this.equalityCondition)
//         break
//
//       case "moonPeriapsis":
//         this.equalityParameter = parseFloat(this.targetObject.moonPeriapsis)
//         this.previousFcnValue = parseFloat(this.currentFcnValue)
//         this.currentFcnValue = parseFloat(this.equalityParameter - this.equalityCondition)
//         break
//
//       case "moonApoapsis":
//         this.equalityParameter = parseFloat(this.targetObject.moonApoapsis)
//         this.previousFcnValue = parseFloat(this.currentFcnValue)
//         this.currentFcnValue = parseFloat(this.equalityParameter - this.equalityCondition)
//         break
//
//       case "moonEccentricity":
//         this.equalityParameter = parseFloat(this.targetObject.eccMoon)
//         this.previousFcnValue = parseFloat(this.currentFcnValue)
//         this.currentFcnValue = parseFloat(this.equalityParameter - this.equalityCondition)
//         break
//
//       default:
//         break
//     }
//   }
//
//   updateControlValue() {
//     this.previousControlValue = parseFloat(this.currentControlValue)
//   }
//
//   vary(propDirection, initialSOI, isCorrecting, sensetivity) {
//     var fprime
//     var attempts = 0
//     this.sensetivity = sensetivity
//
//     this.propagate(this.propFidelity, this.propStopCondition, this.propStopValue, propDirection, initialSOI, isCorrecting)
//     this.updateFunctions()
//     // console.log(this.currentFcnValue.toFixed(2), this.previousFcnValue.toFixed(2), this.previousControlValue.toFixed(2) , this.currentControlValue.toFixed(2))
//
//     this.updateControlValue()
//
//     this.currentControlValue += 0.04
//     this.originalObject.copy(this.targetObject)
//     this.propagate(this.propFidelity, this.propStopCondition, this.propStopValue, propDirection, initialSOI, isCorrecting)
//     this.updateFunctions()
//     console.log(this.currentFcnValue.toFixed(2), this.previousFcnValue.toFixed(2), this.previousControlValue.toFixed(2) , this.currentControlValue.toFixed(2))
//
//     if(this.currentFcnValue > this.previousFcnValue && (this.targetParameter == "distToEarth" || this.propStopCondition == "apoapsis" || this.propStopCondition == "periapsis")) {
//       console.log("Trying different direction for correlation...")
//       this.currentControlValue -= 0.08
//       this.originalObject.copy(this.targetObject)
//       this.propagate(this.propFidelity, this.propStopCondition, this.propStopValue, propDirection, initialSOI, isCorrecting)
//       this.updateFunctions()
//       this.previousControlValue = 0.04
//       console.log(this.currentFcnValue.toFixed(2), this.previousFcnValue.toFixed(2), this.previousControlValue.toFixed(2) , this.currentControlValue.toFixed(2))
//     }
//
//     while(abs(this.currentFcnValue) > this.tolerance && attempts < this.attemptLimit) {
//       attempts += 1
//       this.originalObject.copy(this.targetObject)
//       fprime = (this.currentFcnValue - this.previousFcnValue) / (this.currentControlValue - this.previousControlValue)
//       this.updateControlValue()
//       this.currentControlValue += -this.currentFcnValue / fprime / this.sensetivity
//
//       if(isNaN(this.currentControlValue) || !isFinite(this.currentControlValue)) {
//         // console.log("pre-reset. controls: ", this.currentControlValue, this.previousControlValue, "fcns: ", this.currentFcnValue, this.previousFcnValue)
//         this.currentControlValue = Math.sign(Math.random()) * Math.random() / 10
//         this.currentFcnValue = Math.sign(Math.random()) * Math.random() / 10
//         this.previousFcnValue = Math.sign(Math.random()) * Math.random() / 10
//         this.previousControlValue = Math.sign(Math.random()) * Math.random() / 10
//         // console.log("We need a reset. controls: ", this.currentControlValue, this.previousControlValue, "fcns: ", this.currentFcnValue, this.previousFcnValue)
//       }
//
//       // console.log("success?", this.propSuccess, "fcnVal", this.currentFcnValue, "controlVal", this.currentControlValue)
//
//       // console.log("eccm: " + this.targetObject.eccMoon.toString())
//       this.propagate(this.propFidelity, this.propStopCondition, this.propStopValue, propDirection, initialSOI, isCorrecting)
//       // console.log("eccm: " + this.targetObject.eccMoon.toString())
//       // console.log(fprime, -this.equalityCondition / fprime, this.currentFcnValue.toFixed(2), this.previousFcnValue.toFixed(2), this.previousControlValue.toFixed(2) , this.currentControlValue.toFixed(2))
//       this.updateFunctions()
//       // console.log("updatedfcnVal", this.currentFcnValue, "controlVal", this.equalityParameter)
//     }
//     if(abs(this.currentFcnValue) < this.tolerance && this.propSuccess == 1) {
//       console.log("Targeter converged on a burn magnitude of " + this.currentControlValue.toFixed(5))
//       this.targetObject.dvUsed += this.currentControlValue
//       this.targetObject.calculateElements(earth)
//     }
//     else {
//       console.log(abs(this.currentFcnValue),  this.tolerance, this.equalityParameter, this.equalityCondition)
//       this.originalObject.haltPropagation = 1
//       alert("No convergence")
//     }
//   }
// }


class Targeter {
  constructor(state, centralBody, requestedVariable, equalityValue, burnAxis) {
    this.state = [state[0], state[1], state[2], state[3], state[4], state[5]]
    this.iState = [state[0], state[1], state[2], state[3], state[4], state[5]]
    this.centralBody = centralBody
    this.targetingWhat = requestedVariable
    this.equalityValue = equalityValue
    this.burnAxis = burnAxis
    this.tolerance = 0.0001 //Hardcoded for now
    this.attemptLimit = 100
  }

  vary() {
    var attempts = 0
    var fprime = 0
    //We have to collect two data points in order to apply Newton-Raphson
    this.previousFunctionValue = calculateElements(this.state, this.centralBody, this.targetingWhat) - this.equalityValue
    this.previousControlValue = 0

    console.log(this.previousFunctionValue.toFixed(3), this.previousControlValue.toFixed(3))

    this.currentControlValue = 0.04
    this.burn(this.currentControlValue)
    this.currentFunctionValue = calculateElements(this.state, this.centralBody, this.targetingWhat) - this.equalityValue

    if(abs(this.currentFunctionValue) > abs(this.previousFunctionValue)) {
      this.state = [this.iState[0], this.iState[1], this.iState[2], this.iState[3], this.iState[4], this.iState[5]]
      this.currentControlValue = -0.04
      this.burn(this.currentControlValue)
      this.currentFunctionValue = calculateElements(this.state, this.centralBody, this.targetingWhat) - this.equalityValue
    }

    console.log(this.currentFunctionValue.toFixed(3), this.currentControlValue.toFixed(3))

    while(abs(this.currentFunctionValue) > this.tolerance && attempts < this.attemptLimit) {
      attempts += 1
      this.state = [this.iState[0], this.iState[1], this.iState[2], this.iState[3], this.iState[4], this.iState[5]]

      fprime = (this.currentFunctionValue - this.previousFunctionValue) / (this.currentControlValue - this.previousControlValue)

      this.previousControlValue = this.currentControlValue
      this.currentControlValue -= this.currentFunctionValue / fprime //Where the magic happens
      this.burn(this.currentControlValue)

      this.previousFunctionValue = this.currentFunctionValue
      this.currentFunctionValue = calculateElements(this.state, this.centralBody, this.targetingWhat) - this.equalityValue

      console.log(this.currentFunctionValue.toFixed(3), this.currentControlValue.toFixed(3))

      if(abs(this.currentControlValue - this.previousControlValue) > 100000) {
        alert("No Correlation between equality and control variables")
        break
      }
      if(attempts == this.attemptLimit) {
        time.halt = 1
        alert("No convergence")
        break
      }
    }

    if(abs(this.currentFunctionValue) < this.tolerance) {
      console.log("Targeter converged on a burn magnitude of " + this.currentControlValue.toFixed(5))
      time.halt = 1
      return this.currentControlValue
    }
    return false
  }

  burn(dv) {
    var v = new THREE.Vector3(this.state[3], this.state[4], this.state[5])
    switch(this.burnAxis) {
      case "V":
        v.setLength(v.length() + dv)
        break
      case "N":
        var orbitNormal = calculateElements(this.state, earth, "orbitNormal")
        v.add(orbitNormal.multiplyScalar(dv))
        break
      case "B":
        var orbitBinormal = calculateElements(this.state, earth, "orbitBinormal")
        v.add(orbitBinormal.multiplyScalar(dv))
        break
    }
    this.state[3] = v.x
    this.state[4] = v.y
    this.state[5] = v.z
  }
}
