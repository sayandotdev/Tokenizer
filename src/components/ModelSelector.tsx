import React from "react";

interface ModelOption {
  label: string;
  value: string;
}

interface ModelSelectorProps {
  model: string;
  setModel: (value: string) => void;
}

const availableModels: ModelOption[] = [
  { label: "GPT-3.5 Turbo", value: "gpt-3.5-turbo" },
  { label: "GPT-4", value: "gpt-4" },
  { label: "Claude 3 (Anthropic)", value: "claude-3" },
  { label: "LLaMA 2", value: "llama-2" },
  { label: "Mistral 7B", value: "mistral-7b" },
];

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  model,
  setModel,
}) => {
  return (
    <div className="flex justify-end">
      <select
        value={model}
        onChange={(e) => setModel(e.target.value)}
        className="border-none rounded px-3 py-1 text-sm bg-background"
      >
        {availableModels.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
    </div>
  );
};
