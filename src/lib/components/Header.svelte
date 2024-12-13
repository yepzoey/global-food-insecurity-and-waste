<script>
  let tooltipVisible = false;

  function copyToClipboard() {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
      tooltipVisible = true;
      setTimeout(() => {
        tooltipVisible = false;
      }, 1500);
    });
  }
</script>

<header>
  <h1>Food Insecurity and Waste</h1>
  <nav>
    <span on:click={copyToClipboard}>SHARE</span>
    {#if tooltipVisible}
      <div class="tooltip">Copied!</div>
    {/if}
  </nav>
</header>

<style>
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    font-family: Arial, sans-serif;
    text-wrap: nowrap;
  }

  h1 {
    font-size: 24px;
  }

  nav {
    position: relative;
  }

  nav span {
    margin: 0 10px;
    cursor: pointer;
    text-transform: uppercase;
    position: relative;
  }

  .tooltip {
    position: absolute;
    bottom: -35px;
    left: 50%;
    transform: translateX(-50%);
    background: black;
    color: white;
    padding: 5px 10px;
    font-size: 12px;
    border-radius: 4px;
    white-space: nowrap;
    z-index: 10;
  }

  .tooltip::after {
    content: "";
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px;
    border-style: solid;
    border-color: black transparent transparent transparent;
  }

  @media (max-width: 320px) {
    .tooltip {
      top: -35px;
    }
  }
</style>
