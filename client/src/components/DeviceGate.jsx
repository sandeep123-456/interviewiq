import { useState } from 'react';
import { canListen } from '../lib/useSpeech';

// Interview shuru hone se pehle camera + mic dono zaroori
export default function DeviceGate({ onReady }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const supported = canListen && Boolean(navigator.mediaDevices?.getUserMedia);

  async function enable() {
    setBusy(true);
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      // Mic ki permission mil gayi. Speech recognition apna mic khud kholta hai,
      // isliye yahan ki audio track band kar do (dono ek saath mic pakdein to dikkat aati hai).
      stream.getAudioTracks().forEach((t) => t.stop());
      onReady(stream);
    } catch {
      setError('Camera and microphone are both required. Allow them in the address bar, then try again.');
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-bold tracking-tight">Ready when you are</h1>
      <p className="mt-3 text-muted">
        This interview works like a real one. Turn on your camera and microphone to begin.
      </p>

      {supported ? (
        <button
          type="button"
          onClick={enable}
          disabled={busy}
          className="mt-8 w-full rounded-xl bg-signal px-6 py-3 font-semibold text-white transition hover:bg-ink disabled:opacity-60"
        >
          {busy ? 'Waiting for permission...' : 'Allow camera and microphone'}
        </button>
      ) : (
        <p role="alert" className="mt-8 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          This browser cannot run the interview. Open it in Chrome or Edge.
        </p>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}