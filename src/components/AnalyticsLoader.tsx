'use client';

import { useEffect } from 'react';
import { getCookiePreferences } from '@/components/cookies/cookieUtils';

declare global {
    interface Window {
        dataLayer: unknown[];
        gtag: (...args: unknown[]) => void;
    }
}

// Añadimos la prop gaId
export default function AnalyticsLoader({ gaId }: { gaId: string }) {
    useEffect(() => {
        const prefs = getCookiePreferences();

        if (prefs?.analytics && gaId) {
            const script = document.createElement('script');
            script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
            script.async = true;
            document.head.appendChild(script);

            window.dataLayer = window.dataLayer || [];

            window.gtag = function (...args: unknown[]) {
                window.dataLayer.push(args);
            };

            window.gtag('js', new Date());
            window.gtag('config', gaId);
        }
    }, [gaId]); // Se vuelve a ejecutar si el ID cambia

    return null;
}