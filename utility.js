function tic(name) {
  console.time(name)
}

function toc(name) {
  console.timeEnd(name)
}

function rref(A) {
    var rows = A.length;
    var columns = A[0].length;

    var lead = 0;
    for (var k = 0; k < rows; k++) {
        if (columns <= lead) return;

        var i = k;
        while (A[i][lead] === 0) {
            i++;
            if (rows === i) {
                i = k;
                lead++;
                if (columns === lead) return;
            }
        }
        var irow = A[i], krow = A[k];
        A[i] = krow, A[k] = irow;

        var val = A[k][lead];
        for (var j = 0; j < columns; j++) {
            A[k][j] /= val;
        }

        for (var i = 0; i < rows; i++) {
            if (i === k) continue;
            val = A[i][lead];
            for (var j = 0; j < columns; j++) {
                A[i][j] -= val * A[k][j];
            }
        }
        lead++;
    }
    return A;
}

function revArr(arr) {
  var newArray = [];
  for (var i = arr.length - 1; i >= 0; i--) {
    newArray.push(arr[i]);
  }
  return newArray;
}

function showVertexPath(points, userColor) {
  const geom = new THREE.BufferGeometry().setFromPoints(points);
  const lineMat = new THREE.LineBasicMaterial( { color: userColor } );
  const line = new THREE.Line(geom, lineMat);

  scene.add(line)
}

function calculateElements(state, body, requestedElement) { //CALCULATES KEPLERIAN ELEMENTS WITH RESPECT TO A BODY
  var mu = G * body.mass

  var rBody = new THREE.Vector3(state[0] - body.pos.x, state[1] - body.pos.y, state[2] - body.pos.z)
  var vBody = new THREE.Vector3(state[3] - body.vel.x, state[4] - body.vel.y, state[5] - body.vel.z)

  var rBodyHat = new THREE.Vector3()
  var vBodyHat = new THREE.Vector3()

  rBodyHat.copy(rBody)
  vBodyHat.copy(vBody)

  rBodyHat.divideScalar(rBody.length())
  vBodyHat.divideScalar(vBody.length())

  var rmag = rBody.length()
  var vmag = vBody.length()

  var vectorToBody = new THREE.Vector3(-rBody.x, -rBody.y, -rBody.z)

  var bodyPosVelAngle = vBody.angleTo(vectorToBody)

  var hVector = new THREE.Vector3()
  hVector.crossVectors(rBody, vBody)
  var h = hVector.length()

  var orbitNormal = new THREE.Vector3()
  orbitNormal.copy(hVector).divideScalar(h)

  var orbitBinormal = new THREE.Vector3()
  orbitBinormal.crossVectors(vBodyHat, orbitNormal)

  var a = 1 / (2 / rmag - vmag ** 2 / mu)
  var period = 2 * PI * ((a) ** 3 / mu) ** 0.5
  var p = h ** 2 / mu
  var e = -mu / (2 * a)
  var ecc = (1 + 2 * e * h ** 2 / mu ** 2) ** 0.5

  var eccVector = new THREE.Vector3()
  eccVector.copy(vBody).cross(hVector).divideScalar(mu).sub(rBodyHat)

  var apoapsis = a * (1 + ecc)
  var periapsis = a * (1 - ecc)

  var gamma = Math.acos(h / (rmag * vmag))

  if(rBody.dot(vBody) > 0) {
    theta = Math.acos((p / rmag - 1) / ecc)
  }
  else {
    theta = 2 * PI - Math.acos((p / rmag - 1) / ecc)
  }

  if(ecc > 1) {
    // hyperbolicElements(ecc, eccVector, orbitNormal, a)
  }

  switch(requestedElement) {
    case "theta":
      return theta
    case "bodyAngle":
      console.log("returning bodyangle")
      return bodyPosVelAngle
  }
}

// function hyperbolicElements(ecc, eccVector, orbitNormal, a) {
//   var betaAngle = acos(1 / ecc)
//
//   var s1 = p5.Vector.mult(eccVector, cos(betaAngle))
//   var s2 = p5.Vector.mult(p5.Vector.cross(orbitNormal, eccVector), sin(betaAngle))
//
//   var S = p5.Vector.add(s1, s2)
//
//   var t1 = p5.Vector.cross(S, orbitNormal)
//
//   var T = p5.Vector.div(t1, t1.length())
//   var R = p5.Vector.cross(S, T)
//
//   var b1 = abs(a) * (ecc ** 2 - 1) ** 0.5
//   var b2 = p5.Vector.cross(S, orbitNormal)
//
//   var B = p5.Vector.mult(b2, b1)
//
//   var BdotR = p5.Vector.dot(B, R)
//   var BdotT = p5.Vector.dot(B, T)
// }

function mouseWheel(event) {
  scrollActivity = 1
}

function clif(str, vari) {
  if(time.timeSinceCreation % 100 * time.delta == 0) {
    console.log(str, vari)
  }
}

function removeEntities(object) {
  var i = 0
  for(var i = scene.children.length - 1; i >= 0; i--) {
    if(scene.children[i].type == "Line") {
      scene.remove(scene.children[i])
    }
  }
}
