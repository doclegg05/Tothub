package com.tothub.timefold;

import com.tothub.timefold.dto.*;
import com.tothub.timefold.service.SchedulingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class SchedulingServiceTest {

    @Autowired
    private SchedulingService schedulingService;

    @Test
    public void testBasicScheduling() {
        // Create test data
        SchedulingRequest request = createTestRequest();
        
        // Solve
        SchedulingResponse response = schedulingService.solve(request);
        
        // Assertions
        assertNotNull(response);
        assertNotNull(response.getAssignments());
        assertTrue(response.getSolvingTimeMs() > 0);
        assertNotEquals("error", response.getStatus());
    }

    private SchedulingRequest createTestRequest() {
        // Create employees
        List<Employee> employees = List.of(
            createEmployee("emp1", "John Doe", List.of("lead-teacher"), 
                         List.of(createAvailability(DayOfWeek.MONDAY, "08:00", "17:00")), 40, "Lead Teacher", true),
            createEmployee("emp2", "Jane Smith", List.of("assistant-teacher"), 
                         List.of(createAvailability(DayOfWeek.MONDAY, "08:00", "17:00")), 35, "Assistant Teacher", true)
        );

        // Create shifts
        List<Shift> shifts = List.of(
            createShift("shift1", LocalDate.of(2025, 1, 20), "08:00", "17:00", 
                       List.of("lead-teacher"), "Room 1", 2, 2, 3, "full-day"),
            createShift("shift2", LocalDate.of(2025, 1, 20), "08:00", "17:00", 
                       List.of("assistant-teacher"), "Room 2", 1, 1, 2, "full-day")
        );

        // Create constraints
        SchedulingConstraints constraints = new SchedulingConstraints(40, 20, 5, 8, false, 0, 4.0, true, false);

        return new SchedulingRequest(employees, shifts, constraints);
    }

    private Employee createEmployee(String id, String name, List<String> skills, 
                                  List<Availability> availability, int maxHours, String position, boolean active) {
        Employee emp = new Employee();
        emp.setId(id);
        emp.setName(name);
        emp.setSkills(skills);
        emp.setAvailability(availability);
        emp.setMaxHoursPerWeek(maxHours);
        emp.setPosition(position);
        emp.setIsActive(active);
        return emp;
    }

    private Availability createAvailability(DayOfWeek day, String start, String end) {
        Availability avail = new Availability();
        avail.setDayOfWeek(day);
        avail.setStartTime(LocalTime.parse(start));
        avail.setEndTime(LocalTime.parse(end));
        avail.setPreferred(true);
        return avail;
    }

    private Shift createShift(String id, LocalDate date, String start, String end, 
                             List<String> skills, String room, int required, int min, int max, String type) {
        Shift shift = new Shift();
        shift.setId(id);
        shift.setDate(date);
        shift.setStartTime(LocalTime.parse(start));
        shift.setEndTime(LocalTime.parse(end));
        shift.setRequiredSkills(skills);
        shift.setRoom(room);
        shift.setRequiredStaff(required);
        shift.setMinStaff(min);
        shift.setMaxStaff(max);
        shift.setShiftType(type);
        return shift;
    }
}
