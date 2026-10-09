import { useState, useCallback } from 'react';
import { SidebarState } from '../types/sidebar.types';

/**
 * Custom hook to manage the state of the Sidebar component.
 * 
 * This hook encapsulates the logic for tracking the currently active
 * left rail icon and managing the expanded/collapsed state of the
 * right navigation panel.
 * 
 * @returns {SidebarState} An object containing the sidebar state and control functions.
 */
const useSidebar = (): SidebarState => {
  // Default active icon is 'dashboard'
  const [activeIconId, setActiveIconId] = useState<string>('dashboard');
  
  // Default state is expanded (true) as per the design reference
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  /**
   * Toggles the expanded state of the right navigation panel.
   * Memoized with useCallback to prevent unnecessary re-renders in child components.
   */
  const togglePanel = useCallback((): void => {
    setIsExpanded((prevState) => !prevState);
  }, []);

  /**
   * Selects a new active icon.
   * If the panel is currently collapsed, it automatically expands it.
   * 
   * @param {string} id - The ID of the selected rail icon.
   */
  const selectIcon = useCallback((id: string): void => {
    setActiveIconId(id);
    // If the user clicks an icon and the panel is collapsed, we auto-expand it.
    setIsExpanded(true);
  }, []);

  return {
    activeIconId,
    isExpanded,
    togglePanel,
    selectIcon,
  };
};

export default useSidebar;