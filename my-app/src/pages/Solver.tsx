import { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { solveUploadedImage } from '../services/solver';
import SolutionCard from '../components/SolutionCard';
import BrandLogo from '../components/BrandLogo';
import AuthPromptModal from '../components/AuthPromptModal';
import { useAuth } from '../context/useAuth';
import { useGuestQuery } from '../hooks/useGuestQuery';
import './Solver.css';

type Stage = 'camera' | 'preview' | 'cropping' | 'processing' | 'solution';

/* ── Crop helper ────────────────────────────────────────────── */
function getCroppedBlob(image: HTMLImageElement, crop: PixelCrop): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return reject(new Error('No canvas context'));
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = Math.round(crop.width * scaleX);
    canvas.height = Math.round(crop.height * scaleY);
    ctx.drawImage(
      image,
      Math.round(crop.x * scaleX),
      Math.round(crop.y * scaleY),
      canvas.width,
      canvas.height,
      0, 0,
      canvas.width,
      canvas.height,
    );
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
      'image/jpeg',
      0.92,
    );
  });
}

function revokeIfBlob(url: string | null) {
  if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
}

export default function Solver() {
  const { token } = useAuth();
  const { canQuery, consumeQuery, remaining: guestRemaining } = useGuestQuery('solve');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [stage, setStage] = useState<Stage>('camera');
  const [cameraReady, setCameraReady] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [solution, setSolution] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | undefined>();
  const [error, setError] = useState('');

  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const cropImgRef = useRef<HTMLImageElement | null>(null);

  const videoRefCallback = (el: HTMLVideoElement | null) => {
    videoRef.current = el;
    if (el && streamRef.current) {
      el.srcObject = streamRef.current;
      el.play().catch(() => {});
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setCameraReady(true);
    } catch {
      setError('Could not access camera. Please allow camera permissions or upload an image.');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraReady(false);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setCameraReady(true);
      } catch {
        if (!cancelled) setError('Could not access camera. Please allow camera permissions or upload an image.');
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  const setPreview = useCallback(
    (url: string | null) => {
      revokeIfBlob(previewSrc);
      setPreviewSrc(url);
    },
    [previewSrc],
  );

  // ── Guest quota gate ────────────────────────────────────────
  function checkGuestQuota(): boolean {
    if (token) return true;
    if (canQuery) return true;
    setShowAuthModal(true);
    return false;
  }

  const handleCapture = () => {
    if (!checkGuestQuota()) return;
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setPreview(URL.createObjectURL(blob));
        setStage('preview');
      },
      'image/jpeg',
      0.9,
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Only images are supported here. To grade a document, use the Grader.');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    setStage('preview');
  };

  const enterCropMode = () => {
    setCrop({ unit: '%', x: 10, y: 10, width: 80, height: 80 });
    setCompletedCrop(undefined);
    setStage('cropping');
  };

  const applyCropAndSolve = async () => {
    if (!cropImgRef.current) return;
    if (!checkGuestQuota()) return;

    let pixelCrop = completedCrop;
    if ((!pixelCrop?.width || !pixelCrop?.height) && crop && cropImgRef.current) {
      const img = cropImgRef.current;
      pixelCrop = {
        unit: 'px',
        x: crop.unit === '%' ? (crop.x / 100) * img.width : crop.x,
        y: crop.unit === '%' ? (crop.y / 100) * img.height : crop.y,
        width: crop.unit === '%' ? (crop.width / 100) * img.width : crop.width,
        height: crop.unit === '%' ? (crop.height / 100) * img.height : crop.height,
      };
    }
    if (!pixelCrop?.width || !pixelCrop?.height) return;
    setStage('processing');
    setError('');
    try {
      const blob = await getCroppedBlob(cropImgRef.current, pixelCrop);
      setPreview(URL.createObjectURL(blob));
      const file = new File([blob], 'problem.jpg', { type: 'image/jpeg' });
      const res = await solveUploadedImage(file);
      if (!token) consumeQuery();
      setSolution(res.solution);
      setRemaining(res.remaining_queries);
      setStage('solution');
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail || 'Crop or solve failed. Please try again.';
      setError(detail);
      setStage('preview');
    }
  };

  const solveFromPreview = async () => {
    if (!previewSrc) return;
    if (!checkGuestQuota()) return;
    setStage('processing');
    setError('');
    try {
      const resp = await fetch(previewSrc);
      const blob = await resp.blob();
      const file = new File([blob], 'problem.jpg', { type: 'image/jpeg' });
      const res = await solveUploadedImage(file);
      if (!token) consumeQuery();
      setSolution(res.solution);
      setRemaining(res.remaining_queries);
      setStage('solution');
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail || 'Failed to solve. Please try again.';
      setError(detail);
      setStage('preview');
    }
  };

  const resetToCamera = () => {
    stopCamera();
    setSolution(null);
    setPreview(null);
    setError('');
    setStage('camera');
    setTimeout(() => startCamera(), 100);
  };

  const retake = () => {
    setPreview(null);
    setStage('camera');
  };

  return (
    <div className="solver-page">
      {/* Top bar */}
      <div className="solver-topbar">
        <Link to="/" className="solver-brand">
          <span className="brand-dot" />
          <BrandLogo />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {!token && (
            <span className="solver-guest-badge">
              {guestRemaining} free {guestRemaining === 1 ? 'solve' : 'solves'} left
            </span>
          )}
          <Link to="/dashboard" className="solver-back">← Dashboard</Link>
        </div>
      </div>

      {error && <div className="solver-error">{error}</div>}

      {/* ── Camera viewfinder ─────────────────────────────── */}
      {stage === 'camera' && (
        <div className="camera-container">
          <video
            ref={videoRefCallback}
            autoPlay
            playsInline
            muted
            style={cameraReady ? undefined : { position: 'absolute', opacity: 0, pointerEvents: 'none' }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          {cameraReady ? (
            <div className="camera-guide" />
          ) : (
            <div className="camera-placeholder">
              <span className="placeholder-icon">📷</span>
              <p>Camera loading…<br />Or upload an image below</p>
            </div>
          )}
        </div>
      )}

      {/* ── Preview ──────────────────────────────────────── */}
      {stage === 'preview' && previewSrc && (
        <div className="preview-stage">
          <div className="preview-image-wrap">
            <img src={previewSrc} alt="Captured problem" />
          </div>
          <div className="preview-actions">
            <button className="preview-btn preview-btn-ghost" onClick={retake}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
              Retake
            </button>
            <button className="preview-btn preview-btn-ghost" onClick={enterCropMode}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6.13 1L6 16a2 2 0 0 0 2 2h15"/><path d="M1 6.13L16 6a2 2 0 0 1 2 2v15"/></svg>
              Crop
            </button>
            <button className="preview-btn preview-btn-primary" onClick={solveFromPreview}>
              Solve
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Crop mode ────────────────────────────────────── */}
      {stage === 'cropping' && previewSrc && (
        <div className="crop-stage">
          <div className="crop-area">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
            >
              <img ref={cropImgRef} src={previewSrc} alt="Crop" className="crop-source-img" />
            </ReactCrop>
          </div>
          <div className="crop-controls">
            <button className="preview-btn preview-btn-ghost" onClick={() => setStage('preview')}>Cancel</button>
            <button
              className="preview-btn preview-btn-primary"
              onClick={applyCropAndSolve}
              disabled={!crop?.width || !crop?.height}
            >
              Done
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Processing overlay ───────────────────────────── */}
      {stage === 'processing' && (
        <div className="processing-overlay">
          <div className="processing-spinner" />
          <span className="processing-text">Cooking...</span>
          <span className="processing-subtext">Preparing your step-by-step solution</span>
        </div>
      )}

      {/* ── Solution overlay ─────────────────────────────── */}
      {stage === 'solution' && solution && (
        <div className="solution-overlay">
          <SolutionCard
            solution={solution}
            remaining={remaining}
            onClose={resetToCamera}
            mode="solving"
          />
        </div>
      )}

      {/* ── Camera controls ──────────────────────────────── */}
      {stage === 'camera' && (
        <div className="solver-controls">
          <button
            className="capture-btn"
            onClick={handleCapture}
            disabled={!cameraReady}
            aria-label="Capture photo"
          />
          <label className="upload-label">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="12" y2="12"/><line x1="15" y1="15" x2="12" y2="12"/></svg>
            {' '}Upload
            <input type="file" accept="image/*" onChange={handleFileUpload} />
          </label>
        </div>
      )}

      {/* ── Auth modal ───────────────────────────────────── */}
      {showAuthModal && (
        <AuthPromptModal feature="solve" onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}
