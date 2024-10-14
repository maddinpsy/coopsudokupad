defmodule CoopsudokuWeb.Sudoku do
  use CoopsudokuWeb, :live_view
  use LiveSvelte.Components

  def id(r, c), do: 100 * r + c

  def mount(_params, _session, socket) do
    if connected?(socket) do
      CoopsudokuWeb.Endpoint.subscribe(topic())
    end

    cells =
      for c <- 1..9, r <- 1..9, into: %{}, do: {id(r, c), %{row: r, col: c, selected: false}}

    {:ok, assign(socket, cells: cells)}
  end

  def handle_event("select", %{"row" => r, "col" => c}, socket) do
    id = id(r, c)
    new_cells = socket.assigns.cells |> update_in([id, :selected], &(not &1))

    CoopsudokuWeb.Endpoint.broadcast(topic(), "message", %{
      id: id,
      selected: new_cells[id].selected
      # name: socket.assigns.username
    })

    {:noreply, assign(socket, cells: new_cells)}
  end

  def handle_info(%{event: "message", payload: %{id: id, selected: selected}}, socket) do
    new_cells = socket.assigns.cells |> put_in([id, :selected], selected)
    {:noreply, assign(socket, cells: new_cells)}
  end

  defp topic do
    "chat"
  end

  def render(assigns) do
    ~H"""
    <.Sudoku cells={@cells |> Map.values()} socket={@socket} />
    """
  end
end
