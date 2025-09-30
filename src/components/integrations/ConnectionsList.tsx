"use client";
import React from "react";
import IntegrationCard from "./IntegrationCard";
import SecretModal from "./SecretModal";
import RegisterIntegrationForm from "./RegisterIntegrationForm";
import { Modal, Stack, Button } from "../../design-system";
import IntegrationIntervalsModal from "./IntegrationIntervalsModal";

// Minimal Integration type expected by this component
type Integration = {
  id: string;
  platform?: string;
  storeName?: string;
  storeDomain?: string;
  status?: string;
  lastSync?: string;
  ordersCount?: number;
  itemsCount?: number;
  secrets?: { key: string; value: string }[];
}

export default function ConnectionsList({
  platform,
  onSelectIntegration,
}: {
  platform?: string;
  onSelectIntegration?: (integration: any) => void;
}) {
  const [showSecret, setShowSecret] = React.useState<
    { key: string; value: string }[] | null
  >(null);
  const [showRegister, setShowRegister] = React.useState(false);
  const [intervalModalFor, setIntervalModalFor] = React.useState<string | null>(
    null,
  );
  const [intervalsByIntegration, setIntervalsByIntegration] = React.useState<
    Record<string, any[]>
  >({});

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(
        "collectionIntervalsByIntegration",
      );
      if (raw) setIntervalsByIntegration(JSON.parse(raw));
    } catch (e) {}
  }, []);

  const saveForIntegration = (integrationId: string, list: any[]) => {
    const next = { ...(intervalsByIntegration || {}), [integrationId]: list };
    setIntervalsByIntegration(next);
    try {
      window.localStorage.setItem(
        "collectionIntervalsByIntegration",
        JSON.stringify(next),
      );
    } catch (e) {}
  };

  const [list, setList] = React.useState<Integration[]>([]);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch('/api/integrations/connected-shops');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const shops = await res.json();
        // map shops -> Integration shape expected by cards
        const mapped: Integration[] = (shops || []).map((s: any) => ({
          id: s.id,
          platform: String(s.platform || 'unknown'),
          storeName: s.name || s.id,
          storeDomain: s.credentials?.domain || undefined,
          status: s.credentials ? 'connected' : 'disconnected',
          lastSync: undefined,
          ordersCount: 0,
          itemsCount: 0,
          secrets: s.credentials ? Object.keys(s.credentials).map((k: string) => ({ key: k, value: String(s.credentials[k]) })) : undefined,
        }));
        if (mounted) setList(platform && platform !== 'all' ? mapped.filter(m => m.platform === platform) : mapped);
      } catch (e) {
        console.error('Failed to load integrations', e);
      }
    }
    load();
    return () => { mounted = false };
  }, [platform]);

  // Group when 'all', otherwise single group
  const grouped: Record<string, Integration[]> = list.reduce((acc, cur) => {
    const key = cur.platform || 'unknown'
    acc[key] = acc[key] || [];
    acc[key].push(cur as Integration);
    return acc;
  }, {} as Record<string, Integration[]>);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">연결된 스토어</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.keys(grouped).map((platformKey) => (
          <div key={platformKey}>
            <div className="text-sm font-medium text-gray-600 mb-2">
              {platformKey.toUpperCase()}
            </div>
            <div className="grid grid-cols-1 gap-3">
              {grouped[platformKey].map((i) => (
                <IntegrationCard
                  key={i.id}
                  integration={i as any}
                  onOpenSecret={(sArr) => setShowSecret(sArr)}
                  onOpenDetail={(integration) =>
                    onSelectIntegration?.(integration)
                  }
                  onOpenIntervals={(integration) =>
                    setIntervalModalFor(integration.id)
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {showSecret && (
        <SecretModal secret={showSecret} onClose={() => setShowSecret(null)} />
      )}

      <Stack direction="row" gap={2} className="mt-4">
        <Button size="small" onClick={() => setShowRegister(true)}>
          새 샵 등록
        </Button>
      </Stack>

      <Modal
        open={showRegister}
        onClose={() => setShowRegister(false)}
        title="새 샵 등록"
        footer={null}
        size="big"
      >
        <RegisterIntegrationForm
          onClose={() => setShowRegister(false)}
          onRegistered={() => {
            setShowRegister(false);
            window.location.reload();
          }}
        />
      </Modal>
      {intervalModalFor && (
        <IntegrationIntervalsModal
          integrationId={intervalModalFor}
          value={intervalsByIntegration[intervalModalFor]}
          onClose={() => setIntervalModalFor(null)}
          onSave={(list) => saveForIntegration(intervalModalFor, list)}
        />
      )}
    </div>
  );
}
