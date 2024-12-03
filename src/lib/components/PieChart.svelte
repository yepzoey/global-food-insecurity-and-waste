<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import { base } from '$app/paths';

    let energyGraph;
    let controls;

    let selectedCategory = "combined figures (kg/capita/year)";
    let calorieIntake = 2500;
    let selectedConfidence = "All Countries";

    onMount(() => {
        d3.csv(`${base}/food_waste.csv`).then(function (wasteData) {
            d3.csv(`${base}/FAOSTAT_data_en_11-21-2024.csv`).then(function (insecureData) {
                const width = 600,
                    height = 400,
                    radius = Math.min(width, height) / 2;

                const foodWasteConversionFactor = 4000;

                const svg = d3.select(energyGraph)
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height);

                const chartGroup = svg.append("g")
                    .attr("transform", `translate(${width / 2},${height / 2})`);

                const tooltip_pie = d3.select(energyGraph)
                    .append("div")
                    .style("position", "absolute")
                    .style("background-color", "white")
                    .style("border", "1px solid #ccc")
                    .style("border-radius", "5px")
                    .style("padding", "10px")
                    .style("opacity", 0)
                    .style("pointer-events", "none");

                const pie = d3.pie()
                    .value(d => d.value);

                const arc = d3.arc()
                    .innerRadius(0)
                    .outerRadius(radius);

                const color = d3.scaleOrdinal()
                    .range(["steelblue", "orange"]);

                function calculateAndRender() {
                    let filteredWasteData = wasteData;
                    if (selectedConfidence !== "All Countries") {
                        filteredWasteData = filteredWasteData.filter(
                            d => d["Confidence in estimate"] === selectedConfidence
                        );
                    }

                    let totalFoodWaste = 0;
                    filteredWasteData.forEach(d => {
                        const wasteKgPerCapita = +d[selectedCategory];
                        if (!isNaN(wasteKgPerCapita)) {
                            totalFoodWaste += wasteKgPerCapita * foodWasteConversionFactor;
                        }
                    });

                    let worldPopulation = 8000000000;
                    let daysInYear = 365;

                    totalFoodWaste *= worldPopulation;
                    totalFoodWaste /= daysInYear;

                    let totalFoodNeed = 0;

                    const foodInsecureData = insecureData.filter(
                        d =>
                            d.Item === "Number of people undernourished (million) (3-year average)" &&
                            d.Year === "2021-2023"
                    );
                    foodInsecureData.forEach(d => {
                        const foodInsecurePeople = +d.Value * 1000000;
                        if (!isNaN(foodInsecurePeople)) {
                            totalFoodNeed += foodInsecurePeople * calorieIntake;
                        }
                    });

                    const totalData = [
                        { label: "Total Food Waste (Calories)", value: totalFoodWaste },
                        { label: "Total Food Need (Calories)", value: totalFoodNeed }
                    ];

                    renderPieChart(totalData);
                }

                function renderPieChart(data) {
                    chartGroup.selectAll("*").remove();

                    const slices = chartGroup.selectAll("path")
                        .data(pie(data))
                        .enter()
                        .append("path")
                        .attr("d", arc)
                        .attr("fill", d => color(d.data.label))
                        .attr("stroke", "white")
                        .style("stroke-width", "2px")
                        .on("mouseover", function (event, d) {
                            tooltip_pie.transition().duration(200).style("opacity", 1);
                            tooltip_pie
                                .html(
                                    `<strong>${d.data.label}</strong><br>
                                ${(d.data.value / 1e12).toFixed(2)} Trillion kcal`
                                )
                                .style("left", event.pageX + 10 + "px")
                                .style("top", event.pageY - 30 + "px");
                        })
                        .on("mousemove", function (event) {
                            tooltip_pie
                                .style("left", event.pageX + 10 + "px")
                                .style("top", event.pageY - 30 + "px");
                        })
                        .on("mouseout", function () {
                            tooltip_pie.transition().duration(200).style("opacity", 0);
                        });

                    chartGroup.selectAll("text")
                        .data(pie(data))
                        .enter()
                        .append("text")
                        .text(
                            d =>
                                `${d.data.label}: ${(d.data.value / 1e12).toFixed(2)} Trillion kcal`
                        )
                        .attr("transform", d => `translate(${arc.centroid(d)})`)
                        .style("text-anchor", "middle")
                        .style("font-size", "12px");
                }

                // Controls for slider and dropdown
                d3.select("#controls")
                    .append("label")
                    .text("Caloric Intake (kcal/day): ")
                    .append("input")
                    .attr("type", "range")
                    .attr("min", "500")
                    .attr("max", "4000")
                    .attr("step", "50")
                    .attr("value", calorieIntake)
                    .on("input", function () {
                        calorieIntake = +this.value;
                        d3.select("#calorieValue").text(calorieIntake);
                        calculateAndRender();
                    });

                d3.select("#controls")
                    .append("span")
                    .attr("id", "calorieValue")
                    .text(calorieIntake);

                const categories = [
                    { value: "combined figures (kg/capita/year)", label: "Combined Figures" },
                    { value: "Household estimate (kg/capita/year)", label: "Household Estimate" },
                    { value: "Retail estimate (kg/capita/year)", label: "Retail Estimate" },
                    { value: "Food service estimate (kg/capita/year)", label: "Food Service Estimate" }
                ];

                d3.select("#controls")
                    .append("label")
                    .text("Food Waste Category (kg/capita/year): ")
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
                    .text(d => d.label);

                const confidenceLevels = [
                    "All Countries",
                    "Very Low Confidence",
                    "Low Confidence",
                    "Medium Confidence",
                    "High Confidence"
                ];

                d3.select("#controls")
                    .append("label")
                    .text("Confidence of Food Waste Data Collection Estimates: ")
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

                // Initial render
                calculateAndRender();
            }).catch(error => console.error("Error loading FAOSTAT data:", error));
        }).catch(error => console.error("Error loading Food Waste data:", error));
    });
</script>

<style>
    #controls {
        margin-bottom: 25px;
        display: flex;
        gap: 15px;
        align-items: center;
    }

    .line {
        fill: none;
        stroke-width: 2;
    }
    .circle {
        stroke: black;
        stroke-width: 1.5;
    }
    .tooltip {
        position: absolute;
        padding: 5px;
        background-color: white;
        border: 1px solid black;
        border-radius: 3px;
        pointer-events: none;
        display: none;
    }
    .axis-title {
        font-size: 14px;
        font-weight: bold;
    }

    body {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    label, select {
        margin-bottom: 10px;
    }

</style>

<div class="container">
    <h2>Food Insecurity Over Time by Region</h2>
    <div id="controls" bind:this={controls}></div>
    <div id="energyGraph" bind:this={energyGraph}></div>
</div>
