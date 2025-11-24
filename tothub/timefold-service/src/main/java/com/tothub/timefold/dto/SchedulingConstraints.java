package com.tothub.timefold.dto;

import java.util.Objects;

public class SchedulingConstraints {
    private int maxHoursPerWeek;
    private int minHoursPerWeek;
    private int maxConsecutiveDays;
    private int minRestHoursBetweenShifts;
    private boolean allowOvertime;
    private int maxOvertimeHoursPerWeek;
    private double childToStaffRatio;
    private boolean requireLeadTeacherPerRoom;
    private boolean allowSplitShifts;

    // Default constructor
    public SchedulingConstraints() {}

    // Constructor with all fields
    public SchedulingConstraints(int maxHoursPerWeek, int minHoursPerWeek, int maxConsecutiveDays,
                               int minRestHoursBetweenShifts, boolean allowOvertime, int maxOvertimeHoursPerWeek,
                               double childToStaffRatio, boolean requireLeadTeacherPerRoom, boolean allowSplitShifts) {
        this.maxHoursPerWeek = maxHoursPerWeek;
        this.minHoursPerWeek = minHoursPerWeek;
        this.maxConsecutiveDays = maxConsecutiveDays;
        this.minRestHoursBetweenShifts = minRestHoursBetweenShifts;
        this.allowOvertime = allowOvertime;
        this.maxOvertimeHoursPerWeek = maxOvertimeHoursPerWeek;
        this.childToStaffRatio = childToStaffRatio;
        this.requireLeadTeacherPerRoom = requireLeadTeacherPerRoom;
        this.allowSplitShifts = allowSplitShifts;
    }

    // Getters and Setters
    public int getMaxHoursPerWeek() { return maxHoursPerWeek; }
    public void setMaxHoursPerWeek(int maxHoursPerWeek) { this.maxHoursPerWeek = maxHoursPerWeek; }

    public int getMinHoursPerWeek() { return minHoursPerWeek; }
    public void setMinHoursPerWeek(int minHoursPerWeek) { this.minHoursPerWeek = minHoursPerWeek; }

    public int getMaxConsecutiveDays() { return maxConsecutiveDays; }
    public void setMaxConsecutiveDays(int maxConsecutiveDays) { this.maxConsecutiveDays = maxConsecutiveDays; }

    public int getMinRestHoursBetweenShifts() { return minRestHoursBetweenShifts; }
    public void setMinRestHoursBetweenShifts(int minRestHoursBetweenShifts) { this.minRestHoursBetweenShifts = minRestHoursBetweenShifts; }

    public boolean isAllowOvertime() { return allowOvertime; }
    public void setAllowOvertime(boolean allowOvertime) { this.allowOvertime = allowOvertime; }

    public int getMaxOvertimeHoursPerWeek() { return maxOvertimeHoursPerWeek; }
    public void setMaxOvertimeHoursPerWeek(int maxOvertimeHoursPerWeek) { this.maxOvertimeHoursPerWeek = maxOvertimeHoursPerWeek; }

    public double getChildToStaffRatio() { return childToStaffRatio; }
    public void setChildToStaffRatio(double childToStaffRatio) { this.childToStaffRatio = childToStaffRatio; }

    public boolean isRequireLeadTeacherPerRoom() { return requireLeadTeacherPerRoom; }
    public void setRequireLeadTeacherPerRoom(boolean requireLeadTeacherPerRoom) { this.requireLeadTeacherPerRoom = requireLeadTeacherPerRoom; }

    public boolean isAllowSplitShifts() { return allowSplitShifts; }
    public void setAllowSplitShifts(boolean allowSplitShifts) { this.allowSplitShifts = allowSplitShifts; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SchedulingConstraints that = (SchedulingConstraints) o;
        return maxHoursPerWeek == that.maxHoursPerWeek &&
                minHoursPerWeek == that.minHoursPerWeek &&
                maxConsecutiveDays == that.maxConsecutiveDays &&
                minRestHoursBetweenShifts == that.minRestHoursBetweenShifts &&
                allowOvertime == that.allowOvertime &&
                maxOvertimeHoursPerWeek == that.maxOvertimeHoursPerWeek &&
                Double.compare(that.childToStaffRatio, childToStaffRatio) == 0 &&
                requireLeadTeacherPerRoom == that.requireLeadTeacherPerRoom &&
                allowSplitShifts == that.allowSplitShifts;
    }

    @Override
    public int hashCode() {
        return Objects.hash(maxHoursPerWeek, minHoursPerWeek, maxConsecutiveDays, minRestHoursBetweenShifts,
                allowOvertime, maxOvertimeHoursPerWeek, childToStaffRatio, requireLeadTeacherPerRoom, allowSplitShifts);
    }

    @Override
    public String toString() {
        return "SchedulingConstraints{" +
                "maxHoursPerWeek=" + maxHoursPerWeek +
                ", minHoursPerWeek=" + minHoursPerWeek +
                ", maxConsecutiveDays=" + maxConsecutiveDays +
                ", minRestHoursBetweenShifts=" + minRestHoursBetweenShifts +
                ", allowOvertime=" + allowOvertime +
                ", maxOvertimeHoursPerWeek=" + maxOvertimeHoursPerWeek +
                ", childToStaffRatio=" + childToStaffRatio +
                ", requireLeadTeacherPerRoom=" + requireLeadTeacherPerRoom +
                ", allowSplitShifts=" + allowSplitShifts +
                '}';
    }
}
