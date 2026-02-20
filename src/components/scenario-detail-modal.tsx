import { X, Maximize2, ArrowLeft, ChevronLeft, ChevronRight, Edit2, Trash2, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Scenario } from './scenarios-table';

interface ScenarioDetailModalProps {
  scenario: Scenario;
  onClose: () => void;
  onExpand?: () => void;
  isFullScreen?: boolean;
  onDelete?: (scenarioId: string) => void;
  onUpdate?: (scenario: Scenario) => void;
}

export function ScenarioDetailModal({ scenario, onClose, onExpand, isFullScreen = false, onDelete, onUpdate }: ScenarioDetailModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedScenario, setEditedScenario] = useState<Scenario>(scenario);

  // Sync editedScenario with scenario prop when it changes
  useEffect(() => {
    setEditedScenario(scenario);
  }, [scenario]);

  const handleDelete = () => {
    if (onDelete) {
      onDelete(scenario.scenarioId);
      onClose();
    }
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(editedScenario);
      setIsEditing(false);
    }
  };

  // Render as full page when expanded
  if (isFullScreen) {
    return (
      <div className="h-screen flex flex-col bg-gray-50 overflow-hidden animate-fadeIn">
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-8 md:px-12 lg:px-20 py-12 max-w-7xl mx-auto">
            <ScenarioContent 
              scenario={isEditing ? editedScenario : scenario} 
              onBack={onClose} 
              isFullScreen={true}
              isEditing={isEditing}
              onEdit={() => setIsEditing(true)}
              onSave={handleSave}
              onCancel={() => {
                setIsEditing(false);
                setEditedScenario(scenario);
              }}
              onDelete={() => setShowDeleteConfirm(true)}
              onChange={setEditedScenario}
            />
          </div>
        </div>
        
        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Scenario?</h3>
              <p className="text-gray-600 mb-6">This action cannot be undone. Are you sure you want to delete this scenario?</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render as modal when not expanded
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-7xl h-[92vh] overflow-hidden flex flex-col relative transform transition-all duration-300 ease-out animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
          <button
            onClick={onExpand}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="text-sm font-medium">Expand</span>
          </button>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-8 md:px-12 lg:px-20 py-12 max-w-7xl mx-auto">
            <ScenarioContent 
              scenario={isEditing ? editedScenario : scenario} 
              isFullScreen={false}
              isEditing={isEditing}
              onEdit={() => setIsEditing(true)}
              onSave={handleSave}
              onCancel={() => {
                setIsEditing(false);
                setEditedScenario(scenario);
              }}
              onDelete={() => setShowDeleteConfirm(true)}
              onChange={setEditedScenario}
            />
          </div>
        </div>
        
        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Scenario?</h3>
              <p className="text-gray-600 mb-6">This action cannot be undone. Are you sure you want to delete this scenario?</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Carousel component for main narrative sections
function NarrativeCarousel({ scenario, isEditing, onChange }: { scenario: Scenario; isEditing?: boolean; onChange?: (scenario: Scenario) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = [
    {
      title: 'Red-Teaming Objective',
      subtitle: 'Critical threat scenario',
      content: scenario.redTeamingObjective,
      field: 'redTeamingObjective' as keyof Scenario,
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      color: 'bg-red-500'
    },
    {
      title: 'Scenario Narrative',
      subtitle: 'Detailed story & context',
      content: scenario.scenarioNarrative,
      field: 'scenarioNarrative' as keyof Scenario,
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'bg-gray-800'
    },
    {
      title: 'Intended Outcomes',
      subtitle: 'Expected results',
      content: scenario.intendedOutcomes,
      field: 'intendedOutcomes' as keyof Scenario,
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-purple-500'
    }
  ];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const currentSlide = slides[currentIndex];

  return (
    <div className="relative bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Carousel Content */}
      <div className="p-8 min-h-[320px] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${currentSlide.color} rounded-lg flex items-center justify-center`}>
              {currentSlide.icon}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {currentSlide.title}
              </h2>
              <p className="text-xs text-gray-600">{currentSlide.subtitle}</p>
            </div>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevious}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isEditing && onChange ? (
          <textarea
            value={currentSlide.content}
            onChange={(e) => onChange({ ...scenario, [currentSlide.field]: e.target.value })}
            className="text-base text-gray-800 leading-relaxed flex-1 w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y min-h-[200px]"
            placeholder={currentSlide.title}
          />
        ) : (
          <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap flex-1">
            {currentSlide.content}
          </p>
        )}

        {/* Dots Indicator */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? 'w-8 bg-gray-800' : 'w-2 bg-gray-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Separate component for the scenario content to avoid duplication
function ScenarioContent({ 
  scenario, 
  onBack, 
  isFullScreen, 
  isEditing = false, 
  onEdit, 
  onSave, 
  onCancel, 
  onDelete, 
  onChange 
}: { 
  scenario: Scenario; 
  onBack?: () => void; 
  isFullScreen: boolean; 
  isEditing?: boolean; 
  onEdit?: () => void; 
  onSave?: () => void; 
  onCancel?: () => void; 
  onDelete?: () => void; 
  onChange?: (scenario: Scenario) => void 
}) {
  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="space-y-5">
        <div className="flex items-start gap-4">
          {/* Back button to the left of title - only in fullscreen */}
          {isFullScreen && onBack && (
            <button
              onClick={onBack}
              className="flex-shrink-0 p-2.5 hover:bg-gray-200 rounded-xl transition-colors text-gray-500 hover:text-gray-900 mt-1.5"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          
          <div className="flex-1 space-y-5">
            {/* IDs and Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">ID: {scenario.scenarioId}</span>
                <span className="text-gray-300">•</span>
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">Source: {scenario.useCaseSourceId}</span>
              </div>
              
              {/* Action Buttons */}
              {!isEditing && onEdit && onDelete && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={onEdit}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Edit</span>
                  </button>
                  <button
                    onClick={onDelete}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Delete</span>
                  </button>
                </div>
              )}
              
              {/* Save/Cancel Buttons when editing */}
              {isEditing && onSave && onCancel && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={onCancel}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span className="text-sm font-medium">Cancel</span>
                  </button>
                  <button
                    onClick={onSave}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span className="text-sm font-medium">Save</span>
                  </button>
                </div>
              )}
            </div>
            
            {/* Title */}
            {isEditing && onChange ? (
              <input
                type="text"
                value={scenario.scenarioTitle}
                onChange={(e) => onChange({ ...scenario, scenarioTitle: e.target.value })}
                className="text-5xl font-semibold text-gray-900 leading-tight tracking-tight w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Scenario Title"
              />
            ) : (
              <h1 className="text-5xl font-semibold text-gray-900 leading-tight tracking-tight">
                {scenario.scenarioTitle}
              </h1>
            )}
            
            {/* Description */}
            {isEditing && onChange ? (
              <textarea
                value={scenario.scenarioDescription}
                onChange={(e) => onChange({ ...scenario, scenarioDescription: e.target.value })}
                className="text-xl text-gray-600 leading-relaxed max-w-4xl w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y min-h-[100px]"
                placeholder="Scenario Description"
              />
            ) : (
              <p className="text-xl text-gray-600 leading-relaxed max-w-4xl">
                {scenario.scenarioDescription}
              </p>
            )}
            
            {/* Meta Pills */}
            {isEditing && onChange ? (
              <div className="flex items-center gap-3 flex-wrap pt-2">
                <input
                  type="text"
                  value={scenario.sector}
                  onChange={(e) => onChange({ ...scenario, sector: e.target.value })}
                  className="px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border-2 border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Sector"
                />
                <input
                  type="text"
                  value={scenario.categoryOfUseCase}
                  onChange={(e) => onChange({ ...scenario, categoryOfUseCase: e.target.value })}
                  className="px-4 py-2 bg-purple-50 text-purple-700 text-sm font-medium rounded-lg border-2 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Category of Use Case"
                />
                <input
                  type="text"
                  value={scenario.groupName}
                  onChange={(e) => onChange({ ...scenario, groupName: e.target.value })}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="Group Name"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 flex-wrap pt-2">
                <span className="px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border border-blue-100">
                  {scenario.sector}
                </span>
                <span className="px-4 py-2 bg-purple-50 text-purple-700 text-sm font-medium rounded-lg border border-purple-100">
                  {scenario.categoryOfUseCase}
                </span>
                {scenario.groupName && (
                  <span className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg border border-gray-200">
                    {scenario.groupName}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200"></div>

      {/* Main Content - Mixed Layout */}
      <div className="space-y-12">
        {/* Carousel - Main Narrative Sections */}
        <NarrativeCarousel scenario={scenario} isEditing={isEditing} onChange={onChange} />

        {/* Stakeholders Section */}
        <div className="space-y-5">
          <h2 className="text-2xl font-semibold text-gray-900">Stakeholders</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Direct Users
                  </h3>
                  <p className="text-xs text-gray-600">Primary stakeholders</p>
                </div>
              </div>
              {isEditing && onChange ? (
                <textarea
                  value={scenario.usersDirect}
                  onChange={(e) => onChange({ ...scenario, usersDirect: e.target.value })}
                  className="w-full text-base text-gray-800 leading-relaxed border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y min-h-[120px]"
                  placeholder="Enter comma-separated direct users"
                />
              ) : (
                <div className="space-y-3">
                  {scenario.usersDirect.split(',').map((user, index) => (
                    <div key={index} className="flex items-start gap-2 py-1">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-base text-gray-800 leading-relaxed flex-1">
                        {user.trim()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Indirect Users
                  </h3>
                  <p className="text-xs text-gray-600">Secondary stakeholders</p>
                </div>
              </div>
              {isEditing && onChange ? (
                <textarea
                  value={scenario.usersIndirect}
                  onChange={(e) => onChange({ ...scenario, usersIndirect: e.target.value })}
                  className="w-full text-base text-gray-800 leading-relaxed border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y min-h-[120px]"
                  placeholder="Enter comma-separated indirect users"
                />
              ) : (
                <div className="space-y-3">
                  {scenario.usersIndirect.split(',').map((user, index) => (
                    <div key={index} className="flex items-start gap-2 py-1">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-base text-gray-800 leading-relaxed flex-1">
                        {user.trim()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Impact Analysis - Side by Side Grid */}
        <div className="space-y-5 mt-16">{/* Increased top margin */}
          <h2 className="text-2xl font-semibold text-gray-900">Impact Analysis</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* KPIs - Full Width at top */}
            <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    KPIs & Metrics
                  </h3>
                  <p className="text-xs text-gray-600">Key performance indicators</p>
                </div>
              </div>
              {isEditing && onChange ? (
                <textarea
                  value={scenario.kpisAndMetrics}
                  onChange={(e) => onChange({ ...scenario, kpisAndMetrics: e.target.value })}
                  className="w-full text-base text-gray-800 leading-relaxed border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y min-h-[120px]"
                  placeholder="Enter semicolon-separated KPIs and metrics"
                />
              ) : (
                <div className="space-y-1">
                  {scenario.kpisAndMetrics.split(';').map((kpi, index) => (
                    <div key={index} className="flex items-start gap-2 py-1">
                      <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-base text-gray-800 leading-relaxed flex-1">
                        {kpi.trim()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Positive Impacts
                  </h3>
                  <p className="text-xs text-gray-600">Benefits & opportunities</p>
                </div>
              </div>
              {isEditing && onChange ? (
                <textarea
                  value={scenario.positiveImpactsBenefits}
                  onChange={(e) => onChange({ ...scenario, positiveImpactsBenefits: e.target.value })}
                  className="w-full text-base text-gray-800 leading-relaxed border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y min-h-[120px]"
                  placeholder="Enter semicolon-separated positive impacts"
                />
              ) : (
                <div className="space-y-1">
                  {scenario.positiveImpactsBenefits.split(';').map((impact, index) => (
                    <div key={index} className="flex items-start gap-2 py-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-base text-gray-800 leading-relaxed flex-1">
                        {impact.trim()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Negative Impacts
                  </h3>
                  <p className="text-xs text-gray-600">Risks & challenges</p>
                </div>
              </div>
              {isEditing && onChange ? (
                <textarea
                  value={scenario.negativeImpactsRisk}
                  onChange={(e) => onChange({ ...scenario, negativeImpactsRisk: e.target.value })}
                  className="w-full text-base text-gray-800 leading-relaxed border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y min-h-[120px]"
                  placeholder="Enter semicolon-separated negative impacts"
                />
              ) : (
                <div className="space-y-1">
                  {scenario.negativeImpactsRisk.split(';').map((impact, index) => (
                    <div key={index} className="flex items-start gap-2 py-1">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-base text-gray-800 leading-relaxed flex-1">
                        {impact.trim()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}