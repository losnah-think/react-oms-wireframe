"use client";
import React from "react";

export default function SecretModal({
  secret,
  onClose,
}: {
  secret: { key: string; value: string }[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">시크릿</h3>
          <button
            onClick={onClose}
            className="text-gray-500"
            aria-label="close-secret-modal"
          >
            닫기
          </button>
        </div>

        <div className="space-y-3">
          {secret.map((s, idx) => (
            <div key={idx}>
              <div className="text-xs text-gray-500">Key</div>
              <div className="font-mono bg-gray-50 p-2 rounded mt-1 flex items-center justify-between">
                <span>{s.key}</span>
                <button
                  className="ml-2 text-sm text-primary-600"
                  title="Copy key"
                  onClick={() => {
                    navigator.clipboard?.writeText(s.key);
                    alert("Copied");
                  }}
                  aria-label={`copy-key-${idx}`}
                >
                  복사
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-2">Value</div>
              <div className="font-mono bg-gray-50 p-2 rounded mt-1 flex items-center justify-between">
                <span>{s.value}</span>
                <button
                  className="ml-2 text-sm text-primary-600"
                  title="Copy value"
                  onClick={() => {
                    navigator.clipboard?.writeText(s.value);
                    alert("Copied");
                  }}
                  aria-label={`copy-value-${idx}`}
                >
                  복사
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-right">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-primary-600 text-white rounded"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
