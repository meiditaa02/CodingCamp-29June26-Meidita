# Requirements Document

## Introduction

Daybook is a personal life dashboard built as a standalone web page using vanilla HTML5, CSS3, and JavaScript. It provides a real-time clock and greeting, a configurable Pomodoro focus timer, a to-do list with inline editing and duplicate prevention, and a quick links panel. All user data is persisted entirely in the browser's `localStorage` — no server, no framework, no build step required.

This document is a retroactive specification: it describes what is already implemented in the project.

---

## Glossary

- **Dashboard**: The single-page application rendered by `index.html`.
- **Clock**: The UI component that displays the current time updated every second.
- **Greeting**: The salutation message composed of a time-of-day phrase and the user's optional display name.
- **Focus_Timer**: The Pomodoro countdown timer component with start, stop, and reset controls.
- **Settings_Panel**: The collapsible panel that exposes the timer duration input field.
- **Task_List**: The to-do list component that manages task creation, editing, completion, and deletion.
- **Task**: An individual to-do item represented as `{ id: string, text: string, done: boolean }`.
- **Quick_Links**: The component that stores and displays shortcut chips to external URLs.
- **Link**: An individual quick-link entry represented as `{ id: string, name: string, url: string }`.
- **localStorage**: The browser's Web Storage API used as the sole persistence layer.
- **UUID**: A universally unique identifier assigned to each Task and Link at creation time.
- **Duplicate**: A task whose trimmed, lowercased text matches an existing task's trimmed, lowercased text.
- **Scheme**: The protocol prefix of a URL (`http://` or `https://`).

---

## Technical Constraints

- **TC-1 Stack:** THE Dashboard SHALL be implemented using only HTML5, CSS3, and vanilla JavaScript with no frameworks, libraries, or build tools.
- **TC-2 Storage:** THE Dashboard SHALL use the browser `localStorage` API as the sole data persistence mechanism with no backend.
- **TC-3 Compatibility:** THE Dashboard SHALL operate correctly in modern versions of Chrome, Firefox, Edge, and Safari, and SHALL be usable as a standalone web page opened directly in a browser.
- **TC-4 File Structure:** THE Dashboard SHALL consist of exactly one HTML file (`index.html`), one CSS file (`css/style.css`), and one JavaScript file (`js/script.js`).

---

## Non-Functional Requirements

- **NFR-1 Simplicity:** THE Dashboard SHALL present a clean, minimal UI that requires no setup or installation beyond opening `index.html` in a browser.
- **NFR-2 Performance:** THE Dashboard SHALL load with no perceptible lag and respond to all user interactions without delay.
- **NFR-3 Visual Design:** THE Dashboard SHALL apply CSS custom properties to support a light theme and a dark theme selectable via the `[data-theme="dark"]` attribute on the root element.

---

## Requirements

### Requirement 1: Real-Time Clock Display

**User Story:** As a user, I want to see the current time and date on the dashboard, so that I always know when I am without switching to another application.

#### Acceptance Criteria

1. THE Clock SHALL display the current time in HH:MM:SS 24-hour format using the user's local system timezone.
2. WHEN the Dashboard is open, THE Clock SHALL update the displayed time every second.
3. THE Clock SHALL display the full date in the order: weekday name, day number, month name, and year, separated by a comma and spaces (e.g., "Friday, 3 July 2026").

---

### Requirement 2: Time-of-Day Greeting

**User Story:** As a user, I want to see a greeting that reflects the time of day, so that the dashboard feels contextual and personal.

#### Acceptance Criteria

1. WHILE the user's local device time hour is between 0 and 4 inclusive, THE Greeting SHALL display the phrase "Good night".
2. WHILE the user's local device time hour is between 5 and 11 inclusive, THE Greeting SHALL display the phrase "Good morning".
3. WHILE the user's local device time hour is between 12 and 17 inclusive, THE Greeting SHALL display the phrase "Good afternoon".
4. WHILE the user's local device time hour is between 18 and 23 inclusive, THE Greeting SHALL display the phrase "Good evening".
5. WHEN the local device time crosses an hour boundary that changes the greeting phrase, THE Greeting SHALL update its displayed phrase without requiring a page reload.

---

### Requirement 3: Custom Display Name in Greeting

**User Story:** As a user, I want to set my name so that the greeting addresses me personally.

#### Acceptance Criteria

1. THE Dashboard SHALL display a "Set your name" button that, WHEN clicked, opens a browser `prompt()` dialog pre-populated with the currently stored name (or empty if none is stored).
2. WHEN the user enters a non-empty, non-whitespace-only name and confirms the prompt, THE Greeting SHALL update to append a comma and the trimmed name to the time-of-day phrase (e.g., "Good morning, Meidita").
3. WHEN the user enters a non-empty name and confirms the prompt, THE Dashboard SHALL store the trimmed name in `localStorage` under the key `daybook_name`.
4. WHEN the Dashboard loads and `localStorage` contains a non-empty value for `daybook_name`, THE Greeting SHALL display that stored name appended to the time-of-day phrase without prompting the user.
5. WHEN the user submits an empty or whitespace-only name in the prompt, THE Dashboard SHALL remove `daybook_name` from `localStorage` and display the time-of-day phrase alone without any name.
6. WHEN the user dismisses the prompt (cancels), THE Dashboard SHALL leave the current name and greeting unchanged.

