export default function Condiciones() {
    return (
        <div className="max-w-4xl mx-auto p-8 text-gray-800 leading-relaxed">
            <h1 className="text-3xl font-bold mb-6 text-[#f37021]">Información de Compra y Catálogo</h1>

            <section className="mb-8">
                <h2 className="text-xl font-bold mb-3 border-b pb-2">1. Funcionamiento del Catálogo</h2>
                <p>
                    Bienvenido al catálogo online de <strong>Todo Hogar Factory</strong>. Esta web funciona como una exposición virtual.
                    Los precios y el stock mostrados son orientativos. Para confirmar la disponibilidad y finalizar una compra, el usuario deberá contactar con nosotros a través de los botones de <strong>WhatsApp</strong> o vía telefónica.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-bold mb-3 border-b pb-2">2. Envíos y Entregas</h2>
                <p className="mb-2">Al realizar tu consulta por WhatsApp, te informaremos del coste y plazo de entrega. Normalmente:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Recogida en tienda:</strong> Gratuita en nuestras instalaciones de Valverde del Camino.</li>
                    <li><strong>Entrega Local:</strong> Consultar tarifas de transporte e instalación para Valverde y alrededores.</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-bold mb-3 border-b pb-2">3. Garantía</h2>
                <p>
                    Todos nuestros productos (electrodomésticos, sofás y descanso) son nuevos y cuentan con la <strong>garantía legal de 3 años</strong> establecida en España, gestionada directamente con el fabricante o a través de nuestra tienda.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-bold mb-3 border-b pb-2">4. Devoluciones</h2>
                <p>
                    Al no ser una venta automatizada por la web, las condiciones de devolución se rigen por la venta presencial o bajo pedido telefónico/WhatsApp.
                    Dispones de 14 días para desistir de la compra siempre que el producto no haya sido usado, instalado o desprecintado (especialmente en colchones por motivos de higiene).
                </p>
            </section>

            <div className="bg-orange-50 p-4 border-l-4 border-[#f37021] italic text-sm">
                Para cualquier duda, pulsa el botón de WhatsApp y te atenderemos personalmente en horario comercial.
            </div>
        </div>
    );
}