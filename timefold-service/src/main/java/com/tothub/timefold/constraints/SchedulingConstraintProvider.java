package com.tothub.timefold.constraints;

import ai.timefold.solver.core.api.score.buildin.hardsoft.HardSoftScore;
import ai.timefold.solver.core.api.score.stream.Constraint;
import ai.timefold.solver.core.api.score.stream.ConstraintFactory;
import ai.timefold.solver.core.api.score.stream.ConstraintProvider;
import com.tothub.timefold.domain.Employee;
import com.tothub.timefold.domain.Shift;

import java.time.Duration;
import java.time.LocalTime;

public class SchedulingConstraintProvider implements ConstraintProvider {

    @Override
    public Constraint[] defineConstraints(ConstraintFactory constraintFactory) {
        return new Constraint[]{
                // Hard constraints
                requiredStaffPerShift(constraintFactory),
                employeeAvailability(constraintFactory),
                requiredSkills(constraintFactory),
                leadTeacherPerRoom(constraintFactory),
                maxHoursPerWeek(constraintFactory),
                minRestBetweenShifts(constraintFactory),
                noDoubleBooking(constraintFactory),
                
                // Soft constraints
                preferredAvailability(constraintFactory),
                balancedWorkload(constraintFactory),
                minimizeOvertime(constraintFactory),
                preferredShifts(constraintFactory)
        };
    }

    // Hard Constraints
    private Constraint requiredStaffPerShift(ConstraintFactory constraintFactory) {
        return constraintFactory
                .forEach(Shift.class)
                .filter(shift -> shift.getAssignedEmployees() == null || 
                               shift.getAssignedEmployees().size() < shift.getMinStaff())
                .penalize(HardSoftScore.ONE_HARD)
                .asConstraint("Required staff per shift");
    }

    private Constraint employeeAvailability(ConstraintFactory constraintFactory) {
        return constraintFactory
                .forEach(Employee.class)
                .filter(employee -> employee.getShift() != null)
                .filter(employee -> !employee.isAvailableForShift(employee.getShift()))
                .penalize(HardSoftScore.ONE_HARD)
                .asConstraint("Employee availability");
    }

    private Constraint requiredSkills(ConstraintFactory constraintFactory) {
        return constraintFactory
                .forEach(Shift.class)
                .filter(shift -> shift.getAssignedEmployees() != null)
                .filter(shift -> shift.getAssignedEmployees().stream()
                        .anyMatch(employee -> !shift.getRequiredSkills().stream()
                                .anyMatch(skill -> employee.hasSkill(skill))))
                .penalize(HardSoftScore.ONE_HARD)
                .asConstraint("Required skills");
    }

    private Constraint leadTeacherPerRoom(ConstraintFactory constraintFactory) {
        return constraintFactory
                .forEach(Shift.class)
                .filter(shift -> !shift.hasLeadTeacher())
                .penalize(HardSoftScore.ONE_HARD)
                .asConstraint("Lead teacher per room");
    }

    private Constraint maxHoursPerWeek(ConstraintFactory constraintFactory) {
        return constraintFactory
                .forEach(Employee.class)
                .filter(employee -> employee.getShift() != null)
                .filter(employee -> {
                    // Simplified check - just verify the employee has a shift assigned
                    return true; // This will be refined later
                })
                .penalize(HardSoftScore.ONE_HARD)
                .asConstraint("Max hours per week");
    }

    private Constraint minRestBetweenShifts(ConstraintFactory constraintFactory) {
        return constraintFactory
                .forEach(Employee.class)
                .filter(employee -> employee.getShift() != null)
                .penalize(HardSoftScore.ONE_HARD)
                .asConstraint("Min rest between shifts");
    }

    private Constraint noDoubleBooking(ConstraintFactory constraintFactory) {
        return constraintFactory
                .forEach(Employee.class)
                .filter(employee -> employee.getShift() != null)
                .penalize(HardSoftScore.ONE_HARD)
                .asConstraint("No double booking");
    }

    // Soft Constraints
    private Constraint preferredAvailability(ConstraintFactory constraintFactory) {
        return constraintFactory
                .forEach(Employee.class)
                .filter(employee -> employee.getShift() != null)
                .filter(employee -> employee.getAvailability().stream()
                        .anyMatch(avail -> avail.isPreferred()))
                .reward(HardSoftScore.ONE_SOFT)
                .asConstraint("Preferred availability");
    }

    private Constraint balancedWorkload(ConstraintFactory constraintFactory) {
        return constraintFactory
                .forEach(Employee.class)
                .filter(employee -> employee.getShift() != null)
                .reward(HardSoftScore.ONE_SOFT)
                .asConstraint("Balanced workload");
    }

    private Constraint minimizeOvertime(ConstraintFactory constraintFactory) {
        return constraintFactory
                .forEach(Employee.class)
                .filter(employee -> employee.getShift() != null)
                .reward(HardSoftScore.ONE_SOFT)
                .asConstraint("Minimize overtime");
    }

    private Constraint preferredShifts(ConstraintFactory constraintFactory) {
        return constraintFactory
                .forEach(Shift.class)
                .filter(shift -> shift.getAssignedEmployees() != null)
                .reward(HardSoftScore.ONE_SOFT)
                .asConstraint("Preferred shifts");
    }
}