---

### Requirement 4: Focus Timer (Pomodoro)

**User Story:** As a user, I want a countdown timer I can start and stop, so that I can use the Pomodoro technique to manage my focus sessions.

#### Acceptance Criteria

1. THE Focus_Timer SHALL default to a 25-minute countdown on initial load when no duration is stored in `localStorage`.
2. THE Focus_Timer SHALL display remaining time as a circular SVG ring progress indicator where a full ring represents the full configured duration and an empty ring represents zero seconds remaining.
3. WHEN the user clicks Start, THE Focus_Timer SHALL begin counting down from the current remaining time in one-second intervals.
4. WHEN the user clicks Start, THE Focus_Timer SHALL disable the Start button and enable the Stop button.
5. WHEN the user clicks Stop, THE Focus_Timer SHALL pause the countdown, re-enable the Start button, and disable the Stop button.
6. WHEN the user clicks Reset, THE Focus_Timer SHALL stop the countdown, restore remaining time to the configured duration, and display that duration in MM:00 format.
7. THE Reset button SHALL remain enabled regardless of whether the timer is running or paused.
8. WHEN the Focus_Timer reaches zero, THE Focus_Timer SHALL stop the countdown, disable the Stop button, re-enable the Start button, collapse the ring to empty, and display the message "Done!".
9. WHEN the Dashboard page loads, THE Focus_Timer SHALL initialize as a non-running timer showing the configured duration in MM:00 format, regardless of any prior running state.

---

### Requirement 5: Configurable Pomodoro Duration

**User Story:** As a user, I want to change the timer duration, so that I can adapt the Pomodoro length to my workflow.

#### Acceptance Criteria

1. WHEN the user clicks the settings icon button (⚙) on the Focus_Timer card, THE Dashboard SHALL make the Settings_Panel visible if it is currently hidden, or hide it if it is currently visible.
2. THE Settings_Panel SHALL contain a number input field accepting integer values between 1 and 120 (minutes, inclusive).
3. WHEN the user clicks Save in the Settings_Panel with an integer value between 1 and 120 inclusive, THE Dashboard SHALL store that value in `localStorage` under the key `daybook_duration`, hide the Settings_Panel, and stop any active countdown displaying the new duration in MM:00 format as a non-running timer.
4. WHEN the user clicks Save in the Settings_Panel with a value outside the range 1–120 or a non-integer value, THE Dashboard SHALL display an error alert, reject the change, and leave the existing timer duration and running state unchanged.
5. WHEN the Dashboard loads and `localStorage` contains an integer value for `daybook_duration` that is between 1 and 120 inclusive, THE Focus_Timer SHALL initialize as a non-running timer showing that duration in MM:00 format.

---

### Requirement 6: Add and Persist Tasks

**User Story:** As a user, I want to add tasks to a to-do list, so that I can track what I need to accomplish during the day.

#### Acceptance Criteria

1. WHEN the user submits the task form with a non-empty, non-whitespace-only task text of 1–200 characters, THE Task_List SHALL create a new Task with a UUID, `done: false`, and the trimmed text.
2. IF the user submits the task form with an empty or whitespace-only value, THE Task_List SHALL not create a Task and SHALL display an inline validation message indicating input is required.
3. WHEN a Task is added, THE Dashboard SHALL append it to the task array and persist the full array to `localStorage` under the key `daybook_tasks` as a JSON string.
4. WHEN the Dashboard loads and `localStorage` does not contain a parseable array for `daybook_tasks` (absent, null, or malformed JSON), THE Task_List SHALL treat the task array as empty and render no tasks.
5. WHEN the Dashboard loads and `localStorage` contains a valid JSON array for `daybook_tasks`, THE Task_List SHALL restore and render all Tasks in the order they were saved.
6. THE Task_List SHALL display a visible message indicating there are no tasks to show when the task array is empty.
7. THE Task_List SHALL display a count pill showing the number of Tasks where `done` is `false`.

---

### Requirement 7: Inline Task Editing

**User Story:** As a user, I want to edit a task's text by clicking on it, so that I can correct or update tasks without deleting and re-creating them.

#### Acceptance Criteria

1. WHEN the user clicks on a Task's text, THE Task_List SHALL make that text directly editable in-place.
2. WHEN the user confirms the edit by pressing Enter or moving focus away from the editable text, THE Task_List SHALL trim the entered text, update the Task's `text` property to the trimmed value, and persist the updated array to `localStorage`.
3. WHEN the committed text is empty after trimming, THE Task_List SHALL delete the Task from the array and from `localStorage`.
4. WHEN the user presses Escape while editing a Task's text, THE Task_List SHALL cancel the edit and restore the Task's text to its value before editing began, leaving `localStorage` unchanged.

