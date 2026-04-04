'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createPageUrl } from '@/lib/routes';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getStaticBreadcrumbs } from '@/lib/breadcrumbs';
import { MapPin, Phone, Calendar, Star, Users, Home, Shield, Truck, Heart, CheckCircle } from 'lucide-react';

export default function AboutClient() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Breadcrumbs items={getStaticBreadcrumbs('/about')} />
      <div className="text-center mb-16 animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">About BBS Flooring</h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          Family-owned and operated since 2010, we're Markham's trusted flooring destination. We believe every home deserves beautiful, durable floors — without the retail markup.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {[
          { icon: Calendar, label: 'In Business', value: 'Since 2010' },
          { icon: Home, label: 'Projects Completed', value: '5,000+' },
          { icon: Star, label: 'Google Rating', value: '4.7★ (41 Reviews)' },
          { icon: Users, label: 'Team Members', value: '15+' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-white rounded-2xl p-6 border border-slate-200 text-center">
            <Icon className="w-8 h-8 text-amber-500 mx-auto mb-3" />
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-slate-500 text-sm">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Our Story</h2>
          <p className="text-slate-600 mb-4 leading-relaxed">
            BBS Flooring started with a simple idea: give homeowners access to the same wholesale-quality flooring that contractors get — at fair, transparent prices. No showroom markups. No pushy sales tactics. Just honest advice and expert installation.
          </p>
          <p className="text-slate-600 mb-4 leading-relaxed">
            Located on Highway 7 in Markham, our 4,000+ sq ft showroom carries over 600 products — from solid and engineered hardwood to luxury vinyl plank, laminate, and everything in between.
          </p>
          <p className="text-slate-600 leading-relaxed">
            Whether you're renovating a single room or an entire home, our team will guide you from product selection through installation. We treat every home like our own.
          </p>
        </div>
        <div className="bg-slate-100 rounded-2xl p-8 text-center">
          <Image
            src="https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/bbs-logo-official-v2.png"
            alt="BBS Flooring Logo"
            width={192}
            height={192}
            className="mx-auto mb-6"
          />
          <p className="text-slate-500 text-sm">Serving Markham, Toronto & Durham since 2010</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-12 text-white mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Why Choose BBS?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: Shield, title: 'Wholesale Pricing', desc: 'Skip the retail markup. Get contractor-grade products at fair prices.' },
            { icon: Truck, title: 'Full-Service', desc: 'From free measurements to expert installation and disposal, we handle everything.' },
            { icon: Heart, title: 'Family Values', desc: 'We treat every customer like family. Your satisfaction is our reputation.' },
            { icon: CheckCircle, title: 'Quality Guaranteed', desc: 'Every installation backed by our workmanship guarantee.' },
            { icon: MapPin, title: 'Local Experts', desc: 'We know Markham, Toronto, and Durham homes. Local problems, local solutions.' },
            { icon: Star, title: '4.7★ Google Rating', desc: '41 verified reviews from homeowners just like you.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-slate-300 text-sm">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 rounded-2xl p-8 text-center border border-amber-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-3">Visit Our Showroom</h2>
        <p className="text-slate-600 mb-2">B-6061 Highway 7 E, Markham, ON L3P 3B2</p>
        <p className="text-slate-600 mb-4">Mon-Sat: 10am-5pm · Sun: By Appointment</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={createPageUrl('Contact')}>
            <button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              Contact Us
            </button>
          </Link>
          <a href="tel:6474281111">
            <button className="bg-white hover:bg-slate-50 text-slate-800 font-semibold px-6 py-3 rounded-xl border border-slate-200 transition-colors">
              <Phone className="inline w-4 h-4 mr-2" />Call (647) 428-1111
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}
