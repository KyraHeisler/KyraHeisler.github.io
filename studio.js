// =====================================================
//   HYBRID TERRAIN: FLAT CENTER + MOUNTAINS OUTSIDE
// =====================================================

function generateHybridTerrain() {
    const size = 200;                // Total terrain size
    const segments = 200;            // Detail level
    const flatRadius = 40;           // How large the flat center is
    const maxMountainHeight = 25;    // Max height of mountains

    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    geometry.rotateX(-Math.PI / 2);

    const pos = geometry.attributes.position;

    for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i);
        let z = pos.getZ(i);

        // Distance from center
        const dist = Math.sqrt(x * x + z * z);

        // ----- FLAT CENTER -----
        if (dist < flatRadius) {
            pos.setY(i, 0);
            continue;
        }

        // ----- MOUNTAIN AREA -----
        // How far outside the flat center
        let mountainFactor = (dist - flatRadius) / (size / 2 - flatRadius);

        // Clamp 0 → 1
        mountainFactor = Math.min(1, Math.max(0, mountainFactor));

        // Use Perlin-like noise + falloff
        const height =
            Math.sin(x * 0.08) * Math.cos(z * 0.08) * 8 +
            Math.sin(x * 0.15) * 4 +
            mountainFactor * maxMountainHeight;

        pos.setY(i, height);
    }

    pos.needsUpdate = true;
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
        color: 0x228833,
        roughness: 1,
        flatShading: false
    });

    const terrain = new THREE.Mesh(geometry, material);
    terrain.receiveShadow = true;

    terrain.userData.id = "terrain";
    terrain.userData.type = "terrain";

    scene.add(terrain);
    refreshHierarchy();
}
