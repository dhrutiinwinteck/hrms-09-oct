/**
 * Enterprise HRMS Dashboard Mock Data
 * Provides realistic mock data for the dashboard components.
 */

import { HighlightItem } from "../pages/dashboard/components/HighlightsCard/HighlightsCard";
import { TimelineActivity } from "../pages/dashboard/components/TimelineCard/TimelineCard";
import { AnnouncementItem } from "../pages/dashboard/components/AnnouncementCard/AnnouncementCard";

/**
 * Interface for the overall dashboard mock data structure.
 */
export interface DashboardMockData {
  topNavbar: {
    employeeName: string;
    employeeRole: string;
    searchPlaceholder: string;
    notificationCount: number;
  };
  welcomeBanner: {
    greeting: string;
    message: string;
  };
  statsCards: Array<{
    id: string;
    title: string;
    value: string;
    subtitle: string;
    footer: string;
    progress: number;
    variant: "default" | "green" | "blue";
  }>;
  punchCard: {
    currentTime: string;
    title: string;
    description: string;
  };
  highlights: {
    title: string;
    items: HighlightItem[];
  };
  timeline: {
    title: string;
    activities: TimelineActivity[];
  };
  announcements: {
    title: string;
    items: AnnouncementItem[];
  };
  notices: Array<{
    id: string;
    title: string;
    description: string;
    buttonText: string;
    date: string;
    status?: "new" | "urgent" | "reminder" | string;
  }>;
}

export const dashboardMock: DashboardMockData = {
  topNavbar: {
    employeeName: "Varun Sharma",
    employeeRole: "HR Manager",
    searchPlaceholder: "Search employees, reports, documents etc.",
    notificationCount: 3,
  },

  welcomeBanner: {
    greeting: "Good Morning, Varun! 👋",
    message: "Stay positive,\nwork hard,\nmake it happen.",
  },

  statsCards: [
    {
      id: "attendance",
      title: "Today's Attendance",
      value: "98%",
      subtitle: "Daily attendance rate",
      footer: "+5% from yesterday",
      progress: 98,
      variant: "green",
    },
    {
      id: "working-hours",
      title: "Working Hours",
      value: "7h 32m",
      subtitle: "Total hours logged",
      footer: "1h 28m remaining",
      progress: 65,
      variant: "blue",
    },
    {
      id: "leave-requests",
      title: "Leave Requests",
      value: "12",
      subtitle: "Pending approvals",
      footer: "8 approved this week",
      progress: 45,
      variant: "default",
    },
    {
      id: "total-employees",
      title: "Total Employees",
      value: "1,024",
      subtitle: "Active workforce",
      footer: "12 new hires this month",
      progress: 80,
      variant: "green",
    },
  ],

  punchCard: {
    currentTime: new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
    title: "Ready to get started?",
    description: "You are currently not punched in.",
  },

  highlights: {
    title: "Today's Highlights",
    items: [
      {
        id: "1",
        title: "Board Meeting",
        subtitle: "10:00 AM - Conference Room A",
        status: "info",
        icon: "📋", // Corrected: Passed as a string instead of JSX
      },
      {
        id: "2",
        title: "Employee Birthday",
        subtitle: "Priya Patel - Marketing",
        status: "success",
        icon: "🎂", // Corrected
      },
      {
        id: "3",
        title: "Pending Reports",
        subtitle: "Q3 Financial Review",
        status: "warning",
        icon: "📊", // Corrected
      },
      {
        id: "4",
        title: "Upcoming Training",
        subtitle: "Leadership Workshop - Friday",
        status: "neutral",
        icon: "📚", // Corrected
      },
    ],
  },

  timeline: {
    title: "Activity Timeline",
    activities: [
      {
        id: "1",
        time: "09:15 AM",
        title: "Leave Request Approved",
        description: "Rahul Kumar - Casual Leave",
      },
      {
        id: "2",
        time: "10:00 AM",
        title: "New Employee Onboarding",
        description: "Sneha Rao joined as UX Designer",
      },
      {
        id: "3",
        time: "11:30 AM",
        title: "Payroll Processed",
        description: "November payroll completed",
      },
      {
        id: "4",
        time: "01:45 PM",
        title: "Asset Request",
        description: "New laptops for IT department",
      },
    ],
  },

  announcements: {
    title: "Recent Announcements",
    items: [
      {
        id: "1",
        title: "Q4 Performance Reviews",
        date: "Nov 15, 2025",
        description:
          "All managers must complete performance reviews by Nov 30.",
        priority: "high",
      },
      {
        id: "2",
        title: "System Maintenance",
        date: "Nov 18, 2025",
        description: "HRMS will be offline for maintenance this Sunday.",
        priority: "medium",
      },
      {
        id: "3",
        title: "New Policy Update",
        date: "Nov 10, 2025",
        description: "Work from home policy revised effective December 1st.",
        priority: "low",
      },
    ],
  },

  notices: [
    {
      id: "1",
      title: "Remote Work Policy Update",
      date: "Nov 14, 2023",
      status: "new",
      description: "", // optional, but can be added if needed
      buttonText: "", // optional
    },
    {
    id: '2',
    title: 'Remote Work Policy Update',
    date: 'Nov 14, 2023',
    status: 'new',
    description: '',    // optional, but can be added if needed
    buttonText: '',     // optional
  },
  {
    id: '3',
    title: 'Remote Work Policy Update',
    date: 'Nov 14, 2023',
    status: 'new',
    description: '',    // optional, but can be added if needed
    buttonText: '',     // optional
  },
  ],
};
