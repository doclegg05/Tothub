package com.tothub.timefold.dto;

import java.util.List;
import java.util.Objects;

public class Employee {
    private String id;
    private String name;
    private List<String> skills;
    private List<Availability> availability;
    private int maxHoursPerWeek;
    private String position;
    private boolean isActive;

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
                ", skills=" + skills +
                ", position='" + position + '\'' +
                ", isActive=" + isActive +
                '}';
    }
}
