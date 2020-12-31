class Mission {
  constructor(targetObject) {
    this.target = targetObject
    this.missionSegment = 0
    this.missionArraylength = 4
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
        sat.propToApoapsis(earth, 1)
        break
      case 3:
        this.targetQuantity(earth, "apoapsis", 100000, "V")
        break
      case 4:
        this.targetQuantity(earth, "ecc", 0.02, "V")
        break
    }
  }

  targetQuantity(centralBody, paramToTarget, value, burnAxis) {
    console.log("Targeting " + paramToTarget + " = " + value.toString() + " with burn axis " + burnAxis)
    var targeter = new Targeter(sat.state, centralBody, paramToTarget, value, burnAxis)
    var burnVector = targeter.vary()
    if(burnVector) {
      sat.vel.add(burnVector)
      sat.state[3] = sat.vel.x
      sat.state[4] = sat.vel.y
      sat.state[5] = sat.vel.z
    }
    mission.ready = true
  }

}
