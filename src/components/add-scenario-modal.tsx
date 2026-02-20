import { useState } from 'react';
import { X, Upload, AlertCircle, FileSpreadsheet } from 'lucide-react';
import type { Scenario } from './scenarios-table';
import * as XLSX from 'xlsx';
import { ScenarioPreviewModal } from './scenario-preview-modal';

interface AddScenarioModalProps {
  onClose: () => void;
  onAdd: (scenarios: Scenario[]) => void;
}

export function AddScenarioModal({ onClose, onAdd }: AddScenarioModalProps) {
  const [showManualForm, setShowManualForm] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState<string>('');
  const [previewScenario, setPreviewScenario] = useState<Scenario | null>(null);
  const [showSuccessFeedback, setShowSuccessFeedback] = useState(false);

  // Manual form fields
  const [formData, setFormData] = useState({
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
    useCaseSourceId: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleManualSubmit = () => {
    // Validate all required fields
    const requiredFields = [
      { field: 'useCaseId', label: 'Use Case ID' },
      { field: 'scenarioId', label: 'Scenario ID' },
      { field: 'sector', label: 'Sector' },
      { field: 'categoryOfUseCase', label: 'Category of Use Case' },
      { field: 'groupName', label: 'Group Name' },
      { field: 'scenarioTitle', label: 'Scenario Title' },
      { field: 'scenarioDescription', label: 'Scenario Description' },
      { field: 'scenarioNarrative', label: 'Scenario Narrative' },
      { field: 'redTeamingObjective', label: 'Red-Teaming Objective' },
      { field: 'usersDirect', label: 'Direct Users' },
      { field: 'usersIndirect', label: 'Indirect Users' },
      { field: 'intendedOutcomes', label: 'Intended Outcomes' },
      { field: 'positiveImpactsBenefits', label: 'Positive Impacts' },
      { field: 'negativeImpactsRisk', label: 'Negative Impacts' },
      { field: 'kpisAndMetrics', label: 'KPIs and Metrics' },
      { field: 'useCaseSourceId', label: 'Use Case Source ID' }
    ];

    const missingFields = requiredFields.filter(({ field }) => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields:\n${missingFields.map(f => f.label).join('\n')}`);
      return;
    }

    const newScenario: Scenario = {
      useCaseId: formData.useCaseId,
      scenarioId: formData.scenarioId,
      sector: formData.sector,
      categoryOfUseCase: formData.categoryOfUseCase,
      groupName: formData.groupName,
      scenarioTitle: formData.scenarioTitle,
      scenarioDescription: formData.scenarioDescription,
      scenarioNarrative: formData.scenarioNarrative,
      redTeamingObjective: formData.redTeamingObjective,
      usersDirect: formData.usersDirect,
      usersIndirect: formData.usersIndirect,
      intendedOutcomes: formData.intendedOutcomes,
      positiveImpactsBenefits: formData.positiveImpactsBenefits,
      negativeImpactsRisk: formData.negativeImpactsRisk,
      kpisAndMetrics: formData.kpisAndMetrics,
      useCaseSourceId: formData.useCaseSourceId
    };

    // Show preview modal
    setPreviewScenario(newScenario);
  };

  const handleConfirmAdd = () => {
    if (previewScenario) {
      onAdd([previewScenario]);
      setPreviewScenario(null);
      setShowSuccessFeedback(true);
      
      // Show success message briefly then close
      setTimeout(() => {
        setShowSuccessFeedback(false);
        onClose();
      }, 2000);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setUploadSuccess('');

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const uploadedScenarios: Scenario[] = jsonData.map((row: any) => {
        let tags: string[] = [];
        if (row.tags || row.Tags) {
          const tagValue = row.tags || row.Tags;
          if (typeof tagValue === 'string') {
            tags = tagValue.split(',').map((t: string) => t.trim()).filter(Boolean);
          } else if (Array.isArray(tagValue)) {
            tags = tagValue;
          }
        }

        return {
          useCaseId: String(row['Use Case ID'] || row['useCaseId'] || ''),
          scenarioId: String(row['Scenario ID'] || row['scenarioId'] || ''),
          sector: String(row['Sector'] || row['sector'] || ''),
          categoryOfUseCase: String(row['Category of Use Case'] || row['categoryOfUseCase'] || ''),
          groupName: String(row['Group Name'] || row['groupName'] || ''),
          scenarioTitle: String(row['Scenario Title'] || row['scenarioTitle'] || ''),
          scenarioDescription: String(row['Scenario Description'] || row['scenarioDescription'] || ''),
          scenarioNarrative: String(row['Scenario Narrative'] || row['scenarioNarrative'] || ''),
          redTeamingObjective: String(row['Red-Teaming Objective'] || row['redTeamingObjective'] || ''),
          usersDirect: String(row['Users: Direct'] || row['usersDirect'] || ''),
          usersIndirect: String(row['Users: Indirect'] || row['usersIndirect'] || ''),
          intendedOutcomes: String(row['Intended Outcomes'] || row['intendedOutcomes'] || ''),
          positiveImpactsBenefits: String(row['Positive Impacts/Benefits'] || row['positiveImpactsBenefits'] || ''),
          negativeImpactsRisk: String(row['Negative Impacts/Risk'] || row['negativeImpactsRisk'] || ''),
          kpisAndMetrics: String(row['KPIs and Metrics'] || row['kpisAndMetrics'] || ''),
          useCaseSourceId: String(row['Use Case Source ID'] || row['useCaseSourceId'] || ''),
          tags: tags
        };
      });

      if (uploadedScenarios.length === 0) {
        setUploadError('No valid scenarios found in the file');
        return;
      }

      setUploadSuccess(`Successfully uploaded ${uploadedScenarios.length} scenario(s)`);
      setTimeout(() => {
        onAdd(uploadedScenarios);
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error parsing file:', error);
      setUploadError('Failed to parse Excel file. Please check the format.');
    }

    event.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-600 bg-opacity-40" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl w-[90%] h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
          <h2 className="text-3xl font-semibold text-gray-900">Add Scenario</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          {!showManualForm ? (
            // Upload View
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Type in Scenario link - Top Right */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowManualForm(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium text-base underline underline-offset-2 hover:underline-offset-4 transition-all cursor-pointer"
                >
                  Type in Scenario
                </button>
              </div>

              {/* Upload Section - Grayed Out */}
              <div className="bg-gray-100 rounded-lg p-6 border border-gray-300">
                {/* Upload Button at Top */}
                <div className="text-center mb-6 pt-4">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="inline-flex items-center gap-3 px-10 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium shadow-sm">
                      <Upload className="w-5 h-5" />
                      Upload Excel File
                    </div>
                  </label>
                  <p className="mt-3 text-base text-gray-600">
                    Supports .xlsx, .xls, and .csv files
                  </p>
                </div>

                {/* Required Excel Columns - 3 Column Grid */}
                <div className="border-t border-gray-300 pt-5">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Required Excel Columns</h3>
                  <div className="grid grid-cols-3 gap-x-6 gap-y-2.5 text-base text-gray-600">
                    <div>• Use Case ID</div>
                    <div>• Scenario ID</div>
                    <div>• Sector</div>
                    <div>• Category of Use Case</div>
                    <div>• Group Name</div>
                    <div>• Scenario Title</div>
                    <div>• Scenario Description</div>
                    <div>• Scenario Narrative</div>
                    <div>• Red-Teaming Objective</div>
                    <div>• Users: Direct</div>
                    <div>• Users: Indirect</div>
                    <div>• Intended Outcomes</div>
                    <div>• Positive Impacts/Benefits</div>
                    <div>• Negative Impacts/Risk</div>
                    <div>• KPIs and Metrics</div>
                    <div>• Use Case Source ID</div>
                  </div>
                </div>
              </div>

              {/* Error/Success Messages */}
              {uploadError && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span className="text-base">{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                  <FileSpreadsheet className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span className="text-base">{uploadSuccess}</span>
                </div>
              )}
            </div>
          ) : (
            // Manual Entry Form
            <div className="space-y-6 max-w-5xl mx-auto pb-6">
              {/* Upload via Excel link - Top Right */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowManualForm(false)}
                  className="text-blue-600 hover:text-blue-700 font-medium text-base underline underline-offset-2 hover:underline-offset-4 transition-all cursor-pointer"
                >
                  Upload via Excel
                </button>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                {/* Identification */}
                <div className="grid grid-cols-3 gap-5">
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">Use Case ID</label>
                    <input
                      type="text"
                      value={formData.useCaseId}
                      onChange={(e) => handleInputChange('useCaseId', e.target.value)}
                      placeholder="UC-001"
                      required
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">Scenario ID</label>
                    <input
                      type="text"
                      value={formData.scenarioId}
                      onChange={(e) => handleInputChange('scenarioId', e.target.value)}
                      placeholder="SC-001"
                      required
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">Use Case Source ID</label>
                    <input
                      type="text"
                      value={formData.useCaseSourceId}
                      onChange={(e) => handleInputChange('useCaseSourceId', e.target.value)}
                      placeholder="SOURCE-001"
                      required
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Classification */}
                <div className="grid grid-cols-3 gap-5">
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">Sector</label>
                    <input
                      type="text"
                      value={formData.sector}
                      onChange={(e) => handleInputChange('sector', e.target.value)}
                      placeholder="Healthcare"
                      required
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">Category of Use Case</label>
                    <input
                      type="text"
                      value={formData.categoryOfUseCase}
                      onChange={(e) => handleInputChange('categoryOfUseCase', e.target.value)}
                      placeholder="Emergency Response"
                      required
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">Group Name</label>
                    <input
                      type="text"
                      value={formData.groupName}
                      onChange={(e) => handleInputChange('groupName', e.target.value)}
                      placeholder="Critical Care"
                      required
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="h-px bg-gray-200"></div>

                {/* Scenario Content */}
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Scenario Title</label>
                  <input
                    type="text"
                    value={formData.scenarioTitle}
                    onChange={(e) => handleInputChange('scenarioTitle', e.target.value)}
                    placeholder="Enter a clear, descriptive title"
                    required
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Scenario Description</label>
                  <textarea
                    value={formData.scenarioDescription}
                    onChange={(e) => handleInputChange('scenarioDescription', e.target.value)}
                    placeholder="Brief overview of the scenario"
                    rows={3}
                    required
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Scenario Narrative</label>
                  <textarea
                    value={formData.scenarioNarrative}
                    onChange={(e) => handleInputChange('scenarioNarrative', e.target.value)}
                    placeholder="Detailed narrative and context"
                    rows={4}
                    required
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="h-px bg-gray-200"></div>

                {/* Objectives & Users */}
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Red-Teaming Objective</label>
                  <input
                    type="text"
                    value={formData.redTeamingObjective}
                    onChange={(e) => handleInputChange('redTeamingObjective', e.target.value)}
                    placeholder="What are you testing or validating?"
                    required
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">Direct Users</label>
                    <input
                      type="text"
                      value={formData.usersDirect}
                      onChange={(e) => handleInputChange('usersDirect', e.target.value)}
                      placeholder="Medical staff, security personnel"
                      required
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">Indirect Users</label>
                    <input
                      type="text"
                      value={formData.usersIndirect}
                      onChange={(e) => handleInputChange('usersIndirect', e.target.value)}
                      placeholder="Patients, visitors, administrators"
                      required
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Intended Outcomes</label>
                  <textarea
                    value={formData.intendedOutcomes}
                    onChange={(e) => handleInputChange('intendedOutcomes', e.target.value)}
                    placeholder="Expected results and goals"
                    rows={2}
                    required
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="h-px bg-gray-200"></div>

                {/* Impact Analysis */}
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">Positive Impacts/Benefits</label>
                    <textarea
                      value={formData.positiveImpactsBenefits}
                      onChange={(e) => handleInputChange('positiveImpactsBenefits', e.target.value)}
                      placeholder="Benefits, advantages, positive outcomes"
                      rows={3}
                      required
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">Negative Impacts/Risk</label>
                    <textarea
                      value={formData.negativeImpactsRisk}
                      onChange={(e) => handleInputChange('negativeImpactsRisk', e.target.value)}
                      placeholder="Risks, challenges, negative consequences"
                      rows={3}
                      required
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">KPIs and Metrics</label>
                  <input
                    type="text"
                    value={formData.kpisAndMetrics}
                    onChange={(e) => handleInputChange('kpisAndMetrics', e.target.value)}
                    placeholder="Response time, accuracy rate, satisfaction score"
                    required
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4 pt-4">
                <button
                  onClick={onClose}
                  className="px-6 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleManualSubmit}
                  className="px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Scenario
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewScenario && (
        <ScenarioPreviewModal
          scenario={previewScenario}
          onClose={() => setPreviewScenario(null)}
          onConfirm={handleConfirmAdd}
        />
      )}

      {/* Success Feedback */}
      {showSuccessFeedback && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
          <div className="bg-green-600 text-white px-8 py-4 rounded-lg shadow-2xl text-lg font-medium">
            ✓ Scenario added successfully!
          </div>
        </div>
      )}
    </div>
  );
}