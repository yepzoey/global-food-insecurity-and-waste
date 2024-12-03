<script>
    import * as d3 from 'd3';
    import { onMount, onDestroy } from 'svelte';
    import { base } from '$app/paths';
    import { fade, slide } from 'svelte/transition';

    let isPlaying = false;
    let animationFinished = false;

    let geoData = null;
    let svgElement;

    let csvData = null;
    let dataByYear = {};
    let years = [];
    let currentYearIndex = -1;

    let timer;
    let tooltipElement;
    let hoveredCountry = null;

    let colorScale = null;
    let minValue = Infinity;
    let maxValue = -Infinity;

    const descriptionMap = {
    "-1": `
        <strong>This map illustrates the prevalence of moderate or severe food insecurity worldwide.</strong><br>
        Data is expressed as a percentage of the total population and calculated using 3-year averages.<br>
        <span style="display: block; margin-top: 10px; font-size: 0.9em; color: #555; font-style: italic;">
        Use the play/pause button to view changes over time. Hover over countries to see specific percentages.
        </span>
    `,
    "0": `
        <strong>Food insecurity is most severe in Sub-Saharan Africa.</strong><br>
        Prevalence exceeds 60% in several countries, and parts of Southeast Asia also show moderate levels of food insecurity.
    `,
    "1": `
        <strong>Food insecurity is most severe in Sub-Saharan Africa.</strong><br>
        Prevalence exceeds 60% in several countries, and parts of Southeast Asia also show moderate levels of food insecurity.
    `,
    "2": `
        <strong>High food insecurity rates persist in Sub-Saharan Africa.</strong><br>
        Northern Africa and the Middle East begin to show slight increases in prevalence.
    `,
    "3": `
        <strong>High food insecurity rates persist in Sub-Saharan Africa.</strong><br>
        Northern Africa and the Middle East begin to show slight increases in prevalence.
    `,
    "4": `
        <strong>Eastern Africa experiences an uptick in food insecurity.</strong><br>
    `,
    "5": `
        <strong>Food insecurity spreads further in Latin America.</strong><br>
    `,
    "6": `
        <strong>Sub-Saharan Africa's food insecurity deepens.</strong><br>
        Moderate food insecurity levels persist in South Asia and Central America.
    `,
    "7": `
        <strong>Little progress is seen in Sub-Saharan Africa.</strong><br>
        Food insecurity remains critical, while Central and South America maintain moderate levels, showing continued vulnerability.
    `,
    };

    $: descriptionText = descriptionMap[currentYearIndex.toString()] || "Description not available for this year range.";

    onMount(async () => {
        try {
            geoData = await d3.json('/custom.geo_med.json'); 
            csvData = await d3.csv(`${base}/FAOSTAT_data_en_11-15-2024_cleaned.csv`);
            processData();
        } catch (error) {
            console.error("Error loading data:", error);
        }
    });

    onDestroy(() => {
        if (timer) timer.stop();
    });

    $: if (geoData && svgElement && colorScale) {
        createMap(svgElement);
    }

    $: if (minValue < Infinity && maxValue > -Infinity) {
        colorScale = d3.scaleSequential()
            .domain([minValue, maxValue])
            .interpolator(d3.interpolateReds);
    }

    function processData() {
        const filtered = csvData.filter(d => 
            d.Item === "Prevalence of moderate or severe food insecurity in the total population (percent) (3-year average)" &&
            d.Element === "Value"
        );

        filtered.forEach(d => {
            const area = d.Area.trim();
            const yearRange = d.Year.trim();
            let rawValue = d.Value.trim();
            let numericValue;
            let isLessThan = false;

            if (rawValue.startsWith("<")) {
                isLessThan = true;
                numericValue = +rawValue.slice(1); // Convert "<2.5" to 2.5
            } else {
                numericValue = +rawValue;
            }

            if (!dataByYear[yearRange]) {
                dataByYear[yearRange] = {};
            }

            dataByYear[yearRange][area] = { value: numericValue, raw: rawValue, isLessThan };

            if (numericValue < minValue) minValue = numericValue;
            if (numericValue > maxValue) maxValue = numericValue;
        });

        years = Object.keys(dataByYear).sort((a, b) => {
            const startYearA = +a.split('-')[0];
            const startYearB = +b.split('-')[0];
            return startYearA - startYearB;
        });
    }

    function createMap(svg) {
        const width = 900;
        const height = 500;
        const margin = { top: 230, right: 120, bottom: 20, left: 0 };

        const projection = d3.geoMercator()
            .fitExtent([
                [margin.left, margin.top],
                [width - margin.right, height - margin.bottom]
            ], geoData)
            .scale(115);

        const path = d3.geoPath().projection(projection);

        const d3Svg = d3.select(svg)
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet');

        const filteredFeatures = geoData.features.filter(feature => feature.properties.name !== "Antarctica");

        const mapGroup = d3Svg.append('g').attr('class', 'map-group');

        mapGroup.selectAll('path')
            .data(filteredFeatures)
            .join('path')
            .attr('d', path)
            .attr('fill', '#ccc')
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 0.5)
            .on('mouseover', function (event, d) {
                d3.select(this).attr('stroke-width', 1.5); // Highlight outline
                hoveredCountry = d.properties.name.trim(); // Track hovered country

                const yearRange = currentYearIndex === -1 ? null : years[currentYearIndex];
                const dataEntry = yearRange ? dataByYear[yearRange]?.[hoveredCountry] : null;
                updateTooltipContent(hoveredCountry, dataEntry); // Use 'N/A' for initial state
            })
            .on('mousemove', function (event) {
                moveTooltip(event); // Move tooltip dynamically
            })
            .on('mouseout', function () {
                d3.select(this).attr('stroke-width', 0.5);
                hoveredCountry = null;
                hideTooltip();
            });

        createYearLabel();

        tooltipElement = d3.select('.tooltip');
        createColorScaleLegend(d3Svg, colorScale);

        if (isPlaying) {
            startAnimation(mapGroup);
        }
    }

    d3.select('.map-svg')
        .on('mouseleave', function () {
            hoveredCountry = null;
            hideTooltip();
        });

    function createColorScaleLegend(svg, colorScale) {
        const legendWidth = 10;
        const legendHeight = 200;
        
        const margin = { top: 120, right: 95, bottom: 0, left: 20 };

        const legendGroup = svg.append('g')
            .attr('class', 'color-legend')
            .attr('transform', `translate(${+svg.attr('width') - margin.right - legendWidth}, ${margin.top})`)
            .attr('preserveAspectRatio', 'xMidYMid meet');

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

        legendGroup.append('text')
        .attr('x', 0) // Adjust position as needed
        .attr('y', -10) // Position above the gradient
        .attr('text-anchor', 'start') // Align the text to the start
        .attr('font-size', '0.7em')
        .attr('font-weight', 'bold')
        .attr('fill', '#333')
        .text('Food Insecurity (%)');

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

    function startAnimation(mapGroup) {
        if (currentYearIndex === -1 || currentYearIndex >= years.length) {
            currentYearIndex = 0;
        }

        if (timer) timer.stop();

        const initialYearRange = years[currentYearIndex];
        updateMapColors(mapGroup, initialYearRange);
        updateYearLabel(initialYearRange);

        timer = d3.interval(() => {
            currentYearIndex += 1;
            if (currentYearIndex >= years.length) {
                timer.stop();
                isPlaying = false;
                animationFinished = true;
                currentYearIndex = years.length - 1;
                return;
            }
            const yearRange = years[currentYearIndex];
            updateMapColors(mapGroup, yearRange);
            updateYearLabel(yearRange);
        }, 4000);
    }

    function selectYearRange(yearRange) {
        if (timer) timer.stop();
        isPlaying = false;

        currentYearIndex = years.indexOf(yearRange);


        const mapGroup = d3.select(svgElement).select('.map-group');
        updateMapColors(mapGroup, yearRange);
        updateYearLabel(yearRange);
    }

    function updateMapColors(mapGroup, yearRange) {
        const data = dataByYear[yearRange];
        
        mapGroup.selectAll('path')
            .transition()
            .duration(800)
            .attr('fill', d => {
                const countryName = d.properties.name.trim();
                const dataEntry = data ? data[countryName] : null;

                if (!dataEntry || dataEntry.raw.trim() === "") {
                    return '#ccc';
                }

                return getColor(dataEntry);
            })
            .on('end', () => {
                if (hoveredCountry) {
                    const hoveredData = data ? data[hoveredCountry] : null;
                    if (hoveredData) {
                        updateTooltipContent(hoveredCountry, hoveredData);
                    } else {
                        hideTooltip();
                    }
                }
            });
    }

    function getColor(d) {
        const value = d.value;
        const isLessThan = d.isLessThan;

        if (isNaN(value)) {
            return '#ccc';
        }

        if (isLessThan) {
            return '#fde725';
        } else {
            return colorScale(value);
        }
    }

    function createYearLabel() {
        const yearSvg = d3.select('.year-label-svg');

        yearSvg
            .append('text')
            .attr('class', 'year-label-static')
            .attr('x', '50%')
            .attr('y', '50%')
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .attr('font-size', '16px')
            .attr('font-weight', 'bold')
            .attr('fill', '#333')
            .attr('dx', '-30') 
            .text('')

        yearSvg
            .append('text')
            .attr('class', 'year-label-dynamic')
            .attr('x', '50%')
            .attr('y', '50%')
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .attr('font-size', '16px')
            .attr('font-weight', 'bold')
            .attr('fill', '#333')
            .attr('dx', '60')
            .text('');
    }

    function updateYearLabel(yearRange) {
        const yearLabelStatic = d3.select('.year-label-svg').select('.year-label-static');
        const yearLabelDynamic = d3.select('.year-label-svg').select('.year-label-dynamic');

        if (yearLabelDynamic.text() !== yearRange) {
            if (yearLabelStatic.text() === "") {
                yearLabelStatic
                    .transition()
                    .duration(500)
                    .attr('transform', 'translate(0, 0)')
                    .style('opacity', 0)
                    .on('end', () => {
                        yearLabelStatic
                            .text('Year Range: ')
                            .attr('transform', 'translate(0, -30)')
                            .style('opacity', 0)
                            .transition()
                            .duration(500)
                            .attr('transform', 'translate(0, 0)') // Slide to position
                            .style('opacity', 1) // Make visible
                            .ease(d3.easeCubicOut);
                    });
            }

            yearLabelDynamic
                .transition()
                .duration(500)
                .attr('transform', 'translate(0, 0)')
                .style('opacity', 0)
                .on('end', () => {
                    yearLabelDynamic
                        .text(yearRange)
                        .attr('transform', 'translate(0, -30)')
                        .style('opacity', 0)
                        .transition()
                        .duration(500)
                        .attr('transform', 'translate(0, 0)')
                        .style('opacity', 1)
                        .ease(d3.easeCubicOut);
                });
        }
    }

    function togglePlayPause(mapGroup) {
        isPlaying = !isPlaying;

        if (isPlaying) {
            if (currentYearIndex >= years.length || currentYearIndex === -1) {
                currentYearIndex = 0;
            }
            startAnimation(mapGroup);
        } else {
            if (timer) timer.stop();
        }
    }

    function updateTooltipContent(countryName, dataEntry) {
        const tooltip = d3.select('.tooltip');
        let value;

        if (dataEntry && dataEntry.value !== null && dataEntry.value !== undefined) {
            if (isNaN(dataEntry.value) || dataEntry.raw.trim() === "") {
                value = 'N/A';
            } else {
                value = `${dataEntry.value.toFixed(1)}%`;
            }
        } else {
            value = 'N/A';
        }

        const tooltipContent = `
            <strong style="font-size: 16px; font-weight: bold;">
                ${countryName}
            </strong>
            <div style="margin-top: 5px;">
                Prevalence: <span style="color: #ff7f50;">${value}</span>
            </div>
        `;

        tooltip
            .html(tooltipContent)
            .style('opacity', 1) // Fade in
            .style('transform', 'translate(-50%, -100%) scale(1)');
    }

    function moveTooltip(event) {
        const tooltip = d3.select('.tooltip');
        const svgBounds = svgElement.getBoundingClientRect(); // Get the SVG container's position
        const tooltipWidth = tooltip.node().offsetWidth;
        const tooltipHeight = tooltip.node().offsetHeight;

        // Calculate the cursor position relative to the SVG container
        let x = event.clientX - svgBounds.left + 100; // Add padding
        let y = event.clientY - svgBounds.top + 250; // Add padding

        // Adjust horizontal position if the tooltip overflows on the right
        if (x + tooltipWidth > svgBounds.width) {
            x = event.clientX - svgBounds.left - tooltipWidth + 100;
        }

        // Adjust vertical position if the tooltip overflows on the bottom
        if (y + tooltipHeight > svgBounds.height) {
            y = event.clientY - svgBounds.top - tooltipHeight + 250;
        }

        tooltip
            .style('left', `${x}px`)
            .style('top', `${y}px`);
    }

    function hideTooltip() {
        const tooltip = d3.select('.tooltip');
        tooltip
            .style('opacity', 0) // Fade out
            .style('transform', 'translate(-50%, -100%) scale(0.9)'); // Scale down smoothly
    }

</script>

<div class="map-container">
    <h2>Global Prevalence of Food Insecurity</h2>
    <div class="description-wrapper">
            <p class="description" transition:fade={{ duration: 500 }}>
                {@html descriptionText}
            </p>
    </div>

    <div class="year-label-container">
        <svg class="year-label-svg"></svg>
        {#if !animationFinished}
            <button
                on:click={() => togglePlayPause(d3.select(svgElement).select('.map-group'))}
                class="play-pause-button"
            >
                {#if isPlaying}
                    &#10074;&#10074; <!-- Pause Icon -->
                {:else}
                    &#9658; <!-- Play Icon -->
                {/if}
            </button>
        {/if}
    </div>    

    <!-- Year Range Buttons -->
    {#if animationFinished}
        <div class="year-buttons" transition:slide>
            {#each years as yearRange}
                <button 
                    on:click={() => selectYearRange(yearRange)}
                    class="{yearRange === years[currentYearIndex] ? 'active' : ''}">
                    {yearRange}
                </button>
            {/each}
        </div>
    {/if}

    <!-- SVG for Map -->
    <svg class="map-svg" bind:this={svgElement}></svg>

    <!-- Tooltip -->
    <div class="tooltip"></div>
</div>

<style>
    .map-container {
        display: flex;
        flex-direction: column;
        justify-content: space-between; /* Space between the map and year-buttons */
        align-items: center;
        width: 100%;
        height: calc(100vh - 110px); /* Set max height to fit viewport */
        overflow: hidden; /* Prevent overflow */
        padding: 10px;
        box-sizing: border-box;
        position: relative;
    }

    h2 {
        margin-bottom: 10px;
        color: #333;
    }

    .description-wrapper {
        width: 100%; /* Ensure it matches the description width */
        max-width: 900px;
        text-align: center;
        min-height: 96px; /* Set a minimum height to prevent shifting */
        display: flex; /* Center the description vertically */
        justify-content: center;
        align-items: center;
        position: relative;
    }

    .description {
        margin: 0; /* Avoid extra spacing */
        color: #555;
        line-height: 1.5;
    }

    .play-pause-button {
        background-color: #f7f7f7; /* Clean light grey look */
        border: 1px solid #ddd; /* Subtle border */
        border-radius: 50%; /* Circular shape */
        width: 30px; /* Button size */
        height: 30px; /* Match width for a perfect circle */
        font-size: 15px; /* Font size for the icon */
        font-weight: bold; /* Make the icon more prominent */
        color: #333; /* Dark text color */
        display: flex; /* Center icon within the button */
        justify-content: center; /* Center horizontally */
        align-items: center; /* Center vertically */
        cursor: pointer; /* Pointer cursor for interactivity */
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
        transition: all 0.3s ease; /* Smooth hover and click effects */
    }

    .play-pause-button:hover {
        background-color: #333; /* Darker background on hover */
        color: #fff; /* White text/icon for contrast */
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Enhance shadow on hover */
        border: 1px solid #333; /* Match hover background color */
    }

    .play-pause-button:active {
        transform: scale(0.9); /* Press-down effect */
    }

    .play-pause-button[hidden] {
        opacity: 0; /* Fade out */
        transform: scale(0.8); /* Scale down */
    }

    svg {
        flex: 1; /* Allow SVG to grow/shrink within container */
        width: 100%;
        max-height: calc(100% - 50px); /* Subtract space for year-buttons */
    }

    /* Tooltip Styling */
    .tooltip {
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

    /* Legend Styling */
    .legend text {
        font-size: 10px;
    }

    .year-label-container {
        display: flex; /* Align items horizontally */
        justify-content: center; /* Center items in the container */
        align-items: center; /* Align items vertically */
        gap: 10px; /* Add spacing between the year label and play button */
        width: 100%; /* Take full width of the container */
        margin: 0; /* Add spacing above and below the container */
        position: relative; /* Stay in flow between description and map */
    }

    .year-label-svg {
        max-height: 40px; /* Set max height to fit viewport */
        overflow: visible; /* Prevent overflow */
        position: relative;
        flex-shrink: 1; /* Prevent shrinking too much */
    }

    .map-svg {
        flex: 1; /* Allow SVG to grow/shrink within container */
        width: 100%;
        max-height: calc(100% - 50px); /* Subtract space for year-buttons */
        position: relative;
    }

    /* Year Label Styling */
    .year-label {
        font-weight: bold;
    }

    .year-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: center;
        max-width: 90%;
        margin: 5px auto;
        overflow: hidden;
    }

    .year-buttons button {
        padding: 5px 10px;
        border: 1px solid #ddd;
        background-color: #f9f9f9;
        cursor: pointer;
        transition: all 0.2s;
    }

    .year-buttons button:hover {
        background-color: #eee;
    }

    .year-buttons button:active,
    .year-buttons button.active {
        background-color: #ddd; /* Darker gray */
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) inset; /* Inner shadow */
        transform: translateY(1px); /* Pressed effect */
        color: #333; /* Ensure text is readable */
    }
</style>