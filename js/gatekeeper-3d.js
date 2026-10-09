// ==========================================================================
// SHADOW REALM // 2D SENTIENT GATEKEEPER & FLOATING MASCOT COMPANION
// - Preloader: Compact 2D pink circle with gaze tracking & proximity anger
// - Transition: Smooth flight animation from center to bottom-right corner
// - Mascot Companion: Corner cloud speech bubble with jokes & animated talking mouth
// - Interactive: Furious angry glare on hover, click to cycle jokes
// Author: Utkarsh Dhakane (badtobiop) & Antigravity Pair-Programmer
// ==========================================================================

class GatekeeperWithCompanion {
    constructor() {
        // Preloader Screen Handles
        this.screen = document.getElementById('gatekeeper-screen');
        this.canvas = document.getElementById('gatekeeper-canvas');
        if (!this.screen || !this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) return;

        // Companion DOM Handles
        this.companion = document.getElementById('mascotCompanion');
        this.companionCanvas = document.getElementById('mascotCanvas');
        this.bubble = document.getElementById('mascotCloudBubble');
        this.bubbleText = document.getElementById('mascotBubbleText');
        this.companionCtx = this.companionCanvas ? this.companionCanvas.getContext('2d') : null;

        // Interactive Tracking State
        this.mouse = { x: 0, y: 0 };           // Normalized (-1 to 1)
        this.screenMouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.anger = 0;                         // 0.0 (Cute Pink) -> 1.0 (Blood Red)
        this.targetAnger = 0;

        // State Flags
        this.isTransitioning = false;
        this.isInCorner = false;
        this.isDisposed = false;
        this.isHoveredAngry = false;

        // Inactivity & Timing
        this.lastMouseMoveTime = performance.now();
        this.isMouseMoving = false;
        this.alertTimer = 0;

        // Preloader Circle Size & Pos
        this.circleRadius = 56;
        this.circlePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

        // Flight Animation State
        this.flightStart = { x: 0, y: 0, r: 56 };
        this.flightTarget = { x: 0, y: 0, r: 34 };
        this.flightDuration = 0.78;
        this.flightElapsed = 0;

        // Companion Jokes & Banter
        this.jokes = [
            "Scroll kar bro, projects dekh ke dimag hil jayega! 😎🚀",
            "TradeMatrix AI dekha? Bhai ne raat bhar jag ke AI banaya hai! 📈🤖",
            "Bhai ne coffee nahi, sidha caffeine code me inject kiya hai! ☕⚡",
            "Skills section check kar, Three.js aur React dono pe hath saaf hai! 🔥",
            "Dekh raha hai na Vinod, kaisa cinematic 3D portfolio banaya hai! 😂",
            "Hire me button pe click karke toh dekh, regret nahi hoga pakka! 💼✨",
            "Code me koi bug nahi hai bro, sab advanced hidden features hain! 🐛😉",
            "Utkarsh ko contact kar le, freelancing deals mast karta hai! 📩🤙",
            "Scroll karte raho, aage aur bhi cinematic maal aane wala hai! 🎬🍿",
            "Mera muh dekhne aaya hai ya portfolio? Neeche scroll kar! 😜",
            "GitHub profile star kar dena, free me dua milegi! ⭐💖",
            "Arey waah, itna neeche tak scroll kar liya? Resume bhi download kar le! 📄🎉"
        ];

        this.angryLines = [
            "Arey cursor hata na bhai! 😤",
            "Kyu ungli kar raha hai?! 😡",
            "Bhai portfolio dekh, mujhe mat ghoor! 🤬",
            "Warning: Sentient creature ko pareshan mat kar! ⚡",
            "Door reh mere se! 🔪😂"
        ];

        this.currentJokeIndex = 0;
        this.jokeTimer = 0;
        this.jokeInterval = 7.5;      // Cycle joke every 7.5s
        this.isTalking = false;
        this.talkDuration = 3.4;     // Mouth flaps for 3.4s when joke appears
        this.talkTimer = 0;

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

        this.init();
    }

