package com.tothub.timefold.domain;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Objects;

public class Shift {
    private String id;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private List<String> requiredSkills;
    private String room;
    private int requiredStaff;
    private int minStaff;
    private int maxStaff;
    private String shiftType;

    private List<Employee> assignedEmployees;

    // Default constructor
    public Shift() {}

    // Constructor with all fields
    public Shift(String id, LocalDate date, LocalTime startTime, LocalTime endTime, 
                List<String> requiredSkills, String room, int requiredStaff, 
                int minStaff, int maxStaff, String shiftType) {
        this.id = id;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.requiredSkills = requiredSkills;
        this.room = room;
        this.requiredStaff = requiredStaff;
        this.minStaff = minStaff;
        this.maxStaff = maxStaff;
        this.shiftType = shiftType;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public List<String> getRequiredSkills() { return requiredSkills; }
    public void setRequiredSkills(List<String> requiredSkills) { this.requiredSkills = requiredSkills; }

    public String getRoom() { return room; }
    public void setRoom(String room) { this.room = room; }

    public int getRequiredStaff() { return requiredStaff; }
    public void setRequiredStaff(int requiredStaff) { this.requiredStaff = requiredStaff; }

    public int getMinStaff() { return minStaff; }
    public void setMinStaff(int minStaff) { this.minStaff = minStaff; }

    public int getMaxStaff() { return maxStaff; }
    public void setMaxStaff(int maxStaff) { this.maxStaff = maxStaff; }

    public String getShiftType() { return shiftType; }
    public void setShiftType(String shiftType) { this.shiftType = shiftType; }

    public List<Employee> getAssignedEmployees() { return assignedEmployees; }
    public void setAssignedEmployees(List<Employee> assignedEmployees) { this.assignedEmployees = assignedEmployees; }

    // Helper methods
    public boolean hasRequiredSkill(String skill) {
        return requiredSkills != null && requiredSkills.contains(skill);
    }

    public double getDurationHours() {
        if (startTime == null || endTime == null) {
            return 0.0;
        }
        return java.time.Duration.between(startTime, endTime).toHours();
    }

    public boolean isUnderstaffed() {
        return assignedEmployees == null || assignedEmployees.size() < minStaff;
    }

    public boolean isOverstaffed() {
        return assignedEmployees != null && assignedEmployees.size() > maxStaff;
    }

    public boolean hasLeadTeacher() {
        return assignedEmployees != null && 
               assignedEmployees.stream().anyMatch(emp -> "Lead Teacher".equals(emp.getPosition()));
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Shift shift = (Shift) o;
        return Objects.equals(id, shift.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Shift{" +
                "id='" + id + '\'' +
                ", date=" + date +
                ", startTime=" + startTime +
                ", endTime=" + endTime +
                ", room='" + room + '\'' +
                ", assignedEmployees=" + (assignedEmployees != null ? assignedEmployees.size() : 0) +
                '}';
    }
}
