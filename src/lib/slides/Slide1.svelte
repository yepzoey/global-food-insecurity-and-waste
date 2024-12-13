<script>
    export let content;
  </script>
  
  <div class="slide-content">
    <h1 class="main-heading">
        Food Insecurity and Waste: A Global Crisis
    </h1>

    <p class="subheading">
        Trillions of calories are wasted each year while millions go hungry. 
        This article explores the patterns, challenges, and opportunities to close the gap.
    </p>

    <div class="highlights">
        <div class="highlight">
            <h2 class="icon-title">
                <span class="icon">📊</span> Insights
            </h2>
            <p>
                Maps and charts reveal the scale of food insecurity and waste, providing a clear picture of global trends.
            </p>
        </div>
        <div class="highlight">
            <h2 class="icon-title">
                <span class="icon">🌍</span> Perspectives
            </h2>
            <p>
                Examine how regions and sectors contribute to the crisis and where progress is being made.
            </p>
        </div>
        <div class="highlight">
            <h2 class="icon-title">
                <span class="icon">🔑</span> Solutions
            </h2>
            <p>
                Explore strategies to recover calories, reduce waste, and improve equity in food systems.
            </p>
        </div>
    </div>

    <p class="navigation">
        Use the navigation below to begin. Scroll down on slides for additional insights. <span class="arrow">⤵</span>
    </p>
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

    .main-heading {
        font-size: 2.8em;
        font-weight: bold;
        line-height: 1.3;
        color: 333;
        margin-bottom: 15px;
    }

    .subheading {
        font-size: 1.4em;
        line-height: 1.8;
        color: #555;
        margin-bottom: 30px;
        max-width: 1000px;
    }

    .highlights {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-evenly;
        gap: 15px;
        width: 100%;
        max-width: 1000px;
    }

    .highlight {
        flex: 1;
        max-width: 200px;
        background-color: #f9f9f9;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 15px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        text-align: center;
    }

    .highlight:hover {
        transform: translateY(-5px);
        box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
    }

    .icon-title {
        font-size: 1.4em;
        font-weight: bold;
        color: #333;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .icon {
        font-size: 1.2em;
        margin-right: 6px;
        color: #007acc;
    }

    .highlight p {
        font-size: 1em;
        line-height: 1.5;
        color: #555;
    }

    .navigation {
        font-size: 1.3em;
        line-height: 1.8;
        font-weight: bold;
        color: #007acc;
        margin-top: 20px;
        max-width: 1000px;
        border-top: 1px solid #ddd;
        padding-top: 15px;
    }
    
    .navigation .arrow {
        display: inline-block;
        position: relative;
        top: 0.25em;
        margin-left: 8px;
        font-size: 24px;
        animation: bounce 1.5s infinite;
    }

    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
        }
        40% {
        transform: translateY(5px);
        }
        60% {
        transform: translateY(3px);
        }
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
  