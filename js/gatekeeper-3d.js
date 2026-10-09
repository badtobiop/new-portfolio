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
        this.colorBloodRed = new THREE.Color(0xff0038);  // Menacing Cursed Blood Red
        this.colorDarkRage = new THREE.Color(0x800014);  // Deep Abyssal Crimson

        // Three.js Core Components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();

        // 3D Creature Mesh References
        this.creatureGroup = null;
        this.orbMesh = null;
        this.orbMaterial = null;
        this.leftEyeGroup = null;
        this.rightEyeGroup = null;
        this.leftPupil = null;
        this.rightPupil = null;
        this.leftEyelidUpper = null;
        this.rightEyelidUpper = null;
        this.leftEyelidLower = null;
        this.rightEyelidLower = null;

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
        this.camera.position.set(0, 0, 7.8);

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
        this.keyLight = new THREE.PointLight(0xff4d94, 6.0, 30);
        this.keyLight.position.set(3.2, 3.0, 5.0);
        this.scene.add(this.keyLight);

        // Fill Light (Crisp specular sheen)
        this.fillLight = new THREE.DirectionalLight(0xffffff, 1.4);
        this.fillLight.position.set(-3.5, 2.5, 4.0);
        this.scene.add(this.fillLight);

        // Back Rim Light (Glowing halo around orb edge)
        this.rimLight = new THREE.PointLight(0xff1493, 7.5, 20);
        this.rimLight.position.set(0, -1.0, -3.2);
        this.scene.add(this.rimLight);
    }

    createCreature() {
        this.creatureGroup = new THREE.Group();
        this.scene.add(this.creatureGroup);

        // 1. MAIN SPHERICAL BODY (Glossy, translucent physical sphere)
        const orbGeo = new THREE.SphereGeometry(1.65, 64, 64);
        this.orbMaterial = new THREE.MeshPhysicalMaterial({
            color: this.colorPink,
            roughness: 0.22,
            metalness: 0.1,
            clearcoat: 0.9,
            clearcoatRoughness: 0.12,
            emissive: this.colorHotPink,
            emissiveIntensity: 0.25,
            reflectivity: 0.85
        });
        this.orbMesh = new THREE.Mesh(orbGeo, this.orbMaterial);
        this.creatureGroup.add(this.orbMesh);

        // 2. THE EYES (No mouth, just two striking sentient 3D eyes)
        const eyeOffset = 0.58;
        const eyeHeight = 0.22;
        const eyeForward = 1.46;

        this.leftEyeGroup = this.createSingleEye(-eyeOffset, eyeHeight, eyeForward, true);
        this.rightEyeGroup = this.createSingleEye(eyeOffset, eyeHeight, eyeForward, false);

        this.creatureGroup.add(this.leftEyeGroup);
        this.creatureGroup.add(this.rightEyeGroup);
    }

    createSingleEye(x, y, z, isLeft) {
        const eyeAnchor = new THREE.Group();
        eyeAnchor.position.set(x, y, z);

        // Sclera (Gleaming white eye bed)
        const scleraGeo = new THREE.SphereGeometry(0.38, 32, 32);
        scleraGeo.scale(1.0, 1.25, 0.45);
        const scleraMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.15,
            metalness: 0.05,
            emissive: 0xffffff,
            emissiveIntensity: 0.35
        });
        const sclera = new THREE.Mesh(scleraGeo, scleraMat);
        eyeAnchor.add(sclera);

        // Iris & Pupil Group (Tracks mouse movement in eye socket)
        const pupilGroup = new THREE.Group();
        pupilGroup.position.set(0, 0, 0.18);

        // Dark obsidian iris
        const irisGeo = new THREE.SphereGeometry(0.24, 32, 32);
        irisGeo.scale(1.0, 1.15, 0.45);
        const irisMat = new THREE.MeshPhysicalMaterial({
            color: 0x050103,
            roughness: 0.1,
            metalness: 0.2,
            clearcoat: 1.0,
            emissive: 0xff0044,
            emissiveIntensity: 1.2
        });
        const iris = new THREE.Mesh(irisGeo, irisMat);
        pupilGroup.add(iris);

        // Glowing center core (Cursed pupil slit/ring)
        const coreGeo = new THREE.SphereGeometry(0.12, 24, 24);
        coreGeo.scale(0.85, 1.1, 0.4);
        const coreMat = new THREE.MeshBasicMaterial({
            color: 0xffffff
        });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.set(0, 0, 0.08);
        pupilGroup.add(core);

        // Anime glint / specular reflection dot (Top right of pupil)
        const glintGeo = new THREE.SphereGeometry(0.05, 16, 16);
        const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const glint = new THREE.Mesh(glintGeo, glintMat);
        glint.position.set(0.08, 0.08, 0.15);
        pupilGroup.add(glint);

        eyeAnchor.add(pupilGroup);
        if (isLeft) this.leftPupil = pupilGroup;
        else this.rightPupil = pupilGroup;

        // 3. Dynamic Eyelids (Slant and close as creature gets angry!)
        // Upper Eyelid (Curved protective hood that tilts to form angry V-shape)
        const eyelidGeo = new THREE.SphereGeometry(0.42, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.52);
        const eyelidMat = new THREE.MeshPhysicalMaterial({
            color: this.colorPink,
            roughness: 0.22,
            metalness: 0.1,
            clearcoat: 0.9,
            emissive: this.colorHotPink,
            emissiveIntensity: 0.25
        });

        const upperLid = new THREE.Mesh(eyelidGeo, eyelidMat);
        upperLid.position.set(0, 0.05, 0.02);
        upperLid.rotation.x = -Math.PI * 0.46; // Wide open and innocent at rest
        eyeAnchor.add(upperLid);

        // Lower Eyelid (Subtly raises to squint during rage)
        const lowerLid = new THREE.Mesh(eyelidGeo, eyelidMat);
        lowerLid.position.set(0, -0.05, 0.02);
        lowerLid.rotation.x = Math.PI * 0.46; // Wide open downwards at rest
        lowerLid.rotation.z = Math.PI;
        eyeAnchor.add(lowerLid);

        if (isLeft) {
            this.leftEyelidUpper = upperLid;
            this.leftEyelidLower = lowerLid;
            this.leftEyelidMat = eyelidMat;
        } else {
            this.rightEyelidUpper = upperLid;
            this.rightEyelidLower = lowerLid;
            this.rightEyelidMat = eyelidMat;
        }

        return eyeAnchor;
    }

    createAuraParticles() {
        const particleCount = 75;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const tempColor = new THREE.Color();

        for (let i = 0; i < particleCount; i++) {
            // Orbital distribution around the sphere
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);
            const r = 2.0 + Math.random() * 1.2;

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            // Sakura Pink to Radiant Ruby
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
            size: 0.22,
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
        const shardCount = 140;
        const shardGeo = new THREE.TetrahedronGeometry(0.18, 0);

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
                scale: 0.6 + Math.random() * 0.8
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
            const orbScreenRadius = Math.min(window.innerWidth, window.innerHeight) * 0.26;

            // Direct strike on the creature or agitated detonation
            if (dist <= orbScreenRadius || this.anger > 0.35) {
                this.triggerExplosion();
            } else {
                // If clicked far away, creature gets agitated and jags towards cursor!
                this.targetAnger = Math.min(1.0, this.targetAnger + 0.35);
                this.anger = Math.min(1.0, this.anger + 0.3);
                if (this.creatureGroup) {
                    this.creatureGroup.scale.set(1.12, 0.88, 1.12);
                    setTimeout(() => {
                        if (this.creatureGroup && !this.isExploding) {
                            this.creatureGroup.scale.set(1, 1, 1);
                        }
                    }, 160);
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

        // Radius of activation (around 420px on desktop)
        const maxDist = Math.min(window.innerWidth, window.innerHeight) * 0.45;
        this.targetAnger = Math.max(0, Math.min(1, 1 - (dist / maxDist)));

        // Smooth Lerp for organic breathing response
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
            this.orbMaterial.emissiveIntensity = 0.25 + anger * 0.95;
        }

        if (this.leftEyelidMat && this.rightEyelidMat) {
            this.leftEyelidMat.color.copy(currentColor);
            this.leftEyelidMat.emissive.copy(currentEmissive);
            this.rightEyelidMat.color.copy(currentColor);
            this.rightEyelidMat.emissive.copy(currentEmissive);
        }

        // Lighting intensity increases with fury
        if (this.keyLight) {
            this.keyLight.color.copy(currentColor);
            this.keyLight.intensity = 5.5 + anger * 10.0;
        }

        // 2. Head Tilt & Gaze Tracking towards mouse
        if (this.creatureGroup) {
            const idleBob = Math.sin(elapsedTime * 2.2) * 0.12;

            // When anger rises, creature trembles furiously (rage jitter)
            let jitterX = 0;
            let jitterY = 0;
            if (anger > 0.22) {
                const jitterAmp = Math.pow(anger, 2.2) * 0.14;
                jitterX = (Math.random() - 0.5) * jitterAmp;
                jitterY = (Math.random() - 0.5) * jitterAmp;
            }

            this.creatureGroup.position.x = jitterX;
            this.creatureGroup.position.y = idleBob + jitterY;

            // 3D Perspective Rotation towards mouse cursor
            this.creatureGroup.rotation.y = this.mouse.x * 0.48;
            this.creatureGroup.rotation.x = -this.mouse.y * 0.38;
        }

        // 3. Eye Pupil Tracking within eye sockets
        const pupilX = this.mouse.x * 0.13;
        const pupilY = this.mouse.y * 0.11;

        if (this.leftPupil && this.rightPupil) {
            this.leftPupil.position.x = pupilX;
            this.leftPupil.position.y = pupilY;
            this.rightPupil.position.x = pupilX;
            this.rightPupil.position.y = pupilY;
        }

        // 4. Expression Morphing (Cute Round Eyes -> Angry Slanted Demonic V-Shape Glare)
        if (this.leftEyelidUpper && this.rightEyelidUpper) {
            // Upper eyelids rotate downwards over eye
            const upperLidRotationX = THREE.MathUtils.lerp(-Math.PI * 0.46, -Math.PI * 0.12, anger);
            this.leftEyelidUpper.rotation.x = upperLidRotationX;
            this.rightEyelidUpper.rotation.x = upperLidRotationX;

            // Tilt inward at an aggressive V-angle!
            const tiltAngle = anger * 0.45; // ~26 degrees inwards
            this.leftEyelidUpper.rotation.z = tiltAngle;
            this.rightEyelidUpper.rotation.z = -tiltAngle;

            // Lower eyelids raise slightly (squinting focus)
            const lowerLidRotationX = THREE.MathUtils.lerp(Math.PI * 0.46, Math.PI * 0.28, anger);
            this.leftEyelidLower.rotation.x = lowerLidRotationX;
            this.rightEyelidLower.rotation.x = lowerLidRotationX;
            this.leftEyelidLower.rotation.z = Math.PI - (tiltAngle * 0.5);
            this.rightEyelidLower.rotation.z = Math.PI + (tiltAngle * 0.5);
        }

        // 5. Orbiting Aura Particles acceleration
        if (this.auraParticles) {
            this.auraParticles.rotation.y += 0.008 + anger * 0.04;
            this.auraParticles.rotation.x += 0.004 + anger * 0.02;
        }

        // 6. DOM HUD Feedback
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
            const glowAlpha = 0.25 + anger * 0.4;
            this.ambientGlow.style.background = `radial-gradient(circle, rgba(${glowR}, ${glowG}, ${glowB}, ${glowAlpha}) 0%, rgba(255, 0, 60, ${glowAlpha * 0.5}) 45%, transparent 70%)`;
            this.ambientGlow.style.transform = `translate(-50%, -50%) scale(${1 + anger * 0.35})`;
        }

        // 7. Sync Custom Blood Cursor Trail with rage
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
        if (this.leftEyeGroup) this.leftEyeGroup.visible = false;
        if (this.rightEyeGroup) this.rightEyeGroup.visible = false;
        if (this.auraParticles) this.auraParticles.visible = false;

        // Activate 3D Shards
        const origin = new THREE.Vector3(0, 0, 0);
        this.shardMeshes.forEach(shard => {
            shard.visible = true;
            // Spawn around sphere surface
            const dir = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            ).normalize();

            shard.position.copy(dir.clone().multiplyScalar(1.65));
            shard.userData.velocity.copy(dir.multiplyScalar(9.0 + Math.random() * 16.0));
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
