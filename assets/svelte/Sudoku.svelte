<script>
  import { onMount } from "svelte";
  import { load, select, getRC } from "../js/sudokupad.js";

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
    if (cells[current_cell_idx] === undefined) return;
    const selected = cells[current_cell_idx].selected;
    if (!altKey) {
      live.pushEvent("clear_selection", {}, () => {});
    }
    if (!selected.includes(color)) {
      select_mode = "selecting";
      live.pushEvent("select", cell, () => {});
    } else {
      select_mode = "deselecting";
      live.pushEvent("deselect", cell, () => {});
    }
  }

  function move(cell) {
    current_cell_idx = get_cell_id(cell);
    if (cells[current_cell_idx] === undefined) return;
    const selected = cells[current_cell_idx].selected;
    if (select_mode == "selecting" && !selected.includes(color)) {
      live.pushEvent("select", cell, () => {});
    }
    if (select_mode == "deselecting" && selected.includes(color)) {
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
  let loaded = false;
  onMount(() => {
    load();
    loaded = true;
  });

  $: {
    if (loaded) {
      selectedCells = Object.values(cells).filter((c) => c.selected.length > 0);
      select(selectedCells);
    }
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<svg
  on:pointerup={() => (select_mode = "nothing")}
  on:pointerdown={(e) =>
    down(e.shiftKey || e.metaKey || e.ctrlKey, getRC(e.clientX, e.clientY))}
  on:pointermove={(e) => {
    if (select_mode !== "nothing") {
      move(getRC(e.clientX, e.clientY));
    }
  }}
  id="svgrenderer"
  class="boardsvg"
  xmlns="http://www.w3.org/2000/svg"
  version="1.1"
  draggable="false"
  style="vector-effect: non-scaling-stroke;"
>
  <g id="background" />
  <g id="underlay" />
  <g id="cell-colors" />
  <g id="arrows" />
  <g id="cages" />
  <g id="cell-highlights" />
  <g id="cell-grids" />
  <g id="cell-errors" />
  <g id="overlay" />
  <g id="cell-givens" />
  <g id="cell-pen" />
  <g id="cell-pencilmarks" />
  <g id="cell-candidates" />
  <g id="cell-values" />
</svg>
<div>Mode: {input_mode}</div>
