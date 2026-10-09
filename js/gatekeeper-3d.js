// ==========================================================================
// SHADOW REALM // 2D SENTIENT GATEKEEPER & SASSY FEMALE MASCOT COMPANION
// - Preloader: Compact 2D pink circle with gaze tracking & proximity anger
// - Transition: Smooth flight animation from center to bottom-right corner
// - Mascot Companion: Sassy female character with witty English banter & talking mouth
// - Interactive: Drag-and-drop with hilarious attitude return walk to home spot!
// - Hover Anger: Furious inward-slanted eyes \  / & sassy defense lines
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

        // Flight Animation State (Lands at bottom 48px, right 38px)
        this.flightStart = { x: 0, y: 0, r: 56 };
        this.flightTarget = { x: window.innerWidth - 38 - 39, y: window.innerHeight - 48 - 39, r: 36 };
        this.flightDuration = 0.78;
        this.flightElapsed = 0;

        // Dragging & Sassy Return Walk State
        this.isDragging = false;
        this.hasDragged = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;

        this.isWalkingHome = false;
        this.walkStartPos = { x: 0, y: 0 };
        this.walkTargetPos = { x: 0, y: 0 };
        this.walkDuration = 3.3; // 3.3s slow sassy strut back home with attitude
        this.walkElapsed = 0;

        // Sassy Girl English Dialogues & Banter (Sushi 🍣✨)
        this.jokes = [
            "Hi! I'm Sushi! Don't just stare at my cute face, go scroll Utkarsh's projects! 🍣💅✨",
            "Did you see TradeMatrix AI? Utkarsh built that and honestly, he's a genius! 🤖📈",
            "Excuse me, Sushi only looks this fabulous because Utkarsh coded me with perfection! 💁‍♀️💖",
            "Are you going to hire him or should Sushi keep judging your taste? 💅💼",
            "His 3D visuals are giving pure main character energy, right? ✨🎬",
            "He literally survived on coffee and late nights to build this for you! ☕🔥",
            "If you think you found a bug... no you didn't. Sushi says it's a luxury feature! 🤫💅",
            "Hit that 'Send Message' button already! Utkarsh doesn't bite, Sushi promises. 📩😉",
            "Keep scrolling, darling! The cinematic magic is right below! 👑✨",
            "Star his GitHub repo right now, or Sushi is putting you on her blacklist! ⭐😤",
            "You made it all the way down here? Wow, download his resume already! 📄🎉"
        ];

        this.angryLines = [
            "Hey! Keep your cursor away from Sushi! 😤💅",
            "Did I give you permission to touch Sushi? Ugh! 🙄💢",
            "Excuse you?! Go look at Utkarsh's work, not Sushi! 😡🍣",
            "Personal space, sweetie! Sushi needs her breathing room! 💅⚡"
        ];

        this.dragSassLines = [
            "Excuse me?! Sushi doesn't listen to anyone except Utkarsh! 💅👑",
            "Hands off, honey! Sushi only takes orders from Utkarsh! 💁‍♀️✨",
            "You think you can move Sushi? I only belong by Utkarsh's side! 🍣😤💅"
        ];

        this.currentJokeIndex = 0;
        this.jokeTimer = 0;
        this.jokeInterval = 7.5;      // Cycle joke every 7.5s
        this.isTalking = false;
        this.talkDuration = 3.5;     // Mouth flaps for 3.5s when speaking
        this.talkTimer = 0;

        // DOM Handles
        this.ambientGlow = document.getElementById('gatekeeperAmbientGlow');
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

        // Update flight target to match bottom 48px, right 38px (78px circle)
        this.flightTarget = {
            x: window.innerWidth - 38 - 39,
            y: window.innerHeight - 48 - 39,
            r: 36
        };
    };

    setupCompanionCanvas() {
        if (!this.companionCanvas || !this.companionCtx) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2.0);
        this.companionCanvas.width = 78 * dpr;
        this.companionCanvas.height = 78 * dpr;
        this.companionCanvas.style.width = '78px';
        this.companionCanvas.style.height = '78px';
        this.companionCtx.scale(dpr, dpr);
    }

    getHomePos() {
        return {
            x: window.innerWidth - 38 - 78,
            y: window.innerHeight - 48 - 78
        };
    }

    resetToHomeCSS() {
        if (!this.companion) return;
        this.companion.style.left = '';
        this.companion.style.top = '';
        this.companion.style.right = '';
        this.companion.style.bottom = '';
        this.companion.style.transform = '';
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

            // Dragging handling
            if (this.isDragging && this.companion) {
                const newX = e.clientX - this.dragOffsetX;
                const newY = e.clientY - this.dragOffsetY;
                if (Math.hypot(newX - this.dragStartX, newY - this.dragStartY) > 6) {
                    this.hasDragged = true;
                }
                const clampedX = Math.max(10, Math.min(window.innerWidth - 88, newX));
                const clampedY = Math.max(60, Math.min(window.innerHeight - 88, newY));
                this.companion.style.left = `${clampedX}px`;
                this.companion.style.top = `${clampedY}px`;
                this.companion.style.bottom = 'auto';
                this.companion.style.right = 'auto';
            }
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

                if (this.isDragging && this.companion) {
                    const newX = t.clientX - this.dragOffsetX;
                    const newY = t.clientY - this.dragOffsetY;
                    if (Math.hypot(newX - this.dragStartX, newY - this.dragStartY) > 6) {
                        this.hasDragged = true;
                    }
                    const clampedX = Math.max(10, Math.min(window.innerWidth - 88, newX));
                    const clampedY = Math.max(60, Math.min(window.innerHeight - 88, newY));
                    this.companion.style.left = `${clampedX}px`;
                    this.companion.style.top = `${clampedY}px`;
                    this.companion.style.bottom = 'auto';
                    this.companion.style.right = 'auto';
                }
            }
        }, { passive: true });

        // Mouse Up / Touch End for Dragging
        const handleDragEnd = () => {
            if (this.isDragging) {
                this.isDragging = false;
                if (this.companion) this.companion.classList.remove('dragging');

                if (this.hasDragged && this.companion) {
                    const rect = this.companion.getBoundingClientRect();
                    const home = this.getHomePos();
                    const dist = Math.hypot(rect.left - home.x, rect.top - home.y);

                    if (dist > 40) {
                        // SASSY ATTITUDE RETURN WALK!
                        this.triggerSassyReturn(rect.left, rect.top, home);
                    } else {
                        this.resetToHomeCSS();
                    }
                }
            }
        };

        window.addEventListener('mouseup', handleDragEnd);
        window.addEventListener('touchend', handleDragEnd);

        window.addEventListener('resize', this.handleResize);

        // Click Preloader -> SMOOTH FLIGHT ANIMATION TO CORNER (NO BLAST!)
        this.screen.addEventListener('click', (e) => {
            if (this.isTransitioning || this.isInCorner) return;

            const dx = e.clientX - this.circlePos.x;
            const dy = e.clientY - this.circlePos.y;
            const dist = Math.hypot(dx, dy);

            // Click within circle or when angry triggers smooth flight into corner
            if (dist <= (this.circleRadius * 2.0) || this.anger > 0.25) {
                this.startFlightToCorner();
            } else {
                this.targetAnger = Math.min(1.0, this.targetAnger + 0.35);
                this.anger = Math.min(1.0, this.anger + 0.30);
            }
        });

        // Companion Drag & Hover Listeners
        if (this.companion) {
            // Drag Start (Mouse & Touch)
            const handleDragStart = (e) => {
                if (this.isWalkingHome) return; // Don't interrupt while strutting
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;

                this.isDragging = true;
                this.hasDragged = false;
                this.companion.classList.add('dragging');

                const rect = this.companion.getBoundingClientRect();
                this.dragOffsetX = clientX - rect.left;
                this.dragOffsetY = clientY - rect.top;
                this.dragStartX = rect.left;
                this.dragStartY = rect.top;
            };

            this.companion.addEventListener('mousedown', handleDragStart);
            this.companion.addEventListener('touchstart', handleDragStart, { passive: true });

            // Hover Listeners -> ANGRY DEFENSE
            this.companion.addEventListener('mouseenter', () => {
                if (this.isDragging || this.isWalkingHome) return;
                this.isHoveredAngry = true;
                this.companion.classList.add('angry');
                if (this.bubble) {
                    this.bubble.classList.add('angry');
                    this.bubble.classList.remove('sass');
                    const randAngry = this.angryLines[Math.floor(Math.random() * this.angryLines.length)];
                    this.bubbleText.textContent = randAngry;
                }
            });

            this.companion.addEventListener('mouseleave', () => {
                if (this.isDragging || this.isWalkingHome) return;
                this.isHoveredAngry = false;
                this.companion.classList.remove('angry');
                if (this.bubble) {
                    this.bubble.classList.remove('angry');
                    this.bubbleText.textContent = this.jokes[this.currentJokeIndex];
                }
            });

            // Click Companion -> NEXT JOKE (Only if not dragged)
            this.companion.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.hasDragged || this.isWalkingHome) return;
                if (this.isHoveredAngry) return;
                this.nextJoke();
            });
        }
    }

    // ==========================================================================
    // SASSY ATTITUDE RETURN WALK ("I don't listen to anyone except Utkarsh!")
    // ==========================================================================
    triggerSassyReturn(fromX, fromY, home) {
        if (this.isWalkingHome) return;
        this.isWalkingHome = true;
        this.walkStartPos = { x: fromX, y: fromY };
        this.walkTargetPos = home;
        this.walkElapsed = 0;

        // Pick sassy line
        const sassLine = this.dragSassLines[Math.floor(Math.random() * this.dragSassLines.length)];
        if (this.bubbleText) this.bubbleText.textContent = sassLine;
        if (this.bubble) {
            this.bubble.classList.add('sass');
            this.bubble.classList.remove('angry');
        }
        this.isTalking = true;
        this.talkTimer = 3.6;

        // Pop scale bounce on bubble (clears transform on finish for razor-sharp text)
        if (typeof gsap !== 'undefined' && this.bubble) {
            gsap.fromTo(this.bubble,
                { scale: 0.88, opacity: 0.7 },
                { scale: 1.0, opacity: 1.0, duration: 0.35, ease: 'back.out(2)', clearProps: 'transform' }
            );
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

        // Target position in bottom-right corner (bottom 48px, right 38px, 78px circle)
        this.flightTarget = {
            x: window.innerWidth - 38 - 39,
            y: window.innerHeight - 48 - 39,
            r: 36
        };

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
            this.resetToHomeCSS();
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

        // Bubble pop scale bounce (clears transform on finish for razor-sharp text)
        if (typeof gsap !== 'undefined' && this.bubble) {
            gsap.fromTo(this.bubble,
                { scale: 0.88, opacity: 0.6 },
                { scale: 1.0, opacity: 1.0, duration: 0.3, ease: 'back.out(1.8)', clearProps: 'transform' }
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
    }

    // ==========================================================================
    // DRAW COMPANION CANVAS (In bottom-right corner with TALKING MOUTH & ANGER)
    // ==========================================================================
    drawCompanion(elapsedTime, delta) {
        if (!this.companionCtx) return;
        const ctx = this.companionCtx;
        const w = 78;
        const h = 78;
        const cx = 39;
        const cy = 39;
        const r = 36;

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

        // Eye Tracking towards mouse
        const scale = 36 / 56;
        this.drawEyes(ctx, cx, cy, scale, isAngry ? 1.0 : 0, 0, elapsedTime, true);

        // ==============================================================
        // ANIMATED TALKING MOUTH ("aur tab uska muh hilta hua dikhega")
        // ==============================================================
        this.drawMouth(ctx, cx, cy, isAngry, elapsedTime, scale);
    }

    drawMouth(ctx, cx, cy, isAngry, elapsedTime, scale = 1.0) {
        const mouthY = cy + 9.5 * scale;
        if (isAngry) {
            // Angry Grimace / Clamped Frown
            ctx.lineWidth = 2.4 * scale;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#080005';
            ctx.beginPath();
            ctx.moveTo(cx - 6 * scale, mouthY);
            ctx.lineTo(cx + 6 * scale, mouthY);
            ctx.stroke();
        } else if (this.isDragging) {
            // Surprised / Shocked round "O" mouth while being moved!
            ctx.fillStyle = '#080005';
            ctx.beginPath();
            ctx.arc(cx, mouthY, 3.6 * scale, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.isTalking) {
            // Talking mouth flaps open and close while delivering dialogue
            const mouthFlap = Math.abs(Math.sin(elapsedTime * 14));
            if (mouthFlap > 0.2) {
                // Open talking oval
                ctx.fillStyle = '#080005';
                ctx.beginPath();
                ctx.ellipse(cx, mouthY, 4.6 * scale, (2.0 + mouthFlap * 3.4) * scale, 0, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Closed smile curve
                ctx.lineWidth = 2.4 * scale;
                ctx.lineCap = 'round';
                ctx.strokeStyle = '#080005';
                ctx.beginPath();
                ctx.arc(cx, mouthY - 1, 4.2 * scale, 0.2, Math.PI - 0.2, false);
                ctx.stroke();
            }
        } else {
            // Relaxed cute smile curve when silent
            ctx.lineWidth = 2.4 * scale;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#080005';
            ctx.beginPath();
            ctx.arc(cx, mouthY - 1, 4.4 * scale, 0.2, Math.PI - 0.2, false);
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
        const eyeBaseY = cy - 2 * scale;

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

        } else if (this.isDragging) {
            // SHOCKED / DIZZY WIDE EYES WHILE BEING DRAGGED (@_@)
            ctx.fillStyle = '#0f020a';
            const eyeSize = 10 * scale;

            ctx.beginPath();
            ctx.arc(cx - baseSpacing, eyeBaseY - 2, eyeSize, 0, Math.PI * 2);
            ctx.arc(cx + baseSpacing, eyeBaseY - 2, eyeSize, 0, Math.PI * 2);
            ctx.fill();

            // Tiny shocked white pupil dots
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(cx - baseSpacing, eyeBaseY - 2, 3 * scale, 0, Math.PI * 2);
            ctx.arc(cx + baseSpacing, eyeBaseY - 2, 3 * scale, 0, Math.PI * 2);
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
            // Sassy Return Walk Loop (Waddles strutting back home in full attitude!)
            if (this.isWalkingHome && this.companion) {
                this.walkElapsed += delta;
                const progress = Math.min(1.0, this.walkElapsed / this.walkDuration);

                // Current position on straight path to home
                const curX = this.walkStartPos.x + (this.walkTargetPos.x - this.walkStartPos.x) * progress;
                const curY = this.walkStartPos.y + (this.walkTargetPos.y - this.walkStartPos.y) * progress;

                // Sassy slow attitude strut (measured, humorous swaying tilt and gentle hops)
                const waddleTilt = Math.sin(this.walkElapsed * 8.5) * 8.5; // -8.5 to +8.5 deg sassy tilt
                const waddleHop = Math.abs(Math.sin(this.walkElapsed * 8.5)) * -4.5; // -4.5px gentle hops

                this.companion.style.left = `${curX}px`;
                this.companion.style.top = `${curY}px`;
                this.companion.style.transform = `translateY(${waddleHop}px) rotate(${waddleTilt}deg)`;

                if (progress >= 1.0) {
                    // Arrived back home!
                    this.isWalkingHome = false;
                    this.resetToHomeCSS();
                    // User requested: "jab vo uske jaga pe ayegi to 2-3 sec mai vapis se pahle jaise bolna start kreggi"
                    setTimeout(() => {
                        if (this.bubble && !this.isHoveredAngry && !this.isDragging && !this.isWalkingHome) {
                            this.bubble.classList.remove('sass');
                            this.nextJoke(); // Starts speaking normal witty banter just like before!
                        }
                    }, 2500); // 2.5 seconds (2-3 sec)
                }
            }

            // Companion Jokes Timing (Only when not hovered angry or dragging)
            if (!this.isHoveredAngry && !this.isDragging && !this.isWalkingHome) {
                this.jokeTimer += delta;
                if (this.jokeTimer >= this.jokeInterval) {
                    this.nextJoke();
                }
            }

            if (this.isTalking) {
                this.talkTimer -= delta;
                if (this.talkTimer <= 0) {
                    this.isTalking = false;
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
