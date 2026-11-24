// Shared timing for every landing-page animation, so they feel like one system:
// one easing curve (fast start, gentle settle — no bounce), short durations,
// small distances, and only opacity/transform (GPU-composited, no layout).
export const EASE = [0.22, 1, 0.36, 1]
export const DURATION = 0.6
export const STAGGER = 0.08

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION, ease: EASE } },
}

// A variant's own transition wins over the component's transition prop, so a
// per-element delay has to be written into the variant itself
export const withDelay = (variants, delay) => ({
  ...variants,
  visible: { ...variants.visible, transition: { ...variants.visible.transition, delay } },
})

export const stagger = (delayChildren = 0, staggerChildren = STAGGER) => ({
  hidden: {},
  visible: { transition: { delayChildren, staggerChildren } },
})

// Scroll reveals run once, when a fifth of the element is on screen
export const inView = { initial: 'hidden', whileInView: 'visible', viewport: { once: true, amount: 0.2 } }
