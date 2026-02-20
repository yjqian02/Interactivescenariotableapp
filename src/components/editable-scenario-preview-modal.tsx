import { useState, useEffect } from 'react';
import { X, Check, Edit3 } from 'lucide-react';
import type { Scenario } from './scenarios-table';

interface EditableScenarioPreviewModalProps {
  scenario: Scenario | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (editedScenario: Scenario) => void;
}

export function EditableScenarioPreviewModal({ scenario, isOpen, onClose, onConfirm }: EditableScenarioPreviewModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedScenario, setEditedScenario] = useState<Scenario | null>(null);

  useEffect(() => {
    if (scenario) {
      setEditedScenario(scenario);
      setIsEditing(false);
    }
  }, [scenario]);

  if (!isOpen || !scenario || !editedScenario) return null;

  const handleConfirm = () => {
    onConfirm(editedScenario);
    setIsEditing(false);
  };

  const updateField = (field: keyof Scenario, value: string) => {
    setEditedScenario(prev => prev ? { ...prev, [field]: value } : null);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-600 bg-opacity-40" onClick={onClose}>
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
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-sm font-medium text-blue-700">
                {isEditing ? 'Editing Mode' : 'Preview Mode'}
              </span>
              <span className="text-xs text-blue-600">
                {isEditing ? 'Make changes to your AI-generated scenario' : 'Review your scenario before adding it'}
              </span>
            </div>
            
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Edit Scenario
              </button>
            )}
          </div>

          {/* Header Section - Title, Description, Pills */}
          <div className="space-y-4">
            {/* Title */}
            {isEditing ? (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Scenario Title
                </label>
                <input
                  type="text"
                  value={editedScenario.scenarioTitle}
                  onChange={(e) => updateField('scenarioTitle', e.target.value)}
                  className="w-full text-3xl font-bold text-gray-900 leading-tight border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            ) : (
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                {editedScenario.scenarioTitle}
              </h1>
            )}
            
            {/* Description */}
            {isEditing ? (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Description
                </label>
                <textarea
                  value={editedScenario.scenarioDescription}
                  onChange={(e) => updateField('scenarioDescription', e.target.value)}
                  rows={3}
                  className="w-full text-lg text-gray-600 leading-relaxed border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
            ) : (
              <p className="text-lg text-gray-600 leading-relaxed">
                {editedScenario.scenarioDescription}
              </p>
            )}

            {/* Pills row with IDs */}
            {isEditing ? (
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Sector
                  </label>
                  <input
                    type="text"
                    value={editedScenario.sector}
                    onChange={(e) => updateField('sector', e.target.value)}
                    className="w-full text-sm border-2 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editedScenario.categoryOfUseCase}
                    onChange={(e) => updateField('categoryOfUseCase', e.target.value)}
                    className="w-full text-sm border-2 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Group Name
                  </label>
                  <input
                    type="text"
                    value={editedScenario.groupName}
                    onChange={(e) => updateField('groupName', e.target.value)}
                    className="w-full text-sm border-2 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 flex-wrap pt-2">
                <span className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                  {editedScenario.sector}
                </span>
                <span className="px-3 py-1.5 bg-purple-100 text-purple-700 text-sm rounded-full font-medium">
                  {editedScenario.categoryOfUseCase}
                </span>
                <span className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-full font-medium">
                  {editedScenario.groupName}
                </span>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="font-mono">{editedScenario.useCaseId}</span>
                  <span>•</span>
                  <span className="font-mono">{editedScenario.scenarioId}</span>
                  <span>•</span>
                  <span className="font-mono">{editedScenario.useCaseSourceId}</span>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200"></div>

          {/* Scenario Narrative, Red-Teaming Objective, and Intended Outcomes - Three Columns */}
          <div className="grid grid-cols-3 gap-6">
            <div className={`bg-gray-50 border-l-4 border-gray-400 rounded-lg p-6 ${isEditing ? 'ring-2 ring-gray-300' : ''}`}>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                Scenario Narrative
              </h2>
              {isEditing ? (
                <textarea
                  value={editedScenario.scenarioNarrative}
                  onChange={(e) => updateField('scenarioNarrative', e.target.value)}
                  rows={6}
                  className="w-full text-base text-gray-900 leading-relaxed border-2 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white"
                />
              ) : (
                <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
                  {editedScenario.scenarioNarrative}
                </p>
              )}
            </div>

            <div className={`bg-orange-50 border-l-4 border-orange-400 rounded-lg p-6 ${isEditing ? 'ring-2 ring-orange-300' : ''}`}>
              <h2 className="text-sm font-semibold text-orange-700 uppercase tracking-wide mb-4">
                Red-Teaming Objective
              </h2>
              {isEditing ? (
                <textarea
                  value={editedScenario.redTeamingObjective}
                  onChange={(e) => updateField('redTeamingObjective', e.target.value)}
                  rows={6}
                  className="w-full text-base text-gray-900 leading-relaxed border-2 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white"
                />
              ) : (
                <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
                  {editedScenario.redTeamingObjective}
                </p>
              )}
            </div>

            <div className={`bg-indigo-50 border-l-4 border-indigo-400 rounded-lg p-6 ${isEditing ? 'ring-2 ring-indigo-300' : ''}`}>
              <h2 className="text-sm font-semibold text-indigo-700 uppercase tracking-wide mb-4">
                Intended Outcomes
              </h2>
              {isEditing ? (
                <textarea
                  value={editedScenario.intendedOutcomes}
                  onChange={(e) => updateField('intendedOutcomes', e.target.value)}
                  rows={6}
                  className="w-full text-base text-gray-900 leading-relaxed border-2 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white"
                />
              ) : (
                <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
                  {editedScenario.intendedOutcomes}
                </p>
              )}
            </div>
          </div>

          {/* Users - Two Column Clean Layout */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Direct Users
              </h2>
              {isEditing ? (
                <textarea
                  value={editedScenario.usersDirect}
                  onChange={(e) => updateField('usersDirect', e.target.value)}
                  rows={3}
                  className="w-full text-base text-gray-700 leading-relaxed border-2 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              ) : (
                <p className="text-base text-gray-700 leading-relaxed">
                  {editedScenario.usersDirect}
                </p>
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Indirect Users
              </h2>
              {isEditing ? (
                <textarea
                  value={editedScenario.usersIndirect}
                  onChange={(e) => updateField('usersIndirect', e.target.value)}
                  rows={3}
                  className="w-full text-base text-gray-700 leading-relaxed border-2 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              ) : (
                <p className="text-base text-gray-700 leading-relaxed">
                  {editedScenario.usersIndirect}
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8"></div>

          {/* Impact Analysis - Side by Side with Visual Distinction */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Impact Analysis</h2>
            <div className="grid grid-cols-2 gap-8">
              <div className={`bg-green-50 border border-green-200 rounded-xl p-6 ${isEditing ? 'ring-2 ring-green-300' : ''}`}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h3 className="text-base font-semibold text-green-900">
                    Positive Impacts & Benefits
                  </h3>
                </div>
                {isEditing ? (
                  <textarea
                    value={editedScenario.positiveImpactsBenefits}
                    onChange={(e) => updateField('positiveImpactsBenefits', e.target.value)}
                    rows={4}
                    className="w-full text-base text-green-900 leading-relaxed border-2 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white"
                  />
                ) : (
                  <p className="text-base text-green-900 leading-relaxed whitespace-pre-wrap">
                    {editedScenario.positiveImpactsBenefits}
                  </p>
                )}
              </div>
              <div className={`bg-red-50 border border-red-200 rounded-xl p-6 ${isEditing ? 'ring-2 ring-red-300' : ''}`}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <h3 className="text-base font-semibold text-red-900">
                    Negative Impacts & Risk
                  </h3>
                </div>
                {isEditing ? (
                  <textarea
                    value={editedScenario.negativeImpactsRisk}
                    onChange={(e) => updateField('negativeImpactsRisk', e.target.value)}
                    rows={4}
                    className="w-full text-base text-red-900 leading-relaxed border-2 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white"
                  />
                ) : (
                  <p className="text-base text-red-900 leading-relaxed whitespace-pre-wrap">
                    {editedScenario.negativeImpactsRisk}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* KPIs and Metrics */}
          <div className={`bg-blue-50 border border-blue-200 rounded-xl p-6 ${isEditing ? 'ring-2 ring-blue-300' : ''}`}>
            <h2 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3">
              KPIs and Metrics
            </h2>
            {isEditing ? (
              <textarea
                value={editedScenario.kpisAndMetrics}
                onChange={(e) => updateField('kpisAndMetrics', e.target.value)}
                rows={3}
                className="w-full text-base text-gray-800 leading-relaxed border-2 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white"
              />
            ) : (
              <p className="text-base text-gray-800 leading-relaxed">
                {editedScenario.kpisAndMetrics}
              </p>
            )}
          </div>
        </div>

        {/* Footer with Confirm Button - Sticky */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-5 flex items-center justify-end gap-4 shadow-lg">
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setEditedScenario(scenario);
                  setIsEditing(false);
                }}
                className="px-6 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel Edits
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Check className="w-5 h-5" />
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-6 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={handleConfirm}
                className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Check className="w-5 h-5" />
                Confirm & Add Scenario
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
