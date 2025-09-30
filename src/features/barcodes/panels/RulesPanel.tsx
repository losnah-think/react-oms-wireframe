import React, { useState } from "react";
import { Button, Input, Stack } from "../../../design-system";
import type { CleanupRule } from "../useBarcodeSettings";

type Props = {
  rules: CleanupRule[];
  toggleRule: (id: string) => void;
  addRule: (keyword: string) => void;
};

const RulesPanel: React.FC<Props> = ({ rules, toggleRule, addRule }) => {
  const [input, setInput] = React.useState("");
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">불필요 문자열 제거</h2>
        <Stack direction="row" gap={3}>
          <Input placeholder="예: (무료배송)" value={input} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)} fullWidth />
          <Button onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.preventDefault(); if (input.trim()) { addRule(input.trim()); setInput(""); } }}>규칙 추가</Button>
        </Stack>
      </div>

      <div className="space-y-2">
        {rules.map((rule) => (
          <label key={rule.id} className="flex items-center justify-between rounded-md border border-gray-200 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-800">{rule.keyword}</p>
              <p className="text-xs text-gray-500">{rule.description}</p>
            </div>
            <Stack direction="row" gap={2} align="center">
              <span className="text-xs text-gray-500">{rule.enabled ? "사용 중" : "사용 안 함"}</span>
              <input type="checkbox" checked={rule.enabled} onChange={() => toggleRule(rule.id)} className="h-4 w-4" />
            </Stack>
          </label>
        ))}
      </div>
    </div>
  );
};

export default RulesPanel;
