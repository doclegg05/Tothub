import axios, { AxiosInstance } from 'axios';
import { z } from 'zod';

// Zod schemas for validation
const TimefoldAvailabilitySchema = z.object({
    dayOfWeek: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    preferred: z.boolean()
});

const TimefoldEmployeeSchema = z.object({
    id: z.string(),
    name: z.string(),
    skills: z.array(z.string()),
    availability: z.array(TimefoldAvailabilitySchema),
    maxHoursPerWeek: z.number(),
    position: z.string(),
    active: z.boolean()
});

const TimefoldShiftSchema = z.object({
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

const TimefoldConstraintsSchema = z.object({
    minStaffPerShift: z.number(),
    maxStaffPerShift: z.number(),
    requireLeadTeacher: z.boolean(),
    maxHoursPerWeek: z.number(),
    minRestBetweenShifts: z.number(),
    preferredShifts: z.array(z.string())
});

const TimefoldRequestSchema = z.object({
    employees: z.array(TimefoldEmployeeSchema),
    shifts: z.array(TimefoldShiftSchema),
    constraints: TimefoldConstraintsSchema
});

const TimefoldAssignmentSchema = z.object({
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

const TimefoldResponseSchema = z.object({
    assignments: z.array(TimefoldAssignmentSchema),
    score: z.number(),
    status: z.string(),
    solvingTime: z.number(),
    warnings: z.array(z.string()),
    errors: z.array(z.string())
});

// Type definitions
export type TimefoldAvailability = z.infer<typeof TimefoldAvailabilitySchema>;
export type TimefoldEmployee = z.infer<typeof TimefoldEmployeeSchema>;
export type TimefoldShift = z.infer<typeof TimefoldShiftSchema>;
export type TimefoldConstraints = z.infer<typeof TimefoldConstraintsSchema>;
export type TimefoldRequest = z.infer<typeof TimefoldRequestSchema>;
export type TimefoldResponse = z.infer<typeof TimefoldResponseSchema>;
export type TimefoldAssignment = z.infer<typeof TimefoldAssignmentSchema>;

export class TimefoldClient {
    private axiosInstance: AxiosInstance;
    private baseUrl: string;

    constructor(baseUrl: string = 'http://localhost:8080') {
        this.baseUrl = baseUrl;
        this.axiosInstance = axios.create({
            baseURL: this.baseUrl,
            timeout: 300000, // 5 minutes for solving
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    async generateSchedule(request: TimefoldRequest): Promise<TimefoldResponse> {
        try {
            // Validate request
            const validatedRequest = TimefoldRequestSchema.parse(request);
            
            const response = await this.axiosInstance.post('/api/solve', validatedRequest);
            
            // Validate response
            const validatedResponse = TimefoldResponseSchema.parse(response.data);
            
            return validatedResponse;
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
            }
            throw new Error(`Failed to generate schedule: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async healthCheck(): Promise<boolean> {
        try {
            const response = await this.axiosInstance.get('/api/health');
            return response.status === 200;
        } catch {
            return false;
        }
    }

    async getSolverStatus(): Promise<any> {
        try {
            const response = await this.axiosInstance.get('/api/solver-status');
            return response.data;
        } catch (error) {
            throw new Error(`Failed to get solver status: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}



