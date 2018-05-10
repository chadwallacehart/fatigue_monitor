function yawnDetector(face) {


    var p0 = new brfv4.Point();
    var p1 = new brfv4.Point();


    var setPoint = BRFv4PointUtils.setPoint;
    var calcDistance = BRFv4PointUtils.calcDistance;

    // Yawn Detection - Or: How wide open is the mouth?

    setPoint(face.vertices, 39, p1); // left eye inner corner
    setPoint(face.vertices, 42, p0); // right eye outer corner

    var eyeDist = calcDistance(p0, p1);

    setPoint(face.vertices, 62, p0); // mouth upper inner lip
    setPoint(face.vertices, 66, p1); // mouth lower inner lip

    var mouthOpen = calcDistance(p0, p1);
    var yawnFactor = mouthOpen / eyeDist;

    yawnFactor -= 0.35; // remove smiling

    if (yawnFactor < 0) yawnFactor = 0;

    yawnFactor *= 2.0; // scale up a bit

    if (yawnFactor > 1.0) yawnFactor = 1.0;

    if (yawnFactor < 0.0) {
        yawnFactor = 0.0;
    }
    if (yawnFactor > 1.0) {
        yawnFactor = 1.0;
    }

    if (yawnFactor > 0)
        console.log("Yawn event: " + (yawnFactor * 100).toFixed(0) + "%");
}