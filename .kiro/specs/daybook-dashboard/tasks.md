# Implementation Plan: Daybook — To-Do List Life Dashboard

## Overview

This is a retroactive task list for an already-implemented project. All implementation tasks are pre-checked (complete). The remaining actionable work focuses on **spec verification** (confirming the live code matches the spec) and **correctness properties documentation** (documenting how the eight design properties map to the codebase, since NFR-1 specifies no test setup is required).

The implementation is organised as a logical build sequence: HTML skeleton → CSS theming → feature-by-feature JavaScript → spec verification → properties documentation.

---

## Tasks

- [x] 1. Set up core HTML structure (`index.html`)
  - [x] 1.1 Scaffold the page skeleton with `<!DOCTYPE html>`, `<head>` metadata, Google Fonts links, and deferred script reference
    - Create `index.html` with Fraunces, Inter, and JetBrains Mono font imports
    - Link `css/style.css` in `<head>` and `js/script.js` as a deferred script
    - _Requirements: TC-1, TC-4, NFR-1_
  - [x] 1.2 Add the greeting/clock `<header class="greeting-card">` with `#clock`, `#date`, `#greeting`, and `#set-name-btn` elements
    - _Requirements: 1.1, 1.2, 1.3, 2.1–2.5, 3.1_
  - [x] 1.3 Add the two-column `.grid` wrapper and the Focus Timer `<section>` with SVG ring, `#timer-display`, and all timer control buttons
    - Include `#timer-ring`, `#start-btn`, `#stop-btn`, `#reset-btn`, `#settings-toggle-btn`, `#settings-panel`, and `#duration-input`
    - _Requirements: 4.1–4.9, 5.1–5.5_
  - [x] 1.4 Add the Task List `<section>` with `#task-form`, `#task-input`, `#task-list`, `#task-count`, `#task-empty`, and `#duplicate-hint` elements
    - _Requirements: 6.1–6.7, 7.1–7.4, 8.1–8.4, 9.1–9.5_
  - [x] 1.5 Add the Quick Links `<section>` spanning full grid width, with `#link-form`, `#link-name-input`, `#link-url-input`, `#link-chips`, and `#link-empty` elements
    - _Requirements: 10.1–10.11_

- [x] 2. Implement CSS theming and layout (`css/style.css`)
  - [x] 2.1 Define all CSS custom properties on `:root` (colour palette, shadow, radius, font stacks) and override them in `[data-theme="dark"]`
    - Tokens: `--color-paper`, `--color-card`, `--color-ink`, `--color-teal`, `--color-coral`, `--color-danger`, `--shadow`, `--radius`, `--font-display`, `--font-body`, `--font-mono`
    - _Requirements: NFR-3_
  - [x] 2.2 Implement the two-column CSS Grid layout and the 720 px responsive breakpoint
    - `.grid { display: grid; grid-template-columns: repeat(2, 1fr); }` with single-column `@media (max-width: 719px)`
    - Quick Links section always spans `grid-column: 1 / -1`
    - _Requirements: TC-3, NFR-1_
  - [x] 2.3 Style all card/section components, typography, buttons, form inputs, task list items, and chip elements
    - Apply `--font-display` to clock and greeting headline, `--font-body` to all body text, `--font-mono` to timer countdown
    - Style the SVG ring colours for light and dark themes
    - _Requirements: NFR-2, NFR-3_

- [x] 3. Implement Greeting + Clock feature (`js/script.js` — Section 1)
  - [x] 3.1 Implement the IIFE wrapper, `KEYS` constants object, and `RING_CIRCUMFERENCE` constant
    - `const KEYS = { NAME, TASKS, LINKS, DURATION }` with exact key strings matching the localStorage schema
    - `const RING_CIRCUMFERENCE = 552.9`
    - _Requirements: TC-1, TC-2_
  - [x] 3.2 Implement `formatTime(date)` and `formatDate(date)` pure helper functions
    - `formatTime` returns `HH:MM:SS` using `padStart(2, '0')`
    - `formatDate` returns `"{Weekday}, {D} {Month} {YYYY}"` format
    - _Requirements: 1.1, 1.3_
  - [x] 3.3 Implement `getGreetingPhrase(hour)` pure function covering all 24 hours
    - `[0,4]` → "Good night", `[5,11]` → "Good morning", `[12,17]` → "Good afternoon", `[18,23]` → "Good evening"
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [x] 3.4 Implement `updateClock()` and wire it to `setInterval` (1 000 ms) and initial call on load
    - Reads `new Date()`, updates `#clock`, `#date`, and `#greeting` DOM nodes; appends stored name if present
    - _Requirements: 1.2, 2.5, 3.4_
  - [x] 3.5 Implement `setName()` — prompt flow, trim, `localStorage` write/remove, and greeting update
    - Cancel → no-op; whitespace-only → remove key; non-empty → trim and store under `KEYS.NAME`
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.6_

