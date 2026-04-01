'use client';

import { useEffect, useState } from 'react';

interface ShareProductButtonProps {
    title: string;
    description?: string;
}

export function ShareProductButton({ title, description }: ShareProductButtonProps) {
    const [status, setStatus] = useState<string | null>(null);
    const [href, setHref] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setHref(window.location.href);
        }
    }, []);

    const handleShare = async () => {
        if (!href) return;

        const shareData: ShareData = {
            title,
            text: description,
            url: href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                setStatus('Compartido ✅');
            } catch (error) {
                setStatus('No se pudo compartir.');
            }
            return;
        }

        try {
            await navigator.clipboard.writeText(href);
            setStatus('Enlace copiado 📋');
        } catch {
            setStatus('No se pudo copiar el enlace.');
        }
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                style={{ border: '1px solid #d4d4d4', backgroundColor: '#f5f5f5', color: '#404040' }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                Compartir
            </button>
            {status && (
                <div className="absolute left-0 mt-2 w-max rounded-lg px-3 py-1.5 text-xs font-medium text-white shadow-md" style={{ backgroundColor: '#171717', zIndex: 10 }}>
                    {status}
                </div>
            )}
        </div>
    );
}
