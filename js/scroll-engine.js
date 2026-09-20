/**
 * ==============================================================================
 * SHADOW REALM // SCROLL ENGINE & KINETIC GSAP ANIMATIONS
 * ==============================================================================
 * Architecture:
 * - Studio Freight Lenis (Smooth Momentum Physics Scrolling, duration: 2.2s)
 * - GreenSock (GSAP) + ScrollTrigger (Continuous Bidirectional Scrubbing)
 * - Multi-Phase Lifecycle:
 *     Phase 1 [0.00 - 0.28]: Dynamic Entrance (Slide-in from sides / rise from bottom)
 *     Phase 2 [0.28 - 0.72]: Center Hold (Locked 100% visible, crisp & interactive)
 *     Phase 3 [0.72 - 1.00]: Dynamic Exit (Slide-out to sides / float out)
 *     Reverse Scroll       : Seamless reverse playback in exact sync with mouse wheel
 * ==============================================================================
 */

(function () {
    'use strict';

    // Global Lenis instance handle
    let lenis = null;

    /**
     * 1. Initialize Lenis Momentum Smooth Scroll
     */
    function initLenisSmoothScroll() {
        if (typeof Lenis === 'undefined') {
            console.warn('[ScrollEngine] Lenis library not detected. Skipping smooth scroll.');
            return null;
        }

        lenis = new Lenis({
            duration: 2.2,                                    // Silky smooth duration
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential deceleration
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            smoothTouch: false,
            wheelMultiplier: 0.95,
            touchMultiplier: 1.5,
            infinite: false
        });

        // Expose globally for modal controls and external access
        window.lenis = lenis;

        // Synchronize Lenis scroll positions with GSAP ScrollTrigger
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);

            lenis.on('scroll', ScrollTrigger.update);

            // Connect GSAP ticker to Lenis requestAnimationFrame
            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });

            gsap.ticker.lagSmoothing(0);
        } else {
            // Fallback native RAF loop
            function fallbackRaf(time) {
                lenis.raf(time);
                requestAnimationFrame(fallbackRaf);
            }
            requestAnimationFrame(fallbackRaf);
        }

        // Attach smooth scrolling to all internal anchor links (#about, #projects, etc.)
        initAnchorSmoothScroll();

        return lenis;
    }

    /**
     * 2. Smooth Navigation Anchor Clicking
     */
    function initAnchorSmoothScroll() {
        const anchors = document.querySelectorAll('a[href^="#"]');

        anchors.forEach((anchor) => {
            anchor.addEventListener('click', (event) => {
                const targetId = anchor.getAttribute('href');

                // Ignore empty, external, or modal hashes
                if (!targetId || targetId === '#' || targetId.startsWith('#modal')) {
                    return;
                }

                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    event.preventDefault();

                    if (lenis) {
                        lenis.scrollTo(targetElement, {
                            offset: -20,
                            duration: 2.0
                        });
                    } else {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });
    }

    /**
     * 3. Factory function to build 3-phase scrub timeline (Entrance -> Hold -> Exit)
     */
    function createSectionTimeline({
        sectionId,
        leftSelector,
        rightSelector,
        customBuilder
    }) {
        const section = document.getElementById(sectionId);
        if (!section) return;

        // Create Master Timeline for this Section
        const timeline = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: 'top bottom',    // Starts when section top hits screen bottom
                end: 'bottom top',      // Ends when section bottom leaves screen top
                scrub: 1.3              // Physics-based scrub lag for silky response
            }
        });

        // If a specialized builder was provided, execute it
        if (typeof customBuilder === 'function') {
            customBuilder(timeline, section);
            return;
        }

        // Standard 2-Column Side Entrance/Exit
        const headings = section.querySelectorAll('.section-tag, .section-title');
        const leftElement = leftSelector ? section.querySelector(leftSelector) : null;
        const rightElement = rightSelector ? section.querySelector(rightSelector) : null;

        // -------------------------------------------------------------
        // PHASE 1: ENTRANCE (Timeline progress: 0.00 -> 0.28)
        // -------------------------------------------------------------
        if (headings.length > 0) {
            timeline.fromTo(headings,
                { opacity: 0, y: 35 },
                { opacity: 1, y: 0, duration: 0.24, ease: 'power2.out', stagger: 0.04 },
                0
            );
        }

        if (leftElement) {
            timeline.fromTo(leftElement,
                { opacity: 0, x: -110, scale: 0.94 },
                { opacity: 1, x: 0, scale: 1.0, duration: 0.28, ease: 'power2.out' },
                0
            );
        }

        if (rightElement) {
            timeline.fromTo(rightElement,
                { opacity: 0, x: 110, scale: 0.94 },
                { opacity: 1, x: 0, scale: 1.0, duration: 0.28, ease: 'power2.out' },
                0
            );
        }

        // -------------------------------------------------------------
        // PHASE 2: CENTER READING HOLD (Timeline progress: 0.28 -> 0.72)
        // Elements remain 100% visible, sharp, stable, and clickable
        // -------------------------------------------------------------

        // -------------------------------------------------------------
        // PHASE 3: EXIT (Timeline progress: 0.72 -> 1.00)
        // -------------------------------------------------------------
        if (headings.length > 0) {
            timeline.to(headings,
                { opacity: 0, y: -35, duration: 0.24, ease: 'power2.in', stagger: 0.04 },
                0.75
            );
        }

        if (leftElement) {
            timeline.to(leftElement,
                { opacity: 0, x: -110, scale: 0.94, duration: 0.28, ease: 'power2.in' },
                0.72
            );
        }

        if (rightElement) {
            timeline.to(rightElement,
                { opacity: 0, x: 110, scale: 0.94, duration: 0.28, ease: 'power2.in' },
                0.72
            );
        }
    }

    /**
     * 4. Configure Section-by-Section Scrub Animations
     */
    function initSectionAnimations() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            console.warn('[ScrollEngine] GSAP or ScrollTrigger not detected. Skipping animations.');
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        // ==========================================
        // SECTION 1: ABOUT
        // Left: 3D Character Card (slides from left)
        // Right: Engineering Bio Card (slides from right)
        // ==========================================
        createSectionTimeline({
            sectionId: 'about',
            leftSelector: '#aboutImageCard',
            rightSelector: '#aboutContent'
        });

        // ==========================================
        // SECTION 2: SKILLS
        // Top: Section Header
        // Center: Interactive 3D Moon & Tech Orbit Canvas
        // ==========================================
        createSectionTimeline({
            sectionId: 'skills',
            customBuilder: (timeline, section) => {
                const header = section.querySelector('.skills-header');
                const stage3D = section.querySelector('#skills3dStage');

                // Entrance Phase
                if (header) {
                    timeline.fromTo(header,
                        { opacity: 0, y: 40 },
                        { opacity: 1, y: 0, duration: 0.26, ease: 'power2.out' },
                        0
                    );
                }
                if (stage3D) {
                    timeline.fromTo(stage3D,
                        { opacity: 0, y: 60, scale: 0.92 },
                        { opacity: 1, y: 0, scale: 1.0, duration: 0.30, ease: 'power2.out' },
                        0
                    );
                }

                // Exit Phase
                if (header) {
                    timeline.to(header,
                        { opacity: 0, y: -40, duration: 0.24, ease: 'power2.in' },
                        0.74
                    );
                }
                if (stage3D) {
                    timeline.to(stage3D,
                        { opacity: 0, y: -60, scale: 0.92, duration: 0.28, ease: 'power2.in' },
                        0.72
                    );
                }
            }
        });

        // ==========================================
        // SECTION 3: PROJECTS
        // Left Card: Lunar Habit Tracker (slides from left)
        // Right Card: Aura AI Expense Monitor (slides from right)
        // ==========================================
        createSectionTimeline({
            sectionId: 'projects',
            leftSelector: '.project-card[data-project="habit-tracker"]',
            rightSelector: '.project-card[data-project="aura-ai"]'
        });

        // ==========================================
        // SECTION 4: CONTACT
        // Left: Communication Channels & Socials
        // Right: Interactive Summon Terminal Form
        // ==========================================
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            const contactTimeline = gsap.timeline({
                scrollTrigger: {
                    trigger: contactSection,
                    start: 'top bottom',
                    end: 'bottom bottom',
                    scrub: 1.3
                }
            });

            const contactHeadings = contactSection.querySelectorAll('.section-tag, .section-title');
            const contactInfo = contactSection.querySelector('.contact-info');
            const contactForm = contactSection.querySelector('#contactForm');

            // Entrance Phase
            if (contactHeadings.length > 0) {
                contactTimeline.fromTo(contactHeadings,
                    { opacity: 0, y: 35 },
                    { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', stagger: 0.05 },
                    0
                );
            }
            if (contactInfo) {
                contactTimeline.fromTo(contactInfo,
                    { opacity: 0, x: -95 },
                    { opacity: 1, x: 0, duration: 0.45, ease: 'power2.out' },
                    0
                );
            }
            if (contactForm) {
                contactTimeline.fromTo(contactForm,
                    { opacity: 0, x: 95 },
                    { opacity: 1, x: 0, duration: 0.45, ease: 'power2.out' },
                    0
                );
            }
            // Terminal section remains fully visible at the footer
        }

        // Recalculate dimensions once layout settles
        setTimeout(() => {
            ScrollTrigger.refresh();
        }, 400);
    }

    /**
     * 5. Bootstrap Engine on DOMContentLoaded
     */
    document.addEventListener('DOMContentLoaded', () => {
        initLenisSmoothScroll();
        initSectionAnimations();
    });

})();
