# note — minimal text editor

A single-file, local-first text editor that runs entirely
in your browser. No signup, no backend, no dependencies.
Just open the page and start typing.

Built as a single `index.html` file with vanilla JS and
CSS. Your notes are stored in `localStorage` by default.
Optionally, sign in with Google to sync notes across
devices via Google Drive.

## How it works

- **Single file**: The entire app is one self-contained
  HTML file (~3500 lines). No build step, no bundler,
  no framework.
- **Local storage**: Notes are persisted in your
  browser's `localStorage` (5MB limit). A storage meter
  appears when usage exceeds 200kB.
- **Cross-tab sync**: Open the editor in multiple tabs —
  changes to notes, sidebar width, word wrap, and pin
  state sync instantly via `storage` events.
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
- Word wrap toggle with wrap-aware line numbers
- Current line highlighting
- Cursor position (line/column) in status bar
- Indent/dedent selection with Tab/Shift+Tab
- Undo/redo with per-note history
- Delete confirmation dialog
- Mobile-optimized UI with touch-friendly controls

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
