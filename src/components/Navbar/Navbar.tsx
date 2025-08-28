'use client';

import Image from 'next/image';
import { Menubar } from 'primereact/menubar';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import styles from './Navbar.module.css';
import { Button } from 'primereact/button';
import Link from 'next/link';

export function Navbar() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(''); // valor por defecto: Todo
  const [searchModalVisible, setSearchModalVisible] = useState(false);

  const categories = [
    { label: 'Todo', value: '' },
    { label: 'Electrodomésticos', value: 'electrodomesticos' },
    { label: 'Sofás', value: 'sofas' },
    { label: 'Hogar', value: 'hogar' },
  ];

  const items = [
    { label: 'Electrodomésticos', url: '/electrodomesticos' },
    { label: 'Sofás', url: '/sofas' },
    { label: 'Hogar', url: '/hogar' },
    { label: 'Contacto', url: '/contacto' },
  ];

  const start = (
    <Link href="/" className={styles.logo}>
      <Image src="/todo_hogar_logo.svg" alt="Todo Hogar Factory" width={120} height={32} priority />
    </Link>
  )

  const desktopSearchForm = (
    <form
      action="/buscar"
      method="GET"
      className={styles.searchForm}
      onSubmit={(e) => {
        if (!search && !category) e.preventDefault();
      }}
    >
      <IconField iconPosition="left">
        <InputIcon className="pi pi-search" />
        <InputText
          placeholder="Buscar..."
          name="q"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </IconField>

      <Dropdown
        name="cat"
        value={category}
        options={categories}
        onChange={(e) => setCategory(e.value)}
        aria-label="Selecciona categoría"
        placeholder='Selecciona una categoría'
        className="w-full md:w-14rem"
      />
      <Button label="Buscar" icon="pi pi-check" />

    </form>
  );

  const mobileSearchButton = (
    <button
      className={styles.mobileSearchButton}
      onClick={() => setSearchModalVisible(true)}
      aria-label="Abrir buscador"
    >
      <i className="pi pi-search"></i>
    </button>
  );

  return (
    <header className={styles.header}>
      <Menubar model={items} start={start} end={
        <>
          <div className={styles.desktopOnly}>{desktopSearchForm}</div>
          <div className={styles.mobileOnly}>{mobileSearchButton}</div>
        </>
      } className={styles.menubar} />

      <Dialog
        header="Buscar"
        visible={searchModalVisible}
        onHide={() => setSearchModalVisible(false)}
        modal
        className={styles.searchDialog}
      >
        <form
          action="/buscar"
          method="GET"
          className={styles.searchFormModal}
          onSubmit={(e) => {
            if (!search && !category) e.preventDefault();
          }}
        >
          <IconField iconPosition="left">
            <InputIcon className="pi pi-search" />
            <InputText
              placeholder="Buscar..."
              name="q"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </IconField>

          <Dropdown
            name="cat"
            value={category}
            options={categories}
            onChange={(e) => setCategory(e.value)}
            aria-label="Selecciona categoría"
            placeholder='Selecciona una categoría'
            className="w-full md:w-14rem"
          />

          <Button label="Buscar" icon="pi pi-check" />
        </form>
      </Dialog>
    </header>
  );
}
