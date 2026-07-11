'use client';

import { motion, useReducedMotion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

/**
 * Entrance-reveal wrapper. Slides children in on mount.
 *
 * Deliberately animates ONLY the transform (y/x), never opacity: in the Next SSR/prod build
 * framer-motion occasionally left an opacity track stuck at 0, hiding content. Animating just the
 * transform means the worst case is a few px of offset — content is always visible.
 */
export default function Reveal({
    children,
    as = 'div',
    delay = 0,
    y = 28,
    x = 0,
    duration = 0.7,
    once = true,   // absorbed for API compatibility (no longer used)
    amount = 0.2,  // absorbed for API compatibility (no longer used)
    className = '',
    ...rest
}) {
    const reduce = useReducedMotion();
    const MotionTag = motion[as] || motion.div;
    return (
        <MotionTag
            className={className}
            initial={reduce ? false : { y, x }}
            animate={{ y: 0, x: 0 }}
            transition={{ duration, delay, ease: EASE }}
            {...rest}
        >
            {children}
        </MotionTag>
    );
}
