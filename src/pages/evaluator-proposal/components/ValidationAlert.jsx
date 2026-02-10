import React from 'react';
import Icon from '../../../components/AppIcon';

const ValidationAlert = ({ errors }) => {
  if (!errors || errors?.length === 0) return null;

  return (
    <div className="bg-error/10 border border-error/20 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <Icon name="AlertCircle" size={20} color="var(--color-error)" className="flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-error mb-2">
            Formulir belum lengkap
          </h4>
          <ul className="space-y-1">
            {errors?.map((error, index) => (
              <li key={index} className="text-sm text-error/90 flex items-start space-x-2">
                <span className="text-error mt-1">•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ValidationAlert;