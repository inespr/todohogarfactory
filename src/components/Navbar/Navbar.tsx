'use client';

import Image from 'next/image';
import { InputText } from 'primereact/inputtext';
import { useEffect, useState } from 'react';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import styles from './Navbar.module.css';
import Link from 'next/link';
import {
  type ProductCategory,
} from '../../lib/products';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const [search, setSearch] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMobileCategory, setOpenMobileCategory] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [subcategoriesMap, setSubcategoriesMap] = useState<Record<string, { slug: string; name: string; grupo?: string }[]>>({});
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  type FbProduct = { id: string; name: string; price: number; offerPrice?: number; fotos: string[]; category: string; };
  const [fbProducts, setFbProducts] = useState<FbProduct[]>([]);
  const [fbLoaded, setFbLoaded] = useState(false);
  const [productResults, setProductResults] = useState<FbProduct[]>([]);
  const [catSuggestions, setCatSuggestions] = useState<{ name: string; slug: string; category: string }[]>([]);

  const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

  const loadFbProducts = async () => {
    if (fbLoaded) return;
    const { getDocs: gd, collection: col } = await import('firebase/firestore');
    const snap = await gd(col(db, 'electrodomesticos'));
    const products: FbProduct[] = snap.docs.map(d => ({
      id: d.id,
      name: d.data().name as string ?? '',
      price: d.data().price as number ?? 0,
      offerPrice: d.data().offerPrice as number | undefined,
      fotos: (d.data().fotos as string[]) || [],
      category: 'electrodomesticos',
    }));
    setFbProducts(products);
    setFbLoaded(true);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'catalogoSubcategorias'), (snap) => {
      const map: Record<string, { slug: string; name: string; grupo?: string }[]> = {
        electrodomesticos: [],
        sofas: [],
        hogar: [],
        descanso: [],
      };
      const seen: Record<string, Set<string>> = {
        electrodomesticos: new Set(),
        sofas: new Set(),
        hogar: new Set(),
        descanso: new Set(),
      };

      snap.docs.forEach((doc) => {
        const data = doc.data() as Record<string, unknown>;
        const rawCategory = ((data.categoria as string) || '').trim().toLowerCase();
        const rawName = ((data.nombre as string) || '').trim();
        const rawGrupo = ((data.grupo as string) || '').trim() || undefined;
        if (!rawCategory || !rawName) return;

        const normalizedCategory = rawCategory
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '');

        const mainCategory =
          normalizedCategory.includes('electro') ? 'electrodomesticos' :
            normalizedCategory.includes('sof') ? 'sofas' :
              normalizedCategory.includes('hogar') ? 'hogar' :
                normalizedCategory.includes('descanso') ? 'descanso' :
                  null;

        if (!mainCategory) return;

        const slug = rawName
          .toLowerCase()
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '')
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');

        if (slug && !seen[mainCategory].has(slug)) {
          seen[mainCategory].add(slug);
          map[mainCategory].push({ slug, name: rawName, grupo: rawGrupo });
        }
      });

      setSubcategoriesMap(map);
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

  const getSubcategories = (category: ProductCategory): { slug: string; name: string; grupo?: string }[] => {
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
      setProductResults([]);
      setCatSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Sugerencias de categorías desde subcategoriesMap
    const seen = new Set<string>();
    const cats: { name: string; slug: string; category: string }[] = [];
    const categoryRoutes: Record<string, string> = {
      electrodomesticos: '/electrodomesticos',
      sofas: '/sofas',
      hogar: '/hogar',
      descanso: '/descanso',
    };
    for (const [cat, subcats] of Object.entries(subcategoriesMap)) {
      for (const s of subcats) {
        if (norm(s.name).includes(norm(query)) && !seen.has(s.name)) {
          seen.add(s.name);
          cats.push({ name: s.name, slug: s.slug, category: categoryRoutes[cat] ?? `/${cat}` });
        }
      }
    }
    setCatSuggestions(cats.slice(0, 5));

    // Productos de Firebase
    const filtered = fbProducts
      .filter(p => norm(p.name).includes(norm(query)))
      .slice(0, 4);
    setProductResults(filtered);

    setShowSuggestions(cats.length > 0 || filtered.length > 0);
  };

  const highlightMatch = (text: string, query: string) => {
    const idx = norm(text).indexOf(norm(query));
    if (idx === -1) return <span>{text}</span>;
    return (
      <span>
        <strong>{text.slice(0, idx + query.length)}</strong>{text.slice(idx + query.length)}
      </span>
    );
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
            loadFbProducts();
            if (catSuggestions.length > 0 || productResults.length > 0) setShowSuggestions(true);
          }}
          onBlur={() => {
            setTimeout(() => setShowSuggestions(false), 150);
          }}
        />
      </IconField>

      {showSuggestions && (catSuggestions.length > 0 || productResults.length > 0) && (
        <div className={styles.searchSuggestions} aria-label="Resultados de búsqueda sugeridos">

          {/* Sugerencias de categoría */}
          {catSuggestions.map((s) => (
            <Link
              key={s.name}
              href={`${s.category}?subcategory=${encodeURIComponent(s.slug)}`}
              className={styles.searchSuggestionItem}
              onClick={() => { setShowSuggestions(false); closeMobileMenu(); }}
            >
              <span className={styles.searchSuggestionName}>{highlightMatch(s.name, search)}</span>
              <svg width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <path d="M7 17 17 7M7 7h10v10"/>
              </svg>
            </Link>
          ))}

          {/* Productos */}
          {productResults.length > 0 && (
            <>
              <div style={{ padding: '0.5rem 0.75rem 0.25rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af', borderTop: catSuggestions.length > 0 ? '1px solid #f3f4f6' : 'none', marginTop: catSuggestions.length > 0 ? '0.25rem' : 0 }}>
                Productos
              </div>
              {productResults.map((p) => {
                const hasOffer = p.offerPrice && p.offerPrice > 0 && p.offerPrice < p.price;
                return (
                  <Link
                    key={p.id}
                    href={`/electrodomesticos/${p.id}`}
                    onClick={() => { setShowSuggestions(false); closeMobileMenu(); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', textDecoration: 'none', color: '#111827' }}
                    className={styles.searchSuggestionItem}
                  >
                    {p.fotos[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.fotos[0]} alt="" style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 6, background: '#f9fafb', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {highlightMatch(p.name, search)}
                      </div>
                      <div style={{ fontSize: '0.85rem', marginTop: 2 }}>
                        {hasOffer ? (
                          <>
                            <span style={{ textDecoration: 'line-through', color: '#9ca3af', marginRight: 4 }}>{p.price.toFixed(2)} €</span>
                            <span style={{ color: '#f37021', fontWeight: 700 }}>{p.offerPrice!.toFixed(2)} €</span>
                          </>
                        ) : (
                          <span style={{ color: '#374151', fontWeight: 600 }}>{p.price.toFixed(2)} €</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </>
          )}
        </div>
      )}
    </form>
  );

  return (
    <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''} fixed top-0 left-0 right-0 z-50`}>
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
                    {(() => {
                      const ungrouped = subcategories.filter((s) => !s.grupo);
                      const grouped = subcategories.reduce<Record<string, typeof subcategories>>((acc, s) => {
                        if (!s.grupo) return acc;
                        if (!acc[s.grupo]) acc[s.grupo] = [];
                        acc[s.grupo].push(s);
                        return acc;
                      }, {});
                      return (
                        <>
                          {ungrouped.map((subcat) => (
                            <Link
                              key={subcat.slug}
                              href={`${item.url}?subcategory=${encodeURIComponent(subcat.slug)}`}
                              className={styles.dropdownItem}
                            >
                              {subcat.name}
                            </Link>
                          ))}
                          {Object.entries(grouped).map(([grupo, items]) => (
                            <div key={grupo}>
                              <div className={styles.dropdownGroupHeader}>{grupo}</div>
                              {items.map((subcat) => (
                                <Link
                                  key={subcat.slug}
                                  href={`${item.url}?subcategory=${encodeURIComponent(subcat.slug)}`}
                                  className={styles.dropdownGroupItem}
                                >
                                  {subcat.name}
                                </Link>
                              ))}
                            </div>
                          ))}
                        </>
                      );
                    })()}
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

      {/* Banner de envío */}
      <div className={styles.shippingBanner}>
        🚚 Envío disponible en toda la provincia de Huelva y alrededores
      </div>

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
                    {(() => {
                      const ungrouped = subcategories.filter((s) => !s.grupo);
                      const grouped = subcategories.reduce<Record<string, typeof subcategories>>((acc, s) => {
                        if (!s.grupo) return acc;
                        if (!acc[s.grupo]) acc[s.grupo] = [];
                        acc[s.grupo].push(s);
                        return acc;
                      }, {});
                      return (
                        <>
                          {ungrouped.map((subcat) => (
                            <Link
                              key={subcat.slug}
                              href={`${item.url}?subcategory=${encodeURIComponent(subcat.slug)}`}
                              className={styles.mobileSublink}
                              onClick={closeMobileMenu}
                            >
                              {subcat.name}
                            </Link>
                          ))}
                          {Object.entries(grouped).map(([grupo, items]) => (
                            <div key={grupo}>
                              <div className={styles.mobileGroupHeader}>{grupo}</div>
                              {items.map((subcat) => (
                                <Link
                                  key={subcat.slug}
                                  href={`${item.url}?subcategory=${encodeURIComponent(subcat.slug)}`}
                                  className={styles.mobileGroupSublink}
                                  onClick={closeMobileMenu}
                                >
                                  {subcat.name}
                                </Link>
                              ))}
                            </div>
                          ))}
                        </>
                      );
                    })()}
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
