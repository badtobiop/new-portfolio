// ==========================================================================
// UTKARSH DHAKANE // THREE.JS 3D AMBIENT ATMOSPHERE & EMBERS ENGINE
// Dual-Layer Architecture: Main Background + Sparse Foreground Embers
// ==========================================================================

import * as THREE from 'three';

class AmbientAtmosphere3D {
    constructor() {
        this.bgCanvas = document.getElementById('webgl-canvas');
        this.fgCanvas = document.getElementById('webgl-canvas-fg');

        this.bgScene = null;
        this.fgScene = null;

        this.camera = null;
        this.bgRenderer = null;
        this.fgRenderer = null;

        this.bgParticles = null;
        this.fgParticles = null;

        this.bloodLight = null;
        this.purpleLight = null;

        this.clock = new THREE.Clock();

        this.init();
    }

    init() {
        try {
            this.setupScenes();
            this.setupCamera();
            this.setupRenderers();
            this.setupLights();
            this.setupBackgroundParticles();
            this.setupForegroundSparseParticles();
            this.setupEventListeners();
            this.animate();
            console.log('Three.js Dual-Layer Embers (BG + Sparse FG) initialized successfully!');
        } catch (err) {
            console.error('Three.js initialization error:', err);
        }
    }

    setupScenes() {
        this.bgScene = new THREE.Scene();
        this.fgScene = new THREE.Scene();
    }

    setupCamera() {
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
        this.camera.position.set(0, 0, 7.5);
    }

