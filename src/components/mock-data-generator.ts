import { Scenario } from './scenarios-table';

const sectors = [
  'Healthcare', 'Finance', 'Retail', 'Technology', 'Education', 
  'Energy', 'Transportation', 'Government', 'Manufacturing', 'Telecommunications'
];

const categories = [
  'Data Privacy', 'Cybersecurity', 'Customer Experience', 'Operational Resilience', 
  'Regulatory Compliance', 'AI Ethics', 'Supply Chain', 'Workforce Management', 
  'Product Launch', 'Crisis Management'
];

const groups = [
  'Risk Management', 'Operations', 'IT Security', 'Customer Support', 
  'Legal', 'HR', 'R&D', 'Sales', 'Executive Leadership', 'Compliance'
];

const titles = [
  'Data Breach Response', 'System Outage Recovery', 'Customer Service Surge', 
  'Regulatory Audit Prep', 'Supply Chain Disruption', 'AI Model Bias Detection', 
  'Workforce Strike Contingency', 'New Product Rollout Failure', 
  'Ransomware Attack Mitigation', 'VIP Client Escalation'
];

const descriptions = [
  'Handle a significant event impacting core business operations.',
  'Respond to a critical security incident involving sensitive data.',
  'Manage an unexpected surge in demand affecting service levels.',
  'Address a compliance violation reported by a regulatory body.',
  'Mitigate risks associated with a third-party vendor failure.',
  'Resolve a public relations crisis stemming from social media.',
  'Recover from a natural disaster affecting physical infrastructure.',
  'Investigate and fix a critical software bug in production.',
  'Manage transition during a major organizational restructure.',
  'Respond to competitive market shifts threatening market share.'
];

const narratives = [
  'The organization faces a critical challenge that requires immediate cross-functional collaboration. Initial reports suggest significant impact on operations and reputation if not handled correctly.',
  'A sudden anomaly has been detected in the system. Teams must race against time to identify the root cause and implement a fix before customers are affected.',
  'External factors have created a volatile environment. Leadership must make tough decisions with limited information to steer the company through the storm.',
  'A routine audit has uncovered major discrepancies. The compliance team must work with operations to rectify the issues and prepare a report for the board.',
  'Feedback from key stakeholders indicates a loss of trust. A comprehensive strategy is needed to rebuild confidence and demonstrate commitment to values.'
];

const objectives = [
  'Test the effectiveness of current incident response playbooks.',
  'Evaluate communication channels between departments during crisis.',
  'Identify gaps in the current disaster recovery plan.',
  'Assess the speed and accuracy of decision-making under pressure.',
  'Verify compliance with new regulatory standards.',
  'Stress-test the system\'s capacity to handle peak loads.',
  'Train new staff on standard operating procedures for emergencies.',
  'Measure the impact of mitigation strategies on customer sentiment.',
  'Validate the integrity of data backup and restoration processes.',
  'Ensure alignment between technical and business teams.'
];

const users = [
  'System Administrators', 'Customer Support Agents', 'Compliance Officers', 
  'Department Managers', 'End Users', 'External Partners', 'Board Members', 
  'Security Analysts', 'HR Specialists', 'Legal Counsel'
];

const outcomes = [
  'Service restored within SLA limits.', 'Zero data loss achieved.', 
  'Regulatory fines avoided.', 'Customer trust maintained.', 
  'Operational downtime minimized.', 'Security vulnerability patched.', 
  'Staff safety ensured.', 'Brand reputation preserved.', 
  'Financial losses contained.', 'Compliance certification retained.'
];

const impacts = [
  'Enhanced operational resilience.', 'Improved customer loyalty.', 
  'Strengthened security posture.', 'Better regulatory standing.', 
  'Increased staff confidence.', 'Optimized resource allocation.', 
  'Reduced liability risk.', 'Clearer communication protocols.', 
  'Higher system availability.', 'More agile decision-making.'
];

const risks = [
  'Potential revenue loss.', 'Reputational damage.', 'Legal liability.', 
  'Customer churn.', 'Employee burnout.', 'Regulatory sanctions.', 
  'Data privacy violations.', 'Operational bottlenecks.', 
  'Supply chain delays.', 'Strategic misalignment.'
];

const kpis = [
  'Mean Time to Resolution (MTTR)', 'Customer Satisfaction Score (CSAT)', 
  'Downtime Duration', 'Cost of Incident', 'Number of Affected Users', 
  'Compliance Rate', 'Employee Engagement Score', 'Net Promoter Score (NPS)', 
  'Risk Exposure Value', 'Recovery Point Objective (RPO)'
];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function generateMockScenarios(count: number): Scenario[] {
  const scenarios: Scenario[] = [];

  for (let i = 0; i < count; i++) {
    const useCaseId = `UC${(i + 100).toString().padStart(3, '0')}`;
    const scenarioId = `SC${(i + 100).toString().padStart(3, '0')}`;
    const sector = getRandomItem(sectors);
    const category = getRandomItem(categories);
    const group = getRandomItem(groups);
    const title = `${getRandomItem(titles)} - ${sector}`;
    
    scenarios.push({
      useCaseId,
      scenarioId,
      sector,
      categoryOfUseCase: category,
      groupName: group,
      scenarioTitle: title,
      scenarioDescription: getRandomItem(descriptions),
      scenarioNarrative: getRandomItem(narratives),
      redTeamingObjective: getRandomItem(objectives),
      usersDirect: getRandomItems(users, 2).join(', '),
      usersIndirect: getRandomItems(users, 2).join(', '),
      intendedOutcomes: getRandomItem(outcomes),
      positiveImpactsBenefits: getRandomItem(impacts),
      negativeImpactsRisk: getRandomItem(risks),
      kpisAndMetrics: getRandomItems(kpis, 2).join(', '),
      useCaseSourceId: `SRC${(i + 100).toString().padStart(3, '0')}`
    });
  }

  return scenarios;
}
