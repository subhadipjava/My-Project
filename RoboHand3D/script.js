
import * as THREE from "three";

import {
    HandLandmarker,
    FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/vision_bundle.mjs";

// ======================================================
// ROBOHAND 3D - ROBOTIC HAND + VIRTUAL OBJECT GRABBING
// ======================================================

// HTML ELEMENTS
const container = document.getElementById("robot-container");
const video = document.getElementById("webcam");
const startButton = document.getElementById("start-camera");
const cameraOverlay = document.getElementById("camera-overlay");
const loadingMessage = document.getElementById("loading-message");
const gestureName = document.getElementById("gesture-name");
const gestureDescription = document.getElementById("gesture-description");
const trackingStatus = document.getElementById("tracking-status");
const confidenceText = document.getElementById("confidence");
const confidenceBar = document.getElementById("confidence-bar");
const detectedGesture = document.getElementById("detected-gesture");

// ======================================================
// 1. THREE.JS SCENE
// ======================================================

const scene = new THREE.Scene();
scene.background = new THREE.Color("#08111d");

const camera = new THREE.PerspectiveCamera(
    35,
    container.clientWidth / container.clientHeight,
    0.1,
    100
);

camera.position.set(0, 0, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    container.clientWidth,
    container.clientHeight
);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;

container.appendChild(renderer.domElement);

// ======================================================
// 2. LIGHTING
// ======================================================

scene.add(new THREE.AmbientLight("#ffffff", 1.8));

const mainLight = new THREE.DirectionalLight("#ffffff", 3.5);
mainLight.position.set(3, 6, 8);
mainLight.castShadow = true;
scene.add(mainLight);

const blueLight = new THREE.PointLight("#48caff", 30, 20);
blueLight.position.set(-4, 2, 4);
scene.add(blueLight);

const rimLight = new THREE.PointLight("#9bbcff", 20, 15);
rimLight.position.set(4, -3, -2);
scene.add(rimLight);

// ======================================================
// 3. MATERIALS
// ======================================================

const titanium = new THREE.MeshStandardMaterial({
    color: "#aebdca",
    metalness: 0.88,
    roughness: 0.23
});

const titaniumDark = new THREE.MeshStandardMaterial({
    color: "#536477",
    metalness: 0.82,
    roughness: 0.28
});

const blackMetal = new THREE.MeshStandardMaterial({
    color: "#182535",
    metalness: 0.90,
    roughness: 0.25
});

const jointMaterial = new THREE.MeshStandardMaterial({
    color: "#d4e4f4",
    metalness: 0.90,
    roughness: 0.18
});

const cyanMaterial = new THREE.MeshStandardMaterial({
    color: "#00d9ff",
    metalness: 0.65,
    roughness: 0.20,
    emissive: "#007d99",
    emissiveIntensity: 0.8
});

// ======================================================
// 4. ROBOT HAND ROOT
// ======================================================

const robotHand = new THREE.Group();
scene.add(robotHand);

robotHand.scale.setScalar(1.15);
robotHand.position.y = -0.25;

// ======================================================
// 5. VIRTUAL OBJECT - GRABBABLE CUBE
// ======================================================

const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);

const cubeMaterial = new THREE.MeshStandardMaterial({
    color: "#00aaff",
    metalness: 0.55,
    roughness: 0.25,
    emissive: "#003355",
    emissiveIntensity: 0.5
});

const grabbedObject = new THREE.Mesh(
    cubeGeometry,
    cubeMaterial
);

const objectStartPosition = new THREE.Vector3(1.5, 0.5, 0);
grabbedObject.position.copy(objectStartPosition);
scene.add(grabbedObject);

let objectGrabbed = false;
let previousPinch = false;

// ======================================================
// 6. 3D GEOMETRY HELPERS
// ======================================================

function createSphere(parent, position, radius, material) {
    const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 24, 24),
        material
    );

    mesh.position.copy(position);
    mesh.castShadow = true;
    parent.add(mesh);

    return mesh;
}

function createBone(parent, start, end, radius, material) {
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();

    const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(
            radius * 0.78,
            radius,
            length,
            16
        ),
        material
    );

    mesh.position.copy(start).add(end).multiplyScalar(0.5);

    mesh.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.normalize()
    );

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);

    return mesh;
}

