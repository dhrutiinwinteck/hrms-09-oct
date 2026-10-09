import React from 'react';
import { PasswordStrengthProps } from '../../types/settings.types';
import { getPasswordStrengthLevel, getPasswordStrengthMeta } from '../../utils/passwordStrength';
import { PASSWORD_STRENGTH_DOT_COUNT, STRENGTH_LEVELS_ORDERED } from '../../constants/settings.constants';
import './PasswordStrength.css';

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  password,
  showLabel = true,
  className = '',
}) => {
  const currentLevel = getPasswordStrengthLevel(password);
  const currentMeta = getPasswordStrengthMeta(password);
  const score = currentLevel === 'none' ? 0 : STRENGTH_LEVELS_ORDERED.indexOf(currentLevel);

  return (
    <div className={`password-strength ${className}`} role="presentation">
      <div className="password-strength__dots" aria-hidden="true">
        {Array.from({ length: PASSWORD_STRENGTH_DOT_COUNT }, (_, index) => {
          const isFilled = index < score;
          return (
            <span
              key={index}
              className={`password-strength__dot ${isFilled ? 'dot-filled' : 'dot-empty'}`}
              style={{ backgroundColor: isFilled ? currentMeta.colorHex : '#D1D5DB' }}
            />
          );
        })}
      </div>
      {showLabel && password && (
        <span className={`password-strength__label label-${currentLevel}`} style={{ color: currentMeta.colorHex }}>
          {currentMeta.label}
        </span>
      )}
    </div>
  );
};

export default PasswordStrength;