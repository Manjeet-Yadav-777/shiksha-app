export type NavItem =
  | {
      label: string;
      to: string;
    }
  | {
      label: string;
      children: {
        label: string;
        to: string;
      }[];
    };

export const navigation: Record<
  string,
  {
    left: NavItem[];
    right: NavItem[];
  }
> = {
  super_admin: {
    left: [
      { label: 'Tenants', to: '/super-admin/tenants' },
      { label: 'Payments', to: '/super-admin/payments' },
    ],
    right: [],
  },

  school_admin: {
    left: [
      { label: 'Dashboard', to: '/school_admin/dashboard' },

      {
        label: 'Users',
        children: [
          {
            label: 'Students',
            to: '/admin/students',
          },
          {
            label: 'Teachers',
            to: '/admin/teachers',
          },
          {
            label: 'Parents',
            to: '/admin/parents',
          },
        ],
      },
    ],

    right: [
      {
        label: 'Finance',
        children: [
          {
            label: 'Fees Structure',
            to: '/admin/fees',
          },
          {
            label: 'Student Fees',
            to: '/admin/student-fees',
          },
        ],
      },
      {
        label: 'Academics',
        children: [
          {
            label: 'Classes',
            to: '/admin/classes',
          },
          {
            label: 'Subjects',
            to: '/admin/subjects',
          },
          {
            label: 'Time Table',
            to: '/admin/timetable',
          },
        ],
      },
    ],
  },

  teacher: {
    left: [
      { label: 'Dashboard', to: '/teacher/dashboard' },
      { label: 'Attendance', to: '/teacher/attendance' },
    ],
    right: [],
  },

  student: {
    left: [{ label: 'Dashboard', to: '/student/dashboard' }],
    right: [],
  },

  parent: {
    left: [{ label: 'Dashboard', to: '/parent/dashboard' }],
    right: [],
  },
};
