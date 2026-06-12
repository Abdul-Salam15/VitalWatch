'use client';

import { cx } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { TONES, type Tone } from '@/lib/vitals';
import { fmtTime12, fmtDuration } from '@/lib/dates';

interface EmailChromeProps {
  from: string;
  fromAddr: string;
  to: string;
  subject: string;
  children: React.ReactNode;
}

function EmailChrome({ from, fromAddr, to, subject, children }: EmailChromeProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="space-y-2 border-b border-slate-100 bg-slate-50 px-5 py-4">
        <p className="text-[15px] font-bold text-slate-900" style={{ textWrap: 'pretty' }}>{subject}</p>
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-brand text-white"><Icon name="shield-check" size={16} /></div>
          <div className="min-w-0 text-[13px] leading-tight">
            <p className="font-semibold text-slate-800">{from} <span className="font-normal text-slate-400">&lt;{fromAddr}&gt;</span></p>
            <p className="text-slate-500">to {to}</p>
          </div>
        </div>
      </div>
      <div className="bg-white">{children}</div>
    </div>
  );
}

interface EmailBodyProps {
  accent?: 'brand' | 'rose';
  badge?: string;
  badgeTone?: Tone;
  heading: string;
  lead: string;
  rows?: [string, string][];
  cta?: { label: string; icon?: string };
  footnote?: string;
}

function EmailBody({ accent = 'brand', badge, badgeTone = 'green', heading, lead, rows, cta, footnote }: EmailBodyProps) {
  const bt = TONES[badgeTone] || TONES.green;
  return (
    <div>
      <div className={cx('px-6 py-5', accent === 'rose' ? 'bg-rose-600' : 'bg-brand')}>
        <div className="flex items-center gap-2 text-white">
          <Icon name="shield-check" size={18} />
          <span className="text-[15px] font-extrabold tracking-tight">VitalWatch</span>
        </div>
      </div>
      <div className="px-6 py-6">
        {badge && <span className={cx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold', bt.bg, bt.text)}><Icon name={badgeTone === 'red' ? 'alert-triangle' : badgeTone === 'amber' ? 'bell' : 'check-circle'} size={13} />{badge}</span>}
        <h3 className="mt-3 text-xl font-extrabold tracking-tight text-slate-900" style={{ textWrap: 'balance' }}>{heading}</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-600" style={{ textWrap: 'pretty' }}>{lead}</p>

        {rows && (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
            {rows.map(([k, v], i) => (
              <div key={i} className={cx('flex items-center justify-between gap-4 px-4 py-2.5 text-sm', i > 0 && 'border-t border-slate-100')}>
                <span className="text-slate-500">{k}</span>
                <span className="font-semibold text-slate-800 text-right">{v}</span>
              </div>
            ))}
          </div>
        )}

        {cta && (
          <div className="mt-5">
            <span className={cx('inline-flex h-11 items-center gap-2 rounded-xl px-5 text-[15px] font-semibold text-white shadow-sm', accent === 'rose' ? 'bg-rose-600' : 'bg-brand')}>
              <Icon name={cta.icon || 'check'} size={16} />{cta.label}
            </span>
          </div>
        )}

        {footnote && <p className="mt-5 border-t border-slate-100 pt-4 text-[13px] leading-relaxed text-slate-400" style={{ textWrap: 'pretty' }}>{footnote}</p>}
      </div>
      <div className="border-t border-slate-100 bg-slate-50 px-6 py-3.5 text-[12px] text-slate-400">
        VitalWatch · Remote patient monitoring · This is an automated message.
      </div>
    </div>
  );
}

export interface EmailPreviewDose {
  name: string;
  dosage: string;
  time: string;
  escalation?: number;
  overdueMin?: number;
}

interface EmailPreviewModalProps {
  open: boolean;
  onClose: () => void;
  kind?: 'patient' | 'caregiver';
  dose?: EmailPreviewDose | null;
  user: { name: string; email: string };
  caregiverName: string;
  caregiverEmail: string;
}

export function EmailPreviewModal({ open, onClose, kind, dose, user, caregiverName, caregiverEmail }: EmailPreviewModalProps) {
  if (!dose) return null;
  const first = (user.name || '').split(' ')[0];
  const caregiverTo = caregiverEmail
    ? `${caregiverName} <${caregiverEmail}>`
    : `${caregiverName || 'Caregiver'} (no email on file)`;
  const overdue = dose.overdueMin != null ? fmtDuration(dose.overdueMin) : fmtDuration(dose.escalation || 30);

  const isCaregiver = kind === 'caregiver';
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      icon={isCaregiver ? 'mail-check' : 'mail'}
      title={isCaregiver ? 'Caregiver alert email' : 'Patient reminder email'}
      description={isCaregiver ? 'Automatically sent when a dose is not taken on time.' : 'Sent to the patient when a dose becomes due.'}
      footer={<Button icon="check" onClick={onClose}>Close preview</Button>}
    >
      {isCaregiver ? (
        <EmailChrome from="VitalWatch" fromAddr="onboarding@vitalwatch.app" to={caregiverTo} subject={`⚠️ Missed medication alert — ${user.name}`}>
          <EmailBody
            accent="rose"
            badge="Escalation alert"
            badgeTone="red"
            heading={`${user.name} has not taken a scheduled dose`}
            lead={`A medication dose was not logged within the escalation window. As ${user.name}'s designated caregiver, you're being notified so you can follow up.`}
            rows={[
              ['Medication', `${dose.name} ${dose.dosage}`],
              ['Scheduled for', fmtTime12(dose.time)],
              ['Status', `Overdue by ${overdue}`],
              ['Patient', user.name],
            ]}
            cta={{ label: 'Open caregiver dashboard', icon: 'eye' }}
            footnote={`You are receiving this because missed-dose alerts are enabled for ${user.name}. Manage alert preferences in VitalWatch settings.`}
          />
        </EmailChrome>
      ) : (
        <EmailChrome from="VitalWatch" fromAddr="onboarding@vitalwatch.app" to={`${user.name} <${user.email}>`} subject={`⏰ Time for your ${dose.name}`}>
          <EmailBody
            accent="brand"
            badge="Medication reminder"
            badgeTone="amber"
            heading={`Hi ${first}, it's time for your ${dose.name}`}
            lead={`This is your reminder to take ${dose.name} (${dose.dosage}), scheduled for ${fmtTime12(dose.time)}. Open VitalWatch and check in once you've taken it.`}
            rows={[
              ['Medication', `${dose.name} ${dose.dosage}`],
              ['Scheduled for', fmtTime12(dose.time)],
            ]}
            cta={{ label: 'Check in — mark as taken', icon: 'check' }}
            footnote={`If you've already taken this dose, you can ignore this email. If you miss it by more than ${dose.escalation || 30} minutes, your caregiver will be notified automatically.`}
          />
        </EmailChrome>
      )}
    </Modal>
  );
}
