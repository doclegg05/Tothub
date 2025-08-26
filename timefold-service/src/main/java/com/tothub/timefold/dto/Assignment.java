package com.tothub.timefold.dto;

import java.util.Objects;

public class Assignment {
    private String id;
    private String employeeId;
    private String employeeName;
    private String shiftId;
    private String room;
    private String date;
    private String startTime;
    private String endTime;
    private String status; // "assigned", "tentative", "confirmed"
    private double score;

    // Default constructor
    public Assignment() {}

    // Constructor with all fields
    public Assignment(String id, String employeeId, String employeeName, String shiftId, 
                    String room, String date, String startTime, String endTime, 
                    String status, double score) {
        this.id = id;
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.shiftId = shiftId;
        this.room = room;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
        this.score = score;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }

    public String getShiftId() { return shiftId; }
    public void setShiftId(String shiftId) { this.shiftId = shiftId; }

    public String getRoom() { return room; }
    public void setRoom(String room) { this.room = room; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public double getScore() { return score; }
    public void setScore(double score) { this.score = score; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Assignment that = (Assignment) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Assignment{" +
                "id='" + id + '\'' +
                ", employeeId='" + employeeId + '\'' +
                ", employeeName='" + employeeName + '\'' +
                ", shiftId='" + shiftId + '\'' +
                ", room='" + room + '\'' +
                ", date='" + date + '\'' +
                ", startTime='" + startTime + '\'' +
                ", endTime='" + endTime + '\'' +
                ", status='" + status + '\'' +
                ", score=" + score +
                '}';
    }
}
