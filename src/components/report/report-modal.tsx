'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { PatientReport, type ReportLog } from '@/components/report/patient-report';
import type { ReminderWithWeek } from '@/lib/medication';
import type { ReportRange, ReportPreset } from '@/components/report/report-metrics';

const PRINT_CSS = `
.vw-report-root { color: #18211C; }
.vw-report-root, .vw-report-root * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
@media print {
  @page { size: A4 portrait; margin: 13mm; }
  html, body { background: #fff !important; }
  body > #vw-app-root { display: none !important; }
  #vw-report-overlay { position: static !important; inset: auto !important; background: #fff !important; overflow: visible !important; z-index: auto !important; }
  #vw-report-overlay .vw-report-toolbar { display: none !important; }
  #vw-report-overlay .vw-report-scroll { overflow: visible !important; padding: 0 !important; background: #fff !important; display: block !important; }
  .vw-report-root { width: 100% !important; max-width: none !important; box-shadow: none !important; border: 0 !important; margin: 0 !important; border-radius: 0 !important; }
  .vw-report-section { break-inside: avoid; page-break-inside: avoid; }
  .vw-report-row { break-inside: avoid; }
}`;

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  logs: ReportLog[];
  reminders: ReminderWithWeek[];
  user: { name: string; email: string };
  caregiverName: string;
  caregiverEmail: string;
}

export function ReportModal({ open, onClose, logs, reminders, user, caregiverName, caregiverEmail }: ReportModalProps) {
  const [range, setRange] = useState<ReportRange>({ preset: 'all', from: '', to: '' });
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (document.getElementById('vw-report-print-css')) return;
    const el = document.createElement('style');
    el.id = 'vw-report-print-css';
    el.textContent = PRINT_CSS;
    document.head.appendChild(el);
  }, []);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', h);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const dates = logs.map((l) => new Date(l.ts)).sort((a, b) => a.getTime() - b.getTime());
  const toInput = (d: Date | undefined) => (d ? d.toISOString().slice(0, 10) : '');
  const minIn = toInput(dates[0]);
  const maxIn = toInput(dates[dates.length - 1]);
  const onPreset = (v: string) =>
    setRange((r) =>
      v === 'custom'
        ? { preset: 'custom', from: r.from || minIn, to: r.to || maxIn }
        : { preset: v as ReportPreset, from: '', to: '' }
    );

  const ctl = 'h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-[13px] font-medium text-slate-700 focus:border-brand focus:ring-2 focus:ring-brand/20';

  return createPortal(
    <div id="vw-report-overlay" className="fixed inset-0 z-[70] flex flex-col bg-slate-200/90 backdrop-blur-sm">
      <div className="vw-report-toolbar flex flex-wrap items-center gap-x-4 gap-y-2.5 border-b border-slate-300 bg-white px-4 sm:px-6 py-3 shadow-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white"><Icon name="file-text" size={18} /></div>
          <div className="min-w-0">
            <p className="text-[15px] font-bold text-slate-900 leading-tight truncate">Patient Health Report</p>
            <p className="text-[12px] text-slate-400 leading-tight hidden sm:block">Choose a period, then “Save as PDF” in the print dialog</p>
          </div>
        </div>

        <div className="flex items-center gap-2 order-3 w-full sm:order-2 sm:w-auto sm:ml-4">
          <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500"><Icon name="calendar" size={15} className="text-slate-400" />Period</span>
          <select value={range.preset} onChange={(e) => onPreset(e.target.value)} className={ctl}>
            <option value="last7">Last 7 days</option>
            <option value="last14">Last 14 days</option>
            <option value="last30">Last 30 days</option>
            <option value="last90">Last 90 days</option>
            <option value="all">All time</option>
            <option value="custom">Custom range…</option>
          </select>
          {range.preset === 'custom' && (
            <div className="flex items-center gap-1.5">
              <input type="date" value={range.from} min={minIn} max={range.to || maxIn}
                onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} className={ctl} />
              <span className="text-slate-400">–</span>
              <input type="date" value={range.to} min={range.from || minIn} max={maxIn}
                onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} className={ctl} />
            </div>
          )}
        </div>

        <div className="order-2 ml-auto flex items-center gap-2 sm:order-3">
          <Button variant="primary" icon="download" onClick={() => window.print()}>Download PDF</Button>
          <Button variant="white" icon="x" onClick={onClose} className="px-3"><span className="hidden sm:inline">Close</span></Button>
        </div>
      </div>
      <div className="vw-report-scroll flex-1 overflow-y-auto vw-scroll px-3 sm:px-6 py-6">
        <div className="mx-auto w-fit shadow-xl rounded-sm overflow-hidden">
          <PatientReport range={range} logs={logs} reminders={reminders} user={user} caregiverName={caregiverName} caregiverEmail={caregiverEmail} />
        </div>
      </div>
    </div>,
    document.body
  );
}
