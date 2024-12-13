<script>
    import { onMount } from "svelte";
    import FoodWasteChart from "$lib/components/FoodWasteChart.svelte";
    import { base } from '$app/paths';
  
    let data = [];
  
    onMount(async () => {
      try {
        const response = await fetch(`${base}/food_waste.csv`);
        const text = await response.text();
  
        const rows = text.split("\n").map(row => row.split(","));
        const headers = rows.shift();
  
        data = rows.map(row => {
          const obj = {};
          headers.forEach((header, index) => {
            obj[header.trim()] = row[index]?.trim();
          });
  
          return {
            country: obj["Country"],
            household: +obj["Household estimate (kg/capita/year)"] || 0, // kg/capita/year
            retail: +obj["Retail estimate (kg/capita/year)"] || 0, // kg/capita/year
            food_service: +obj["Food service estimate (kg/capita/year)"] || 0, // kg/capita/year
            confidence: obj["Confidence in estimate"]
              ? obj["Confidence in estimate"].toLowerCase() // e.g., "very low confidence"
              : "unknown",
            total: +obj["combined figures (kg/capita/year)"],
            region: obj["Region"] || "Unknown" // Region column
          };
        });
      } catch (err) {
        console.error("Error loading or processing the CSV data:", err);
      }
    });
  </script>
  
  {#if data.length > 0}
    <FoodWasteChart {data} />
  {/if}
  
  <style>
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