<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import { base } from '$app/paths';

    let energyGraph;
    let piecontrols;
    let container;
    
    let tooltipContainer;
    let tooltip;

    let selectedCategory = "combined figures (kg/capita/year)";
    let calorieIntake = 2500;
    let selectedConfidence = "All Countries";

    onMount(() => {
        Promise.all([
            d3.csv(`${base}/food_waste.csv`),
            d3.csv(`${base}/FAOSTAT_data_en_11-21-2024.csv`)
        ]).then(([wasteData, insecureData]) => {
            const width = 600,
                height = 600,
                radius = Math.min(width, height) / 2 - 70;

            const foodWasteConversionFactor = 4000;
            const worldPopulation = 8000000000;
            const daysInYear = 365;

            const svg = d3.select(energyGraph)
                .append("svg")
                .attr("viewBox", `0 0 ${width} ${height}`)
                .attr("preserveAspectRatio", "xMidYMid meet")
                .attr("overflow", "visible")
                .attr("width", "100%")
                .attr("height", "100%");

            const mainGroup = svg.append("g")
                .attr("transform", `translate(${width / 2},${height / 2})`);

            const chartGroup = mainGroup.append("g")
                .attr("class", "chart-group");

            tooltip = d3
                .select(tooltipContainer)
                .append("div")
                .attr("class", "pie-tooltip")
                .style("opacity", 0)
                .style("position", "absolute");

            const pie = d3.pie()
                .value(d => d.value)
                .sort(null);

            const arc = d3.arc()
                .innerRadius(0)
                .outerRadius(radius);

            const color = d3.scaleOrdinal()
                .range(["#4C78A8", "#F58518", "#E45756", "#72B7B2", "#54A24B"]);

            const labelOffsetFactor = 1.2;

            function calculateAndRender() {
                let filteredWasteData = wasteData;
                if (selectedConfidence !== "All Countries") {
                    filteredWasteData = filteredWasteData.filter(
                        d => d["Confidence in estimate"] === selectedConfidence
                    );
                }

                let totalFoodWaste = d3.sum(filteredWasteData, d => {
                    const wasteKgPerCapita = +d[selectedCategory];
                    return isNaN(wasteKgPerCapita) ? 0 : wasteKgPerCapita * foodWasteConversionFactor;
                });

                totalFoodWaste = (totalFoodWaste * worldPopulation) / daysInYear;

                const foodInsecureData = insecureData.filter(
                    d =>
                        d.Item === "Number of people undernourished (million) (3-year average)" &&
                        d.Year === "2021-2023"
                );

                const totalFoodNeed = d3.sum(foodInsecureData, d => {
                    const foodInsecurePeople = +d.Value * 1000000;
                    return isNaN(foodInsecurePeople) ? 0 : foodInsecurePeople * calorieIntake;
                });

                const totalData = [
                    { label: "Total Food Waste (Calories)", value: totalFoodWaste },
                    { label: "Total Food Need (Calories)", value: totalFoodNeed }
                ];

                renderPieChart(totalData);
            }

            function renderPieChart(data) {
                const arcs = chartGroup.selectAll("path")
                    .data(pie(data), d => d.data.label);

                arcs.exit()
                    .transition()
                    .duration(750)
                    .attrTween("d", function(d) {
                        const interpolate = d3.interpolate(d.startAngle, d.endAngle);
                        return function(t) {
                            d.startAngle = interpolate(t);
                            return arc(d);
                        };
                    })
                    .remove();

                arcs.transition()
                    .duration(750)
                    .attrTween("d", function(d) {
                        const interpolate = d3.interpolate(this._current, d);
                        this._current = interpolate(1);
                        return function(t) {
                            return arc(interpolate(t));
                        };
                    })
                    .attr("fill", d => color(d.data.label));

                arcs.enter()
                    .append("path")
                    .each(function(d) { this._current = { ...d, startAngle: d.startAngle, endAngle: d.startAngle }; })
                    .attr("d", arc)
                    .attr("fill", d => color(d.data.label))
                    .attr("stroke", "#fff")
                    .attr("stroke-width", "2px")
                    .style("cursor", "pointer")
                    .on("mouseover", function(event, d) {
                        d3.select(this).transition()
                            .duration(200)
                            .attr("d", d3.arc().innerRadius(0).outerRadius(radius + 15))
                            .attr("stroke-width", "2.5px");
                        showTooltip(event, d);
                    })
                    .on("mousemove", moveTooltip)
                    .on("mouseout", function(event, d) {
                        d3.select(this).transition()
                            .duration(200)
                            .attr("d", arc(d))
                            .attr("stroke", "#fff")
                            .attr("stroke-width", "2px");
                        hideTooltip();
                    })
                    .transition()
                    .duration(750)
                    .attrTween("d", function(d) {
                        const interpolate = d3.interpolate(this._current, d);
                        this._current = interpolate(1);
                        return function(t) {
                            return arc(interpolate(t));
                        };
                    });

                const labels = mainGroup.selectAll("text.slice-label")
                    .data(pie(data), d => d.data.label);

                labels.exit()
                    .transition()
                    .duration(750)
                    .attr("opacity", 0)
                    .remove();

                labels.transition()
                    .duration(750)
                    .attr("transform", d => {
                        const [x, y] = arc.centroid(d);
                        const hypotenuse = Math.sqrt(x * x + y * y);
                        return `translate(${(x / hypotenuse) * radius * labelOffsetFactor}, ${(y / hypotenuse) * radius * labelOffsetFactor})`;
                    })
                    .text(d => `${d.data.label}: ${(d.data.value / 1e12).toFixed(2)} Trillion kcal`);

                labels.enter()
                    .append("text")
                    .attr("class", "slice-label")
                    .attr("transform", d => {
                        const [x, y] = arc.centroid(d);
                        const hypotenuse = Math.sqrt(x * x + y * y);
                        return `translate(${(x / hypotenuse) * radius * labelOffsetFactor}, ${(y / hypotenuse) * radius * labelOffsetFactor})`;
                    })
                    .attr("dy", "0.35em")
                    .attr("opacity", 0)
                    .text(d => `${d.data.label}: ${(d.data.value / 1e12).toFixed(2)} Trillion kcal`)
                    .attr("text-anchor", d => (d.endAngle + d.startAngle) / 2 > Math.PI ? "end" : "start")
                    .attr("fill", "#333")
                    .attr("font-size", "1.5em")
                    .attr("pointer-events", "none")
                    .attr("text-shadow", "1px 1px 2px rgba(255,255,255,0.8)")
                    .transition()
                    .duration(750)
                    .attr("opacity", 1);

                const lines = mainGroup.selectAll("polyline.leader-line")
                    .data(pie(data), d => d.data.label);

                lines.exit()
                    .transition()
                    .duration(750)
                    .attr("opacity", 0)
                    .remove();

                lines.transition()
                    .duration(750)
                    .attr("points", d => {
                        const posA = arc.centroid(d);
                        const posB = arc.centroid(d);
                        const posC = arc.centroid(d);
                        const hypotenuse = Math.sqrt(posC[0] * posC[0] + posC[1] * posC[1]);
                        posC[0] = (posC[0] / hypotenuse) * radius * labelOffsetFactor;
                        posC[1] = (posC[1] / hypotenuse) * radius * labelOffsetFactor;
                        return [posA, posB, posC];
                    })
                    .attr("stroke", "#ccc")
                    .attr("stroke-width", "1px")
                    .attr("fill", "none");

                lines.enter()
                    .append("polyline")
                    .attr("class", "leader-line")
                    .attr("points", d => {
                        const posA = arc.centroid(d);
                        const posB = arc.centroid(d);
                        const posC = arc.centroid(d);
                        const hypotenuse = Math.sqrt(posC[0] * posC[0] + posC[1] * posC[1]);
                        posC[0] = (posC[0] / hypotenuse) * radius * labelOffsetFactor;
                        posC[1] = (posC[1] / hypotenuse) * radius * labelOffsetFactor;
                        return [posA, posB, posC];
                    })
                    .attr("stroke", "#ccc")
                    .attr("stroke-width", "1px")
                    .attr("fill", "none")
                    .attr("opacity", 0)
                    .transition()
                    .duration(750)
                    .attr("opacity", 1);
            }

            const piecontrolsContainer = d3.select(piecontrols);

            piecontrolsContainer.append("div")
                .attr("class", "piecontrol-group")
                .call(piecontrol => {
                    piecontrol.append("label")
                        .attr("class", "piecontrol-label")
                        .text("Caloric Intake (kcal/day):")
                        .append("input")
                        .attr("type", "range")
                        .attr("min", 500)
                        .attr("max", 4000)
                        .attr("step", 50)
                        .attr("value", calorieIntake)
                        .on("input", function () {
                            calorieIntake = +this.value;
                            d3.select("#calorieValue").text(calorieIntake);
                            calculateAndRender();
                        });
                });

            piecontrolsContainer.append("span")
                .attr("id", "calorieValue")
                .attr("class", "value-display")
                .text(calorieIntake);

            const categories = [
                { value: "combined figures (kg/capita/year)", label: "Combined Figures" },
                { value: "Household estimate (kg/capita/year)", label: "Household Estimate" },
                { value: "Retail estimate (kg/capita/year)", label: "Retail Estimate" },
                { value: "Food service estimate (kg/capita/year)", label: "Food Service Estimate" }
            ];

            piecontrolsContainer.append("div")
                .attr("class", "piecontrol-group")
                .call(piecontrol => {
                    piecontrol.append("label")
                        .attr("class", "piecontrol-label")
                        .text("Food Waste Category:")
                        .append("select")
                        .on("change", function () {
                            selectedCategory = this.value;
                            calculateAndRender();
                        })
                        .selectAll("option")
                        .data(categories)
                        .enter()
                        .append("option")
                        .attr("value", d => d.value)
                        .text(d => d.label)
                        .property("selected", d => d.value === selectedCategory);
                });

            const confidenceLevels = [
                "All Countries",
                "Very Low Confidence",
                "Low Confidence",
                "Medium Confidence",
                "High Confidence"
            ];

            piecontrolsContainer.append("div")
                .attr("class", "piecontrol-group")
                .call(piecontrol => {
                    piecontrol.append("label")
                        .attr("class", "piecontrol-label")
                        .text("Confidence Level:")
                        .append("select")
                        .on("change", function () {
                            selectedConfidence = this.value;
                            calculateAndRender();
                        })
                        .selectAll("option")
                        .data(confidenceLevels)
                        .enter()
                        .append("option")
                        .attr("value", d => d)
                        .text(d => d)
                        .property("selected", d => d === selectedConfidence);
                });

            // Initial render
            calculateAndRender();
        }).catch(error => console.error("Error loading data:", error));
    });

    function showTooltip(event, d) {
        tooltip
            .html(`
                <strong>${d.data.label}</strong><br>${(d.data.value / 1e12).toFixed(2)} Trillion kcal
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
</script>

<style>
    body {
        font-family: 'Helvetica Neue', Arial, sans-serif;
        display: flex;
        flex-direction: column;
        align-items: center;
        background: #f9f9f9;
        color: #333;
        margin: 0;
        padding: 20px;
    }

    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        max-width: 1200px;
        height: calc(100vh - 110px);
        box-sizing: border-box;
        position: relative;
        justify-content: center;
        animation: fadeIn 1s ease-in-out;
    }

    h1 {
        font-size: 1.8em;
        margin-top: 15px;
        margin-bottom: 0px;
        color: #333;
        text-align: center;
    }

    p {
        font-size: 1em;
        text-align: center;
        max-width: 1000px;
        margin-bottom: 20px;
        color: #555;
    }

    #piecontrols {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        padding: 10px;
        background: #FAFAFA;
        border-radius: 10px;
        width: 100%;
        justify-content: center;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        margin-bottom: 20px;
    }

    :global(.piecontrol-group) {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
    }

    :global(.piecontrol-label) {
        font-size: 0.85em;
        color: #555;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    :global(select) {
        font-size: 0.9em;
        padding: 4px 6px;
        border-radius: 3px;
        border: 1px solid #ccc;
        transition: border-color 0.3s, box-shadow 0.3s;
        background: #fff;
    }

    :global(input[type="range"]) {
        font-size: 0.9em;
        border-radius: 6px;
        border: 1px solid #ccc;
        transition: border-color 0.3s, box-shadow 0.3s;
        background: #fff;
    }

    :global(.value-display) {
        font-size: 0.9em;
        font-weight: 600;
        color: #333;
        min-width: 60px;
        text-align: center;
        padding: 4px 6px;
        background: #e6f7ff;
        border-radius: 6px;
        border: 1px solid #91d5ff;
    }

    :global(.pie-tooltip) {
        position: absolute;
        background-color: #ffffff;
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 12px 16px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease, transform 0.2s ease;
        white-space: nowrap;
        z-index: 10;
        box-shadow: 0px 4px 15px rgba(0,0,0,0.1);
        font-size: 14px;
        color: #333;
    }

    .tooltip-container {
        position: relative;
        width: 100%;
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
</style>

<div class="container" bind:this={container}>
    <h1>Food Waste vs. Food Need per Day</h1>
    <p>
        This visualization compares the daily food waste in calories against the daily food need of undernourished people. <br>
        <span style="display: block; margin-top: 10px; font-size: 0.9em; color: #777; font-style: italic;">
        <em>Use the piecontrols below to adjust the parameters and explore the data based on different confidence levels and categories. <br>Explore how the scale of waste contrasts with the requirements to address global food insecurity.
        </em>
    </p>
    <div id="piecontrols" bind:this={piecontrols}></div>
    <div id="energyGraph" bind:this={energyGraph}></div>
    <div class="tooltip-container" bind:this={tooltipContainer}></div>
</div>
