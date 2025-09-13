"use client";
import React, { useState } from 'react';

export default function AuthForm({ onAuth }: { onAuth?: (data: { clientId: string; clientSecret: string }) => void }) {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAuth) onAuth({ clientId, clientSecret });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700">Client ID</label>
        <input value={clientId} onChange={e => setClientId(e.target.value)} className="mt-1 block w-full border px-3 py-2 rounded" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Client Secret</label>
        <input value={clientSecret} onChange={e => setClientSecret(e.target.value)} className="mt-1 block w-full border px-3 py-2 rounded" />
      </div>
      <div>
        <button type="submit" className="btn btn-primary">인증 저장</button>
      </div>
    </form>
  );
}
