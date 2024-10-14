defmodule CoopsudokuWeb.LoginController do
  alias CoopsudokuWeb.Sudoku
  use CoopsudokuWeb, :controller
  import Phoenix.LiveView.Controller

  def show(conn, _) do
    conn
    |> get_session()
    |> case do
      %{"name" => name, "color" => color} -> live_render(conn, Sudoku)
      _ -> render(conn, :show)
    end
  end

  def post(conn, %{"color" => color, "name" => username}) do
    conn
    |> put_session(:color, color)
    |> put_session(:name, username)
    |> redirect(to: ~p"/")
  end
end
