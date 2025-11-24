package com.tothub.timefold.domain;

import ai.timefold.solver.core.api.domain.solution.PlanningEntityCollectionProperty;
import ai.timefold.solver.core.api.domain.solution.PlanningScore;
import ai.timefold.solver.core.api.domain.solution.PlanningSolution;
import ai.timefold.solver.core.api.domain.solution.ProblemFactCollectionProperty;
import ai.timefold.solver.core.api.domain.valuerange.ValueRangeProvider;
import ai.timefold.solver.core.api.score.buildin.hardsoft.HardSoftScore;

import java.util.List;
import java.util.Objects;

@PlanningSolution
public class Schedule {
    
    @PlanningEntityCollectionProperty
    private List<Employee> employees;
    
    @ProblemFactCollectionProperty
    private List<Shift> shifts;
    
    @PlanningScore
    private HardSoftScore score;

    // Default constructor
    public Schedule() {}

    // Constructor with all fields
    public Schedule(List<Employee> employees, List<Shift> shifts) {
        this.employees = employees;
        this.shifts = shifts;
    }

    // Getters and Setters
    public List<Employee> getEmployees() { return employees; }
    public void setEmployees(List<Employee> employees) { this.employees = employees; }

    public List<Shift> getShifts() { return shifts; }
    public void setShifts(List<Shift> shifts) { this.shifts = shifts; }

    public HardSoftScore getScore() { return score; }
    public void setScore(HardSoftScore score) { this.score = score; }

    // Value range providers
    @ValueRangeProvider(id = "employeeRange")
    public List<Employee> getEmployeeRange() {
        return employees;
    }

    @ValueRangeProvider(id = "shiftRange")
    public List<Shift> getShiftRange() {
        return shifts;
    }

    // Helper methods
    public boolean isFeasible() {
        return score != null && score.hardScore() >= 0;
    }

    public boolean isOptimal() {
        return score != null && score.hardScore() == 0 && score.softScore() >= 0;
    }

    public int getTotalAssignments() {
        return shifts.stream()
                .mapToInt(shift -> shift.getAssignedEmployees() != null ? shift.getAssignedEmployees().size() : 0)
                .sum();
    }

    public int getUnassignedShifts() {
        return (int) shifts.stream()
                .filter(shift -> shift.getAssignedEmployees() == null || shift.getAssignedEmployees().isEmpty())
                .count();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Schedule schedule = (Schedule) o;
        return Objects.equals(employees, schedule.employees) &&
                Objects.equals(shifts, schedule.shifts);
    }

    @Override
    public int hashCode() {
        return Objects.hash(employees, shifts);
    }

    @Override
    public String toString() {
        return "Schedule{" +
                "employees=" + (employees != null ? employees.size() : 0) +
                ", shifts=" + (shifts != null ? shifts.size() : 0) +
                ", score=" + score +
                ", feasible=" + isFeasible() +
                ", optimal=" + isOptimal() +
                '}';
    }
}