- [x] 4. Implement Focus Timer feature (`js/script.js` — Section 2)
  - [x] 4.1 Declare timer state variables and initialise `durationMinutes` from `localStorage` with fallback to 25
    - `let durationMinutes, totalSeconds, remainingSeconds, timerInterval, isRunning`
    - Validation: `parseInt(..., 10)`, check `Number.isInteger(raw) && raw >= 1 && raw <= 120`
    - _Requirements: 4.1, 5.5_
  - [x] 4.2 Implement `formatTimerDisplay(seconds)` and `setRingOffset(offset)` helpers
    - `formatTimerDisplay` returns `MM:SS`; on full-minute boundary returns `MM:00`
    - `setRingOffset` sets `stroke-dashoffset` on `#timer-ring`
    - _Requirements: 4.2, 4.6_
  - [x] 4.3 Implement `startTimer()`, `stopTimer()`, and `resetTimer()` with correct button enable/disable logic
    - `startTimer` guards against double-start; sets `isRunning = true` and creates interval
    - `stopTimer` clears interval, sets `isRunning = false`
    - `resetTimer` calls `stopTimer` then restores `remainingSeconds = totalSeconds`
    - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.7, 4.9_
  - [x] 4.4 Implement `tick()` and `handleTimerDone()`
    - `tick` decrements `remainingSeconds`, updates display and ring offset, calls `handleTimerDone` at zero
    - `handleTimerDone` calls `stopTimer`, sets display to "Done!", collapses ring to `RING_CIRCUMFERENCE`
    - _Requirements: 4.8_

- [x] 5. Implement Configurable Pomodoro Duration (`js/script.js` — Section 2 continued)
  - [x] 5.1 Implement `toggleSettings()` to show/hide the `#settings-panel`
    - _Requirements: 5.1_
  - [x] 5.2 Implement `saveSettings(minutes)` with range validation and `localStorage` persistence
    - Validates `1 ≤ minutes ≤ 120` and that value is an integer; shows alert on rejection
    - Stores validated value under `KEYS.DURATION`; calls `resetTimer()` with new duration; hides panel
    - _Requirements: 5.2, 5.3, 5.4_

- [x] 6. Implement Task List — add, persist, and render (`js/script.js` — Section 3)
  - [x] 6.1 Implement `loadTasks()` with `try/catch` + `Array.isArray` guard; initialise `let tasks`
    - Falls back to `[]` on absent, null, or malformed JSON
    - _Requirements: 6.4, 6.5_
  - [x] 6.2 Implement `saveTasks()` — `JSON.stringify(tasks)` written to `KEYS.TASKS`
    - _Requirements: 6.3_
  - [x] 6.3 Implement `renderTasks()` — full re-render: clear `#task-list`, build one `<li>` per task, call `updateCountPill()`, toggle `#task-empty`
    - Each `<li>` includes checkbox, text span, and delete button
    - _Requirements: 6.6, 6.7, 9.1, 9.4_
  - [x] 6.4 Implement `addTask(text)` — validate non-empty ≤ 200 chars, show inline error on failure, create Task with `crypto.randomUUID()`, append, save, render
    - _Requirements: 6.1, 6.2_
  - [x] 6.5 Implement `toggleDone(id)` and `deleteTask(id)` event handlers wired to checkbox and delete button
    - `toggleDone` flips `done`, saves, renders; `deleteTask` filters by id, saves, renders
    - _Requirements: 9.2, 9.3, 9.5_

- [x] 7. Implement Inline Editing and Duplicate Prevention (`js/script.js` — Section 3 continued)
  - [x] 7.1 Implement `isDuplicate(text, excludeId?)` — normalised `trim().toLowerCase()` comparison across `tasks` array
    - _Requirements: 8.1, 8.2, 8.4_
  - [x] 7.2 Implement `beginEdit(li, task)` — set `contenteditable="true"` on text element; store original text for escape-cancel
    - _Requirements: 7.1_
  - [x] 7.3 Implement `commitEdit(li, task)` — trim text; if empty → `deleteTask`; if duplicate → revert + show `#duplicate-hint`; else update + save + render
    - _Requirements: 7.2, 7.3, 8.2_
  - [x] 7.4 Implement `cancelEdit(li, task)` — restore original text, remove `contenteditable` on Escape keydown
    - _Requirements: 7.4_
  - [x] 7.5 Wire duplicate hint dismissal — hide `#duplicate-hint` on any `input` event on `#task-input`
    - _Requirements: 8.3_

