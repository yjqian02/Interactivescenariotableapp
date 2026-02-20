import { X, Check } from 'lucide-react';
import type { Scenario } from './scenarios-table';

interface ScenarioPreviewModalProps {
  scenario: Scenario;
  onClose: () => void;
  onConfirm: () => void;
}

export function ScenarioPreviewModal({ scenario, onClose, onConfirm }: ScenarioPreviewModalProps) {
  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4 bg-gray-600 bg-opacity-40" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl w-[90%] h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - Fixed/Sticky */}
        <button
          onClick={onClose}
          className="sticky top-4 right-4 float-right z-20 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg bg-white shadow-sm"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="px-12 py-8 max-w-6xl mx-auto space-y-8 clear-both">
          {/* Preview Header Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm font-medium text-blue-700">Preview Mode</span>
            <span className="text-xs text-blue-600">Review your scenario before adding it</span>
          </div>

          {/* Header Section - Title, Description, Pills */}
          <div className="space-y-4">
            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
              {scenario.scenarioTitle}
            </h1>
            
            {/* Description directly below title */}
            <p className="text-lg text-gray-600 leading-relaxed">
              {scenario.scenarioDescription}
            </p>

            {/* Pills row with IDs */}
            <div className="flex items-center gap-3 flex-wrap pt-2">
              <span className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                {scenario.sector}
              </span>
              <span className="px-3 py-1.5 bg-purple-100 text-purple-700 text-sm rounded-full font-medium">
                {scenario.categoryOfUseCase}
              </span>
              <span className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-full font-medium">
                {scenario.groupName}
              </span>
              <span className="text-gray-400">•</span>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="font-mono">{scenario.useCaseId}</span>
                <span>•</span>
                <span className="font-mono">{scenario.scenarioId}</span>
                <span>•</span>
                <span className="font-mono">{scenario.useCaseSourceId}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200"></div>

          {/* Scenario Narrative, Red-Teaming Objective, and Intended Outcomes - Three Columns */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-gray-50 border-l-4 border-gray-400 rounded-lg p-6">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                Scenario Narrative
              </h2>
              <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
                {scenario.scenarioNarrative}
              </p>
            </div>

            <div className="bg-orange-50 border-l-4 border-orange-400 rounded-lg p-6">
              <h2 className="text-sm font-semibold text-orange-700 uppercase tracking-wide mb-4">
                Red-Teaming Objective
              </h2>
              <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
                {scenario.redTeamingObjective}
              </p>
            </div>

            <div className="bg-indigo-50 border-l-4 border-indigo-400 rounded-lg p-6">
              <h2 className="text-sm font-semibold text-indigo-700 uppercase tracking-wide mb-4">
                Intended Outcomes
              </h2>
              <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
                {scenario.intendedOutcomes}
              </p>
            </div>
          </div>

          {/* Users - Two Column Clean Layout */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Direct Users
              </h2>
              <p className="text-base text-gray-700 leading-relaxed">
                {scenario.usersDirect}
              </p>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Indirect Users
              </h2>
              <p className="text-base text-gray-700 leading-relaxed">
                {scenario.usersIndirect}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8"></div>

          {/* Impact Analysis - Side by Side with Visual Distinction */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Impact Analysis</h2>
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h3 className="text-base font-semibold text-green-900">
                    Positive Impacts & Benefits
                  </h3>
                </div>
                <p className="text-base text-green-900 leading-relaxed whitespace-pre-wrap">
                  {scenario.positiveImpactsBenefits}
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <h3 className="text-base font-semibold text-red-900">
                    Negative Impacts & Risk
                  </h3>
                </div>
                <p className="text-base text-red-900 leading-relaxed whitespace-pre-wrap">
                  {scenario.negativeImpactsRisk}
                </p>
              </div>
            </div>
          </div>

          {/* KPIs and Metrics */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3">
              KPIs and Metrics
            </h2>
            <p className="text-base text-gray-800 leading-relaxed">
              {scenario.kpisAndMetrics}
            </p>
          </div>
        </div>

        {/* Footer with Confirm Button - Sticky */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-5 flex items-center justify-end gap-4 shadow-lg">
          <button
            onClick={onClose}
            className="px-6 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Go Back & Edit
          </button>
          <button
            onClick={onConfirm}
            className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Check className="w-5 h-5" />
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}