function createRoundedBox(parent, width, height, depth, material) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const mesh = new THREE.Mesh(geometry, material);

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);

    return mesh;
}

// ======================================================
// 7. PALM
// ======================================================

const palm = new THREE.Group();
robotHand.add(palm);

createRoundedBox(
    palm,
    1.05,
    1.35,
    0.42,
    titaniumDark
);

const palmPlate = createRoundedBox(
    palm,
    0.82,
    1.12,
    0.12,
    titanium
);

palmPlate.position.z = 0.25;

const palmCore = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 0.10, 32),
    cyanMaterial
);

palmCore.rotation.x = Math.PI / 2;
palmCore.position.set(0, 0, 0.34);
palm.add(palmCore);

// Palm screws
const screwPositions = [
    [-0.32, 0.42],
    [0.32, 0.42],
    [-0.32, -0.42],
    [0.32, -0.42]
];

screwPositions.forEach(([x, y]) => {
    createSphere(
        palm,
        new THREE.Vector3(x, y, 0.34),
        0.035,
        blackMetal
    );
});

// ======================================================
// 8. FINGER CONSTRUCTION
// ======================================================

const fingerObjects = {};

function createFinger(name, x, baseY, lengths, radius = 0.085) {
    const fingerRoot = new THREE.Group();

    fingerRoot.position.set(x, baseY, 0.12);
    palm.add(fingerRoot);

    const finger = {
        name,
        root: fingerRoot,
        joints: [],
        lengths,
        curl: 0,
        targetCurl: 0
    };

    let currentGroup = fingerRoot;

    lengths.forEach((length, index) => {
        createSphere(
            currentGroup,
            new THREE.Vector3(0, 0, 0),
            radius * 1.05,
            jointMaterial
        );

        createBone(
            currentGroup,
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, length, 0),
            radius,
            index === 0 ? titanium : titaniumDark
        );

        const nextJoint = new THREE.Group();
        nextJoint.position.y = length;
        currentGroup.add(nextJoint);

        finger.joints.push(nextJoint);
        currentGroup = nextJoint;
    });

    createSphere(
        currentGroup,
        new THREE.Vector3(0, 0, 0),
        radius * 0.9,
        titanium
    );

    fingerObjects[name] = finger;
    return finger;
}

// Four fingers

createFinger(
    "little",
    -0.36,
    0.60,
    [0.35, 0.26, 0.18],
    0.075
);

createFinger(
    "ring",
    -0.12,
    0.66,
    [0.43, 0.32, 0.22],
    0.085
);

createFinger(
    "middle",
    0.12,
    0.66,
    [0.47, 0.35, 0.24],
    0.09
);

createFinger(
    "index",
    0.36,
    0.60,
    [0.38, 0.28, 0.19],
    0.08
);

// ======================================================
// 9. THUMB
// ======================================================

const thumbRoot = new THREE.Group();

thumbRoot.position.set(-0.52, -0.32, 0.16);
thumbRoot.rotation.z = -0.85;

palm.add(thumbRoot);

const thumb = {
    name: "thumb",
    root: thumbRoot,
    joints: [],
    curl: 0,
    targetCurl: 0
};

let thumbGroup = thumbRoot;
const thumbLengths = [0.32, 0.26, 0.20];

thumbLengths.forEach(length => {
    createSphere(
        thumbGroup,
        new THREE.Vector3(0, 0, 0),
        0.095,
        jointMaterial
    );

    createBone(
        thumbGroup,
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, length, 0),
        0.10,
        titanium
    );

    const nextJoint = new THREE.Group();
    nextJoint.position.y = length;
    thumbGroup.add(nextJoint);

    thumb.joints.push(nextJoint);
    thumbGroup = nextJoint;
});

createSphere(
    thumbGroup,
    new THREE.Vector3(0, 0, 0),
    0.085,
    titanium
);

fingerObjects.thumb = thumb;

// ======================================================
// 10. WRIST
// ======================================================

