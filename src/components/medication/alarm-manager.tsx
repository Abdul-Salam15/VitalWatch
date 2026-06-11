'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { dateKey, fmtTime12 } from '@/lib/dates';
import { doseState, type ReminderWithWeek } from '@/lib/medication';
import { checkInDose } from '@/lib/actions/reminders';
import { AlarmModal } from '@/components/medication/alarm-modal';

interface AlarmManagerProps {
  reminders: ReminderWithWeek[];
  notifBrowser: boolean;
}

const STORAGE_KEY = 'vw.alarmedDoses';
const TICK_MS = 30_000;
const SNOOZE_MS = 5 * 60_000;
const BEEP_MS = 1000;

function loadAlarmed(): Record<string, true> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveAlarmed(map: Record<string, true>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore (e.g. storage disabled)
  }
}

export function AlarmManager({ reminders, notifBrowser }: AlarmManagerProps) {
  const router = useRouter();
  const [queue, setQueue] = useState<ReminderWithWeek[]>([]);
  const [pending, setPending] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const beepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const snoozedRef = useRef<Map<string, number>>(new Map());

  // Unlock audio on first user interaction (autoplay policy).
  useEffect(() => {
    const unlock = () => {
      if (!audioCtxRef.current) {
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (Ctx) audioCtxRef.current = new Ctx();
      }
      audioCtxRef.current?.resume?.();
    };
    document.addEventListener('click', unlock, { once: true });
    document.addEventListener('keydown', unlock, { once: true });
    return () => {
      document.removeEventListener('click', unlock);
      document.removeEventListener('keydown', unlock);
    };
  }, []);

  const playBeep = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx || ctx.state === 'suspended') return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  }, []);

  const startAlarmSound = useCallback(() => {
    if (beepTimerRef.current) return;
    playBeep();
    beepTimerRef.current = setInterval(playBeep, BEEP_MS);
  }, [playBeep]);

  const stopAlarmSound = useCallback(() => {
    if (beepTimerRef.current) {
      clearInterval(beepTimerRef.current);
      beepTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (queue.length > 0) startAlarmSound();
    else stopAlarmSound();
  }, [queue.length, startAlarmSound, stopAlarmSound]);

  useEffect(() => stopAlarmSound, [stopAlarmSound]);

  const notifyBrowser = useCallback((r: ReminderWithWeek) => {
    if (!notifBrowser || typeof Notification === 'undefined') return;
    const fire = () => {
      new Notification('Time for your medication', {
        body: `${r.name} ${r.dosage} · ${fmtTime12(r.time)}`,
        icon: '/favicon.ico',
        tag: `vw-alarm-${r.id}`,
        requireInteraction: true,
      });
    };
    if (Notification.permission === 'granted') fire();
    else if (Notification.permission === 'default') {
      Notification.requestPermission().then((perm) => { if (perm === 'granted') fire(); });
    }
  }, [notifBrowser]);

  // Poll dose states and surface newly-due reminders.
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const today = dateKey(now);
      const alarmed = loadAlarmed();
      let changed = false;

      reminders
        .filter((r) => r.active)
        .forEach((r) => {
          const key = `${r.id}:${today}`;
          if (alarmed[key]) return;

          const snoozeUntil = snoozedRef.current.get(r.id);
          if (snoozeUntil && now.getTime() < snoozeUntil) return;

          const st = doseState(r, now);
          if (st.status !== 'late') return;

          alarmed[key] = true;
          changed = true;
          snoozedRef.current.delete(r.id);
          setQueue((q) => (q.some((x) => x.id === r.id) ? q : [...q, r]));
          notifyBrowser(r);
        });

      if (changed) saveAlarmed(alarmed);
    };

    tick();
    const id = setInterval(tick, TICK_MS);
    return () => clearInterval(id);
  }, [reminders, notifyBrowser]);

  const current = queue[0] ?? null;

  const advance = useCallback(() => {
    setQueue((q) => q.slice(1));
  }, []);

  const handleMarkTaken = useCallback(() => {
    if (!current) return;
    setPending(true);
    checkInDose(current.id)
      .then(() => {
        advance();
        router.refresh();
      })
      .finally(() => setPending(false));
  }, [current, advance, router]);

  const handleSnooze = useCallback(() => {
    if (!current) return;
    snoozedRef.current.set(current.id, Date.now() + SNOOZE_MS);
    advance();
  }, [current, advance]);

  const handleDismiss = useCallback(() => {
    advance();
  }, [advance]);

  return (
    <AlarmModal
      alarm={current}
      queueLength={queue.length}
      pending={pending}
      onMarkTaken={handleMarkTaken}
      onSnooze={handleSnooze}
      onDismiss={handleDismiss}
    />
  );
}
