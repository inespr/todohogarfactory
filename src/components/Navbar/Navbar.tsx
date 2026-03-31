'use client';

import Image from 'next/image';
import { InputText } from 'primereact/inputtext';
import { useEffect, useState } from 'react';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import styles from './Navbar.module.css';
import Link from 'next/link';
import {
  SUBCATEGORY_NAMES,
  type Product,
  type ProductCategory,
  searchProducts,
} from '../../lib/products';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const [search, setSearch] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMobileCategory, setOpenMobileCategory] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [subcategoriesMap, setSubcategoriesMap] = useState<Record<string, string[]>>({});
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'catalogoSubcategorias'), (snap) => {
      const map: Record<string, Set<string>> = {
        electrodomesticos: new Set(),
        sofas: new Set(),
        hogar: new Set(),
        descanso: new Set(),
      };

      snap.docs.forEach((doc) => {
        const data = doc.data() as Record<string, unknown>;
        const rawCategory = ((data.categoria as string) || '').trim().toLowerCase();
        const rawName = ((data.nombre as string) || '').trim();
        if (!rawCategory || !rawName) return;

        const normalizedCategory = rawCategory
          .replace('á', 'a')
          .replace('é', 'e')
          .replace('í', 'i')
          .replace('ó', 'o')
          .replace('ú', 'u')
          .replace(/ñ/g, 'n');

        const mainCategory =
          normalizedCategory.includes('electro') ? 'electrodomesticos' :
            normalizedCategory.includes('sof') ? 'sofas' :
              normalizedCategory.includes('hogar') ? 'hogar' :
                normalizedCategory.includes('descanso') ? 'descanso' :
                  null;

        if (!mainCategory) return;

        const subcategorySlug = rawName
          .toLowerCase()
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '')
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');

        if (subcategorySlug) map[mainCategory].add(subcategorySlug);
      });

      setSubcategoriesMap({
        electrodomesticos: Array.from(map.electrodomesticos),
        sofas: Array.from(map.sofas),
        hogar: Array.from(map.hogar),
        descanso: Array.from(map.descanso),
      });
    });

    return () => unsubscribe();
  }, []);

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
    {
      label: 'Descanso',
      url: '/descanso',
      category: 'descanso' as ProductCategory,
    },
  ];

  const categoryUrl = (url: string, subcategory = 'Todos') => {
    if (!subcategory || subcategory === 'Todos') return `${url}`;
    return `${url}?subcategory=${encodeURIComponent(subcategory)}`;
  };


  const handleMouseEnter = (category: string) => {
    setOpenDropdown(category);
  };

  const handleMouseLeave = () => {
    setOpenDropdown(null);
  };

  const getSubcategories = (category: ProductCategory) => {
    return subcategoriesMap[category] || [];
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setOpenMobileCategory(null);
  };

  // Cierra el menú móvil al navegar a otra ruta
  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenMobileCategory(null);
  }, [pathname]);

  // Bloquea el scroll del body cuando el drawer está abierto
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const prev = document.body.style.overflow;
    if (mobileMenuOpen) document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileMenuOpen]);

  const updateSuggestions = (value: string) => {
    const query = value.trim();
    if (!query) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const results = searchProducts({ query });
    setSuggestions(results.slice(0, 6));
    setShowSuggestions(results.length > 0);
  };

  const handleSuggestionClick = (name: string) => {
    setSearch(name);
    setShowSuggestions(false);
    closeMobileMenu();
  };

  const searchForm = (
    <form
      action="/buscar"
      method="GET"
      className={styles.searchForm}
      onSubmit={(e) => {
        if (!search) e.preventDefault();
        closeMobileMenu();
      }}
    >
      <IconField iconPosition="left">
        <InputIcon className="pi pi-search" />
        <InputText
          placeholder="Buscar..."
          name="q"
          value={search}
          onChange={(e) => {
            const value = e.target.value;
            setSearch(value);
            updateSuggestions(value);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          onBlur={() => {
            // pequeño retardo para permitir hacer click en una sugerencia
            setTimeout(() => setShowSuggestions(false), 120);
          }}
        />
      </IconField>

      {showSuggestions && suggestions.length > 0 && (
        <div className={styles.searchSuggestions} aria-label="Resultados de búsqueda sugeridos">
          {suggestions.map((p) => (
            <Link
              key={p.id}
              href={`/buscar?q=${encodeURIComponent(p.name)}`}
              className={styles.searchSuggestionItem}
              onClick={() => handleSuggestionClick(p.name)}
            >
              <span className={styles.searchSuggestionName}>{p.name}</span>
              <span className={styles.searchSuggestionCategory}>{p.category}</span>
            </Link>
          ))}
        </div>
      )}
    </form>
  );

  return (
    <header className={`${styles.header} fixed top-0 left-0 right-0 z-50`}>
      <nav className={styles.navbar}>
        <button
          type="button"
          className={styles.mobileToggle}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileMenuOpen((v) => !v)}
        >
          <i className={`pi ${mobileMenuOpen ? 'pi-times' : 'pi-bars'}`} aria-hidden="true" />
          <span className={styles.srOnly}>{mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}</span>
        </button>

        <div className={styles.menuDesktop} onMouseLeave={handleMouseLeave}>
          {categories.map((item) => {
            const subcategories = getSubcategories(item.category);
            return (
              <div
                key={item.url}
                className={styles.dropdown}
                onMouseEnter={() => handleMouseEnter(item.category)}
              >
                <Link href={categoryUrl(item.url, 'Todos')} className={`${styles.menuItem} ${pathname === item.url ? styles.active : ''}`}>
                  {item.label}
                </Link>
                {subcategories.length > 0 && (
                  <i className="pi pi-chevron-down" style={{ fontSize: '0.7rem', marginLeft: '0.3rem' }} />
                )}
                {openDropdown === item.category && subcategories.length > 0 && (
                  <div className={styles.dropdownContent} onMouseEnter={() => handleMouseEnter(item.category)}>
                    {subcategories.map((subcat) => (
                      <Link
                        key={subcat}
                        href={`${item.url}?subcategory=${encodeURIComponent(subcat.toLowerCase())}`}
                        className={styles.dropdownItem}
                      >
                        {SUBCATEGORY_NAMES[subcat.toLowerCase()] || subcat}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <Link href="/ofertas" className={`${styles.menuItemOferta} ${pathname === '/ofertas' ? styles.active : ''}`}>
            Ofertas
          </Link>
          <Link href="/contacto" className={`${styles.menuItem} ${pathname === '/contacto' ? styles.active : ''}`}>
            Contacto
          </Link>
        </div>

        <Link href="/" className={styles.logo}>
          <span className={styles.logoBadge}>
            <Image
              src="/todo_hogar_logo.svg"
              alt="Todo Hogar Factory"
              width={160}
              height={73}
              className={styles.logoImage}
              priority
            />
          </span>
        </Link>

        <div className={styles.searchContainerDesktop}>{searchForm}</div>
      </nav>

      <div className={styles.searchContainerMobile}>{searchForm}</div>

      {mobileMenuOpen && (
        <button
          type="button"
          className={styles.mobileOverlay}
          aria-label="Cerrar menú"
          onClick={closeMobileMenu}
        />
      )}

      <div
        id="mobile-menu"
        className={`${styles.mobilePanel} ${mobileMenuOpen ? styles.mobilePanelOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menú"
      >
        <div className={styles.mobilePanelHeader}>
          <Link href="/" className={styles.drawerLogo} onClick={closeMobileMenu} aria-label="Ir a inicio">
            <Image
              src="/todo_hogar_color.svg"
              alt="Todo Hogar Factory"
              width={160}
              height={44}
              className={styles.drawerLogoImage}
              priority
            />
          </Link>
          <button
            type="button"
            className={styles.mobileClose}
            aria-label="Cerrar menú"
            onClick={closeMobileMenu}
          >
            <i className="pi pi-times" aria-hidden="true" />
          </button>
        </div>

        <div className={styles.mobileMenu}>
          {categories.map((item) => {
            const subcategories = getSubcategories(item.category);
            const isOpen = openMobileCategory === item.category;
            return (
              <div key={item.url} className={styles.mobileCategory}>
                <div className={styles.mobileCategoryRow}>
                  <Link
                    href={categoryUrl(item.url, 'Todos')}
                    className={styles.mobileLink}
                    onClick={closeMobileMenu}
                    aria-current={pathname === item.url ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                  {subcategories.length > 0 && (
                    <button
                      type="button"
                      className={styles.mobileChevron}
                      aria-expanded={isOpen}
                      onClick={() => setOpenMobileCategory((v) => (v === item.category ? null : item.category))}
                    >
                      <i className={`pi ${isOpen ? 'pi-chevron-up' : 'pi-chevron-down'}`} aria-hidden="true" />
                      <span className={styles.srOnly}>{isOpen ? 'Cerrar subcategorías' : 'Abrir subcategorías'}</span>
                    </button>
                  )}
                </div>

                {isOpen && subcategories.length > 0 && (
                  <div className={styles.mobileSubmenu}>
                    {subcategories.map((subcat) => (
                      <Link
                        key={subcat}
                        href={`${item.url}?subcategory=${encodeURIComponent(subcat.toLowerCase())}`}
                        className={styles.mobileSublink}
                        onClick={closeMobileMenu}
                      >
                        {SUBCATEGORY_NAMES[subcat.toLowerCase()] || subcat}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <Link href="/ofertas" className={styles.mobileLinkOferta} onClick={closeMobileMenu}>
            Ofertas
          </Link>

          <Link href="/contacto" className={styles.mobileLink} onClick={closeMobileMenu}>
            Contacto
          </Link>
        </div>
      </div>
    </header>
  );
}