    setupRenderers() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);

        // 1. Background Renderer (z-index: 1, behind everything)
        if (this.bgCanvas) {
            this.bgRenderer = new THREE.WebGLRenderer({
                canvas: this.bgCanvas,
                antialias: true,
                alpha: true,
                powerPreference: 'high-performance'
            });
            this.bgRenderer.setSize(window.innerWidth, window.innerHeight);
            this.bgRenderer.setPixelRatio(dpr);
            this.bgRenderer.toneMapping = THREE.ACESFilmicToneMapping;
            this.bgRenderer.toneMappingExposure = 1.35;
        }

        // 2. Foreground Renderer (z-index: 12, sparse embers floating over text)
        if (this.fgCanvas) {
            this.fgRenderer = new THREE.WebGLRenderer({
                canvas: this.fgCanvas,
                antialias: true,
                alpha: true,
                powerPreference: 'high-performance'
            });
            this.fgRenderer.setSize(window.innerWidth, window.innerHeight);
            this.fgRenderer.setPixelRatio(dpr);
            this.fgRenderer.toneMapping = THREE.ACESFilmicToneMapping;
            this.fgRenderer.toneMappingExposure = 1.35;
        }
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0x18050e, 2.5);
        this.bgScene.add(ambientLight);

        // Key Blood Red Light
        this.bloodLight = new THREE.PointLight(0xff003c, 6.5, 24);
        this.bloodLight.position.set(3, 2, 4);
        this.bgScene.add(this.bloodLight);

        // Subtle Violet Accent Light
        this.purpleLight = new THREE.PointLight(0x7928ca, 4.5, 20);
        this.purpleLight.position.set(-3, -2, 3);
        this.bgScene.add(this.purpleLight);
    }

    createEmberTexture(size = 256) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const half = size / 2;

        // Multi-stop crisp radial radiance for crystal-sharp glowing embers
        const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');         // Brilliant white hot spark core
        grad.addColorStop(0.12, 'rgba(255, 200, 220, 1)');     // Intense diamond core
        grad.addColorStop(0.25, 'rgba(255, 30, 80, 0.95)');     // Neon crimson fiery inner aura
        grad.addColorStop(0.55, 'rgba(255, 0, 60, 0.55)');      // Blood neon glow
        grad.addColorStop(0.80, 'rgba(180, 0, 40, 0.18)');      // Outer atmospheric fade
        grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');             // Clean zero falloff
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);

        // Subtle diamond spark star cross in the center for crisp high-def glint
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(half - 12, half); ctx.lineTo(half + 12, half);
        ctx.moveTo(half, half - 12); ctx.lineTo(half, half + 12);
        ctx.stroke();

        const tex = new THREE.CanvasTexture(canvas);
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = true;
        return tex;
    }

    // 1. BACKGROUND PARTICLES (900 particles - all stay BEHIND cards & text!)
    setupBackgroundParticles() {
        const count = 1300;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 28;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 24;
            // Negative Z puts them strictly behind
            positions[i * 3 + 2] = (Math.random() - 0.5) * 14 - 3;
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            size: 0.11,
            map: this.createEmberTexture(256),
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            color: 0xff1744
        });

        this.bgParticles = new THREE.Points(geometry, material);
        this.bgScene.add(this.bgParticles);
    }

    // 2. FOREGROUND PARTICLES (ONLY 30 sparse particles - "kuch-kuch hi aane chahiye"!)
    setupForegroundSparseParticles() {
        const count = 48; // Sparse, high-end drifting embers in front of content
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 26;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 22;
            positions[i * 3 + 2] = Math.random() * 2.5 + 1.2; // In front of text & images
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            size: 0.13,
            map: this.createEmberTexture(256),
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            color: 0xff3366
        });

        this.fgParticles = new THREE.Points(geometry, material);
        this.fgScene.add(this.fgParticles);
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            const aspect = window.innerWidth / window.innerHeight;
            this.camera.aspect = aspect;
            this.camera.updateProjectionMatrix();

            const dpr = Math.min(window.devicePixelRatio || 1, 2);

            if (this.bgRenderer) {
                this.bgRenderer.setSize(window.innerWidth, window.innerHeight);
                this.bgRenderer.setPixelRatio(dpr);
            }
            if (this.fgRenderer) {
                this.fgRenderer.setSize(window.innerWidth, window.innerHeight);
                this.fgRenderer.setPixelRatio(dpr);
            }
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const elapsedTime = this.clock.getElapsedTime();

        // 1. Animate Background Particles
        if (this.bgParticles) {
            const pos = this.bgParticles.geometry.attributes.position.array;
            for (let i = 0; i < pos.length; i += 3) {
                pos[i + 1] += 0.0035; // Gentle upward drift
                pos[i] += Math.sin(elapsedTime * 0.4 + i) * 0.001;

                if (pos[i + 1] > 12) {
                    pos[i + 1] = -12;
                    pos[i] = (Math.random() - 0.5) * 28;
                }
            }
            this.bgParticles.geometry.attributes.position.needsUpdate = true;
            this.bgParticles.rotation.y = elapsedTime * 0.005;
        }

        // 2. Animate Sparse Foreground Particles (Only 30 embers)
        if (this.fgParticles) {
            const pos = this.fgParticles.geometry.attributes.position.array;
            for (let i = 0; i < pos.length; i += 3) {
                pos[i + 1] += 0.0028; // Very slow, peaceful drift
                pos[i] += Math.sin(elapsedTime * 0.35 + i) * 0.0012;

                if (pos[i + 1] > 10) {
                    pos[i + 1] = -10;
                    pos[i] = (Math.random() - 0.5) * 24;
                }
            }
            this.fgParticles.geometry.attributes.position.needsUpdate = true;
            this.fgParticles.rotation.y = elapsedTime * 0.003;
        }

        // 3. Subtle Lighting Pulse
        if (this.bloodLight) {
            this.bloodLight.intensity = 6.0 + Math.sin(elapsedTime * 1.8) * 1.2;
        }

        // Render both passes
        if (this.bgRenderer && this.bgScene) {
            this.bgRenderer.render(this.bgScene, this.camera);
        }
        // Animate foreground particles drifting upwards across name & images
        if (this.fgParticles) {
            const pos = this.fgParticles.geometry.attributes.position.array;
            for (let i = 1; i < pos.length; i += 3) {
                pos[i] += 0.0045; // Gentle upward drift
                if (pos[i] > 11) pos[i] = -11;
            }
            this.fgParticles.geometry.attributes.position.needsUpdate = true;
        }

        if (this.fgRenderer && this.fgScene) {
            this.fgRenderer.render(this.fgScene, this.camera);
        }
    }
}

function startAtmosphere() {
    new AmbientAtmosphere3D();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startAtmosphere);
} else {
    startAtmosphere();
}
