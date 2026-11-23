import { useEffect, useRef } from 'react';

// Kone me chhota live tile. Stream DeviceGate se aati hai.
export default function CameraPreview({ stream }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div className="fixed bottom-4 right-4 z-40 aspect-video w-36 overflow-hidden rounded-xl border border-line bg-ink shadow-lg sm:w-52">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="h-full w-full -scale-x-100 object-cover"
      />
    </div>
  );
}