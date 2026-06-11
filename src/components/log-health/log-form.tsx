'use client';

import { useState, useTransition } from 'react';
import { Card } from '@/components/ui/card';
import { SectionTitle } from '@/components/ui/section-title';
import { Field, Input } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { addVitalLog } from '@/lib/actions/vitals';
import { VITAL_FIELDS } from '@/components/log-health/vital-fields';
import type { LogResult } from '@/components/log-health/types';

type Vals = Record<'hr' | 'spo2' | 'temp' | 'steps', string>;

const BLANK: Vals = { hr: '', spo2: '', temp: '', steps: '' };

interface LogFormProps {
  onAnalyzing: () => void;
  onResult: (log: LogResult) => void;
}

export function LogForm({ onAnalyzing, onResult }: LogFormProps) {
  const toast = useToast();
  const [vals, setVals] = useState<Vals>(BLANK);
  const [errors, setErrors] = useState<Partial<Record<keyof Vals, string>>>({});
  const [pending, startTransition] = useTransition();

  const set = (k: keyof Vals, v: string) => {
    setVals((s) => ({ ...s, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e: Partial<Record<keyof Vals, string>> = {};
    VITAL_FIELDS.forEach((f) => {
      const v = vals[f.key];
      if (v === '' || v == null) e[f.key] = 'This field is required';
      else if (+v < f.min || +v > f.max || isNaN(+v)) e[f.key] = f.msg;
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) {
      toast({ tone: 'error', title: 'Please fix the highlighted fields' });
      return;
    }
    onAnalyzing();
    const submitted = { ...vals };
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(submitted).forEach(([k, v]) => formData.append(k, v));
      const [result] = await Promise.all([
        addVitalLog(undefined, formData),
        new Promise((r) => setTimeout(r, 3000)),
      ]);
      if (result.error) {
        toast({ tone: 'error', title: result.error });
        return;
      }
      setVals(BLANK);
      const log: LogResult = {
        hr: +submitted.hr,
        spo2: +submitted.spo2,
        temp: +submitted.temp,
        steps: +submitted.steps,
        summary: result.summary!,
        anomalyFlag: result.anomalyFlag!,
        recommendations: result.recommendations!,
        ts: new Date().toISOString(),
      };
      onResult(log);
      toast({
        tone: log.anomalyFlag ? 'warning' : 'success',
        title: log.anomalyFlag ? 'Logged — anomaly detected' : 'Vitals logged & analyzed',
        message: log.anomalyFlag ? 'Review the AI analysis result.' : 'AI analysis is ready below.',
      });
    });
  };

  return (
    <Card className="p-6">
      <SectionTitle icon="activity" title="Log Today's Vitals" />
      <p className="mt-1.5 text-sm text-slate-500">Enter your readings below. AI analysis will run automatically after submission.</p>

      <form onSubmit={submit} className="mt-6 space-y-5">
        {VITAL_FIELDS.map((f) => (
          <Field key={f.key} label={f.label} hint={!errors[f.key] ? f.range : undefined} error={errors[f.key]} htmlFor={f.key}>
            <Input
              id={f.key}
              type="number"
              step={f.step}
              inputMode="decimal"
              placeholder={f.ph}
              unit={f.unit}
              value={vals[f.key]}
              onChange={(e) => set(f.key, e.target.value)}
              error={!!errors[f.key]}
            />
          </Field>
        ))}

        <Button type="submit" size="lg" loading={pending} icon={pending ? undefined : 'sparkles'} className="w-full justify-center">
          {pending ? 'Analyzing with Gemini AI…' : 'Submit & Analyze'}
        </Button>
      </form>
    </Card>
  );
}
