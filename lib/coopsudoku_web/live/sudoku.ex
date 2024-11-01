defmodule CoopsudokuWeb.Sudoku do
  use CoopsudokuWeb, :live_view
  use LiveSvelte.Components

  def id(r, c), do: 100 * r + c

  def mount( %{"name" => _, "color" => _, "room" => _} = params, _session, socket) do
    if connected?(socket) do
      CoopsudokuWeb.Endpoint.subscribe(topic(params["room"]))
    end

    cells =
      for c <- 1..9, r <- 1..9, into: %{}, do: {id(r, c), %{row: r, col: c, selected: false}}

    :ets.insert(:room_users,{params["room"], socket.id})

    cells = sync_room(params["room"]) |> merge_cell_data(cells)

    {:ok, assign(socket, cells: cells, name: params["name"], color: params["color"], room: params["room"])}
  end

  def mount(_params, _session, socket) do
    {:ok, socket}
  end

  def sync_room(room)do
    case :ets.lookup(:sudoku_data,room) do
      [{_, data}] -> data
      [] -> %{}
    end
  end

  def merge_cell_data(accumulator, data) do
    Map.merge(accumulator, data, fn _, a, b -> Map.update!(a, :selected, fn a -> b.selected or a end) end)
  end

  def handle_event("select", %{"row" => r, "col" => c}, socket) do
    id = id(r, c)
    new_cells = socket.assigns.cells |> put_in([id, :selected], true)

    :ets.insert(:sudoku_data,{socket.assigns.room, new_cells})

    CoopsudokuWeb.Endpoint.broadcast(topic(socket.assigns.room), "sync_required", %{})

    {:noreply, assign(socket, cells: new_cells)}
  end

  def handle_event("deselect", %{"row" => r, "col" => c}, socket) do
    id = id(r, c)
    new_cells = socket.assigns.cells |> put_in([id, :selected], false)

    :ets.insert(:sudoku_data,{socket.assigns.room, new_cells})

    CoopsudokuWeb.Endpoint.broadcast(topic(socket.assigns.room), "sync_required", %{})

    {:noreply, assign(socket, cells: new_cells)}
  end

  def handle_event("clear_selection", _, socket) do
    new_cells =
      socket.assigns.cells
      |> Map.to_list()
      |> Enum.filter(fn {_, v} -> v.selected end)
      |> Enum.reduce(
        socket.assigns.cells,
        fn {k, _}, acc -> put_in(acc, [k, :selected], false) end
      )

      :ets.insert(:sudoku_data,{socket.assigns.room, new_cells})

      CoopsudokuWeb.Endpoint.broadcast(topic(socket.assigns.room), "sync_required", %{})

    {:noreply, assign(socket, cells: new_cells)}
  end

  def handle_info(%{event: "sync_required"}, socket) do
    cells = sync_room(socket.assigns.room)
    {:noreply, assign(socket, cells: cells)}
  end

  defp topic(room) do
    "chat"<>room
  end

  def render(%{name: _} = assigns) do
    ~H"""
    <.Sudoku cells={@cells |> Map.values()} socket={@socket} />
    """
  end

  def render(assigns) do
    ~H"""
    <.Login socket={@socket} />
    """
  end

  def terminate(_reason, socket) do
    :ets.delete_object(:room_users,{socket.assigns.room, socket.id})
    if(:ets.lookup(:room_users,socket.assigns.room) |> length == 0) do
      :ets.delete(:sudoku_data,socket.assigns.room)
    end
  end
end