    init() {
        // Lock body scrolling while gatekeeper preloader is active
        document.body.style.overflow = 'hidden';
        if (window.lenis) {
            window.lenis.stop();
        } else {
            const checkLenis = setInterval(() => {
                if (window.lenis) {
                    if (!this.isDisposed && !this.isInCorner) window.lenis.stop();
                    clearInterval(checkLenis);
                }
            }, 60);
            setTimeout(() => clearInterval(checkLenis), 3000);
        }

        this.handleResize();
        this.setupEventListeners();
        this.setupCompanionCanvas();
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

        if (!this.isTransitioning && !this.isInCorner) {
            this.circlePos.x = window.innerWidth / 2;
            this.circlePos.y = window.innerHeight / 2;
        }
    };

    setupCompanionCanvas() {
        if (!this.companionCanvas || !this.companionCtx) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2.0);
        this.companionCanvas.width = 96 * dpr;
        this.companionCanvas.height = 96 * dpr;
        this.companionCanvas.style.width = '96px';
        this.companionCanvas.style.height = '96px';
        this.companionCtx.scale(dpr, dpr);
    }

    setupEventListeners() {
        // Window Mouse Move
        window.addEventListener('mousemove', (e) => {
            const now = performance.now();
            if (!this.isMouseMoving && (now - this.lastMouseMoveTime) > 1000) {
                this.alertTimer = 0.22;
            }
            this.lastMouseMoveTime = now;
            this.isMouseMoving = true;

            this.screenMouse.x = e.clientX;
            this.screenMouse.y = e.clientY;

            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        }, { passive: true });

        // Touch Move
        window.addEventListener('touchmove', (e) => {
            const now = performance.now();
            if (!this.isMouseMoving) this.alertTimer = 0.22;
            this.lastMouseMoveTime = now;
            this.isMouseMoving = true;

            if (e.touches && e.touches[0]) {
                const t = e.touches[0];
                this.screenMouse.x = t.clientX;
                this.screenMouse.y = t.clientY;
                this.mouse.x = (t.clientX / window.innerWidth) * 2 - 1;
                this.mouse.y = -(t.clientY / window.innerHeight) * 2 + 1;
            }
        }, { passive: true });

        window.addEventListener('resize', this.handleResize);

        // Click Preloader -> SMOOTH FLIGHT ANIMATION TO CORNER (NO BLAST!)
        this.screen.addEventListener('click', (e) => {
            if (e.target.closest('#gatekeeperSkipBtn')) return;
            if (this.isTransitioning || this.isInCorner) return;

            const dx = e.clientX - this.circlePos.x;
            const dy = e.clientY - this.circlePos.y;
            const dist = Math.hypot(dx, dy);

            // Click within circle or when angry triggers smooth flight into corner
            if (dist <= (this.circleRadius * 1.5) || this.anger > 0.35) {
                this.startFlightToCorner();
            } else {
                this.targetAnger = Math.min(1.0, this.targetAnger + 0.30);
                this.anger = Math.min(1.0, this.anger + 0.25);
            }
        });

        // Skip button
        if (this.skipBtn) {
            this.skipBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.startFlightToCorner();
            });
        }

        // Companion Hover Listeners -> ANGRY REACTION
        if (this.companion) {
            this.companion.addEventListener('mouseenter', () => {
                this.isHoveredAngry = true;
                this.companion.classList.add('angry');
                if (this.bubble) {
                    this.bubble.classList.add('angry');
                    const randAngry = this.angryLines[Math.floor(Math.random() * this.angryLines.length)];
                    this.bubbleText.textContent = randAngry;
                }
            });

            this.companion.addEventListener('mouseleave', () => {
                this.isHoveredAngry = false;
                this.companion.classList.remove('angry');
                if (this.bubble) {
                    this.bubble.classList.remove('angry');
                    this.bubbleText.textContent = this.jokes[this.currentJokeIndex];
                }
            });

            // Click Companion -> NEXT JOKE
            this.companion.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.isHoveredAngry) return;
                this.nextJoke();
            });
        }
    }

    // ==========================================================================
    // SMOOTH FLIGHT ANIMATION TO CORNER (NO BLAST!)
    // ==========================================================================
    startFlightToCorner() {
        if (this.isTransitioning || this.isInCorner) return;
        this.isTransitioning = true;
        this.flightElapsed = 0;

        // Start position
        this.flightStart = {
            x: this.circlePos.x,
            y: this.circlePos.y,
            r: this.circleRadius
        };

        // Target position in bottom-right corner (larger, clearly visible)
        this.flightTarget = {
            x: window.innerWidth - 76,
            y: window.innerHeight - 72,
            r: 44
        };

        // Fade HUD elements immediately
        if (this.threatFill && this.threatFill.parentElement) {
            this.threatFill.parentElement.style.opacity = '0';
        }
        if (this.instruction) this.instruction.style.opacity = '0';
        if (this.skipBtn) this.skipBtn.style.opacity = '0';

        // Unlock page scroll & animate Hero section elements
        if (window.lenis) window.lenis.start();
        document.body.style.overflow = '';

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

    finishFlightToCorner() {
        this.isTransitioning = false;
        this.isInCorner = true;

        // Hide preloader overlay screen
        this.screen.classList.add('hidden');
        this.screen.style.display = 'none';

        // Show companion widget in corner
        if (this.companion) {
            this.companion.classList.remove('hidden');
            // Little landing bounce
            if (typeof gsap !== 'undefined') {
                gsap.from(this.companion, {
                    scale: 0.5,
                    y: 30,
                    duration: 0.5,
                    ease: 'back.out(2)'
                });
            }
        }

        // Start first joke with animated talking mouth
        this.currentJokeIndex = 0;
        this.setJoke(this.jokes[0]);
    }

    setJoke(text) {
        if (!this.bubbleText) return;
        this.bubbleText.textContent = text;
        this.isTalking = true;
        this.talkTimer = this.talkDuration;

        // Bubble pop scale bounce
        if (typeof gsap !== 'undefined' && this.bubble) {
            gsap.fromTo(this.bubble,
                { scale: 0.85, opacity: 0.5 },
                { scale: 1.0, opacity: 1.0, duration: 0.35, ease: 'back.out(1.8)' }
            );
        }
    }

    nextJoke() {
        this.currentJokeIndex = (this.currentJokeIndex + 1) % this.jokes.length;
        this.jokeTimer = 0;
        this.setJoke(this.jokes[this.currentJokeIndex]);
    }

    updateProximity() {
        if (this.isTransitioning || this.isInCorner) return;

        const dx = this.screenMouse.x - this.circlePos.x;
        const dy = this.screenMouse.y - this.circlePos.y;
        const dist = Math.hypot(dx, dy);

        const maxDist = Math.min(window.innerWidth, window.innerHeight) * 0.38;
        this.targetAnger = Math.max(0, Math.min(1, 1 - (dist / maxDist)));
        this.anger += (this.targetAnger - this.anger) * 0.085;
    }

    // ==========================================================================
    // DRAW PRELOADER CANVAS (Full screen during preloader & flight)
    // ==========================================================================
    drawPreloader(elapsedTime, delta) {
        const ctx = this.ctx;
        const width = window.innerWidth;
        const height = window.innerHeight;

        ctx.clearRect(0, 0, width, height);

        let cx = this.circlePos.x;
        let cy = this.circlePos.y;
        let r = this.circleRadius;

        if (this.isTransitioning) {
            // Smooth flight interpolation across the screen
            this.flightElapsed += delta;
            const progress = Math.min(1.0, this.flightElapsed / this.flightDuration);

            // Cubic ease in-out
            const ease = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            // Flight Arc upward curve
            const arcY = Math.sin(progress * Math.PI) * -75;

            cx = this.flightStart.x + (this.flightTarget.x - this.flightStart.x) * ease;
            cy = this.flightStart.y + (this.flightTarget.y - this.flightStart.y) * ease + arcY;
            r = this.flightStart.r + (this.flightTarget.r - this.flightStart.r) * ease;

            // Screen overlay background fades to 0
            this.screen.style.opacity = `${1 - ease}`;

            if (progress >= 1.0) {
                this.finishFlightToCorner();
                return;
            }
        } else {
            // Subtle idle breathing & tension
            const idleBob = Math.sin(elapsedTime * 2.2) * 3.5;
            let tensionX = 0, tensionY = 0;
            if (this.anger > 0.12) {
                const freq = 30;
                const amp = this.anger * 1.5;
                tensionX = Math.sin(elapsedTime * freq) * amp;
                tensionY = Math.cos(elapsedTime * (freq * 1.15)) * (amp * 0.7);
            }
            cx += tensionX;
            cy += idleBob + tensionY;
        }

        // Draw Preloader Pink Circle
        const pinkGrad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.25, 4, cx, cy, r);
        if (this.anger > 0.05 && !this.isTransitioning) {
            const anger = this.anger;
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
            pinkGrad.addColorStop(0, '#ff66a8');
            pinkGrad.addColorStop(0.75, '#ff2e82');
            pinkGrad.addColorStop(1, '#e6126c');
        }

        ctx.save();
        ctx.shadowColor = this.anger > 0.25 ? '#ff0038' : '#ff4d94';
        ctx.shadowBlur = 16 + this.anger * 14;
        ctx.fillStyle = pinkGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 2D Glossy Glint
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.26)';
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.35, cy - r * 0.38, r * 0.38, r * 0.20, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Preloader Eyes (No mouth, no borders)
        const timeSinceMove = (performance.now() - this.lastMouseMoveTime) / 1000;
        this.drawEyes(ctx, cx, cy, r / 56, this.anger, timeSinceMove, elapsedTime, false);

        // Preloader HUD sync
        if (this.threatFill && !this.isTransitioning) {
            this.threatFill.style.width = `${Math.min(100, Math.round(this.anger * 100))}%`;
        }

        if (this.instruction && !this.isTransitioning) {
            if (this.anger > 0.65) {
                this.instruction.classList.add('angry');
                this.instruction.innerHTML = '⚠️ CURSED AGITATION PEAK &bull; CLICK TO ENTER DOMAIN';
            } else if (this.anger > 0.25) {
                this.instruction.classList.remove('angry');
                this.instruction.innerHTML = 'APPROACHING SENTIENT CORE &bull; EMOTION SHIFTING';
            } else {
                this.instruction.classList.remove('angry');
                this.instruction.innerHTML = 'MOVE CURSOR CLOSER &bull; DISTURB THE SENTIENT ORB';
            }
        }
    }

    // ==========================================================================
    // DRAW COMPANION CANVAS (In bottom-right corner with TALKING MOUTH & ANGER)
    // ==========================================================================
    drawCompanion(elapsedTime, delta) {
        if (!this.companionCtx) return;
        const ctx = this.companionCtx;
        const w = 96;
        const h = 96;
        const cx = 48;
        const cy = 48;
        const r = 44;

        ctx.clearRect(0, 0, w, h);

        // Hover Angry State
        const isAngry = this.isHoveredAngry;

        // Circle Gradient (Pink vs Blood Red)
        const grad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.25, 4, cx, cy, r);
        if (isAngry) {
            grad.addColorStop(0, '#ff1a40');
            grad.addColorStop(0.75, '#d60029');
            grad.addColorStop(1, '#800014');
        } else {
            grad.addColorStop(0, '#ff66a8');
            grad.addColorStop(0.75, '#ff2e82');
            grad.addColorStop(1, '#e6126c');
        }

        // Draw Circle Head
        ctx.save();
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Glossy Glint
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.24)';
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.35, cy - r * 0.38, r * 0.36, r * 0.18, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Eye Tracking towards mouse (scaled to r=44)
        const scale = 44 / 56;
        this.drawEyes(ctx, cx, cy, scale, isAngry ? 1.0 : 0, 0, elapsedTime, true);

        // ==============================================================
        // ANIMATED TALKING MOUTH ("aur tab uska muh hilta hua dikhega")
        // ==============================================================
        if (isAngry) {
            // Angry Grimace / Clamped Frown
            ctx.lineWidth = 2.8;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#080005';
            ctx.beginPath();
            ctx.moveTo(cx - 7, cy + 12);
            ctx.lineTo(cx + 7, cy + 12);
            ctx.stroke();
        } else if (this.isTalking) {
            // Talking mouth flaps open and close while delivering joke
            const mouthFlap = Math.abs(Math.sin(elapsedTime * 14));
            if (mouthFlap > 0.2) {
                // Open talking oval
                ctx.fillStyle = '#080005';
                ctx.beginPath();
                ctx.ellipse(cx, cy + 11, 5.2, 2.4 + mouthFlap * 4.2, 0, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Closed smile curve
                ctx.lineWidth = 2.6;
                ctx.lineCap = 'round';
                ctx.strokeStyle = '#080005';
                ctx.beginPath();
                ctx.arc(cx, cy + 10, 4.8, 0.2, Math.PI - 0.2, false);
                ctx.stroke();
            }
        } else {
            // Relaxed cute smile curve when silent
            ctx.lineWidth = 2.6;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#080005';
            ctx.beginPath();
            ctx.arc(cx, cy + 10, 5.0, 0.2, Math.PI - 0.2, false);
            ctx.stroke();
        }
    }

    // ==========================================================================
    // REUSABLE EYES DRAWING (SOLID ONLY, NO MOUTH, NO BORDERS)
    // ==========================================================================
    drawEyes(ctx, cx, cy, scale, anger, timeSinceMove, elapsedTime, isCompanion) {
        const isAngry = anger > 0.2;
        const isIdle = !isAngry && !isCompanion && (timeSinceMove > 1.2);

        const baseSpacing = 18 * scale;
        const eyeBaseY = cy - (isCompanion ? 2 : 2) * scale;

        if (isAngry) {
            // ANGRY EYES: Inward-slanted wedges \  /
            const gazeX = this.mouse.x * (isCompanion ? 3 : 6);
            const gazeY = -this.mouse.y * (isCompanion ? 2 : 4);

            const lx = cx - baseSpacing + gazeX;
            const rx = cx + baseSpacing + gazeX;
            const ly = eyeBaseY + gazeY;

            ctx.fillStyle = '#080005';
            ctx.shadowColor = '#ff0038';
            ctx.shadowBlur = 8 * anger;

            const w = 13 * scale;
            const h = 11 * scale;

            // Left Eye: Inward slanted wedge (\)
            ctx.beginPath();
            ctx.moveTo(lx - w, ly - h * 0.8);
            ctx.lineTo(lx + w * 0.85, ly + h * 0.2);
            ctx.lineTo(lx + w * 0.5, ly + h);
            ctx.bezierCurveTo(lx - w * 0.4, ly + h * 1.1, lx - w * 1.15, ly + h * 0.3, lx - w, ly - h * 0.8);
            ctx.closePath();
            ctx.fill();

            // Right Eye: Inward slanted wedge (/)
            ctx.beginPath();
            ctx.moveTo(rx + w, ly - h * 0.8);
            ctx.lineTo(rx - w * 0.85, ly + h * 0.2);
            ctx.lineTo(rx - w * 0.5, ly + h);
            ctx.bezierCurveTo(rx + w * 0.4, ly + h * 1.1, rx + w * 1.15, ly + h * 0.3, rx + w, ly - h * 0.8);
            ctx.closePath();
            ctx.fill();

        } else if (isIdle) {
            // Preloader Idle Moods (^ ^, u u, etc.)
            const idleTime = timeSinceMove - 1.2;
            const moodIndex = Math.floor(idleTime / 3.2) % 3;

            ctx.fillStyle = '#0f020a';
            ctx.strokeStyle = '#0f020a';

            const lx = cx - baseSpacing;
            const rx = cx + baseSpacing;

            if (moodIndex === 0) {
                // Happy (^ ^)
                const bounceY = Math.sin(elapsedTime * 6) * 2.5;
                ctx.lineWidth = 5.5 * scale;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.arc(lx, eyeBaseY - 2 + bounceY, 10 * scale, Math.PI * 0.85, Math.PI * 0.15, true);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(rx, eyeBaseY - 2 + bounceY, 10 * scale, Math.PI * 0.85, Math.PI * 0.15, true);
                ctx.stroke();
            } else if (moodIndex === 1) {
                // Sleepy (u u)
                const breathY = Math.sin(elapsedTime * 2.2) * 2;
                ctx.lineWidth = 5 * scale;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.arc(lx, eyeBaseY - 4 + breathY, 9 * scale, Math.PI * 0.15, Math.PI * 0.85, false);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(rx, eyeBaseY - 4 + breathY, 9 * scale, Math.PI * 0.15, Math.PI * 0.85, false);
                ctx.stroke();
            } else {
                // Heart Eyes
                const drawHeart = (hx, hy) => {
                    ctx.save();
                    ctx.translate(hx, hy);
                    ctx.scale(0.58 * scale, 0.58 * scale);
                    ctx.beginPath();
                    ctx.moveTo(0, 8);
                    ctx.bezierCurveTo(-14, -6, -18, -20, 0, -22);
                    ctx.bezierCurveTo(18, -20, 14, -6, 0, 8);
                    ctx.fill();
                    ctx.restore();
                };
                drawHeart(lx, eyeBaseY - 2);
                drawHeart(rx, eyeBaseY - 2);
            }
        } else {
            // ACTIVE TRACKING (Tracking cursor with funny aadhi-closed side-eye)
            const gazeX = this.mouse.x;
            const gazeY = -this.mouse.y;

            // Comical blink
            const blinkCycle = elapsedTime % 3.6;
            let blinkFactor = 1.0;
            if (blinkCycle > 3.44) {
                const phase = (blinkCycle - 3.44) / 0.16;
                blinkFactor = Math.abs(Math.sin(phase * Math.PI - Math.PI / 2)) * 0.85 + 0.15;
            }

            const horizGaze = Math.abs(gazeX);
            const eyeHeight = Math.max(3, (21 * scale - horizGaze * (9 * scale)) * blinkFactor);
            const eyeWidth = (12 * scale) + horizGaze * (4 * scale);
            const tilt = gazeX * 0.16;

            ctx.fillStyle = '#0f020a';

            const drawTrackingEye = (baseX) => {
                const ex = baseX + gazeX * (11 * scale);
                const ey = eyeBaseY + gazeY * (8 * scale);

                ctx.save();
                ctx.translate(ex, ey);
                ctx.rotate(tilt);
                ctx.beginPath();
                ctx.roundRect(-eyeWidth / 2, -eyeHeight / 2, eyeWidth, eyeHeight, eyeWidth / 2);
                ctx.fill();

                // White anime glint
                if (eyeHeight > 8 * scale) {
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(eyeWidth * 0.18, -eyeHeight * 0.22, 1.8 * scale, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            };

            drawTrackingEye(cx - baseSpacing);
            drawTrackingEye(cx + baseSpacing);
        }
    }

    animate = () => {
        if (this.isDisposed) return;
        requestAnimationFrame(this.animate);

        const now = performance.now();
        const delta = Math.min((now - this.lastTime) / 1000, 0.1);
        this.lastTime = now;
        this.elapsedTime += delta;

        if (!this.isInCorner) {
            this.updateProximity();
            this.drawPreloader(this.elapsedTime, delta);
        } else {
            // Companion Jokes Timing
            if (!this.isHoveredAngry) {
                this.jokeTimer += delta;
                if (this.jokeTimer >= this.jokeInterval) {
                    this.nextJoke();
                }

                if (this.isTalking) {
                    this.talkTimer -= delta;
                    if (this.talkTimer <= 0) {
                        this.isTalking = false;
                    }
                }
            }

            this.drawCompanion(this.elapsedTime, delta);
        }
    };
}

// Instantiate upon DOM Load
document.addEventListener('DOMContentLoaded', () => {
    window.gatekeeper = new GatekeeperWithCompanion();
});
