// ==========================================================================
// SHADOW REALM // MAIN UI, BLOOD CURSOR & AUDIO ENGINE
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    initBloodCursor();
    initDomainAudio();
    initNavigationHighlighter();
    initCardParallax();
    initSummonForm();
    initVillainMaskReveal();
});

// ==========================================================================
// 1. CUSTOM BLOOD CURSOR
// ==========================================================================
function initBloodCursor() {
    const dot = document.getElementById('cursorDot');
    const trail = document.getElementById('cursorTrail');

    if (!dot || !trail) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let trailX = mouseX;
    let trailY = mouseY;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        dot.style.left = `${mouseX}px`;
        dot.style.top = `${mouseY}px`;
    }, { passive: true });

    function updateTrail() {
        trailX += (mouseX - trailX) * 0.15;
        trailY += (mouseY - trailY) * 0.15;

        trail.style.left = `${trailX}px`;
        trail.style.top = `${trailY}px`;

        requestAnimationFrame(updateTrail);
    }
    updateTrail();

    // Event delegation: expands trail dynamically on any interactive item (links, buttons, modal close)
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('a, button, input, textarea, .glass-card, .modal-close-btn, .modal-btn, .proj-btn, [role="button"]')) {
            trail.classList.add('active');
        }
    }, { passive: true });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest('a, button, input, textarea, .glass-card, .modal-close-btn, .modal-btn, .proj-btn, [role="button"]')) {
            trail.classList.remove('active');
        }
    }, { passive: true });
}

// ==========================================================================
// 2. AMBIENT DRONE SYNTHESIZER (WEB AUDIO API - 100% INFINITE SEAMLESS ATMOSPHERE)
// ==========================================================================
function initDomainAudio() {
    const toggle = document.getElementById('audioToggle');
    const text = toggle ? toggle.querySelector('.audio-text') : null;
    if (!toggle) return;

    let audioCtx = null;
    let osc1 = null, osc2 = null, subOsc = null;
    let filter = null, gainNode = null;
    let isPlaying = false;
    let stopTimeout = null;

    function startSynth() {
        if (stopTimeout) {
            clearTimeout(stopTimeout);
            stopTimeout = null;
        }

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!audioCtx) {
            audioCtx = new AudioContext();
        } else if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const now = audioCtx.currentTime;

        // Clean previous oscillators if running
        try { if (osc1) osc1.stop(); } catch (e) {}
        try { if (osc2) osc2.stop(); } catch (e) {}
        try { if (subOsc) subOsc.stop(); } catch (e) {}

        // Deep drone oscillators
        osc1 = audioCtx.createOscillator();
        osc2 = audioCtx.createOscillator();
        subOsc = audioCtx.createOscillator();

        // Warm lowpass filter
        filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(140, now);

        gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.0001, now);
        gainNode.gain.exponentialRampToValueAtTime(0.14, now + 2.5);

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(55, now); // A1 note

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(55.6, now); // Slight detune chorus

        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(27.5, now); // A0 Sub-bass

        osc1.connect(filter);
        osc2.connect(filter);
        subOsc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc1.start();
        osc2.start();
        subOsc.start();
    }

    function stopSynth() {
        if (!gainNode || !audioCtx) return;
        const now = audioCtx.currentTime;
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(Math.max(gainNode.gain.value, 0.001), now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);

        const currentOsc1 = osc1, currentOsc2 = osc2, currentSub = subOsc;
        osc1 = null; osc2 = null; subOsc = null;

        stopTimeout = setTimeout(() => {
            try {
                if (currentOsc1) currentOsc1.stop();
                if (currentOsc2) currentOsc2.stop();
                if (currentSub) currentSub.stop();
            } catch (e) {}
        }, 1100);
    }

    toggle.addEventListener('click', () => {
        if (!isPlaying) {
            startSynth();
            isPlaying = true;
            toggle.classList.add('active');
            if (text) text.textContent = 'ATMOSPHERE: ACTIVE';
        } else {
            stopSynth();
            isPlaying = false;
            toggle.classList.remove('active');
            if (text) text.textContent = 'ATMOSPHERE: OFF';
        }
    });
}

// ==========================================================================
// 3. NAVIGATION ACTIVE HIGHLIGHTER
// ==========================================================================
function initNavigationHighlighter() {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach((section) => {
            const sectionTop = section.offsetTop - 200;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('data-nav') === current) {
                link.classList.add('active');
            }
        });
    });
}

// ==========================================================================
// 4. 3D CARD TILT PARALLAX EFFECT
// ==========================================================================
function initCardParallax() {
    const cards = document.querySelectorAll('.glass-card');

    cards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -6;
            const rotateY = ((x - centerX) / centerX) * 6;

            card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
    });
}

