'use client';

import Image from 'next/image';
import { InputText } from 'primereact/inputtext';
import { useState } from 'react';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import styles from './Navbar.module.css';
import Link from 'next/link';
import { getSubcategoriesByCategory, SUBCATEGORY_NAMES, ProductCategory } from '../../lib/products';

export function Navbar() {
  const [search, setSearch] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const categories = [
    { 
      label: 'Electrodomésticos', 
      url: '/electrodomesticos',
      category: 'electrodomesticos' as ProductCategory
    },
    { 
      label: 'Sofás', 
      url: '/sofas',
      category: 'sofas' as ProductCategory
    },
    { 
      label: 'Hogar', 
      url: '/hogar',
      category: 'hogar' as ProductCategory
    },
  ];

  const handleMouseEnter = (category: string) => {
    setOpenDropdown(category);
  };

  const handleMouseLeave = () => {
    setOpenDropdown(null);
  };

  const getSubcategories = (category: ProductCategory) => {
    return getSubcategoriesByCategory(category);
  };

  const searchForm = (
    <form
      action="/buscar"
      method="GET"
      className={styles.searchForm}
      onSubmit={(e) => {
        if (!search) e.preventDefault();
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
    </form>
  );

  return (
    <header className={styles.header}>
      <nav className={styles.navbar}>
        <div className={styles.menu}>
          {categories.map((item) => {
            const subcategories = getSubcategories(item.category);
            return (
              <div
                key={item.url}
                className={styles.dropdown}
                onMouseEnter={() => handleMouseEnter(item.category)}
                onMouseLeave={handleMouseLeave}
              >
                <Link href={item.url} className={styles.menuItem}>
                  {item.label}
                  <i className="pi pi-chevron-down" style={{ fontSize: '0.7rem', marginLeft: '0.3rem' }}></i>
                </Link>
                {openDropdown === item.category && subcategories.length > 0 && (
                  <div 
                    className={styles.dropdownContent}
                    onMouseEnter={() => handleMouseEnter(item.category)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {subcategories.map((subcat) => (
                      <Link
                        key={subcat}
                        href={`${item.url}?subcategory=${subcat}`}
                        className={styles.dropdownItem}
                      >
                        {SUBCATEGORY_NAMES[subcat] || subcat}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <Link href="/contacto" className={styles.menuItem}>
            Contacto
          </Link>
        </div>

        <Link href="/" className={styles.logo}>
          <span className={styles.logoBadge}>
            <Image
              src="/todo_hogar_logo.svg"
              alt="Todo Hogar Factory"
              width={210}
              height={58}
              priority
            />
          </span>
        </Link>

        <div className={styles.searchContainer}>{searchForm}</div>
      </nav>
    </header>
  );
}
