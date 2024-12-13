<script>
  export let content;
</script>

<div class="slide-content">
  <div style="text-align: center;">
    <h2 style="font-size: 2em; font-weight: bold; margin-bottom: 20px; line-height: 1.5; color: #333;">
      Food Waste: A Global Perspective
    </h2>

    <p style="font-size: 1.2em; line-height: 1.8; color: #555; margin-bottom: 30px;">
      Even Austria, a world leader in minimizing food waste, generates 
      <strong>76 kilograms of waste per capita annually</strong>, equivalent to 
      <strong>0.2 kilograms per day</strong>. This translates to 
      <strong>800 kilocalories of food wasted per person per day</strong>, underscoring that even high-performing nations are not waste-free.
    </p>

    <p style="font-size: 1.2em; line-height: 1.8; color: #555; margin-bottom: 30px;">
      Meanwhile, Saudi Arabia ranks among the highest globally, discarding 
      <strong>151 kilograms of waste per capita annually</strong>, twice that of Austria. This amounts to 
      <strong>1600 kilocalories wasted per person per day</strong>, highlighting the stark differences in food waste across countries.
    </p>

    <div style="border-top: 1px solid #ddd; width: 50%; margin: 0 auto; margin-bottom: 30px;"></div>

    <p style="font-size: 1.4em; font-weight: bold; line-height: 1.8; color: #333;">
      This disparity raises a critical question:<br>
      <em>How much food is wasted daily worldwide, and how does this compare to the caloric needs of undernourished people?</em>
    </p>
  </div>
</div>

<style>
  .slide-content {
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
