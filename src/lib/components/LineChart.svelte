<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import { base } from '$app/paths';

    let chartContainer;
    let tooltipContainer;
    let selectedRegion = "All regions";

    let data;
    let svg, tooltip;
    let x, y, line;
    let width, height;
    let mainRegions, regionMapping, margin, colorScale;

    onMount(async () => {
        data = await d3.csv(`${base}/FAOSTAT_data_en_11-21-2024.csv`);

        data = data.filter(d => 
            d.Item === "Prevalence of moderate or severe food insecurity in the total population (percent) (3-year average)"
        ).filter(d => d.Year.split('-')[0] >= 2014);

        data.forEach(d => {
            d.year = d3.timeParse("%Y-%Y")(d.Year);
            d.value = +d.Value;
        });

        data = data.filter(d => d.value > 0);

        regionMapping = {
            "Africa": ["Eastern Africa", "Middle Africa", "Northern Africa", "Southern Africa", "Western Africa", "Sub-Saharan Africa"],
            "Asia": ["Central Asia", "Eastern Asia", "Southern Asia", "Western Asia", "South-eastern Asia"],
            "Northern America": ["United States of America", "Canada", "Mexico"],
            "Europe": ["Eastern Europe", "Western Europe", "Northern Europe", "Southern Europe"],
            "Central America": ["Belize", "Costa Rica", "El Salvador", "Guatemala", "Honduras", "Nicaragua", "Panama"],
            "South America": ["Argentina", "Bolivia", "Brazil", "Chile", "Colombia", "Ecuador", "Paraguay", "Peru", "Uruguay", "Venezuela"],
            "Oceania": ["Australia and New Zealand", "Melanesia", "Micronesia", "Polynesia"]
        };

        mainRegions = ["Africa", "Asia", "Northern America", "Europe", "Central America", "South America", "Oceania"];

        margin = { top: 20, right: 100, bottom: 50, left: 60 };
        width = 650 - margin.left - margin.right;
        height = 300 - margin.top - margin.bottom;

        x = d3.scaleTime().range([0, width]);
        y = d3.scaleLinear().range([height, 0]);

        line = d3.line()
            .x(d => x(d.year))
            .y(d => y(d.value))
            .curve(d3.curveCatmullRom.alpha(0.5));

        colorScale = d3.scaleOrdinal(d3.schemeTableau10);

        svg = d3.select(chartContainer)
            .append("svg")
            .attr("id", "line-svg")
            .attr("preserveAspectRatio", "xMidYMid meet")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .style("background", "#fff")
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        tooltip = d3
            .select(tooltipContainer)
            .append("div")
            .attr("class", "line-tooltip")
            .style("opacity", 0)
            .style("position", "absolute");

        updateChart(selectedRegion);
    });

    function updateChart(selectedRegion) {
        let regionsToInclude;
        if (selectedRegion === "All regions") {
            regionsToInclude = mainRegions;
        } else {
            regionsToInclude = regionMapping[selectedRegion] || [];
        }

        const filteredData = data.filter(d => regionsToInclude.includes(d.Area));
        const groupedData = d3.groups(filteredData, d => d.Area);

        x.domain(d3.extent(filteredData, d => d.year));
        y.domain([0, d3.max(filteredData, d => d.value)]);

        svg.selectAll("*").remove();

        const xAxis = d3.axisBottom(x)
            .ticks(6)
            .tickSize(-height)
            .tickPadding(10);
        const yAxis = d3.axisLeft(y)
            .ticks(6)
            .tickSize(-width)
            .tickPadding(10);

        svg.append("g")
            .attr("class", "grid grid-y")
            .call(yAxis)
            .selectAll(".domain").remove();

        svg.append("g")
            .attr("class", "grid grid-x")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis)
            .selectAll(".domain").remove();

        svg.append("text")
            .attr("class", "axis-title")
            .attr("transform", `translate(${width / 2},${height + margin.bottom - 10})`)
            .style("text-anchor", "middle")
            .text("Year")
            .style("font-size", "14px");

        svg.append("text")
            .attr("class", "axis-title")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -margin.left + 20)
            .style("text-anchor", "middle")
            .text("Food Insecure People in Total Population (%)")
            .style("font-size", "14px");

        const lineGroups = svg.selectAll(".line-group")
            .data(groupedData, d => d[0]);

        const lineEnter = lineGroups.enter().append("g")
            .attr("class", "line-group");

        lineEnter.append("path")
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", d => colorScale(d[0]))
            .attr("stroke-width", 1.5)
            .attr("d", d => line(d[1]))
            .each(function(d) {
                const path = d3.select(this);
                const totalLength = this.getTotalLength();
                path.attr("stroke-dasharray", totalLength + " " + totalLength)
                    .attr("stroke-dashoffset", totalLength)
                    .transition()
                    .duration(1000)
                    .ease(d3.easeCubicOut)
                    .attr("stroke-dashoffset", 0);
            });

        lineEnter.each(function([region, values]) {
            d3.select(this).selectAll(".circle")
                .data(values)
                .enter()
                .append("circle")
                .attr("class", "circle")
                .attr("cx", d => x(d.year))
                .attr("cy", d => y(d.value))
                .attr("r", 3)
                .attr("fill", colorScale(region))
                .attr("opacity", 0)
                .transition()
                .delay((d, i) => i * 30)
                .duration(500)
                .attr("opacity", 1);
        });

        lineEnter.each(function([region, values]) {
            const lastPoint = values[values.length - 1];
            d3.select(this).append("text")
                .attr("class", "line-label")
                .attr("x", x(lastPoint.year) + 5)
                .attr("y", y(lastPoint.value))
                .attr("dy", "0.35em")
                .style("font-size", "13px")
                .style("font-weight", "400")
                .style("fill", "#444")
                .text(region);
        });

        repositionLabels();

        lineEnter
            .on("mouseover", function() {
                d3.selectAll(".line-group .line").attr("stroke-opacity", 0.1);
                d3.select(this).select(".line").attr("stroke-opacity", 1).attr("stroke-width", 2);

                d3.selectAll(".line-group .circle").attr("opacity", 0.1);
                d3.select(this).selectAll(".circle").attr("opacity", 1);

                d3.selectAll(".line-label").style("fill-opacity", 0.1);
                d3.select(this).select(".line-label").style("fill-opacity", 1);
            })
            .on("mouseout", function() {
                d3.selectAll(".line-group .line")
                    .attr("stroke-opacity", 1)
                    .attr("stroke-width", 1.5);
                d3.selectAll(".line-group .circle").attr("opacity", 1);
                d3.selectAll(".line-label").style("fill-opacity", 1);
            });

        lineEnter.selectAll(".circle")
            .on("mouseover", function(event, d) {
                d3.select(this).transition()
                    .duration(200)
                    .attr("r", 6);
                showTooltip(event, d);
            })
            .on("mousemove", moveTooltip)
            .on("mouseout", function() {
                d3.select(this).transition()
                    .duration(200)
                    .attr("r", 3);
                hideTooltip();
            });
    }

    function showTooltip(event, d) {
        tooltip
            .html(`
                    <div style="font-size:14px;font-weight:600;text-align:center;margin-bottom:5px;">${d.Area}</div>
                    <div style="font-size:13px;"><strong>Year:</strong> ${d3.timeFormat("%Y")(d.year)}</div>
                    <div style="font-size:13px;"><strong>Food Insecurity Rate:</strong> ${d.value}%</div>
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

    function repositionLabels() {
        const labels = svg.selectAll(".line-label").nodes();
        
        labels.sort((a, b) => {
            return d3.select(a).attr("y") - d3.select(b).attr("y");
        });

        const labelPositions = labels.map(l => {
            let yVal = +d3.select(l).attr("y");
            return { node: l, y: yVal };
        });

        const padding = 20;

        for (let i = 1; i < labelPositions.length; i++) {
            const prev = labelPositions[i - 1];
            const curr = labelPositions[i];
            if (curr.y - prev.y < padding) {
                curr.y = prev.y + padding;
            }
        }

        labelPositions.forEach(d => {
            d3.select(d.node).attr("y", d.y);
        });
    }
</script>

<style>
    body, .container, text, .axis-title {
        font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
        color: #333;
        font-weight: 400;
    }

    :global(.grid line) {
        stroke: #f5f5f5;
        shape-rendering: crispEdges;
    }

    :global(.grid text) {
        fill: #555;
        font-size: 13px;
    }

    .axis-title {
        font-size: 13px;
        fill: #444;
        font-weight: 400;
    }

    .line {
        fill: none;
    }

    .circle {
        stroke: none;
    }

    .line-label {
        font-size: 13px;
        fill: #444;
        pointer-events: none;
    }

    :global(.line-tooltip) {
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

    #controls {
        margin-bottom: 5px;
        display: flex;
        gap: 15px;
        align-items: center;
    }

    label, select {
        margin-bottom: 10px;
        font-size: 14px;
        color: #333;
        font-weight: 400;
    }

    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 20px;
        background: #fff;
    }

    select {
        font-size: 14px;
        padding: 4px 6px;
        border: 1px solid #ccc;
        border-radius: 3px;
        outline: none;
    }

    h2 {
        font-size: 1.1em;
        margin-bottom: 20px;
        font-weight: 400;
        color: #222;
    }

    :global(#line-svg) {
        overflow: visible;
    }
</style>

<div class="container">
    <div id="controls">
        <label for="regionSelect">Select Region:</label>
        <select id="regionSelect" bind:value={selectedRegion} on:change={() => updateChart(selectedRegion)}>
            <option value="All regions">All regions</option>
            <option value="Africa">Africa</option>
            <option value="Asia">Asia</option>
            <option value="Northern America">Northern America</option>
            <option value="Europe">Europe</option>
            <option value="Central America">Central America</option>
            <option value="South America">South America</option>
            <option value="Oceania">Oceania</option>
        </select>
    </div>
    <div bind:this={chartContainer}></div>
    <div class="tooltip-container" bind:this={tooltipContainer}></div>
</div>
