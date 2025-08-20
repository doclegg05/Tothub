package com.tothub.timefold.service;

import ai.timefold.solver.core.api.solver.Solver;
import ai.timefold.solver.core.api.solver.SolverFactory;
import com.tothub.timefold.domain.Schedule;
import com.tothub.timefold.dto.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SchedulingService {

    private final SolverFactory<Schedule> solverFactory;

    public SchedulingService(SolverFactory<Schedule> solverFactory) {
        this.solverFactory = solverFactory;
    }

    public SchedulingResponse solve(SchedulingRequest request) {
        long startTime = System.currentTimeMillis();
        
        try {
            // Convert DTOs to domain objects
            Schedule schedule = convertToDomain(request);
            
            // Solve using Timefold
            Solver<Schedule> solver = solverFactory.buildSolver();
            Schedule solvedSchedule = solver.solve(schedule);
            
            // Convert solution back to DTOs
            List<Assignment> assignments = convertToAssignments(solvedSchedule);
            
            long solvingTime = System.currentTimeMillis() - startTime;
            
            return new SchedulingResponse(
                assignments,
                solvedSchedule.getScore() != null ? solvedSchedule.getScore().getSoftScore() : 0.0,
                solvedSchedule.isFeasible() ? (solvedSchedule.isOptimal() ? "optimal" : "feasible") : "infeasible",
                solvingTime,
                List.of(), // warnings
                List.of()  // errors
            );
            
        } catch (Exception e) {
            long solvingTime = System.currentTimeMillis() - startTime;
            System.err.println("ERROR in SchedulingService.solve(): " + e.getMessage());
            e.printStackTrace();
            return new SchedulingResponse(
                List.of(),
                0.0,
                "error",
                solvingTime,
                List.of(),
                List.of("Error during solving: " + e.getMessage())
            );
        }
    }

    private Schedule convertToDomain(SchedulingRequest request) {
        try {
            System.out.println("Converting request to domain...");
            System.out.println("Employees: " + request.getEmployees().size());
            System.out.println("Shifts: " + request.getShifts().size());
            
            // Convert employees
            List<com.tothub.timefold.domain.Employee> employees = request.getEmployees().stream()
                    .map(this::convertEmployee)
                    .collect(Collectors.toList());

            // Convert shifts
            List<com.tothub.timefold.domain.Shift> shifts = request.getShifts().stream()
                    .map(this::convertShift)
                    .collect(Collectors.toList());

            Schedule schedule = new Schedule(employees, shifts);
            System.out.println("Domain conversion successful");
            return schedule;
        } catch (Exception e) {
            System.err.println("ERROR in convertToDomain: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    private com.tothub.timefold.domain.Employee convertEmployee(Employee dto) {
        List<com.tothub.timefold.domain.Availability> availability = dto.getAvailability().stream()
                .map(this::convertAvailability)
                .collect(Collectors.toList());

        return new com.tothub.timefold.domain.Employee(
            dto.getId(),
            dto.getName(),
            dto.getSkills(),
            availability,
            dto.getMaxHoursPerWeek(),
            dto.getPosition(),
            dto.isActive()
        );
    }

    private com.tothub.timefold.domain.Availability convertAvailability(Availability dto) {
        return new com.tothub.timefold.domain.Availability(
            dto.getDayOfWeek(),
            dto.getStartTime(),
            dto.getEndTime(),
            dto.isPreferred()
        );
    }

    private com.tothub.timefold.domain.Shift convertShift(Shift dto) {
        return new com.tothub.timefold.domain.Shift(
            dto.getId(),
            dto.getDate(),
            dto.getStartTime(),
            dto.getEndTime(),
            dto.getRequiredSkills(),
            dto.getRoom(),
            dto.getRequiredStaff(),
            dto.getMinStaff(),
            dto.getMaxStaff(),
            dto.getShiftType()
        );
    }

    private List<Assignment> convertToAssignments(Schedule schedule) {
        return schedule.getShifts().stream()
                .filter(shift -> shift.getAssignedEmployees() != null)
                .flatMap(shift -> shift.getAssignedEmployees().stream()
                        .map(employee -> new Assignment(
                            generateAssignmentId(employee.getId(), shift.getId()),
                            employee.getId(),
                            employee.getName(),
                            shift.getId(),
                            shift.getRoom(),
                            shift.getDate().toString(),
                            shift.getStartTime().toString(),
                            shift.getEndTime().toString(),
                            "assigned",
                            schedule.getScore() != null ? schedule.getScore().getSoftScore() : 0.0
                        )))
                .collect(Collectors.toList());
    }

    private String generateAssignmentId(String employeeId, String shiftId) {
        return employeeId + "_" + shiftId;
    }
}
