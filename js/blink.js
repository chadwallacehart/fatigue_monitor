var _oldFaceShapeVertices = [];
var _blinked = false;
var _timeOut = -1;

function blinkTracker(face) {


    function blink() {
        _blinked = true;

        if (_timeOut > -1) {
            clearTimeout(_timeOut);
        }

        _timeOut = setTimeout(resetBlink, 150);
    }

    function resetBlink() {
        _blinked = false;
    }

    function storeFaceShapeVertices(vertices) {
        for (var i = 0, l = vertices.length; i < l; i++) {
            _oldFaceShapeVertices[i] = vertices[i];
        }
    }


    var v = face.vertices;

    if (_oldFaceShapeVertices.length === 0) storeFaceShapeVertices(v);

    var k, l, yLE, yRE;

    // Left eye movement (y)

    for (k = 36, l = 41, yLE = 0; k <= l; k++) {
        yLE += v[k * 2 + 1] - _oldFaceShapeVertices[k * 2 + 1];
    }
    yLE /= 6;

    // Right eye movement (y)

    for (k = 42, l = 47, yRE = 0; k <= l; k++) {
        yRE += v[k * 2 + 1] - _oldFaceShapeVertices[k * 2 + 1];
    }

    yRE /= 6;

    var yN = 0;

    // Compare to overall movement (nose y)

    yN += v[27 * 2 + 1] - _oldFaceShapeVertices[27 * 2 + 1];
    yN += v[28 * 2 + 1] - _oldFaceShapeVertices[28 * 2 + 1];
    yN += v[29 * 2 + 1] - _oldFaceShapeVertices[29 * 2 + 1];
    yN += v[30 * 2 + 1] - _oldFaceShapeVertices[30 * 2 + 1];
    yN /= 4;

    var blinkRatio = Math.abs((yLE + yRE) / yN);

    if ((blinkRatio > 12 && (yLE > 0.4 || yRE > 0.4))) {
        console.log("blink " + blinkRatio.toFixed(2) + " " + yLE.toFixed(2) + " " +
            yRE.toFixed(2) + " " + yN.toFixed(2));

        blink();
    }

    storeFaceShapeVertices(v);
}