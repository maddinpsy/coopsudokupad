<script>
  export let cells;
  export let live;

  function select(row, col) {
    live.pushEvent("select", { row: row, col: col }, () => {});
  }
</script>

<h1>LiveView Message Page</h1>
<div
  class="grid grid-cols-9 grid-rows-9 max-w-full aspect-square p-0.5 bg-black gap-0.5"
>
  {#each cells as cell}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      on:click={() => select(cell.row, cell.col)}
      class="row-start-{cell.row} col-start-{cell.col} bg-white border-lime-500 border-4"
      style:border-style={cell.selected ? "solid" : "none"}
    ></div>
    <!-- style="border-style: solid; border-width: 0.4em; border-image: conic-gradient(from 30deg, red 0% 50%, blue 50% 100%) 1" -->
    <!-- style="box-shadow: inset 0 0 0 0.3em red, inset 0 0 0 0.6em blue" -->
  {/each}
</div>
