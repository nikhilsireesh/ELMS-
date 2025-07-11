import React from 'react';

const LeavePolicyReference = () => {
  // Get current month to determine which half-year quota to show
  const currentMonth = new Date().getMonth() + 1; // getMonth() returns 0-11, so add 1
  const isFirstHalf = currentMonth >= 1 && currentMonth <= 6;
  const currentPeriod = isFirstHalf ? 'Jan-Jun' : 'Jul-Dec';
  
  const leavePolicy = [
    {
      type: 'CL',
      name: 'Casual Leave',
      meaning: 'For unexpected personal needs (sudden errands, emergencies).',
      allotted: `6 days (${currentPeriod})`,
      rules: 'Given in two parts: 6 days for Jan–Jun, 6 days for Jul–Dec. Cannot carry forward to next half-year.'
    },
    {
      type: 'SCL',
      name: 'Special Casual Leave',
      meaning: 'For special situations like family functions, personal matters needing extra time.',
      allotted: `4 days (${currentPeriod})`,
      rules: 'Given in two parts: 4 days for Jan–Jun, 4 days for Jul–Dec. Cannot carry forward to next half-year.'
    },
    {
      type: 'EL',
      name: 'Earned Leave',
      meaning: 'For longer planned leaves — vacation, rest, or personal work.',
      allotted: 'Varies',
      rules: 'Earned by working: (Total working days - Leaves taken) ÷ 2. E.g., if worked 200 days and took 10 days leave → EL = (200-10) ÷ 2 = 95 days.'
    },
    {
      type: 'HPL',
      name: 'Half Pay Leave',
      meaning: 'For extended sickness or special conditions where full pay is not needed.',
      allotted: '10 days',
      rules: 'Allotted once every 3 years from the Date of Joining (DOJ). After 3 years of service → gets 10 HPL days.'
    },
    {
      type: 'CCL',
      name: 'Child Care Leave',
      meaning: 'Leave to take care of children (school, health, emergencies).',
      allotted: '7 per year',
      rules: 'Fixed quota per year. Cannot exceed this limit in a year.'
    }
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Leave Policy Reference</h3>
        <p className="card-description">MIC College of Technology Leave Policy</p>
      </div>
      <div className="card-content">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-semibold text-gray-900">Leave Type</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-900">Meaning</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-900">Allotment</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-900">Rules</th>
              </tr>
            </thead>
            <tbody>
              {leavePolicy.map((policy, index) => (
                <tr key={policy.type} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-3 px-2">
                    <div className="font-medium text-gray-900">
                      <strong>{policy.type}</strong> ({policy.name})
                    </div>
                  </td>
                  <td className="py-3 px-2 text-gray-700">
                    <div className="text-sm leading-relaxed">
                      {policy.meaning}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-gray-700 font-medium">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                      {policy.allotted}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-gray-600">
                    <div className="text-sm leading-relaxed">
                      {policy.rules}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-yellow-800">
              <div className="font-semibold mb-1">Important Policy Notes:</div>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>CL & SCL:</strong> Cannot carry forward unused days to the next half-year (Jan-Jun / Jul-Dec)</li>
                <li><strong>EL Calculation:</strong> Days worked ÷ 2 (e.g., 200 working days = 100 EL days)</li>
                <li><strong>HPL Eligibility:</strong> Available only after completing 3 years of service from Date of Joining</li>
                <li><strong>CCL Limit:</strong> Fixed annual quota of 7 days, cannot exceed in any calendar year</li>
                <li><strong>Half-Year Periods:</strong> Jan 1 - Jun 30 and Jul 1 - Dec 31</li>
                <li><strong>Leave Balance:</strong> Check your current balance before applying for leave</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeavePolicyReference;
