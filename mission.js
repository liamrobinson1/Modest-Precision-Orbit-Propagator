class Mission {
  constructor(targetObject) {
    this.target = targetObject
    this.missionSegment = 0
    this.missionArraylength = 2
    this.missionComplete = false
    this.executionTime = 100
    this.ready = false
  }

  advanceMissionSegment() {
    if(this.missionSegment < this.missionArraylength - 1) {
      this.missionSegment += 1
    }
    else {
      this.missionComplete = true
      this.ready = false
    }
  }

  executeMissionSegment() {
    if(this.missionArraylength > 0) {
      console.log("executing segment", this.missionSegment)
      this.runSegment()
    }
    else {
      this.ready = false
      this.missionComplete = true
    }
  }

  runSegment() {
    switch(this.missionSegment) {
      case 0:
        sat.propToAscendingNode(earth, 10)
        break
      case 1:
        this.targetQuantity(earth, "i", 0, "INCCHANGE")
        break
      case 2:
        sat.propToTheta(earth, 10, sat.RAAN)
        break
      case 3:
        this.targetQuantity(earth, "ecc", 0.02, "V")
        break
    }
  }

  targetQuantity(centralBody, paramToTarget, value, burnAxis) {
    console.log("Targeting " + paramToTarget + " = " + value.toString() + " with burn axis " + burnAxis)
    var targeter = new Targeter(sat.state, centralBody, paramToTarget, value, burnAxis)
    var burnVector = targeter.vary()
    console.log(burnVector)
    if(burnVector) {
      console.log(sat.vel)
      sat.vel.add(burnVector)
      console.log(sat.vel)
    }
    mission.ready = true
  }

}
