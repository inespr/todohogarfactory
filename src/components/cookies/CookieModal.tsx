'use client';

import { useState } from 'react';
import { saveCookiePreferences } from './cookieUtils';
import { InputSwitch } from 'primereact/inputswitch';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';

export default function CookieModal({ onClose }: { onClose: () => void }) {
    const [analytics, setAnalytics] = useState(true);
    const [marketing, setMarketing] = useState(false);

    const save = () => {
        saveCookiePreferences({ necessary: true, analytics, marketing });
        onClose();
    };

    // Estilo personalizado para el Switch Naranja
    // Esto sobreescribe el color azul por defecto de PrimeReact
    const orangeSwitchStyle = {
        '--p-inputswitch-checked-background': '#f37021',
        '--p-inputswitch-hover-checked-background': '#d95d10',
    } as React.CSSProperties;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            {/* Estilos locales rápidos para asegurar el color naranja */}
            <style jsx global>{`
                .p-inputswitch.p-inputswitch-checked .p-inputswitch-slider {
                    background: #f37021 !important;
                }
                .p-inputswitch:not(.p-disabled):hover .p-inputswitch-slider {
                    border-color: #f37021 !important;
                }
            `}</style>

            <div className="bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl flex flex-col max-h-[90vh]">

                {/* Cabecera */}
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
                    <h2 className="text-xl font-bold text-gray-900 m-0">Privacidad</h2>
                    <Button
                        icon="pi pi-times"
                        rounded
                        text
                        severity="secondary"
                        onClick={onClose}
                        className="p-button-sm shadow-none"
                    />
                </div>

                {/* Cuerpo */}
                <div className="p-6 overflow-y-auto space-y-5">
                    <p className="text-sm text-gray-600 leading-relaxed m-0">
                        Gestiona tus preferencias. Las cookies técnicas son indispensables.
                    </p>

                    {/* Necesarias */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 border-round-xl border-1 border-gray-100">
                        <div className="flex flex-column gap-1">
                            <span className="font-bold text-gray-800 text-sm">Cookies Técnicas</span>
                            <small className="text-gray-500 italic">Siempre activas</small>
                        </div>
                        <InputSwitch checked={true} disabled />
                    </div>

                    <Divider className="my-1" />

                    {/* Analíticas */}
                    <div
                        className="flex items-center justify-between p-4 hover:bg-gray-50 border-round-xl transition-colors cursor-pointer border-1 border-transparent"
                        onClick={() => setAnalytics(!analytics)}
                    >
                        <div className="flex flex-column gap-1">
                            <span className="font-bold text-gray-800 text-sm">Analíticas</span>
                            <small className="text-gray-500">Miden el rendimiento</small>
                        </div>
                        <InputSwitch
                            checked={analytics}
                            onChange={(e) => setAnalytics(e.value ?? false)}
                        />
                    </div>

                    {/* Marketing */}
                    <div
                        className="flex items-center justify-between p-4 hover:bg-gray-50 border-round-xl transition-colors cursor-pointer border-1 border-transparent"
                        onClick={() => setMarketing(!marketing)}
                    >
                        <div className="flex flex-column gap-1">
                            <span className="font-bold text-gray-800 text-sm">Marketing</span>
                            <small className="text-gray-500">Publicidad a tu medida</small>
                        </div>
                        <InputSwitch
                            checked={marketing}
                            onChange={(e) => setMarketing(e.value ?? false)}
                        />
                    </div>
                </div>

                {/* Pie de página */}
                <div className="p-6 border-t border-gray-100 shrink-0">
                    <Button
                        label="Guardar preferencias"
                        icon="pi pi-check"
                        className="w-full p-button-lg border-round-2xl transition-all active:scale-95"
                        style={{ backgroundColor: '#f37021', borderColor: '#f37021' }}
                        onClick={save}
                    />
                </div>
            </div>
        </div>
    );
}