const wrist = new THREE.Mesh(
    new THREE.CylinderGeometry(0.40, 0.48, 0.65, 32),
    blackMetal
);

wrist.position.set(0, -1.02, 0);
wrist.castShadow = true;
robotHand.add(wrist);

// Wrist bands

for (let i = 0; i < 3; i++) {
    const band = new THREE.Mesh(
        new THREE.TorusGeometry(0.43, 0.035, 12, 40),
        cyanMaterial
    );

    band.rotation.x = Math.PI / 2;
    band.position.y = -0.86 - i * 0.16;
    robotHand.add(band);
}

// ======================================================
// 11. ANIMATION VARIABLES
// ======================================================

let targetRotationX = 0;
let targetRotationY = 0;

let targetPositionX = 0;
let targetPositionY = 0;

// ======================================================
// 12. ARTICULATED FINGER ANIMATION
// ======================================================

function animateFinger(finger, curl) {
    const joints = finger.joints;

    if (finger.name === "thumb") {
        joints[0].rotation.z = curl * 0.45;
        joints[0].rotation.x = curl * 0.25;

        joints[1].rotation.z = curl * 0.50;
        joints[1].rotation.x = curl * 0.65;

        joints[2].rotation.z = curl * 0.30;
        joints[2].rotation.x = curl * 0.50;
    } else {
        joints[0].rotation.x = curl * 0.45;
        joints[1].rotation.x = curl * 1.05;
        joints[2].rotation.x = curl * 0.85;
    }
}

// ======================================================
// 13. ROBOT UPDATE
// ======================================================

function updateRobot() {
    Object.values(fingerObjects).forEach(finger => {
        finger.curl += (
            finger.targetCurl - finger.curl
        ) * 0.18;

        animateFinger(finger, finger.curl);
    });

    robotHand.rotation.x += (
        targetRotationX - robotHand.rotation.x
    ) * 0.08;

    robotHand.rotation.y += (
        targetRotationY - robotHand.rotation.y
    ) * 0.08;

    robotHand.position.x += (
        targetPositionX - robotHand.position.x
    ) * 0.08;

    robotHand.position.y += (
        targetPositionY - robotHand.position.y
    ) * 0.08;
}

// ======================================================
// 14. RENDER LOOP
// ======================================================

function renderLoop() {
    requestAnimationFrame(renderLoop);

    updateRobot();

    // Cube glow animation
    if (objectGrabbed) {
        cubeMaterial.emissive.set("#00ccff");
        cubeMaterial.emissiveIntensity =
            1.2 + Math.sin(performance.now() * 0.006) * 0.4;
    } else {
        cubeMaterial.emissive.set("#003355");
        cubeMaterial.emissiveIntensity = 0.5;
    }

    renderer.render(scene, camera);
}

renderLoop();

loadingMessage.style.display = "none";

// Responsive display

window.addEventListener("resize", () => {
    camera.aspect =
        container.clientWidth / container.clientHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        container.clientWidth,
        container.clientHeight
    );
});

// ======================================================
// 15. MEDIAPIPE INITIALIZATION
// ======================================================

let handLandmarker = null;
let webcamActive = false;
let lastVideoTime = -1;

// ======================================================
// 16. LOAD HAND TRACKING AI
// ======================================================

async function initializeHandTracking() {
    gestureName.textContent = "Loading AI model...";
    gestureDescription.textContent = "Initializing hand tracking.";

    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    handLandmarker = await HandLandmarker.createFromOptions(
        vision,
        {
            baseOptions: {
                modelAssetPath:
                    "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
                delegate: "GPU"
            },
            runningMode: "VIDEO",
            numHands: 1
        }
    );
}

// ======================================================
// 17. WEBCAM BUTTON
// ======================================================

