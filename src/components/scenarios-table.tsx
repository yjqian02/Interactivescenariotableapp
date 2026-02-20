import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Plus, Filter, X, Columns3, GripVertical, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { ScenarioDetailModal } from './scenario-detail-modal';
import { AddScenarioModal } from './add-scenario-modal-simple';
import { staticScenarios } from './scenarios-data';

export interface Scenario {
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
  tags?: string[];
}

interface ColumnConfig {
  key: keyof Scenario;
  label: string;
  width?: string;
  defaultVisible: boolean;
}

const COLUMN_CONFIGS: ColumnConfig[] = [
  { key: 'scenarioTitle', label: 'Scenario Title & ID', width: '20%', defaultVisible: true },
  { key: 'sector', label: 'Sector', width: '10%', defaultVisible: true },
  { key: 'scenarioDescription', label: 'Description', width: '25%', defaultVisible: true },
  { key: 'redTeamingObjective', label: 'Red-Teaming Objective', width: '25%', defaultVisible: true },
  { key: 'useCaseId', label: 'Use Case ID', width: '12%', defaultVisible: false },
  { key: 'scenarioId', label: 'Scenario ID', width: '12%', defaultVisible: false },
  { key: 'categoryOfUseCase', label: 'Category of Use Case', width: '15%', defaultVisible: false },
  { key: 'groupName', label: 'Group Name', width: '12%', defaultVisible: false },
  { key: 'scenarioNarrative', label: 'Scenario Narrative', width: '25%', defaultVisible: false },
  { key: 'usersDirect', label: 'Direct Users', width: '15%', defaultVisible: false },
  { key: 'usersIndirect', label: 'Indirect Users', width: '15%', defaultVisible: false },
  { key: 'intendedOutcomes', label: 'Intended Outcomes', width: '20%', defaultVisible: false },
  { key: 'positiveImpactsBenefits', label: 'Benefits', width: '20%', defaultVisible: false },
  { key: 'negativeImpactsRisk', label: 'Risk', width: '20%', defaultVisible: false },
  { key: 'kpisAndMetrics', label: 'KPIs & Metrics', width: '20%', defaultVisible: false },
  { key: 'useCaseSourceId', label: 'Use Case Source ID', width: '15%', defaultVisible: false },
];

// All filter sections - one for each field
const FILTER_SECTIONS = [
  { field: 'sector', label: 'Sector' },
  { field: 'categoryOfUseCase', label: 'Category' },
  { field: 'groupName', label: 'Group' },
  { field: 'usersDirect', label: 'Direct Users' },
  { field: 'usersIndirect', label: 'Indirect Users' },
  { field: 'intendedOutcomes', label: 'Outcomes' },
  { field: 'positiveImpactsBenefits', label: 'Benefits' },
  { field: 'negativeImpactsRisk', label: 'Risks' },
  { field: 'kpisAndMetrics', label: 'Metrics' },
];

