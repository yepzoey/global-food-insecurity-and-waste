<script>
  export let content;
</script>

<div class="slide-content">
    <h1 class="main-heading">Resources</h1>

    <div class="resource-category">
        <h2>
            <span class="icon">🏘️</span> Local
        </h2>
        <p>
            <a href="https://feedingsandiego.org/" target="_blank" rel="noopener noreferrer">
                Feeding San Diego
            </a> - A San Diego-based organization that distributed over 29,000,000 meals last year to reduce food insecurity in the county. 
            92% of the food they distribute is rescued from grocery stores, farms, hotels, restaurants, etc.
        </p>
    </div>

    <div class="resource-category">
        <h2>
            <span class="icon">🇺🇸</span> US
        </h2>
        <p>
            <a href="https://refed.org/" target="_blank" rel="noopener noreferrer">
                ReFED
            </a> - US-based non-profit organization that uses a data-driven approach serving as a foundation for informed action to reduce food 
            waste at every level of the food supply chain.
        </p>
    </div>

    <div class="resource-category">
        <h2>
            <span class="icon">🌎</span> International
        </h2>
        <p>
            <a href="https://www.wfp.org" target="_blank" rel="noopener noreferrer">
                World Food Programme (WFP)
            </a> - An international organization that focuses on saving lives in emergencies through food assistance for those who need it most.
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

    .main-heading {
        font-size: 2.5em;
        font-weight: bold;
        margin-bottom: 20px;
        color: #333;
    }

    .resource-category {
        max-width: 1000px;
        margin-top: 0px;
        margin-bottom: 10px;
        text-align: left;
        width: 100%;
    }

    .resource-category h2 {
        font-size: 1.8em;
        font-weight: bold;
        margin-top: 0px;
        margin-bottom: 15px;
        color: #333;
        display: flex;
        align-items: center;
    }

    .resource-category h2 .icon {
        font-size: 1.2em;
        margin-right: 10px;
    }

    .resource-category p {
        font-size: 1.2em;
        line-height: 1.8;
        color: #555;
    }

    .resource-category a {
        font-weight: bold;
        color: #007acc;
        text-decoration: none;
        transition: color 0.3s ease;
    }

    .resource-category a:hover {
        color: #005f99;
        text-decoration: underline;
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
