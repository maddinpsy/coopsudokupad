defmodule CoopsudokuWeb.MessageLiveTest do
  use CoopsudokuWeb.ConnCase
  import Phoenix.LiveViewTest

  test "disconnected and connected mount", %{conn: conn} do
    conn = get(conn, "/")
    assert html_response(conn, 200) =~ "LiveView Message Page"

    {:ok, _view, _html} = live(conn)
  end
end
