import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useReaderSettings } from '../../context/ReaderSettingsContext';
import { X, ZoomIn } from 'lucide-react';

interface MarkdownViewerProps {
  content: string;
  bookId: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content, bookId }) => {
  const { settings } = useReaderSettings();
  const [zoomImage, setZoomImage] = useState<{ src: string; alt: string } | null>(null);

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
        return 'max-w-2xl';
      case 'wide':
        return 'max-w-4xl';
      default:
        return 'max-w-3xl';
    }
  };

  return (
    <div className={`mx-auto ${getMaxWidthClass()} px-4 sm:px-6 py-8 transition-all duration-200`}>
      <article
        className={`${getFontFamilyClass()} prose-reader transition-all`}
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
            h1: ({ node, ...props }) => (
              <h1
                className="mt-6 mb-6 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white border-b pb-4 border-slate-200 dark:border-slate-800 font-sans"
                {...props}
              />
            ),
            // Custom H2 heading
            h2: ({ node, ...props }) => (
              <h2
                className="mt-10 mb-4 text-xl sm:text-2xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400 font-sans"
                {...props}
              />
            ),
            // Custom H3 heading
            h3: ({ node, ...props }) => (
              <h3
                className="mt-8 mb-3 text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-200 font-sans"
                {...props}
              />
            ),
            // Custom Paragraph
            p: ({ node, children, ...props }) => {
              const hasImage = node?.children?.some((child: any) => child.tagName === 'img');
              if (hasImage) {
                return <div className="my-6">{children}</div>;
              }
              return <p className="my-4 text-slate-800 dark:text-slate-200 leading-relaxed" {...props}>{children}</p>;
            },
            // Custom Blockquote
            blockquote: ({ node, ...props }) => (
              <blockquote
                className="my-6 border-l-4 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 py-3 px-5 rounded-r-2xl italic text-slate-700 dark:text-slate-300 shadow-xs"
                {...props}
              />
            ),
            // Custom Lists
            ul: ({ node, ...props }) => (
              <ul className="my-4 ml-6 list-disc space-y-2 text-slate-800 dark:text-slate-200" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="my-4 ml-6 list-decimal space-y-2 text-slate-800 dark:text-slate-200" {...props} />
            ),
            li: ({ node, ...props }) => <li className="pl-1" {...props} />,
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
