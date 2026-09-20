import * as THREE from 'three';

class Skills3DOrbitRealm {
    constructor() {
        this.container = document.getElementById('skills3dCanvasContainer');
        this.skillsSection = document.getElementById('skills');
        if (!this.container || !this.skillsSection) return;

        this.scene = null;
        this.camera = null;
        this.renderer = null;

        // 3D Groups
        this.mainRig = new THREE.Group();
        this.coreGroup = new THREE.Group();
        this.orbitTrackGroup = new THREE.Group();
        this.outerOrbitGroup = new THREE.Group();
        this.techBadges = [];

        // Mouse Parallax & Drag Coordinates
        this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.dragRotation = { x: 0, y: 0 };

        this.clock = new THREE.Clock();
        this.isVisible = false;

        this.init();
    }

    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLights();
        this.buildCursedCore();
        this.build3DOrbitRings();
        this.setupEventListeners();
        this.setupVisibilityObserver();
        this.animate();
    }

    // SCENE SETUP
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.add(this.mainRig);
        this.mainRig.add(this.coreGroup);
        this.mainRig.add(this.orbitTrackGroup);
        this.mainRig.add(this.outerOrbitGroup);

        // Imposing scale in the center
        this.mainRig.scale.set(1.06, 1.06, 1.06);
    }

    // CAMERA SETUP
    setupCamera() {
        const width = this.container.clientWidth || 1080;
        const height = this.container.clientHeight || 660;
        const aspect = width / height;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 50);
        this.camera.position.set(0, 0, 11.5);
    }

    // RENDERER SETUP
    setupRenderer() {
        const width = this.container.clientWidth || 1080;
        const height = this.container.clientHeight || 660;

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.35;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.container.appendChild(this.renderer.domElement);
    }

    // LIGHTING (Blood Crimson & Cursed Violet)
    setupLights() {
        // Ambient room illumination
        const ambientLight = new THREE.AmbientLight(0x2a0614, 3.2);
        this.scene.add(ambientLight);

        // Front Key Red Light directly illuminating the 3D Moon sphere from near camera
        const frontMoonLight = new THREE.DirectionalLight(0xff2244, 2.8);
        frontMoonLight.position.set(2.5, 3.0, 7.5);
        this.scene.add(frontMoonLight);

        // Side Rim Blood Light for 3D sphere curvature & crater edge highlights
        const sideRimLight = new THREE.PointLight(0xff003c, 12, 25);
        sideRimLight.position.set(-4.0, -1.5, 4.5);
        this.scene.add(sideRimLight);

        // Top White Directional Highlight for crisp specular glints on craters
        const topLight = new THREE.DirectionalLight(0xffe6e6, 1.4);
        topLight.position.set(0, 6, 6);
        this.scene.add(topLight);
    }

    // TRUE 3D SPHERE BLOOD MOON (COMPLETELY CLEAN - ZERO LINES OVER MOON)
    buildCursedCore() {
        const textureLoader = new THREE.TextureLoader();
        
        // Full frame high-res lunar surface texture
        const moonTexture = textureLoader.load('assets/images/blood_moon_surface.jpg', () => {
            if (this.renderer) this.renderer.render(this.scene, this.camera);
        });
        moonTexture.colorSpace = THREE.SRGBColorSpace;
        moonTexture.wrapS = THREE.RepeatWrapping;
        moonTexture.wrapT = THREE.ClampToEdgeWrapping;

        // 1. Physical 3D Blood Moon Sphere with authentic craters, magma channels & lunar maria
        const moonGeo = new THREE.SphereGeometry(1.90, 64, 64);
        const moonMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: moonTexture,
            bumpMap: moonTexture,
            bumpScale: 0.09,
            roughness: 0.55,
            metalness: 0.15,
            emissive: 0xcc0033,
            emissiveMap: moonTexture,
            emissiveIntensity: 0.95
        });
        this.moonSphere = new THREE.Mesh(moonGeo, moonMat);
        this.coreGroup.add(this.moonSphere);

        // 2. Atmospheric Blood Corona (Soft spherical glow halo around 3D moon - NO hard lines!)
        const coronaGeo = new THREE.SphereGeometry(1.98, 32, 32);
        const coronaMat = new THREE.MeshBasicMaterial({
            color: 0xff003c,
            transparent: true,
            opacity: 0.22,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending
        });
        const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
        this.coreGroup.add(coronaMesh);

        // 3. Internal Radiance PointLight
        const moonGlow = new THREE.PointLight(0xff003c, 7.0, 14);
        moonGlow.position.set(0, 0, 0);
        this.coreGroup.add(moonGlow);
    }

    build3DOrbitRings() {
        // 1. NO VISIBLE ORBIT LINE:
        // The language track line is completely invisible. Only logos float through 3D space!
        const mainRadius = 3.40;

        // 2. CELESTIAL OUTER RING: THIN, SLEEK & SLENDER (Red theme match, NO PURPLE)
        // Reduced thickness from 0.038 down to a sharp, elegant 0.013!
        const outerRadius = 4.15;
        const outerRingGeo = new THREE.TorusGeometry(outerRadius, 0.013, 16, 160);
        const outerRingMat = new THREE.MeshStandardMaterial({
            color: 0xff003c,
            emissive: 0xff003c,
            emissiveIntensity: 3.0,
            roughness: 0.15,
            metalness: 0.92
        });
        const outerRingMesh = new THREE.Mesh(outerRingGeo, outerRingMat);
        this.outerOrbitGroup.add(outerRingMesh);

        // Initial Gyroscopic 3D Tilt Angles
        this.orbitTrackGroup.rotation.x = Math.PI / 2.65;
        this.orbitTrackGroup.rotation.y = Math.PI / 5.5;

        this.outerOrbitGroup.rotation.x = -Math.PI / 3.1;
        this.outerOrbitGroup.rotation.z = Math.PI / 4.8;

        // 3. 8 TECH SKILL BADGES FLOATING FREELY ON THE INVISIBLE 3D ORBIT
        // EXACT 10 USER-SPECIFIED TECHNOLOGIES:
        // CSS, Java, HTML, Python, GSAP, Lenis, C, C++, TS, JS
        const techList = [
            { name: 'HTML', color: '#ff5722', bg: '#2b0c03', symbol: '< / >' },
            { name: 'CSS', color: '#38bdf8', bg: '#042238', symbol: '🎨' },
            { name: 'JS', color: '#facc15', bg: '#2b2603', symbol: '⚡' },
            { name: 'TS', color: '#38bdf8', bg: '#041c30', symbol: 'TS' },
            { name: 'Python', color: '#4ade80', bg: '#042810', symbol: '🐍' },
            { name: 'Java', color: '#ff7043', bg: '#2e1204', symbol: '☕' },
            { name: 'C', color: '#90caf9', bg: '#0c1b2d', symbol: 'C' },
            { name: 'C++', color: '#29b6f6', bg: '#02182b', symbol: 'C++' },
            { name: 'GSAP', color: '#a3e635', bg: '#172803', symbol: '⚡' },
            { name: 'Lenis', color: '#ffffff', bg: '#1c0309', symbol: '〰️' }
        ];

        const badgeCount = techList.length;
        const badgeGeo = new THREE.CircleGeometry(0.36, 32);

        techList.forEach((tech, i) => {
            const angle = (i / badgeCount) * Math.PI * 2;
            const badgeTexture = this.createTechBadgeTexture(tech.name, tech.symbol, tech.color, tech.bg);

            const badgeMat = new THREE.MeshBasicMaterial({
                map: badgeTexture,
                transparent: true,
                side: THREE.DoubleSide
            });
            const badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);

            const x = Math.cos(angle) * mainRadius;
            const y = Math.sin(angle) * mainRadius;
            badgeMesh.position.set(x, y, 0);

            this.orbitTrackGroup.add(badgeMesh);
            this.techBadges.push(badgeMesh);
        });

        // Floating cursed embers
        // local particles removed as requested
    }

    // Canvas 2D Badge Texture Generator
    createTechBadgeTexture(name, symbol, color, bg) {
        const canvas = document.createElement('canvas');
        canvas.width = 180;
        canvas.height = 180;
        const ctx = canvas.getContext('2d');

        // Circular background with subtle dark neon gradient
        ctx.beginPath();
        ctx.arc(90, 90, 84, 0, Math.PI * 2);
        ctx.fillStyle = bg || '#0d0208';
        ctx.fill();

        // Glowing themed border
        ctx.strokeStyle = color || '#ff003c';
        ctx.lineWidth = 5;
        ctx.stroke();

        // Subtle inner cyber ring
        ctx.beginPath();
        ctx.arc(90, 90, 75, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Central Icon / Symbol
        ctx.font = 'bold 44px "Outfit", "Segoe UI Emoji", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = color;
        ctx.fillText(symbol, 90, 68);

        // Tech Label Text (Crisp white with color shadow)
        ctx.font = 'bold 18px "Outfit", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.fillText(name, 90, 122);

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        return texture;
    }

    // EVENT LISTENERS (Mouse Move Parallax & Drag)
    setupEventListeners() {
        // Track mouse movement over the entire skills section for smooth 3D tilt
        this.skillsSection.addEventListener('mousemove', (e) => {
            const rect = this.skillsSection.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            this.mouse.targetX = x * 2;
            this.mouse.targetY = y * 2;

            if (this.isDragging) {
                const deltaX = e.clientX - this.previousMousePosition.x;
                const deltaY = e.clientY - this.previousMousePosition.y;
                this.dragRotation.y += deltaX * 0.007;
                this.dragRotation.x += deltaY * 0.007;
                // Clamp vertical tilt to prevent unnatural flipping
                this.dragRotation.x = Math.max(-0.75, Math.min(0.75, this.dragRotation.x));
                this.previousMousePosition = { x: e.clientX, y: e.clientY };
            }
        });

        // Drag on 3D stage
        const stage = document.getElementById('skills3dStage');
        if (stage) {
            stage.addEventListener('mousedown', (e) => {
                this.isDragging = true;
                this.previousMousePosition = { x: e.clientX, y: e.clientY };
            });

            window.addEventListener('mouseup', () => {
                this.isDragging = false;
            });
        }

        this.skillsSection.addEventListener('mouseleave', () => {
            this.mouse.targetX = 0;
            this.mouse.targetY = 0;
            this.isDragging = false;
        });

        // Touch support
        this.skillsSection.addEventListener('touchstart', (e) => {
            if (!e.touches || !e.touches[0]) return;
            this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }, { passive: true });

        this.skillsSection.addEventListener('touchmove', (e) => {
            if (!e.touches || !e.touches[0]) return;
            const rect = this.skillsSection.getBoundingClientRect();
            const x = (e.touches[0].clientX - rect.left) / rect.width - 0.5;
            const y = (e.touches[0].clientY - rect.top) / rect.height - 0.5;
            this.mouse.targetX = x * 2;
            this.mouse.targetY = y * 2;
        }, { passive: true });

        // Window resize
        window.addEventListener('resize', () => {
            if (!this.container) return;
            const w = this.container.clientWidth || 1080;
            const h = this.container.clientHeight || 660;
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(w, h);
        });
    }

    // Visibility Observer
    setupVisibilityObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                this.isVisible = entry.isIntersecting;
            });
        }, { threshold: 0.05 });

        observer.observe(this.skillsSection);
    }

    // ANIMATION LOOP
    animate() {
        requestAnimationFrame(() => this.animate());

        if (!this.isVisible) return;

        const elapsedTime = this.clock.getElapsedTime();

        // Smooth Mouse Inertia / Lerp
        this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.065;
        this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.065;

        // 1. CONTINUOUS 3D PHYSICAL BLOOD MOON ROTATION
        // Craters, volcanic fissures & dark maria continuously roll across the 3D globe
        if (this.moonSphere) {
            this.moonSphere.rotation.y = elapsedTime * 0.24;
            this.moonSphere.rotation.x = Math.sin(elapsedTime * 0.35) * 0.09;
        }

        // 2. DYNAMIC CELESTIAL RING ORBIT AROUND THE MOON (CHANGING POSITION & 3D TILT ANGLE)
        // Revolves around the moon horizontally (Y-axis), undulates vertically (X-axis), and spins (Z-axis)
        this.outerOrbitGroup.rotation.y = elapsedTime * 0.24;
        this.outerOrbitGroup.rotation.x = -Math.PI / 3.2 + Math.sin(elapsedTime * 0.4) * 0.42;
        this.outerOrbitGroup.rotation.z = Math.cos(elapsedTime * 0.3) * 0.35 - (elapsedTime * 0.14);

        // 3. CONTINUOUS GRACEFUL ORBIT OF TECH BADGES (Smooth 3D orbital procession around Moon)
        this.orbitTrackGroup.rotation.z = elapsedTime * 0.18;
        this.orbitTrackGroup.rotation.x = Math.PI / 2.65 + Math.sin(elapsedTime * 0.28) * 0.25;
        this.orbitTrackGroup.rotation.y = Math.cos(elapsedTime * 0.22) * 0.32;

        // Billboard badges towards camera perfectly in world space
        this.techBadges.forEach((badge) => {
            badge.quaternion.copy(this.orbitTrackGroup.quaternion).invert().multiply(this.camera.quaternion);
        });

        // 3D Tilt & Drag Reaction
        this.mainRig.rotation.y = this.dragRotation.y + this.mouse.x * 0.65;
        this.mainRig.rotation.x = this.dragRotation.x - this.mouse.y * 0.48;

        this.renderer.render(this.scene, this.camera);
    }
}

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
    new Skills3DOrbitRealm();
});

export default Skills3DOrbitRealm;
