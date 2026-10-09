/**
 * Defines the structure for a single navigation item within a panel.
 */
export interface NavigationItem {
  /** The unique identifier and label for the item. */
  label: string;
  /** The URL path this item navigates to. */
  path: string;
  /** Optional sub-items for nested navigation. */
  children?: NavigationItem[];
}

/**
 * Defines the structure for a categorized section of menu items.
 */
export interface NavigationSection {
  /** The title/heading of the section (e.g., "DASHBOARD"). */
  title: string;
  /** Array of menu items belonging to this section. */
  items: NavigationItem[];
}

/**
 * Defines the structure for a single Icon in the left rail.
 */
export interface RailIcon {
  /** The unique identifier for the icon (used for mapping and active state). */
  id: string;
  /** The Lucide React component to render. */
  icon: React.ElementType;
  /** The label for accessibility and tooltips (optional). */
  label?: string;
}

/**
 * The props accepted by the NavigationPanel component.
 */
export interface NavigationPanelProps {
  /** The identifier of the currently selected icon to determine which menu to show. */
  activeIconId: string;
}

/**
 * The return type of the useSidebar hook.
 */
export interface SidebarState {
  /** Boolean indicating if the right navigation panel is expanded. */
  isExpanded: boolean;
  /** The ID of the currently active/selected rail icon. */
  activeIconId: string;
  /** Function to toggle the panel's expanded state. */
  togglePanel: () => void;
  /** Function to select a new rail icon and update the menu. */
  selectIcon: (id: string) => void;
}