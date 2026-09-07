import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Share, X } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

export function PWAInstallButton() {
  const { isInstallable, isInstalled, isIOS, install } = usePWA();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) return null;

  return (
    <>
      <AnimatePresence>
        {(isInstallable || isIOS) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 md:bottom-10 md:right-10"
          >
            {isInstallable ? (
              <button
                onClick={install}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 transition-all font-semibold text-sm group"
              >
                <Download size={18} className="group-hover:bounce" />
                <span>Install App</span>
              </button>
            ) : isIOS ? (
              <button
                onClick={() => setShowIOSGuide(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 text-white rounded-full shadow-2xl hover:bg-neutral-800 transition-all font-semibold text-sm"
              >
                <Share size={18} />
                <span>Install on iOS</span>
              </button>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showIOSGuide && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-2 hover:bg-neutral-100 rounded-full text-neutral-400 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <img 
                    src="https://vibtools.github.io/vibtools-brand-assets/logos/icon-512.png" 
                    alt="Logo" 
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">Install Vib Cleaner</h3>
                <p className="text-sm text-neutral-500 mt-1">Add to your home screen for the best experience</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 bg-neutral-50 p-3 rounded-2xl">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">1</div>
                  <p className="text-[13px] text-neutral-600">
                    Tap the <span className="font-bold text-neutral-900">Share</span> button in Safari.
                  </p>
                </div>
                <div className="flex items-start gap-3 bg-neutral-50 p-3 rounded-2xl">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">2</div>
                  <p className="text-[13px] text-neutral-600">
                    Scroll down and tap <span className="font-bold text-neutral-900">Add to Home Screen</span>.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full py-3 bg-neutral-900 text-white rounded-2xl font-bold text-sm hover:bg-neutral-800 transition-colors"
              >
                Got it
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
