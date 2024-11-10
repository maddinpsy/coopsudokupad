defmodule CoopsudokuWeb.Sudoku do
  use CoopsudokuWeb, :live_view
  use LiveSvelte.Components

  def id(r, c), do: 100 * r + c

  def mount(%{"name" => _, "color" => _, "room" => _} = params, _session, socket) do
    if connected?(socket) do
      CoopsudokuWeb.Endpoint.subscribe(topic(params["room"]))
    end

    :ets.insert(:room_users, {params["room"], socket.id})

    cells = sync_room(params["room"])

    {:ok,
     assign(socket,
       cells: cells,
       name: params["name"],
       color: params["color"],
       room: params["room"]
     )}
  end

  def mount(_params, _session, socket) do
    {:ok, socket}
  end

  def sync_room(room) do
    case :ets.lookup(:sudoku_data, room) do
      [{_, data}] -> data
      [] -> for c <- 1..9, r <- 1..9, into: %{}, do: {id(r, c), %{row: r, col: c, selected: []}}
    end
  end

  def handle_event("select", %{"row" => r, "col" => c}, socket) do
    id = id(r, c)

    new_cells =
      socket.assigns.cells |> update_in([id, :selected], &set_add(&1, socket.assigns.color))

    :ets.insert(:sudoku_data, {socket.assigns.room, new_cells})

    CoopsudokuWeb.Endpoint.broadcast(topic(socket.assigns.room), "sync_required", %{})

    {:noreply, assign(socket, cells: new_cells)}
  end

  def handle_event("deselect", %{"row" => r, "col" => c}, socket) do
    id = id(r, c)

    new_cells =
      socket.assigns.cells |> update_in([id, :selected], &set_delete(&1, socket.assigns.color))

    :ets.insert(:sudoku_data, {socket.assigns.room, new_cells})

    CoopsudokuWeb.Endpoint.broadcast(topic(socket.assigns.room), "sync_required", %{})

    {:noreply, assign(socket, cells: new_cells)}
  end

  def handle_event("clear_selection", _, socket) do
    new_cells =
      socket.assigns.cells
      |> Map.to_list()
      |> Enum.reduce(
        socket.assigns.cells,
        fn {cell_id, _}, acc ->
          update_in(acc, [cell_id, :selected], &set_delete(&1, socket.assigns.color))
        end
      )

    :ets.insert(:sudoku_data, {socket.assigns.room, new_cells})

    CoopsudokuWeb.Endpoint.broadcast(topic(socket.assigns.room), "sync_required", %{})

    {:noreply, assign(socket, cells: new_cells)}
  end

  def handle_event("set_value", %{"cell" => %{"row" => r, "col" => c}, "value" => value}, socket) do
    id = id(r, c)

    new_cells =
      socket.assigns.cells |> put_in([id, :value], value)

    :ets.insert(:sudoku_data, {socket.assigns.room, new_cells})

    CoopsudokuWeb.Endpoint.broadcast(topic(socket.assigns.room), "sync_required", %{})

    {:noreply, assign(socket, cells: new_cells)}
  end

  def handle_event("set_cornermark", %{"cell" => %{"row" => r, "col" => c}, "value" => v}, socket) do
    id = id(r, c)

    new_cells =
      socket.assigns.cells |> update_in([id, :cornermark], &set_toggle(&1, v))

    :ets.insert(:sudoku_data, {socket.assigns.room, new_cells})

    CoopsudokuWeb.Endpoint.broadcast(topic(socket.assigns.room), "sync_required", %{})

    {:noreply, assign(socket, cells: new_cells)}
  end

  def handle_event("clear_cornermark", %{"row" => r, "col" => c}, socket) do
    id = id(r, c)

    new_cells =
      socket.assigns.cells |> put_in([id, :cornermark], [])

    :ets.insert(:sudoku_data, {socket.assigns.room, new_cells})

    CoopsudokuWeb.Endpoint.broadcast(topic(socket.assigns.room), "sync_required", %{})

    {:noreply, assign(socket, cells: new_cells)}
  end

  def handle_info(%{event: "sync_required"}, socket) do
    cells = sync_room(socket.assigns.room)
    {:noreply, assign(socket, cells: cells)}
  end

  defp topic(room) do
    "chat" <> room
  end

  def set_add(list, value) do
    if Enum.member?(list, value), do: list, else: [value | list]
  end

  def set_delete(list, value) do
    Enum.reject(list, fn elm -> elm == value end)
  end

  def set_toggle(nil, value) do
    [value]
  end

  def set_toggle(list, value) do
    if Enum.member?(list, value), do: set_delete(list, value), else: list ++ [value]
  end

  def render(%{name: _} = assigns) do
    ~H"""
    <.Sudoku cells={@cells} socket={@socket} color={@color} ssr={false} />
    """
  end

  def render(assigns) do
    ~H"""
    <.Login socket={@socket} />
    """
  end

  def terminate(_reason, socket) do
    handle_event("clear_selection", [], socket)
    :ets.delete_object(:room_users, {socket.assigns.room, socket.id})

    if(:ets.lookup(:room_users, socket.assigns.room) |> length == 0) do
      :ets.delete(:sudoku_data, socket.assigns.room)
    end
  end
end
