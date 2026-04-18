'use client';

import { useEffect, useState } from 'react';
import CookieModal from './CookieModal';
import { saveCookiePreferences, hasConsent } from './cookieUtils';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [bannerExiting, setBannerExiting] = useState(false);

  useEffect(() => {
    if (!hasConsent()) setShowBanner(true);
  }, []);

  const closeBanner = () => {
    setBannerExiting(true);
    setTimeout(() => { setShowBanner(false); setBannerExiting(false); }, 350);
  };

  const acceptAll = () => {
    saveCookiePreferences({ necessary: true, analytics: true, marketing: true });
    closeBanner();
  };

  const rejectAll = () => {
    saveCookiePreferences({ necessary: true, analytics: false, marketing: false });
    closeBanner();
  };

  return (
    <>
      {/* Banner inicial */}
      {showBanner && (
        <div className={`fixed bottom-0 left-0 w-full z-[100] p-4 md:p-6 ${bannerExiting ? 'animate-banner-exit' : 'animate-banner-enter'}`}>
          <div className="max-w-5xl mx-auto bg-white border border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.1)] rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="flex gap-4 flex-1">
              <span className="text-3xl hidden sm:block">🍪</span>
              <div className="text-sm">
                <p className="font-bold text-gray-900 text-base mb-1">Tu privacidad nos importa</p>
                <p className="text-gray-600 leading-normal">
                  Utilizamos cookies para mejorar tu experiencia y analizar el tráfico.{' '}
                  <button onClick={() => setShowModal(true)} className="text-orange-500 font-bold hover:underline">
                    Configurar preferencias
                  </button>
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <button onClick={rejectAll} className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-xl transition-colors text-sm">
                Solo necesarias
              </button>
              <button onClick={acceptAll} className="px-8 py-2.5 bg-[#f37021] text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-md active:scale-95 text-sm">
                Aceptar todas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <CookieModal onClose={() => {
          setShowModal(false);
          setShowBanner(false);
        }} />
      )}
    </>
  );
}
