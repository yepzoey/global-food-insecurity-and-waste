<script>
    import { createEventDispatcher } from 'svelte';

    export let slides;
    export let currentSlide;

    const dispatch = createEventDispatcher();

    function handleSlideChange(slideId) {
        if (slideId !== currentSlide) {
            dispatch('changeSlide', slideId);
        }
    }
</script>

<div class="pagination">
    {#each slides as slide}
        <button
            class:active={slide.id === currentSlide}
            on:click={() => handleSlideChange(slide.id)}
            aria-label={`Go to slide ${slide.id}`}
        >
            {slide.id}
        </button>
    {/each}
</div>

<style>
    .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        background: rgba(255, 255, 255, 0.9);
    }

    button {
        font-family: 'Arial', sans-serif;
        font-size: 14px;
        color: #333;
        background-color: #fff;
        border: 1px solid #ccc;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        margin: 0 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: color 0.3s ease;
    }

    button.active {
        background-color: #333;
        color: #fff;
        border-color: #333;
        transition: background-color 0.3s ease, color 0.3s ease;
    }

    button:hover {
        background-color: #555;
        color: #fff;
    }

    button:focus {
        outline: none;
    }

    button:disabled {
        background-color: #eee;
        color: #aaa;
        cursor: not-allowed;
        box-shadow: none;
    }
</style>