startButton.addEventListener("click", async () => {
    if (webcamActive) {
        stopWebcam();
        return;
    }

    startButton.disabled = true;
    startButton.textContent = "Initializing webcam...";

    try {
        if (!handLandmarker) {
            await initializeHandTracking();
        }

        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: 640,
                height: 480,
                facingMode: "user"
            },
            audio: false
        });

        video.srcObject = stream;
        await video.play();

        webcamActive = true;
        cameraOverlay.style.display = "none";

        startButton.disabled = false;
        startButton.textContent = "■ Stop Webcam";

        trackingStatus.textContent = "ACTIVE";
        trackingStatus.style.color = "#4ee7a8";

        gestureName.textContent = "Show your hand";
        gestureDescription.textContent =
            "Place your palm in front of the webcam.";

        detectHands();

    } catch (error) {
        console.error("Webcam initialization failed:", error);

        startButton.disabled = false;
        startButton.textContent = "▶ Start Webcam";

        gestureName.textContent = "Webcam initialization failed";
        gestureDescription.textContent = error.message;

        trackingStatus.textContent = "ERROR";
    }
});

// ======================================================
// 18. STOP WEBCAM
// ======================================================

function stopWebcam() {
    if (video.srcObject) {
        video.srcObject
            .getTracks()
            .forEach(track => track.stop());

        video.srcObject = null;
    }

    webcamActive = false;
    objectGrabbed = false;
    previousPinch = false;

    cameraOverlay.style.display = "grid";

    startButton.textContent = "▶ Start Webcam";

    trackingStatus.textContent = "INACTIVE";
    trackingStatus.style.color = "#6c819c";

    gestureName.textContent = "Webcam stopped";
    gestureDescription.textContent =
        "Start webcam to resume tracking.";
}

// ======================================================
// 19. HAND DETECTION LOOP
// ======================================================

function detectHands() {
    if (!webcamActive) return;

    if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;

        const results = handLandmarker.detectForVideo(
            video,
            performance.now()
        );

        if (results.landmarks && results.landmarks.length > 0) {
            processHand(results.landmarks[0]);
        } else {
            showNoHand();
        }
    }

    requestAnimationFrame(detectHands);
}

// ======================================================
// 20. LANDMARK DISTANCE
// ======================================================

function landmarkDistance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = (a.z || 0) - (b.z || 0);

    return Math.sqrt(
        dx * dx +
        dy * dy +
        dz * dz
    );
}

// ======================================================
// 21. IMPROVED FINGER DETECTION
// ======================================================

function detectFingerStates(landmarks) {
    const index = landmarks[8].y < landmarks[6].y;
    const middle = landmarks[12].y < landmarks[10].y;
    const ring = landmarks[16].y < landmarks[14].y;
    const little = landmarks[20].y < landmarks[18].y;

    const thumbTip = landmarks[4];
    const thumbIP = landmarks[3];
    const littleMCP = landmarks[17];

    const thumb = landmarkDistance(
        thumbTip,
        littleMCP
    ) > landmarkDistance(
        thumbIP,
        littleMCP
    ) * 1.20;

    return {
        thumb,
        index,
        middle,
        ring,
        little
    };
}

// ======================================================
// 22. VIRTUAL OBJECT CONTROL
// ======================================================

function controlVirtualObject(landmarks, openCount) {
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];

    const pinchDistance = landmarkDistance(
        thumbTip,
        indexTip
    );

    const palmWidth = landmarkDistance(
        landmarks[5],
        landmarks[17]
    );

    const isPinching = pinchDistance < palmWidth * 0.35;

    // Pinch to grab
    if (isPinching && !previousPinch) {
        objectGrabbed = true;

        gestureName.textContent = "Object Grabbed!";
        gestureDescription.textContent =
            "Move your hand to control the cube.";
    }

    // Move cube while pinching or holding a fist
    if (objectGrabbed && (isPinching || openCount === 0)) {
        const handX = landmarks[9].x;
        const handY = landmarks[9].y;

        grabbedObject.position.x = (0.5 - handX) * 5;
        grabbedObject.position.y = (0.5 - handY) * 3.5;
    }

    // Open palm releases the object
    if (objectGrabbed && openCount === 5 && !isPinching) {
        objectGrabbed = false;

        gestureName.textContent = "Object Released";
        gestureDescription.textContent =
            "The cube has been released.";
    }

    previousPinch = isPinching;
}

// ======================================================
// 23. PROCESS DETECTED HAND
// ======================================================

