const brfv4Dir = "brfv4_javascript_examples/";

//Load WASM or ASM
(function () {

    // detect WebAssembly support and load either WASM or ASM version of BRFv4
    var support = (typeof WebAssembly === 'object');

    if (support) {
        // from https://github.com/brion/min-wasm-fail/blob/master/min-wasm-fail.js
        function testSafariWebAssemblyBug() {
            var bin = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 6, 1, 96, 1, 127, 1, 127, 3, 2, 1, 0, 5, 3, 1, 0, 1, 7, 8, 1, 4, 116, 101, 115, 116, 0, 0, 10, 16, 1, 14, 0, 32, 0, 65, 1, 54, 2, 0, 32, 0, 40, 2, 0, 11]);
            var mod = new WebAssembly.Module(bin);
            var inst = new WebAssembly.Instance(mod, {});

            // test storing to and loading from a non-zero location via a parameter.
            // Safari on iOS 11.2.5 returns 0 unexpectedly at non-zero locations
            return (inst.exports.test(4) !== 0);
        }

        if (!testSafariWebAssemblyBug()) {
            support = false;
        }
    }

    if (!support) {
        brfv4BaseURL = brfv4Dir + "js/libs/brf_asmjs/";
    }

    console.log("Checking support of WebAssembly: " + support + " " + (support ? "loading WASM (not ASM)." : "loading ASM (not WASM)."));

    var script = document.createElement("script");

    script.setAttribute("type", "text/javascript");
    script.setAttribute("async", true);
    script.setAttribute("src", brfv4BaseURL + "BRFv4_JS_TK190218_v4.0.5_trial.js");

    document.getElementsByTagName("head")[0].appendChild(script);
})();

var brfv4 = null;


