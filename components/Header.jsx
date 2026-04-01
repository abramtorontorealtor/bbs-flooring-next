'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, Phone, ChevronDown, Search, X, Ruler } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import AdvancedSearchBar from './AdvancedSearchBar';
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Analytics } from './analytics';
import { useAuth } from '@/lib/auth-context';
import { entities } from '@/lib/base44-compat';

export default function Header({ cartCount = 0 }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout, navigateToLogin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const productCategories = [
    { name: 'Vinyl', path: '/vinyl' },
    { name: 'Laminate', path: '/laminate' },
    { name: 'Solid Hardwood', path: '/solid-hardwood' },
    { name: 'Engineered Hardwood', path: '/engineered-hardwood' },
    { name: 'All Products', path: '/products' },
    { name: 'Clearance', path: '/clearance' },
  ];

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Products', submenu: productCategories },
    { name: 'Services', submenu: [
      { name: 'Stairs', path: '/stairs' },
      { name: 'Installation', path: '/installation' },
      { name: 'Carpet Removal', path: '/carpet-removal' },
      { name: 'Gallery', path: '/gallery' }
    ]},
    { name: 'Quote Calculator', path: '/quote-calculator' },
    { name: 'Financing', path: '/financing' },
    { name: 'Blog', path: '/blog' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg' : 'bg-slate-800'}`}>
      {/* Top bar */}
      <div className="bg-amber-700 text-white py-2 px-4 relative z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
          <span className="hidden sm:block">We Guarantee Your Satisfaction Throughout Our Start-To-Finish Process</span>
          <div className="flex items-center gap-3 ml-auto">
            <a 
              href="tel:+16474281111" 
              className="flex items-center gap-2 font-semibold hover:text-amber-100 transition-colors py-2 px-3 -mx-3 rounded"
              style={{ 
                WebkitTapHighlightColor: 'rgba(255, 255, 255, 0.3)',
                touchAction: 'manipulation',
                minHeight: '44px',
                minWidth: '44px'
              }}
              onClick={() => Analytics.trackPhoneClick('header')}
            >
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Call/Text: 647-428-1111</span>
              <span className="sm:hidden">647-428-1111</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="flex flex-col">
              <span className={`text-3xl font-black tracking-tight ${isScrolled ? 'text-amber-500' : 'text-amber-500'}`}>BBS</span>
              <span className={`text-xs font-semibold tracking-widest ${isScrolled ? 'text-slate-600' : 'text-white'}`}>FLOORING</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              item.submenu ? (
                <DropdownMenu key={item.name}>
                  <DropdownMenuTrigger asChild>
                    <button className={`text-sm font-medium transition-colors hover:text-amber-500 px-3 py-2 flex items-center gap-1 ${isScrolled ? 'text-slate-700' : 'text-white'}`}>
                      {item.name}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {item.submenu.map((sub) => (
                      <DropdownMenuItem key={sub.name} asChild>
                        <Link href={sub.path} className="cursor-pointer">
                          {sub.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`text-sm font-medium transition-colors hover:text-amber-500 px-3 py-2 ${isScrolled ? 'text-slate-700' : 'text-white'}`}
                >
                  {item.name}
                </Link>
              )
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Free Measurement CTA — Desktop */}
            <Link
              href="/free-measurement"
              className="hidden lg:flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              onClick={() => Analytics.trackEvent('cta_click', 'lead', 'free_measurement_header')}
            >
              <Ruler className="w-4 h-4" />
              Free Measure
            </Link>

            {/* Desktop Search */}
            <div className="hidden md:block w-56 lg:w-72">
              <AdvancedSearchBar />
            </div>

            {/* Mobile Search Toggle */}
            <button
              className={`md:hidden p-2 rounded-lg transition-colors ${isScrolled ? 'text-slate-700 hover:text-amber-500' : 'text-white hover:text-amber-400'}`}
              onClick={() => setMobileSearchOpen(o => !o)}
              aria-label="Search"
            >
              {mobileSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>

            {/* Account */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={`text-sm px-2 ${isScrolled ? 'text-slate-700 hover:text-amber-500' : 'text-white hover:text-amber-500'}`}>
                    <span className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                      {(user.full_name || user.email || '?')[0].toUpperCase()}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="cursor-pointer">My Account</Link>
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/customers" className="cursor-pointer">CRM Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => logout()} className="cursor-pointer text-red-600">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateToLogin()}
                className={`text-sm font-medium ${isScrolled ? 'text-slate-700 hover:text-amber-500' : 'text-white hover:text-amber-500'}`}
              >
                Login
              </Button>
            )}

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" aria-label="Shopping cart" className={`relative ${isScrolled ? 'text-slate-700 hover:text-amber-500' : 'text-white hover:text-amber-500'}`}>
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-amber-700 text-white text-xs">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" aria-label="Open menu" className={isScrolled ? 'text-slate-700' : 'text-white'}>
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col gap-6 mt-8 overflow-y-auto max-h-[calc(100vh-120px)] pb-8">
                  {/* Free Measurement — Mobile Prominent CTA */}
                  <Link
                    href="/free-measurement"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3.5 rounded-xl transition-colors text-base"
                  >
                    <Ruler className="w-5 h-5" />
                    Book Free Measurement
                  </Link>
                  {navItems.map((item) => (
                    item.submenu ? (
                      <div key={item.name} className="py-2 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-700 mb-2">{item.name}</p>
                        <div className="flex flex-col gap-2 ml-4">
                          {item.submenu.map((sub) => (
                            <Link
                              key={sub.name}
                              href={sub.path}
                              onClick={() => setMobileMenuOpen(false)}
                              className="text-sm text-slate-600 hover:text-amber-500 transition-colors"
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
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-lg font-medium text-slate-700 hover:text-amber-500 transition-colors py-2 border-b border-slate-100"
                      >
                        {item.name}
                      </Link>
                    )
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Mobile Search Drawer */}
      {mobileSearchOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-3 shadow-lg">
          <AdvancedSearchBar onClose={() => setMobileSearchOpen(false)} />
        </div>
      )}

      {/* Sticky Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] px-4 py-2.5 flex gap-3">
        <a
          href="tel:+16474281111"
          className="flex-1 flex items-center justify-center gap-2 bg-slate-800 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          onClick={() => Analytics.trackPhoneClick('sticky_mobile')}
        >
          <Phone className="w-4 h-4" />
          Call Now
        </a>
        <Link
          href="/free-measurement"
          className="flex-1 flex items-center justify-center gap-2 bg-amber-500 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          onClick={() => Analytics.trackEvent('cta_click', 'lead', 'free_measurement_sticky_mobile')}
        >
          <Ruler className="w-4 h-4" />
          Free Measure
        </Link>
      </div>
    </header>
  );
}
