"use client";
import React, { useState } from 'react';

export default function SecretForm({ onSave }: { onSave?: (data: { key: string; value: string }) => void }) {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) onSave({ key, value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700">Key</label>
        <input value={key} onChange={e => setKey(e.target.value)} className="mt-1 block w-full border px-3 py-2 rounded" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Value</label>
        <input value={value} onChange={e => setValue(e.target.value)} className="mt-1 block w-full border px-3 py-2 rounded" />
      </div>
      <div>
        <button type="submit" className="btn btn-primary">저장</button>
      </div>
    </form>
  );
}
