'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Heart, Search, ShoppingBag, User, X, Sparkles } from './Icons';
import { useApp } from './AppProviders';
import { useEffect, useRef, useState } from 'react';

const suggestions = [
  ['Dunk Low Panda', '/product/dunk-panda'],
  ['New Balance 9060', '/product/nb9060'],
  ['Rengoku figure', '/product/rengoku'],
  ['Anime collectibles', '/category/anime'],
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { cart, wishlist, role } = useApp();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);

  const nav = [
    { href: '/', label: 'Discover' },
    { href: '/live', label: 'Live' },
    { href: '/category/sneakers', label: 'Categories' },
  ];

  useEffect(() => {
    const onPointer = (event: MouseEvent) => {
      if (shellRef.current && !shellRef.current.contains(event.target as Node)) setFocused(false);
    };
    window.addEventListener('mousedown', onPointer);
    return () => window.removeEventListener('mousedown', onPointer);
  }, []);

  const submit = (value = query) => {
    const v = value.trim();
    router.push('/search' + (v ? '?q=' + encodeURIComponent(v) : ''));
    setFocused(false);
  };

  return (
    <header className={'header ' + (pathname === '/' ? 'header-home' : '')}>
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Biddo home"><span className="brand-mark">B</span><span>BIDDO</span></Link>

        <nav className="desktop-nav" aria-label="Primary">
          {nav.map(n => (
            <Link className={'nav-link ' + (pathname === n.href || (pathname.startsWith('/category') && n.href.includes('category')) ? 'active' : '')} href={n.href} key={n.href}>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="search-shell" ref={shellRef}>
          <Search size={17} className="icon-left" />
          <input aria-label="Search Biddo" value={query} onChange={e => setQuery(e.target.value)} onFocus={() => setFocused(true)} onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') setFocused(false); }} placeholder="Search sneakers, collectibles, streetwear..." />
          {query ? <button className="search-clear" aria-label="Clear search" onClick={() => setQuery('')}><X size={15} /></button> : <kbd className="search-key">⌘ K</kbd>}

          {focused && (
            <div className="search-popover" role="dialog" aria-label="Search suggestions">
              <div className="search-pop-head"><span>Quick find</span><Sparkles size={14} /></div>
              {suggestions.map(([label, href]) => (
                <button className="search-suggestion" key={href} onClick={() => { setQuery(label); router.push(href); setFocused(false); }}>
                  <Search size={14} /><span>{label}</span><span className="search-arrow">↗</span>
                </button>
              ))}
              <button className="search-all" onClick={() => submit()}>View all results</button>
            </div>
          )}
        </div>

        <div className="header-actions">
          <Link href="/sell" className="accent-btn sell-btn">Sell</Link>
          <Link href="/wishlist" className="icon-btn" aria-label="Wishlist"><Heart size={18} />{wishlist.length > 0 && <span className="count-dot">{wishlist.length}</span>}</Link>
          <Link href="/notifications" className="icon-btn" aria-label="Notifications"><Bell size={18} /></Link>
          <Link href="/cart" className="icon-btn" aria-label="Cart"><ShoppingBag size={18} />{cart.length > 0 && <span className="count-dot">{cart.length}</span>}</Link>
          <Link href="/profile" className="icon-btn" aria-label="Profile"><User size={18} /></Link>
          {role === 'seller' ? <span className="role-chip">Seller mode</span> : null}
        </div>
      </div>
    </header>
  );
}
