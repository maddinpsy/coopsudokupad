# Coopsudoku

This is a copy of Svens sudokupad.app with support for multiplayer.

Start a new puzzle and send the url to a friend. Then every action is shared between the browsers.

Start the dev server with:
```
npx local-web-server --rewrite '/api/puzzle/(.*) -> http://sudokupad.app/api/puzzle/$1' --spa index.html -d src
```

## current limitations
- only two player can connect to each other
- the url is only shown at start
- there is no status, no info whether it is connected
- no error handling, only shown on the console
- The state is not synced, if someone is connecting later, only new changes will be sent to her.