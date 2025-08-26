package com.tothub.timefold.dto;

import java.util.List;
import java.util.Objects;

public class SchedulingResponse {
    private List<Assignment> assignments;
    private double totalScore;
    private String status; // "optimal", "feasible", "infeasible"
    private long solvingTimeMs;
    private List<String> warnings;
    private List<String> errors;

    // Default constructor
    public SchedulingResponse() {}

    // Constructor with all fields
    public SchedulingResponse(List<Assignment> assignments, double totalScore, String status, 
                           long solvingTimeMs, List<String> warnings, List<String> errors) {
        this.assignments = assignments;
        this.totalScore = totalScore;
        this.status = status;
        this.solvingTimeMs = solvingTimeMs;
        this.warnings = warnings;
        this.errors = errors;
    }

    // Getters and Setters
    public List<Assignment> getAssignments() { return assignments; }
    public void setAssignments(List<Assignment> assignments) { this.assignments = assignments; }

    public double getTotalScore() { return totalScore; }
    public void setTotalScore(double totalScore) { this.totalScore = totalScore; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public long getSolvingTimeMs() { return solvingTimeMs; }
    public void setSolvingTimeMs(long solvingTimeMs) { this.solvingTimeMs = solvingTimeMs; }

    public List<String> getWarnings() { return warnings; }
    public void setWarnings(List<String> warnings) { this.warnings = warnings; }

    public List<String> getErrors() { return errors; }
    public void setErrors(List<String> errors) { this.errors = errors; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SchedulingResponse that = (SchedulingResponse) o;
        return Double.compare(that.totalScore, totalScore) == 0 &&
                solvingTimeMs == that.solvingTimeMs &&
                Objects.equals(assignments, that.assignments) &&
                Objects.equals(status, that.status) &&
                Objects.equals(warnings, that.warnings) &&
                Objects.equals(errors, that.errors);
    }

    @Override
    public int hashCode() {
        return Objects.hash(assignments, totalScore, status, solvingTimeMs, warnings, errors);
    }

    @Override
    public String toString() {
        return "SchedulingResponse{" +
                "assignments=" + assignments +
                ", totalScore=" + totalScore +
                ", status='" + status + '\'' +
                ", solvingTimeMs=" + solvingTimeMs +
                ", warnings=" + warnings +
                ", errors=" + errors +
                '}';
    }
}
