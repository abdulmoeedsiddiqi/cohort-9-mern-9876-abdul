import { useEffect, useRef, useState } from 'react';

const MAX_DURATION_SECONDS = 300;

export interface RecordedVideo {
  blob: Blob;
  thumbnailBlob: Blob | null;
  durationSec: number;
}

interface VideoRecorderProps {
  onRecorded: (video: RecordedVideo) => void;
  existingAssetUrl?: string;
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function pickMimeType(): string {
  const candidates = ['video/webm;codecs=vp8,opus', 'video/webm'];
  const supported = candidates.find((type) => MediaRecorder.isTypeSupported(type));
  return supported ?? 'video/webm';
}

function captureThumbnail(blob: Blob): Promise<Blob | null> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (result: Blob | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(fallbackTimer);
      resolve(result);
    };
    // If the browser never fires loadeddata/seeked (e.g. an undecodable
    // recording), fall back so the note can still be saved without a thumbnail.
    const fallbackTimer = setTimeout(() => finish(null), 2000);

    const video = document.createElement('video');
    video.muted = true;
    video.src = URL.createObjectURL(blob);

    video.onloadeddata = () => {
      video.currentTime = Math.min(0.5, (video.duration || 1) / 2);
    };
    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(video.src);
        finish(null);
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((thumbnailBlob) => {
        URL.revokeObjectURL(video.src);
        finish(thumbnailBlob);
      }, 'image/jpeg', 0.8);
    };
    video.onerror = () => finish(null);
  });
}

export function VideoRecorder({ onRecorded, existingAssetUrl }: VideoRecorderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const elapsedRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [status, setStatus] = useState<'idle' | 'recording' | 'preview'>('idle');
  const [elapsedSec, setElapsedSec] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    },
    [],
  );

  function stopStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  function stopRecording() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    mediaRecorderRef.current?.stop();
  }

  async function handleRecordingStopped() {
    stopStream();
    const blob = new Blob(chunksRef.current, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    setStatus('preview');

    const thumbnailBlob = await captureThumbnail(blob);
    onRecorded({ blob, thumbnailBlob, durationSec: elapsedRef.current || 1 });
  }

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        await videoRef.current.play();
      }

      const recorder = new MediaRecorder(stream, { mimeType: pickMimeType() });
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        void handleRecordingStopped();
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      elapsedRef.current = 0;
      setElapsedSec(0);
      setStatus('recording');

      timerRef.current = setInterval(() => {
        elapsedRef.current += 1;
        setElapsedSec(elapsedRef.current);
        if (elapsedRef.current >= MAX_DURATION_SECONDS) {
          stopRecording();
        }
      }, 1000);
    } catch {
      setError('Could not access your camera. Check your browser permissions and try again.');
    }
  }

  function retake() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setStatus('idle');
    setElapsedSec(0);
  }

  if (status === 'idle' && existingAssetUrl && !previewUrl) {
    return (
      <div className="video-recorder">
        <video className="video-recorder-video" src={existingAssetUrl} controls />
        <button type="button" className="video-recorder-retake" onClick={startRecording}>
          Record a new video
        </button>
        {error && <p className="auth-error">{error}</p>}
      </div>
    );
  }

  if (status === 'preview' && previewUrl) {
    return (
      <div className="video-recorder">
        <video className="video-recorder-video" src={previewUrl} controls />
        <button type="button" className="video-recorder-retake" onClick={retake}>
          Retake
        </button>
      </div>
    );
  }

  return (
    <div className="video-recorder">
      <div className="video-recorder-stage">
        <video ref={videoRef} className="video-recorder-video" playsInline muted />
        <button
          type="button"
          className={`video-recorder-record-btn${status === 'recording' ? ' recording' : ''}`}
          onClick={status === 'recording' ? stopRecording : startRecording}
          aria-label={status === 'recording' ? 'Stop recording' : 'Tap to record a video note'}
        >
          <span className="video-recorder-record-dot" />
        </button>
        <p className="video-recorder-hint">
          {status === 'recording'
            ? `Recording… ${formatTime(elapsedSec)} / ${formatTime(MAX_DURATION_SECONDS)}`
            : 'Tap to record a video note'}
        </p>
        <p className="video-recorder-meta">Max length 5 min · WEBM</p>
      </div>
      {error && <p className="auth-error">{error}</p>}
    </div>
  );
}
