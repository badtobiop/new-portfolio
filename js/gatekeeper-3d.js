// ==========================================================================
// SHADOW REALM // 3D SENTIENT CURSED GATEKEEPER PRELOADER
// Interactive 3D Creature: Mouse Gaze Tracking, Proximity Anger & Domain Shatter
// Author: Utkarsh Dhakane (badtobiop) & Antigravity Pair-Programmer
// ==========================================================================

import * as THREE from 'three';

class Gatekeeper3D {
    constructor() {
        this.screen = document.getElementById('gatekeeper-screen');
        this.canvas = document.getElementById('gatekeeper-canvas');
        if (!this.screen || !this.canvas) return;

        // Interactive Tracking State
        this.mouse = { x: 0, y: 0 };           // Normalized (-1 to 1)
        this.targetMouse = { x: 0, y: 0 };
        this.screenMouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.anger = 0;                         // 0.0 (Cute Rose Pink) -> 1.0 (Blazing Blood Red Rage)
        this.targetAnger = 0;
        this.isExploding = false;
        this.isDisposed = false;

        // DOM HUD Handles
        this.threatFill = document.getElementById('gatekeeperThreatFill');
        this.instruction = document.getElementById('gatekeeperInstruction');
        this.ambientGlow = document.getElementById('gatekeeperAmbientGlow');
        this.skipBtn = document.getElementById('gatekeeperSkipBtn');
        this.shockwave = document.getElementById('gatekeeperShockwave');
        this.flash = document.getElementById('gatekeeperFlash');

        // Color Palettes
        this.colorPink = new THREE.Color(0xff4d94);      // Radiant Neon Rose Pink
        this.colorHotPink = new THREE.Color(0xff1a6b);   // Cursed Fuchsia
        this.colorBloodRed = new THREE.Color(0xd60029);  // Menacing Cursed Blood Red
        this.colorDarkRage = new THREE.Color(0x660010);  // Deep Abyssal Crimson

        // Eye Color States
        this.eyeCalmColor = new THREE.Color(0x0e0208);      // Sleek Glossy Dark Obsidian
        this.eyeCalmEmissive = new THREE.Color(0x260013);   // Subtle Dark Plum Sheen
        this.eyeAngryColor = new THREE.Color(0xff002b);     // Blazing Pure Blood Red
        this.eyeAngryEmissive = new THREE.Color(0xff0015);  // Scorching Laser Red

        // Three.js Core Components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();

        // 3D Creature Mesh References
        this.creatureGroup = null;
        this.orbMesh = null;
        this.orbMaterial = null;

        // Stylized Rectangle Eyes (Anchors + Pill/Capsule Meshes)
        this.leftEyeAnchor = null;
        this.rightEyeAnchor = null;
        this.leftEyeMesh = null;
        this.rightEyeMesh = null;
        this.eyeMaterial = null;

        // Aura Particles & Shards
        this.auraParticles = null;
        this.shardMeshes = [];

        // Audio Engine Context for Domain Shatter
        this.audioCtx = null;

        this.init();
    }

    init() {
        // Lock body scrolling while gatekeeper is active
        document.body.style.overflow = 'hidden';
        if (window.lenis) {
            window.lenis.stop();
        } else {
            const checkLenis = setInterval(() => {
                if (window.lenis) {
                    if (!this.isDisposed) window.lenis.stop();
                    clearInterval(checkLenis);
                }
            }, 60);
            setTimeout(() => clearInterval(checkLenis), 3000);
        }

        this.setupThreeScene();
        this.setupLights();
        this.createCreature();
        this.createAuraParticles();
        this.createShardPool();
        this.setupEventListeners();
        this.animate();
    }

    setupThreeScene() {
        this.scene = new THREE.Scene();

        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
        this.camera.position.set(0, 0, 6.6); // Compact, centered framing for smaller orb

        const dpr = Math.min(window.devicePixelRatio || 1, 2.0);
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(dpr);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.35;
    }