---

### Requirement 8: Duplicate Task Prevention

**User Story:** As a user, I want the system to prevent duplicate tasks, so that my list stays clean and free of repeated entries.

#### Acceptance Criteria

1. WHEN the user submits a new task whose trimmed, lowercased text matches the trimmed, lowercased text of any existing Task, THE Task_List SHALL reject the submission and display the hint "That task is already on your list."
2. WHEN the user edits an existing Task and the trimmed, lowercased committed text matches the trimmed, lowercased text of any *other* Task (excluding the Task being edited), THE Task_List SHALL discard the edit, revert the element to the Task's stored text, and display a hint indicating the task already exists.
3. WHEN the user modifies the task input field after a duplicate hint is shown, THE Task_List SHALL dismiss the hint message.
4. THE Task_List SHALL ensure that at no point do two Tasks in the array share the same trimmed, lowercased text value.

---

### Requirement 9: Mark Task Done and Delete Task

**User Story:** As a user, I want to mark tasks as done and remove them, so that I can track my progress and keep the list current.

#### Acceptance Criteria

1. THE Task_List SHALL render a checkbox for each Task.
2. WHEN the user checks a Task's checkbox, THE Task_List SHALL set the Task's `done` property to `true`, apply a strikethrough style to the Task text, and persist the updated array to `localStorage`.
3. WHEN the user unchecks a Task's checkbox, THE Task_List SHALL set the Task's `done` property to `false`, remove the strikethrough style, and persist the updated array to `localStorage`.
4. THE Task_List SHALL render a Delete button for each Task.
5. WHEN the user clicks the Delete button for a Task, THE Task_List SHALL immediately remove the Task from the array, remove its rendered element from the UI, and persist the updated array to `localStorage` without prompting for confirmation.

---

### Requirement 10: Quick Links

**User Story:** As a user, I want to save shortcuts to my favorite websites, so that I can open them quickly from the dashboard.

#### Acceptance Criteria

1. WHEN the user submits the link form with a non-empty link name (1–50 characters) and a non-empty URL (1–2048 characters), THE Quick_Links component SHALL create a new Link with a UUID and add it to the links array.
2. WHEN the user submits the link form with an empty link name or an empty URL, THE Quick_Links component SHALL reject the submission and display an inline message indicating which field is required, without adding a Link.
3. WHEN the submitted URL does not begin with `http://` or `https://`, THE Quick_Links component SHALL prepend `https://` to the URL before storing it.
4. WHEN a Link is added, THE Dashboard SHALL assign it a UUID and persist the full links array to `localStorage` under the key `daybook_links` as a JSON string.
5. THE Quick_Links component SHALL render each Link as a chip displaying the link name.
6. WHEN the user clicks a Link chip, THE Quick_Links component SHALL open the Link's URL in a new browser tab with `rel="noopener noreferrer"`.
7. THE Quick_Links component SHALL render a remove button (✕) on each chip.
8. WHEN the user clicks the remove button on a chip, THE Quick_Links component SHALL remove the Link from the array, remove the chip from the UI, and persist the updated array to `localStorage`.
9. WHEN the Dashboard loads, THE Quick_Links component SHALL restore all Links from `localStorage` and render them.
10. THE Quick_Links component SHALL display a visible message indicating that no links have been saved yet when the links array is empty.
11. FOR ALL Links stored in `localStorage`, every URL value SHALL begin with `http://` or `https://` (URL normalization invariant).

---

## localStorage Schema

| Key | Value Type | Description |
|---|---|---|
| `daybook_name` | `string` | The user's display name for the Greeting |
| `daybook_tasks` | JSON string — `Array<{ id: string, text: string, done: boolean }>` | The ordered array of Tasks |
| `daybook_links` | JSON string — `Array<{ id: string, name: string, url: string }>` | The ordered array of Links |
| `daybook_duration` | `string` (numeric, 1–120) | The configured Pomodoro duration in minutes |

---

## Correctness Properties

The following invariants are always true after any add, edit, or delete operation. They are documented here for verification and property-based testing purposes.

| ID | Property | Description |
|---|---|---|
| P1 | **Duplicate-free tasks** | No two Tasks in the stored array share the same `text` value when both are trimmed and lowercased. |
| P2 | **Timer bounds** | `remainingSeconds` is always in the range `[0, configuredDurationMinutes × 60]`. |
| P3 | **URL normalization** | Every stored Link URL begins with `http://` or `https://`. |
| P4 | **Task count accuracy** | The count pill value always equals the count of Tasks where `done === false`. |
| P5 | **Storage round-trip** | `JSON.parse(localStorage.getItem('daybook_tasks'))` always produces a valid `Array<Task>` after any task operation. |
