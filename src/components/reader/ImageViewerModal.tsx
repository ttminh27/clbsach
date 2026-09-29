import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  ExternalLink,
  Loader2,
} from 'lucide-react';

interface ImageViewerModalProps {
  isOpen: boolean;
  src: string;
  alt?: string;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  isOpen,
  src,
  alt = '',
  onClose,
}) => {
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rotation, setRotation] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // References for drag and pinch tracking
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const posStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const scaleRef = useRef<number>(1);
  scaleRef.current = scale;
  const positionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  positionRef.current = position;

  const hasMovedRef = useRef<boolean>(false);
  const initialPinchDistRef = useRef<number | null>(null);
  const initialScaleRef = useRef<number>(1);
  const lastTapRef = useRef<number>(0);

  // Reset all transformation states when src or isOpen changes
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setRotation(0);
      setIsLoaded(false);
      setIsDragging(false);
      isDraggingRef.current = false;

      // Disable body scrolling while image viewer is active
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, src]);

  // Clamp position within sensible bounds based on scale
  const clampPosition = useCallback((x: number, y: number, currentScale: number) => {
    if (currentScale <= 1) return { x: 0, y: 0 };
    const maxBoundX = (window.innerWidth * (currentScale - 0.7)) / 2;
    const maxBoundY = (window.innerHeight * (currentScale - 0.7)) / 2;
    return {
      x: Math.max(-maxBoundX, Math.min(maxBoundX, x)),
      y: Math.max(-maxBoundY, Math.min(maxBoundY, y)),
    };
  }, []);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(Number((prev + 0.35).toFixed(2)), 6));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => {
      const next = Math.max(Number((prev - 0.35).toFixed(2)), 1);
      if (next === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return next;
    });
  }, []);

  const handleResetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  }, []);

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const handleToggleZoom = useCallback(() => {
    if (scaleRef.current > 1.2) {
      handleResetZoom();
    } else {
      setScale(2.5);
    }
  }, [handleResetZoom]);

  // Keyboard navigation & shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
        case '_':
          e.preventDefault();
          handleZoomOut();
          break;
        case '0':
        case 'r':
        case 'R':
          e.preventDefault();
          handleResetZoom();
          break;
        case 'ArrowLeft':
          if (scaleRef.current > 1) {
            e.preventDefault();
            setPosition((pos) => clampPosition(pos.x + 40, pos.y, scaleRef.current));
          }
          break;
        case 'ArrowRight':
          if (scaleRef.current > 1) {
            e.preventDefault();
            setPosition((pos) => clampPosition(pos.x - 40, pos.y, scaleRef.current));
          }
          break;
        case 'ArrowUp':
          if (scaleRef.current > 1) {
            e.preventDefault();
            setPosition((pos) => clampPosition(pos.x, pos.y + 40, scaleRef.current));
          }
          break;
        case 'ArrowDown':
          if (scaleRef.current > 1) {
            e.preventDefault();
            setPosition((pos) => clampPosition(pos.x, pos.y - 40, scaleRef.current));
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleZoomIn, handleZoomOut, handleResetZoom, clampPosition]);

  // Mouse wheel zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!isOpen || !container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.18 : 0.85;

      setScale((prevScale) => {
        const newScale = Math.min(Math.max(Number((prevScale * zoomFactor).toFixed(2)), 1), 6);
        if (newScale === 1) {
          setPosition({ x: 0, y: 0 });
        } else {
          setPosition((pos) => clampPosition(pos.x, pos.y, newScale));
        }
        return newScale;
      });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [isOpen, clampPosition]);

  // Global mouse move & up listeners to ensure drag doesn't drop when cursor exits container
  useEffect(() => {
    if (!isOpen) return;

    const onGlobalMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMovedRef.current = true;
      }

      if (scaleRef.current > 1) {
        const rawX = posStartRef.current.x + dx;
        const rawY = posStartRef.current.y + dy;
        setPosition(clampPosition(rawX, rawY, scaleRef.current));
      }
    };

    const onGlobalMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsDragging(false);
      }
    };

    window.addEventListener('mousemove', onGlobalMouseMove);
    window.addEventListener('mouseup', onGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', onGlobalMouseMove);
      window.removeEventListener('mouseup', onGlobalMouseUp);
    };
  }, [isOpen, clampPosition]);

  // Mouse drag handlers on stage
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow left click drag
    if (e.button !== 0) return;
    // Don't drag if clicking buttons, links or header/footer controls
    if ((e.target as HTMLElement).closest('button, a, header, footer')) return;

    isDraggingRef.current = true;
    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    posStartRef.current = { ...positionRef.current };
  };

  // Touch handlers (1-finger pan, 2-finger pinch, double tap)
  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button, a, header, footer')) return;

    if (e.touches.length === 1) {
      // Check for double tap
      const now = Date.now();
      const timeDiff = now - lastTapRef.current;
      if (timeDiff < 300 && timeDiff > 0) {
        handleToggleZoom();
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;

      isDraggingRef.current = true;
      setIsDragging(true);
      hasMovedRef.current = false;
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      posStartRef.current = { ...positionRef.current };
    } else if (e.touches.length === 2) {
      // 2-finger pinch initiation
      isDraggingRef.current = false;
      setIsDragging(false);
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      initialPinchDistRef.current = dist;
      initialScaleRef.current = scaleRef.current;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDraggingRef.current && scaleRef.current > 1) {
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMovedRef.current = true;
      }

      const rawX = posStartRef.current.x + dx;
      const rawY = posStartRef.current.y + dy;
      setPosition(clampPosition(rawX, rawY, scaleRef.current));
    } else if (e.touches.length === 2 && initialPinchDistRef.current !== null) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const ratio = currentDist / initialPinchDistRef.current;
      const newScale = Math.min(
        Math.max(Number((initialScaleRef.current * ratio).toFixed(2)), 1),
        6
      );

      setScale(newScale);
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
      } else {
        setPosition((pos) => clampPosition(pos.x, pos.y, newScale));
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      isDraggingRef.current = false;
      setIsDragging(false);
      initialPinchDistRef.current = null;
    } else if (e.touches.length === 1) {
      initialPinchDistRef.current = null;
      isDraggingRef.current = true;
      setIsDragging(true);
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      posStartRef.current = { ...positionRef.current };
    }
  };

  // Close when clicking backdrop (only if scale is 1 and didn't drag)
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current && !hasMovedRef.current && scale <= 1.05) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const zoomPercent = Math.round(scale * 100);

  return (
    <div
      ref={containerRef}
      onClick={handleBackdropClick}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/92 backdrop-blur-md select-none touch-none animate-in fade-in duration-200"
      style={{
        cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
      }}
    >
      {/* Top Floating Control Bar */}
      <header className="absolute top-4 inset-x-4 z-20 flex items-center justify-between gap-3 pointer-events-none">
        {/* Left: Alt or Title badge */}
        <div className="pointer-events-auto max-w-[50%] sm:max-w-md truncate rounded-full bg-slate-900/80 px-3.5 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-md border border-white/10 shadow-lg">
          {alt || 'Hình minh họa'}
        </div>

        {/* Right: Actions (Zoom in, Zoom out, Rotate, Reset, Download/New tab, Close) */}
        <div className="pointer-events-auto flex items-center gap-1 sm:gap-1.5 rounded-full bg-slate-900/85 p-1 sm:p-1.5 text-white backdrop-blur-md border border-white/10 shadow-xl">
          {/* Zoom Level Indicator */}
          <button
            onClick={handleToggleZoom}
            className="px-2.5 py-1 text-xs font-bold font-mono text-emerald-400 hover:text-emerald-300 rounded-full hover:bg-white/10 transition-colors"
            title="Tỷ lệ phóng to (Bấm để chuyển đổi 100% / 250%)"
          >
            {zoomPercent}%
          </button>

          <div className="h-4 w-px bg-white/20" />

          {/* Zoom Out */}
          <button
            onClick={handleZoomOut}
            disabled={scale <= 1}
            className={`p-2 rounded-full hover:bg-white/10 transition-colors ${
              scale <= 1 ? 'opacity-40 cursor-not-allowed text-slate-400' : 'text-white'
            }`}
            title="Thu nhỏ (-)"
            aria-label="Thu nhỏ"
          >
            <ZoomOut className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
          </button>

          {/* Zoom In */}
          <button
            onClick={handleZoomIn}
            disabled={scale >= 6}
            className={`p-2 rounded-full hover:bg-white/10 transition-colors ${
              scale >= 6 ? 'opacity-40 cursor-not-allowed text-slate-400' : 'text-white'
            }`}
            title="Phóng to (+)"
            aria-label="Phóng to"
          >
            <ZoomIn className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
          </button>

          {/* Rotate */}
          <button
            onClick={handleRotate}
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
            title="Xoay 90°"
            aria-label="Xoay ảnh"
          >
            <RotateCw className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
          </button>

          {/* Reset Zoom / Center */}
          <button
            onClick={handleResetZoom}
            disabled={scale === 1 && rotation === 0 && position.x === 0 && position.y === 0}
            className={`p-2 rounded-full hover:bg-white/10 transition-colors ${
              scale === 1 && rotation === 0 && position.x === 0 && position.y === 0
                ? 'opacity-40 cursor-not-allowed text-slate-400'
                : 'text-white'
            }`}
            title="Đặt lại kích thước ban đầu (0 hoặc R)"
            aria-label="Đặt lại kích thước"
          >
            <RotateCcw className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
          </button>

          {/* Open full image in new tab */}
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
            title="Mở ảnh gốc trong tab mới"
            aria-label="Mở ảnh gốc"
          >
            <ExternalLink className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
          </a>

          <div className="h-4 w-px bg-white/20" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-rose-600/80 text-white transition-colors"
            title="Đóng (Esc)"
            aria-label="Đóng xem ảnh"
          >
            <X className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
          </button>
        </div>
      </header>

      {/* Main Image Stage */}
      <div className="relative flex items-center justify-center w-full h-full p-4 overflow-hidden pointer-events-none">
        {/* Loading Spinner */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          </div>
        )}

        <img
          src={src}
          alt={alt}
          draggable={false}
          onLoad={() => setIsLoaded(true)}
          onDoubleClick={handleToggleZoom}
          className={`max-h-[82vh] max-w-[90vw] w-auto h-auto object-contain pointer-events-auto rounded-lg shadow-2xl transition-transform ${
            isDragging ? 'duration-0' : 'duration-200 ease-out'
          } ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale}) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
          }}
        />
      </div>

      {/* Bottom Information / Hints Bar */}
      <footer className="absolute bottom-4 inset-x-4 z-20 flex flex-col items-center gap-1.5 pointer-events-none">
        {alt && (
          <p className="max-w-xl text-center text-xs sm:text-sm font-medium text-white/90 bg-slate-900/75 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10 shadow-lg">
            {alt}
          </p>
        )}
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 bg-slate-950/60 px-3 py-1 rounded-full backdrop-blur-xs">
          <span>Lăn chuột để phóng to/thu nhỏ</span>
          <span>•</span>
          <span>Kéo để di chuyển</span>
          <span>•</span>
          <span>Nhấn đúp để phóng to</span>
          <span>•</span>
          <span>Phím Esc để đóng</span>
        </div>
        <div className="flex sm:hidden items-center gap-1 text-[11px] text-slate-400 bg-slate-950/60 px-3 py-1 rounded-full backdrop-blur-xs">
          <span>Chạm 2 lần hoặc chụm 2 ngón tay để phóng to • Kéo để di chuyển</span>
        </div>
      </footer>
    </div>
  );
};
