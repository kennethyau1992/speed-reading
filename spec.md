# Feature Spec: RSVP Speed Reader

**Created**: 2026-01-19  
**Status**: Implemented  
**Input**: Replica of https://readmultiplex.com/RSVP.html with no audio

## User Scenarios & Testing

### User Story 1 - Start a speed-reading session (Priority: P1)

Readers want to paste text and start a rapid serial visual presentation (RSVP) session with adjustable controls.

**Why this priority**: Core value is the ability to read text quickly with RSVP pacing and focus alignment.

**Independent Test**: Paste text, press Play, verify words advance in the focus box at the configured WPM.

**Acceptance Scenarios**:

1. **Given** text is provided, **When** Play is pressed, **Then** the focus box advances through tokens at the current WPM.
2. **Given** the last token is shown, **When** the run completes, **Then** the focus box clears and controls reset.

---

### User Story 2 - Adjust speed controls mid-session (Priority: P1)

Readers need to change WPM, chunk size, and pause values while reading without restarting.

**Why this priority**: The experience requires real-time control to match reading comfort.

**Independent Test**: Start a session, change sliders, confirm the timing immediately reflects the new values.

**Acceptance Scenarios**:

1. **Given** playback is running, **When** WPM changes, **Then** the interval timing updates immediately.
2. **Given** playback is running, **When** chunk size changes, **Then** the number of words per flash updates immediately.
3. **Given** playback is running, **When** pause seconds changes, **Then** punctuation pauses update immediately.

---

### User Story 3 - Pause or stop a session (Priority: P2)

Readers want to pause to break focus and resume or stop to reset.

**Why this priority**: It is required for user control during longer reading sessions.

**Independent Test**: Pause during playback, resume, then stop and confirm state reset.

**Acceptance Scenarios**:

1. **Given** playback is running, **When** Pause is pressed, **Then** the timer halts and button changes to Resume.
2. **Given** playback is paused, **When** Resume is pressed, **Then** word flashing continues from the same position.
3. **Given** playback is running, **When** Stop is pressed, **Then** playback resets and the focus box clears.

---

### User Story 4 - Support multilingual text input (Priority: P2)

Readers can input English or CJK text and see tokens advance correctly.

**Why this priority**: The tool must handle Chinese/Japanese/Korean text without breaking tokens.

**Independent Test**: Paste Chinese text and verify each character displays as its own RSVP token.

**Acceptance Scenarios**:

1. **Given** CJK input, **When** Play is pressed, **Then** each character appears as a token with the ORP highlight.
2. **Given** punctuation like `。` or `，`, **When** a token ends with it, **Then** extra pause time is applied.

### Edge Cases

- Empty input shows an alert and prevents playback.
- Dragging a non-text file shows an alert.
- Very short tokens still render an ORP highlight without layout errors.

## Requirements

### Functional Requirements

- **FR-001**: The system must accept manual text entry and drag-and-drop `.txt` files.
- **FR-002**: The system must tokenize text for both space-delimited and CJK scripts.
- **FR-003**: The system must display tokens in the focus box with ORP highlighting.
- **FR-004**: The system must allow WPM, chunk size, and pause duration adjustments during playback.
- **FR-005**: The system must support Play, Pause/Resume, and Stop controls.
- **FR-006**: The system must reset UI state when playback completes.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Playback begins within 1 second after pressing Play.
- **SC-002**: Adjusting WPM changes the interval on the next tick.
- **SC-003**: CJK input displays one character per RSVP token without splitting errors.
- **SC-004**: Users can complete a full session without console errors.
