import { useEffect } from 'react';
import { X } from 'lucide-react';

// Plays /demo.mp4 (served from frontend/public/demo.mp4) in a modal overlay.
// To change the video, just replace that file - no code change needed.
export default function DemoVideoModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-modal overflow-hidden border border-border bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close demo video"
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 border border-border flex items-center justify-center text-white hover:border-accent-500 hover:text-accent-500 transition-colors"
        >
          <X size={18} />
        </button>
        <video
          src="/demo.mp4"
          controls
          autoPlay
          className="w-full aspect-video bg-black"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}
