import { useState } from 'react';
import { X, Sparkles, FileEdit, Upload } from 'lucide-react';
import { Scenario } from './scenarios-table';

interface QuickCreateModalProps {
  onClose: () => void;
  onScenarioAdded: (scenario: Scenario) => void;
}

export function QuickCreateModal({ onClose, onScenarioAdded }: QuickCreateModalProps) {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateDraft = async () => {
    if (!description.trim()) return;
    
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      const newScenario: Scenario = {
        useCaseId: `FIN-U${String(Math.floor(Math.random() * 100)).padStart(3, '0')}`,
        scenarioId: `FIN-U${String(Math.floor(Math.random() * 100)).padStart(3, '0')}-S${String(Math.floor(Math.random() * 100)).padStart(3, '0')}`,
        sector: 'Finance',
        categoryOfUseCase: 'AI Generated',
        groupName: 'Generated',
        scenarioTitle: description.slice(0, 60),
        scenarioDescription: description,
        scenarioNarrative: `Generated narrative for: ${description}`,
        redTeamingObjective: 'Test AI-generated scenario for vulnerabilities',
        usersDirect: 'Security Analysts',
        usersIndirect: 'Compliance Teams',
        intendedOutcomes: 'Identify security gaps',
        positiveImpactsBenefits: 'Improved security posture',
        negativeImpactsRisk: 'Potential false positives',
        kpisAndMetrics: 'Detection rate, false positive rate',
        useCaseSourceId: 'AI-GEN-001'
      };
      onScenarioAdded(newScenario);
      setIsGenerating(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-end z-50">
      <div className="w-[420px] h-full bg-white border-l border-gray-200 flex flex-col animate-in slide-in-from-right">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="text-gray-900 font-semibold">Quick Create Scenario</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-6 overflow-y-auto">
          <div className="space-y-6">
            {/* AI Generator Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-blue-600 text-sm font-medium">AI GENERATOR</span>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your attack objective..."
                className="w-full h-32 bg-gray-50 text-gray-900 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder:text-gray-400"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateDraft}
              disabled={!description.trim() || isGenerating}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 transition-colors font-medium"
            >
              {isGenerating ? 'Generating...' : 'Generate Draft'}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-500">OR</span>
              </div>
            </div>

            {/* Manual Options */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={onClose}
                className="py-8 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-colors flex flex-col items-center gap-3"
              >
                <div className="w-10 h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center">
                  <FileEdit className="w-5 h-5 text-gray-600" />
                </div>
                <span className="text-gray-900 text-sm font-medium">Manual Wizard</span>
              </button>

              <button 
                onClick={onClose}
                className="py-8 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-colors flex flex-col items-center gap-3"
              >
                <div className="w-10 h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center">
                  <Upload className="w-5 h-5 text-gray-600" />
                </div>
                <span className="text-gray-900 text-sm font-medium">Bulk Import</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 text-xs text-gray-500 flex items-center gap-2">
          <span>PRESS</span>
          <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300">⌘</kbd>
          <span>+</span>
          <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300">⏎</kbd>
          <span>FOR NEW</span>
        </div>
      </div>
    </div>
  );
}