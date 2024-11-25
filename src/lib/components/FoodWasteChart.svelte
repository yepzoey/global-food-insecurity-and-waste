<script>
  import { onMount } from "svelte";
  import * as d3 from "d3";

  export let data = [];

  let chart;
  let barsSvgElement;
  let xAxisSvgElement;
  let legendSvgElement;
  let scrollableContainer;

  let currentSort = "total_desc";
  let currentTopN = 20;

  const barHeight = 25;
  const maxChartHeight = 250;
  const margin = { top: 0, right: 30, bottom: 30, left: 150 };

  onMount(() => {
    const width = 800;

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

    const tooltip = d3
      .select(chart)
      .append("div")
      .attr("class", "tooltip")
      .style("visibility", "hidden");

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
      let processedData = [...data];

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

      const stackedData = stack(processedData);

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
        .style("opacity", 0)
        .on("mouseover", handleMouseOver)
        .on("mousemove", handleMouseMove)
        .on("mouseout", handleMouseOut);

      rectsEnter
        .merge(rects)
        .transition()
        .duration(transitionDuration)
        .ease(easing)
        .attr("y", (d) => yScale(d.data.country))
        .attr("height", yScale.bandwidth())
        .attr("x", (d) => xScale(d[0]))
        .attr("width", (d) => xScale(d[1]) - xScale(d[0]))
        .style("opacity", 1);

      barsSvg.selectAll(".bar-label").remove();
      addLabels(processedData);
      updateAxes();
      addLegend();
    }

    function handleMouseOver(event, d) {
      const stackKey = event.target.parentNode.__data__.key;
      tooltip
        .style("visibility", "visible")
        .html(`
          <strong>${d.data.country}</strong><br>
          <span style="color:${colorScale(stackKey)};">
            ${stackKey.replace("_", " ").toUpperCase()}
          </span><br>
          ${(d[1] - d[0]).toFixed(2)} kg/capita/year<br>
          Confidence: ${d.data.confidence}
        `);
    }

    function handleMouseMove(event) {
      tooltip
        .style("top", `${event.pageY - 10}px`)
        .style("left", `${event.pageX + 10}px`);
    }

    function handleMouseOut() {
      tooltip.style("visibility", "hidden");
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
        .attr("x", (d) => xScale(d.total))
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
  .tooltip {
    position: absolute;
    visibility: hidden;
    background: rgba(0, 0, 0, 0.8);
    color: #fff;
    padding: 10px;
    border-radius: 5px;
    font-size: 12px;
    pointer-events: none;
  }

  .legend-svg {
    display: block;
    margin: 0;
    padding: 0;
  }

  .chart-container {
    overflow-x: hidden;
    overflow-y: hidden;
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
    padding: 0;
    height: 350px;
  }

  .scrollable-container {
    overflow-y: auto;
    transition: height 0.8s cubic-in-out;
    padding: 0;
    margin: 0;
    box-sizing: border-box;
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
    font-family: Arial, sans-serif;
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

  body {
    font-family: Georgia, "Times New Roman", serif;
    line-height: 1.6;
    color: #333;
    margin: 0;
    padding: 0;
    background-color: #f9f9f9;
  }

  h1,
  h2,
  h3 {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-weight: bold;
    color: #000;
  }

  p {
    font-size: 16px;
    margin-bottom: 20px;
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
</style>

<div style="margin: 0 auto; max-width: 800px; padding: 0px;">
  <h1>Understanding Food Waste Across Confidence Levels</h1>
  <p>
    An exploration of how confidence in estimates varies across sectors like
    household, retail, and food services. This visualization uncovers patterns in
    food waste globally and allows you to sort, filter, and explore the data for deeper insights.
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
</div>
