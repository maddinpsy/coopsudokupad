defmodule CoopsudokuWeb.Sudoku do
  use CoopsudokuWeb, :live_view
  def id(r, c), do: 100 * r + c

  def mount(_params, _session, socket) do
    cells =
      for c <- 1..9, r <- 1..9, into: %{}, do: {id(r, c), %{row: r, col: c, selected: false}}

    {:ok, assign(socket, cells: cells)}
  end

  def handle_event("select", %{"row" => row, "col" => col, "altKey" => alt}, socket) do
    {r, _} = Integer.parse(row)
    {c, _} = Integer.parse(col)
    new_cells = socket.assigns.cells |> update_in([id(r, c), :selected], &(not &1))
    {:noreply, assign(socket, cells: new_cells)}
  end
end
