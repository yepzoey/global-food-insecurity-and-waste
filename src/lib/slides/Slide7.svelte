<script>
    import * as d3 from "d3";
    import RedistributionSim from "$lib/components/RedistributionSim.svelte";
    import { base } from "$app/paths";
    import { onMount } from "svelte";
    import { writable } from "svelte/store";

    const nodes = writable([]);
    const links = writable([]);

    onMount(async () => {
        try {
            const rawData = await d3.csv(`${base}/food_waste.csv`);

            const sources = ["Household", "Retail", "Food service"];

            const regions = Array.from(new Set(rawData.map(d => d.Region))).filter(d => d);

            const allNodes = [
                ...sources.map(name => ({ name })),
                ...regions.map(name => ({ name }))
            ];

            nodes.set(allNodes);

            const nodeIndex = {};
            allNodes.forEach((node, index) => {
                nodeIndex[node.name] = index;
            });

            const linkMap = {};

            rawData.forEach(row => {
                const region = row.Region;
                if (!region) return;

                const household = parseFloat(row["Household estimate (kg/capita/year)"]) || 0;
                const retail = parseFloat(row["Retail estimate (kg/capita/year)"]) || 0;
                const foodService = parseFloat(row["Food service estimate (kg/capita/year)"]) || 0;

                const addLink = (source, target, value) => {
                    const key = `${source}->${target}`;
                    if (linkMap[key]) {
                        linkMap[key] += value;
                    } else {
                        linkMap[key] = value;
                    }
                };

                addLink("Household", region, household);
                addLink("Retail", region, retail);
                addLink("Food service", region, foodService);
            });

            const allLinks = Object.entries(linkMap).map(([key, value]) => {
                const [source, target] = key.split('->');
                return {
                    source: nodeIndex[source],
                    target: nodeIndex[target],
                    value: value
                };
            });

            links.set(allLinks);

            console.log("Processed Data:", { nodes: allNodes, links: allLinks });
        } catch (error) {
            console.error("Error loading or processing data:", error);
        }
    });

    $: data = {
        nodes: $nodes,
        links: $links
    };
</script>

<main>
  {#if data.nodes.length > 0 && data.links.length > 0}
    <RedistributionSim {data} />
  {:else}
    <p>Loading data...</p>
  {/if}
</main>

<style>
    main {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-color: #ffffff;
    }
    p {
        font-size: 1.2em;
        color: #555;
    }
</style>