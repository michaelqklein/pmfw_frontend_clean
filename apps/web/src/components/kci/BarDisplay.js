'use client';

import React from 'react';

const BarDisplay = ({ number, name, value, maxValue, redValue, unit, ratio, redRatio }) => {
  // Calculate the percentage of the bar to be filled based on the value and maxValue
  const valuePercentage = (value / maxValue) * 100;

  return (
    <div className="flex flex-col items-center w-full my-2">
      <div className="text-base font-semibold mb-1">{name}:</div>
      <div className="relative border border-black w-32 h-5 bg-black rounded overflow-hidden mb-2">
        <div
          className={`h-full ${value < redValue ? 'bg-red-600' : 'bg-green-700'}`}
          style={{ width: `${valuePercentage}%` }}
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold text-xs">
          {value}{unit}
        </div>
      </div>
      {(number === 2) &&
        <div className="relative border border-black w-32 h-5 bg-black rounded overflow-hidden">
          <div
            className={`h-full ${ratio < redRatio ? 'bg-red-600' : 'bg-green-700'}`}
            style={{ width: `${ratio}%` }}
          />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold text-xs">
            {ratio} %
          </div>
        </div>
      }
    </div>
  );
};

BarDisplay.defaultProps = {
  name: 'Name',
  value: 0,
  maxValue: 100, // Default max value set to 100
  unit: '',
  red: 0,
};

export default BarDisplay;
