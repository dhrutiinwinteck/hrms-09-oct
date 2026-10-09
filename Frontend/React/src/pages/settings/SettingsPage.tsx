import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { SettingsSidebar } from './components/SettingsSidebar/SettingsSidebar';
import { ChangePassword } from './components/ChangePassword/ChangePassword';
import PermissionManagement from './components/PermissionManagement/PermissionManagement';
import { SettingsNavItemId } from './constants/settings.constants';
import './SettingsPage.css';

export const SettingsPage: React.FC = () => {
  const location = useLocation();
  const [activeItemId, setActiveItemId] = useState<SettingsNavItemId>('change-password');

  // Sync activeItemId with the current route
  useEffect(() => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1] || 'change-password';
    if (lastSegment === 'change-password' || lastSegment === 'permissions') {
      setActiveItemId(lastSegment as SettingsNavItemId);
    } else {
      setActiveItemId('change-password');
    }
  }, [location]);

  const handleNavItemClick = useCallback((itemId: string) => {
    setActiveItemId(itemId as SettingsNavItemId);
  }, []);

  const renderContent = useCallback(() => {
    switch (activeItemId) {
      case 'change-password':
        return <ChangePassword />;
      case 'permissions':
        return <PermissionManagement />;
      default:
        return <ChangePassword />;
    }
  }, [activeItemId]);

  const isPermissions = activeItemId === 'permissions';

  return (
    <div className={`settings-page ${isPermissions ? 'settings-page--permissions' : ''}`}>
      {/* Decorative elements – hidden when in permissions mode via CSS */}
      {!isPermissions && (
        <>
          <div className="settings-page__bg-circle settings-page__bg-circle--top-left" aria-hidden="true" />
          <div className="settings-page__bg-circle settings-page__bg-circle--bottom-right" aria-hidden="true" />
          <div className="settings-page__plant" aria-hidden="true" />
        </>
      )}

      {/* Main card */}
      <div className="settings-page__card">
        {!isPermissions && (
          <>
            <div className="settings-page__panel settings-page__panel--left">
              <SettingsSidebar activeItemId={activeItemId} onItemClick={handleNavItemClick} />
            </div>
            <div className="settings-page__divider" aria-hidden="true" />
          </>
        )}
        <div className={`settings-page__panel settings-page__panel--right ${isPermissions ? 'settings-page__panel--full' : ''}`}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;