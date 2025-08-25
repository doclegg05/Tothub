package com.tothub.timefold.domain;

import ai.timefold.solver.core.api.domain.entity.PlanningEntity;
import ai.timefold.solver.core.api.domain.variable.PlanningVariable;
import com.tothub.timefold.domain.solver.EmployeeStrengthComparator;

import java.util.List;
import java.util.Objects;

@PlanningEntity
public class Employee {
    private String id;
    private String name;
    private List<String> skills;
    private List<Availability> availability;
    private int maxHoursPerWeek;
    private String position;
    private boolean isActive;

    @PlanningVariable(valueRangeProviderRefs = {"shiftRange"})
    private Shift shift;

    // Default constructor
    public Employee() {}

    // Constructor with all fields
    public Employee(String id, String name, List<String> skills, List<Availability> availability, 
                   int maxHoursPerWeek, String position, boolean isActive) {
        this.id = id;
        this.name = name;
        this.skills = skills;
        this.availability = availability;
        this.maxHoursPerWeek = maxHoursPerWeek;
        this.position = position;
        this.isActive = isActive;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public List<Availability> getAvailability() { return availability; }
    public void setAvailability(List<Availability> availability) { this.availability = availability; }

    public int getMaxHoursPerWeek() { return maxHoursPerWeek; }
    public void setMaxHoursPerWeek(int maxHoursPerWeek) { this.maxHoursPerWeek = maxHoursPerWeek; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public boolean isActive() { return isActive; }
    public void setIsActive(boolean active) { isActive = active; }

    public Shift getShift() { return shift; }
    public void setShift(Shift shift) { this.shift = shift; }

    // Helper methods
    public boolean hasSkill(String skill) {
        return skills != null && skills.contains(skill);
    }

    public boolean isAvailableForShift(Shift shift) {
        if (availability == null || availability.isEmpty()) {
            return false;
        }
        
        return availability.stream().anyMatch(avail -> 
            avail.getDayOfWeek() == shift.getDate().getDayOfWeek() &&
            avail.getStartTime().compareTo(shift.getStartTime()) <= 0 &&
            avail.getEndTime().compareTo(shift.getEndTime()) >= 0
        );
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Employee employee = (Employee) o;
        return Objects.equals(id, employee.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Employee{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", position='" + position + '\'' +
                ", shift=" + (shift != null ? shift.getId() : "unassigned") +
                '}';
    }
}