- [x] 8. Implement Quick Links feature (`js/script.js` — Section 4)
  - [x] 8.1 Implement `loadLinks()` with `try/catch` + `Array.isArray` guard; initialise `let links`
    - Falls back to `[]` on absent, null, or malformed JSON
    - _Requirements: 10.9_
  - [x] 8.2 Implement `saveLinks()` — `JSON.stringify(links)` written to `KEYS.LINKS`
    - _Requirements: 10.4_
  - [x] 8.3 Implement `normalizeUrl(url)` — prepend `https://` if URL does not start with `http://` or `https://`
    - _Requirements: 10.3, 10.11_
  - [x] 8.4 Implement `addLink(name, url)` — validate non-empty name and URL, normalise URL, create Link with UUID, append, save, render
    - _Requirements: 10.1, 10.2_
  - [x] 8.5 Implement `renderLinks()` — full re-render: clear `#link-chips`, build one `<a class="chip">` per link with `target="_blank" rel="noopener noreferrer"`, toggle `#link-empty`
    - Each chip includes a remove button whose click handler calls `deleteLink(id)` and stops propagation
    - _Requirements: 10.5, 10.6, 10.7, 10.10_
  - [x] 8.6 Implement `deleteLink(id)` — filter by id, save, render
    - _Requirements: 10.8_

- [ ] 9. Spec verification — confirm live code matches spec
  - [ ] 9.1 Verify `index.html` DOM structure matches all element IDs and structure described in design.md (Components and Interfaces section)
    - Check: `#clock`, `#date`, `#greeting`, `#set-name-btn`, `#timer-display`, `#timer-ring`, `#start-btn`, `#stop-btn`, `#reset-btn`, `#settings-toggle-btn`, `#settings-panel`, `#duration-input`, `#settings-save-btn`, `#task-form`, `#task-input`, `#task-list`, `#task-count`, `#task-empty`, `#duplicate-hint`, `#link-form`, `#link-name-input`, `#link-url-input`, `#link-chips`, `#link-empty`
    - _Requirements: TC-4_
  - [ ] 9.2 Verify `css/style.css` defines all custom property tokens listed in design.md and implements the 720 px breakpoint
    - Check: all `--color-*`, `--shadow`, `--radius`, `--font-*` tokens on `:root`; `[data-theme="dark"]` overrides; `@media (max-width: 719px)` single-column rule; Quick Links `grid-column: 1 / -1`
    - _Requirements: NFR-3_
  - [ ] 9.3 Verify `js/script.js` is wrapped in an IIFE, uses `'use strict'`, and defines `KEYS` with exact key strings `daybook_name`, `daybook_tasks`, `daybook_links`, `daybook_duration`
    - _Requirements: TC-1, TC-2_
  - [ ] 9.4 Verify greeting phrase boundaries: open `index.html` in browser, mock system hour to each of 0, 5, 12, 18 and confirm correct phrase is shown; verify phrase updates when an hour boundary is crossed
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - [ ] 9.5 Verify timer state machine: test Start → Stop → Start → Reset → Start → wait for zero; confirm "Done!" display, button states at each step, and MM:00 reset display
    - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9_
  - [ ] 9.6 Verify settings panel: click ⚙, enter 45, save; confirm `localStorage.getItem('daybook_duration')` === `"45"` and timer displays `45:00`; test rejection of 0, 121, and non-integer inputs
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  - [ ] 9.7 Verify task CRUD: add task, confirm it appears in `localStorage`; toggle done, confirm strikethrough and count pill decrement; delete task, confirm removal from `localStorage`
    - _Requirements: 6.1, 6.3, 9.2, 9.3, 9.5_
  - [ ] 9.8 Verify inline edit flows: click task text → edit → Enter to commit; click task text → edit → Escape to cancel; clear all text → Enter to delete task
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  - [ ] 9.9 Verify duplicate prevention: add "Buy milk"; attempt to add "buy milk" (lowercased); confirm hint shown and no duplicate created; edit existing task to match another task name, confirm revert
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  - [ ] 9.10 Verify Quick Links: add link with URL missing scheme (e.g. `example.com`), confirm stored URL is `https://example.com`; click chip, confirm opens in new tab; remove chip, confirm removed from `localStorage`
    - _Requirements: 10.1, 10.3, 10.6, 10.8, 10.11_
  - [ ] 9.11 Verify `localStorage` persistence across page reload: add tasks and links, reload page, confirm all data restored correctly
    - _Requirements: 6.5, 10.9_

