<script>
  export let content;
  import LineChart from '$lib/components/LineChart.svelte';

</script>

<div class="slide-content">
    <div style="text-align: left;">
        <h2 style="text-align: center; font-size: 2em; font-weight: bold; margin-bottom: 10px; line-height: 1.5; color: #333;">
          No Progress in Food Security Over the Last Decade
        </h2>
      
        <p style="font-size: 1em; line-height: 1.8; color: #555; margin-top: 0px">
          Food insecurity has remained high in many regions over the past decade, with areas like Africa and Central America showing troubling increases. 
          Even in North America and Europe, progress has been minimal, with lingering disparities.
          This line chart visualizes changes in food security from 2016 to 2023, showing the percentage of food-insecure people within the total population.
        </p>
        <p style="text-align: center; font-size: 0.9em; font-style: italic; color: #555; margin-top: 0px; margin-bottom: 20px;">
          Use the dropdown menu to explore regional and subregional trends, and hover over the lines to see yearly data. <br>What patterns stand out, and where is change most needed?
        </p>
      
        <div style="border-top: 1px solid #ddd; width: 50%; margin: 0 auto; margin-bottom: 10px;"></div>
      
        <div style="margin: 0 auto; max-width: 600px;">
          <LineChart />
          <p style="text-align: center; font-size: 0.8em; color: #888; margin-top: 0px;">
            <em>Visualization of food security changes by region over the last decade.</em>
          </p>
        </div>
      </div>
</div>

<style>
  .slide-content {
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
      align-items: center;
      width: 100%;
      height: calc(100vh - 110px);
      overflow: hidden;
      box-sizing: border-box;
      position: relative;
      max-width: 1000px;
      animation: fadeIn 1s ease-in-out;
  }

  .slide-content div {
      animation: fadeIn 1s ease-in-out;
  }

  h1 {
      font-size: 2.5em;
      margin-bottom: 20px;
  }

  p {
      font-size: 1.2em;
      line-height: 1.6;
      margin-bottom: 15px;
  }

  ul {
      text-align: left;
      margin: 20px auto;
      max-width: 600px;
      padding: 0;
  }

  ul li {
      font-size: 1.2em;
      line-height: 1.4;
      margin: 10px 0;
      list-style-type: disc;
      list-style-position: inside;
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
