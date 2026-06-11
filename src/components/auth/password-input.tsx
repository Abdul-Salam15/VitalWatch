'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/field';
import { Icon } from '@/components/ui/icon';

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: boolean;
}

export function PasswordInput({ value, onChange, placeholder, error }: PasswordInputProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input leftIcon="lock" type={show ? 'text' : 'password'} placeholder={placeholder} value={value} onChange={onChange} error={error} className="pr-10" />
      <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
        <Icon name={show ? 'eye-off' : 'eye'} size={16} />
      </button>
    </div>
  );
}
