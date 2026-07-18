'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlaySquare, FileText, BookOpen, ArrowRight, TrendingUp, Sparkles } from 'lucide-react';
import ResourceCard from '@/components/resource-card';
import { supabase } from '@/lib/supabase';
import type { Resource } from '@/lib/types';

const featureCards = [
  {
    icon: PlaySquare,
    title: 'Video Courses',
    desc: '1,200+ hours of expert-led academic content.',
    href: '/videos',
    iconBg: '#3b82f6',
    cardClass: 'feature-card-blue',
  },
  {
    icon: FileText,
    title: 'Question Papers',
    desc: 'Verified PYQs from top universities worldwide.',
    href: '/qp',
    iconBg: '#10b981',
    cardClass: 'feature-card-teal',
  },
  {
    icon: BookOpen,
    title: 'Book Store',
    desc: 'Curated textbooks and research journals.',
    href: '/books',
    iconBg: '#8b5cf6',
    cardClass: 'feature-card-violet',
  },
];

export default function HomePage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResources() {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);

      if (!error && data) setResources(data);
      setLoading(false);
    }
    fetchResources();
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden" style={{ minHeight: '260px' }}>
        <img
          src="https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Quantum Computing"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative z-10 p-8 flex flex-col justify-center" style={{ minHeight: '260px' }}>
          {/* Trending Badge */}
          <div className="flex items-center gap-2 mb-4">
            <div
              className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest"
              style={{ backgroundColor: '#10b981', color: '#ffffff' }}
            >
              <TrendingUp className="w-3 h-3" />
              TRENDING NOW
            </div>
          </div>

          <h1 className="text-white font-bold text-3xl leading-tight mb-3 max-w-lg">
            Master Quantum Computing with Dr. Aris
          </h1>
          <p className="text-sm mb-6 max-w-md leading-relaxed" style={{ color: 'rgba(255,255,255,0.78)' }}>
            Unlock exclusive video lectures, solved question papers, and comprehensive textbooks for advanced theoretical physics.
          </p>

          <div className="flex items-center gap-3">
            <Link
              href="/videos"
              className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-95 inline-flex items-center gap-2"
              style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
            >
              <Sparkles className="w-4 h-4" />
              Enroll Now
            </Link>
            <button
              className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-all hover:bg-white/20 inline-flex items-center gap-2"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.25)' }}
            >
              View Demo
            </button>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-3 gap-5">
        {featureCards.map(({ icon: Icon, title, desc, href, iconBg, cardClass }) => (
          <Link
            key={href}
            href={href}
            className={`${cardClass} rounded-2xl p-6 group transition-all hover:shadow-md`}
            style={{ border: '1px solid rgba(0,0,0,0.04)' }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105"
              style={{ backgroundColor: iconBg }}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-base mb-1.5" style={{ color: '#1e293b' }}>{title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>{desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent Uploads */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-xl" style={{ color: '#1e293b' }}>Recent Uploads</h2>
            <p className="text-sm mt-0.5" style={{ color: '#94a3b8' }}>Fresh academic resources added today</p>
          </div>
          <Link
            href="/videos"
            className="flex items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-70"
            style={{ color: '#3b82f6' }}
          >
            View All Resources
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-white" style={{ border: '1px solid #e8edf5' }}>
                <div className="skeleton" style={{ height: '160px' }} />
                <div className="p-4 space-y-3">
                  <div className="skeleton h-4 rounded" />
                  <div className="skeleton h-3 rounded w-2/3" />
                  <div className="skeleton h-4 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-5">
            {resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        )}
      </section>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 pb-2">
        {[
          { label: 'Total Resources', value: '3,400+', color: '#3b82f6' },
          { label: 'Active Students', value: '28,000+', color: '#10b981' },
          { label: 'Partner Universities', value: '150+', color: '#f59e0b' },
          { label: 'Expert Instructors', value: '600+', color: '#8b5cf6' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-white rounded-2xl p-5 flex flex-col gap-1"
            style={{ border: '1px solid #e8edf5' }}
          >
            <span className="text-2xl font-bold" style={{ color }}>{value}</span>
            <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
