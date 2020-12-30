class Mission {
  constructor(targetObject) {
    this.target = targetObject
    this.missionSegment = 0
    this.missionArraylength = 0
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
        sat.propToNode(earth)
        break
      case 1:
        this.targetQuantity(earth, "ecc", 0.6, "V")
        break
      case 2:
        sat.propToApoapsis(earth, 5)
        break
      case 3:
        this.targetQuantity(earth, "ecc", 0.02, "V")
        break
    }
  }

  targetQuantity(centralBody, paramToTarget, value, burnAxis) {
    console.log("Targeting " + paramToTarget + " = " + value.toString() + " with burn axis " + burnAxis)
    var targeter = new Targeter(sat.state, centralBody, paramToTarget, value, burnAxis)
    var burnMag = targeter.vary()
    if(!isNaN(burnMag)) {
      sat.executeManeuver(burnAxis, burnMag)
    }
    mission.ready = true
  }

}
