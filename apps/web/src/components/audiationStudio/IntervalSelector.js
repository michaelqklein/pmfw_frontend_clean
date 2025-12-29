import React from 'react';

const INTERVAL_LABELS = [
  'm2', 'M2', 'm3', 'M3', 'P4', 'Tri', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8'
];

const IntervalSelector = ({ label, vector, onChange }) => {
  // Comment out all console.log statements
  // const selectedIndices = vector
  //   .map((v, i) => (v === 1 ? INTERVAL_LABELS[i] : null))
  //   .filter(Boolean);
  // console.log(`IntervalSelector [${label}] render: vector=`, vector, 'Selected:', selectedIndices);

  // .selected is a custom CSS class, not Tailwind. Tailwind equivalent for selected state is to use conditional classes like bg-green-700.
  // The hover enlarge effect is from your .css file, not Tailwind (see .table-cell button:hover in AudiationStudioGUIDesktop.css).

  return (
    <div className="w-full mb-4 bg-white/80 border border-black rounded-lg shadow-lg p-4">
      <div className="font-semibold text-lg mb-2 text-black">{label}:</div>
      <div className="flex flex-wrap gap-2">
        {INTERVAL_LABELS.map((interval, idx) => (
          <button
            key={interval}
            className={`px-3 py-2 mr-2 mb-2 rounded-md border border-gray-400 shadow-sm text-sm font-medium focus:outline-none transition-colors duration-200
              ${vector[idx] === 1 ? 'bg-green-700 text-black' : 'bg-white text-black hover:bg-gray-200'}
            `}
            onClick={() => onChange(idx)}
            type="button"
          >
            {interval}
          </button>
        ))}
        <button
          className="px-3 py-2 mr-2 mb-2 rounded-md border border-gray-400 shadow-sm text-sm font-medium bg-white text-black hover:bg-green-100 focus:outline-none"
          onClick={() => onChange('all')}
          type="button"
        >
          All
        </button>
        <button
          className="px-3 py-2 mr-2 mb-2 rounded-md border border-gray-400 shadow-sm text-sm font-medium bg-white text-black hover:bg-red-100 focus:outline-none"
          onClick={() => onChange('none')}
          type="button"
        >
          None
        </button>
      </div>
    </div>
  );
};

export default IntervalSelector; 