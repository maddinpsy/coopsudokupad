<script>
  export let cells;
  export let color;
  export let live;

  let select_mode = "nothing";
  let current_cell_idx = 0;
  const col_count = 100;
  const input_modes = ["value", "cornermark"];
  let input_mode = "value";

  function get_cell_id(cell) {
    return cell.row * col_count + cell.col;
  }

  function down(altKey, cell) {
    current_cell_idx = get_cell_id(cell);
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
    current_cell_idx = get_cell_id(cell);
    if (select_mode == "selecting" && !cell.selected.includes(color)) {
      live.pushEvent("select", cell, () => {});
    }
    if (select_mode == "deselecting" && cell.selected.includes(color)) {
      live.pushEvent("deselect", cell, () => {});
    }
  }
  function keyPress(altKey, key) {
    switch (key) {
      case "Escape":
        live.pushEvent("clear_selection", {}, () => {});
        break;
      case "s":
      case "ArrowDown":
        handle_move(altKey, current_cell_idx + col_count);
        break;
      case "w":
      case "ArrowUp":
        handle_move(altKey, current_cell_idx - col_count);
        break;
      case "d":
      case "ArrowRight":
        handle_move(altKey, current_cell_idx + 1);
        break;
      case "a":
      case "ArrowLeft":
        handle_move(altKey, current_cell_idx - 1);
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
        handle_set(key, input_mode);
        break;
      case "Backspace":
      case "Delete":
        handle_delete();
        break;
      case " ":
        input_mode =
          input_modes[
            (input_modes.indexOf(input_mode) + 1) % input_modes.length
          ];
        break;
    }
  }

  function handle_set(key, mode) {
    if (mode === "value") {
      if (
        cells[current_cell_idx].value &&
        cells[current_cell_idx].value === key
      ) {
        live.pushEvent(
          "set_value",
          { cell: cells[current_cell_idx], value: "" },
          () => {},
        );
      } else {
        live.pushEvent(
          "set_value",
          { cell: cells[current_cell_idx], value: key },
          () => {},
        );
      }
    } else if (mode === "cornermark") {
      live.pushEvent(
        "set_cornermark",
        { cell: cells[current_cell_idx], value: key },
        () => {},
      );
    }
  }

  function handle_delete() {
    if (cells[current_cell_idx].value && cells[current_cell_idx].value !== "")
      live.pushEvent(
        "set_value",
        { cell: cells[current_cell_idx], value: "" },
        () => {},
      );
    else if (cells[current_cell_idx].cornermark) {
      live.pushEvent("clear_cornermark", cells[current_cell_idx], () => {});
    }
  }

  function handle_move(altKey, new_cell_idx) {
    if (cells[new_cell_idx]) {
      if (!altKey) {
        live.pushEvent("clear_selection", {}, () => {});
      }
      live.pushEvent("select", cells[new_cell_idx], () => {});
      current_cell_idx = new_cell_idx;
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
  {#each Object.values(cells) as cell}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- on:click={() => select(cell.row, cell.col)} -->
    <div
      on:pointerdown={(e) => down(e.shiftKey || e.metaKey || e.ctrlKey, cell)}
      on:pointermove={(e) => move(cell)}
      class="row-start-{cell.row} col-start-{cell.col} bg-white relative"
      style:box-shadow={cell.selected
        .map((c, idx) => `inset 0 0 0 ${(idx + 1) * 0.1}em ${c}`)
        .join()}
      style:font-size="5vw"
      draggable="false"
    >
      {#if cell.value}
        <div
          class="flex justify-center items-center h-full w-full select-none absolute"
          style:font-size="7vw"
        >
          {cell.value}
        </div>
      {:else if cell.cornermark}
        <div
          class="grid h-full w-full grid-rows-3 grid-cols-3 select-none absolute"
          style:font-size="2vw"
        >
          {#each cell.cornermark as mark}
            <div class="flex justify-center items-center">{mark}</div>
          {/each}
        </div>
      {/if}
    </div>
    <!-- style="border-style: solid; border-width: 0.4em; border-image: conic-gradient(from 30deg, red 0% 50%, blue 50% 100%) 1" -->
  {/each}
</div>
<div>Mode: {input_mode}</div>