    setupLights() {
        // Soft ambient twilight light
        this.ambientLight = new THREE.AmbientLight(0x2a0818, 2.2);
        this.scene.add(this.ambientLight);

        // Key Light (Transforms with anger from Rose Pink to Pure Crimson Red)
        this.keyLight = new THREE.PointLight(0xff4d94, 5.5, 25);
        this.keyLight.position.set(2.8, 2.6, 4.2);
        this.scene.add(this.keyLight);

        // Fill Light (Crisp specular sheen)
        this.fillLight = new THREE.DirectionalLight(0xffffff, 1.4);
        this.fillLight.position.set(-3.0, 2.2, 3.5);
        this.scene.add(this.fillLight);

        // Back Rim Light (Glowing halo around orb edge)
        this.rimLight = new THREE.PointLight(0xff1493, 6.5, 18);
        this.rimLight.position.set(0, -0.8, -2.8);
        this.scene.add(this.rimLight);
    }

    createCreature() {
        this.creatureGroup = new THREE.Group();
        this.scene.add(this.creatureGroup);

        // 1. MAIN SPHERICAL BODY (Scaled down to compact, cute radius 0.95)
        const orbGeo = new THREE.SphereGeometry(0.95, 64, 64);
        this.orbMaterial = new THREE.MeshPhysicalMaterial({
            color: this.colorPink,
            roughness: 0.20,
            metalness: 0.08,
            clearcoat: 0.95,
            clearcoatRoughness: 0.10,
            emissive: this.colorHotPink,
            emissiveIntensity: 0.22,
            reflectivity: 0.85
        });
        this.orbMesh = new THREE.Mesh(orbGeo, this.orbMaterial);
        this.creatureGroup.add(this.orbMesh);

        // 2. MINIMALIST STYLIZED RECTANGLE / CAPSULE EYES
        // Clean cartoon vertical rounded rectangles on the surface of the sphere
        const eyeGeo = new THREE.CapsuleGeometry(0.046, 0.20, 10, 20);

        this.eyeMaterial = new THREE.MeshPhysicalMaterial({
            color: this.eyeCalmColor.clone(),
            roughness: 0.12,
            metalness: 0.15,
            clearcoat: 1.0,
            clearcoatRoughness: 0.08,
            emissive: this.eyeCalmEmissive.clone(),
            emissiveIntensity: 0.35
        });

        // Left Eye Anchor & Mesh
        this.leftEyeAnchor = new THREE.Group();
        this.leftEyeMesh = new THREE.Mesh(eyeGeo, this.eyeMaterial);
        this.leftEyeAnchor.add(this.leftEyeMesh);

        // Right Eye Anchor & Mesh
        this.rightEyeAnchor = new THREE.Group();
        this.rightEyeMesh = new THREE.Mesh(eyeGeo, this.eyeMaterial);
        this.rightEyeAnchor.add(this.rightEyeMesh);

        // Initial positions on curved surface
        const initialSpacing = 0.24;
        const initialY = 0.05;
        const initialZ = Math.sqrt(0.95 * 0.95 - initialSpacing * initialSpacing - initialY * initialY) + 0.016;

        this.leftEyeAnchor.position.set(-initialSpacing, initialY, initialZ);
        this.rightEyeAnchor.position.set(initialSpacing, initialY, initialZ);

        this.creatureGroup.add(this.leftEyeAnchor);
        this.creatureGroup.add(this.rightEyeAnchor);
    }

    createAuraParticles() {
        const particleCount = 60;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const tempColor = new THREE.Color();

        for (let i = 0; i < particleCount; i++) {
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);
            const r = 1.25 + Math.random() * 0.70; // Proportionate orbit around 0.95 orb

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            tempColor.setHSL(0.95 + Math.random() * 0.08, 0.9, 0.65);
            colors[i * 3] = tempColor.r;
            colors[i * 3 + 1] = tempColor.g;
            colors[i * 3 + 2] = tempColor.b;
        }