function processHand(landmarks) {
    const states = detectFingerStates(landmarks);
    const confidence = 95;

    confidenceText.textContent = confidence + "%";
    confidenceBar.style.width = confidence + "%";

    trackingStatus.textContent = "TRACKING";
    trackingStatus.style.color = "#4ee7a8";

    // Control robotic fingers
    Object.keys(states).forEach(name => {
        const curl = states[name] ? 0 : 1.15;
        fingerObjects[name].targetCurl = curl;
    });

    // Count open fingers
    const openCount = Object.values(states)
        .filter(Boolean)
        .length;

    // Control virtual object
    controlVirtualObject(landmarks, openCount);

    let gesture = "Custom Gesture";
    let description = "Robotic fingers follow your hand.";

    // Gesture recognition priority

    if (
        states.thumb &&
        !states.index &&
        !states.middle &&
        !states.ring &&
        !states.little
    ) {
        gesture = "Thumbs Up";
        description = "Thumb extended, other fingers curled.";

    } else if (openCount === 5) {
        gesture = "Open Palm";
        description = "All five fingers extended.";

    } else if (openCount === 0) {
        gesture = "Fist";
        description = "All five fingers curled.";

    } else if (
        states.index &&
        states.middle &&
        !states.ring &&
        !states.little
    ) {
        gesture = "Peace Sign";
        description = "Index and middle fingers extended.";

    } else if (
        states.index &&
        !states.middle &&
        !states.ring &&
        !states.little
    ) {
        gesture = "Pointing";
        description = "Index finger extended.";

    } else {
        gesture = "Custom Gesture";
        description = "Robotic hand following your movement.";
    }

    // Don't override object-grabbing status
    if (!objectGrabbed) {
        gestureName.textContent = gesture;
        gestureDescription.textContent = description;
    } else {
        gestureName.textContent = "Object Grabbed!";
        gestureDescription.textContent =
            "Pinch or make a fist to hold. Open palm to release.";
    }

    detectedGesture.textContent =
        objectGrabbed ? "GRABBING OBJECT" : gesture;

    // Update dashboard
    updateFingerUI("thumb", states.thumb);
    updateFingerUI("index", states.index);
    updateFingerUI("middle", states.middle);
    updateFingerUI("ring", states.ring);
    updateFingerUI("little", states.little);

    // Robot rotation follows hand position
    const handX = landmarks[9].x;
    const handY = landmarks[9].y;

    targetRotationY = (handX - 0.5) * 1.6;
    targetRotationX = (handY - 0.5) * 1.2;

    targetPositionX = (0.5 - handX) * 1.5;
    targetPositionY = (0.5 - handY) * 1.5;
}

// ======================================================
// 24. FINGER DASHBOARD
// ======================================================

function updateFingerUI(name, isOpen) {
    const bar = document.getElementById(name + "-bar");
    const value = document.getElementById(name + "-value");

    if (!bar || !value) return;

    bar.style.width = isOpen ? "100%" : "10%";
    value.textContent = isOpen ? "OPEN" : "CLOSED";
}

// ======================================================
// 25. NO HAND DETECTED
// ======================================================

function showNoHand() {
    trackingStatus.textContent = "SEARCHING";
    trackingStatus.style.color = "#f5b942";

    confidenceText.textContent = "0%";
    confidenceBar.style.width = "0%";

    detectedGesture.textContent = "None";

    gestureName.textContent = "No hand detected";
    gestureDescription.textContent =
        "Show your hand clearly in front of camera.";

    objectGrabbed = false;
    previousPinch = false;
}

// ======================================================
// 26. RESET ROBOT HAND AND OBJECT
// ======================================================

const resetButton = document.getElementById("reset-hand");

if (resetButton) {
    resetButton.addEventListener("click", () => {
        Object.values(fingerObjects).forEach(finger => {
            finger.targetCurl = 0;
        });

        targetRotationX = 0;
        targetRotationY = 0;

        targetPositionX = 0;
        targetPositionY = 0;

        // Reset virtual cube
        objectGrabbed = false;
        previousPinch = false;

        grabbedObject.position.copy(objectStartPosition);

        gestureName.textContent = "Robotic hand reset";
        gestureDescription.textContent =
            "Hand and virtual object returned to default position.";
    });
}
