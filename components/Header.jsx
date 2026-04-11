'use client';

import React, { useState, useEffect, lazy, Suspense } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

// Heavy components lazy-loaded — not in the critical JS path
const MobileMenu = lazy(() => import('./MobileMenu'));
const AdvancedSearchBar = lazy(() => import('./AdvancedSearchBar'));

const NAV_ITEMS = [
  { name: 'Home', path: '/' },
  {
    name: 'Products',
    submenu: [
      { name: 'Vinyl', path: '/vinyl' },
      { name: 'Laminate', path: '/laminate' },
      { name: 'Solid Hardwood', path: '/solid-hardwood' },
      { name: 'Engineered Hardwood', path: '/engineered-hardwood' },
      { name: 'All Products', path: '/products' },
      { name: 'Clearance', path: '/clearance' },
    ],
  },
  {
    name: 'Services',
    submenu: [
      { name: 'Stairs', path: '/stairs' },
      { name: 'Installation', path: '/installation' },
      { name: 'Carpet Removal', path: '/carpet-removal' },
      { name: 'Gallery', path: '/gallery' },
    ],
  },
  { name: 'Quote Calculator', path: '/quote-calculator' },
  { name: 'Financing', path: '/financing' },
  { name: 'Blog', path: '/blog' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

export default function Header({ cartCount = 0 }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMenuLoaded, setMobileMenuLoaded] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoaded, setSearchLoaded] = useState(false);
  const { user, logout, navigateToLogin } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openMobileMenu = () => {
    setMobileMenuLoaded(true);
    setMobileMenuOpen(true);
  };

  const openSearch = () => {
    setSearchLoaded(true);
    setSearchOpen(true);
  };

  const textColor = isScrolled ? 'text-slate-700' : 'text-white';
  const hoverColor = 'hover:text-amber-500';

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg' : 'bg-slate-800'}`}>

      {/* ── Top bar ── */}
      <div className="bg-amber-700 text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
          <span className="hidden sm:block">We Guarantee Your Satisfaction Throughout Our Start-To-Finish Process</span>
          <div className="flex items-center gap-3 ml-auto">
            <a
              href="tel:+16474281111"
              className="flex items-center gap-2 font-semibold hover:text-amber-100 transition-colors py-2 px-3 -mx-3 rounded"
              style={{ WebkitTapHighlightColor: 'rgba(255,255,255,0.3)', touchAction: 'manipulation', minHeight: '44px', minWidth: '44px' }}
            >
              {/* Phone icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.93 3.29 2 2 0 0 1 3.92 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span className="hidden sm:inline">Call/Text: 647-428-1111</span>
              <span className="sm:hidden">647-428-1111</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── Main header ── */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="flex flex-col">
              <span className="text-3xl font-black tracking-tight text-amber-500">BBS</span>
              <span className={`text-xs font-semibold tracking-widest ${isScrolled ? 'text-slate-600' : 'text-white'}`}>FLOORING</span>
            </div>
          </Link>

          {/* ── Desktop Nav — pure CSS dropdowns, zero Radix ── */}
          <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) =>
              item.submenu ? (
                <div key={item.name} className="relative group">
                  <button
                    className={`text-sm font-medium transition-colors ${hoverColor} px-3 py-2 flex items-center gap-1 ${textColor}`}
                    aria-haspopup="true"
                  >
                    {item.name}
                    {/* ChevronDown */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                  {/* Dropdown panel — CSS only, no JS */}
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-150 z-50">
                    {item.submenu.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.path}
                        className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-600 first:rounded-t-lg last:rounded-b-lg transition-colors"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`text-sm font-medium transition-colors ${hoverColor} px-3 py-2 ${textColor}`}
                >
                  {item.name}
                </Link>
              )
            )}
          </nav>

          {/* ── Actions ── */}
          <div className="flex items-center gap-3">

            {/* Free Measure CTA — desktop */}
            <Link
              href="/free-measurement"
              className="hidden lg:flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              {/* Ruler icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/></svg>
              Free Measure
            </Link>

            {/* Desktop search — lazy-loaded, rendered once opened */}
            <div className="hidden md:block w-56 lg:w-72">
              {searchLoaded ? (
                <Suspense fallback={<SearchPlaceholder />}>
                  <AdvancedSearchBar />
                </Suspense>
              ) : (
                <SearchPlaceholder onFocus={openSearch} onClick={openSearch} />
              )}
            </div>

            {/* Mobile search toggle */}
            <button
              className={`md:hidden p-2 rounded-lg transition-colors ${isScrolled ? `${textColor} ${hoverColor}` : 'text-white hover:text-amber-400'}`}
              onClick={searchOpen ? () => setSearchOpen(false) : openSearch}
              aria-label={searchOpen ? 'Close search' : 'Open search'}
            >
              {searchOpen
                ? /* X */ <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                : /* Search */ <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              }
            </button>

            {/* Account — pure CSS dropdown for user menu */}
            {user ? (
              <div className="relative group">
                <button
                  className={`flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-white font-bold text-xs`}
                  aria-haspopup="true"
                  aria-label="Account menu"
                >
                  {(user.full_name || user.email || '?')[0].toUpperCase()}
                </button>
                <div className="absolute top-full right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-150 z-50">
                  <Link href="/account" className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-600 rounded-t-lg transition-colors">My Account</Link>
                  {user.role === 'admin' && (
                    <>
                      <Link href="/admin" className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-600 transition-colors">Admin Dashboard</Link>
                      <Link href="/admin/crm" className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-600 transition-colors">CRM</Link>
                    </>
                  )}
                  <button
                    onClick={() => logout()}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-b-lg transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigateToLogin()}
                className={`text-sm font-medium transition-colors ${hoverColor} ${textColor} px-2 py-1`}
              >
                Login
              </button>
            )}

            {/* Cart */}
            <Link href="/cart" aria-label="Shopping cart" className={`relative p-2 transition-colors ${hoverColor} ${textColor}`}>
              {/* ShoppingCart */}
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-amber-700 text-white text-xs font-bold rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile menu button — lazy-loads Sheet on first tap */}
            <button
              className={`lg:hidden p-2 rounded-lg transition-colors ${isScrolled ? `${textColor} ${hoverColor}` : 'text-white hover:text-amber-400'}`}
              onClick={openMobileMenu}
              aria-label="Open menu"
            >
              {/* Menu (hamburger) */}
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile search drawer — lazy-loaded ── */}
      {searchLoaded && searchOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-3 shadow-lg">
          <Suspense fallback={<SearchPlaceholder />}>
            <AdvancedSearchBar onClose={() => setSearchOpen(false)} />
          </Suspense>
        </div>
      )}

      {/* ── Mobile slide-out menu — lazy-loaded ── */}
      {mobileMenuLoaded && (
        <Suspense fallback={null}>
          <MobileMenu
            open={mobileMenuOpen}
            onOpenChange={setMobileMenuOpen}
            navItems={NAV_ITEMS}
          />
        </Suspense>
      )}
    </header>
  );
}

/** Lightweight placeholder rendered until AdvancedSearchBar chunk loads */
function SearchPlaceholder({ onFocus, onClick }) {
  return (
    <div
      role="search"
      className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-3 py-2 cursor-text"
      onClick={onClick}
      onFocus={onFocus}
      tabIndex={0}
      aria-label="Search products"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <span className="text-sm text-slate-400">Search products…</span>
    </div>
  );
}
