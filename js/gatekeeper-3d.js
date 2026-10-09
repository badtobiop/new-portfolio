// ==========================================================================
// SHADOW REALM // 2D SENTIENT CURSED GATEKEEPER PRELOADER
// Interactive 2D Compact Emoji Creature: Cursor Tracking, Proximity Anger & Shatter
// Pure 2D Canvas: Compact Pink Circle, Eyes Only, No Mouth, No Borders
// Author: Utkarsh Dhakane (badtobiop) & Antigravity Pair-Programmer
// ==========================================================================

class Gatekeeper2D {
    constructor() {
        this.screen = document.getElementById('gatekeeper-screen');
        this.canvas = document.getElementById('gatekeeper-canvas');
        if (!this.screen || !this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) return;

        // Interactive Tracking State
        this.mouse = { x: 0, y: 0 };           // Normalized (-1 to 1)
        this.targetMouse = { x: 0, y: 0 };
        this.screenMouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.anger = 0;                         // 0.0 (Cute Rose Pink) -> 1.0 (Blazing Blood Red Rage)
        this.targetAnger = 0;
        this.isExploding = false;
        this.isDisposed = false;

        // Inactivity & Mood State
        this.lastMouseMoveTime = performance.now();
        this.isMouseMoving = false;
        this.alertTimer = 0;                    // Pop alert eye expansion when cursor starts moving

        // 2D Circle Size & Physics
        this.circleRadius = 56;                 // Compact cute circle (112px diameter)
        this.circlePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

        // 2D Explosion Particle Pool
        this.particles = [];

        // DOM HUD Handles
        this.threatFill = document.getElementById('gatekeeperThreatFill');
        this.instruction = document.getElementById('gatekeeperInstruction');
        this.ambientGlow = document.getElementById('gatekeeperAmbientGlow');
        this.skipBtn = document.getElementById('gatekeeperSkipBtn');
        this.shockwave = document.getElementById('gatekeeperShockwave');
        this.flash = document.getElementById('gatekeeperFlash');

        // Timing
        this.lastTime = performance.now();
        this.elapsedTime = 0;

        // Audio Context
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

        this.handleResize();
        this.setupEventListeners();
        this.animate();
    }

