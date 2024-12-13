<script>
    import { onMount } from "svelte";
    import * as d3 from "d3";
    import { sankey, sankeyLinkHorizontal } from "d3-sankey";
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';
    import { get } from 'svelte/store';

    export let data = { nodes: [], links: [] };

    let svg;
    let tooltipContainer;
    let tooltip;

    const width = 1380;
    const height = 510;

    const caloriesPerKg = 4000;
    const kcalPerPerson = 2000;

    const householdRecovery = tweened(10, { duration: 500, easing: cubicOut });
    const retailRecovery = tweened(10, { duration: 500, easing: cubicOut });
    const foodServiceRecovery = tweened(10, { duration: 500, easing: cubicOut });

    const totalCaloriesValue = tweened(0, { duration: 500, easing: cubicOut });
    const peopleFedValue = tweened(0, { duration: 500, easing: cubicOut });

    let totalCalories = 0;
    let peopleFed = 0;

    let colorScale;
    $: colorScale = d3.scaleOrdinal()
        .domain(data.nodes.map(d => d.name))
        .range(["#4B9CD3", "#E15759", "#76B7B2", "#F28E2B", "#EDC948", "#59A14F"]);

    let zoomBehavior;
    let sankeyGroup;

    onMount(() => {
        tooltip = d3
            .select(tooltipContainer)
            .append("div")
            .attr("class", "sankey-tooltip")
            .style("opacity", 0)
            .style("position", "absolute");
        
        zoomBehavior = d3.zoom()
            .scaleExtent([0.5, 5])
            .on("zoom", (event) => {
            sankeyGroup.attr("transform", event.transform);
        });    

        const svgSelection = d3.select(svg)
            .attr("width", width)
            .attr("height", height)
            .call(zoomBehavior)
            .append("g")
            .attr("class", "sankey-group");

        sankeyGroup = svgSelection;

        sankeyGroup.append("g").attr("class", "links");
        sankeyGroup.append("g").attr("class", "link-labels");
        sankeyGroup.append("g").attr("class", "nodes");
        sankeyGroup.append("g").attr("class", "labels");

        d3.select(svg)
            .append("text")
            .attr("class", "no-data")
            .attr("x", width / 2)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .style("fill", "#777")
            .style("font-size", "2em")
            .style("display", "none")
            .text("No data to display");

        updateData();
    });

    function resetZoom() {
        d3.select(svg)
            .transition()
            .duration(750)
            .call(zoomBehavior.transform, d3.zoomIdentity);
    }

    householdRecovery.subscribe(() => updateData());
    retailRecovery.subscribe(() => updateData());
    foodServiceRecovery.subscribe(() => updateData());

    function updateData() {
        if (!sankeyGroup) {
            console.warn("sankeyGroup is not defined yet. Delaying updateData.");
            return;
        }

        const currentHousehold = get(householdRecovery);
        const currentRetail = get(retailRecovery);
        const currentFoodService = get(foodServiceRecovery);
        
        let updatedLinks = data.links.map(link => ({ ...link }));

        updatedLinks.forEach(link => {
            const sourceName = data.nodes[link.source].name;
            if (sourceName === "Household") {
                link.value = (currentHousehold / 100) * link.value;
            } else if (sourceName === "Retail") {
                link.value = (currentRetail / 100) * link.value;
            } else if (sourceName === "Food service") {
                link.value = (currentFoodService / 100) * link.value;
            }
        });

        totalCalories = updatedLinks.reduce(
            (sum, link) => sum + (link.value / 365) * caloriesPerKg,
            0
        );
        peopleFed = Math.floor(totalCalories / kcalPerPerson);

        totalCaloriesValue.set(totalCalories);
        peopleFedValue.set(peopleFed);

        createSankey(updatedLinks);
    }

    function createSankey(updatedLinks) {
        if (!sankeyGroup) {
            console.error("sankeyGroup is not defined. Cannot create Sankey diagram.");
            return;
        }
        
        const sankeyGenerator = sankey()
            .nodeWidth(20)
            .nodePadding(20)
            .extent([[1, 1], [width - 1, height - 6]]);

        const filteredLinks = updatedLinks.filter(link => link.value > 0);

        if (filteredLinks.length === 0) {
            console.log("No links to display");
            d3.select(svg).select(".no-data").style("display", "block");
            sankeyGroup.style("display", "none");
            return;
        } else {
            d3.select(svg).select(".no-data").style("display", "none");
            sankeyGroup.style("display", "block");
        }

        const sankeyData = sankeyGenerator({
            nodes: data.nodes.map(d => Object.assign({}, d)),
            links: filteredLinks.map(d => Object.assign({}, d)),
        });

        const { nodes, links } = sankeyData;

        const activeNodeNames = new Set();
        links.forEach(link => {
            activeNodeNames.add(link.source.name);
            activeNodeNames.add(link.target.name);
        });

        // Update Links
        const linkSelection = sankeyGroup.select(".links")
            .selectAll("path")
            .data(links, d => `${d.source.name}->${d.target.name}`);

        // EXIT old links
        linkSelection.exit().remove();

        // ENTER new links
        const linkEnter = linkSelection.enter().append("path")
            .attr("d", sankeyLinkHorizontal())
            .attr("fill", "none")
            .attr("stroke", "#B0B0B0")
            .attr("stroke-opacity", 0.5)
            .attr("stroke-width", d => Math.max(1, d.width))
            .on("mouseover", function (event, d) {
                d3.select(this).transition()
                    .duration(200)
                    .attr("stroke-opacity", 0.8)
                    .attr("stroke", "#4b9cd3")
                    .attr("stroke-width", d => Math.max(2, d.width + 1));
                showTooltip(event, d);
            })
            .on("mousemove", moveTooltip)
            .on("mouseout", function () {
                d3.select(this).transition()
                    .duration(200)
                    .attr("stroke-opacity", 0.5)
                    .attr("stroke", "#B0B0B0")
                    .attr("stroke-width", d => Math.max(1, d.width));
                hideTooltip();
            });

        // MERGE and UPDATE existing links
        linkEnter.merge(linkSelection)
            .transition()
            .duration(750)
            .attr("d", sankeyLinkHorizontal())
            .attr("stroke-width", d => Math.max(1, d.width))
            .attr("stroke", "#B0B0B0");

        // Update Link Labels (Percentages)
        const linkLabelSelection = sankeyGroup.select(".link-labels")
            .selectAll("text")
            .data(links, d => `${d.source.name}->${d.target.name}`);

        // EXIT old labels
        linkLabelSelection.exit().remove();

        // ENTER new labels
        const linkLabelEnter = linkLabelSelection.enter().append("text")
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .text(d => {
                const dailyCalories = (d.value / 365) * caloriesPerKg;
                const percentage = totalCalories ? ((dailyCalories / totalCalories) * 100).toFixed(1) : 0;
                return `${percentage}%`;
            })
            .style("font-size", "10px")
            .style("fill", "#444")
            .style("pointer-events", "none");

        // MERGE and UPDATE existing link labels
        linkLabelEnter.merge(linkLabelSelection)
            .transition()
            .duration(750)
            .attr("x", d => {
                const path = sankeyLinkHorizontal()(d);
                const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
                pathElement.setAttribute("d", path);
                const pathLength = pathElement.getTotalLength();
                const offsetFactor = 0.80;
                const offsetPoint = pathElement.getPointAtLength(pathLength * offsetFactor);
                return offsetPoint.x;
            })
            .attr("y", d => {
                const path = sankeyLinkHorizontal()(d);
                const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
                pathElement.setAttribute("d", path);
                const pathLength = pathElement.getTotalLength();
                const offsetFactor = 0.80;
                const offsetPoint = pathElement.getPointAtLength(pathLength * offsetFactor);
                return offsetPoint.y;
            })
            .text(d => {
                const dailyCalories = (d.value / 365) * caloriesPerKg;
                const percentage = totalCalories ? ((dailyCalories / totalCalories) * 100).toFixed(1) : 0;
                return `${percentage}%`;
            });

        // Update Nodes
        const nodeSelection = sankeyGroup.select(".nodes")
            .selectAll("rect")
            .data(nodes, d => d.name);

        // EXIT old nodes
        nodeSelection.exit().remove();

        // ENTER new nodes
        const nodeEnter = nodeSelection.enter().append("rect")
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("width", d => Math.max(20, d.x1 - d.x0))
            .attr("height", d => Math.max(20, d.y1 - d.y0))
            .attr("fill", d => colorScale(d.name))
            .attr("opacity", d => activeNodeNames.has(d.name) ? 0.9 : 0.5)
            .attr("class", "node-shadow")
            .on("mouseover", function () {
                d3.select(this).attr("opacity", 1);
            })
            .on("mouseout", function () {
                d3.select(this).attr("opacity", 0.9);
            });

        // MERGE and UPDATE existing nodes
        nodeEnter.merge(nodeSelection)
            .transition()
            .duration(750)
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("width", d => Math.max(20, d.x1 - d.x0))
            .attr("height", d => Math.max(20, d.y1 - d.y0))
            .attr("fill", d => colorScale(d.name))
            .attr("opacity", d => activeNodeNames.has(d.name) ? 0.9 : 0.5);

        // Update Node Labels
        const nodeLabelSelection = sankeyGroup.select(".labels")
            .selectAll("text")
            .data(nodes, d => d.name);

        // EXIT old labels
        nodeLabelSelection.exit().remove();

        // ENTER new labels
        const nodeLabelEnter = nodeLabelSelection.enter().append("text")
            .attr("dy", "0.35em")
            .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
            .text(d => d.name)
            .style("font-size", "12px")
            .style("fill", "#333");

        // MERGE and UPDATE existing labels with transitions
        nodeLabelEnter.merge(nodeLabelSelection)
            .transition()
            .duration(750)
            .attr("x", d => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
            .attr("y", d => (d.y1 + d.y0) / 2)
            .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end");
    }

    function showTooltip(event, d) {
        const dailyWaste = d.value / 365; // Convert annual waste to daily
        const dailyCalories = dailyWaste * caloriesPerKg; // Calories per day
        const peopleFed = Math.floor(dailyCalories / kcalPerPerson);

        tooltip
            .html(`
                <b>${d.source.name} → ${d.target.name}</b><br>
                Daily Waste: ${dailyWaste.toFixed(2)} kg/day<br>
                Daily Calories: ${Math.round(dailyCalories)} kcal/day<br>
                People Fed: ${peopleFed} people/day
            `)
            .style("opacity", 1);
    }

    function moveTooltip(event) {
        const [mouseX, mouseY] = d3.pointer(event, tooltipContainer);

        const containerRect = tooltipContainer.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;

        const tooltipRect = tooltip.node().getBoundingClientRect();
        const tooltipWidth = tooltipRect.width;
        const tooltipHeight = tooltipRect.height;

        let x = mouseX + 10; // offset to the right
        let y = mouseY - 20; // offset above the cursor

        if (x + tooltipWidth > containerWidth) {
            x = mouseX - tooltipWidth - 10; // position tooltip to the left
        }

        // adjust y position if tooltip goes beyond the bottom 
        if (y + tooltipHeight > containerHeight) {
            y = mouseY - tooltipHeight - 10; // position tooltip above cursor
        }

        // ensure tooltip doesn't go above the top 
        if (y < 0) {
            y = mouseY + 20; // position tooltip below cursor
        }

        // ensure tooltip doesn't go beyond the left
        if (x < 0) {
            x = mouseX + 10; // adjust to the right
        }

        tooltip
            .style("left", `${x}px`)
            .style("top", `${y}px`);
    }

    function hideTooltip() {
        tooltip.style("opacity", 0);
    }

    function resetSliders() {
        householdRecovery.set(10);
        retailRecovery.set(10);
        foodServiceRecovery.set(10);

        updateData();
    }
</script>

<div class="container">
    <h1>Food Redistribution</h1>
    <div class="intro-container">
        <p class="intro">
            This interactive Sankey diagram shows the potential flow of food waste from sources such as households, retail, and food services to regions of need. 
            The percentages represent the proportion of food waste recovered from each source, starting at a default recovery rate of 10%.
            <br><em>Adjust the recovery rates to explore how redistributing even a fraction of food waste could impact food insecurity worldwide. <br>Hover over links for details on waste and calories, and use zoom or pan to explore the diagram further.</em>
        </p>
    </div>

    <!-- Summary Section -->
    <div class="summary">
        <div class="summary-item">
            <p class="label">🍽️ Total Calories Recovered</p>
            <p class="value">{$totalCaloriesValue.toFixed(0)}</p>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-item">
            <p class="label">👤 Total People Fed</p>
            <p class="value">{$peopleFedValue.toFixed(0)}</p>
        </div>
    </div>
  
    <!-- Sliders -->
    <div class="sliders-container">
        <div class="sliders">
            <div class="slider-container">
                <label for="household">Household: <span>{Math.round($householdRecovery)}%</span></label>
                <input
                    id="household"
                    type="range"
                    min="0"
                    max="100"
                    bind:value={$householdRecovery}
                />
            </div>
            <div class="slider-container">
                <label for="retail">Retail: <span>{Math.round($retailRecovery)}%</span></label>
                <input
                    id="retail"
                    type="range"
                    min="0"
                    max="100"
                    bind:value={$retailRecovery}
                />
            </div>
            <div class="slider-container">
                <label for="foodService">Food Service: <span>{Math.round($foodServiceRecovery)}%</span></label>
                <input
                    id="foodService"
                    type="range"
                    min="0"
                    max="100"
                    bind:value={$foodServiceRecovery}
                />
            </div>
            <button class="reset-button" on:click="{resetSliders}">Reset Sliders</button>
        </div>
    </div>    

    <!-- Tooltip Container -->
    <div class="tooltip-container" bind:this={tooltipContainer}></div>
  
    <!-- Sankey Diagram -->
    <div class="svg-container">
        <svg bind:this={svg} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet"></svg>
        <button class="reset-button zoom-reset" on:click="{resetZoom}">Reset Zoom</button>
    </div>

    <!-- Description Section -->
    <div class="description">
        <p><em>
        The percentages shown on the diagram represent the proportion of daily
        calories recovered from food waste relative to the total calories recovered.
        </em></p>
    </div>
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: calc(100vh - 110px);
        overflow: hidden;
        box-sizing: border-box;
        position: relative;
        max-width: 1000px;
        animation: fadeIn 1s ease-in-out;
    }

    .container h1 {
        font-size: 1.5em;
        font-weight: 700;
        text-align: center;
        margin-bottom: 10px;
        color: #333;
    }

    .intro-container {
        background-color: #f9f9f9;
        border-left: 4px solid #4b9cd3;
        margin-bottom: 15px;
        border-radius: 4px;
        max-width: 1000px;
    }

    .intro {
        font-size: 0.86em;
        font-weight: 400;
        line-height: 1.6;
        color: #555;
        text-align: center;
        margin: 5px;
        max-width: 1000px;
    }

    .intro em {
        display: block;
        margin-top: 10px;
        color: #777;
        font-style: italic;
    }

    .svg-container {
        position: relative;
        width: 100%;
        max-width: 998px;
        height: 370px;
        overflow: hidden;
        border: 1px solid #ddd;
        margin: 0;
    }

    svg {
        width: 100%;
        height: 100%;
        cursor: move;
    }

    h1 {
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 10px;
        text-align: center;
    }

    .summary {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: #f9f9f9;
        border-radius: 8px;
        padding: 5px;
        font-family: 'Roboto', sans-serif;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border: 1px solid #ddd;
        margin-bottom: 10px;
        font-size: 14px;
        font-weight: bold;
        width: 100%;
        max-width: 985px;
    }

    .summary-item {
        flex: 1;
        text-align: center;
    }

    .summary-item .label {
        font-size: 10px;
        font-weight: 500;
        color: #777;
        margin: 0px;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .summary-item .value {
        font-size: 16px;
        font-weight: 700;
        color: #4b9cd3;
        margin: 0;
    }

    .summary-divider {
        width: 1px;
        background-color: #ddd;
        height: 40px;
        margin: 0 20px;
    }

    .value {
        animation: fadeIn 0.8s ease-in-out;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @media (max-width: 600px) {
        .summary {
            flex-direction: column;
            padding: 15px;
        }

        .summary-divider {
            display: none;
        }

        .summary-item {
            margin-bottom: 15px;
        }

        .summary-item:last-child {
            margin-bottom: 0;
        }
    }

    :global(.sankey-tooltip) {
        position: absolute;
        background-color: rgba(255, 255, 255, 0.95);
        border: 1px solid #ddd;
        padding: 8px 12px;
        border-radius: 4px;
        pointer-events: none;
        font-size: 13px;
        color: #333;
        line-height: 1.5;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: opacity 0.3s ease, transform 0.3s ease;
        z-index: 9999;
    }
  
    .tooltip-container {
        position: relative;
        width: 100%;
    }

    .sliders-container {
        width: 100%;
    }
  
    .sliders {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 20px;
        margin-top: 10px;
        margin-bottom: 20px;
    }

    .slider-container {
        display: flex;
        flex-direction: column;
        flex: 1;
        max-width: 200px;
    }

    .slider-container label {
        font-size: 13px;
        color: #333;
        font-weight: 500;
        margin-bottom: 5px;
        display: flex;
        justify-content: space-between;
    }

    .slider-container input[type='range'] {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 6px;
        background: linear-gradient(to right, #4b9cd3, #76b7b2);
        border-radius: 5px;
        outline: none;
        opacity: 0.8;
        transition: opacity 0.3s ease;
    }

    .slider-container input[type='range']:hover {
        opacity: 1;
    }

    .slider-container input[type='range']::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 18px;
        background: #fff;
        border: 2px solid #4b9cd3;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        transition: background-color 0.2s ease, transform 0.2s ease;
    }

    .slider-container input[type='range']::-webkit-slider-thumb:hover {
        background-color: #4b9cd3;
        transform: scale(1.1);
    }

    .slider-container label span {
        font-size: 13px;
        color: #4b9cd3;
        font-weight: bold;
    }

    .reset-button {
        background-color: #f5f5f5;
        color: #333;
        border: 1px solid #ddd;
        border-radius: 5px;
        padding: 8px 13px;
        font-size: 13px;
        text-transform: uppercase;
        cursor: pointer;
        transition: background-color 0.3s ease, box-shadow 0.3s ease;
        align-self: flex-end;
    }

    .reset-button:hover {
        background-color: #eaeaea;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .reset-button:active {
        background-color: #ddd;
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
    }

    .description {
        font-size: 12px;
        color: #555;
        text-align: center;
        line-height: 1.4;
    }

    .description p {
        font-size: 0.9em;
        color: #888;
        margin-top: 5px;
        margin-bottom: 0px;
        padding: 0;
    }

    .zoom-reset {
        position: absolute;
        bottom: 10px;
        left: 10px;
    }
</style>
