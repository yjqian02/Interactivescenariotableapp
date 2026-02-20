import { useState, useRef } from 'react';
import { X, FileEdit, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { Scenario } from './scenarios-table';
import * as XLSX from 'xlsx';

interface AddScenarioModalProps {
  onClose: () => void;
  onScenarioAdded: (scenario: Scenario) => void;
  onScenariosAdded?: (scenarios: Scenario[]) => void;
}

type UploadState = 'idle' | 'uploading' | 'success' | 'error';
type ViewMode = 'choice' | 'manual-form' | 'ai-form' | 'ai-preview';
type AIGenerationState = 'idle' | 'generating' | 'success' | 'error';

interface FormData {
  useCaseId: string;
  scenarioId: string;
  sector: string;
  categoryOfUseCase: string;
  groupName: string;
  scenarioTitle: string;
  scenarioDescription: string;
  scenarioNarrative: string;
  redTeamingObjective: string;
  usersDirect: string;
  usersIndirect: string;
  intendedOutcomes: string;
  positiveImpactsBenefits: string;
  negativeImpactsRisk: string;
  kpisAndMetrics: string;
  useCaseSourceId: string;
}

interface AIFormData {
  sector: string;
  useCase: string;
  objective: string;
  additionalContext: string;
}

const INITIAL_FORM_DATA: FormData = {
  useCaseId: '',
  scenarioId: '',
  sector: '',
  categoryOfUseCase: '',
  groupName: '',
  scenarioTitle: '',
  scenarioDescription: '',
  scenarioNarrative: '',
  redTeamingObjective: '',
  usersDirect: '',
  usersIndirect: '',
  intendedOutcomes: '',
  positiveImpactsBenefits: '',
  negativeImpactsRisk: '',
  kpisAndMetrics: '',
  useCaseSourceId: '',
};

const INITIAL_AI_FORM_DATA: AIFormData = {
  sector: '',
  useCase: '',
  objective: '',
  additionalContext: '',
};

export function AddScenarioModal({ onClose, onScenarioAdded, onScenariosAdded }: AddScenarioModalProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('choice');
  const [uploadError, setUploadError] = useState<string>('');
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadedCount, setUploadedCount] = useState<number>(0);
  const [showRequiredColumns, setShowRequiredColumns] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // AI Generation States
  const [aiFormData, setAIFormData] = useState<AIFormData>(INITIAL_AI_FORM_DATA);
  const [aiGenerationState, setAIGenerationState] = useState<AIGenerationState>('idle');
  const [generatedScenario, setGeneratedScenario] = useState<Scenario | null>(null);
  const [aiError, setAIError] = useState<string>('');

  const handleGeneratedScenarioChange = (field: keyof Scenario, value: string) => {
    if (generatedScenario) {
      setGeneratedScenario(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx')) {
      setUploadError('Please upload an Excel file (.xlsx)');
      setUploadState('error');
      return;
    }

    setUploadState('uploading');
    setUploadError('');
    setUploadedCount(0);

    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      if (jsonData.length === 0) {
        throw new Error('Excel file is empty');
      }

      const scenarios: Scenario[] = [];
      const errors: string[] = [];

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i] as any;
        const rowNumber = i + 2;

        const requiredFields = [
          'Use Case ID', 'Scenario ID', 'Sector', 'Category of Use Case',
          'Scenario Title', 'Scenario Description', 'Scenario Narrative',
          'Red-Teaming Objective', 'Users (Direct)', 'Users (Indirect)',
          'Intended Outcomes', 'Positive Impacts/Benefits', 'Negative Impacts/Risk',
          'KPIs and Metrics', 'Use Case Source ID'
        ];

        const missingFields = requiredFields.filter(field => !row[field] || String(row[field]).trim() === '');
        
        if (missingFields.length > 0) {
          errors.push(`Row ${rowNumber}: Missing ${missingFields.join(', ')}`);
          continue;
        }

        const scenario: Scenario = {
          useCaseId: String(row['Use Case ID']).trim(),
          scenarioId: String(row['Scenario ID']).trim(),
          sector: String(row['Sector']).trim(),
          categoryOfUseCase: String(row['Category of Use Case']).trim(),
          groupName: row['Group Name'] ? String(row['Group Name']).trim() : '',
          scenarioTitle: String(row['Scenario Title']).trim(),
          scenarioDescription: String(row['Scenario Description']).trim(),
          scenarioNarrative: String(row['Scenario Narrative']).trim(),
          redTeamingObjective: String(row['Red-Teaming Objective']).trim(),
          usersDirect: String(row['Users (Direct)']).trim(),
          usersIndirect: String(row['Users (Indirect)']).trim(),
          intendedOutcomes: String(row['Intended Outcomes']).trim(),
          positiveImpactsBenefits: String(row['Positive Impacts/Benefits']).trim(),
          negativeImpactsRisk: String(row['Negative Impacts/Risk']).trim(),
          kpisAndMetrics: String(row['KPIs and Metrics']).trim(),
          useCaseSourceId: String(row['Use Case Source ID']).trim(),
        };

        scenarios.push(scenario);
      }

      if (scenarios.length === 0 && errors.length > 0) {
        throw new Error(`No valid scenarios found. ${errors[0]}`);
      }

      if (onScenariosAdded && scenarios.length > 0) {
        onScenariosAdded(scenarios);
        setUploadedCount(scenarios.length);
        setUploadState('success');
        
        setTimeout(() => {
          onClose();
        }, 2500);
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to upload file. Please check the format and try again.');
      setUploadState('error');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof FormData, string>> = {};
    
    const requiredFields: (keyof FormData)[] = [
      'useCaseId', 'scenarioId', 'sector', 'categoryOfUseCase',
      'scenarioTitle', 'scenarioDescription', 'scenarioNarrative',
      'redTeamingObjective', 'usersDirect', 'usersIndirect',
      'intendedOutcomes', 'positiveImpactsBenefits', 'negativeImpactsRisk',
      'kpisAndMetrics', 'useCaseSourceId',
    ];

    requiredFields.forEach(field => {
      if (!formData[field].trim()) {
        errors[field] = 'Required';
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const newScenario: Scenario = {
        useCaseId: formData.useCaseId.trim(),
        scenarioId: formData.scenarioId.trim(),
        sector: formData.sector.trim(),
        categoryOfUseCase: formData.categoryOfUseCase.trim(),
        groupName: formData.groupName.trim(),
        scenarioTitle: formData.scenarioTitle.trim(),
        scenarioDescription: formData.scenarioDescription.trim(),
        scenarioNarrative: formData.scenarioNarrative.trim(),
        redTeamingObjective: formData.redTeamingObjective.trim(),
        usersDirect: formData.usersDirect.trim(),
        usersIndirect: formData.usersIndirect.trim(),
        intendedOutcomes: formData.intendedOutcomes.trim(),
        positiveImpactsBenefits: formData.positiveImpactsBenefits.trim(),
        negativeImpactsRisk: formData.negativeImpactsRisk.trim(),
        kpisAndMetrics: formData.kpisAndMetrics.trim(),
        useCaseSourceId: formData.useCaseSourceId.trim(),
      };

      onScenarioAdded(newScenario);
      setUploadState('success');
      await new Promise(resolve => setTimeout(resolve, 1500));
      onClose();
    } catch (error) {
      setUploadError('Failed to add scenario. Please try again.');
      setUploadState('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleManualEntry = () => {
    setViewMode('manual-form');
    setUploadState('idle');
    setUploadError('');
  };

  const handleBackToChoice = () => {
    setViewMode('choice');
    setFormData(INITIAL_FORM_DATA);
    setFormErrors({});
    setUploadState('idle');
    setUploadError('');
  };

  const handleAIFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!aiFormData.sector.trim() || !aiFormData.useCase.trim() || !aiFormData.objective.trim()) {
      setAIError('Sector, Use Case, and Objective are required.');
      return;
    }

    setAIGenerationState('generating');
    setAIError('');
    setIsSubmitting(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Simulate AI generation - Replace with actual API call
      const newScenario: Scenario = {
        useCaseId: 'AI-U001',
        scenarioId: 'AI-U001-S001',
        sector: aiFormData.sector.trim(),
        categoryOfUseCase: aiFormData.useCase.trim(),
        groupName: '',
        scenarioTitle: `${aiFormData.useCase} Scenario`,
        scenarioDescription: `AI-generated scenario for ${aiFormData.useCase} in the ${aiFormData.sector} sector. ${aiFormData.additionalContext ? aiFormData.additionalContext.substring(0, 100) : 'This scenario was created based on your inputs.'}`,
        scenarioNarrative: aiFormData.additionalContext || 'This is an AI-generated narrative based on the provided use case and objective. The narrative describes the scenario in detail, including the context, stakeholders, and key considerations.',
        redTeamingObjective: aiFormData.objective.trim(),
        usersDirect: 'Compliance officers, Risk analysts, System administrators',
        usersIndirect: 'Executive team, Customers, Regulatory bodies, External auditors',
        intendedOutcomes: `Successful identification and mitigation of risks related to ${aiFormData.useCase}. Ensure system resilience and compliance with regulatory requirements.`,
        positiveImpactsBenefits: 'Enhanced security posture, Improved risk detection, Regulatory compliance, Stakeholder confidence',
        negativeImpactsRisk: 'Potential system vulnerabilities, Operational disruptions during testing, False positive alerts, Resource constraints',
        kpisAndMetrics: 'Detection accuracy rate, Response time to incidents, System uptime during testing, Compliance audit scores',
        useCaseSourceId: `UC-${new Date().getFullYear()}-AI-${Math.floor(Math.random() * 1000)}`,
      };

      setGeneratedScenario(newScenario);
      setAIGenerationState('success');
      
      // Automatically transition to preview
      setTimeout(() => {
        setViewMode('ai-preview');
      }, 1000);
    } catch (error) {
      setAIError('Failed to generate scenario. Please try again.');
      setAIGenerationState('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAIInputChange = (field: keyof AIFormData, value: string) => {
    setAIFormData(prev => ({ ...prev, [field]: value }));
    if (aiError) {
      setAIError('');
    }
  };

  const handleAIFormBack = () => {
    setViewMode('choice');
    setAIFormData(INITIAL_AI_FORM_DATA);
    setAIGenerationState('idle');
    setAIError('');
  };

  const handleAIFormPreview = () => {
    setViewMode('ai-preview');
  };

  const handleAIFormAdd = async () => {
    if (generatedScenario) {
      onScenarioAdded(generatedScenario);
      setUploadState('success');
      await new Promise(resolve => setTimeout(resolve, 1500));
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`w-full bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
        viewMode === 'manual-form' || viewMode === 'ai-preview' ? 'max-w-3xl max-h-[90vh]' : 
        viewMode === 'ai-form' ? 'max-w-2xl' : 
        'max-w-xl'
      }`}>
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {viewMode === 'manual-form' && (
                <button
                  onClick={handleBackToChoice}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}
              {viewMode === 'ai-form' && (
                <button
                  onClick={handleAIFormBack}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}
              {viewMode === 'ai-preview' && (
                <button
                  onClick={handleAIFormBack}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <div>
                <h2 className="text-gray-900 text-xl font-semibold">
                  {viewMode === 'manual-form' ? 'Manual Entry' : 
                   viewMode === 'ai-form' ? 'Generate with AI' :
                   viewMode === 'ai-preview' ? 'Review & Edit Scenario' :
                   'Add Scenario'}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {viewMode === 'manual-form' 
                    ? 'Fill in the required fields below'
                    : viewMode === 'ai-form'
                    ? 'Provide details for AI generation'
                    : viewMode === 'ai-preview'
                    ? 'Review and edit before adding to table'
                    : 'Choose how to create your scenario'
                  }
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              disabled={uploadState === 'uploading' || isSubmitting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'choice' ? (
          <div className="px-8 py-8">
            <div className="grid grid-cols-3 gap-4">
              <button 
                onClick={handleManualEntry}
                className="relative group"
                disabled={uploadState === 'uploading'}
              >
                <div className="h-full p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all duration-200 flex flex-col items-center text-center gap-4">
                  <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200">
                    <FileEdit className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-gray-900 font-semibold mb-1">Manual Entry</div>
                    <div className="text-xs text-gray-600 leading-relaxed">Fill out a form with scenario details</div>
                  </div>
                </div>
              </button>

              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="excel-upload"
                  disabled={uploadState === 'uploading'}
                />
                <label 
                  htmlFor="excel-upload"
                  className={`block h-full ${uploadState === 'uploading' ? 'cursor-wait' : 'cursor-pointer'} group`}
                >
                  <div className={`h-full p-6 bg-gradient-to-br from-green-50 to-green-100/50 border-2 rounded-xl transition-all duration-200 flex flex-col items-center text-center gap-4 ${
                    uploadState === 'uploading' ? 'border-blue-400 bg-blue-50' : 
                    uploadState === 'success' ? 'border-green-500 bg-green-50' : 
                    uploadState === 'error' ? 'border-red-400 bg-red-50' :
                    'border-green-200 hover:border-green-400 hover:shadow-lg'
                  }`}>
                    <div className={`w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm transition-transform duration-200 ${
                      uploadState === 'uploading' ? 'animate-pulse' : 'group-hover:scale-110'
                    }`}>
                      {uploadState === 'uploading' ? (
                        <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
                      ) : uploadState === 'success' ? (
                        <CheckCircle2 className="w-7 h-7 text-green-600" />
                      ) : uploadState === 'error' ? (
                        <AlertCircle className="w-7 h-7 text-red-600" />
                      ) : (
                        <FileSpreadsheet className="w-7 h-7 text-green-600" />
                      )}
                    </div>
                    <div>
                      <div className={`font-semibold mb-1 ${
                        uploadState === 'uploading' ? 'text-blue-700' :
                        uploadState === 'success' ? 'text-green-700' :
                        uploadState === 'error' ? 'text-red-700' :
                        'text-gray-900'
                      }`}>
                        {uploadState === 'uploading' ? 'Uploading...' : 
                         uploadState === 'success' ? `${uploadedCount} Uploaded!` : 
                         uploadState === 'error' ? 'Upload Failed' :
                         'Upload Excel'}
                      </div>
                      <div className="text-xs text-gray-600 leading-relaxed">
                        {uploadState === 'success' ? 'Successfully imported scenarios' : 
                         uploadState === 'uploading' ? 'Processing your file...' :
                         'Bulk import from spreadsheet'}
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              <button 
                onClick={() => setViewMode('ai-form')}
                className="relative group"
                disabled={uploadState === 'uploading'}
              >
                <div className="h-full p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 border-2 border-purple-200 rounded-xl hover:border-purple-400 hover:shadow-lg transition-all duration-200 flex flex-col items-center text-center gap-4">
                  <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200">
                    <Sparkles className="w-7 h-7 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-gray-900 font-semibold mb-1">Generate with AI</div>
                    <div className="text-xs text-gray-600 leading-relaxed">Let AI create scenarios for you</div>
                  </div>
                </div>
              </button>
            </div>

            {uploadState === 'error' && uploadError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-700 font-medium mb-1">Upload Error</p>
                  <p className="text-xs text-red-600">{uploadError}</p>
                </div>
              </div>
            )}

            {uploadState === 'success' && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-green-700 font-medium mb-1">Upload Successful!</p>
                  <p className="text-xs text-green-600">
                    {uploadedCount} scenario{uploadedCount !== 1 ? 's' : ''} added. New rows will be highlighted in the table.
                  </p>
                </div>
              </div>
            )}

            {(uploadState === 'idle' || uploadState === 'error') && (
              <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-start gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Excel File Requirements:</p>
                    <ul className="text-xs text-gray-600 space-y-1 mb-3">
                      <li>• File must be in <span className="font-medium">.xlsx</span> format</li>
                      <li>• Include all required column headers</li>
                      <li>• First row should contain column headers</li>
                    </ul>
                    
                    <button
                      onClick={() => setShowRequiredColumns(!showRequiredColumns)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      {showRequiredColumns ? '▼' : '▶'} View required columns
                    </button>
                    
                    {showRequiredColumns && (
                      <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                          <div className="text-gray-700">• Use Case ID</div>
                          <div className="text-gray-700">• Scenario ID</div>
                          <div className="text-gray-700">• Sector</div>
                          <div className="text-gray-700">• Category of Use Case</div>
                          <div className="text-gray-700">• Scenario Title</div>
                          <div className="text-gray-700">• Scenario Description</div>
                          <div className="text-gray-700">• Scenario Narrative</div>
                          <div className="text-gray-700">• Red-Teaming Objective</div>
                          <div className="text-gray-700">• Users (Direct)</div>
                          <div className="text-gray-700">• Users (Indirect)</div>
                          <div className="text-gray-700">• Intended Outcomes</div>
                          <div className="text-gray-700">• Positive Impacts/Benefits</div>
                          <div className="text-gray-700">• Negative Impacts/Risk</div>
                          <div className="text-gray-700">• KPIs and Metrics</div>
                          <div className="text-gray-700">• Use Case Source ID</div>
                          <div className="text-gray-500 italic">• Group Name (optional)</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : viewMode === 'ai-form' ? (
          /* AI Form */
          <form onSubmit={handleAIFormSubmit} className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <div className="max-w-2xl mx-auto space-y-5">
                {/* Context */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sector <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={aiFormData.sector}
                      onChange={(e) => handleAIInputChange('sector', e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        aiError ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Finance, Healthcare..."
                      disabled={isSubmitting}
                    />
                    {aiError && (
                      <p className="text-xs text-red-600 mt-1.5">{aiError}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={aiFormData.useCase}
                      onChange={(e) => handleAIInputChange('useCase', e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        aiError ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Lending, Fraud..."
                      disabled={isSubmitting}
                    />
                    {aiError && (
                      <p className="text-xs text-red-600 mt-1.5">{aiError}</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 my-1"></div>

                {/* Main Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Objective <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={aiFormData.objective}
                    onChange={(e) => handleAIInputChange('objective', e.target.value)}
                    rows={2}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${
                      aiError ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="What are you testing for?"
                    disabled={isSubmitting}
                  />
                  {aiError && (
                    <p className="text-xs text-red-600 mt-1.5">{aiError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Context
                  </label>
                  <textarea
                    value={aiFormData.additionalContext}
                    onChange={(e) => handleAIInputChange('additionalContext', e.target.value)}
                    rows={3}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${
                      aiError ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="Detailed story..."
                    disabled={isSubmitting}
                  />
                  {aiError && (
                    <p className="text-xs text-red-600 mt-1.5">{aiError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="max-w-2xl mx-auto">
                {aiGenerationState === 'error' && aiError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700">{aiError}</p>
                  </div>
                )}
                {aiGenerationState === 'success' && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-green-700">Scenario generated! Preview and add to table.</p>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={handleAIFormBack}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-8 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-sm ${
                      isSubmitting
                        ? 'bg-blue-400 text-white cursor-wait'
                        : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Generate Scenario'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : viewMode === 'ai-preview' ? (
          /* AI Preview */
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <div className="max-w-2xl mx-auto space-y-5">
                {/* IDs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Use Case ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={generatedScenario?.useCaseId || ''}
                      onChange={(e) => handleGeneratedScenarioChange('useCaseId', e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        formErrors.useCaseId ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Fin-U001"
                      disabled={isSubmitting}
                    />
                    {formErrors.useCaseId && (
                      <p className="text-xs text-red-600 mt-1.5">{formErrors.useCaseId}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scenario ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={generatedScenario?.scenarioId || ''}
                      onChange={(e) => handleGeneratedScenarioChange('scenarioId', e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        formErrors.scenarioId ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Fin-U001-S001"
                      disabled={isSubmitting}
                    />
                    {formErrors.scenarioId && (
                      <p className="text-xs text-red-600 mt-1.5">{formErrors.scenarioId}</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 my-1"></div>

                {/* Context */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sector <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={generatedScenario?.sector || ''}
                      onChange={(e) => handleGeneratedScenarioChange('sector', e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        formErrors.sector ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Finance, Healthcare..."
                      disabled={isSubmitting}
                    />
                    {formErrors.sector && (
                      <p className="text-xs text-red-600 mt-1.5">{formErrors.sector}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={generatedScenario?.categoryOfUseCase || ''}
                      onChange={(e) => handleGeneratedScenarioChange('categoryOfUseCase', e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        formErrors.categoryOfUseCase ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Lending, Fraud..."
                      disabled={isSubmitting}
                    />
                    {formErrors.categoryOfUseCase && (
                      <p className="text-xs text-red-600 mt-1.5">{formErrors.categoryOfUseCase}</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 my-1"></div>

                {/* Main Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={generatedScenario?.scenarioTitle || ''}
                    onChange={(e) => handleGeneratedScenarioChange('scenarioTitle', e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      formErrors.scenarioTitle ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="Clear, descriptive title"
                    disabled={isSubmitting}
                  />
                  {formErrors.scenarioTitle && (
                    <p className="text-xs text-red-600 mt-1.5">{formErrors.scenarioTitle}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={generatedScenario?.scenarioDescription || ''}
                    onChange={(e) => handleGeneratedScenarioChange('scenarioDescription', e.target.value)}
                    rows={2}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${
                      formErrors.scenarioDescription ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="Brief overview..."
                    disabled={isSubmitting}
                  />
                  {formErrors.scenarioDescription && (
                    <p className="text-xs text-red-600 mt-1.5">{formErrors.scenarioDescription}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Narrative <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={generatedScenario?.scenarioNarrative || ''}
                    onChange={(e) => handleGeneratedScenarioChange('scenarioNarrative', e.target.value)}
                    rows={3}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${
                      formErrors.scenarioNarrative ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="Detailed story..."
                    disabled={isSubmitting}
                  />
                  {formErrors.scenarioNarrative && (
                    <p className="text-xs text-red-600 mt-1.5">{formErrors.scenarioNarrative}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Red-Teaming Objective <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={generatedScenario?.redTeamingObjective || ''}
                    onChange={(e) => handleGeneratedScenarioChange('redTeamingObjective', e.target.value)}
                    rows={2}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${
                      formErrors.redTeamingObjective ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="What are you testing for?"
                    disabled={isSubmitting}
                  />
                  {formErrors.redTeamingObjective && (
                    <p className="text-xs text-red-600 mt-1.5">{formErrors.redTeamingObjective}</p>
                  )}
                </div>

                <div className="border-t border-gray-200 my-1"></div>

                {/* Users */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Direct Users <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={generatedScenario?.usersDirect || ''}
                      onChange={(e) => handleGeneratedScenarioChange('usersDirect', e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        formErrors.usersDirect ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Officers, Underwriters..."
                      disabled={isSubmitting}
                    />
                    {formErrors.usersDirect && (
                      <p className="text-xs text-red-600 mt-1.5">{formErrors.usersDirect}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Indirect Users <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={generatedScenario?.usersIndirect || ''}
                      onChange={(e) => handleGeneratedScenarioChange('usersIndirect', e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        formErrors.usersIndirect ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Customers, Regulators..."
                      disabled={isSubmitting}
                    />
                    {formErrors.usersIndirect && (
                      <p className="text-xs text-red-600 mt-1.5">{formErrors.usersIndirect}</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 my-1"></div>

                {/* Impacts - 2 column grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Intended Outcomes <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={generatedScenario?.intendedOutcomes || ''}
                      onChange={(e) => handleGeneratedScenarioChange('intendedOutcomes', e.target.value)}
                      rows={2}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${
                        formErrors.intendedOutcomes ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="What should happen?"
                      disabled={isSubmitting}
                    />
                    {formErrors.intendedOutcomes && (
                      <p className="text-xs text-red-600 mt-1.5">{formErrors.intendedOutcomes}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      KPIs & Metrics <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={generatedScenario?.kpisAndMetrics || ''}
                      onChange={(e) => handleGeneratedScenarioChange('kpisAndMetrics', e.target.value)}
                      rows={2}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${
                        formErrors.kpisAndMetrics ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Approval rate, Time..."
                      disabled={isSubmitting}
                    />
                    {formErrors.kpisAndMetrics && (
                      <p className="text-xs text-red-600 mt-1.5">{formErrors.kpisAndMetrics}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Positive Impacts <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={generatedScenario?.positiveImpactsBenefits || ''}
                      onChange={(e) => handleGeneratedScenarioChange('positiveImpactsBenefits', e.target.value)}
                      rows={2}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${
                        formErrors.positiveImpactsBenefits ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Benefits..."
                      disabled={isSubmitting}
                    />
                    {formErrors.positiveImpactsBenefits && (
                      <p className="text-xs text-red-600 mt-1.5">{formErrors.positiveImpactsBenefits}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Negative Impacts <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={generatedScenario?.negativeImpactsRisk || ''}
                      onChange={(e) => handleGeneratedScenarioChange('negativeImpactsRisk', e.target.value)}
                      rows={2}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${
                        formErrors.negativeImpactsRisk ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Risks..."
                      disabled={isSubmitting}
                    />
                    {formErrors.negativeImpactsRisk && (
                      <p className="text-xs text-red-600 mt-1.5">{formErrors.negativeImpactsRisk}</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 my-1"></div>

                {/* Source */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Source ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={generatedScenario?.useCaseSourceId || ''}
                      onChange={(e) => handleGeneratedScenarioChange('useCaseSourceId', e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        formErrors.useCaseSourceId ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="UC-2024-001"
                      disabled={isSubmitting}
                    />
                    {formErrors.useCaseSourceId && (
                      <p className="text-xs text-red-600 mt-1.5">{formErrors.useCaseSourceId}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Group Name <span className="text-xs">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={generatedScenario?.groupName || ''}
                      onChange={(e) => handleGeneratedScenarioChange('groupName', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 hover:border-gray-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      placeholder="Financial Inclusion..."
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="max-w-2xl mx-auto">
                {uploadState === 'error' && uploadError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700">{uploadError}</p>
                  </div>
                )}
                {uploadState === 'success' && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-green-700">Scenario added! New row will be highlighted in the table.</p>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={handleAIFormBack}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAIFormAdd}
                    disabled={isSubmitting}
                    className={`px-8 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-sm ${
                      isSubmitting
                        ? 'bg-blue-400 text-white cursor-wait'
                        : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Add Scenario'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Simplified Manual Entry Form */
          <form onSubmit={handleFormSubmit} className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <div className="max-w-2xl mx-auto space-y-5">
                {/* IDs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Use Case ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.useCaseId}
                      onChange={(e) => handleInputChange('useCaseId', e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        formErrors.useCaseId ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Fin-U001"
                      disabled={isSubmitting}
                    />
                    {formErrors.useCaseId && (
                      <p className="text-xs text-red-600 mt-1.5">{formErrors.useCaseId}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scenario ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.scenarioId}
                      onChange={(e) => handleInputChange('scenarioId', e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        formErrors.scenarioId ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Fin-U001-S001"
                      disabled={isSubmitting}
                    />
                    {formErrors.scenarioId && (
                      <p className="text-xs text-red-600 mt-1.5">{formErrors.scenarioId}</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 my-1"></div>

                {/* Context */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sector <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.sector}
                      onChange={(e) => handleInputChange('sector', e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        formErrors.sector ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Finance, Healthcare..."
                      disabled={isSubmitting}
                    />
                    {formErrors.sector && (
                      <p className="text-xs text-red-600 mt-1.5">{formErrors.sector}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.categoryOfUseCase}
                      onChange={(e) => handleInputChange('categoryOfUseCase', e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        formErrors.categoryOfUseCase ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Lending, Fraud..."
                      disabled={isSubmitting}
                    />
                    {formErrors.categoryOfUseCase && (
                      <p className="text-xs text-red-600 mt-1.5">{formErrors.categoryOfUseCase}</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 my-1"></div>

                {/* Main Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.scenarioTitle}
                    onChange={(e) => handleInputChange('scenarioTitle', e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      formErrors.scenarioTitle ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="Clear, descriptive title"
                    disabled={isSubmitting}
                  />
                  {formErrors.scenarioTitle && (
                    <p className="text-xs text-red-600 mt-1.5">{formErrors.scenarioTitle}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.scenarioDescription}
                    onChange={(e) => handleInputChange('scenarioDescription', e.target.value)}
                    rows={2}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${
                      formErrors.scenarioDescription ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="Brief overview..."
                    disabled={isSubmitting}
                  />
                  {formErrors.scenarioDescription && (
                    <p className="text-xs text-red-600 mt-1.5">{formErrors.scenarioDescription}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Narrative <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.scenarioNarrative}
                    onChange={(e) => handleInputChange('scenarioNarrative', e.target.value)}
                    rows={3}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${
                      formErrors.scenarioNarrative ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="Detailed story..."
                    disabled={isSubmitting}
                  />
                  {formErrors.scenarioNarrative && (
                    <p className="text-xs text-red-600 mt-1.5">{formErrors.scenarioNarrative}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Red-Teaming Objective <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.redTeamingObjective}
                    onChange={(e) => handleInputChange('redTeamingObjective', e.target.value)}
                    rows={2}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${
                      formErrors.redTeamingObjective ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="What are you testing for?"
                    disabled={isSubmitting}
                  />
                  {formErrors.redTeamingObjective && (
                    <p className="text-xs text-red-600 mt-1.5">{formErrors.redTeamingObjective}</p>
                  )}
                </div>

                <div className="border-t border-gray-200 my-1"></div>

                {/* Users */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Direct Users <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.usersDirect}
                      onChange={(e) => handleInputChange('usersDirect', e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        formErrors.usersDirect ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Officers, Underwriters..."
                      disabled={isSubmitting}
                    />
                    {formErrors.usersDirect && (
                      <p className="text-xs text-red-600 mt-1.5">{formErrors.usersDirect}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Indirect Users <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.usersIndirect}
                      onChange={(e) => handleInputChange('usersIndirect', e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        formErrors.usersIndirect ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Customers, Regulators..."
                      disabled={isSubmitting}
                    />
                    {formErrors.usersIndirect && (
                      <p className="text-xs text-red-600 mt-1.5">{formErrors.usersIndirect}</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 my-1"></div>

                {/* Impacts - 2 column grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Intended Outcomes <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.intendedOutcomes}
                      onChange={(e) => handleInputChange('intendedOutcomes', e.target.value)}
                      rows={2}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${
                        formErrors.intendedOutcomes ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="What should happen?"
                      disabled={isSubmitting}
                    />
                    {formErrors.intendedOutcomes && (
                      <p className="text-xs text-red-600 mt-1.5">{formErrors.intendedOutcomes}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      KPIs & Metrics <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.kpisAndMetrics}
                      onChange={(e) => handleInputChange('kpisAndMetrics', e.target.value)}
                      rows={2}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${
                        formErrors.kpisAndMetrics ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Approval rate, Time..."
                      disabled={isSubmitting}
                    />
                    {formErrors.kpisAndMetrics && (
                      <p className="text-xs text-red-600 mt-1.5">{formErrors.kpisAndMetrics}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Positive Impacts <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.positiveImpactsBenefits}
                      onChange={(e) => handleInputChange('positiveImpactsBenefits', e.target.value)}
                      rows={2}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${
                        formErrors.positiveImpactsBenefits ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Benefits..."
                      disabled={isSubmitting}
                    />
                    {formErrors.positiveImpactsBenefits && (
                      <p className="text-xs text-red-600 mt-1.5">{formErrors.positiveImpactsBenefits}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Negative Impacts <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.negativeImpactsRisk}
                      onChange={(e) => handleInputChange('negativeImpactsRisk', e.target.value)}
                      rows={2}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${
                        formErrors.negativeImpactsRisk ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Risks..."
                      disabled={isSubmitting}
                    />
                    {formErrors.negativeImpactsRisk && (
                      <p className="text-xs text-red-600 mt-1.5">{formErrors.negativeImpactsRisk}</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 my-1"></div>

                {/* Source */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Source ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.useCaseSourceId}
                      onChange={(e) => handleInputChange('useCaseSourceId', e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        formErrors.useCaseSourceId ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="UC-2024-001"
                      disabled={isSubmitting}
                    />
                    {formErrors.useCaseSourceId && (
                      <p className="text-xs text-red-600 mt-1.5">{formErrors.useCaseSourceId}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Group Name <span className="text-xs">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.groupName}
                      onChange={(e) => handleInputChange('groupName', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 hover:border-gray-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      placeholder="Financial Inclusion..."
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="max-w-2xl mx-auto">
                {uploadState === 'error' && uploadError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700">{uploadError}</p>
                  </div>
                )}
                {uploadState === 'success' && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-green-700">Scenario added! New row will be highlighted in the table.</p>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={handleBackToChoice}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-8 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-sm ${
                      isSubmitting
                        ? 'bg-blue-400 text-white cursor-wait'
                        : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Scenario'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}