    handleResize = () => {
        if (this.isDisposed) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2.0);
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.canvas.style.width = `${window.innerWidth}px`;
        this.canvas.style.height = `${window.innerHeight}px`;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);

        this.circlePos.x = window.innerWidth / 2;
        this.circlePos.y = window.innerHeight / 2;
    };

    setupEventListeners() {
        // Mouse Move -> Wake up and look at cursor
        window.addEventListener('mousemove', (e) => {
            const now = performance.now();
            if (!this.isMouseMoving && (now - this.lastMouseMoveTime) > 1000) {
                this.alertTimer = 0.22; // Pop alert when mouse moves again
            }
            this.lastMouseMoveTime = now;
            this.isMouseMoving = true;

            this.screenMouse.x = e.clientX;
            this.screenMouse.y = e.clientY;

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

        window.addEventListener('resize', this.handleResize);

        // Click on Circle / Screen -> DETONATE DOMAIN
        this.screen.addEventListener('click', (e) => {
            if (e.target.closest('#gatekeeperSkipBtn')) return;

            const dx = e.clientX - this.circlePos.x;
            const dy = e.clientY - this.circlePos.y;
            const dist = Math.hypot(dx, dy);

            // Click within circle or when angry
            if (dist <= (this.circleRadius * 1.5) || this.anger > 0.35) {
                this.triggerExplosion();
            } else {
                // If clicked outside, creature gets slightly agitated
                this.targetAnger = Math.min(1.0, this.targetAnger + 0.30);
                this.anger = Math.min(1.0, this.anger + 0.25);
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

        const dx = this.screenMouse.x - this.circlePos.x;
        const dy = this.screenMouse.y - this.circlePos.y;
        const dist = Math.hypot(dx, dy);

        // Activation distance around 320px
        const maxDist = Math.min(window.innerWidth, window.innerHeight) * 0.38;
        this.targetAnger = Math.max(0, Math.min(1, 1 - (dist / maxDist)));

        // Smooth Lerp for organic breathing response
        this.anger += (this.targetAnger - this.anger) * 0.085;

        // Smooth Mouse Lerp
        this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.14;
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.14;
    }

    // ==========================================================================
    // 2D EYES RENDERING (SOLID FILL ONLY, NO MOUTH, NO BORDERS)
    // ==========================================================================
    drawEyes(ctx, cx, cy, anger, timeSinceMove, elapsedTime) {
        const isAngry = anger > 0.16;
        const isIdle = !isAngry && (timeSinceMove > 1.2);

        // Base eye spacing inside 112px circle
        const baseSpacing = 18;
        const eyeBaseY = cy - 2;

        if (isAngry) {
            // ==============================================================
            // 1. ANGRY EYES (Reference Image Top-Left)
            // Solid inward-slanted wedges \  / (NO BORDER, NO MOUTH)
            // ==============================================================
            const gazeX = this.mouse.x * 6;
            const gazeY = -this.mouse.y * 4;

            const lx = cx - baseSpacing + gazeX;
            const rx = cx + baseSpacing + gazeX;
            const ly = eyeBaseY + gazeY;

            ctx.fillStyle = '#0a0106'; // Solid pitch dark carbon
            ctx.shadowColor = '#ff0038';
            ctx.shadowBlur = 10 * anger;

            // Left Eye: Inward slanted wedge (\)
            ctx.beginPath();
            ctx.moveTo(lx - 13, ly - 9);
            ctx.lineTo(lx + 11, ly + 2);
            ctx.lineTo(lx + 7, ly + 11);
            ctx.bezierCurveTo(lx - 5, ly + 12, lx - 15, ly + 3, lx - 13, ly - 9);
            ctx.closePath();
            ctx.fill();

            // Right Eye: Inward slanted wedge (/)
            ctx.beginPath();
            ctx.moveTo(rx + 13, ly - 9);
            ctx.lineTo(rx - 11, ly + 2);
            ctx.lineTo(rx - 7, ly + 11);
            ctx.bezierCurveTo(rx + 5, ly + 12, rx + 15, ly + 3, rx + 13, ly - 9);
            ctx.closePath();
            ctx.fill();

        } else if (isIdle) {
            // ==============================================================
            // 2. IDLE EXPRESSIONS (When cursor stops > 1.2s, NO MOUTH, NO BORDER)
            // Cycles every 3.2s: Happy (^ ^), Sleepy (u u), Heart eyes (<3 <3), Side-glance
            // ==============================================================
            const idleTime = timeSinceMove - 1.2;
            const moodIndex = Math.floor(idleTime / 3.2) % 4;

            ctx.fillStyle = '#0f020a';
            ctx.strokeStyle = '#0f020a';
            ctx.shadowColor = '#ff4d94';
            ctx.shadowBlur = 6;

            const lx = cx - baseSpacing;
            const rx = cx + baseSpacing;

            if (moodIndex === 0) {
                // MOOD 0: HAPPY CHEEKY (^   ^)
                const bounceY = Math.sin(elapsedTime * 6) * 2.5;
                ctx.lineWidth = 5.5;
                ctx.lineCap = 'round';

                // Left happy arch
                ctx.beginPath();
                ctx.arc(lx, eyeBaseY - 2 + bounceY, 10, Math.PI * 0.85, Math.PI * 0.15, true);
                ctx.stroke();

                // Right happy arch
                ctx.beginPath();
                ctx.arc(rx, eyeBaseY - 2 + bounceY, 10, Math.PI * 0.85, Math.PI * 0.15, true);
                ctx.stroke();

                // Cute subtle blush dots on cheeks (no mouth!)
                ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
                ctx.shadowBlur = 0;
                ctx.beginPath();
                ctx.arc(lx - 12, eyeBaseY + 9 + bounceY, 3, 0, Math.PI * 2);
                ctx.arc(rx + 12, eyeBaseY + 9 + bounceY, 3, 0, Math.PI * 2);
                ctx.fill();

            } else if (moodIndex === 1) {
                // MOOD 1: SLEEPY / CHILL (u   u)
                const breathY = Math.sin(elapsedTime * 2.2) * 2;
                ctx.lineWidth = 5;
                ctx.lineCap = 'round';

                // Left sleepy arch
                ctx.beginPath();
                ctx.arc(lx, eyeBaseY - 4 + breathY, 9, Math.PI * 0.15, Math.PI * 0.85, false);
                ctx.stroke();

                // Right sleepy arch
                ctx.beginPath();
                ctx.arc(rx, eyeBaseY - 4 + breathY, 9, Math.PI * 0.15, Math.PI * 0.85, false);
                ctx.stroke();

            } else if (moodIndex === 2) {
                // MOOD 2: HEART EYES (<3   <3)
                const heartScale = 0.58 + Math.sin(elapsedTime * 5) * 0.06;

                const drawHeart = (hx, hy) => {
                    ctx.save();
                    ctx.translate(hx, hy);
                    ctx.scale(heartScale, heartScale);
                    ctx.beginPath();
                    ctx.moveTo(0, 8);
                    ctx.bezierCurveTo(-14, -6, -18, -20, 0, -22);
                    ctx.bezierCurveTo(18, -20, 14, -6, 0, 8);
                    ctx.fill();
                    ctx.restore();
                };

                drawHeart(lx, eyeBaseY - 2);
                drawHeart(rx, eyeBaseY - 2);

            } else {
                // MOOD 3: FUNNY SIDE-GLANCE (¬   ¬)
                const lookDirection = Math.sin(elapsedTime * 1.5) > 0 ? 1 : -1;
                const glx = lx + lookDirection * 7;
                const grx = rx + lookDirection * 7;

                ctx.beginPath();
                ctx.roundRect(glx - 6, eyeBaseY - 5, 12, 10, 4);
                ctx.roundRect(grx - 6, eyeBaseY - 5, 12, 10, 4);
                ctx.fill();
            }

        } else {
            // ==============================================================
            // 3. ACTIVE CURSOR TRACKING (Follows mouse instantly)
            // With funny "aadhi closed" (half-closed) side-eye squint
            // NO BORDER, NO MOUTH
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

            // Alert pop expansion when cursor starts moving again
            let alertBoost = 0;
            if (this.alertTimer > 0) {
                alertBoost = (this.alertTimer / 0.22) * 6;
            }

            // Funny side-eye squint: tracking horizontally squishes eyes into funny half-closed look
            const horizGaze = Math.abs(gazeX);
            const eyeHeight = Math.max(3, (21 - horizGaze * 9 + alertBoost) * blinkFactor);
            const eyeWidth = 12 + horizGaze * 4;
            const tilt = gazeX * 0.16; // Comical tilt in gaze direction

            ctx.fillStyle = '#0f020a'; // Solid dark carbon
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;

            const drawTrackingEye = (baseX) => {
                const ex = baseX + gazeX * 11;
                const ey = eyeBaseY + gazeY * 8;

                ctx.save();
                ctx.translate(ex, ey);
                ctx.rotate(tilt);
                ctx.beginPath();
                ctx.roundRect(-eyeWidth / 2, -eyeHeight / 2, eyeWidth, eyeHeight, eyeWidth / 2);
                ctx.fill();

                // Cute white anime glint highlight dot (top-right of eye)
                if (eyeHeight > 10) {
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(eyeWidth * 0.18, -eyeHeight * 0.22, 1.8, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            };

            drawTrackingEye(cx - baseSpacing);
            drawTrackingEye(cx + baseSpacing);
        }
    }

    draw(elapsedTime) {
        const ctx = this.ctx;
        const width = window.innerWidth;
        const height = window.innerHeight;

        ctx.clearRect(0, 0, width, height);

        if (this.isExploding) {
            // Render 2D particles
            this.particles.forEach(p => {
                if (p.alpha <= 0) return;
                ctx.save();
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.color;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius * p.scale, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
            return;
        }

        const anger = this.anger;
        const timeSinceMove = (performance.now() - this.lastMouseMoveTime) / 1000;

        // Subtle vertical idle breathing bob
        const idleBob = Math.sin(elapsedTime * 2.2) * 3.5;

        // Subtle tight tension hum when angry (NO violent shaking)
        let tensionX = 0;
        let tensionY = 0;
        if (anger > 0.12) {
            const freq = 30;
            const amp = anger * 1.5; // Max 1.5px subtle tension
            tensionX = Math.sin(elapsedTime * freq) * amp;
            tensionY = Math.cos(elapsedTime * (freq * 1.15)) * (amp * 0.7);
        }

        const cx = this.circlePos.x + tensionX;
        const cy = this.circlePos.y + idleBob + tensionY;
        const r = this.circleRadius;

        // 1. DRAW 2D COMPACT CIRCLE (Soft Pink -> Blood Red on anger)
        const pinkGrad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.25, 4, cx, cy, r);
        if (anger > 0.05) {
            // Blend from soft pink to menacing blood red
            const rVal = 255;
            const gVal = Math.round(77 * (1 - anger) + 10 * anger);
            const bVal = Math.round(148 * (1 - anger) + 24 * anger);
            const edgeR = Math.round(255 * (1 - anger) + 160 * anger);
            const edgeG = Math.round(26 * (1 - anger));
            const edgeB = Math.round(107 * (1 - anger));

            pinkGrad.addColorStop(0, `rgb(${rVal}, ${gVal}, ${bVal})`);
            pinkGrad.addColorStop(0.75, `rgb(${edgeR}, ${edgeG}, ${edgeB})`);
            pinkGrad.addColorStop(1, anger > 0.4 ? '#8a0014' : '#d60a5e');
        } else {
            // Radiant cute rose pink
            pinkGrad.addColorStop(0, '#ff66a8');
            pinkGrad.addColorStop(0.75, '#ff2e82');
            pinkGrad.addColorStop(1, '#e6126c');
        }

        // Soft Circle Shadow Glow
        ctx.save();
        ctx.shadowColor = anger > 0.25 ? '#ff0038' : '#ff4d94';
        ctx.shadowBlur = 16 + anger * 14;
        ctx.fillStyle = pinkGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Subtle 2D Glossy Sticker Glint (Top-Left of circle)
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.26)';
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.35, cy - r * 0.38, r * 0.38, r * 0.20, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 2. DRAW EYES ONLY (NO MOUTH, NO BORDERS!)
        this.drawEyes(ctx, cx, cy, anger, timeSinceMove, elapsedTime);

        // 3. DOM HUD FEEDBACK
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
            const glowAlpha = 0.22 + anger * 0.35;
            this.ambientGlow.style.background = `radial-gradient(circle, rgba(${glowR}, ${glowG}, ${glowB}, ${glowAlpha}) 0%, rgba(255, 0, 60, ${glowAlpha * 0.5}) 45%, transparent 70%)`;
            this.ambientGlow.style.transform = `translate(-50%, -50%) scale(${1 + anger * 0.25})`;
        }

        // 4. Sync Custom Blood Cursor Trail with rage
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

        // Spawn 2D Explosion Particles
        const count = 75;
        this.particles = [];
        const cx = this.circlePos.x;
        const cy = this.circlePos.y;

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 4 + Math.random() * 12;
            this.particles.push({
                x: cx + Math.cos(angle) * (Math.random() * this.circleRadius),
                y: cy + Math.sin(angle) * (Math.random() * this.circleRadius),
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 2.5 + Math.random() * 5.0,
                scale: 1.0,
                alpha: 1.0,
                color: Math.random() > 0.4 ? '#ff0038' : (Math.random() > 0.5 ? '#ff4d94' : '#ffffff'),
                friction: 0.94 + Math.random() * 0.03
            });
        }

        // Fullscreen Shockwave & Flash DOM animation
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
    }

    animate = () => {
        if (this.isDisposed) return;
        requestAnimationFrame(this.animate);

        const now = performance.now();
        const delta = Math.min((now - this.lastTime) / 1000, 0.1);
        this.lastTime = now;
        this.elapsedTime += delta;

        if (!this.isExploding) {
            this.updateProximity();
            if (this.alertTimer > 0) {
                this.alertTimer = Math.max(0, this.alertTimer - delta);
            }
        } else {
            // Animate particles
            this.particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= p.friction;
                p.vy *= p.friction;
                p.alpha = Math.max(0, p.alpha - delta * 1.4);
                p.scale = Math.max(0, p.scale - delta * 0.5);
            });
        }

        this.draw(this.elapsedTime);
    };
}

// Instantiate upon DOM Load
document.addEventListener('DOMContentLoaded', () => {
    window.gatekeeper = new Gatekeeper2D();
});
