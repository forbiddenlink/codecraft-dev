'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface CodePreviewProps {
  html: string;
  css: string;
  javascript: string;
  isVisible?: boolean;
}

export function CodePreview({ html, css, javascript, isVisible = true }: CodePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    try {
      const iframe = iframeRef.current;
      const document = iframe.contentDocument || iframe.contentWindow?.document;

      if (!document) return;

      // Create complete HTML document
      const fullHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            /* Reset styles */
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              padding: 16px;
              background: #f5f5f5;
            }

            /* User CSS */
            ${css}
          </style>
        </head>
        <body>
          ${html}
          <script>
            // Error handling
            window.onerror = function(msg, url, lineNo, columnNo, error) {
              window.parent.postMessage({
                type: 'error',
                message: msg,
                lineNo: lineNo,
                columnNo: columnNo
              }, '*');
              return false;
            };

            // User JavaScript
            try {
              ${javascript}
            } catch (error) {
              window.parent.postMessage({
                type: 'error',
                message: error.message,
                stack: error.stack
              }, '*');
            }
          </script>
        </body>
        </html>
      `;

      document.open();
      document.write(fullHtml);
      document.close();

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  }, [html, css, javascript]);

  // Listen for errors from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'error') {
        setError(`JavaScript Error: ${event.data.message}`);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="h-full flex flex-col bg-white rounded-lg shadow-lg overflow-hidden"
    >
      {/* Preview Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
          <h3 className="font-semibold">Live Preview</h3>
        </div>
        <div className="text-xs opacity-80">Updates in real-time</div>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          className="bg-red-50 border-l-4 border-red-500 p-3"
        >
          <p className="text-red-800 text-sm font-mono">{error}</p>
        </motion.div>
      )}

      {/* Preview Iframe */}
      <div className="flex-1 relative">
        <iframe
          ref={iframeRef}
          title="Code Preview"
          sandbox="allow-scripts allow-same-origin"
          className="w-full h-full border-0"
        />

        {/* Empty State */}
        {!html && !css && !javascript && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-400">
              <svg
                className="w-16 h-16 mx-auto mb-4 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
              <p className="text-sm font-medium">Start coding to see your creation!</p>
            </div>
          </div>
        )}
      </div>

      {/* Preview Controls */}
      <div className="bg-gray-50 px-4 py-2 flex items-center justify-between text-xs text-gray-600 border-t">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            HTML: {html.length} chars
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            CSS: {css.length} chars
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            JS: {javascript.length} chars
          </span>
        </div>
      </div>
    </motion.div>
  );
}
