import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useReaderSettings } from '../../context/ReaderSettingsContext';
import { X, ZoomIn, Volume2 } from 'lucide-react';

interface MarkdownViewerProps {
  content: string;
  bookId: string;
  currentTTSIndex?: number;
  isTTSSpeaking?: boolean;
  onReadFromIndex?: (index: number) => void;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({
  content,
  bookId,
  currentTTSIndex = -1,
  isTTSSpeaking = false,
  onReadFromIndex,
}) => {
  const { settings } = useReaderSettings();
  const [zoomImage, setZoomImage] = useState<{ src: string; alt: string } | null>(null);

  // Counter to sequentially index readable blocks during markdown rendering
  let blockCounter = 0;

  // Determine font family style
  const getFontFamilyClass = () => {
    switch (settings.fontFamily) {
      case 'serif':
        return 'font-serif';
      case 'mono':
        return 'font-mono';
      default:
        return 'font-sans';
    }
  };

  // Determine container width
  const getMaxWidthClass = () => {
    switch (settings.maxWidth) {
      case 'narrow':
        return 'max-w-3xl';
      case 'wide':
        return 'max-w-6xl';
      case 'full':
        return 'max-w-7xl';
      case 'medium':
      default:
        return 'max-w-5xl';
    }
  };

  return (
    <div className={`relative mx-auto ${getMaxWidthClass()} px-4 sm:px-8 py-8 transition-all duration-200`}>
      {/* Repeating Watermark "Healthier" */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-0 z-0 overflow-hidden opacity-[0.045] dark:opacity-[0.06] sepia:opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='220' viewBox='0 0 320 220'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' font-family='sans-serif' font-weight='800' font-size='28' letter-spacing='3' fill='%2310b981' transform='rotate(-28 160 110)'%3EHealthier%3C/text%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />
      <article
        className={`relative z-10 ${getFontFamilyClass()} prose-reader transition-all`}
        style={{
          fontSize: `${settings.fontSize}px`,
          lineHeight: settings.lineHeight,
          textAlign: settings.textAlign,
        }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Custom H1 heading
            h1: ({ node, ...props }) => {
              const idx = blockCounter++;
              const isActive = isTTSSpeaking && currentTTSIndex === idx;
              return (
                <div className="group relative">
                  <h1
                    data-tts-block={idx}
                    className={`mt-6 mb-6 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white border-b pb-4 border-slate-200 dark:border-slate-800 font-sans transition-all duration-300 ${
                      isActive
                        ? 'bg-emerald-500/10 dark:bg-emerald-500/20 ring-2 ring-emerald-500/50 rounded-xl p-3 -mx-3'
                        : ''
                    }`}
                    {...props}
                  />
                  {onReadFromIndex && (
                    <button
                      onClick={() => onReadFromIndex(idx)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-emerald-400 px-2 py-1 text-[11px] font-medium transition-opacity shadow-xs"
                      title="Đọc từ tiêu đề này"
                    >
                      <Volume2 className="h-3 w-3" />
                      <span>Đọc</span>
                    </button>
                  )}
                </div>
              );
            },
            // Custom H2 heading
            h2: ({ node, ...props }) => {
              const idx = blockCounter++;
              const isActive = isTTSSpeaking && currentTTSIndex === idx;
              return (
                <div className="group relative">
                  <h2
                    data-tts-block={idx}
                    className={`mt-10 mb-4 text-xl sm:text-2xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400 font-sans transition-all duration-300 ${
                      isActive
                        ? 'bg-emerald-500/10 dark:bg-emerald-500/20 ring-2 ring-emerald-500/50 rounded-xl p-3 -mx-3'
                        : ''
                    }`}
                    {...props}
                  />
                  {onReadFromIndex && (
                    <button
                      onClick={() => onReadFromIndex(idx)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-emerald-400 px-2 py-1 text-[11px] font-medium transition-opacity shadow-xs"
                      title="Đọc từ mục này"
                    >
                      <Volume2 className="h-3 w-3" />
                      <span>Đọc</span>
                    </button>
                  )}
                </div>
              );
            },
            // Custom H3 heading
            h3: ({ node, ...props }) => {
              const idx = blockCounter++;
              const isActive = isTTSSpeaking && currentTTSIndex === idx;
              return (
                <div className="group relative">
                  <h3
                    data-tts-block={idx}
                    className={`mt-8 mb-3 text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-200 font-sans transition-all duration-300 ${
                      isActive
                        ? 'bg-emerald-500/10 dark:bg-emerald-500/20 ring-2 ring-emerald-500/50 rounded-xl p-2.5 -mx-2.5'
                        : ''
                    }`}
                    {...props}
                  />
                  {onReadFromIndex && (
                    <button
                      onClick={() => onReadFromIndex(idx)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-emerald-400 px-2 py-1 text-[11px] font-medium transition-opacity shadow-xs"
                      title="Đọc từ mục này"
                    >
                      <Volume2 className="h-3 w-3" />
                      <span>Đọc</span>
                    </button>
                  )}
                </div>
              );
            },
            // Custom Paragraph
            p: ({ node, children, ...props }) => {
              const hasImage = node?.children?.some((child: any) => child.tagName === 'img');
              if (hasImage) {
                return <div className="my-6">{children}</div>;
              }
              const idx = blockCounter++;
              const isActive = isTTSSpeaking && currentTTSIndex === idx;
              return (
                <div className="group relative">
                  <p
                    data-tts-block={idx}
                    className={`my-4 text-slate-800 dark:text-slate-200 leading-relaxed transition-all duration-300 ${
                      isActive
                        ? 'bg-emerald-50/90 dark:bg-emerald-950/40 ring-2 ring-emerald-500/60 rounded-xl p-3.5 -mx-3.5 border-l-4 border-emerald-500 shadow-sm'
                        : ''
                    }`}
                    {...props}
                  >
                    {children}
                  </p>
                  {onReadFromIndex && (
                    <button
                      onClick={() => onReadFromIndex(idx)}
                      className="absolute -right-2 sm:-right-8 top-2 opacity-0 group-hover:opacity-100 flex items-center justify-center h-7 w-7 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-emerald-400 shadow-xs transition-opacity"
                      title="Đọc từ đoạn này"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            },
            // Custom Blockquote
            blockquote: ({ node, ...props }) => {
              const idx = blockCounter++;
              const isActive = isTTSSpeaking && currentTTSIndex === idx;
              return (
                <blockquote
                  data-tts-block={idx}
                  className={`my-6 border-l-4 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 py-3 px-5 rounded-r-2xl italic text-slate-700 dark:text-slate-300 shadow-xs transition-all duration-300 ${
                    isActive ? 'ring-2 ring-emerald-500 bg-emerald-100/60 dark:bg-emerald-900/40' : ''
                  }`}
                  {...props}
                />
              );
            },
            // Custom Lists
            ul: ({ node, ...props }) => (
              <ul className="my-4 ml-6 list-disc space-y-2 text-slate-800 dark:text-slate-200" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="my-4 ml-6 list-decimal space-y-2 text-slate-800 dark:text-slate-200" {...props} />
            ),
            li: ({ node, ...props }) => {
              const idx = blockCounter++;
              const isActive = isTTSSpeaking && currentTTSIndex === idx;
              return (
                <li
                  data-tts-block={idx}
                  className={`pl-1 transition-all duration-300 ${
                    isActive ? 'bg-emerald-50 dark:bg-emerald-950/40 ring-1 ring-emerald-500 rounded px-2' : ''
                  }`}
                  {...props}
                />
              );
            },
            // Custom Image Renderer with Lightbox Zoom
            img: ({ node, src, alt, ...props }) => {
              // Transform relative image path: e.g. "images/img-003.png" -> "/books/SearchInsideYourSelf/images/img-003.png"
              let resolvedSrc = src || '';
              if (resolvedSrc.startsWith('images/') || resolvedSrc.startsWith('./images/')) {
                const imgPath = resolvedSrc.replace(/^\.\//, '');
                resolvedSrc = `/books/${bookId}/${imgPath}`;
              }

              return (
                <figure className="my-8 flex flex-col items-center">
                  <div
                    onClick={() => setZoomImage({ src: resolvedSrc, alt: alt || 'Minh họa' })}
                    className="group relative cursor-zoom-in overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 shadow-md border border-slate-200/80 dark:border-slate-800 transition-transform hover:scale-[1.01]"
                  >
                    <img
                      src={resolvedSrc}
                      alt={alt || ''}
                      className="max-h-[500px] w-auto object-contain"
                      loading="lazy"
                      {...props}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="flex items-center gap-1.5 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                        <ZoomIn className="h-3.5 w-3.5" />
                        Phóng to
                      </span>
                    </div>
                  </div>
                  {alt && (
                    <figcaption className="mt-2 text-center text-xs italic text-slate-500 dark:text-slate-400">
                      {alt}
                    </figcaption>
                  )}
                </figure>
              );
            },
            // Custom Code blocks & inline code
            code: ({ node, className, children, ...props }) => {
              const isInline = !className;
              if (isInline) {
                return (
                  <code
                    className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-emerald-700 dark:bg-slate-800 dark:text-emerald-300"
                    {...props}
                  >
                    {children}
                  </code>
                );
              }
              return (
                <pre className="my-6 overflow-x-auto rounded-2xl bg-slate-900 p-4 text-xs font-mono text-emerald-400 border border-slate-800">
                  <code {...props}>{children}</code>
                </pre>
              );
            },
            // Custom Tables
            table: ({ node, ...props }) => (
              <div className="my-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300" {...props} />
              </div>
            ),
            th: ({ node, ...props }) => (
              <th className="bg-slate-100 dark:bg-slate-800 px-4 py-3 font-semibold text-slate-900 dark:text-white" {...props} />
            ),
            td: ({ node, ...props }) => (
              <td className="border-t border-slate-200 dark:border-slate-800 px-4 py-3" {...props} />
            ),
            // Custom Links
            a: ({ node, href, ...props }) => (
              <a
                href={href}
                className="text-emerald-600 dark:text-emerald-400 font-medium underline underline-offset-4 hover:text-emerald-500"
                target={href?.startsWith('http') ? '_blank' : undefined}
                rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                {...props}
              />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </article>

      {/* Image Lightbox Modal */}
      {zoomImage && (
        <div
          onClick={() => setZoomImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-150"
        >
          <button
            onClick={() => setZoomImage(null)}
            className="absolute top-4 right-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/30 backdrop-blur-md"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl">
            <img
              src={zoomImage.src}
              alt={zoomImage.alt}
              className="max-h-[85vh] w-auto object-contain mx-auto rounded-xl shadow-2xl"
            />
            {zoomImage.alt && (
              <p className="mt-3 text-center text-sm font-medium text-white/90">
                {zoomImage.alt}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
