'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { doseState, type ReminderWithWeek } from '@/lib/medication';
import { dateKey } from '@/lib/dates';
import { checkInDose } from '@/lib/actions/reminders';
import { AlarmModal, type AlarmDose } from '@/components/medication/alarm-modal';

interface AlarmManagerProps {
  reminders: ReminderWithWeek[];
  notifBrowser: boolean;
}

const STORAGE_KEY = 'vw.alarmedDoses';
const TICK_MS = 15_000;
const SNOOZE_MS = 5 * 60 * 1000;

function loadAlarmed(): Set<string> {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return new Set(Array.isArray(raw) ? raw : []);
  } catch {
    return new Set();
  }
}

function saveAlarmed(set: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // localStorage unavailable — alarms may re-fire on reload, which is acceptable
  }
}

function playBeep(ctx: AudioContext) {
  const now = ctx.currentTime;
  [880, 660].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now + i * 0.18);
    gain.gain.exponentialRampToValueAtTime(0.25, now + i * 0.18 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.18 + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.18);
    osc.stop(now + i * 0.18 + 0.35);
  });
}

export function AlarmManager({ reminders, notifBrowser }: AlarmManagerProps) {
  const router = useRouter();
  const [activeAlarms, setActiveAlarms] = useState<AlarmDose[]>([]);
  const [index, setIndex] = useState(0);
  const [pending, startTransition] = useTransition();

  const audioCtxRef = useRef<AudioContext | null>(null);
  const snoozeRef = useRef<Map<string, number>>(new Map());
  const statusRef = useRef<Map<string, string>>(new Map());

  // Unlock the AudioContext on the user's first interaction — required by
  // browser autoplay policies before any sound can play.
  useEffect(() => {
    const unlock = () => {
      if (!audioCtxRef.current) {
        const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (Ctor) audioCtxRef.current = new Ctor();
      } else if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    };
    window.addEventListener('click', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  // Play a repeating beep while any alarm is active.
  useEffect(() => {
    if (activeAlarms.length === 0) return;
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    playBeep(ctx);
    const id = setInterval(() => playBeep(ctx), 1000);
    return () => clearInterval(id);
  }, [activeAlarms.length]);

  const tick = useCallback(() => {
    const now = new Date();
    const today = dateKey(now);
    const alarmed = loadAlarmed();

    // Dose statuses (upcoming/late/escalated/taken) are computed at render
    // time on the server, so a stale page won't reflect a status change
    // (e.g. "Upcoming" -> "Late") until something re-renders it. Detect
    // transitions client-side and refresh server components to pick them up.
    let statusChanged = false;
    for (const r of reminders) {
      if (!r.active) continue;
      const status = doseState(r, now).status;
      const prev = statusRef.current.get(r.id);
      if (prev !== undefined && prev !== status) statusChanged = true;
      statusRef.current.set(r.id, status);
    }
    if (statusChanged) router.refresh();

    const due = reminders.filter((r) => {
      if (!r.active) return false;
      const st = doseState(r, now);
      if (st.status !== 'late') return false;
      if (alarmed.has(`${r.id}:${today}`)) return false;
      const snoozeUntil = snoozeRef.current.get(r.id);
      if (snoozeUntil && now.getTime() < snoozeUntil) return false;
      return true;
    });

    if (due.length === 0) return;

    setActiveAlarms((prev) => {
      const existingIds = new Set(prev.map((a) => a.id));
      const additions = due.filter((r) => !existingIds.has(r.id));
      if (additions.length === 0) return prev;

      if (notifBrowser && typeof Notification !== 'undefined') {
        const notify = (r: ReminderWithWeek) => {
          new Notification('Time for your medication', {
            body: `${r.name} ${r.dosage} · ${r.time}`,
            icon: '/favicon.ico',
            tag: `vw-alarm-${r.id}-${today}`,
            requireInteraction: true,
          });
        };
        if (Notification.permission === 'granted') {
          additions.forEach(notify);
        } else if (Notification.permission === 'default') {
          Notification.requestPermission().then((perm) => {
            if (perm === 'granted') additions.forEach(notify);
          });
        }
      }

      return [...prev, ...additions.map((r) => ({ id: r.id, name: r.name, dosage: r.dosage, time: r.time }))];
    });
  }, [reminders, notifBrowser, router]);

  useEffect(() => {
    tick();
    const id = setInterval(tick, TICK_MS);
    return () => clearInterval(id);
  }, [tick]);

  useEffect(() => {
    if (index >= activeAlarms.length) setIndex(Math.max(0, activeAlarms.length - 1));
  }, [activeAlarms.length, index]);

  const removeAlarm = (id: string) => {
    setActiveAlarms((prev) => prev.filter((a) => a.id !== id));
  };

  const current = activeAlarms[index] ?? null;

  const markAlarmedToday = (id: string) => {
    const alarmed = loadAlarmed();
    alarmed.add(`${id}:${dateKey(new Date())}`);
    saveAlarmed(alarmed);
  };

  const handleTaken = () => {
    if (!current) return;
    const { id } = current;
    startTransition(async () => {
      await checkInDose(id);
      markAlarmedToday(id);
      snoozeRef.current.delete(id);
      removeAlarm(id);
      router.refresh();
    });
  };

  const handleSnooze = () => {
    if (!current) return;
    snoozeRef.current.set(current.id, Date.now() + SNOOZE_MS);
    removeAlarm(current.id);
  };

  const handleDismiss = () => {
    if (!current) return;
    markAlarmedToday(current.id);
    removeAlarm(current.id);
  };

  return (
    <AlarmModal
      alarm={current}
      index={index}
      total={activeAlarms.length}
      pending={pending}
      onTaken={handleTaken}
      onSnooze={handleSnooze}
      onDismiss={handleDismiss}
    />
  );
}
