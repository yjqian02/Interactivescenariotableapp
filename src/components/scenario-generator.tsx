import { useState, useRef } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import type { Scenario } from './scenarios-table';
import { EditableScenarioPreviewModal } from './editable-scenario-preview-modal';

interface ScenarioGeneratorProps {
  onScenarioAdded?: (scenario: Scenario) => void;
}

export function ScenarioGenerator({ onScenarioAdded }: ScenarioGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  
  // Required fields
  const [sector, setSector] = useState('');
  const [categoryOfUseCase, setCategoryOfUseCase] = useState('');
  const [intendedOutcome, setIntendedOutcome] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScenarios, setGeneratedScenarios] = useState<Scenario[]>([]);
  const [addedScenarioIds, setAddedScenarioIds] = useState<Set<string>>(new Set());
  
  // Preview modal state
  const [previewScenario, setPreviewScenario] = useState<Scenario | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Ref for scrolling to results
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleConfirmScenario = (editedScenario: Scenario) => {
    onScenarioAdded?.(editedScenario);
    setAddedScenarioIds(prev => new Set([...prev, editedScenario.scenarioId]));
    setIsPreviewOpen(false);
  };

  const handleAddScenarioDirect = (scenario: Scenario) => {
    onScenarioAdded?.(scenario);
    setAddedScenarioIds(prev => new Set([...prev, scenario.scenarioId]));
  };

  const handleAddAllScenarios = () => {
    generatedScenarios.forEach(scenario => {
      if (!addedScenarioIds.has(scenario.scenarioId)) {
        onScenarioAdded?.(scenario);
        setAddedScenarioIds(prev => new Set([...prev, scenario.scenarioId]));
      }
    });
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !sector.trim() || !categoryOfUseCase.trim() || !intendedOutcome.trim()) {
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Parse prompt for context
    const promptLower = prompt.toLowerCase();
    const detectedSector = sector || detectSector(promptLower);
    const detectedCategory = categoryOfUseCase || detectCategory(promptLower);
    
    // Mock AI-generated scenarios based on inputs
    const mockGenerated: Scenario[] = [
      {
        useCaseId: `UC-${Date.now()}-1`,
        scenarioId: `SC-${Date.now()}-1`,
        sector: detectedSector,
        categoryOfUseCase: detectedCategory,
        groupName: 'General Group',
        scenarioTitle: generateTitleFromPrompt(prompt, detectedSector, detectedCategory),
        scenarioDescription: generateDescriptionFromPrompt(prompt),
        scenarioNarrative: generateNarrativeFromPrompt(prompt, detectedSector),
        redTeamingObjective: extractObjectiveFromPrompt(prompt),
        usersDirect: generateDirectUsers(detectedSector),
        usersIndirect: generateIndirectUsers(detectedSector),
        intendedOutcomes: intendedOutcome,
        positiveImpactsBenefits: 'Enhanced preparedness, improved team coordination, increased confidence in handling real situations',
        negativeImpactsRisk: 'Potential stress during exercise, temporary resource allocation away from regular duties',
        kpisAndMetrics: 'Response time, decision accuracy, completion rate, participant satisfaction, learning retention',
        useCaseSourceId: `SRC-${Date.now()}`,
        tags: generateTagsFromPrompt(prompt, detectedSector)
      },
      {
        useCaseId: `UC-${Date.now()}-2`,
        scenarioId: `SC-${Date.now()}-2`,
        sector: detectedSector,
        categoryOfUseCase: detectedCategory,
        groupName: 'General Group',
        scenarioTitle: generateAlternativeTitleFromPrompt(prompt, detectedSector, detectedCategory),
        scenarioDescription: generateAlternativeDescriptionFromPrompt(prompt),
        scenarioNarrative: generateAlternativeNarrativeFromPrompt(prompt, detectedSector),
        redTeamingObjective: extractAlternativeObjectiveFromPrompt(prompt),
        usersDirect: generateDirectUsers(detectedSector),
        usersIndirect: generateIndirectUsers(detectedSector),
        intendedOutcomes: 'Effective problem-solving under pressure with collaborative decision-making',
        positiveImpactsBenefits: 'Stronger cross-functional teamwork, practical skill development, real-world experience',
        negativeImpactsRisk: 'Initial learning curve, possible confusion with complex scenarios, time commitment required',
        kpisAndMetrics: 'Collaboration score, problem resolution time, quality of outcomes, stakeholder satisfaction',
        useCaseSourceId: `SRC-${Date.now()}`,
        tags: generateTagsFromPrompt(prompt, detectedSector)
      },
      {
        useCaseId: `UC-${Date.now()}-3`,
        scenarioId: `SC-${Date.now()}-3`,
        sector: detectedSector,
        categoryOfUseCase: `Advanced ${detectedCategory}`,
        groupName: 'General Group',
        scenarioTitle: generateAdvancedTitleFromPrompt(prompt, detectedSector),
        scenarioDescription: generateAdvancedDescriptionFromPrompt(prompt),
        scenarioNarrative: generateAdvancedNarrativeFromPrompt(prompt, detectedSector),
        redTeamingObjective: 'Challenge strategic thinking, test crisis management protocols, and evaluate leadership under uncertainty',
        usersDirect: generateSeniorUsers(detectedSector),
        usersIndirect: 'All departments, external stakeholders, regulatory bodies',
        intendedOutcomes: 'Strategic insights, advanced competency development, organizational resilience improvement',
        positiveImpactsBenefits: 'Leadership development, innovation capacity, competitive advantage, systemic improvement',
        negativeImpactsRisk: 'High complexity requiring significant preparation, substantial resource investment, potential for realistic stress scenarios',
        kpisAndMetrics: 'Strategic objective achievement, innovation metrics, long-term impact assessment, competency advancement scores, organizational readiness index',
        useCaseSourceId: `SRC-${Date.now()}`,
        tags: [...generateTagsFromPrompt(prompt, detectedSector), 'advanced', 'strategic']
      }
    ];
    
    setGeneratedScenarios(mockGenerated);
    setIsGenerating(false);
    
    // Scroll to results
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleGenerate();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Main Prompt Area */}
      <div className="space-y-4">
        {/* Required Fields First - Sector, Category, Intended Outcome */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sector <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              placeholder="e.g., Healthcare"
              className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={categoryOfUseCase}
              onChange={(e) => setCategoryOfUseCase(e.target.value)}
              placeholder="e.g., Emergency Response"
              className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Intended Outcome <span className="text-red-500">*</span>
          </label>
          <textarea
            value={intendedOutcome}
            onChange={(e) => setIntendedOutcome(e.target.value)}
            placeholder="e.g., Improved response time, reduced errors, better coordination between teams"
            rows={3}
            className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-900 mb-3">
            Describe the scenario you need <span className="text-red-500">*</span>
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Example: Create a healthcare emergency response scenario for testing crisis protocols in a hospital setting. Focus on coordinating multiple teams during a mass casualty event."
            rows={6}
            className="w-full px-5 py-4 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all"
          />
          <p className="mt-2 text-sm text-gray-500">
            💡 Tip: Be specific about the context, objectives, and who will be involved.
          </p>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim() || !sector.trim() || !categoryOfUseCase.trim() || !intendedOutcome.trim()}
          className="w-full px-8 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 text-lg font-semibold shadow-lg hover:shadow-xl"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Generating your scenarios...
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6" />
              Generate Scenarios with AI
            </>
          )}
        </button>
      </div>

      {/* Generated Results */}
      {generatedScenarios.length > 0 && (
        <div className="pt-8 border-t border-gray-200" ref={resultsRef}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              Generated Scenarios ({generatedScenarios.length})
            </h3>
            <span className="text-sm text-gray-500">Select and review scenarios below</span>
          </div>
          
          <div className="space-y-5">
            {generatedScenarios.map((scenario, index) => {
              const isAdded = addedScenarioIds.has(scenario.scenarioId);
              return (
                <div
                  key={scenario.scenarioId}
                  className={`p-6 bg-white border-2 rounded-xl transition-all ${
                    isAdded 
                      ? 'border-green-400 bg-green-50' 
                      : 'border-gray-200 hover:border-blue-400 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                          Option {index + 1}
                        </span>
                        {isAdded && (
                          <span className="px-3 py-1 bg-green-600 text-white text-sm font-semibold rounded-full flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Added to Library
                          </span>
                        )}
                        <span className="text-xs text-gray-400 font-mono">
                          {scenario.scenarioId}
                        </span>
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{scenario.scenarioTitle}</h4>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md font-medium">
                          {scenario.categoryOfUseCase}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md font-medium">
                          {scenario.sector}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-base mb-6">
                    <div>
                      <p className="text-gray-700 leading-relaxed">{scenario.scenarioDescription}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                          Red-Teaming Objective
                        </span>
                        <p className="text-sm text-gray-700">{scenario.redTeamingObjective}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                          Intended Outcomes
                        </span>
                        <p className="text-sm text-gray-700">{scenario.intendedOutcomes}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setPreviewScenario(scenario);
                        setIsPreviewOpen(true);
                      }}
                      className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      View Full Details
                    </button>
                    {isAdded ? (
                      <button
                        disabled
                        className="px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg opacity-60 cursor-not-allowed flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Added
                      </button>
                    ) : (
                      <button
                        className="px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        onClick={() => handleAddScenarioDirect(scenario)}
                      >
                        Add This Scenario
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bulk Actions */}
          <div className="mt-6 p-5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
            <p className="text-sm text-blue-900">
              <strong>Tip:</strong> You can add individual scenarios or add all {generatedScenarios.length} at once.
            </p>
            <button
              className="px-6 py-3 text-base font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              onClick={handleAddAllScenarios}
            >
              Add All Scenarios
            </button>
          </div>
        </div>
      )}
      
      {/* Preview Modal */}
      <EditableScenarioPreviewModal
        scenario={previewScenario}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onConfirm={handleConfirmScenario}
      />
    </div>
  );
}

// Helper functions to detect context from prompt
function detectSector(prompt: string): string {
  const sectors = {
    'healthcare': ['healthcare', 'hospital', 'medical', 'clinic', 'patient'],
    'finance': ['finance', 'banking', 'financial', 'investment', 'trading'],
    'technology': ['technology', 'software', 'IT', 'tech', 'cybersecurity'],
    'education': ['education', 'school', 'university', 'teaching', 'learning'],
    'retail': ['retail', 'store', 'customer', 'sales', 'shopping'],
    'manufacturing': ['manufacturing', 'factory', 'production', 'assembly']
  };

  for (const [sector, keywords] of Object.entries(sectors)) {
    if (keywords.some(keyword => prompt.includes(keyword))) {
      return sector.charAt(0).toUpperCase() + sector.slice(1);
    }
  }
  return 'General';
}

function detectCategory(prompt: string): string {
  const categories = {
    'Emergency Response': ['emergency', 'crisis', 'urgent', 'critical'],
    'Customer Service': ['customer', 'service', 'support', 'client'],
    'Training': ['training', 'learning', 'practice', 'exercise'],
    'Security': ['security', 'threat', 'breach', 'attack'],
    'Operations': ['operations', 'operational', 'process', 'workflow']
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => prompt.includes(keyword))) {
      return category;
    }
  }
  return 'Training';
}

function generateTitleFromPrompt(prompt: string, sector: string, category: string): string {
  const firstSentence = prompt.split('.')[0].trim();
  if (firstSentence.length > 80) {
    return `${sector} ${category}: ${firstSentence.substring(0, 70)}...`;
  }
  return `${sector} ${category}: ${firstSentence}`;
}

function generateAlternativeTitleFromPrompt(prompt: string, sector: string, category: string): string {
  return `Advanced ${category} Scenario for ${sector} Teams`;
}

function generateAdvancedTitleFromPrompt(prompt: string, sector: string): string {
  return `Complex Multi-Stakeholder ${sector} Simulation`;
}

function generateDescriptionFromPrompt(prompt: string): string {
  const sentences = prompt.split('.').filter(s => s.trim().length > 0);
  return sentences.slice(0, 2).join('.') + '.';
}

function generateAlternativeDescriptionFromPrompt(prompt: string): string {
  return `An immersive training exercise designed around real-world challenges. ${prompt.split('.')[0]}.`;
}

function generateAdvancedDescriptionFromPrompt(prompt: string): string {
  return `A sophisticated, multi-layered scenario that combines strategic decision-making with operational challenges. ${prompt.split('.')[0]}.`;
}

function generateNarrativeFromPrompt(prompt: string, sector: string): string {
  return `${prompt} The scenario unfolds in real-time, requiring participants to adapt their strategies as new information becomes available and challenges evolve.`;
}

function generateAlternativeNarrativeFromPrompt(prompt: string, sector: string): string {
  return `Teams face a dynamic situation where ${prompt.toLowerCase()} They must coordinate effectively, manage resources efficiently, and maintain clear communication throughout the exercise.`;
}

function generateAdvancedNarrativeFromPrompt(prompt: string, sector: string): string {
  return `In this complex environment, ${prompt.toLowerCase()} Leaders must navigate uncertainty, balance competing priorities, and make high-stakes decisions that will have cascading effects across the organization.`;
}

function extractObjectiveFromPrompt(prompt: string): string {
  if (prompt.toLowerCase().includes('test')) {
    return prompt.split('.')[0].trim();
  }
  return `Test organizational response and validate protocols based on: ${prompt.split('.')[0].toLowerCase()}`;
}

function extractAlternativeObjectiveFromPrompt(prompt: string): string {
  return 'Evaluate decision-making under pressure, team coordination, and problem-solving capabilities';
}

function generateDirectUsers(sector: string): string {
  const userMap: Record<string, string> = {
    'Healthcare': 'Medical staff, nurses, doctors, emergency responders',
    'Finance': 'Traders, analysts, risk managers, compliance officers',
    'Technology': 'Engineers, developers, security team, IT administrators',
    'Education': 'Teachers, administrators, support staff',
    'Retail': 'Store managers, sales associates, customer service representatives',
    'Manufacturing': 'Production supervisors, quality control, operations team'
  };
  return userMap[sector] || 'Team leaders, project managers, frontline staff';
}

function generateIndirectUsers(sector: string): string {
  const userMap: Record<string, string> = {
    'Healthcare': 'Patients, visitors, administrative staff, support services',
    'Finance': 'Clients, investors, regulatory bodies, back-office staff',
    'Technology': 'End users, business stakeholders, management',
    'Education': 'Students, parents, community members',
    'Retail': 'Customers, suppliers, regional management',
    'Manufacturing': 'Supply chain partners, distribution teams, corporate leadership'
  };
  return userMap[sector] || 'Support staff, stakeholders, external partners';
}

function generateSeniorUsers(sector: string): string {
  const userMap: Record<string, string> = {
    'Healthcare': 'Chief Medical Officer, hospital administrators, department heads',
    'Finance': 'C-suite executives, senior traders, risk committee members',
    'Technology': 'CTO, engineering directors, security leadership',
    'Education': 'Principal, academic directors, board members',
    'Retail': 'Regional directors, merchandising executives, operations leadership',
    'Manufacturing': 'Plant managers, operations directors, executive leadership'
  };
  return userMap[sector] || 'Senior leadership, executive team, strategic decision-makers';
}

function generateTagsFromPrompt(prompt: string, sector: string): string[] {
  const baseTags = ['ai-generated', 'simulation'];
  const sectorTag = sector.toLowerCase().replace(/\s+/g, '-');
  
  const additionalTags: string[] = [];
  if (prompt.toLowerCase().includes('emergency')) additionalTags.push('emergency');
  if (prompt.toLowerCase().includes('crisis')) additionalTags.push('crisis');
  if (prompt.toLowerCase().includes('training')) additionalTags.push('training');
  
  return [...baseTags, sectorTag, ...additionalTags].filter(Boolean);
}