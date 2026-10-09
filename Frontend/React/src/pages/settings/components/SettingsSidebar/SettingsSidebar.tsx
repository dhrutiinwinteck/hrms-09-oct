import React from 'react';
import { Lock, Shield } from 'lucide-react';
import { SettingsSidebarProps } from '../../types/settings.types';
import './SettingsSidebar.css';

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  activeItemId = 'change-password',
}) => {
  const getContent = (id: string) => {
    switch (id) {
      case 'change-password':
        return {
          icon: Lock,
          headingPrefix: 'Change',
          headingHighlight: 'Password',
          description: 'Update your password to keep your account secure and protect your data.',
        };
      case 'permissions':
        return {
          icon: Shield,
          headingPrefix: 'Permission',
          headingHighlight: 'Management',
          description: 'Control access and assign permissions to users and roles.',
        };
      default:
        return {
          icon: Lock,
          headingPrefix: 'Change',
          headingHighlight: 'Password',
          description: 'Update your password to keep your account secure and protect your data.',
        };
    }
  };

  const content = getContent(activeItemId);
  const Icon = content.icon;

  return (
    <div className="settings-sidebar" role="complementary">
      <div className="settings-sidebar__illustration" aria-hidden="true">
        <Icon size={64} strokeWidth={1.5} />
      </div>
      <h1 className="settings-sidebar__heading">
        {content.headingPrefix}{' '}
        <span className="settings-sidebar__heading-highlight">
          {content.headingHighlight}
        </span>
      </h1>
      <div className="settings-sidebar__divider" />
      <p className="settings-sidebar__description">{content.description}</p>
    </div>
  );
};

export default SettingsSidebar;