<script>
    import Header from '$lib/components/Header.svelte';
    import Pagination from '$lib/components/Pagination.svelte';
    import Slide1 from '$lib/slides/Slide1.svelte';
    import Slide2 from '$lib/slides/Slide2.svelte';
    import Slide3 from '$lib/slides/Slide3.svelte';
    import { slideTransition } from '$lib/transitions/customTransitions.js';
    import { fade } from 'svelte/transition';

    let currentSlide = 1;
    let previousSlide = 1;

    const slides = [
        { id: 1, component: Slide1 },
        { id: 2, component: Slide2 },
        { id: 3, component: Slide3 }
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
        <h2>Initial Prototype Writeup</h2>
        <p>
            So far we have developed three interactive visualizations that focus on different aspects of the story we would like to tell. 
            We have a horizontal stacked bar chart with interactivity that allows the user to sort countries by the amount of food waste they produce. 
            We have an interactive line graph that shows the percentage of food insecurity among various areas of the world over the last 8 years. 
            Different regions can be selected to see the trends of food insecurity for entire continents, sub-regions, or countries. 
            Finally, we developed a choropleth map that shows the prevalence of food insecurity in different countries for various 3-year ranges. 
            These graphs will help us show viewers the amount of food wasted in comparison to the amount of food insecurity.
        </p>
        <p>
            I believe the most challenging part of this project is going to be ensuring that we send a clear message without losing our audience through unclear explanations or visualizations. 
            We have lots of data that we could potentially use but we want to ensure that our message is clearly conveyed by walking the reader through each visualization without overcomplicating it by encoding too much info. 
            Finding a balance between creating interesting visualizations and sending a clear message will be the biggest challenge as we continue in this project. 
            Some accompanying text will be necessary but we want to only include what is absolutely necessary to get the message across. 
            Our goal is to create a number of visualizations and text that can be clicked through to share what we found was interesting from the data and then provide the users with these visualizations that they can interact with after if they’d like.
        </p>
    </article>

</main>

<style>
    @import url('$lib/global.css');

</style>
