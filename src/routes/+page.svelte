<title>Food Insecurity & Waste</title>

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
    import Slide8 from '$lib/slides/Slide8.svelte';
    import Slide9 from '$lib/slides/Slide9.svelte';
    import Slide10 from '$lib/slides/Slide10.svelte';
    import BackToTop from '$lib/components/BackToTop.svelte';
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
                    This project draws on two datasets to examine the intersection of food insecurity and food waste. Together, these datasets provide 
                    the foundation for uncovering global patterns and exploring actionable solutions:
                </p>
                <ul>
                    <li>
                        <strong>Food Waste Dataset</strong> 
                        (<a href="https://www.kaggle.com/datasets/joebeachcapital/food-waste" target="_blank" rel="noopener noreferrer">
                            Kaggle
                        </a>):
                        <br>
                        Offers detailed country-level data on food waste across households, retail, and food service sectors, measured in 
                        <em>kg/capita/year</em>. Key features include:
                        <ul>
                            <li>Confidence levels indicating data reliability</li>
                            <li>Regional and sectoral breakdowns</li>
                            <li>Sources and methodologies</li>
                        </ul>
                    </li>
                    <li>
                        <strong>FAOSTAT Dataset</strong> 
                        (<a href="https://www.fao.org/faostat/en/#data" target="_blank" rel="noopener noreferrer">
                            FAOSTAT
                        </a>):
                        <br>
                        Provides comprehensive food security indicators, capturing metrics such as dietary energy supply adequacy and food consumption. 
                        Highlights include:
                        <ul>
                            <li>Socio-economic and regional comparisons</li>
                            <li>Time-series data for historical trend analysis</li>
                        </ul>
                    </li>
                </ul>
                <p>
                    Together, these datasets form the backbone of an exploration into the global disconnect between food waste and hunger. By analyzing 
                    food waste recovery efforts and food security trends, we aim to highlight opportunities to bridge this gap and propose pathways for 
                    change.
                </p>
            `
        },
        {
            id: 2,
            component: Slide2,
            content: `
                <h2>Mapping the Global Food Crisis</h2>
                <p>Hunger isn’t just a statistic—it’s a reality for millions of people around the world. This map paints a picture of how food insecurity has unfolded over nearly a decade, showing where the struggle to access enough food has been most severe. From 2014 to 2023, the data reveals a crisis that continues to deepen, with stark differences between regions.</p>
                <p>Sub-Saharan Africa stands out as the hardest-hit region. In countries like South Sudan, Sierra Leone, and the Central African Republic, more than 80% of people face moderate or severe food insecurity. These numbers reflect challenges that go beyond food—conflict, unstable economies, and the growing effects of climate change all play a role in shaping this reality.</p>
                <p>Elsewhere, regions like South Asia and Latin America are seeing food insecurity steadily rise. Economic setbacks and unpredictable weather have made it harder for people to access what they need to survive. At the same time, parts of Central Asia and Oceania remain a mystery, with gaps in the data making it difficult to fully understand the scale of the problem there.</p>
                <p>While this map helps us see where food insecurity is most severe, it only tells part of the story. To understand how the situation has changed over time—and why some regions are improving while others are getting worse—we need to zoom out and look at the trends shaping the past decade.</p>
                <p>This is just the starting point. As we move to the next step, the focus shifts to how food insecurity has evolved over time, revealing patterns that can help us understand the causes and, hopefully, the solutions.</p>
            `
        },
        {
            id: 3,
            component: Slide3,
            content: `
                <h2>Food Insecurity Across Regions</h2>
                <p>Over the last decade, efforts to combat food insecurity have brought mixed results, with some regions stabilizing while others face escalating challenges. Africa and Central America continue to grapple with some of the highest food insecurity rates, while other parts of the world show signs of resilience or gradual improvement. These figures offer insight into the systemic factors driving hunger around the globe.</p>
                <p><strong>The Crisis in Africa:</strong> Africa continues to experience severe food insecurity, with significant disparities across its subregions. Middle Africa reports consistently high rates above 70%, driven by prolonged instability and climate disasters. Meanwhile, Western Africa stands out for its sharp increase, rising steadily toward 60% over the last decade—a result of rapid population growth, conflict, and environmental challenges. These troubling trends underscore the urgent need for targeted, regional interventions to address the root causes and prevent further deterioration.</p>
                <p><strong>Diverse Realities in Asia:</strong> Asia’s food insecurity trends reveal significant regional contrasts. Southern Asia faces rates exceeding 35%, highlighting deep-rooted vulnerabilities, while Eastern Asia shows steady improvement, thanks to economic growth and agricultural advancements. In contrast, South-eastern Asia remains stagnant at around 16%, suggesting resilience but also persistent challenges. These varied trajectories underscore the complexity of food security in Asia.</p>
                <p><strong>America’s Uneven Landscape:</strong> Central America stands out with some of the highest rates in the Americas, with countries like Guatemala and Honduras exceeding 50%. These nations face systemic challenges such as weak economies and vulnerability to natural disasters. In South America, food insecurity is less severe but shows slow increases in countries like Peru and Ecuador, reflecting growing economic instability. Northern America tells a different story—overall rates are low, but disparities exist, as seen in Mexico’s significantly higher levels compared to its northern neighbors.</p>
                <p><strong>Europe’s Stability, with Caveats:</strong> Europe reports the lowest global food insecurity rates, but subregional differences remain. Eastern Europe faces higher rates due to economic struggles and geopolitical challenges, while Western and Northern Europe benefit from stronger social safety nets. These contrasts highlight the importance of equitable resource distribution in maintaining food security.</p>
                <p><strong>Oceania’s Stark Divide:</strong> Oceania reveals some of the most striking contrasts. While Australia and New Zealand have some of the lowest food insecurity rates globally, Melanesia struggles with rates above 50%, driven by limited infrastructure and economic isolation. This divide underscores how geographic and economic disparities shape food security outcomes.</p>
                <p>The data makes one thing clear: food insecurity is a deeply entrenched issue, shaped by climate change, political instability, and economic inequality. It demands not only recognition of these interconnected challenges but also bold, equitable solutions. As we turn to the issue of food waste, another facet of this global crisis emerges. How can we reconcile the paradox of abundant food waste with widespread hunger? The next section explores the patterns of waste across households, retail, and food service sectors, and how addressing waste could bridge the gap between abundance and need.</p>
            `
        },
        {
            id: 4,
            component: Slide4,
            content: `
                <h2>Food Waste Patterns by Sector and Confidence Levels</h2>
                <p>Food waste is a complex issue, with household, retail, and food service sectors each contributing to the staggering amounts of food discarded every year. However, the scale of waste and the confidence in its measurement vary greatly between countries.</p>
                <p>Countries like <strong>Malaysia</strong> and <strong>Nigeria</strong> rank among the highest in total food waste per capita, driven predominantly by household waste. In Nigeria, households alone contribute over 180 kilograms per capita annually, reflecting systemic inefficiencies in food consumption and disposal habits. Retail and food service sectors also play significant roles but remain secondary contributors compared to households.</p>
                <p>On the opposite end, <strong>Slovenia</strong> and <strong>Austria</strong> stand out for their relatively low total waste. Here, household contributions are minimized, showcasing the potential of strong waste-reduction policies and sustainable consumption practices. Yet even these low-waste countries are not exempt from waste altogether, with Austria, for instance, still generating 76 kilograms of waste per capita annually.</p>
                
                <h3>The Role of Confidence Levels</h3>
                <p>The data's confidence levels reveal another layer of complexity. High-confidence data, such as that from <strong>Saudi Arabia</strong> and the <strong>United States</strong>, offers a clearer picture of waste distribution across sectors. By contrast, low- and very low-confidence data highlight gaps in reporting and measurement, particularly in countries where infrastructure and monitoring systems are less developed. These disparities in confidence underscore the need for more robust and standardized data collection systems to accurately capture the scope of food waste worldwide.</p>

                <h3>A Global Inequity</h3>
                <p>This stark contrast between high- and low-waste countries raises important questions about the global inequity of food distribution. In countries with high total waste, the abundance of discarded food often far exceeds the caloric needs of their food-insecure populations. This paradox—where some regions waste staggering amounts of food while others face chronic hunger—demands urgent attention.</p>
                <p>As we examine these patterns of waste, a larger question begins to take shape: What does this waste mean in real terms? How much food could be saved, and how might it be redirected to address global food insecurity? These are questions that go beyond the data, touching on the possibilities of rethinking our systems to transform waste into a resource for those in need.</p>
            `
        },
        {
            id: 5,
            component: Slide5,
            content: `
                <h2></h2>
                <p>These numbers reveal more than just waste—they uncover a deeper contradiction in our global food systems. In some parts of the world, food waste has become normalized, measured in hundreds of kilograms per capita annually. Yet, in others, millions struggle to meet basic caloric needs. What would it take to reimagine this imbalance and turn excess into sustenance? The next step brings us closer to understanding the scale of waste and its potential to address hunger worldwide.</p>
            `
        },
        {
            id: 6,
            component: Slide6,
            content: `
                <h2>The Global Imbalance of Food Waste and Need</h2>
                <p>
                The numbers tell a stark story: the world wastes far more food than it would take to feed its undernourished populations. 
                At the current caloric intake of <strong>2500 kcal/day</strong>, the daily food need of undernourished people is estimated at <strong>7.60 trillion kcal</strong>. 
                Yet, the total food waste amounts to a staggering <strong>2378.87 trillion kcal</strong>, enough to meet global food insecurity many times over.
                </p>

                <p>
                As the caloric intake slider reveals, even small shifts in daily caloric requirements significantly alter the total food need. 
                This highlights not only the scale of the imbalance but also the opportunities within it. What portion of this waste could realistically 
                be redirected to close the gap and provide sustenance to those in need? The challenge is not a lack of resources—it’s one of redistribution.
                </p>

                <h3>Bridging the Gap</h3>
                <p>
                Redirecting even a fraction of wasted calories could profoundly impact global hunger. However, the path to redistribution requires 
                understanding where waste originates and how it might flow to those in need. Households, retail, and food service sectors all play a role, 
                but the logistics of recovery and distribution remain complex.
                </p>

                <p>
                As we explore the potential for reallocation, the question becomes: How might these wasted calories flow from sources of surplus 
                to regions of need? The next step provides a glimpse into this possibility, offering a closer look at how redistribution could reshape 
                the global food system and turn waste into sustenance.
                </p>
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
                The recovery rates represent the percentage of food waste successfully collected and redistributed from each source. 
                The default starting rate is <strong>10%</strong>, but users can adjust this to explore potential outcomes and impacts.
                </p>

                <p>
                While this model highlights the immense potential of food waste recovery, real-world factors like spoilage, infrastructure limitations, and regional differences 
                may influence actual outcomes. These variables underscore the importance of tailored strategies for addressing food insecurity through redistribution.
                </p>

                <h3>Reflecting on the Possibilities:</h3>
                <p>
                As you adjust recovery rates and observe the potential impact, consider this: food waste recovery alone cannot solve the systemic issues underlying food insecurity. 
                It is, however, a critical piece of the puzzle—a way to rethink how surplus can be transformed into sustenance. 
                The final step in this journey ties these insights together, exploring how collective action can bridge the gap between abundance and need.
                </p>
            `
        },
        {
            id: 8,
            component: Slide8,
            content: `
                <h2>Turning Insights into Action</h2>
                <p>
                    The visualizations throughout this article have shown the stark realities of food waste and food insecurity: regions where hunger has grown, 
                    sectors generating the most waste, and the vast potential of even modest recovery efforts. Each insight reinforces a simple truth: solving this crisis 
                    is within our reach.
                </p>

                <p>
                    What’s needed now is action—collaborative, sustained, and systemic. From rescuing food at the local level to improving global distribution systems, 
                    every effort counts. Organizations around the world are already leading this charge, bridging gaps and creating pathways for change.
                </p>

                <p>
                    The next slide highlights a few of these efforts. Their work demonstrates that with the right tools, policies, and commitments, we can 
                    move closer to a future where waste becomes a resource and hunger becomes a thing of the past.
                </p>
            `
        },
        {
            id: 9,
            component: Slide9,
            content: `
                <h2></h2>
                <p></p>
            `
        },
        {
            id: 10,
            component: Slide10,
            content: `
                <h2></h2>
                <p></p>
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

<BackToTop />

<style>
    @import url('$lib/global.css');
</style>
