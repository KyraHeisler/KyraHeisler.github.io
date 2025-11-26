let scene, camera, renderer, orbit, transform;
let socket, playerId = null;
let otherPlayers = {};
let player;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);

    camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 1000);
    camera.position.set(6,6,10);

    renderer = new THREE.WebGLRenderer({ antialias:true });
    renderer.setSize(innerWidth, innerHeight);
    document.getElementById("viewport").appendChild(renderer.domElement);

    orbit = new THREE.OrbitControls(camera, renderer.domElement);

    transform = new THREE.TransformControls(camera, renderer.domElement);
    transform.addEventListener("dragging-changed", e => orbit.enabled = !e.value);
    scene.add(transform);

    // Player
    player = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1.8, 1),
        new THREE.MeshStandardMaterial({ color:0x00ffaa })
    );
    player.position.set(0,1,0);
    scene.add(player);

    animate();
}

function animate() {
    requestAnimationFrame(animate);

    if (socket && playerId) {
        socket.send(JSON.stringify({
            type: "move",
            position: player.position
        }));
    }

    renderer.render(scene, camera);
}

function addCube() {
    let m = new THREE.Mesh(
        new THREE.BoxGeometry(1,1,1),
        new THREE.MeshStandardMaterial({ color:0x3399ff })
    );
    m.position.set(0,1,0);
    scene.add(m);
}

function addSphere() {
    let m = new THREE.Mesh(
        new THREE.SphereGeometry(0.6),
        new THREE.MeshStandardMaterial({ color:0xff4444 })
    );
    m.position.set(0,1,0);
    scene.add(m);
}

function connectMultiplayer() {
    socket = new WebSocket("ws://localhost:8080");

    socket.onmessage = e => {
        let data = JSON.parse(e.data);

        if (data.type === "init") playerId = data.id;

        if (data.type === "playerMove") {
            if (!otherPlayers[data.id]) {
                let p = new THREE.Mesh(
                    new THREE.BoxGeometry(1,1.8,1),
                    new THREE.MeshStandardMaterial({ color:0xff00ff })
                );
                otherPlayers[data.id] = p;
                scene.add(p);
            }
            otherPlayers[data.id].position.set(
                data.position.x, data.position.y, data.position.z
            );
        }
    };
}

init();
