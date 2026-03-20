# note — minimal text editor

A single-file, local-first text editor that runs entirely
in your browser. No signup, no backend, no dependencies.
Just open the page and start typing.

Built as a single `index.html` file with vanilla JS and
CSS (~5500 lines). Your notes are stored in `localStorage`
by default. Optionally, sign in with Google to sync notes
across devices via Google Drive.

## How it works

- **Single file**: The entire app is one self-contained
  HTML file (~5500 lines). No build step, no bundler,
  no framework.
- **Local storage**: Notes are persisted in your
  browser's `localStorage` (5MB limit). A storage meter
  appears when usage exceeds 200kB.
- **Cross-tab sync**: Open the editor in multiple tabs —
  changes to notes, sidebar width, word wrap, vim mode,
  and pin state sync instantly via `storage` events.
- **URL sharing**: Notes can be shared via URL using zlib
  compression encoded in the hash fragment. The shared
  note is embedded in the link itself — no server
  involved.
- **Google Drive sync**: Optionally sign in with Google
  to sync notes across devices. Files are stored in your
  Google Drive's hidden app folder — no storage cost to
  the app. The Google library is lazy-loaded only when
  you initiate sync.
- **Offline**: Works fully offline. The only external
  asset is the Victor Mono font file served alongside
  the HTML.

## Features

- Syntax highlighting for 11+ languages
  (JS, TS, Python, Rust, Go, CSS, HTML, JSON,
  YAML, TOML, Markdown, and more)
- Fuzzy search across all notes
- Find & replace within a note
- Drag-and-drop file import
- Drag to reorder notes in sidebar
- Pin notes to keep them at the top
- Zip export (download all notes at once)
- Google Drive sync with per-file conflict resolution
- Vim mode (toggle in toolbar, desktop only)
- Word wrap toggle with wrap-aware line numbers
- Current line highlighting
- Markdown preview (edit/view tabs for `.md` files)
  with inter-note linking (`[label](other.md)`)
- Cursor position (line/column) and vim mode indicator in status bar
- Indent/dedent selection with Tab/Shift+Tab
- Undo/redo with per-note history
- Delete confirmation dialog
- Built-in help page (accessible from file menu)
- Mobile-optimized UI with touch-friendly controls

## Vim mode

Toggle vim mode via the `vim` button in the toolbar
(desktop only, hidden on touch devices). The setting
persists in localStorage and syncs via Google Drive.

Supported modes: **Normal**, **Insert**, **Visual**,
**Visual Line**, and **Command** (`:` prompt).

Features include:
- Modal editing with block cursor in normal mode
- Motions: `h` `j` `k` `l` `w` `b` `e` `0` `$` `^`
  `gg` `G` `{` `}` `_` `f`/`F`/`t`/`T` with `;` `,` repeat
- Operators: `d` `c` `y` with motions and text objects
  (`iw` `aw` `i"` `a(` etc.)
- Line operations: `dd` `cc` `yy` `>>` `<<` `J` `p` `P`
- Visual selection with `v`, visual line with `V`
- Dot repeat (`.`) for most editing commands
- Search with `/` (forward) and `?` (backward), `n`/`N`
  to navigate matches, `*`/`#` to search word under cursor
- Command mode (`:`) with `:set wrap`, `:set nowrap`,
  `:new`, `:e <name>`, `:help`, `:<number>` (jump to
  line), `:%s/find/replace/g` (opens find & replace)
- Count prefixes (e.g. `3dw`, `5j`, `2>>`)

## Keyboard shortcuts

| Shortcut        | Action                             |
| --------------- | ---------------------------------- |
| Ctrl+N          | New note                           |
| Ctrl+P / Ctrl+F | Search all notes                   |
| Ctrl+H          | Find & replace                     |
| Ctrl+Shift+D    | Delete note                        |
| Ctrl+Z          | Undo                               |
| Ctrl+Shift+Z    | Redo                               |
| Tab             | Insert 2 spaces / indent selection |
| Shift+Tab       | Dedent selection                   |
| Escape          | Close search / sidebar / find bar  |

When vim mode is active, standard vim keybindings take
precedence in the editor. The shortcuts above still work
in input fields (search, find & replace).

## Mobile

On mobile, the sidebar opens as a full-screen overlay.
The file menu (bottom-right) provides access to new note,
find & replace, search, sharing, and downloads. New notes
prompt for a filename via a styled dialog.

## Tech

- **Theme**: [Catppuccin Mocha](https://catppuccin.com)
- **Font**: [Victor Mono](https://rubjo.github.io/victor-mono/)
  (served locally)
- **Compression**: zlib via `CompressionStream` /
  `DecompressionStream` APIs for URL sharing
- **Zip**: Custom minimal zip builder (no library)
  for multi-note download
- **Google Drive**: OAuth 2.0 via Google Identity
  Services (lazy-loaded). Drive API calls use plain
  `fetch` — no `gapi` client library needed
