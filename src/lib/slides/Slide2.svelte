<script>
    import * as d3 from 'd3';
    import { onMount, onDestroy, tick } from 'svelte';
    import { fade, slide } from 'svelte/transition';
    import { base } from '$app/paths';

    let geoData; // GeoJSON data
    let filteredData = []; // Processed dataset for the selected metric
    let years = []; // Array of year ranges (e.g., "2014-2016", "2015-2017")
    let mapReady = false; // Track if the map is ready
    let currentYearIndex = -1; // Index for the current year in the animation
    let animationInterval; // Interval ID for the animation
    let hoveredCountry = null; // Track the currently hovered country
    let animationComplete = false; // Track if the animation has completed once
    let explorationMode = false; // Flag to determine if we're in exploration mode
    let showIntro = true;
    
    let introText = `
        This map illustrates the prevalence of moderate or severe food insecurity 
        in the total population, expressed as a percentage and calculated using 
        3-year averages.
    `;
    let currentNarrative = "";

    let narratives = [
        { yearRange: "2014-2016", text: "Food insecurity is most severe in Sub-Saharan Africa, with prevalence exceeding 60% in several countries. Parts of Southeast Asia also show moderate levels of food insecurity." },
        { yearRange: "2015-2017", text: "Food insecurity is most severe in Sub-Saharan Africa, with prevalence exceeding 60% in several countries. Parts of Southeast Asia also show moderate levels of food insecurity." },
        { yearRange: "2016-2018", text: "High food insecurity rates persist in Sub-Saharan Africa, with little improvement over time. Northern Africa and the Middle East begin to show slight increases in prevalence." },
        { yearRange: "2017-2019", text: "High food insecurity rates persist in Sub-Saharan Africa, with little improvement over time. Northern Africa and the Middle East begin to show slight increases in prevalence." },
        { yearRange: "2018-2020", text: "Eastern Africa experiences an uptick in food insecurity." },
        { yearRange: "2019-2021", text: "Food insecurity spreads further in Latin America." },
        { yearRange: "2020-2022", text: "Sub-Saharan Africa's food insecurity deepens. Moderate food insecurity levels persist in South Asia and Central America." },
        { yearRange: "2021-2023", text: "Little progress is seen in Sub-Saharan Africa, where food insecurity remains critical. Central and South America maintain moderate levels, showing continued vulnerability." }
    ];

    $: yearLabel = showIntro
        ? " "
        : currentYearIndex >= 0
        ? years[currentYearIndex]
        : " ";

    onMount(async () => {
        resetState();
        await loadData();
        await tick();
        mapReady = true;
        createMap();
        startIntro();
    });

    onDestroy(() => resetState());

    function resetState() {
        stopAnimation();

        currentYearIndex = -1;
        animationComplete = false;
        showIntro = true;
        explorationMode = false;
        currentNarrative = "";

        hoveredCountry = null;
        d3.select('#tooltip')
            .style('opacity', 0)
            .style('transform', 'translate(-50%, -100%) scale(0.9)');

        d3.select('#map').selectAll('*').remove();
    }

    async function loadData() {
        geoData = await d3.json(`${base}/custom.geo_med.json`);
        geoData.features = geoData.features.filter(feature => feature?.properties?.name);

        const rawData = await d3.csv(`${base}/FAOSTAT_data_en_11-15-2024_cleaned.csv`);

        years = Array.from(
            new Set(
                rawData
                    .filter(d => d.Item === "Prevalence of moderate or severe food insecurity in the total population (percent) (3-year average)")
                    .map(d => d.Year)
            )
        ).sort();

        filteredData = rawData
            .filter(d => d.Item === "Prevalence of moderate or severe food insecurity in the total population (percent) (3-year average)")
            .filter(d => d.Element === "Value")
            .map(d => ({
                Area: d.Area,
                Year: d.Year,
                Value: parseValue(d.Value)
            }));
            mapReady = true;
        }

        function parseValue(value) {
            if (!value || value.trim() === "") return null;
            if (value.startsWith("<")) return parseFloat(value.substring(1)) / 2;
            return parseFloat(value);
        }

        function createMap() {
            const width = 900;
            const height = 500;

            const svg = d3.select('#map')
                .attr('width', width)
                .attr('height', height);

            const projection = d3.geoMercator()
                .scale(120)
                .translate([width / 2, height / 1.5]);

            const path = d3.geoPath().projection(projection);

            const colorScale = d3.scaleSequential(d3.interpolateReds)
                .domain([0, d3.max(filteredData, d => d.Value)]);

            svg.selectAll('path.country')
                .data(geoData.features)
                .enter()
                .append('path')
                .attr('class', 'country')
                .attr('d', path)
                .attr('fill', '#ccc')
                .attr('stroke', '#ffffff')
                .attr('stroke-width', 0.5)
                .on('mouseover', (event, d) => {
                    hoveredCountry = d.properties.name;
                    updateTooltip();
                })
                .on('mousemove', (event) => {
                    const [x, y] = d3.pointer(event, d3.select('#map').node());
                    const tooltip = d3.select('#tooltip');

                    const tooltipRect = tooltip.node().getBoundingClientRect();
                    const svgBounds = d3.select('#map').node().getBoundingClientRect();

                    const offsetX = 50; // Horizontal offset from cursor
                    const offsetY = 20; // Vertical offset from cursor

                    const left = Math.min(
                        Math.max(x + offsetX, 0),
                        svgBounds.width - tooltipRect.width
                    );

                    const top = Math.min(
                        Math.max(y + offsetY, 0),
                        svgBounds.height - tooltipRect.height
                    );

                    tooltip
                        .style('left', `${left + svgBounds.left}px`)
                        .style('top', `${top + svgBounds.top}px`);
                })
                .on('mouseout', () => {
                    hoveredCountry = null;
                    updateTooltip();
                });

            createColorScaleLegend(svg, colorScale);
        }

    function startIntro() {
        setTimeout(() => {
            playAnimation();
        }, 5000);
    }

    function playAnimation() {
        stopAnimation();
        currentYearIndex = -1;

        animationInterval = setInterval(() => {
            showIntro = false;
            currentYearIndex++;
            if (currentYearIndex >= years.length) {
                stopAnimation();
                animationComplete = true;
            } else {
                updateMap(years[currentYearIndex]);
                updateNarrative(currentYearIndex);
            }
        }, 5000);
    }

    function stopAnimation() {
        if (animationInterval) {
            clearInterval(animationInterval);
            animationInterval = null;
        }
    }

    function updateMap(year) {
        const svg = d3.select('#map');
        const colorScale = d3.scaleSequential(d3.interpolateReds)
            .domain([0, d3.max(filteredData, d => d.Value)]);

        svg.selectAll('path.country')
            .transition()
            .duration(1000)
            .attr('fill', d => {
                const region = getRegionData(d.properties.name, year);
                return region && region.Value !== null ? colorScale(region.Value) : '#ccc';
            });

        d3.select('#year-label').text(year);
        updateTooltip(true);
    }

    function updateNarrative(index) {
        currentNarrative = narratives[index]?.text || "";
    }

    function getRegionData(regionName, year) {
        return (
            filteredData.find(d => d.Area === regionName && d.Year === year) || null
        );
    }

    function updateTooltip(forceUpdate = false) {
        const tooltip = d3.select('#tooltip');

        if (hoveredCountry || forceUpdate) {
            const region = hoveredCountry && currentYearIndex >= 0 && currentYearIndex < years.length
                ? getRegionData(hoveredCountry, years[currentYearIndex])
                : null;

            const value = region?.Value !== null && region?.Value !== undefined
                ? `${region.Value.toFixed(1)}%`
                : 'N/A';

            const tooltipContent = hoveredCountry
                ? `
                    <strong style="font-size: 16px; font-weight: bold;">
                        ${region?.Area || hoveredCountry}
                    </strong>
                    <div style="margin-top: 5px;">
                        Prevalence: <span style="color: #ff7f50;">${value}</span>
                    </div>
                    `
                : '';

            tooltip
                .style('opacity', hoveredCountry ? 1 : 0)
                .style('transform', hoveredCountry ? 'translate(-50%, -100%) scale(1)' : 'translate(-50%, -100%) scale(0.9)')
                .html(tooltipContent);
        } else {
            tooltip.style('opacity', 0).style('transform', 'translate(-50%, -100%) scale(0.9)');
        }
    }

    function selectYear(yearIndex) {
        stopAnimation();
        explorationMode = true;
        currentYearIndex = yearIndex;
        updateMap(years[yearIndex]);
        updateNarrative(yearIndex);
    }

    function createColorScaleLegend(svg, colorScale) {
        const legendWidth = 20;
        const legendHeight = 300;
        const margin = { top: 60, right: 20, bottom: 20, left: 20 };

        const legendGroup = svg.append('g')
            .attr('class', 'color-legend')
            .attr('transform', `translate(${+svg.attr('width') - margin.right - legendWidth + 40}, ${margin.top})`);

        const defs = svg.append('defs');
        const gradient = defs.append('linearGradient')
            .attr('id', 'legendGradient')
            .attr('x1', '0%')
            .attr('y1', '100%')
            .attr('x2', '0%')
            .attr('y2', '0%');

        const domain = colorScale.domain();
        const step = (domain[1] - domain[0]) / 10;
        for (let i = 0; i <= 10; i++) {
            const t = i / 10;
            gradient.append('stop')
                .attr('offset', `${t * 100}%`)
                .attr('stop-color', colorScale(domain[0] + step * i));
        }

        legendGroup.append('rect')
            .attr('width', legendWidth)
            .attr('height', legendHeight)
            .style('fill', 'url(#legendGradient)');

        const legendScale = d3.scaleLinear()
            .domain(domain)
            .range([legendHeight, 0]);

        const axisRight = d3.axisRight(legendScale)
            .ticks(5)
            .tickFormat(d => `${d.toFixed(1)}%`);

        legendGroup.append('g')
            .attr('transform', `translate(${legendWidth}, 0)`)
            .call(axisRight);
    }
