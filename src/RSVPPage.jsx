import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import './rsvpPage.css';

const fontOptions = [
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
  { label: 'Courier New', value: '"Courier New", monospace' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
  { label: 'Inter (Modern)', value: '"Inter", sans-serif' },
];

const buildOrpSlices = (word) => {
  if (word.length < 2) {
    return { left: '', orp: word, right: '' };
  }

  const orpIndex = Math.floor((word.length - 1) / 2);
  return {
    left: word.slice(0, orpIndex),
    orp: word[orpIndex],
    right: word.slice(orpIndex + 1),
  };
};

const RSVPPage = () => {
  const [text, setText] = useState('');
  const [wpm, setWpm] = useState(300);
  const [chunkSize, setChunkSize] = useState(1);
  const [pauseSeconds, setPauseSeconds] = useState(0.25);
  const [font, setFont] = useState('"Inter", sans-serif');
  const [displayWords, setDisplayWords] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const wordsRef = useRef([]);
  const indexRef = useRef(0);
  const timeoutRef = useRef(null);
  const displayRef = useRef(null);
  const wpmRef = useRef(wpm);
  const chunkRef = useRef(chunkSize);
  const pauseRef = useRef(pauseSeconds);
  const isRunningRef = useRef(isRunning);
  const isPausedRef = useRef(isPaused);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const stopReading = useCallback(() => {
    clearTimer();
    setDisplayWords([]);
    setIsRunning(false);
    setIsPaused(false);
    isRunningRef.current = false;
    isPausedRef.current = false;
    indexRef.current = 0;
  }, [clearTimer]);

  const displayNext = useCallback(() => {
    if (!isRunningRef.current || isPausedRef.current) {
      return;
    }

    const words = wordsRef.current;

    if (indexRef.current >= words.length) {
      stopReading();
      return;
    }

    const chunk = chunkRef.current || 1;
    const chunkWords = words.slice(indexRef.current, indexRef.current + chunk);

    setDisplayWords(chunkWords);
    indexRef.current += chunk;

    const lastWord = chunkWords[chunkWords.length - 1] || '';
    const lastChar = lastWord[lastWord.length - 1];
    let delay = 60000 / (wpmRef.current || 300);

    if (lastChar === '.' || lastChar === ',') {
      delay += (pauseRef.current || 0) * 1000;
    }

    clearTimer();
    timeoutRef.current = setTimeout(displayNext, delay);
  }, [clearTimer, stopReading]);

  const startReading = useCallback(() => {
    const trimmedText = text.trim();

    if (!trimmedText) {
      alert('Paste some text first!');
      return;
    }

    if (!isRunningRef.current) {
      wordsRef.current = trimmedText.split(/\s+/);
      indexRef.current = 0;
    }

    isRunningRef.current = true;
    isPausedRef.current = false;
    setIsRunning(true);
    setIsPaused(false);
    displayNext();
  }, [displayNext, text]);

  const togglePause = useCallback(() => {
    if (!isRunningRef.current) {
      return;
    }

    if (isPausedRef.current) {
      isPausedRef.current = false;
      setIsPaused(false);
      displayNext();
    } else {
      isPausedRef.current = true;
      setIsPaused(true);
      clearTimer();
    }
  }, [clearTimer, displayNext]);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(false);

    const file = event.dataTransfer.files?.[0];

    if (!file) {
      return;
    }

    if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result;
        setText(typeof result === 'string' ? result : '');
      };
      reader.onerror = (errorEvent) => {
        const message = errorEvent.target?.error?.message || 'Unknown error';
        alert(`Error reading file: ${message}`);
      };
      reader.readAsText(file);
    } else {
      alert('Please drop a plain text file (.txt)');
    }
  }, []);

  useEffect(() => {
    wpmRef.current = wpm;
    chunkRef.current = chunkSize;
    pauseRef.current = pauseSeconds;

    if (isRunningRef.current && !isPausedRef.current) {
      clearTimer();
      displayNext();
    }
  }, [chunkSize, clearTimer, displayNext, pauseSeconds, wpm]);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  useLayoutEffect(() => {
    const displayElement = displayRef.current;

    if (!displayElement) {
      return;
    }

    const left = displayElement.querySelector('.rsvp-left');
    const orp = displayElement.querySelector('.rsvp-orp');

    if (left && orp) {
      displayElement.style.textAlign = 'left';
      const leftWidth = left.getBoundingClientRect().width;
      const orpWidth = orp.getBoundingClientRect().width;
      displayElement.style.paddingLeft = `${displayElement.clientWidth / 2 - leftWidth - orpWidth / 2}px`;
    } else {
      displayElement.style.textAlign = 'center';
      displayElement.style.paddingLeft = '0px';
    }
  }, [displayWords]);

  return (
    <div className="rsvp-page">
      <h1 className="rsvp-title">ReadMultiplex.com: RSVP Speed Reading</h1>

      <textarea
        className={`rsvp-input${isDragOver ? ' dragover' : ''}`}
        placeholder="Paste your text here... or drag & drop a .txt file"
        aria-label="Paste your text to speed read"
        value={text}
        onChange={(event) => setText(event.target.value)}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      />

      <div className="rsvp-controls" aria-label="Reading controls">
        <div className="rsvp-control-row">
          <label htmlFor="fontSelect">Font:</label>
          <select
            id="fontSelect"
            value={font}
            onChange={(event) => setFont(event.target.value)}
          >
            {fontOptions.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="rsvp-control-row">
          <label htmlFor="wpmSlider">
            WPM: <span>{wpm}</span>
          </label>
          <input
            type="range"
            id="wpmSlider"
            min="100"
            max="3000"
            step="50"
            value={wpm}
            onChange={(event) => setWpm(Number(event.target.value))}
          />
        </div>

        <div className="rsvp-control-row">
          <label htmlFor="chunkSlider">
            Chunk: <span>{chunkSize}</span>
          </label>
          <input
            type="range"
            id="chunkSlider"
            min="1"
            max="3"
            step="1"
            value={chunkSize}
            onChange={(event) => setChunkSize(Number(event.target.value))}
          />
        </div>

        <div className="rsvp-control-row">
          <label htmlFor="pauseSlider">
            Pause (s): <span>{pauseSeconds}</span>
          </label>
          <input
            type="range"
            id="pauseSlider"
            min="0.0625"
            max="1"
            step="0.0625"
            value={pauseSeconds}
            onChange={(event) => setPauseSeconds(Number(event.target.value))}
          />
        </div>

        <div className="rsvp-button-row">
          <button
            type="button"
            className={`rsvp-btn${isRunning ? ' active' : ''}`}
            onClick={startReading}
            disabled={isRunning}
          >
            ▶ Play
          </button>
          <button
            type="button"
            className={`rsvp-btn${isPaused ? ' active' : ''}`}
            onClick={togglePause}
            disabled={!isRunning}
          >
            {isPaused ? '▶ Resume' : '⏸ Pause'}
          </button>
          <button
            type="button"
            className="rsvp-btn"
            onClick={stopReading}
            disabled={!isRunning}
          >
            ■ Stop
          </button>
        </div>
      </div>

      <div className="rsvp-focus-box" aria-label="Reading focus area">
        <div className="rsvp-display" aria-live="polite" ref={displayRef} style={{ fontFamily: font }}>
          {displayWords.map((word, index) => {
            const { left, orp, right } = buildOrpSlices(word);
            const hasOrp = word.length > 1;

            return (
              <span key={`${word}-${index}`} className="rsvp-word">
                {hasOrp ? (
                  <>
                    <span className="rsvp-left">{left}</span>
                    <span className="rsvp-orp">{orp}</span>
                    <span className="rsvp-right">{right}</span>
                  </>
                ) : (
                  <span className="rsvp-orp">{orp}</span>
                )}
                {index < displayWords.length - 1 ? ' ' : ''}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RSVPPage;
