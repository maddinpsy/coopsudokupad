defmodule CoopsudokuWeb.Sudoku do
  use CoopsudokuWeb, :live_view

  def mount(_params, _session, socket) do
    cells = for c <- 1..9, r <- 1..9, do: %{row: r, col: c}
    {:ok, assign(socket, cells: cells)}
  end
end
