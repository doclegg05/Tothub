import axios, { AxiosResponse } from 'axios';
import { z } from 'zod';

// Timefold API DTOs
const AvailabilitySchema = z.object({
  dayOfWeek: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  isPreferred: z.boolean()
});

const EmployeeSchema = z.object({
  id: z.string(),
  name: z.string(),
  skills: z.array(z.string()),
  availability: z.array(AvailabilitySchema),
  maxHoursPerWeek: z.number(),
  position: z.string(),
  isActive: z.boolean()
});

const ShiftSchema = z.object({
  id: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  requiredSkills: z.array(z.string()),
  room: z.string(),
  requiredStaff: z.number(),
  minStaff: z.number(),
  maxStaff: z.number(),
  shiftType: z.string()
});

const SchedulingConstraintsSchema = z.object({
  maxHoursPerWeek: z.number(),
  minHoursPerWeek: z.number(),
  maxConsecutiveDays: z.number(),
  minRestHoursBetweenShifts: z.number(),
  allowOvertime: z.boolean(),
  maxOvertimeHoursPerWeek: z.number(),
  childToStaffRatio: z.number(),
  requireLeadTeacherPerRoom: z.boolean(),
  allowSplitShifts: z.boolean()
});

const SchedulingRequestSchema = z.object({
  employees: z.array(EmployeeSchema),
  shifts: z.array(ShiftSchema),
  constraints: SchedulingConstraintsSchema
});

const AssignmentSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  employeeName: z.string(),
  shiftId: z.string(),
  room: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  status: z.string(),
  score: z.number()
});

const SchedulingResponseSchema = z.object({
  assignments: z.array(AssignmentSchema),
  totalScore: z.number(),
  status: z.string(),
  solvingTimeMs: z.number(),
  warnings: z.array(z.string()).nullable(),
  errors: z.array(z.string()).nullable()
});

export type TimefoldAvailability = z.infer<typeof AvailabilitySchema>;
export type TimefoldEmployee = z.infer<typeof EmployeeSchema>;
export type TimefoldShift = z.infer<typeof ShiftSchema>;
export type TimefoldConstraints = z.infer<typeof SchedulingConstraintsSchema>;
export type TimefoldRequest = z.infer<typeof SchedulingRequestSchema>;
export type TimefoldResponse = z.infer<typeof SchedulingResponseSchema>;
export type TimefoldAssignment = z.infer<typeof AssignmentSchema>;

export class TimefoldClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = 'http://localhost:8080', timeout: number = 30000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  /**
   * Generate optimal schedule using Timefold solver
   */
  async generateSchedule(request: TimefoldRequest): Promise<TimefoldResponse> {
    try {
      // Validate request
      const validatedRequest = SchedulingRequestSchema.parse(request);

      const response: AxiosResponse<TimefoldResponse> = await axios.post(
        `${this.baseUrl}/api/solve`,
        validatedRequest,
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Validate response
      const validatedResponse = SchedulingResponseSchema.parse(response.data);
      return validatedResponse;

    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(`Timefold API error: ${error.response.status} - ${error.response.data?.message || error.message}`);
        } else if (error.request) {
          throw new Error(`Timefold service unavailable: ${error.message}`);
        }
      }
      throw new Error(`Failed to generate schedule: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if Timefold service is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/health`, {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get solver status
   */
  async getSolverStatus(): Promise<string> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/solver-status`, {
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get solver status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Default client instance
export const timefoldClient = new TimefoldClient();
