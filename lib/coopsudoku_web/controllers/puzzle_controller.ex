# lib/coopsudoku_web/controllers/puzzle_controller.ex

defmodule CoopsudokuWeb.PuzzleController do
  use CoopsudokuWeb, :controller

  def show(conn, %{"id" => puzzle_id}) do
    # Define the URL of the external API
    url = "https://sudokupad.app/api/puzzle/#{puzzle_id}"

    # Make the HTTP request to the external API using Finch
    case Finch.build(:get, url) |> Finch.request(Coopsudoku.Finch) do
      {:ok, %Finch.Response{status: 200, body: body}} ->
        text(conn, body)

      {:ok, %Finch.Response{status: status_code}} ->
        # Handle non-200 statuses
        conn
        |> put_status(status_code)
        |> json(%{error: "Failed to fetch puzzle"})

      {:error, %Finch.Error{reason: reason}} ->
        # Handle network or other errors
        conn
        |> put_status(500)
        |> json(%{error: "Request failed", reason: to_string(reason)})
    end
  end
end
