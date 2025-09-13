"use client";
import React from "react";
import IntegrationCard from "./IntegrationCard";
import SecretModal from "./SecretModal";
import RegisterIntegrationForm from "./RegisterIntegrationForm";
import IntegrationIntervalsModal from "./IntegrationIntervalsModal";
import { mockIntegrations, Integration } from "../../data/mockIntegrations";

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

  const list: Integration[] =
    platform && platform !== "all"
      ? mockIntegrations.filter((i) => i.platform === platform)
      : mockIntegrations;

  // Group when 'all', otherwise single group
  const grouped: Record<string, Integration[]> = list.reduce(
    (acc, cur) => {
      acc[cur.platform] = acc[cur.platform] || [];
      acc[cur.platform].push(cur);
      return acc;
    },
    {} as Record<string, Integration[]>,
  );

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
                  integration={i}
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

      {showRegister && (
        <RegisterIntegrationForm onClose={() => setShowRegister(false)} />
      )}
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
