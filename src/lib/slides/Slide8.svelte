<script>
    export let content;
</script>

<div class="slide-content">
    <h2 class="main-heading">
        Bridging the Gap Between Waste and Need
    </h2>

    <p class="key-insight">
        Every year, the world wastes enough food to feed billions. Yet hunger persists, driven by barriers in recovery, redistribution, and access. 
        This disconnect between abundance and need reveals a challenge—and an opportunity—for change.
    </p>

    <p class="broader-context">
        Tackling food insecurity isn’t just about reducing waste—it’s about rethinking how food flows through the global system. From improving 
        recovery rates to strengthening local and international efforts, every action counts in closing this gap.
    </p>

    <p class="call-to-action">
        Waste less, share more, and reimagine what’s possible.<br> The time to act is now.
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
        font-size: 2.4em;
        font-weight: bold;
        color: #333;
        text-align: center;
        margin-bottom: 20px;
    }

    .key-insight {
        font-size: 1.4em;
        line-height: 1.8;
        color: #555;
        text-align: center;
        margin-bottom: 20px;
        max-width: 1000px;
    }

    .broader-context {
        font-size: 1.4em;
        line-height: 1.8;
        color: #555;
        background-color: #f9f9f9;
        text-align: center;
        margin-bottom: 20px;
        max-width: 1000px;
        border-left: 4px solid #68c577;
        padding-left: 15px;
        font-style: italic;
    }

    .call-to-action {
        font-size: 1.5em;
        font-weight: bold;
        line-height: 1.8;
        color: #333;
        text-align: center;
        background-color: #ffffff;
        padding: 10px 20px;
        border-radius: 5px;
        border: 1px solid #ddd;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        margin-top: 20px;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .call-to-action:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
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