- [ ] 10. Correctness properties documentation
  - [ ] 10.1 Document Property 1 (Duplicate-Free Task List) — locate `isDuplicate()` in `js/script.js` and add a comment block referencing P1, Requirements 8.1, 8.2, 8.4, and the normalisation logic (`trim().toLowerCase()`)
    - Confirm the function is called by both `addTask()` and `commitEdit()`
    - _Requirements: 8.1, 8.2, 8.4_
  - [ ] 10.2 Document Property 2 (Timer Bounds Invariant) — add a comment block on `tick()` and `resetTimer()` referencing P2, Requirements 4.2, 4.3, 4.6, 4.8, and the range `[0, durationMinutes × 60]`
    - Confirm `stroke-dashoffset` is always set from the range `[0, RING_CIRCUMFERENCE]`
    - _Requirements: 4.2, 4.3, 4.6, 4.8_
  - [ ] 10.3 Document Property 3 (URL Normalisation Invariant) — add a comment block on `normalizeUrl()` and `addLink()` referencing P3, Requirements 10.3, 10.11
    - Confirm every code path through `addLink()` calls `normalizeUrl()` before appending to the `links` array
    - _Requirements: 10.3, 10.11_
  - [ ] 10.4 Document Property 4 (Task Count Accuracy) — add a comment block on `updateCountPill()` referencing P4, Requirements 6.7, 9.2, 9.3, 9.5, and the formula `tasks.filter(t => !t.done).length`
    - Confirm `renderTasks()` always calls `updateCountPill()` — i.e., count is never stale
    - _Requirements: 6.7, 9.2, 9.3, 9.5_
  - [ ] 10.5 Document Property 5 (Task Storage Round-Trip) — add a comment block on `saveTasks()` and `loadTasks()` referencing P5, Requirements 6.3, 6.5, 7.2, 9.2, 9.5, and the `try/catch` + `Array.isArray` guard
    - _Requirements: 6.3, 6.5, 7.2, 9.2, 9.5_
  - [ ] 10.6 Document Property 6 (Greeting Phrase Coverage) — add a comment block on `getGreetingPhrase()` referencing P6, Requirements 2.1–2.4, and the four hour ranges; note the exhaustive coverage of all 24 hours with no gaps
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [ ] 10.7 Document Property 7 (Name Trim Invariant) — add a comment block on `setName()` referencing P7, Requirements 3.2, 3.3, 3.5, and both branches: whitespace-only input removes the key, non-empty input stores the trimmed value
    - _Requirements: 3.2, 3.3, 3.5_
  - [ ] 10.8 Document Property 8 (Link Storage Round-Trip) — add a comment block on `saveLinks()` and `loadLinks()` referencing P8, Requirements 10.4, 10.9, 10.11, and the `try/catch` + `Array.isArray` guard
    - _Requirements: 10.4, 10.9, 10.11_

- [ ] 11. Final checkpoint
  - Open `index.html` directly in a browser (no server) and confirm no console errors, all four features function correctly, and both light and dark themes render as expected.

---

## Notes

- Tasks 1–8 are pre-checked because this is a retroactive spec for already-implemented code.
- Tasks 9 and 10 are the actionable work: verifying implementation fidelity and adding in-code documentation for the eight correctness properties.
- Tasks marked with `*` would be optional property-based test stubs — none are included here because NFR-1 specifies no test setup required and the design's testing strategy calls for fast-check-based PBT as a separate exercise.
- Each task references specific requirements for traceability.
- Checkpoints ensure incremental validation.

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4", "1.5"] },
    { "id": 2, "tasks": ["2.1", "2.2", "2.3", "3.1"] },
    { "id": 3, "tasks": ["3.2", "3.3", "3.4", "3.5", "4.1", "6.1", "6.2", "8.1", "8.2"] },
    { "id": 4, "tasks": ["4.2", "4.3", "4.4", "5.1", "5.2", "6.3", "6.4", "6.5", "7.1", "8.3", "8.4"] },
    { "id": 5, "tasks": ["7.2", "7.3", "7.4", "7.5", "8.5", "8.6"] },
    { "id": 6, "tasks": ["9.1", "9.2", "9.3"] },
    { "id": 7, "tasks": ["9.4", "9.5", "9.6", "9.7", "9.8", "9.9", "9.10", "9.11"] },
    { "id": 8, "tasks": ["10.1", "10.2", "10.3", "10.4", "10.5", "10.6", "10.7", "10.8"] }
  ]
}
```