</script>

{#if mapReady}
<div class="map-container">
    <h2>Global Prevalence of Food Insecurity</h2>
    <div class="narrative-container" style="height: {animationComplete ? '150px' : '120px'}; transition: height 0.5s ease;">
        <p class="narrative-text">{showIntro ? introText : currentNarrative}</p>
    </div> 
    
    <div class="year-label-container">
        {#key currentYearIndex >= 0 ? years[currentYearIndex] : "intro"}
            <div id="year-label" class="year-label" transition:slide>
                {yearLabel}
            </div>
        {/key}
    </div>
    <svg id="map" viewBox="0 0 900 500" preserveAspectRatio="xMidYMid meet"></svg>
    {#if animationComplete}
        <div class="exploration-container" transition:fade>
            <p class="year-exploration-text">Hover cursor over countries, and select a year to explore:</p>
            <div class="year-buttons">
                {#each years as year, index}
                    <button on:click={() => selectYear(index)}>{year}</button>
                {/each}
            </div>
        </div>
    {/if}
    <div id="tooltip"></div>
</div>
{/if}

<style>
    .map-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        height: 100%;
        max-height: 600px;
        overflow: hidden;
    }

    .map-subtitle {
        font-size: 14px;
        font-weight: normal;
        color: #555;
        margin-bottom: 10px;
        max-width: 800px;
        margin-left: auto;
        margin-right: auto;
        line-height: 1.4;
    }

    .year-label-container {
        height: 50px;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        font-weight: bold;
        color: #333;
        padding: 0px;
    }

    .year-exploration-text p {
        font-size: 16px;
        font-style: italic;
        margin-bottom: 10px;
        color: #555;
    }

    .year-buttons {
        margin-top: 15px;
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 8px;
        margin-left: auto;
        margin-right: auto;
    }

    .year-buttons button {
        font-size: 12px;
        padding: 8px 15px;
        background: #f8f8f8;
        border: 1px solid #ccc;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s, transform 0.2s;
    }

    .year-buttons button:hover {
        background-color: #e0e0e0;
        transform: scale(1.05);
    }

    svg {
        display: block;
        margin: 0 auto;
    }

    #map {
        flex-grow: 1;
        width: 100%;
        height: 800px;
    }

    #tooltip {
        position: absolute;
        background: rgba(0, 0, 0, 0.8);
        color: #fff;
        padding: 10px 15px;
        border-radius: 8px;
        font-size: 14px;
        line-height: 1.4;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.5s ease, transform 0.5s ease;
        transform: translate(-50%, -100%) scale(0.9);
    }

    .narrative-container {
        height: 150px;
        overflow: hidden;
        display: flex;
        justify-content: center;
        margin-bottom: 10px;
    }

</style>
