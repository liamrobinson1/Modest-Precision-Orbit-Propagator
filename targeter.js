class Targeter {
  constructor(state, centralBody, requestedVariable, equalityValue, burnAxis) {
    this.state = [state[0], state[1], state[2], state[3], state[4], state[5]]
    this.iState = [state[0], state[1], state[2], state[3], state[4], state[5]]
    this.centralBody = centralBody
    this.targetingWhat = requestedVariable
    this.equalityValue = equalityValue
    this.initialValue = calculateElements(this.state, centralBody, requestedVariable)
    this.burnAxis = burnAxis
    this.tolerance = 0.0001 //Hardcoded for now
    this.attemptLimit = 100
    this.sensetivity = 4
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
      this.currentControlValue -= this.currentFunctionValue / (fprime * this.sensetivity) //Where the magic happens
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
      return this.deltaVector
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
      case "INCCHANGE":
        var deltaI = this.equalityValue - this.initialValue
        var orbitNormal = calculateElements(this.state, earth, "orbitNormal")
        var orbitBinormal = calculateElements(this.state, earth, "orbitBinormal")
        orbitNormal.applyAxisAngle(orbitBinormal, deltaI / 2 * PI / 180)

        v.add(orbitNormal.multiplyScalar(dv))
        break
    }
    this.deltaVector = new THREE.Vector3(v.x - this.state[3], v.y - this.state[4], v.z - this.state[5])
    this.state[3] = v.x
    this.state[4] = v.y
    this.state[5] = v.z
  }
}
