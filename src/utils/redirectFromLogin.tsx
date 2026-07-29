import type { NavigateFunction } from 'react-router-dom';
import type { IRole } from '../helpers/Wording';

export function redirectFromLogin(
  res: { data: { role: IRole } },
  navigate: NavigateFunction,
) {
  const role = res.data.role;
  if (role === 'super_admin') {
    navigate('/super_admin/dashboard');
  } else if (role === 'school_admin') {
    navigate('/school_admin/dashboard');
  } else if (role === 'teacher') {
    navigate('/teacher/dashboard');
  } else if (role === 'student') {
    navigate('/student/dashboard');
  } else if (role === 'parent') {
    navigate('/parent/dashboard');
  }
}