// ==========================================================================
// 5. CONTACT FORM HANDLER
// ==========================================================================
// ==========================================================================
// 5. SUMMON TERMINAL CONTACT FORM (GMAIL DISPATCH VIA FORMSUBMIT.CO)
// ==========================================================================
function showCyberToast(message, type = 'success') {
    const container = document.getElementById('toastContainer') || document.body;
    const toast = document.createElement('div');
    toast.className = 'cyber-toast cyber-toast-' + type;

    const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
    toast.innerHTML = '<i class="fa-solid ' + icon + '"></i><div>' + message + '</div>';

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 400);
    }, 5500);
}

function initSummonForm() {
    const form = document.getElementById('contactForm');
    const nameInput = document.getElementById('contactName');
    const emailInput = document.getElementById('contactEmail');
    const msgInput = document.getElementById('contactMsg');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const message = msgInput ? msgInput.value.trim() : '';

        // Validate fields
        if (!name || !email || !message) {
            showCyberToast('Please fill out all transmission fields.', 'error');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnHTML = submitBtn.innerHTML;

        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> TRANSMITTING MESSAGE...';
        submitBtn.style.pointerEvents = 'none';
        submitBtn.disabled = true;

        // Try local secure Express backend first
        const BACKEND_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
            ? 'http://localhost:5000/api/contact'
            : '/api/contact';

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);

            const backendRes = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ name, email, message }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (backendRes.ok) {
                const data = await backendRes.json();
                submitBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> TRANSMISSION DELIVERED';
                submitBtn.style.background = 'linear-gradient(135deg, #00e676, #00b0ff)';
                form.reset();

                if (data.emailDispatched) {
                    showCyberToast('Direct transmission confirmed! Email alert dispatched to Gmail (utkarshdhakane2@gmail.com) and archived in secure database.', 'success');
                } else {
                    showCyberToast('Message securely archived in backend database! (Gmail alert will trigger once SMTP App Password is active in .env)', 'success');
                }

                setTimeout(() => {
                    submitBtn.innerHTML = originalBtnHTML;
                    submitBtn.style.background = '';
                    submitBtn.style.pointerEvents = 'all';
                    submitBtn.disabled = false;
                }, 4000);
                return;
            }
        } catch (backendErr) {
            console.warn('[Backend Notice]: Local backend unreachable, switching to FormSubmit gateway fallback...', backendErr);
        }

        // Fallback: If backend is offline (e.g. deployed purely statically), route through FormSubmit gateway
        try {
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ROUTING VIA FORMSUBMIT...';
            const fsRes = await fetch('https://formsubmit.co/ajax/utkarshdhakane2@gmail.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    "Name": name,
                    "Email": email,
                    "Message": message,
                    "_replyto": email,
                    "_subject": '⚡ New Portfolio Inquiry from ' + name + ' (' + email + ')',
                    "_template": "table",
                    "_captcha": "false"
                })
            });

            const fsData = await fsRes.json();

            if (fsRes.ok) {
                submitBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> DISPATCHED TO GMAIL';
                submitBtn.style.background = 'linear-gradient(135deg, #00e676, #00b0ff)';
                form.reset();

                showCyberToast("Transmission confirmed! Message routed to Utkarsh's inbox (utkarshdhakane2@gmail.com).", "success");

                setTimeout(() => {
                    submitBtn.innerHTML = originalBtnHTML;
                    submitBtn.style.background = '';
                    submitBtn.style.pointerEvents = 'all';
                    submitBtn.disabled = false;
                }, 3500);
            } else {
                throw new Error(fsData.message || 'Transmission rejected by gateway');
            }
        } catch (error) {
            console.error('[SummonForm Error]:', error);
            submitBtn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> TRANSMISSION FAILED';
            submitBtn.style.background = 'linear-gradient(135deg, #ff003c, #550011)';

            showCyberToast('Transmission failed. Please reach out to utkarshdhakane2@gmail.com directly.', 'error');

            setTimeout(() => {
                submitBtn.innerHTML = originalBtnHTML;
                submitBtn.style.background = '';
                submitBtn.style.pointerEvents = 'all';
                submitBtn.disabled = false;
            }, 4000);
        }
    });
}

