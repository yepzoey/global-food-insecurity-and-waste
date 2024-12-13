<script>
  import { onMount } from "svelte";
  import * as d3 from "d3";

  export let data = [];

  let chart;
  let barsSvgElement;
  let xAxisSvgElement;
  let legendSvgElement;
  let scrollableContainer;
  let tooltip;
  let tooltipContainer;
  let currentCountry = null;

  let processedData = [];
  let stackedData = [];

  let currentSort = "total_desc";
  let currentTopN = 20;

  const barHeight = 25;
  const maxChartHeight = 310;
  const margin = { top: 0, right: 30, bottom: 30, left: 150 };

  onMount(() => {
    const width = 800;

    tooltip = d3
      .select(tooltipContainer)
      .append("div")
      .attr("class", "bar-tooltip")
      .style("opacity", 0)
      .style("position", "absolute");

    const legendSvg = d3
      .select(legendSvgElement)
      .attr("width", width)
      .attr("height", 50);

    const barsSvg = d3
      .select(barsSvgElement)
      .attr("width", width)
      .attr("height", 0);

    const xAxisSvg = d3
      .select(xAxisSvgElement)
      .attr("width", width)
      .attr("height", margin.bottom);

    let xScale = d3.scaleLinear();
    let yScale = d3.scaleBand().padding(0.1);
    const colorScale = d3
      .scaleOrdinal()
      .domain(["household", "retail", "food_service"])
      .range(["#a6cee3", "#1f78b4", "#b2df8a"]);

    const stack = d3.stack().keys(["household", "retail", "food_service"]);

    const legendGroup = legendSvg.append("g").attr("class", "legend");
    const xAxisGroup = xAxisSvg.append("g").attr("class", "x-axis");
    const yAxisGroup = barsSvg
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${margin.left},0)`);

    const gridlinesGroup = barsSvg.append("g").attr("class", "gridlines");

    const originalData = [...data];

    const transitionDuration = 800;
    const easing = d3.easeCubicInOut;

    updateChart();

    function updateChart() {
      processedData = [...data];

      switch (currentSort) {
        case "total_desc":
          processedData.sort((a, b) => b.total - a.total);
          break;
        case "total_asc":
          processedData.sort((a, b) => a.total - b.total);
          break;
        case "alphabetical_asc":
          processedData.sort((a, b) => a.country.localeCompare(b.country));
          break;
        case "alphabetical_desc":
          processedData.sort((a, b) => b.country.localeCompare(a.country));
          break;
      }

      if (currentTopN !== "all") {
        processedData = processedData.slice(0, currentTopN);
      }

      const barsHeight = processedData.length * barHeight + margin.top;
      const newContainerHeight = Math.min(barsHeight, maxChartHeight);

      d3.select(scrollableContainer)
        .transition()
        .duration(transitionDuration)
        .ease(easing)
        .style("height", `${newContainerHeight}px`);

      barsSvg
        .transition()
        .duration(transitionDuration)
        .ease(easing)
        .attr("height", barsHeight);

      xScale
        .domain([0, d3.max(processedData, (d) => d.total)])
        .range([margin.left, width - margin.right]);

      yScale
        .domain(processedData.map((d) => d.country))
        .range([margin.top, barsHeight]);

      stackedData = stack(processedData);

      const xGridlines = d3
        .axisBottom(xScale)
        .ticks(5)
        .tickSize(-barsHeight + margin.top)
        .tickFormat("");

      gridlinesGroup
        .transition()
        .duration(transitionDuration)
        .ease(easing)
        .attr("transform", `translate(0, ${barsHeight})`)
        .call(xGridlines);

      gridlinesGroup.selectAll("line").attr("stroke", "#ccc");

      const groups = barsSvg
        .selectAll("g.stack-group")
        .data(stackedData, (d) => d.key);

      groups
        .exit()
        .transition()
        .duration(transitionDuration)
        .ease(easing)
        .style("opacity", 0)
        .remove();

      const groupsEnter = groups
        .enter()
        .append("g")
        .attr("class", "stack-group")
        .attr("fill", (d) => colorScale(d.key));

      const allGroups = groupsEnter.merge(groups);

      const rects = allGroups
        .selectAll("rect")
        .data((d) => d, (d) => d.data.country);

      rects
        .exit()
        .transition()
        .duration(transitionDuration)
        .ease(easing)
        .attr("x", xScale(0))
        .attr("width", 0)
        .style("opacity", 0)
        .remove();

      const rectsEnter = rects
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("y", (d) => yScale(d.data.country))
        .attr("height", yScale.bandwidth())
        .attr("x", xScale(0))
        .attr("width", 0)
        .style("opacity", 0);

      rectsEnter
        .merge(rects)
        .on('mouseover', function(event, d) {
          const stackKey = d3.select(this.parentNode).datum().key;
          const value = d[1] - d[0];
          updateTooltipContent(event, d.data, stackKey, value);
        })
        .on("mousemove", moveTooltip)
        .on("mouseleave", hideTooltip)
        .transition()
        .duration(transitionDuration)
        .ease(easing)
        .attr("y", (d) => yScale(d.data.country))
        .attr("height", yScale.bandwidth())
        .attr("x", (d) => xScale(d[0]))
        .attr("width", (d) => xScale(d[1]) - xScale(d[0]))
        .style("opacity", 1);

      barsSvg.selectAll(".overlay-rect").remove();
      barsSvg.selectAll(".bar-label").remove();

      addLabels(processedData);

      updateAxes();
      addLegend();
    }

    function moveTooltip(event) {
      const [mouseX, mouseY] = d3.pointer(event, tooltipContainer);

      const containerRect = tooltipContainer.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;

      const tooltipRect = tooltip.node().getBoundingClientRect();
      const tooltipWidth = tooltipRect.width;
      const tooltipHeight = tooltipRect.height;

      let x = mouseX + 110; // offset to the right
      let y = mouseY - 100; // offset above the cursor

      if (x + tooltipWidth > containerWidth) {
          x = mouseX - tooltipWidth + 90; // position tooltip to the left
      }

      // adjust y position if tooltip goes beyond the bottom 
      if (y + tooltipHeight > containerHeight) {
          y = mouseY - tooltipHeight - 10; // position tooltip above cursor
      }

      // ensure tooltip doesn't go above the top 
      if (y < 0) {
          y = mouseY + 100; // position tooltip below cursor
      }

      // ensure tooltip doesn't go beyond the left
      if (x < 0) {
          x = mouseX + 110; // adjust to the right
      }

      tooltip
          .style("left", `${x}px`)
          .style("top", `${y}px`);
    }

    function hideTooltip() {
      tooltip
            .style('opacity', 0)
            .style('transform', 'translate(-50%, -100%) scale(0.9)');
      currentCountry = null;
    }

    function updateTooltipContent(event, data, stackKey, value) {
      tooltip
        .html(`
          <strong>${data.country}</strong><br>
          <span style="color:${colorScale(stackKey)};">
            ${stackKey.replace("_", " ").toUpperCase()}
          </span><br>
          ${value.toFixed(2)} kg/capita/year<br>
          Confidence: ${data.confidence}
        `)
        .style("opacity", 1)
        .style('transform', 'translate(-50%, -100%) scale(1)');
    }

    function updateAxes() {
      // x-axis
      const xAxis = d3.axisBottom(xScale).ticks(5);

      xAxisGroup
        .transition()
        .duration(transitionDuration)
        .ease(easing)
        .call(xAxis);

      xAxisGroup.selectAll("path").attr("stroke", "#333");
      xAxisGroup.selectAll("line").attr("stroke", "#ccc");
      xAxisGroup
        .selectAll("text")
        .attr("font-size", "12px")
        .attr("font-family", "Arial");

      // y-axis
      const yAxis = d3.axisLeft(yScale).tickSize(0);

      yAxisGroup
        .transition()
        .duration(transitionDuration)
        .ease(easing)
        .call(yAxis);

      yAxisGroup.selectAll("path").attr("stroke", "none");
      yAxisGroup
        .selectAll("text")
        .attr("font-size", "12px")
        .attr("font-family", "Arial")
        .style("text-anchor", "end");
    }

    function addLabels(processedData) {
      const labelOffset = 5;
      const labels = barsSvg.selectAll(".bar-label").data(processedData, (d) => d.country);

      labels
        .exit()
        .transition()
        .duration(transitionDuration)
        .ease(easing)
        .style("opacity", 0)
        .remove();

      const labelsEnter = labels
        .enter()
        .append("text")
        .attr("class", "bar-label")
        .attr("x", xScale(0))
        .attr("y", (d) => yScale(d.country) + yScale.bandwidth() / 2 + 4)
        .attr("text-anchor", "end")
        .attr("fill", "#000")
        .attr("font-size", "10px")
        .attr("font-family", "Arial")
        .style("opacity", 0)
        .text((d) => `${d.total.toFixed(1)}`);

      labelsEnter
        .merge(labels)
        .transition()
        .duration(transitionDuration)
        .ease(easing)
        .attr("x", (d) => xScale(d.total) - labelOffset)
        .attr("y", (d) => yScale(d.country) + yScale.bandwidth() / 2 + 4)
        .style("opacity", 1);
    }

    function addLegend() {
      legendGroup.selectAll("*").remove();

      legendGroup.attr("transform", `translate(${margin.left}, ${10})`);

      const legendItems = ["household", "retail", "food_service"];

      legendItems.forEach((key, i) => {
        const legendItem = legendGroup
          .append("g")
          .attr("class", "legend-item")
          .attr("transform", `translate(${i * 150},0)`);

        legendItem
          .append("rect")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", 15)
          .attr("height", 15)
          .attr("fill", colorScale(key))
          .style("cursor", "pointer")
          .on("click", () => {
            const stackGroup = barsSvg.selectAll(`g.stack-group[fill="${colorScale(key)}"]`);
            const currentOpacity = stackGroup.style("opacity");
            stackGroup
              .transition()
              .duration(transitionDuration)
              .ease(easing)
              .style("opacity", currentOpacity == 1 ? 0 : 1);
          });

        legendItem
          .append("text")
          .attr("x", 20)
          .attr("y", 12)
          .attr("font-size", "12px")
          .attr("font-family", "Arial")
          .text(key.replace("_", " ").toUpperCase());
      });
    }

    document.getElementById("sortDropdown").addEventListener("change", (e) => {
      currentSort = e.target.value;
      updateChart();
    });

    document.getElementById("topNDropdown").addEventListener("change", (e) => {
      currentTopN = e.target.value === "all" ? "all" : parseInt(e.target.value);
      updateChart();
    });

    document.getElementById("filterDropdown").addEventListener("change", (e) => {
      const value = e.target.value;

      data = originalData.filter((d) =>
        value === "all" ? true : d.confidence === value
      );
      updateChart();
    });
  });
</script>

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

  .tooltip-container {
    position: relative;
    width: 100%;
  }

  :global(.bar-tooltip) {
    position: absolute;
    opacity: 0;
    background: rgba(0, 0, 0, 0.8);
    color: #fff;
    padding: 10px;
    border-radius: 5px;
    font-size: 12px;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    pointer-events: none;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.25);
    z-index: 1000;
    transition: opacity 0.5s ease, transform 0.5s ease;
    transform: translate(-50%, -100%) scale(0.9);
  }

  .legend-svg {
    display: block;
    margin: 0;
    padding: 0;
  }

  .chart-container {
    position: relative;
    overflow-x: hidden;
    overflow-y: hidden;
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
    padding: 0;
  }

  .scrollable-container {
    overflow-y: auto;
    transition: height 0.8s cubic-in-out;
    padding: 0;
    margin: 0;
    box-sizing: border-box;
    width: fit-content;
  }

  .bars-svg,
  .x-axis-svg {
    width: 100%;
    display: block;
    margin: 0;
    padding: 0;
  }

  rect.bar {
    opacity: 0;
    transition: opacity 0.5s ease-in;
  }

  #controls {
    margin-bottom: 20px;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;
  }

  #controls label {
    margin-right: 5px;
    font-size: 14px;
  }

  #controls select {
    padding: 5px;
    font-size: 14px;
  }

  h1 {
    font-size: 2em;
    line-height: 1.5;
    margin-bottom: 15px;
    color: #333;
  }

  p {
    font-size: 1.05em;
    margin-top: 0;
    margin-bottom: 15px;
  }

  select {
    font-size: 14px;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 3px;
  }

  .legend-item rect {
    cursor: pointer;
  }

  .bar-label {
    pointer-events: none;
  }

  .graph-container {
    width: 100%;
    margin: 0;
    padding: 0;
    margin-left: 100px;
  }

  @keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
  }
</style>

<div class="container">
  <h1>Understanding Food Waste Across Confidence Levels</h1>
  <p>
    Food waste is a global issue with significant variations between sectors like households, retail, and food services. 
    This chart provides a detailed breakdown, revealing which sectors contribute most to waste and how confidence levels in the data vary across countries.
  </p>
  <p style="margin-bottom: 20px; font-size: 0.9em; font-style: italic; color: #555;">
    Use the dropdowns to sort by total waste, confidence levels, or country ranking. Hover over the bars for detailed data about each sector's contribution.
  </p>
  <div id="controls">
    <!-- Sorting Controls -->
    <div id="sorting-controls">
      <label for="sortDropdown">Sort By:</label>
      <select id="sortDropdown">
        <option value="total_desc" selected>Total Waste (High to Low)</option>
        <option value="total_asc">Total Waste (Low to High)</option>
        <option value="alphabetical_asc">Country Name (A-Z)</option>
        <option value="alphabetical_desc">Country Name (Z-A)</option>
      </select>
    </div>
    <!-- Top N Controls -->
    <div id="topN-controls">
      <label for="topNDropdown">Show Top:</label>
      <select id="topNDropdown">
        <option value="10">10 Countries</option>
        <option value="20" selected>20 Countries</option>
        <option value="50">50 Countries</option>
        <option value="all">All Countries</option>
      </select>
    </div>
    <!-- Confidence Filter Controls -->
    <div id="confidence-controls">
      <label for="filterDropdown">Filter by Confidence:</label>
      <select id="filterDropdown">
        <option value="all">All Confidence Levels</option>
        <option value="very low confidence">Very Low Confidence</option>
        <option value="low confidence">Low Confidence</option>
        <option value="medium confidence">Medium Confidence</option>
        <option value="high confidence">High Confidence</option>
      </select>
    </div>
  </div>

  <div class="graph-container">
    <!-- Legend SVG -->
    <svg class="legend-svg" bind:this="{legendSvgElement}"></svg>
    <!-- Chart Container -->
    <div class="chart-container" bind:this="{chart}">
      <div
        class="scrollable-container"
        bind:this="{scrollableContainer}"
      >
        <svg class="bars-svg" bind:this="{barsSvgElement}"></svg>
      </div>
      <svg class="x-axis-svg" bind:this="{xAxisSvgElement}"></svg>
    </div>
    <div class="tooltip-container" bind:this={tooltipContainer}></div>
  </div>
</div>
