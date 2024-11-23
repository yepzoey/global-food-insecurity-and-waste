import { cubicOut } from 'svelte/easing';

export function slideTransition(node, { x = 0, duration = 500, easing = cubicOut }) {
    const style = getComputedStyle(node);
    const transform = style.transform === 'none' ? '' : style.transform;

    return {
        duration,
        easing,
        css: (t) => `
            transform: ${transform} translateX(${(1 - t) * x}px);
        `
    };
}
