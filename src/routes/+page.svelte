<script>
    import Header from '$lib/components/Header.svelte';
    import Pagination from '$lib/components/Pagination.svelte';
    import Slide1 from '$lib/slides/Slide1.svelte';
    import Slide2 from '$lib/slides/Slide2.svelte';
    import Slide3 from '$lib/slides/Slide3.svelte';
    import Slide4 from '$lib/slides/Slide4.svelte';
    import Slide5 from '$lib/slides/Slide5.svelte';
    import Slide6 from '$lib/slides/Slide6.svelte';
    import Slide7 from '$lib/slides/Slide7.svelte';
    import { slideTransition } from '$lib/transitions/customTransitions.js';
    import { fade } from 'svelte/transition';

    let currentSlide = 1;
    let previousSlide = 1;

    const slides = [
        {
            id: 1,
            component: Slide1,
            content: `
                <h2>Introduction</h2>
                <p>
                    The following datasets provide the foundation for this exploration of food insecurity and food waste:
                </p>
                <ul>
                    <li>
                        <strong>Food Waste Dataset</strong> 
                        (<a href="https://www.kaggle.com/datasets/joebeachcapital/food-waste" target="_blank" rel="noopener noreferrer">
                            Kaggle
                        </a>):
                        <br>
                        Contains data on food waste volumes (<em>kg/capita/year</em>) across households, retail, and food service sectors by country. 
                        <br>Additional details:
                        <ul>
                            <li>Confidence levels for estimates</li>
                            <li>Regional classifications</li>
                            <li>Sources of data</li>
                        </ul>
                    </li>
                    <li>
                        <strong>FAOSTAT Dataset</strong> 
                        (<a href="https://www.fao.org/faostat/en/#data" target="_blank" rel="noopener noreferrer">
                            FAOSTAT
                        </a>):
                        <br>
                        Includes country-level food security indicators, such as dietary energy supply adequacy and food consumption metrics. 
                        <br>Additional details:
                        <ul>
                            <li>Socio-economic factors</li>
                            <li>Time-series data for trend analysis</li>
                        </ul>
                    </li>
                </ul>
                <p>
                    These datasets enable a comprehensive exploration of the relationship between food waste generation, recovery efforts, and food security outcomes across different regions.
                </p>
            `
        },
        {
            id: 2,
            component: Slide2,
            content: `
                <h2>Food Insecurity Trends</h2>
                <p>This slide explores the trends of food insecurity globally over the last decade.</p>
            `
        },
        {
            id: 3,
            component: Slide3,
            content: `
                <h2></h2>
                <p></p>
            `
        },
        {
            id: 4,
            component: Slide4,
            content: `
                <h2></h2>
                <p></p>
            `
        },
        {
            id: 5,
            component: Slide5,
            content: `
                <h2></h2>
                <p></p>
            `
        },
        {
            id: 6,
            component: Slide6,
            content: `
                <h2>Food Waste Recovery</h2>
                <p>This slide visualizes the potential impact of food waste recovery efforts on food security.</p>
            `
        },
        {
            id: 7,
            component: Slide7,
            content: `
                <h2>About This Visualization</h2>
                <p>
        This visualization is based on food waste estimates from <strong><a href="https://www.kaggle.com/datasets/joebeachcapital/food-waste" target="_blank" rel="noopener noreferrer">Food Waste Dataset</a></strong>, which provides data such as <em>Household estimate (kg/capita/year)</em>, <em>Retail estimate (kg/capita/year)</em>, and <em>Food service estimate (kg/capita/year)</em>. These estimates were scaled to reflect daily waste redistribution totals in kilograms.
    </p>
    <p>
        Key calculations used in this visualization:
    </p>
    <ul>
        <li><strong>Daily Waste:</strong> Converted from annual estimates (kg/capita/year) to kilograms per day.</li>
        <li><strong>Calories Recovered:</strong> Assumes 4,000 kcal per kilogram of food waste, based on estimated caloric content of recoverable food items.</li>
        <li><strong>People Fed:</strong> Calculated using a daily requirement of 2,000 kcal per person.</li>
    </ul>
    <p>
        Recovery rates represent the percentage of food waste successfully collected and redistributed from each source. The default starting rate is <strong>10%</strong>, which can be adjusted to explore potential outcomes.
    </p>
    <p>
        These calculations provide a model for understanding food waste redistribution. However, real-world factors such as spoilage, infrastructure limitations, and regional differences in waste generation and recovery efficiency may affect actual outcomes.
    </p>
            `
        }
    ];

    function changeSlide(event) {
        previousSlide = currentSlide;
        currentSlide = event.detail;
    }

    function getTransitionDirection() {
        return currentSlide > previousSlide ? -1000 : 1000;
    }
</script>

<main>
    <Header />
    <section class="slide-container">
        {#each slides as slide (slide.id)}
            {#if slide.id === currentSlide}
                <div
                    class="slide"
                    transition:slideTransition={{ x: getTransitionDirection(), duration: 500 }}
                >
                    <div in:fade={{ delay: 500, duration: 400 }}>
                        <svelte:component this={slide.component} />
                    </div>
                </div>
            {/if}
        {/each}
    </section>

    <div class="pagination-wrapper">
        <Pagination {slides} {currentSlide} on:changeSlide={changeSlide} />
    </div>

    <article class="content">
        {@html slides.find(slide => slide.id === currentSlide).content}
    </article>
</main>

<style>
    @import url('$lib/global.css');
</style>