function initExample() {

    var webcam = document.getElementById("_webcam");		// our webcam video
    var imageData = document.getElementById("_imageData");	// image data for BRFv4
    var imageDataCtx = null;

    //var brfv4 = null;
    var brfManager = null;
    var resolution = null;
    var ua = window.navigator.userAgent;
    var isIOS11 = (ua.indexOf("iPad") > 0 || ua.indexOf("iPhone") > 0) && ua.indexOf("OS 11_") > 0;

    //ToDo: remove this
    var stats = brfv4Example.stats;
    if (stats.init) {
        stats.init(60);
    }

    let videoSelect = document.querySelector('select#videoSource');
    let selector = videoSelect;

    startCamera();

    /*
            let videoElement = document.querySelector('_webcam');
            let videoSelect = document.querySelector('select#videoSource');
            let selector = videoSelect;

    */
    function gotDevices(deviceInfos) {
        for (let i = 0; i !== deviceInfos.length; ++i) {
            let deviceInfo = deviceInfos[i];
            let option = document.createElement('option');
            option.value = deviceInfo.deviceId;
            if (deviceInfo.kind === 'videoinput') {
                option.text = deviceInfo.label || 'camera ' + (videoSelect.length + 1);
                videoSelect.appendChild(option);
            }
        }
    }

    /*
            function gotStream(stream) {
                window.stream = stream; // make stream available to console
                videoElement.srcObject = stream;
                // Refresh button list in case labels have become available
                return navigator.mediaDevices.enumerateDevices();


            }

            function startCamera() {
                if (window.stream) {
                    window.stream.getTracks().forEach(function(track) {
                        track.stop();
                    });
                }
                let videoSource = videoSelect.value;
                let constraints = {
                    audio: false,
                    video: {deviceId: videoSource ? {exact: videoSource} : undefined}
                };
                navigator.mediaDevices.getUserMedia(constraints).
                then(gotStream).then(gotDevices).catch(function(error){
                    console.log('navigator.getUserMedia error: ', error)
                });
            }
    */

    function startCamera() {

        console.log("startCamera");

        // Start video playback once the camera was fetched.
        function onStreamFetched(mediaStream) {

            console.log("onStreamFetched");

            webcam.srcObject = mediaStream;
            webcam.play();

            // Check whether we know the video dimensions yet, if so, start BRFv4.
            function onStreamDimensionsAvailable() {

                console.log("onStreamDimensionsAvailable");

                if (webcam.videoWidth === 0) {
                    setTimeout(onStreamDimensionsAvailable, 100);
                } else {

                    // Resize the canvas to match the webcam video size.
                    imageData.width = webcam.videoWidth;
                    imageData.height = webcam.videoHeight;
                    imageDataCtx = imageData.getContext("2d");

                    onResize();
                    window.addEventListener("resize", onResize);

                    // on iOS we want to close the video stream first and
                    // wait for the heavy BRFv4 initialization to finish.
                    // Once that is done, we start the stream again.
                    // Otherwise the stream will just stop and won't update anymore.

                    if (isIOS11) {
                        webcam.pause();
                        webcam.srcObject.getTracks().forEach(function (track) {
                            track.stop();
                        });
                    }

                    waitForSDK();
                }
            }

            if (imageDataCtx === null) {
                onStreamDimensionsAvailable();
            } else {
                trackFaces();
            }


            return navigator.mediaDevices.enumerateDevices();

        }

        let videoSource = videoSelect.value;
        let constraints = {
            audio: null,
            video: {deviceId: videoSource ? {exact: videoSource} : undefined}
        };
        //{video: {width: 640, height: 480, frameRate: 30}}

        window.navigator.mediaDevices.getUserMedia(constraints)
            .then(onStreamFetched).then(gotDevices).catch(function () {
            alert("No camera available.");
        });
    }

    function waitForSDK() {

        if (brfv4 === null) {
            brfv4 = {
                locateFile: function (fileName) {
                    return brfv4BaseURL + fileName;
                }
            };
            initializeBRF(brfv4);
        }

        if (brfv4.sdkReady) {
            console.log("brfv4 SDK loaded");
            initSDK();
        } else {
            setTimeout(waitForSDK, 100);
        }
    }

    function initSDK() {

        resolution = new brfv4.Rectangle(0, 0, imageData.width, imageData.height);
        brfManager = new brfv4.BRFManager();
        brfManager.init(resolution, resolution, "blinkandyawntesting");//"com.tastenkunst.brfv4.js.examples.minimal.webcam");

        if (isIOS11) {
            // Start the camera stream again on iOS.
            setTimeout(function () {
                console.log('delayed camera restart for iOS 11');
                startCamera()
            }, 2000)
        } else {
            trackFaces();
        }
    }

    function trackFaces() {

        if (stats.start) stats.start();

        imageDataCtx.setTransform(-1.0, 0, 0, 1, resolution.width, 0); // mirrored for draw of video
        imageDataCtx.drawImage(webcam, 0, 0, resolution.width, resolution.height);
        imageDataCtx.setTransform(1.0, 0, 0, 1, 0, 0); // unmirrored for draw of results

        brfManager.update(imageDataCtx.getImageData(0, 0, resolution.width, resolution.height).data);

        var faces = brfManager.getFaces();

        //Assume one face for now
        //for (var i = 0; i < faces.length; i++) {

        //var face = faces[i];

        var face = faces[0];

        if (face.state === brfv4.BRFState.FACE_TRACKING_START ||
            face.state === brfv4.BRFState.FACE_TRACKING) {

            imageDataCtx.strokeStyle = "#00a0ff";

            for (var k = 0; k < face.vertices.length; k += 2) {
                imageDataCtx.beginPath();
                imageDataCtx.arc(face.vertices[k], face.vertices[k + 1], 2, 0, 2 * Math.PI);
                imageDataCtx.stroke();
            }

            blinkTracker(face);
            yawnDetector(face);

        }
        //}

        if (stats.end) stats.end();

        requestAnimationFrame(trackFaces);
    }


    function onResize() {

        var imageData = document.getElementById("_imageData");	// image data for BRFv4

        var ww = window.innerWidth;
        var wh = window.innerHeight;

        var s = wh / imageData.height;

        if (imageData.width * s < ww) {
            s = ww / imageData.width;
        }

        var iw = imageData.width * s;
        var ih = imageData.height * s;
        var ix = (ww - iw) * 0.5;
        var iy = (wh - ih) * 0.5;


        //ToDo: fix this
        //imageData.style.transformOrigin = "0% 0%";
        //imageData.style.transform = "matrix(" + s + ", 0, 0, " + s + ", " + ix + ", " + iy + ")";
    }

}

