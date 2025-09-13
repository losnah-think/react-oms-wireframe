"use client";
import IntegrationCard from './IntegrationCard';
import { mockIntegrations, Integration } from '../../data/mockIntegrations';

export default function ConnectionsList({ platform }: { platform?: string }) {
  const list: Integration[] = platform && platform !== 'all' ? mockIntegrations.filter(i => i.platform === platform) : mockIntegrations;

  // grouped by platform when showing all
  const grouped: Record<string, Integration[]> = list.reduce((acc, cur) => {
    acc[cur.platform] = acc[cur.platform] || [];
    acc[cur.platform].push(cur);
    return acc;
  }, {} as Record<string, Integration[]>);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">연결된 스토어</h3>
        <button className="px-3 py-1 bg-primary-600 text-white rounded text-sm">연결 추가</button>
      </div>

      <div className="space-y-4">
        {Object.keys(grouped).map(platformKey => (
          <div key={platformKey} className="space-y-2">
            <div className="text-sm font-medium text-gray-600">{platformKey.toUpperCase()}</div>
            <div className="space-y-2">
              {grouped[platformKey].map(i => (
                <IntegrationCard key={i.id} integration={i} onOpen={(id) => console.log('open', id)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
