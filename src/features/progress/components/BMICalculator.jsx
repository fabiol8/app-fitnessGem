import React from 'react';
import { Card, ProgressBar } from '../../../components/ui';
import { calculateBMI, getBMIStatus } from '../../../utils/calculations';

const BMICalculator = ({ weight, height, className = '' }) => {
  if (!weight || !height) {
    return (
      <Card padding="md" className={className}>
        <h3 className="font-semibold text-gray-800 mb-2">BMI Calculator</h3>
        <p className="text-sm text-gray-500">
          Inserisci peso e altezza per calcolare il BMI
        </p>
      </Card>
    );
  }

  const bmi = calculateBMI(weight, height);
  const bmiStatus = getBMIStatus(bmi);

  const getBMIProgress = (bmi) => {
    // Convert BMI to progress percentage (18.5-30 range)
    const minBMI = 18.5;
    const maxBMI = 30;
    const normalizedBMI = Math.max(minBMI, Math.min(maxBMI, bmi));
    return ((normalizedBMI - minBMI) / (maxBMI - minBMI)) * 100;
  };

  const getProgressVariant = (bmi) => {
    if (bmi < 18.5) return 'info';
    if (bmi < 25) return 'success';
    if (bmi < 30) return 'warning';
    return 'danger';
  };

  return (
    <Card padding="md" className={`${bmiStatus.bgColor} ${className}`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-800">BMI Calculator</h3>
        <span className={`text-lg font-bold ${bmiStatus.color}`}>
          {bmi.toFixed(1)}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Stato BMI</span>
            <span className={`font-medium ${bmiStatus.color}`}>
              {bmiStatus.category}
            </span>
          </div>

          <ProgressBar
            value={getBMIProgress(bmi)}
            variant={getProgressVariant(bmi)}
            size="md"
            className="mb-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div>
            <span className="font-medium">Peso:</span> {weight}kg
          </div>
          <div>
            <span className="font-medium">Altezza:</span> {height}cm
          </div>
        </div>

        {/* BMI Scale Reference */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Sottopeso</span>
              <span>&lt; 18.5</span>
            </div>
            <div className="flex justify-between">
              <span>Normale</span>
              <span>18.5 - 24.9</span>
            </div>
            <div className="flex justify-between">
              <span>Sovrappeso</span>
              <span>25.0 - 29.9</span>
            </div>
            <div className="flex justify-between">
              <span>Obeso</span>
              <span>&gt; 30.0</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BMICalculator;