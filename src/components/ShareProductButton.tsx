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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 bg-white text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 transition"
            >
                <span className="pi pi-share-alt" aria-hidden="true" />
                Compartir
            </button>
            {status ? (
                <div className="absolute right-0 mt-2 w-max rounded-md bg-black/80 px-3 py-1 text-xs text-white">
                    {status}
                </div>
            ) : null}
        </div>
    );
}
