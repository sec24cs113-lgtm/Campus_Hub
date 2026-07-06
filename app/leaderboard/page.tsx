'use client';

import { useEffect, useState } from 'react';
import { Trophy, Medal, Award, TrendingUp, Star, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { LeaderboardUser } from '@/lib/types';

function getRankIcon(rank: number) {
  if (rank === 1) return <Trophy className="w-5 h-5" style={{ color: '#f59e0b' }} />;
  if (rank === 2) return <Medal className="w-5 h-5" style={{ color: '#94a3b8' }} />;
  if (rank === 3) return <Award className="w-5 h-5" style={{ color: '#cd7c3f' }} />;
  return <span className="font-bold text-sm" style={{ color: '#94a3b8' }}>#{rank}</span>;
}

function getRankBg(rank: number) {
  if (rank === 1) return { bg: '#fffbeb', border: '#fde68a' };
  if (rank === 2) return { bg: '#f8fafc', border: '#e2e8f0' };
  if (rank === 3) return { bg: '#fff7ed', border: '#fed7aa' };
  return { bg: '#ffffff', border: '#e8edf5' };
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data, error } = await supabase
        .from('leaderboard_users')
        .select('*')
        .order('score', { ascending: false })
        .limit(10);
      if (!error && data) setUsers(data);
      setLoading(false);
    }
    fetch();
  }, []);

  const top3 = users.slice(0, 3);
  const rest = users.slice(3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f59e0b' }}>
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-2xl" style={{ color: '#1e293b' }}>Leaderboard</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>Top contributors ranked by academic impact score</p>
        </div>
      </div>

      {/* Top 3 Podium */}
      {!loading && top3.length >= 3 && (
        <div className="grid grid-cols-3 gap-4">
          {/* 2nd place */}
          <div
            className="rounded-2xl p-6 flex flex-col items-center text-center mt-6"
            style={{ backgroundColor: '#f8fafc', border: '2px solid #e2e8f0' }}
          >
            <div className="relative mb-3">
              <img
                src={top3[1].avatar_url || ''}
                alt={top3[1].name}
                className="w-16 h-16 rounded-full object-cover ring-4 ring-slate-400"
              />
              <div
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: '#94a3b8' }}
              >
                2
              </div>
            </div>
            <p className="font-bold text-base mt-2" style={{ color: '#1e293b' }}>{top3[1].name}</p>
            <p className="text-xs mb-2" style={{ color: '#94a3b8' }}>{top3[1].institution}</p>
            <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
              {top3[1].subject_badge}
            </span>
            <p className="font-bold text-lg mt-3" style={{ color: '#94a3b8' }}>
              {top3[1].score.toLocaleString()} pts
            </p>
          </div>

          {/* 1st place */}
          <div
            className="rounded-2xl p-6 flex flex-col items-center text-center -mt-2"
            style={{ backgroundColor: '#fffbeb', border: '2px solid #fde68a' }}
          >
            <div className="mb-2">
              <Trophy className="w-7 h-7 mx-auto" style={{ color: '#f59e0b' }} />
            </div>
            <div className="relative mb-3">
              <img
                src={top3[0].avatar_url || ''}
                alt={top3[0].name}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-amber-400"
              />
              <div
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: '#f59e0b' }}
              >
                1
              </div>
            </div>
            <p className="font-bold text-lg mt-2" style={{ color: '#1e293b' }}>{top3[0].name}</p>
            <p className="text-xs mb-2" style={{ color: '#94a3b8' }}>{top3[0].institution}</p>
            <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
              {top3[0].subject_badge}
            </span>
            <p className="font-bold text-xl mt-3" style={{ color: '#f59e0b' }}>
              {top3[0].score.toLocaleString()} pts
            </p>
          </div>

          {/* 3rd place */}
          <div
            className="rounded-2xl p-6 flex flex-col items-center text-center mt-6"
            style={{ backgroundColor: '#fff7ed', border: '2px solid #fed7aa' }}
          >
            <div className="relative mb-3">
              <img
                src={top3[2].avatar_url || ''}
                alt={top3[2].name}
                className="w-16 h-16 rounded-full object-cover ring-4 ring-orange-400"
              />
              <div
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: '#cd7c3f' }}
              >
                3
              </div>
            </div>
            <p className="font-bold text-base mt-2" style={{ color: '#1e293b' }}>{top3[2].name}</p>
            <p className="text-xs mb-2" style={{ color: '#94a3b8' }}>{top3[2].institution}</p>
            <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: '#fff7ed', color: '#9a3412' }}>
              {top3[2].subject_badge}
            </span>
            <p className="font-bold text-lg mt-3" style={{ color: '#cd7c3f' }}>
              {top3[2].score.toLocaleString()} pts
            </p>
          </div>
        </div>
      )}

      {/* Full Rankings Table */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #e8edf5' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid #e8edf5' }}>
          <h2 className="font-bold text-base" style={{ color: '#1e293b' }}>Full Rankings</h2>
        </div>
        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="skeleton w-8 h-8 rounded-full" />
                <div className="skeleton w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 rounded w-1/3" />
                  <div className="skeleton h-3 rounded w-1/4" />
                </div>
                <div className="skeleton h-6 rounded w-20" />
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#f1f5f9' }}>
            {users.map((user, i) => {
              const { bg, border } = getRankBg(i + 1);
              return (
                <div
                  key={user.id}
                  className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50"
                  style={{ backgroundColor: i < 3 ? bg : undefined }}
                >
                  <div className="w-8 flex items-center justify-center flex-shrink-0">
                    {getRankIcon(i + 1)}
                  </div>
                  <img
                    src={user.avatar_url || ''}
                    alt={user.name}
                    className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ color: '#1e293b' }}>{user.name}</p>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>{user.institution}</p>
                  </div>
                  <span
                    className="text-xs px-3 py-1 rounded-full font-medium hidden sm:block"
                    style={{ backgroundColor: '#f1f5f9', color: '#475569' }}
                  >
                    {user.subject_badge}
                  </span>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1" style={{ color: '#94a3b8' }}>
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{user.resources_sold} sold</span>
                    </div>
                    <span className="font-bold" style={{ color: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7c3f' : '#3b82f6' }}>
                      {user.score.toLocaleString()} pts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
