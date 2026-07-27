import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email noto'g'ri formatda"),
  password: z.string().min(6, "Kamida 6 ta belgi"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Kamida 2 ta belgi"),
  email: z.string().email("Email noto'g'ri formatda"),
  password: z.string().min(6, "Kamida 6 ta belgi"),
  role: z.enum(["ADMIN", "TEACHER", "STUDENT"]),
});

export const groupSchema = z.object({
  name: z.string().min(1, "Guruh nomi kiritilishi shart"),
  description: z.string().optional(),
  teacherId: z.string().min(1, "O'qituvchi tanlanishi shart"),
});

export const groupStudentSchema = z.object({
  groupId: z.string().min(1, "Guruh tanlanishi shart"),
  studentId: z.string().min(1, "O'quvchi tanlanishi shart"),
});

export const attendanceSchema = z.object({
  groupId: z.string().min(1),
  date: z.string().min(1),
  records: z.array(
    z.object({
      studentId: z.string(),
      status: z.enum(["PRESENT", "ABSENT", "LATE"]),
    })
  ),
});

export const assignmentSchema = z.object({
  title: z.string().min(1, "Sarlavha kiritilishi shart"),
  description: z.string().optional(),
  dueDate: z.string().min(1, "Muhlat kiritilishi shart"),
  maxScore: z.number().min(1, "Maksimal ball 1 dan katta bo'lishi kerak").max(1000),
  groupId: z.string().min(1, "Guruh tanlanishi shart"),
  isPublished: z.boolean().optional(),
});

export const submissionSchema = z.object({
  assignmentId: z.string().min(1),
  content: z.string().optional(),
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
});

export const gradeSchema = z.object({
  grade: z.number().min(0, "Ball 0 dan kam bo'lishi mumkin emas"),
  feedback: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type GroupInput = z.infer<typeof groupSchema>;
export type AttendanceInput = z.infer<typeof attendanceSchema>;
export type AssignmentInput = z.infer<typeof assignmentSchema>;
export type SubmissionInput = z.infer<typeof submissionSchema>;
export type GradeInput = z.infer<typeof gradeSchema>;

export const classScheduleSchema = z.object({
  groupId: z.string().min(1),
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
});

export const monthlyPaymentSchema = z.object({
  groupId: z.string().min(1),
  amount: z.number().min(0, "Summa 0 dan katta bo'lishi kerak"),
  month: z.number().min(1).max(12),
  year: z.number().min(2024),
});

export type ClassScheduleInput = z.infer<typeof classScheduleSchema>;
export type MonthlyPaymentInput = z.infer<typeof monthlyPaymentSchema>;
