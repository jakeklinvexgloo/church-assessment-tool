import React from 'react';

const SummaryItem = ({ title, value, subtext }) => (
  <div className="bg-indigo-50 p-4 rounded-lg">
    <h3 className="text-sm font-semibold text-indigo-600 mb-1">{title}</h3>
    <p className="text-2xl font-bold text-indigo-900">{value}</p>
    {subtext && <p className="text-xs text-indigo-500 mt-1">{subtext}</p>}
  </div>
);

export default SummaryItem;