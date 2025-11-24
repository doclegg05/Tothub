package com.tothub.timefold.dto;

import java.util.List;
import java.util.Objects;

public class SchedulingRequest {
    private List<Employee> employees;
    private List<Shift> shifts;
    private SchedulingConstraints constraints;

    // Default constructor
    public SchedulingRequest() {}

    // Constructor with all fields
    public SchedulingRequest(List<Employee> employees, List<Shift> shifts, SchedulingConstraints constraints) {
        this.employees = employees;
        this.shifts = shifts;
        this.constraints = constraints;
    }

    // Getters and Setters
    public List<Employee> getEmployees() { return employees; }
    public void setEmployees(List<Employee> employees) { this.employees = employees; }

    public List<Shift> getShifts() { return shifts; }
    public void setShifts(List<Shift> shifts) { this.shifts = shifts; }

    public SchedulingConstraints getConstraints() { return constraints; }
    public void setConstraints(SchedulingConstraints constraints) { this.constraints = constraints; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SchedulingRequest that = (SchedulingRequest) o;
        return Objects.equals(employees, that.employees) &&
                Objects.equals(shifts, that.shifts) &&
                Objects.equals(constraints, that.constraints);
    }

    @Override
    public int hashCode() {
        return Objects.hash(employees, shifts, constraints);
    }

    @Override
    public String toString() {
        return "SchedulingRequest{" +
                "employees=" + employees +
                ", shifts=" + shifts +
                ", constraints=" + constraints +
                '}';
    }
}
