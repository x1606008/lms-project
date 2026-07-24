export const ROLES = {
  ADMIN: "ADMIN",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
} as const;

export const ATTENDANCE_STATUS = {
  PRESENT: "PRESENT",
  ABSENT: "ABSENT",
  LATE: "LATE",
} as const;

export const SUBMISSION_STATUS = {
  PENDING: "PENDING",
  GRADED: "GRADED",
  RETURNED: "RETURNED",
} as const;

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrator",
  TEACHER: "O'qituvchi",
  STUDENT: "O'quvchi",
};

export const ATTENDANCE_LABELS: Record<string, string> = {
  PRESENT: "Keldi",
  ABSENT: "Kelmadi",
  LATE: "Sababli",
};

export const SUBMISSION_LABELS: Record<string, string> = {
  PENDING: "Tekshirilmagan",
  GRADED: "Baholangan",
  RETURNED: "Qaytarilgan",
};

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  ADMIN_DASHBOARD: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_GROUPS: "/admin/groups",
  ADMIN_SETTINGS: "/admin/settings",
  TEACHER_DASHBOARD: "/teacher",
  TEACHER_GROUPS: "/teacher/groups",
  TEACHER_ATTENDANCE: "/teacher/attendance",
  TEACHER_ASSIGNMENTS: "/teacher/assignments",
  TEACHER_GRADES: "/teacher/grades",
  STUDENT_DASHBOARD: "/student",
  STUDENT_ASSIGNMENTS: "/student/assignments",
  STUDENT_GRADES: "/student/grades",
  STUDENT_ATTENDANCE: "/student/attendance",
} as const;
