'use client';

import React from 'react';
import { ResponsiveHeatMap } from '@nivo/heatmap';

const transposeMatrix = (matrix) => {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
};

const ShowHeatMap = ({ intervalScoreMatrix }) => {
    // Transpose the matrix: switch rows and columns
    const transposedMatrix = transposeMatrix(intervalScoreMatrix);

    const labels = [
        'desc perfect 8', 'desc Maj 7', 'desc min 7', 'desc Maj 6', 'desc min 6', 'desc perfect 5', 'desc Tritone', 'desc perfect 4', 'desc Maj 3', 'desc min 3', 'desc Maj 2', 'desc min 2',
        'asc min 2', 'asc Maj 2', 'asc min 3', 'asc Maj 3', 'asc perfect 4', 'asc Tritone', 'asc perfect 5', 'asc min 6', 'asc Maj 6', 'asc min 7', 'asc Maj 7', 'asc perfect 8',
        'harm min 2', 'harm Maj 2', 'harm min 3', 'harm Maj 3', 'harm perfect 4', 'harm Tritone', 'harm perfect 5', 'harm min 6', 'harm Maj 6', 'harm min 7', 'harm Maj 7', 'harm perfect 8'
    ];

    const data = transposedMatrix.map((col, colIndex) => ({
        id: `Interval ${colIndex + 1}`,  // Change the label to reflect intervals
        data: col.map((value, rowIndex) => ({
            x: labels[rowIndex],
            y: value
        }))
    }));

    
    return (
        <div style={{ height: '200px', width: '100%' }}>
          <ResponsiveHeatMap
                data={data}
                keys={labels}  // Use the custom labels array
                indexBy="id"
                colors={({ value }) => value === 1 ? 'green' : value === -1 ? 'red' : 'white'}
                margin={{ top: 50, right: 60, bottom: 60, left: 90 }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                    orient: 'bottom',
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 45,
                    legend: 'Intervals',
                    legendPosition: 'middle',
                    legendOffset: 50
                }}
                axisLeft={{
                    orient: 'left',
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'History',
                    legendPosition: 'middle',
                    legendOffset: -70
                }}
                cellOpacity={1}
                isInteractive={false}
                cellBorderColor={{ from: 'color', modifiers: [['darker', 0.4]] }}
                labelTextColor={{ from: 'color', modifiers: [['darker', 1.8]] }}
                cellHeight={15}
                cellWidth={15}
                legends={[
                    {
                        anchor: 'bottom-right',
                        direction: 'row',
                        translateY: 50,
                        itemsSpacing: 2,
                        itemWidth: 60,
                        itemHeight: 20,
                        itemTextColor: '#000',
                        symbolSize: 20,
                        symbolShape: 'square',
                        effects: []
                    }
                ]}
            />
        </div>
    );
};

export default ShowHeatMap;