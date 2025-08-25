package com.tothub.timefold.dto;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.Objects;

public class Availability {
    private DayOfWeek dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean isPreferred;

    // Default constructor
    public Availability() {}

    // Constructor with all fields
    public Availability(DayOfWeek dayOfWeek, LocalTime startTime, LocalTime endTime, boolean isPreferred) {
        this.dayOfWeek = dayOfWeek;
        this.startTime = startTime;
        this.endTime = endTime;
        this.isPreferred = isPreferred;
    }

    // Getters and Setters
    public DayOfWeek getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(DayOfWeek dayOfWeek) { this.dayOfWeek = dayOfWeek; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public boolean isPreferred() { return isPreferred; }
    public void setPreferred(boolean preferred) { isPreferred = preferred; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Availability that = (Availability) o;
        return dayOfWeek == that.dayOfWeek &&
                Objects.equals(startTime, that.startTime) &&
                Objects.equals(endTime, that.endTime);
    }

    @Override
    public int hashCode() {
        return Objects.hash(dayOfWeek, startTime, endTime);
    }

    @Override
    public String toString() {
        return "Availability{" +
                "dayOfWeek=" + dayOfWeek +
                ", startTime=" + startTime +
                ", endTime=" + endTime +
                ", isPreferred=" + isPreferred +
                '}';
    }
}
