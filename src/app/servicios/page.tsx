export default function Servicios() {
    const servicios = [
        {
            title: "Transporte a Domicilio",
            description: "Llevamos tus electrodomésticos y sofás directamente hasta tu salón o cocina. Servicio rápido y cuidadoso en Valverde del Camino y toda la provincia de Huelva.",
            icon: "pi-truck",
        },
        {
            title: "Instalación y Puesta en Marcha",
            description: "No te compliques con herramientas. Conectamos tu nueva lavadora, lavavajillas o frigorífico y comprobamos que todo funciona correctamente antes de irnos.",
            icon: "pi-wrench",
        },
        {
            title: "Retirada del Antiguo (Plan Renove)",
            description: "Nos llevamos tu viejo aparato o sofá al punto limpio sin que tengas que hacer ningún esfuerzo. Reciclaje responsable incluido con tu compra.",
            icon: "pi-trash",
        },
        {
            title: "Garantía de Calidad",
            description: "Todos nuestros productos son nuevos y cuentan con 3 años de garantía oficial. Además, te asesoramos personalmente por WhatsApp o en tienda.",
            icon: "pi-verified",
        },
    ];

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8">
            {/* Encabezado con PrimeFlex */}
            <header className="text-center mb-8">
                <h1 className="text-4xl font-bold text-900 mb-3">Nuestros Servicios</h1>
                <p className="text-xl text-600 max-w-3xl mx-auto">
                    En <span className="text-orange-600 font-bold">Todo Hogar Factory</span> no solo vendemos productos, nos encargamos de que disfrutes de tu compra sin preocupaciones.
                </p>
            </header>

            {/* Grid de servicios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-8" style={{ gridAutoRows: '1fr' }}>
                {servicios.map((servicio, index) => (
                    <div key={index} className="flex items-start p-5 bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="mr-4 shrink-0">
                            <i className={`pi ${servicio.icon} text-orange-500`} style={{ fontSize: '2.5rem' }}></i>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-2 text-neutral-800">{servicio.title}</h3>
                            <p className="text-neutral-500 text-sm leading-relaxed">{servicio.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Banner de Llamada a la acción */}
            <div className="rounded-2xl p-6 md:p-8 text-center" style={{ backgroundColor: '#f97316' }}>
                <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#ffffff' }}>¿Tienes dudas sobre la instalación o el envío?</h2>
                <p className="mb-6 text-sm" style={{ color: 'rgba(255,255,255,0.9)' }}>Pregúntanos por WhatsApp y te damos presupuesto sin compromiso para tu zona.</p>

                <a
                    href="https://wa.me/34692211145"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-bold py-3 px-6 rounded-full no-underline transition-colors hover:opacity-90"
                    style={{ backgroundColor: '#ffffff', color: '#ea580c' }}
                >
                    <i className="pi pi-whatsapp text-xl"></i>
                    Consultar por WhatsApp
                </a>
            </div>
        </div>
    );
}