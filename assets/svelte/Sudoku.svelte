<script>
  export let cells;
  export let live;

  let select_mode = "nothing";

  function down(altKey, cell) {
    if (!altKey) {
      live.pushEvent("clear_selection", {}, () => {});
    }
    if (!cell.selected) {
      select_mode = "selecting";
      live.pushEvent("select", cell, () => {});
    } else {
      select_mode = "deselecting";
      live.pushEvent("deselect", cell, () => {});
    }
  }

  function move(cell) {
    if (select_mode == "selecting" && !cell.selected) {
      live.pushEvent("select", cell, () => {});
    }
    if (select_mode == "deselecting" && cell.selected) {
      live.pushEvent("deselect", cell, () => {});
    }
  }
</script>

<h1>LiveView Message Page</h1>
<div
  class="grid grid-cols-9 grid-rows-9 max-w-full aspect-square p-0.5 bg-black gap-0.5"
  draggable="false"
  on:pointerup={() => (select_mode = "nothing")}
>
  {#each cells as cell}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- on:click={() => select(cell.row, cell.col)} -->
    <div
      on:pointerdown={(e) => down(e.shiftKey || e.metaKey || e.ctrlKey, cell)}
      on:pointermove={(e) => move(cell)}
      class="row-start-{cell.row} col-start-{cell.col} bg-white border-lime-500 border-4"
      style:border-style={cell.selected ? "solid" : "none"}
      draggable="false"
    ></div>
    <!-- style="border-style: solid; border-width: 0.4em; border-image: conic-gradient(from 30deg, red 0% 50%, blue 50% 100%) 1" -->
    <!-- style="box-shadow: inset 0 0 0 0.3em red, inset 0 0 0 0.6em blue" -->
  {/each}
</div>