        const auraGeo = new THREE.BufferGeometry();
        auraGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        auraGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Create round glowing particle sprite
        const spriteCanvas = document.createElement('canvas');
        spriteCanvas.width = 32;
        spriteCanvas.height = 32;
        const ctx = spriteCanvas.getContext('2d');
        const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.35, 'rgba(255, 77, 148, 0.85)');
        grad.addColorStop(1, 'rgba(255, 0, 60, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(16, 16, 16, 0, Math.PI * 2);
        ctx.fill();

        const spriteTexture = new THREE.CanvasTexture(spriteCanvas);

        const auraMat = new THREE.PointsMaterial({
            size: 0.15,
            vertexColors: true,
            map: spriteTexture,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.auraParticles = new THREE.Points(auraGeo, auraMat);
        this.scene.add(this.auraParticles);
    }

    createShardPool() {
        // Pool of 3D faceted shards that blast outward upon click explosion
        const shardCount = 120;
        const shardGeo = new THREE.TetrahedronGeometry(0.11, 0);

        this.shardGroup = new THREE.Group();
        this.scene.add(this.shardGroup);

        for (let i = 0; i < shardCount; i++) {
            const shardMat = new THREE.MeshPhysicalMaterial({
                color: Math.random() > 0.4 ? this.colorBloodRed : 0xffffff,
                emissive: this.colorBloodRed,
                emissiveIntensity: 1.5,
                roughness: 0.1,
                metalness: 0.2
            });

            const shard = new THREE.Mesh(shardGeo, shardMat);
            shard.visible = false;
            shard.userData = {
                velocity: new THREE.Vector3(),
                rotVelocity: new THREE.Vector3(),
                scale: 0.6 + Math.random() * 0.7
            };
            this.shardGroup.add(shard);
            this.shardMeshes.push(shard);
        }
    }

    setupEventListeners() {
        // Mouse Move on window
        window.addEventListener('mousemove', (e) => {
            this.screenMouse.x = e.clientX;
            this.screenMouse.y = e.clientY;

            // Normalized Coordinates (-1 to 1)
            this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        }, { passive: true });

        // Touch Move on mobile
        window.addEventListener('touchmove', (e) => {
            if (e.touches && e.touches[0]) {
                const t = e.touches[0];
                this.screenMouse.x = t.clientX;
                this.screenMouse.y = t.clientY;
                this.targetMouse.x = (t.clientX / window.innerWidth) * 2 - 1;
                this.targetMouse.y = -(t.clientY / window.innerHeight) * 2 + 1;
            }
        }, { passive: true });

        // Resize
        window.addEventListener('resize', () => {
            if (this.isDisposed) return;
            const width = window.innerWidth;
            const height = window.innerHeight;

            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.0));
        });

        // Click on Creature / Screen -> DETONATE DOMAIN
        this.screen.addEventListener('click', (e) => {
            if (e.target.closest('#gatekeeperSkipBtn')) return;

            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
            const orbScreenRadius = Math.min(window.innerWidth, window.innerHeight) * 0.17;

            // Direct strike on the creature or agitated detonation
            if (dist <= orbScreenRadius || this.anger > 0.35) {
                this.triggerExplosion();
            } else {
                // If clicked far away, creature gets agitated and pulses towards cursor
                this.targetAnger = Math.min(1.0, this.targetAnger + 0.30);
                this.anger = Math.min(1.0, this.anger + 0.25);
                if (this.creatureGroup) {
                    this.creatureGroup.scale.set(1.08, 0.92, 1.08);
                    setTimeout(() => {
                        if (this.creatureGroup && !this.isExploding) {
                            this.creatureGroup.scale.set(1, 1, 1);
                        }
                    }, 150);
                }
            }
        });

        // Skip button bypass
        if (this.skipBtn) {
            this.skipBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.skipIntro();
            });
        }
    }

    updateProximity() {
        if (this.isExploding) return;

        // Euclidean Distance from screen center to mouse cursor
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const dx = this.screenMouse.x - centerX;
        const dy = this.screenMouse.y - centerY;
        const dist = Math.hypot(dx, dy);

        // Radius of activation (around 380px on desktop)
        const maxDist = Math.min(window.innerWidth, window.innerHeight) * 0.42;
        this.targetAnger = Math.max(0, Math.min(1, 1 - (dist / maxDist)));

        // Smooth Lerp for organic emotional response
        this.anger += (this.targetAnger - this.anger) * 0.085;

        // Update Mouse Lerp
        this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.12;
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.12;
    }

    updateAppearance(elapsedTime) {
        if (this.isExploding) return;

        const anger = this.anger;

        // 1. Dynamic Color Blending: Pink (0.0) -> Crimson Rage Red (1.0)
        const currentColor = new THREE.Color().lerpColors(this.colorPink, this.colorBloodRed, anger);
        const currentEmissive = new THREE.Color().lerpColors(this.colorHotPink, this.colorDarkRage, anger);

        if (this.orbMaterial) {
            this.orbMaterial.color.copy(currentColor);
            this.orbMaterial.emissive.copy(currentEmissive);
            this.orbMaterial.emissiveIntensity = 0.22 + anger * 1.1;
        }

        // Eye Color Transformation: Sleek Dark Obsidian -> Blazing Laser Red Rage
        if (this.eyeMaterial) {
            this.eyeMaterial.color.lerpColors(this.eyeCalmColor, this.eyeAngryColor, anger);
            this.eyeMaterial.emissive.lerpColors(this.eyeCalmEmissive, this.eyeAngryEmissive, anger);
            this.eyeMaterial.emissiveIntensity = 0.35 + anger * 3.6;
        }

        // Lighting intensity increases with fury
        if (this.keyLight) {
            this.keyLight.color.copy(currentColor);
            this.keyLight.intensity = 5.0 + anger * 8.5;
        }

        // 2. Creature Idle Breathing, Perspective Gaze & SUBTLE TENSION (No crazy vibration)
        if (this.creatureGroup) {
            const idleBob = Math.sin(elapsedTime * 2.0) * 0.07;

            // Tight, subtle tension hum when angry (drastically reduced from previous violent shake)
            let tensionX = 0;
            let tensionY = 0;
            if (anger > 0.12) {
                const tensionFreq = 28.0;
                const tensionAmp = anger * 0.009; // Max 0.009 units (~1-2 screen pixels)
                tensionX = Math.sin(elapsedTime * tensionFreq) * tensionAmp;
                tensionY = Math.cos(elapsedTime * (tensionFreq * 1.12)) * (tensionAmp * 0.65);
            }

            this.creatureGroup.position.x = tensionX;
            this.creatureGroup.position.y = idleBob + tensionY;

            // 3D Perspective Rotation towards mouse cursor
            this.creatureGroup.rotation.y = this.mouse.x * 0.35;
            this.creatureGroup.rotation.x = -this.mouse.y * 0.26;

            // Subtle tense clench when enraged
            const clenchY = 1.0 - anger * 0.05;
            const clenchXZ = 1.0 + anger * 0.025;
            this.creatureGroup.scale.set(clenchXZ, clenchY, clenchXZ);
        }

        // 3. COMICAL "AADHI CLOSED" (HALF-CLOSED) EYE TRACKING & BLINK
        // Periodic cute cartoon blink every 3.8s
        const blinkCycle = elapsedTime % 3.8;
        let blinkFactor = 1.0;
        if (blinkCycle > 3.62 && anger < 0.65) {
            const phase = (blinkCycle - 3.62) / 0.18;
            blinkFactor = Math.abs(Math.sin(phase * Math.PI - Math.PI / 2)) * 0.85 + 0.15;
        }

        // Funny side-eye squint: tracking horizontally squishes eyes into funny half-closed look
        const horizGaze = Math.abs(this.mouse.x);
        const calmHalfClosedY = THREE.MathUtils.lerp(0.60, 0.44, horizGaze) * blinkFactor;
        const calmSquashX = THREE.MathUtils.lerp(1.0, 1.15, horizGaze);
        const funnySideEyeTilt = this.mouse.x * 0.14; // Comical tilt in direction of gaze

        // 4. FURIOUS ANGER MORPHING (\  / INWARD V-SLANT & SHARP GLOWING SLIT)
        // Slit narrowing in furious anger
        const currentScaleY = THREE.MathUtils.lerp(calmHalfClosedY, 0.32, anger);
        const currentScaleX = THREE.MathUtils.lerp(calmSquashX, 1.30, anger);

        // Inward furious V-shape slant: \  /
        const angrySlantLeft = +0.58;   // +33.2 deg inward (\)
        const angrySlantRight = -0.58;  // -33.2 deg inward (/)

        const currentRotZLeft = THREE.MathUtils.lerp(funnySideEyeTilt, angrySlantLeft, anger);
        const currentRotZRight = THREE.MathUtils.lerp(funnySideEyeTilt, angrySlantRight, anger);

        if (this.leftEyeMesh && this.rightEyeMesh) {
            this.leftEyeMesh.scale.set(currentScaleX, currentScaleY, 1.0);
            this.rightEyeMesh.scale.set(currentScaleX, currentScaleY, 1.0);

            this.leftEyeMesh.rotation.z = currentRotZLeft;
            this.rightEyeMesh.rotation.z = currentRotZRight;
        }

        // 5. PROJECT EYE POSITION ONTO SPHERICAL SURFACE (R = 0.95)
        // Spacing narrows slightly when brow furrows in anger
        const baseSpacing = THREE.MathUtils.lerp(0.24, 0.185, anger);
        const browDip = anger * 0.035;

        const leftX = -baseSpacing + this.mouse.x * (0.09 * (1 - anger * 0.45));
        const rightX = baseSpacing + this.mouse.x * (0.09 * (1 - anger * 0.45));
        const eyeY = 0.05 + this.mouse.y * (0.07 * (1 - anger * 0.4)) - browDip;

        const R = 0.95;
        const leftZ = Math.sqrt(Math.max(0.05, R * R - leftX * leftX - eyeY * eyeY)) + 0.016;
        const rightZ = Math.sqrt(Math.max(0.05, R * R - rightX * rightX - eyeY * eyeY)) + 0.016;

        if (this.leftEyeAnchor && this.rightEyeAnchor) {
            this.leftEyeAnchor.position.set(leftX, eyeY, leftZ);
            this.rightEyeAnchor.position.set(rightX, eyeY, rightZ);

            // Align with surface normal on sphere
            this.leftEyeAnchor.rotation.y = -leftX * 0.65;
            this.leftEyeAnchor.rotation.x = eyeY * 0.65;
            this.rightEyeAnchor.rotation.y = -rightX * 0.65;
            this.rightEyeAnchor.rotation.x = eyeY * 0.65;
        }

        // 6. Orbiting Aura Particles acceleration
        if (this.auraParticles) {
            this.auraParticles.rotation.y += 0.008 + anger * 0.035;
            this.auraParticles.rotation.x += 0.004 + anger * 0.018;
        }

        // 7. DOM HUD Feedback
        if (this.threatFill) {
            this.threatFill.style.width = `${Math.min(100, Math.round(anger * 100))}%`;
        }

        if (this.instruction) {
            if (anger > 0.65) {
                this.instruction.classList.add('angry');
                this.instruction.innerHTML = '⚠️ CURSED AGITATION PEAK &bull; CLICK TO DETONATE DOMAIN';
            } else if (anger > 0.25) {
                this.instruction.classList.remove('angry');
                this.instruction.innerHTML = 'APPROACHING SENTIENT CORE &bull; EMOTION SHIFTING';
            } else {
                this.instruction.classList.remove('angry');
                this.instruction.innerHTML = 'MOVE CURSOR CLOSER &bull; DISTURB THE SENTIENT ORB';
            }
        }

        if (this.ambientGlow) {
            const glowR = Math.round(255);
            const glowG = Math.round(77 * (1 - anger));
            const glowB = Math.round(148 * (1 - anger) + 60 * anger);
            const glowAlpha = 0.24 + anger * 0.38;
            this.ambientGlow.style.background = `radial-gradient(circle, rgba(${glowR}, ${glowG}, ${glowB}, ${glowAlpha}) 0%, rgba(255, 0, 60, ${glowAlpha * 0.5}) 45%, transparent 70%)`;
            this.ambientGlow.style.transform = `translate(-50%, -50%) scale(${1 + anger * 0.28})`;
        }

        // 8. Sync Custom Blood Cursor Trail with rage
        const cursorTrail = document.getElementById('cursorTrail');
        if (cursorTrail && !this.isDisposed) {
            if (anger > 0.45) {
                cursorTrail.classList.add('active');
            } else {
                cursorTrail.classList.remove('active');
            }
        }
    }

    playShatterAudio() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            if (!this.audioCtx) this.audioCtx = new AudioContext();
            if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

            const now = this.audioCtx.currentTime;

            // 1. Sub Bass Drop Oscillator (320Hz -> 38Hz)
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(320, now);
            osc.frequency.exponentialRampToValueAtTime(38, now + 0.6);

            gain.gain.setValueAtTime(0.8, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.7);

            // 2. High-Frequency Glass/Cursed Shatter Noise Burst
            const bufferSize = this.audioCtx.sampleRate * 0.35;
            const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }

            const whiteNoise = this.audioCtx.createBufferSource();
            whiteNoise.buffer = noiseBuffer;

            const noiseFilter = this.audioCtx.createBiquadFilter();
            noiseFilter.type = 'highpass';
            noiseFilter.frequency.setValueAtTime(1200, now);
            noiseFilter.frequency.exponentialRampToValueAtTime(400, now + 0.3);

            const noiseGain = this.audioCtx.createGain();
            noiseGain.gain.setValueAtTime(0.65, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

            whiteNoise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(this.audioCtx.destination);
            whiteNoise.start(now);
            whiteNoise.stop(now + 0.4);
        } catch (e) {
            console.warn('[Gatekeeper Audio] WebAudio synth error:', e);
        }
    }

    triggerExplosion() {
        if (this.isExploding) return;
        this.isExploding = true;

        this.playShatterAudio();

        // 1. Implosion & Visual Blast Preparation
        if (this.orbMesh) this.orbMesh.visible = false;
        if (this.leftEyeAnchor) this.leftEyeAnchor.visible = false;
        if (this.rightEyeAnchor) this.rightEyeAnchor.visible = false;
        if (this.auraParticles) this.auraParticles.visible = false;

        // Activate 3D Shards
        this.shardMeshes.forEach(shard => {
            shard.visible = true;
            // Spawn around sphere surface of radius 0.95
            const dir = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            ).normalize();

            shard.position.copy(dir.clone().multiplyScalar(0.95));
            shard.userData.velocity.copy(dir.multiplyScalar(8.0 + Math.random() * 15.0));
            shard.userData.rotVelocity.set(
                (Math.random() - 0.5) * 12.0,
                (Math.random() - 0.5) * 12.0,
                (Math.random() - 0.5) * 12.0
            );
        });

        // 2. Fullscreen Shockwave & Flash DOM animation
        if (typeof gsap !== 'undefined') {
            if (this.flash) {
                gsap.fromTo(this.flash,
                    { opacity: 0.95 },
                    { opacity: 0, duration: 0.55, ease: 'power2.out' }
                );
            }

            if (this.shockwave) {
                gsap.fromTo(this.shockwave,
                    { scale: 0.2, opacity: 1 },
                    { scale: 4.5, opacity: 0, duration: 0.75, ease: 'power3.out' }
                );
            }

            // Dissolve the Gatekeeper Screen
            gsap.to(this.screen, {
                opacity: 0,
                duration: 0.75,
                delay: 0.28,
                ease: 'power3.out',
                onComplete: () => {
                    this.completeGatekeeperUnlock();
                }
            });
        } else {
            this.completeGatekeeperUnlock();
        }
    }

    skipIntro() {
        if (this.isExploding) return;
        this.isExploding = true;

        if (typeof gsap !== 'undefined') {
            gsap.to(this.screen, {
                opacity: 0,
                duration: 0.45,
                ease: 'power2.out',
                onComplete: () => {
                    this.completeGatekeeperUnlock();
                }
            });
        } else {
            this.completeGatekeeperUnlock();
        }
    }

    completeGatekeeperUnlock() {
        this.isDisposed = true;
        this.screen.classList.add('hidden');
        document.body.style.overflow = '';

        // Start smooth momentum physics scroll
        if (window.lenis) {
            window.lenis.start();
        }

        // Animate in the Portfolio Hero section elements
        if (typeof gsap !== 'undefined') {
            gsap.from('#hero .hero-stylish-name, #hero .hero-desc, #hero .hero-cta, #characterMaskStage', {
                opacity: 0,
                y: 35,
                duration: 0.9,
                stagger: 0.08,
                ease: 'power3.out'
            });
        }

        // Clean up WebGL resources
        setTimeout(() => {
            try {
                this.renderer.dispose();
                this.scene.clear();
            } catch (e) {}
        }, 1000);
    }

    animate = () => {
        if (this.isDisposed) return;
        requestAnimationFrame(this.animate);

        const delta = this.clock.getDelta();
        const elapsedTime = this.clock.getElapsedTime();

        if (!this.isExploding) {
            this.updateProximity();
            this.updateAppearance(elapsedTime);
        } else {
            // Animate 3D explosion shards
            this.shardMeshes.forEach(shard => {
                if (!shard.visible) return;
                shard.position.addScaledVector(shard.userData.velocity, delta);
                shard.rotation.x += shard.userData.rotVelocity.x * delta;
                shard.rotation.y += shard.userData.rotVelocity.y * delta;
                shard.rotation.z += shard.userData.rotVelocity.z * delta;

                // Air friction slowdown & scale decay
                shard.userData.velocity.multiplyScalar(0.965);
                shard.scale.multiplyScalar(0.975);
            });
        }

        this.renderer.render(this.scene, this.camera);
    };
}

// Instantiate upon DOM Load
document.addEventListener('DOMContentLoaded', () => {
    window.gatekeeper = new Gatekeeper3D();
});
