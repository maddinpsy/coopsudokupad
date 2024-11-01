<script>
  export let cells;
  export let color;
  export let live;

  let select_mode = "nothing";
  let current_cell = { row: 0, col: 0 };

  function down(altKey, cell) {
    current_cell = cell;
    if (!altKey) {
      live.pushEvent("clear_selection", {}, () => {});
    }
    if (!cell.selected.includes(color)) {
      select_mode = "selecting";
      live.pushEvent("select", cell, () => {});
    } else {
      select_mode = "deselecting";
      live.pushEvent("deselect", cell, () => {});
    }
  }

  function move(cell) {
    current_cell = cell;
    if (select_mode == "selecting" && !cell.selected.includes(color)) {
      live.pushEvent("select", cell, () => {});
    }
    if (select_mode == "deselecting" && cell.selected.includes(color)) {
      live.pushEvent("deselect", cell, () => {});
    }
  }
  function keyPress(altKey, key) {
    if (
      !altKey &&
      !["1", "2", "3", "4", "5", "6", "7", "8", "9", "Delete"].includes(key)
    ) {
      live.pushEvent("clear_selection", {}, () => {});
    }
    switch (key) {
      case "Escape":
        live.pushEvent("clear_selection", {}, () => {});
        break;
      case "ArrowDown":
        current_cell = { ...current_cell, row: current_cell.row + 1 };
        live.pushEvent("select", current_cell, () => {});
        break;
      case "ArrowUp":
        current_cell = { ...current_cell, row: current_cell.row - 1 };
        live.pushEvent("select", current_cell, () => {});
        break;
      case "ArrowRight":
        current_cell = { ...current_cell, col: current_cell.col + 1 };
        live.pushEvent("select", current_cell, () => {});
        break;
      case "ArrowLeft":
        current_cell = { ...current_cell, col: current_cell.col - 1 };
        live.pushEvent("select", current_cell, () => {});
        break;
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        live.pushEvent(
          "set_value",
          { cell: current_cell, value: key },
          () => {},
        );
        break;
      case "Delete":
        live.pushEvent(
          "set_value",
          { cell: current_cell, value: "" },
          () => {},
        );
        break;
    }
  }
</script>

<h1>LiveView Message Page</h1>
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<div
  class="grid grid-cols-9 grid-rows-9 max-w-full aspect-square p-0.5 bg-black gap-0.5 outline-none"
  draggable="false"
  tabindex="0"
  on:keydown={(e) => keyPress(e.shiftKey || e.metaKey || e.ctrlKey, e.key)}
  on:pointerup={() => (select_mode = "nothing")}
>
  {#each cells as cell}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- on:click={() => select(cell.row, cell.col)} -->
    <div
      on:pointerdown={(e) => down(e.shiftKey || e.metaKey || e.ctrlKey, cell)}
      on:pointermove={(e) => move(cell)}
      class="row-start-{cell.row} col-start-{cell.col} bg-white flex justify-center items-center"
      style:font-size="7vw"
      style:box-shadow={cell.selected
        .map((c, idx) => `inset 0 0 0 ${(idx + 1) * 0.1}em ${c}`)
        .join()}
      draggable="false"
    >
      {cell.value ? cell.value : ""}
    </div>
    <!-- style="border-style: solid; border-width: 0.4em; border-image: conic-gradient(from 30deg, red 0% 50%, blue 50% 100%) 1" -->
  {/each}
</div>
