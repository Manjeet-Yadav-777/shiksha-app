export const navigation = {
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
      { label: 'Students', to: '/admin/students' },
      { label: 'Teachers', to: '/admin/teachers' },
      { label: 'Parents', to: '/admin/parents' },
    ],

    right: [
      { label: 'Fees', to: '/admin/fees' },
      { label: 'Time Table', to: '/admin/timetable' },
      { label: 'Reports', to: '/admin/reports' },
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
