import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import FeedbackCard from '../components/FeedbackCard';
import CameraPreview from '../components/CameraPreview';
import DeviceGate from '../components/DeviceGate';
import { canListen, canSpeak, useListen, useSpeak } from '../lib/useSpeech';

// Interview khatam hone ke baad ka summary (har question ka score aur feedback)
function Summary({ interview }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <p className="text-sm text-muted">{interview.role}</p>
      <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Interview complete</h1>

      <p className="mt-6 font-display text-6xl font-bold leading-none">
        {interview.overallScore ?? '-'}
        <span className="text-2xl font-medium text-muted">/10</span>
      </p>
      <p className="mt-2 text-sm text-muted">Average across {interview.questions.length} questions</p>

      <div className="mt-8 space-y-3">
        {interview.questions.map((q, i) => (
          <details key={q.id} className="rounded-2xl border border-line bg-paper p-5">
            <summary className="flex cursor-pointer items-start justify-between gap-4">
              <span className="font-medium">
                {i + 1}. {q.text}
              </span>
              <span className="shrink-0 font-display text-xl font-bold">
                {q.answer ? q.answer.score : '-'}
              </span>
            </summary>
            {q.answer && (
              <div className="mt-4 space-y-3">
                <p className="rounded-xl bg-chalk p-4 text-sm">
                  <span className="font-semibold">Your answer: </span>
                  {q.answer.text}
                </p>
                <FeedbackCard score={q.answer.score} feedback={q.answer.feedback} />
              </div>
            )}
          </details>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/interview/new"
          className="rounded-xl bg-signal px-6 py-3 font-semibold text-white transition hover:bg-ink"
        >
          Start another interview
        </Link>
        <Link
          to="/history"
          className="rounded-xl border border-line bg-paper px-6 py-3 font-semibold transition hover:border-ink"
        >
          All interviews
        </Link>
      </div>
    </div>
  );
}

export default function Interview() {
  const { id } = useParams();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // answer bhejne ke baad AI ka jawab
  const startedAt = useRef(Date.now()); // har question ka time naapne ke liye

  // Camera stream (DeviceGate se milti hai). Ye hooks saare early return se PEHLE rehne chahiye.
  const [stream, setStream] = useState(null);
  const streamRef = useRef(null);
  const [usedVoice, setUsedVoice] = useState(false); // is answer me mic use hua?

  const { listening, interim, error: micError, start, stop } = useListen((finalText) => {
    setUsedVoice(true);
    setText((prev) => (prev ? prev + ' ' : '') + finalText);
  });
  const { speaking, speak, cancel } = useSpeak();

  function handleDevicesReady(s) {
    streamRef.current = s;
    setStream(s);
  }

  // Camera beech me band ho gaya (unplug ya browser se off) to gate wapas aayega
  useEffect(() => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    const onEnd = () => {
      streamRef.current = null;
      setStream(null);
    };
    track?.addEventListener('ended', onEnd);
    return () => track?.removeEventListener('ended', onEnd);
  }, [stream]);

  // Page chhodte hi camera band (light bujh jaye)
  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), []);

  const load = useCallback(async () => {
    try {
      const data = await api(`/interviews/${id}`);
      setInterview(data.interview);
      setLoadError('');
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
      // Interview poora ho gaya (summary dikh rahi hai): camera band kar do, light bujh jaye
  const finished = interview?.status === 'COMPLETED' && !result;
  useEffect(() => {
    if (finished && streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setStream(null);
    }
  }, [finished]);
    return <div className="px-4 py-24 text-center text-muted">Loading...</div>;
  }
  if (loadError || !interview) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="text-red-700">{loadError || 'Interview not found'}</p>
        <Link to="/interview/new" className="mt-4 inline-block font-semibold text-signal underline">
          Start a new interview
        </Link>
      </div>
    );
  }

  const questions = interview.questions;
  const current = questions.find((q) => !q.answer); // pehla question jiska answer nahi hua
  const answeredCount = questions.filter((q) => q.answer).length;
  const total = interview.totalQuestions;

  // Interview complete: summary dikhao (par abhi-abhi last answer ka feedback pehle dikhana hai)
  if (interview.status === 'COMPLETED' && !result) {
    return <Summary interview={interview} />;
  }
  if (!current && !result) {
    return <div className="px-4 py-24 text-center text-muted">No question to answer.</div>;
  }

  // Camera + mic ke bina interview nahi chalega
  if (!stream) {
    return <DeviceGate onReady={handleDevicesReady} />;
  }

  const done = answeredCount + (result ? 1 : 0);

  async function handleSubmit(e) {
    e.preventDefault();
    if (listening) stop();
    cancel();
    setError('');
    setBusy(true);
    try {
      const data = await api(`/interviews/${id}/answers`, {
        method: 'POST',
        body: {
          questionId: current.id,
          text: text.trim(),
          source: usedVoice ? 'VOICE' : 'TEXT',
          timeTakenSec: Math.min(3600, Math.round((Date.now() - startedAt.current) / 1000)),
        },
      });
      setResult(data);
    } catch (err) {
      setError(err.message);
      // 409 = ye answer pehle hi save ho chuka (jaise timeout ke baad retry). Screen sync kar lo.
      if (err.status === 409) await load();
    } finally {
      setBusy(false);
    }
  }

  async function handleNext() {
    setResult(null);
    setText('');
    setUsedVoice(false);
    startedAt.current = Date.now();
    await load(); // naya question (ya complete summary) server se lao
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <CameraPreview stream={stream} />

      {/* Upar: kitne question ho gaye aur abhi ka level */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="font-medium">
          {interview.role} · Question {Math.min(answeredCount + 1, total)} of {total}
        </span>
        <span className="rounded-full bg-ink px-3 py-1 font-semibold text-white">
          Level {interview.currentLevel}
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-signal transition-all"
          style={{ width: `${(done / total) * 100}%` }}
        />
      </div>

      {result ? (
        /* ===== Feedback view: answer bhejne ke baad ===== */
        <div className="mt-8">
          <FeedbackCard score={result.evaluation.score} feedback={result.evaluation} />

          <p className="mt-4 text-sm text-muted">
            Next question difficulty: level {result.newLevel}
            {result.newLevel > interview.currentLevel
              ? ' (harder)'
              : result.newLevel < interview.currentLevel
              ? ' (easier)'
              : ''}
          </p>

          <button
            onClick={handleNext}
            className="mt-6 w-full rounded-xl bg-signal px-6 py-3 font-semibold text-white transition hover:bg-ink"
          >
            {result.isComplete ? 'See results' : 'Next question'}
          </button>
        </div>
      ) : (
        /* ===== Question view ===== */
        <form onSubmit={handleSubmit} className="mt-8">
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-chalk px-3 py-1">{current.topic}</span>
            {current.kind === 'FOLLOW_UP' && (
              <span className="rounded-full bg-marigold/25 px-3 py-1">Follow-up</span>
            )}
          </div>

          <div className="mt-4 flex items-start justify-between gap-4">
            <h1 className="font-display text-2xl font-bold leading-snug tracking-tight">
              {current.text}
            </h1>
            {canSpeak && (
              <button
                type="button"
                onClick={() => (speaking ? cancel() : speak(current.text))}
                className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-sm font-semibold transition hover:border-ink"
              >
                {speaking ? 'Stop' : 'Read aloud'}
              </button>
            )}
          </div>

          <div className="mt-8 mb-2 flex items-center justify-between">
            <label htmlFor="answer" className="text-sm font-medium">
              Your answer
            </label>
            {canListen && (
              <button
                type="button"
                onClick={listening ? stop : start}
                disabled={busy}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  listening ? 'bg-coral text-white' : 'border border-line hover:border-ink'
                }`}
              >
                {listening ? 'Stop recording' : 'Speak your answer'}
              </button>
            )}
          </div>
          <textarea
            id="answer"
            rows={9}
            maxLength={4000}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={busy}
            placeholder="Explain it the way you would in the room."
            className="w-full resize-y rounded-2xl border border-line bg-paper p-4 leading-relaxed outline-none transition focus:border-signal"
          />
          <p className="mt-1 text-right text-xs text-muted">{text.length} / 4000</p>

          {listening && (
            <p role="status" className="mt-2 text-sm text-muted">
              Listening... {interim}
            </p>
          )}
          {micError && <p className="mt-2 text-sm text-red-700">{micError}</p>}

          {error && (
            <p role="alert" className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || text.trim().length === 0}
            className="mt-4 w-full rounded-xl bg-signal px-6 py-3 font-semibold text-white transition hover:bg-ink disabled:opacity-60"
          >
            {busy ? 'Scoring your answer...' : 'Submit answer'}
          </button>

          {busy && (
            <p role="status" className="mt-3 text-center text-sm text-muted">
              The AI is scoring your answer and writing the next question. This can take up to a minute.
            </p>
          )}
        </form>
      )}
    </div>
  );
}