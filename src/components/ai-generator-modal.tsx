import { X } from 'lucide-react';
import { ScenarioGenerator } from './scenario-generator';
import type { Scenario } from './scenarios-table';

interface AIGeneratorModalProps {
  onClose: () => void;
  onScenarioAdded?: (scenario: Scenario) => void;
}

export function AIGeneratorModal({ onClose, onScenarioAdded }: AIGeneratorModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-600 bg-opacity-40" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl w-[90%] h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between z-10">
          <h2 className="text-3xl font-semibold text-gray-900">Generate Scenarios with AI</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <ScenarioGenerator 
            onScenarioAdded={(scenario) => {
              onScenarioAdded?.(scenario);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}