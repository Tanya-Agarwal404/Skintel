import { useEffect, useRef, useState } from 'react';
import { Camera, ImagePlus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type CapturedImage = { mediaType: 'image/jpeg'; data: string; previewUrl: string };

const MAX_SIDE = 1024;

function downscale(source: CanvasImageSource, width: number, height: number): CapturedImage {
  const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  canvas.getContext('2d')?.drawImage(source, 0, 0, canvas.width, canvas.height);
  const previewUrl = canvas.toDataURL('image/jpeg', 0.85);
  return { mediaType: 'image/jpeg', data: previewUrl.split(',')[1] ?? '', previewUrl };
}

type Props = {
  facing: 'user' | 'environment';
  captureLabel: string;
  image: CapturedImage | null;
  onChange: (image: CapturedImage | null) => void;
};

/** Live camera preview with a capture button, plus an upload fallback. Nothing leaves the browser until the user analyses. */
export function ImageInput({ facing, captureLabel, image, onChange }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [error, setError] = useState('');

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOn(false);
  };
  useEffect(() => stopCamera, []);

  // Attach the stream once the <video> element has actually mounted.
  useEffect(() => {
    const video = videoRef.current;
    if (!cameraOn || !video || !streamRef.current) return;
    video.srcObject = streamRef.current;
    video.play().catch(() => setError('The camera started but the preview could not play. Tap Retake to try again.'));
  }, [cameraOn]);

  const startCamera = async () => {
    setError('');
    onChange(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing }, audio: false });
      streamRef.current = stream;
      setCameraOn(true);
    } catch {
      setError('Camera access was blocked or is unavailable. You can upload a photo instead.');
    }
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    onChange(downscale(video, video.videoWidth, video.videoHeight));
    stopCamera();
  };

  const upload = (file: File | undefined) => {
    if (!file) return;
    setError('');
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      onChange(downscale(img, img.naturalWidth, img.naturalHeight));
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      setError('That file could not be read as an image.');
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return <div className="image-input">
    <div className="image-stage">
      {cameraOn && <video ref={videoRef} className={facing === 'user' ? 'mirror' : ''} muted playsInline aria-label="Live camera preview" />}
      {!cameraOn && image && <img src={image.previewUrl} alt="Your captured photo" />}
      {!cameraOn && !image && <p>Start the camera or upload a photo</p>}
    </div>
    <div className="image-actions">
      {cameraOn
        ? <Button variant="hero" onClick={capture}><Camera /> {captureLabel}</Button>
        : <Button variant="hero" onClick={startCamera}>{image ? <RefreshCw /> : <Camera />} {image ? 'Retake' : 'Start camera'}</Button>}
      <Button variant="outline" asChild><label><ImagePlus /> Upload<input type="file" accept="image/*" hidden onChange={(event) => { upload(event.target.files?.[0]); event.target.value = ''; }} /></label></Button>
    </div>
    {error && <p className="form-error" role="alert">{error}</p>}
  </div>;
}
