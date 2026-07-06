'use client';

import { useState } from 'react';
import { FileBarChart, Download, FileText, FileSpreadsheet, FileImage, Loader2 } from 'lucide-react';
import { AdminPageHeader, AdminCard } from '@/components/admin-ui';

const reportTypes = ['Users', 'Revenue', 'Resources', 'Transactions', 'Refunds', 'Uploads'];

export default function AdminReportsPage() {
  const [generating, setGenerating] = useState<string | null>(null);

  const handleExport = (type: string, format: string) => {
    setGenerating(`${type}-${format}`);
    setTimeout(() => setGenerating(null), 1500);
  };

  return (
    <div>
      <AdminPageHeader title="Reports" subtitle="Generate and export platform reports" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((type) => (
          <AdminCard key={type}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#eff6ff' }}>
                <FileBarChart className="w-5 h-5" style={{ color: '#3b82f6' }} />
              </div>
              <h3 className="font-bold text-base" style={{ color: '#1e293b' }}>{type} Report</h3>
            </div>
            <p className="text-sm mb-4" style={{ color: '#94a3b8' }}>Export {type.toLowerCase()} data for analysis.</p>
            <div className="flex gap-2">
              {[
                { format: 'csv', icon: FileText, color: '#10b981' },
                { format: 'excel', icon: FileSpreadsheet, color: '#3b82f6' },
                { format: 'pdf', icon: FileImage, color: '#ef4444' },
              ].map(({ format, icon: Icon, color }) => (
                <button
                  key={format}
                  onClick={() => handleExport(type, format)}
                  disabled={generating === `${type}-${format}`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-80 disabled:opacity-50"
                  style={{ backgroundColor: `${color}15`, color }}
                >
                  {generating === `${type}-${format}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
