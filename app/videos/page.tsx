'use client';

import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, PlaySquare } from 'lucide-react';
import ResourceCard from '@/components/resource-card';
import { supabase } from '@/lib/supabase';
import type { Resource } from '@/lib/types';

const subjects = ['All', 'Computer Science', 'Physics', 'Mathematics', 'Economics', 'Chemistry', 'Law', 'Biology'];

export default function VideosPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubject, setActiveSubject] = useState('All');
  const [query, setQuery] = useState('');

  useEffect(() => {
    async function fetch() {
      let q = supabase.from('resources').select('*').eq('type', 'video').order('created_at', { ascending: false });
      if (activeSubject !== 'All') q = q.eq('subject', activeSubject);
      const { data, error } = await q;
      if (!error && data) setResources(data);
      setLoading(false);
    }
    fetch();
  }, [activeSubject]);

  const filtered = query
    ? resources.filter((r) => r.title.toLowerCase().includes(query.toLowerCase()) || r.author.toLowerCase().includes(query.toLowerCase()))
    : resources;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
              <PlaySquare className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-2xl" style={{ color: '#1e293b' }}>Video Marketplace</h1>
          </div>
          <p className="text-sm ml-13" style={{ color: '#94a3b8' }}>
            1,200+ hours of expert-led academic video courses
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#94a3b8' }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search videos..."
              className="pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none bg-white"
              style={{ border: '1.5px solid #e2e8f0', width: '220px' }}
              onFocus={(e) => (e.currentTarget.style.border = '1.5px solid #3b82f6')}
              onBlur={(e) => (e.currentTarget.style.border = '1.5px solid #e2e8f0')}
            />
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white"
            style={{ border: '1.5px solid #e2e8f0', color: '#475569' }}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Subject Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {subjects.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSubject(s)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              backgroundColor: activeSubject === s ? '#3b82f6' : '#ffffff',
              color: activeSubject === s ? '#ffffff' : '#475569',
              border: `1.5px solid ${activeSubject === s ? '#3b82f6' : '#e2e8f0'}`,
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
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
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <PlaySquare className="w-12 h-12 mb-4" style={{ color: '#cbd5e1' }} />
          <p className="font-semibold text-lg" style={{ color: '#64748b' }}>No video courses found</p>
          <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>Try a different subject or search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-5">
          {filtered.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}
    </div>
  );
}
