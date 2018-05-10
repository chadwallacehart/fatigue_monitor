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


//ToDo: load thsi from brfv4_javascript_examples/js/utils/BRFv4PointUtils.js
BRFv4PointUtils = {

    setPoint: function(v, i, p) {
        p.x = v[i * 2]; p.y = v[i * 2 + 1];
    },
    applyMovementVector: function(p, p0, pmv, f) {
        p.x = p0.x + pmv.x * f;
        p.y = p0.y + pmv.y * f;
    },
    interpolatePoint: function(p, p0, p1, f) {
        p.x = p0.x + f * (p1.x - p0.x);
        p.y = p0.y + f * (p1.y - p0.y);
    },
    getAveragePoint: function(p, ar) {
        p.x = 0.0; p.y = 0.0;
        for(var i = 0, l = ar.length; i < l; i++) {
            p.x += ar[i].x;
            p.y += ar[i].y;
        }
        p.x /= l; p.y /= l;
    },
    calcMovementVector: function(p, p0, p1, f) {
        p.x = f * (p1.x - p0.x);
        p.y = f * (p1.y - p0.y);
    },
    calcMovementVectorOrthogonalCW: function(p, p0, p1, f) {
        lib.BRFv4PointUtils.calcMovementVector(p, p0, p1, f);
        var x = p.x;
        var y = p.y;
        p.x = -y;
        p.y = x;
    },
    calcMovementVectorOrthogonalCCW: function(p, p0, p1, f) {
        lib.BRFv4PointUtils.calcMovementVector(p, p0, p1, f);
        var x = p.x;
        var y = p.y;
        p.x = y;
        p.y = -x;
    },
    calcIntersectionPoint: function(p, pk0, pk1, pg0, pg1) {

        //y1 = m1 * x1  + t1 ... y2 = m2 * x2 + t1
        //m1 * x  + t1 = m2 * x + t2
        //m1 * x - m2 * x = (t2 - t1)
        //x * (m1 - m2) = (t2 - t1)

        var dx1 = (pk1.x - pk0.x); if(dx1 == 0) dx1 = 0.01;
        var dy1 = (pk1.y - pk0.y); if(dy1 == 0) dy1 = 0.01;

        var dx2 = (pg1.x - pg0.x); if(dx2 == 0) dx2 = 0.01;
        var dy2 = (pg1.y - pg0.y); if(dy2 == 0) dy2 = 0.01;

        var m1 = dy1 / dx1;
        var t1 = pk1.y - m1 * pk1.x;

        var m2 = dy2 / dx2;
        var t2 = pg1.y - m2 * pg1.x;

        var m1m2 = (m1 - m2); if(m1m2 == 0) m1m2 = 0.01;
        var t2t1 = (t2 - t1); if(t2t1 == 0) t2t1 = 0.01;
        var px = t2t1 / m1m2;
        var py = m1 * px + t1;

        p.x = px;
        p.y = py;
    },
    calcDistance: function(p0, p1) {
        return Math.sqrt(
            (p1.x - p0.x) * (p1.x - p0.x) +
            (p1.y - p0.y) * (p1.y - p0.y));
    },
    calcAngle: function(p0, p1) {
        return Math.atan2((p1.y - p0.y), (p1.x - p0.x));
    },
    toDegree: function(x) {
        return x * 180.0 / Math.PI;
    },
    toRadian: function(x) {
        return x * Math.PI / 180.0;
    }
};