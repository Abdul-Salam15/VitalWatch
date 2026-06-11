'use client';

import { useEffect, useState, useTransition } from 'react';
import { cx } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Field, Input, Select } from '@/components/ui/field';
import { WEEK, fmtTime12 } from '@/lib/dates';
import { createReminder, updateReminder } from '@/lib/actions/reminders';
import { useToast } from '@/components/ui/toast';
import type { ReminderWithWeek } from '@/lib/medication';

interface ReminderDialogProps {
  open: boolean;
  onClose: () => void;
  editing: ReminderWithWeek | null;
}

interface FormState {
  name: string;
  dosage: string;
  time: string;
  frequency: string;
  customDays: number[];
  escalation: number;
}

const BLANK: FormState = { name: '', dosage: '', time: '08:00', frequency: 'Daily', customDays: [], escalation: 30 };

export function ReminderDialog({ open, onClose, editing }: ReminderDialogProps) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>(BLANK);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    if (!open) return;
    setForm(editing
      ? { name: editing.name, dosage: editing.dosage, time: editing.time, frequency: editing.frequency, customDays: editing.customDays, escalation: editing.escalation }
      : BLANK);
    setErrors({});
  }, [open, editing]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const toggleDay = (i: number) => setForm((f) => ({
    ...f,
    customDays: f.customDays.includes(i) ? f.customDays.filter((d) => d !== i) : [...f.customDays, i].sort(),
  }));

  const save = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Medication name is required';
    if (!form.dosage.trim()) e.dosage = 'Dosage is required';
    if (!form.time) e.time = 'Scheduled time is required';
    if (form.frequency === 'Custom' && form.customDays.length === 0) e.customDays = 'Select at least one day';
    setErrors(e);
    if (Object.keys(e).length) return;

    const fd = new FormData();
    fd.set('name', form.name.trim());
    fd.set('dosage', form.dosage.trim());
    fd.set('time', form.time);
    fd.set('frequency', form.frequency);
    form.customDays.forEach((d) => fd.append('customDays', String(d)));
    fd.set('escalation', String(form.escalation));

    startTransition(async () => {
      const result = editing ? await updateReminder(editing.id, undefined, fd) : await createReminder(undefined, fd);
      if (result.error) {
        toast({ tone: 'error', title: result.error });
        return;
      }
      if (editing) toast({ title: 'Reminder updated' });
      else toast({ title: 'Reminder added', message: `${form.name} ${form.dosage} at ${fmtTime12(form.time)}` });
      onClose();
    });
  };

  return (
    <Modal open={open} onClose={onClose} icon="pill" title={editing ? 'Edit Reminder' : 'Add Reminder'}
      description={editing ? 'Update this medication schedule.' : 'Schedule a new medication reminder.'}
      footer={<>
        <Button variant="ghost" onClick={onClose} disabled={pending}>Cancel</Button>
        <Button icon="check" onClick={save} loading={pending}>{editing ? 'Save Changes' : 'Save Reminder'}</Button>
      </>}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Medication Name" error={errors.name}>
            <Input placeholder="e.g. Metformin" value={form.name} onChange={(e) => set('name', e.target.value)} error={!!errors.name} />
          </Field>
          <Field label="Dosage" error={errors.dosage}>
            <Input placeholder="e.g. 500mg, 1 tablet" value={form.dosage} onChange={(e) => set('dosage', e.target.value)} error={!!errors.dosage} />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Scheduled Time" error={errors.time}>
            <Input type="time" value={form.time} onChange={(e) => set('time', e.target.value)} error={!!errors.time} />
          </Field>
          <Field label="Frequency">
            <Select value={form.frequency} onChange={(e) => set('frequency', e.target.value)}>
              <option>Daily</option><option>Weekdays</option><option>Weekends</option><option value="Custom">Custom days</option>
            </Select>
          </Field>
        </div>

        {form.frequency === 'Custom' && (
          <Field label="Custom Days" error={errors.customDays}>
            <div className="flex flex-wrap gap-2">
              {WEEK.map((d, i) => {
                const on = form.customDays.includes(i);
                return (
                  <button key={i} type="button" onClick={() => toggleDay(i)}
                    className={cx('h-10 w-12 rounded-lg text-sm font-semibold transition-colors border', on ? 'bg-brand text-white border-brand' : 'bg-white text-slate-500 border-slate-200 hover:border-brand-200')}>
                    {d}
                  </button>
                );
              })}
            </div>
          </Field>
        )}

        <Field label="Escalation Delay" hint="Minutes before caregiver is notified if dose is missed">
          <Input type="number" unit="min" value={form.escalation} onChange={(e) => set('escalation', +e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}