// ==========================================================================
// 6. CSS MASKING FLASHLIGHT REVEAL CONTROLLER (DEAD-CENTERED ON CURSOR)
// ==========================================================================
function initVillainMaskReveal() {
    const stage = document.getElementById('characterMaskStage');
    const villain = document.getElementById('villainLayer');

    if (!stage || !villain) return;

    let targetMaskX = -999;
    let targetMaskY = -999;
    let currentMaskX = -999;
    let currentMaskY = -999;

    let isHovered = false;

    function handlePointerMove(clientX, clientY) {
        // Villain image rect for 100% dead-centered mask coordinates
        const vRect = villain.getBoundingClientRect();
        targetMaskX = clientX - vRect.left;
        targetMaskY = clientY - vRect.top;

        if (currentMaskX < -500) {
            currentMaskX = targetMaskX;
            currentMaskY = targetMaskY;
        }
    }

    stage.addEventListener('mouseenter', (e) => {
        isHovered = true;
        handlePointerMove(e.clientX, e.clientY);
    });

    stage.addEventListener('mousemove', (e) => {
        handlePointerMove(e.clientX, e.clientY);
    });

    stage.addEventListener('mouseleave', () => {
        isHovered = false;
        targetMaskX = -999;
        targetMaskY = -999;
        currentMaskX = -999;
        currentMaskY = -999;
        villain.style.setProperty('--mask-x', '-999px');
        villain.style.setProperty('--mask-y', '-999px');
    });

    // Mobile touch support
    stage.addEventListener('touchmove', (e) => {
        if (!e.touches || !e.touches[0]) return;
        isHovered = true;
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    stage.addEventListener('touchend', () => {
        isHovered = false;
        villain.style.setProperty('--mask-x', '-999px');
        villain.style.setProperty('--mask-y', '-999px');
    });

    function updateMaskLoop() {
        if (isHovered) {
            currentMaskX += (targetMaskX - currentMaskX) * 0.35;
            currentMaskY += (targetMaskY - currentMaskY) * 0.35;

            villain.style.setProperty('--mask-x', `${currentMaskX.toFixed(1)}px`);
            villain.style.setProperty('--mask-y', `${currentMaskY.toFixed(1)}px`);
        }
        requestAnimationFrame(updateMaskLoop);
    }
    updateMaskLoop();
}

// =========================================================
// ABOUT SECTION: CLICK-TO-REVEAL TOGGLE (Image stays fixed, content 3D flips)
// =========================================================
let aboutVillainMode = false;

function toggleAboutCard() {
    aboutVillainMode = !aboutVillainMode;

    const card = document.getElementById('aboutImageCard');
    const content = document.getElementById('aboutContent');
    const hint = document.getElementById('aboutClickHint');
    const badgeText = document.getElementById('personaBadgeText');

    if (aboutVillainMode) {
        // 3D Flip content to Beyond The Code
        if (content) content.classList.add('villain-content');
        if (card) card.classList.add('villain-mode');

        if (hint) {
            hint.innerHTML = '<i class="fa-solid fa-rotate-left"></i><span>CLICK TO RETURN</span>';
            hint.style.borderColor = 'rgba(255, 68, 68, 0.7)';
            hint.style.background = 'rgba(150, 0, 30, 0.9)';
            hint.style.color = '#fff';
        }
        if (badgeText) {
            badgeText.textContent = 'SHADOW ARCHITECT';
        }
    } else {
        // 3D Flip content back to Overview
        if (content) content.classList.remove('villain-content');
        if (card) card.classList.remove('villain-mode');

        if (hint) {
            hint.innerHTML = '<i class="fa-solid fa-hand-pointer"></i><span>CLICK TO REVEAL</span>';
            hint.style.borderColor = '';
            hint.style.background = '';
            hint.style.color = '';
        }
        if (badgeText) {
            badgeText.textContent = 'CREATIVE ENGINEER';
        }
    }
}

window.toggleAboutCard = toggleAboutCard;


// ==========================================================================
// PROJECT DETAILS MODAL CONTROLLER
// ==========================================================================
window.openProjectModal = function(projectId) {
    const modal = document.getElementById('projectModal');
    if (!modal) return;

    // Hide all modal project contents
    document.querySelectorAll('.modal-project-content').forEach(el => {
        el.style.display = 'none';
    });

    // Show target project content
    const targetContent = document.getElementById('modal-content-' + projectId);
    if (targetContent) {
        targetContent.style.display = 'block';
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (window.lenis) window.lenis.stop();
};

window.closeProjectModal = function() {
    const modal = document.getElementById('projectModal');
    if (!modal) return;

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (window.lenis) window.lenis.start();
};

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('projectModal');
    const closeBtn = document.getElementById('modalCloseBtn') || document.getElementById('modal-close-btn') || document.querySelector('.modal-close-btn');
    const backdrop = document.getElementById('modalBackdrop') || document.getElementById('modal-backdrop') || document.querySelector('.modal-backdrop');

    if (closeBtn) closeBtn.addEventListener('click', window.closeProjectModal);
    if (backdrop) backdrop.addEventListener('click', window.closeProjectModal);

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') window.closeProjectModal();
    });
});


