'use client';

import { useState } from 'react';
import CookieModal from './CookieModal';

export default function FooterCookieButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-gray-500 hover:text-orange-500 transition-colors duration-200 text-xs flex items-center gap-1.5"
      >
        <span>🍪</span>
        Configurar cookies
      </button>
      {showModal && <CookieModal onClose={() => setShowModal(false)} />}
    </>
  );
}