export function ScenariosTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [scenarios, setScenarios] = useState<Scenario[]>(staticScenarios);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [expandedObjectives, setExpandedObjectives] = useState<Set<string>>(new Set());
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const [expandedFilterSections, setExpandedFilterSections] = useState<Set<string>>(new Set());
  const [newlyAddedIds, setNewlyAddedIds] = useState<Set<string>>(new Set());
  const [isScenarioFullScreen, setIsScenarioFullScreen] = useState(false);
  const [deleteConfirmScenarioId, setDeleteConfirmScenarioId] = useState<string | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<HTMLDivElement>(null);
  const [draggedColumn, setDraggedColumn] = useState<keyof Scenario | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<keyof Scenario | null>(null);
  
  // Column order state - starts with default order
  const [columnOrder, setColumnOrder] = useState<(keyof Scenario)[]>(
    COLUMN_CONFIGS.map(c => c.key)
  );
  
  // Visible columns state - default columns
  const [visibleColumns, setVisibleColumns] = useState<Set<keyof Scenario>>(
    new Set(COLUMN_CONFIGS.filter(c => c.defaultVisible).map(c => c.key))
  );

  // Filter states
  const [filters, setFilters] = useState<Record<string, string[]>>({});

  // Toggle filter section accordion
  const toggleFilterSection = (field: string) => {
    setExpandedFilterSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(field)) {
        newSet.delete(field);
      } else {
        newSet.add(field);
      }
      return newSet;
    });
  };

  // Toggle objective/long text expansion
  const toggleExpansion = (scenarioId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedObjectives(prev => {
      const newSet = new Set(prev);
      if (newSet.has(scenarioId)) {
        newSet.delete(scenarioId);
      } else {
        newSet.add(scenarioId);
      }
      return newSet;
    });
  };

  // Handle adding a single scenario
  const handleAddScenario = (newScenario: Scenario) => {
    setScenarios(prev => [newScenario, ...prev]); // Add to beginning
    setNewlyAddedIds(prev => new Set([...prev, newScenario.scenarioId]));
  };

  // Handle adding multiple scenarios from Excel upload
  const handleAddScenarios = (newScenarios: Scenario[]) => {
    setScenarios(prev => [...newScenarios, ...prev]); // Add to beginning
    const newIds = new Set([...newScenarios.map(s => s.scenarioId)]);
    setNewlyAddedIds(newIds);
    
    // Remove highlighting after 5 seconds
    setTimeout(() => {
      setNewlyAddedIds(new Set());
    }, 5000);
  };

  // Get unique values for each filterable field
  const getUniqueValues = (field: keyof Scenario): string[] => {
    const values = new Set<string>();
    scenarios.forEach(scenario => {
      const value = scenario[field];
      if (typeof value === 'string') {
        // Split by both comma and semicolon separators
        const separators = /[,;]/;
        if (separators.test(value)) {
          value.split(separators).forEach(v => {
            const trimmed = v.trim();
            // Filter out values that start with "and" or "And"
            if (trimmed && !trimmed.toLowerCase().startsWith('and ')) {
              values.add(trimmed);
            }
          });
        } else {
          const trimmed = value.trim();
          // Filter out values that start with "and" or "And"
          if (trimmed && !trimmed.toLowerCase().startsWith('and ')) {
            values.add(trimmed);
          }
        }
      }
    });
    return Array.from(values).filter(v => v).sort();
  };

  // Filter scenarios
  const filteredScenarios = useMemo(() => {
    return scenarios.filter(scenario => {
      // Apply all active filters
      for (const [field, selectedValues] of Object.entries(filters)) {
        if (selectedValues.length === 0) continue;
        
        const fieldValue = scenario[field as keyof Scenario];
        if (typeof fieldValue !== 'string') continue;

        // Handle comma and semicolon separated values
        const separators = /[,;]/;
        if (separators.test(fieldValue)) {
          const values = fieldValue.split(separators).map(v => v.trim());
          const hasMatch = selectedValues.some(selected => values.includes(selected));
          if (!hasMatch) return false;
        } else {
          if (!selectedValues.includes(fieldValue)) return false;
        }
      }

      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return Object.values(scenario).some(value => 
          typeof value === 'string' && value.toLowerCase().includes(search)
        );
      }

      return true;
    });
  }, [searchTerm, scenarios, filters]);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
      if (columnsRef.current && !columnsRef.current.contains(event.target as Node)) {
        setShowColumnsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle filter value
  const toggleFilterValue = (field: string, value: string) => {
    setFilters(prev => {
      const current = prev[field] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  // Remove specific filter
  const removeFilter = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter(v => v !== value)
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({});
  };

  // Toggle column visibility
  const toggleColumn = (columnKey: keyof Scenario) => {
    setVisibleColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(columnKey)) {
        newSet.delete(columnKey);
      } else {
        newSet.add(columnKey);
      }
      return newSet;
    });
  };

  // Get active filter count
  const activeFilterCount = Object.values(filters).reduce((sum, arr) => sum + arr.length, 0);

  // Get visible column configs in the user's custom order
  const orderedVisibleColumns = useMemo(() => {
    return columnOrder
      .filter(key => visibleColumns.has(key))
      .map(key => COLUMN_CONFIGS.find(c => c.key === key)!)
      .filter(Boolean);
  }, [columnOrder, visibleColumns]);

  // Drag and drop handlers
  const handleDragStart = (columnKey: keyof Scenario) => {
    setDraggedColumn(columnKey);
  };

  const handleDragOver = (e: React.DragEvent, columnKey: keyof Scenario) => {
    e.preventDefault();
    setDragOverColumn(columnKey);
  };

  const handleDrop = (e: React.DragEvent, targetColumnKey: keyof Scenario) => {
    e.preventDefault();
    if (!draggedColumn || draggedColumn === targetColumnKey) {
      setDraggedColumn(null);
      setDragOverColumn(null);
      return;
    }

    const newOrder = [...columnOrder];
    const draggedIndex = newOrder.indexOf(draggedColumn);
    const targetIndex = newOrder.indexOf(targetColumnKey);

    // Remove dragged column and insert at target position
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedColumn);

    setColumnOrder(newOrder);
    setDraggedColumn(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedColumn(null);
    setDragOverColumn(null);
  };

  // Render cell content
  const renderCellContent = (scenario: Scenario, columnKey: keyof Scenario) => {
    const value = scenario[columnKey];
    
    // Special rendering for scenario title (includes ID)
    if (columnKey === 'scenarioTitle') {
      return (
        <div className="space-y-1">
          <div className="text-sm text-gray-900 font-medium leading-snug">
            {scenario.scenarioTitle}
          </div>
          <div className="text-xs text-gray-500">{scenario.scenarioId}</div>
        </div>
      );
    }
    
    // Special rendering for sector
    if (columnKey === 'sector') {
      return (
        <span className="inline-flex px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded border border-blue-200">
          {value}
        </span>
      );
    }

    // Long text fields with show more/less
    const longTextFields: (keyof Scenario)[] = ['scenarioDescription', 'redTeamingObjective', 'scenarioNarrative', 'intendedOutcomes', 'positiveImpactsBenefits', 'negativeImpactsRisk'];
    if (longTextFields.includes(columnKey) && typeof value === 'string' && value.length > 120) {
      const isExpanded = expandedObjectives.has(scenario.scenarioId + columnKey);
      return (
        <div className="space-y-2">
          <p className="text-sm text-gray-700 leading-relaxed">
            {isExpanded ? value : `${value.substring(0, 120)}...`}
          </p>
          <button
            onClick={(e) => toggleExpansion(scenario.scenarioId + columnKey, e)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        </div>
      );
    }

    // Default rendering
    return <p className="text-sm text-gray-700 leading-relaxed">{value}</p>;
  };

  const handleExpandScenario = () => {
    setIsScenarioFullScreen(true);
  };

  const handleCloseScenario = () => {
    setSelectedScenario(null);
    setIsScenarioFullScreen(false);
  };

  const handleDeleteScenario = (scenarioId: string) => {
    setScenarios(prev => prev.filter(s => s.scenarioId !== scenarioId));
  };

  const handleUpdateScenario = (updatedScenario: Scenario) => {
    setScenarios(prev => prev.map(s => 
      s.scenarioId === updatedScenario.scenarioId ? updatedScenario : s
    ));
  };

  // If scenario is fullscreen, render it as the main content
  if (isScenarioFullScreen && selectedScenario) {
    return (
      <ScenarioDetailModal 
        scenario={selectedScenario} 
        onClose={handleCloseScenario}
        onExpand={handleExpandScenario}
        isFullScreen={true}
        onDelete={handleDeleteScenario}
        onUpdate={handleUpdateScenario}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Page Header */}
      <div className="px-6 py-6 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-gray-900 text-2xl font-semibold">Scenario Library</h1>
        </div>
        <p className="text-gray-600 text-sm">
          Browse and manage your red teaming scenario collection.
        </p>
      </div>

      {/* Search and Controls Bar */}
      <div className="px-6 pb-4 flex items-center justify-between gap-4 flex-shrink-0">
        {/* Left: Search and Filter */}
        <div className="flex items-center gap-2">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Quick search..."
              className="w-full pl-9 pr-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder:text-gray-400"
            />
          </div>

          {/* Filter Button */}
          <div ref={filterRef} className="relative">
            <button
              className={`px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                activeFilterCount > 0 ? 'text-blue-600 border-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <Filter className="w-4 h-4" />
              {activeFilterCount > 0 && (
                <span className="px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full font-medium">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {showFilterDropdown && (
              <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg w-80 z-20 max-h-[32rem]" style={{ overflowY: 'auto' }}>
                <div className="p-3 border-b border-gray-200 bg-gray-50">
                  <div className="text-xs font-semibold text-gray-700 uppercase">Filter by</div>
                </div>
                
                {/* Accordion Filter Sections */}
                {FILTER_SECTIONS.map((section) => {
                  const uniqueValues = getUniqueValues(section.field as keyof Scenario);
                  const isExpanded = expandedFilterSections.has(section.field);
                  const activeCount = (filters[section.field] || []).length;
                  
                  return (
                    <div key={section.field} className="border-b border-gray-200 last:border-b-0">
                      <button
                        onClick={() => toggleFilterSection(section.field)}
                        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{section.label}</span>
                          {activeCount > 0 && (
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                              {activeCount}
                            </span>
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      
                      {isExpanded && uniqueValues.length > 0 && (
                        <div className="px-3 pb-3 space-y-1.5 max-h-48" style={{ overflowY: 'auto' }}>
                          {uniqueValues.map(value => (
                            <label key={value} className="flex items-start cursor-pointer hover:bg-gray-50 p-1.5 rounded">
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5 flex-shrink-0"
                                checked={(filters[section.field] || []).includes(value)}
                                onChange={() => toggleFilterValue(section.field, value)}
                              />
                              <span className="ml-2 text-sm text-gray-700 break-words">{value}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {activeFilterCount > 0 && (
                  <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <button
                      className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium text-center"
                      onClick={clearAllFilters}
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQuickCreate(true)}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Scenario
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="px-6 pb-4 flex-shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Active Filters:</span>
            {Object.entries(filters).map(([field, values]) =>
              values.map(value => {
                const fieldLabel = FILTER_SECTIONS.find(s => s.field === field)?.label || field;
                return (
                  <span
                    key={`${field}-${value}`}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded"
                  >
                    {fieldLabel}: {value}
                    <button
                      onClick={() => removeFilter(field, value)}
                      className="hover:bg-blue-200 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })
            )}
            <button
              onClick={clearAllFilters}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Table Container - Scrolls vertically */}
      <div className="flex-1 px-6 pb-6" style={{ overflowY: 'auto' }}>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
              <tr>
                {orderedVisibleColumns.map(column => (
                  <th
                    key={column.key}
                    className={`group text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase cursor-move select-none transition-all ${
                      draggedColumn === column.key ? 'opacity-50 bg-blue-100 scale-95' : ''
                    } ${
                      dragOverColumn === column.key && draggedColumn !== column.key ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                    } hover:bg-gray-100`}
                    style={{ width: column.width }}
                    draggable
                    onDragStart={(e) => handleDragStart(column.key)}
                    onDragOver={(e) => handleDragOver(e, column.key)}
                    onDrop={(e) => handleDrop(e, column.key)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      <span>{column.label}</span>
                    </div>
                  </th>
                ))}
                {/* Column Settings Button */}
                <th className="text-right py-3 px-6 w-16 bg-gray-50">
                  <div ref={columnsRef} className="relative inline-block">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowColumnsDropdown(!showColumnsDropdown);
                      }}
                      className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                      title="Customize columns"
                    >
                      <Columns3 className="w-4 h-4 text-gray-500" />
                    </button>
                    {showColumnsDropdown && (
                      <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg w-64 z-30" style={{ maxHeight: '24rem', overflowY: 'auto' }}>
                        <div className="p-4">
                          <div className="text-xs font-semibold text-gray-700 uppercase mb-3">Show/Hide Columns</div>
                          <div className="space-y-2">
                            {COLUMN_CONFIGS.map(column => (
                              <label key={column.key} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  checked={visibleColumns.has(column.key)}
                                  onChange={() => toggleColumn(column.key)}
                                />
                                <span className="ml-2 text-sm text-gray-900">{column.label}</span>
                              </label>
                            ))}
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-2 text-xs text-gray-500">
                            <GripVertical className="w-3 h-3 flex-shrink-0" />
                            <span>Drag column headers to reorder</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredScenarios.map((scenario, index) => {
                const isNewlyAdded = newlyAddedIds.has(scenario.scenarioId);
                return (
                  <tr
                    key={`${scenario.useCaseId}-${scenario.scenarioId}-${index}`}
                    className={`group/row border-b border-gray-100 cursor-pointer transition-all duration-300 ${
                      isNewlyAdded 
                        ? 'bg-green-50 hover:bg-green-100 animate-pulse' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedScenario(scenario)}
                  >
                    {orderedVisibleColumns.map(column => (
                      <td 
                        key={column.key} 
                        className={`py-5 px-6 align-top ${isNewlyAdded ? 'relative' : ''}`}
                      >
                        {column.key === orderedVisibleColumns[0].key && isNewlyAdded && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
                        )}
                        {renderCellContent(scenario, column.key)}
                      </td>
                    ))}
                    {/* Delete Button Column */}
                    <td className="py-5 px-6 align-top">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmScenarioId(scenario.scenarioId);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover/row:opacity-100"
                        title="Delete scenario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredScenarios.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No scenarios found matching your filters
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedScenario && !isScenarioFullScreen && (
        <ScenarioDetailModal 
          scenario={selectedScenario} 
          onClose={handleCloseScenario}
          onExpand={handleExpandScenario}
          isFullScreen={false}
          onDelete={handleDeleteScenario}
          onUpdate={handleUpdateScenario}
        />
      )}
      {showQuickCreate && (
        <AddScenarioModal 
          onClose={() => setShowQuickCreate(false)} 
          onScenarioAdded={handleAddScenario}
          onScenariosAdded={handleAddScenarios}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      {deleteConfirmScenarioId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Scenario?</h3>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. Are you sure you want to delete this scenario?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmScenarioId(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteScenario(deleteConfirmScenarioId);
                  setDeleteConfirmScenarioId(null);
                }}
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
