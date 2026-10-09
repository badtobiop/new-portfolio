// ==========================================================================
// SHADOW REALM // 3D SENTIENT CURSED GATEKEEPER PRELOADER
// Interactive 3D Cyber-Emoji Creature: Gaze Tracking, Idle Moods & Domain Shatter
// Inspired by Sentient Digital Visor Bot Aesthetics
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

        // Inactivity & Mood Cycle State
        this.lastMouseMoveTime = performance.now();
        this.isMouseMoving = false;
        this.alertTimer = 0;                    // Pop alert eye expansion when cursor starts moving
        this.idleMoodTimer = 0;
        this.idleMoodIndex = 0;                 // 0: Happy (^ ^), 1: Sleepy (u u), 2: Hearts (<3 <3), 3: Cyber Pulse

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

        // Three.js Core Components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();

        // 3D Creature Mesh References
        this.creatureGroup = null;
        this.orbMesh = null;
        this.orbMaterial = null;
        this.visorMesh = null;
        this.visorMaterial = null;
        this.leftEar = null;
        this.rightEar = null;
        this.leftEarRing = null;
        this.rightEarRing = null;
        this.earRingMat = null;
        this.topCrest = null;

        // Dynamic 2D Visor Screen Canvas & Texture
        this.faceCanvas = document.createElement('canvas');
        this.faceCanvas.width = 512;
        this.faceCanvas.height = 512;
        this.faceCtx = this.faceCanvas.getContext('2d');
        this.faceTexture = null;

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

        // 1. MAIN SPHERICAL HELMET / BODY (Radius 0.92, glossy cute finish)
        const orbGeo = new THREE.SphereGeometry(0.92, 48, 48);
        this.orbMaterial = new THREE.MeshPhysicalMaterial({
            color: this.colorPink,
            roughness: 0.18,
            metalness: 0.08,
            clearcoat: 0.95,
            clearcoatRoughness: 0.08,
            emissive: this.colorHotPink,
            emissiveIntensity: 0.22,
            reflectivity: 0.85
        });
        this.orbMesh = new THREE.Mesh(orbGeo, this.orbMaterial);
        this.creatureGroup.add(this.orbMesh);

        // 2. CURVED DIGITAL VISOR SCREEN (Centered on front face of sphere)
        // phi centered at +Z (PI/2), theta centered at equator (PI/2)
        const phiLength = 1.40; // ~80 degrees horizontally
        const phiStart = Math.PI * 0.5 - (phiLength / 2);
        const thetaLength = 0.65; // ~37 degrees vertically
        const thetaStart = Math.PI * 0.5 - (thetaLength / 2);

        const visorGeo = new THREE.SphereGeometry(0.926, 48, 32, phiStart, phiLength, thetaStart, thetaLength);

        this.faceTexture = new THREE.CanvasTexture(this.faceCanvas);
        this.faceTexture.colorSpace = THREE.SRGBColorSpace;

        this.visorMaterial = new THREE.MeshPhysicalMaterial({
            map: this.faceTexture,
            emissiveMap: this.faceTexture,
            emissive: new THREE.Color(0xffffff),
            emissiveIntensity: 1.15,
            transparent: true,
            roughness: 0.12,
            metalness: 0.15,
            clearcoat: 1.0,
            clearcoatRoughness: 0.05
        });
        this.visorMesh = new THREE.Mesh(visorGeo, this.visorMaterial);
        this.creatureGroup.add(this.visorMesh);

        // 3. CUTE ROBOTIC EAR PODS (Headphone capsules on left and right)
        const earGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.10, 24);
        earGeo.rotateZ(Math.PI / 2);

        const earMat = new THREE.MeshPhysicalMaterial({
            color: 0x140412,
            roughness: 0.22,
            metalness: 0.5,
            clearcoat: 0.85
        });

        this.leftEar = new THREE.Mesh(earGeo, earMat);
        this.leftEar.position.set(-0.91, 0.02, 0);
        this.creatureGroup.add(this.leftEar);

        this.rightEar = new THREE.Mesh(earGeo, earMat);
        this.rightEar.position.set(0.91, 0.02, 0);
        this.creatureGroup.add(this.rightEar);

        // Glowing Ear Accent Rings
        const earRingGeo = new THREE.TorusGeometry(0.11, 0.022, 16, 24);
        earRingGeo.rotateY(Math.PI / 2);

        this.earRingMat = new THREE.MeshBasicMaterial({
            color: this.colorHotPink
        });

        this.leftEarRing = new THREE.Mesh(earRingGeo, this.earRingMat);
        this.leftEarRing.position.set(-0.965, 0.02, 0);
        this.creatureGroup.add(this.leftEarRing);

        this.rightEarRing = new THREE.Mesh(earRingGeo, this.earRingMat);
        this.rightEarRing.position.set(0.965, 0.02, 0);
        this.creatureGroup.add(this.rightEarRing);

        // 4. TOP CREST INDICATOR (Small accent capsule on head crown)
        const crestGeo = new THREE.CapsuleGeometry(0.04, 0.22, 8, 16);
        crestGeo.rotateZ(Math.PI / 2);
        this.topCrest = new THREE.Mesh(crestGeo, this.earRingMat);
        this.topCrest.position.set(0, 0.90, 0.05);
        this.creatureGroup.add(this.topCrest);
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
            const r = 1.25 + Math.random() * 0.70; // Proportionate orbit around 0.92 orb

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
        // Mouse Move on window -> Wake up and look at cursor
        window.addEventListener('mousemove', (e) => {
            const now = performance.now();
            if (!this.isMouseMoving && (now - this.lastMouseMoveTime) > 1000) {
                this.alertTimer = 0.22; // Quick curious alert pop
            }
            this.lastMouseMoveTime = now;
            this.isMouseMoving = true;

            this.screenMouse.x = e.clientX;
            this.screenMouse.y = e.clientY;

            // Normalized Coordinates (-1 to 1)
            this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        }, { passive: true });

        // Touch Move on mobile
        window.addEventListener('touchmove', (e) => {
            const now = performance.now();
            if (!this.isMouseMoving) this.alertTimer = 0.22;
            this.lastMouseMoveTime = now;
            this.isMouseMoving = true;

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

    // ==========================================================================
    // DYNAMIC DIGITAL VISOR 2D RENDERER (512x512 Canvas)
    // Renders the exact stylized emoji expressions from the reference image:
    // - Proximity Anger: Top-Left furious inward slanted eyes + red pout dot
    // - Mouse Moving: Gaze tracking + funny "aadhi closed" side-eye squint
    // - Mouse Stopped: Idle cycle (Happy ^ ^, Sleepy u u, Heart eyes <3 <3, Cyber pulse)
    // ==========================================================================
    updateFaceCanvas(elapsedTime, delta) {
        const ctx = this.faceCtx;
        const cw = 512;
        const ch = 512;
        const cx = 256;
        const cy = 256;

        ctx.clearRect(0, 0, cw, ch);

        const anger = this.anger;
        const timeSinceMove = (performance.now() - this.lastMouseMoveTime) / 1000;
        const isIdle = (timeSinceMove > 1.2) && (anger < 0.18);

        if (this.alertTimer > 0) {
            this.alertTimer = Math.max(0, this.alertTimer - delta);
        }

        // 1. DRAW DARK VISOR SCREEN BASE (Rounded Stadium Shape)
        const vx = 76;
        const vy = 110;
        const vw = 360;
        const vh = 240;
        const vr = 78;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(vx, vy, vw, vh, vr);
        ctx.clip();

        // Visor Screen Background (Dark OLED gradient, red glow when angry)
        const grad = ctx.createRadialGradient(cx, cy, 30, cx, cy, 190);
        if (anger > 0.2) {
            const redCore = Math.round(55 * anger);
            grad.addColorStop(0, `rgb(${redCore + 25}, 0, 16)`);
            grad.addColorStop(0.7, `rgb(${redCore}, 0, 8)`);
            grad.addColorStop(1, '#050004');
        } else {
            grad.addColorStop(0, '#160418');
            grad.addColorStop(0.7, '#0a010c');
            grad.addColorStop(1, '#020003');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(vx, vy, vw, vh);

        // Curved Glass Reflection Highlight (Subtle glossy sheen)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.beginPath();
        ctx.ellipse(cx, vy + 40, 140, 26, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. EXPRESSIONS DRAWING
        if (anger > 0.18) {
            // ==============================================================
            // A. ANGRY EXPRESSION (Reference Image Top-Left)
            // Fierce inward-slanted curved wedges \  / + glowing red pout dot
            // ==============================================================
            const gazeX = this.mouse.x * 22;
            const gazeY = -this.mouse.y * 15;

            const eyeColor = '#ff0038';
            ctx.shadowColor = eyeColor;
            ctx.shadowBlur = 24;
            ctx.fillStyle = eyeColor;

            // Left Eye: Inward slanted wedge (\)
            const lx = cx - 68 + gazeX;
            const ly = cy - 10 + gazeY;

            ctx.beginPath();
            ctx.moveTo(lx - 42, ly - 22);
            ctx.lineTo(lx + 34, ly + 8);
            ctx.lineTo(lx + 20, ly + 32);
            ctx.bezierCurveTo(lx - 18, ly + 34, lx - 46, ly + 12, lx - 42, ly - 22);
            ctx.closePath();
            ctx.fill();

            // Right Eye: Inward slanted wedge (/)
            const rx = cx + 68 + gazeX;
            const ry = cy - 10 + gazeY;

            ctx.beginPath();
            ctx.moveTo(rx + 42, ry - 22);
            ctx.lineTo(rx - 34, ry + 8);
            ctx.lineTo(rx - 20, ry + 32);
            ctx.bezierCurveTo(rx + 18, ry + 34, rx + 46, ry + 12, rx + 42, ry - 22);
            ctx.closePath();
            ctx.fill();

            // Angry Glowing Red Pout Mouth (From top-left robot)
            ctx.beginPath();
            ctx.arc(cx + gazeX * 0.5, cy + 48 + gazeY * 0.5, 11, 0, Math.PI * 2);
            ctx.fill();

        } else if (isIdle) {
            // ==============================================================
            // B. IDLE EXPRESSIONS CYCLE (When cursor stops moving > 1.2s)
            // Cycles every 3.2s:
            // 0: Happy (^ ^ + smile), 1: Sleepy (u u), 2: Heart eyes (<3 <3), 3: Cyber Pulse (ECG)
            // ==============================================================
            const idleTime = timeSinceMove - 1.2;
            const moodIndex = Math.floor(idleTime / 3.4) % 4;

            const neonPink = '#ff4d94';
            ctx.shadowColor = neonPink;
            ctx.shadowBlur = 20;
            ctx.strokeStyle = neonPink;
            ctx.fillStyle = neonPink;

            if (moodIndex === 0) {
                // MOOD 0: HAPPY CHEEKY (^   ^ + smile)
                const bounceY = Math.sin(elapsedTime * 6) * 4;
                ctx.lineWidth = 13;
                ctx.lineCap = 'round';

                // Left happy arch
                ctx.beginPath();
                ctx.arc(cx - 68, cy - 6 + bounceY, 26, Math.PI * 0.85, Math.PI * 0.15, true);
                ctx.stroke();

                // Right happy arch
                ctx.beginPath();
                ctx.arc(cx + 68, cy - 6 + bounceY, 26, Math.PI * 0.85, Math.PI * 0.15, true);
                ctx.stroke();

                // Smile curve
                ctx.beginPath();
                ctx.arc(cx, cy + 34 + bounceY, 18, 0.15, Math.PI - 0.15, false);
                ctx.stroke();

                // Blushing cheeks
                ctx.fillStyle = 'rgba(255, 26, 107, 0.5)';
                ctx.beginPath();
                ctx.arc(cx - 110, cy + 18 + bounceY, 8, 0, Math.PI * 2);
                ctx.arc(cx + 110, cy + 18 + bounceY, 8, 0, Math.PI * 2);
                ctx.fill();

            } else if (moodIndex === 1) {
                // MOOD 1: SLEEPY / CHILLING (u   u)
                const breathY = Math.sin(elapsedTime * 2.2) * 3;
                ctx.lineWidth = 12;
                ctx.lineCap = 'round';

                // Left sleepy curved lid
                ctx.beginPath();
                ctx.arc(cx - 68, cy - 12 + breathY, 25, Math.PI * 0.15, Math.PI * 0.85, false);
                ctx.stroke();

                // Right sleepy curved lid
                ctx.beginPath();
                ctx.arc(cx + 68, cy - 12 + breathY, 25, Math.PI * 0.15, Math.PI * 0.85, false);
                ctx.stroke();

                // Relaxed small mouth
                ctx.beginPath();
                ctx.arc(cx, cy + 36 + breathY, 10, Math.PI * 0.2, Math.PI * 0.8, false);
                ctx.stroke();

            } else if (moodIndex === 2) {
                // MOOD 2: HEART EYES (<3   <3)
                const heartScale = 1.0 + Math.sin(elapsedTime * 5) * 0.12;

                const drawHeart = (hx, hy) => {
                    ctx.save();
                    ctx.translate(hx, hy);
                    ctx.scale(heartScale, heartScale);
                    ctx.beginPath();
                    ctx.moveTo(0, 12);
                    ctx.bezierCurveTo(-22, -10, -26, -30, 0, -32);
                    ctx.bezierCurveTo(26, -30, 22, -10, 0, 12);
                    ctx.fill();
                    ctx.restore();
                };

                drawHeart(cx - 68, cy - 8);
                drawHeart(cx + 68, cy - 8);

                // Sweet smile
                ctx.lineWidth = 11;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.arc(cx, cy + 32, 16, 0.2, Math.PI - 0.2, false);
                ctx.stroke();

            } else {
                // MOOD 3: CYBER PULSE LINE (Heartbeat ECG wave across visor)
                ctx.lineWidth = 9;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                const offset = (elapsedTime * 220) % 240;

                ctx.beginPath();
                ctx.moveTo(vx + 30, cy);
                ctx.lineTo(cx - 80 + offset * 0.2, cy);
                ctx.lineTo(cx - 45 + offset * 0.2, cy - 38);
                ctx.lineTo(cx - 15 + offset * 0.2, cy + 42);
                ctx.lineTo(cx + 20 + offset * 0.2, cy - 25);
                ctx.lineTo(cx + 45 + offset * 0.2, cy);
                ctx.lineTo(vx + vw - 30, cy);
                ctx.stroke();
            }

        } else {
            // ==============================================================
            // C. ACTIVE CURSOR TRACKING (Follows mouse cursor instantly)
            // With funny "aadhi closed" (half-closed) side-eye squint
            // ==============================================================
            const gazeX = this.mouse.x;
            const gazeY = -this.mouse.y;

            // Comical blink every 3.6s
            const blinkCycle = elapsedTime % 3.6;
            let blinkFactor = 1.0;
            if (blinkCycle > 3.44) {
                const phase = (blinkCycle - 3.44) / 0.16;
                blinkFactor = Math.abs(Math.sin(phase * Math.PI - Math.PI / 2)) * 0.85 + 0.15;
            }

            // Alert pop expansion when cursor starts moving
            let alertBoost = 0;
            if (this.alertTimer > 0) {
                alertBoost = (this.alertTimer / 0.22) * 16;
            }

            // Funny side-eye squint: tracking sideways squishes eyes into funny half-closed look
            const horizGaze = Math.abs(gazeX);
            const eyeHeight = Math.max(6, (52 - horizGaze * 22 + alertBoost) * blinkFactor);
            const eyeWidth = 36 + horizGaze * 10;
            const tilt = gazeX * 0.15; // Comical tilt in gaze direction

            const eyeColor = '#ff4d94';
            ctx.shadowColor = eyeColor;
            ctx.shadowBlur = 18;
            ctx.fillStyle = eyeColor;

            const drawTrackingEye = (baseX) => {
                const ex = baseX + gazeX * 36;
                const ey = cy - 6 + gazeY * 24;

                ctx.save();
                ctx.translate(ex, ey);
                ctx.rotate(tilt);
                ctx.beginPath();
                ctx.roundRect(-eyeWidth / 2, -eyeHeight / 2, eyeWidth, eyeHeight, eyeWidth / 2);
                ctx.fill();

                // Cute specular glint highlight inside eye
                if (eyeHeight > 24) {
                    ctx.fillStyle = '#ffffff';
                    ctx.shadowBlur = 0;
                    ctx.beginPath();
                    ctx.arc(eyeWidth * 0.15, -eyeHeight * 0.2, 5, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            };

            drawTrackingEye(cx - 72);
            drawTrackingEye(cx + 72);
        }

        // 3. VISOR GLOWING BORDER STROKE
        ctx.restore(); // Restore clip
        ctx.lineWidth = 3.5;
        if (anger > 0.2) {
            ctx.strokeStyle = `rgba(255, 0, 60, ${0.45 + anger * 0.45})`;
            ctx.shadowColor = '#ff0038';
            ctx.shadowBlur = 16;
        } else {
            ctx.strokeStyle = 'rgba(255, 77, 148, 0.38)';
            ctx.shadowColor = '#ff4d94';
            ctx.shadowBlur = 10;
        }
        ctx.beginPath();
        ctx.roundRect(vx, vy, vw, vh, vr);
        ctx.stroke();

        this.faceTexture.needsUpdate = true;
    }

    updateAppearance(elapsedTime, delta) {
        if (this.isExploding) return;

        const anger = this.anger;

        // 1. Dynamic Color Blending: Pink (0.0) -> Crimson Rage Red (1.0)
        const currentColor = new THREE.Color().lerpColors(this.colorPink, this.colorBloodRed, anger);
        const currentEmissive = new THREE.Color().lerpColors(this.colorHotPink, this.colorDarkRage, anger);

        if (this.orbMaterial) {
            this.orbMaterial.color.copy(currentColor);
            this.orbMaterial.emissive.copy(currentEmissive);
            this.orbMaterial.emissiveIntensity = 0.20 + anger * 1.1;
        }

        // Ear accents sync with rage
        if (this.earRingMat) {
            this.earRingMat.color.lerpColors(this.colorHotPink, this.colorBloodRed, anger);
        }

        // Lighting intensity increases with fury
        if (this.keyLight) {
            this.keyLight.color.copy(currentColor);
            this.keyLight.intensity = 5.0 + anger * 8.5;
        }

        // 2. Creature Idle Breathing, Perspective Gaze & SUBTLE TENSION (No violent shake)
        if (this.creatureGroup) {
            const idleBob = Math.sin(elapsedTime * 2.0) * 0.07;

            // Tight, subtle tension hum when angry (drastically reduced from previous violent shake)
            let tensionX = 0;
            let tensionY = 0;
            if (anger > 0.12) {
                const tensionFreq = 28.0;
                const tensionAmp = anger * 0.008; // Subtle hum (~1px)
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

        // 3. Render Dynamic Digital Visor Screen
        this.updateFaceCanvas(elapsedTime, delta);

        // 4. Orbiting Aura Particles acceleration
        if (this.auraParticles) {
            this.auraParticles.rotation.y += 0.008 + anger * 0.035;
            this.auraParticles.rotation.x += 0.004 + anger * 0.018;
        }

        // 5. DOM HUD Feedback
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

        // 6. Sync Custom Blood Cursor Trail with rage
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
        if (this.visorMesh) this.visorMesh.visible = false;
        if (this.leftEar) this.leftEar.visible = false;
        if (this.rightEar) this.rightEar.visible = false;
        if (this.leftEarRing) this.leftEarRing.visible = false;
        if (this.rightEarRing) this.rightEarRing.visible = false;
        if (this.topCrest) this.topCrest.visible = false;
        if (this.auraParticles) this.auraParticles.visible = false;

        // Activate 3D Shards
        this.shardMeshes.forEach(shard => {
            shard.visible = true;
            // Spawn around sphere surface of radius 0.92
            const dir = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            ).normalize();

            shard.position.copy(dir.clone().multiplyScalar(0.92));
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
            this.updateAppearance(elapsedTime, delta);
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
