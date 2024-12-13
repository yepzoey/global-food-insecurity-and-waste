<div class="slide-content">
    <h1 class="main-heading">About This Project</h1>

    <p class="project-description">
        Created for <strong>DSC 209R: Data Visualization</strong> at UC San Diego in Fall 2024, this project explores the global challenges 
        of food insecurity and waste. Designed as an interactive explorable explanation, it combines storytelling and data visualization 
        to provide insights and propose actionable solutions.
    </p>

    <div class="contributors">
        <h2>Contributors</h2>
        <p><strong>Nicholas Shor</strong></p>
        <p>
            <a href="https://nshor47.github.io/my-portfolio/" target="_blank" rel="noopener noreferrer">Portfolio</a> | 
            <a href="https://github.com/nshor47" target="_blank" rel="noopener noreferrer">GitHub</a>
        </p>
        <p><strong>Zoey Zhao</strong></p>
        <p>
            <a href="https://yepzoey.github.io/my-portfolio/" target="_blank" rel="noopener noreferrer">Portfolio</a> | 
            <a href="https://github.com/yepzoey" target="_blank" rel="noopener noreferrer">GitHub</a>
        </p>
    </div>

    <div class="project-link">
        <p>
            View the project source code on 
            <a href="https://github.com/yepzoey/global-food-insecurity-and-waste" target="_blank" rel="noopener noreferrer">GitHub</a>.
        </p>
    </div>

    <p class="acknowledgment">
        Thank you for exploring our work. We hope it inspires reflection and action on these critical global issues.
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
    font-size: 2.5em;
    font-weight: bold;
    line-height: 1.3;
    color: #333;
    margin: 20px 0;
}

.project-description {
    font-size: 1.2em;
    line-height: 1.8;
    color: #555;
    margin-top: 0;
    margin-bottom: 20px;
}

.contributors {
    margin-top: 0;
    margin-bottom: 20px;
}

.contributors h2 {
    font-size: 1.5em;
    font-weight: bold;
    color: #333;
    margin-bottom: 15px;
}

.contributors p {
    font-size: 1.2em;
    line-height: 1.6;
    color: #333;
    margin: 5px 0;
}

.contributors a {
    color: #007acc;
    text-decoration: none;
    font-weight: bold;
    margin: 0 5px;
}

.contributors a:hover {
    color: #005f99;
    text-decoration: underline;
}

.project-link p {
    font-size: 1.2em;
    line-height: 1.8;
    color: #555;
    margin-top: 0;
}

.project-link a {
    color: #007acc;
    text-decoration: none;
    font-weight: bold;
}

.project-link a:hover {
    color: #005f99;
    text-decoration: underline;
}

.acknowledgment {
    font-size: 1.2em;
    line-height: 1.8;
    font-weight: bold;
    color: #444;
    text-align: center;
    margin-top: 0px;
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
