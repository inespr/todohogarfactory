'use client';

import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Panel } from 'primereact/panel';
import { Message } from 'primereact/message';

export default function Home() {
  const menuItems = [
    { label: 'Inicio', icon: 'pi pi-home', url: '/' },
    { label: 'Electrodomésticos', icon: 'pi pi-cog', url: '/electrodomesticos' },
    { label: 'Sofás', icon: 'pi pi-th-large', url: '/sofas' },
    { label: 'Hogar', icon: 'pi pi-home', url: '/hogar' },
    { label: 'Contacto', icon: 'pi pi-envelope', url: '/contacto' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* Bienvenida */}
      <Panel header="Bienvenido a Todo Hogar Factory" className="mb-8">
        <p className="m-0">
          Tu tienda de confianza en electrodomésticos, sofás y artículos para el hogar.
        </p>
      </Panel>

      <Divider />

      {/* Categorías */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          title="Electrodomésticos"
          subTitle="Frigoríficos, lavadoras y más"
          className="shadow-md"
          footer={
            <span>
              <Button
                label="Ver más"
                icon="pi pi-arrow-right"
                className="p-button-sm p-button-outlined"
                onClick={() => (window.location.href = '/electrodomesticos')}
              />
            </span>
          }
        >
          <p className="m-0">
            Frigoríficos, lavadoras, hornos, microondas y más al mejor precio.
          </p>
        </Card>

        <Card
          title="Sofás"
          subTitle="Comodidad y estilo"
          className="shadow-md"
          footer={
            <span>
              <Button
                label="Ver más"
                icon="pi pi-arrow-right"
                className="p-button-sm p-button-outlined"
                onClick={() => (window.location.href = '/sofas')}
              />
            </span>
          }
        >
          <p className="m-0">
            Sofás cama, chaise longue y sillones cómodos y resistentes.
          </p>
        </Card>

        <Card
          title="Hogar"
          subTitle="Organización y decoración"
          className="shadow-md"
          footer={
            <span>
              <Button
                label="Ver más"
                icon="pi pi-arrow-right"
                className="p-button-sm p-button-outlined"
                onClick={() => (window.location.href = '/hogar')}
              />
            </span>
          }
        >
          <p className="m-0">
            Menaje, organización, decoración y todo para tu casa.
          </p>
        </Card>
      </div>

      {/* Contacto */}
      <Divider />
      <div className="text-center mt-10">
        <Message
          severity="info"
          text="¿Quieres más información? ¡Contáctanos!"
          className="mb-4"
        />
        <Button
          label="Contactar"
          icon="pi pi-envelope"
          className="p-button-rounded p-button-help"
          onClick={() => (window.location.href = '/contacto')}
        />
      </div>
    </div>
  );
}
