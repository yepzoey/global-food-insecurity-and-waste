<script>
  export let content;
</script>

<div class="slide-content">
  <div style="text-align: center;">
    <!-- Headline -->
    <h2 style="font-size: 2em; font-weight: bold; margin-bottom: 20px; line-height: 1.5; color: #333;">
      Food Waste: A Global Perspective
    </h2>

    <!-- Subtext -->
    <p style="font-size: 1.25em; line-height: 1.8; color: #555; margin-bottom: 40px;">
      From this food waste data, we see that Austria, a world leader in food waste minimization, is still responsible for 
      <strong>76 kg of waste per capita</strong> every year. That is equivalent to 
      <strong>0.2 kg of waste per capita per day</strong>. Knowing that 1 kg ≈ 4000 kcal of food, Austria wastes 
      <strong>800 kcal of food per person per day</strong>.
    </p>

    <p style="font-size: 1.25em; line-height: 1.8; color: #555; margin-bottom: 40px;">
      On the other side, Saudi Arabia, a global leader in food waste, is responsible for 
      <strong>151 kg of waste per capita</strong> each year. This is <strong>twice the amount of Austria</strong>, 
      meaning they waste <strong>1600 kcal of food per person per day</strong>.
    </p>

    <!-- Decorative Line -->
    <div style="border-top: 1px solid #ddd; width: 50%; margin: 0 auto; margin-bottom: 40px;"></div>

    <!-- Key Question -->
    <p style="font-size: 1.5em; font-weight: bold; line-height: 1.8; color: #333; margin-bottom: 40px;">
      So this brings up the question:<br>
      <em>How much food is wasted in the world every day, and how much food do all food-insecure individuals need?</em>
    </p>
  </div>
</div>

<style>
  .slide-content {
      text-align: center;
      padding: 20px;
      max-width: 1000px;
      margin: 0 auto;
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
