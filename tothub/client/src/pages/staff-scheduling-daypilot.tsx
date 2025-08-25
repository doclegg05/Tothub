import { useState, useRef } from 'react';
import type React from 'react';
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from '../lib/queryClient';
import moment from 'moment';

interface Schedule {
  id: string;
  staffId: string;
  room: string;
  scheduledStart: string;
  scheduledEnd: string;
  date: string;
  scheduleType?: string;
  notes?: string;
}

export function StaffSchedulingDayPilot() {
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [formData, setFormData] = useState({
    staffId: '',
    room: 'Infant Room',
    type: 'regular',
    notes: ''
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const calendarRef = useRef<any>(null);

  // Fetch staff data
  const { data: staffData } = useQuery({
    queryKey: ['/api/staff'],
    queryFn: async () => {
      const response = await fetch('/api/staff', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.json();
    }
  });

  const staff = staffData?.data || [];

  // Fetch schedules
  const { data: schedulesData } = useQuery({
    queryKey: ['/api/schedules'],
    queryFn: async () => {
      const response = await fetch('/api/schedules', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.json();
    }
  });

  const schedules = Array.isArray(schedulesData) ? schedulesData : (schedulesData?.data || []);

  // Create schedule mutation
  const createScheduleMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/schedules', 'POST', data),
    onSuccess: (result, variables) => {
      // Refetch events from the calendar
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.refetchEvents();
      }
      queryClient.invalidateQueries({ queryKey: ['/api/schedules'] });
      toast({
        title: 'Success',
        description: 'Shift scheduled successfully'
      });
      setShowEventModal(false);
      resetForm();
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to schedule shift';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  });

  // Delete schedule mutation
  const deleteScheduleMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/schedules/${id}`, 'DELETE'),
    onSuccess: () => {
      // Refetch events from the calendar
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.refetchEvents();
      }
      queryClient.invalidateQueries({ queryKey: ['/api/schedules'] });
      toast({
        title: 'Success',
        description: 'Shift deleted successfully'
      });
      setShowEventModal(false);
    }
  });

  // Transform staff to resources
  const resources = staff.map((member: any) => ({
    id: member.id,
    title: `${member.firstName} ${member.lastName}`
  }));

  // Transform schedules to FullCalendar format
  const events = schedules.map((schedule: Schedule) => ({
    id: schedule.id,
    resourceId: schedule.staffId,
    start: schedule.scheduledStart,
    end: schedule.scheduledEnd,
    title: `${schedule.room}${schedule.notes ? ' - ' + schedule.notes : ''}`,
    backgroundColor: getShiftColor(schedule.scheduleType || 'regular'),
    borderColor: getShiftColor(schedule.scheduleType || 'regular'),
    extendedProps: schedule
  }));

  const handleEventClick = (clickInfo: any) => {
    const event = clickInfo.event;
    const schedule = event.extendedProps;
    setSelectedEvent(event);
    setSelectedSlot(null);
    setFormData({
      staffId: schedule.staffId,
      room: schedule.room,
      type: schedule.scheduleType || 'regular',
      notes: schedule.notes || ''
    });
    setShowEventModal(true);
  };

  const handleDateSelect = (selectInfo: any) => {
    setSelectedSlot({
      start: selectInfo.start,
      end: selectInfo.end,
      resourceId: selectInfo.resource?.id
    });
    setSelectedEvent(null);
    setFormData({
      ...formData,
      staffId: selectInfo.resource?.id || ''
    });
    setShowEventModal(true);
  };

  // Handle event drag/drop
  const handleEventDrop = async (dropInfo: any) => {
    const event = dropInfo.event;
    const updatedData = {
      id: event.id,
      staffId: event.getResources()[0]?.id || event.extendedProps.staffId,
      room: event.extendedProps.room,
      scheduledStart: event.start.toISOString(),
      scheduledEnd: event.end.toISOString(),
      date: moment(event.start).format('YYYY-MM-DD'),
      scheduleType: event.extendedProps.scheduleType,
      notes: event.extendedProps.notes
    };

    try {
      await apiRequest(`/api/schedules/${event.id}`, 'PATCH', updatedData);
      toast({
        title: 'Success',
        description: 'Shift updated successfully'
      });
      if (calendarRef.current) {
        calendarRef.current.getApi().refetchEvents();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update shift',
        variant: 'destructive'
      });
      dropInfo.revert();
    }
  };

  // Handle event resize
  const handleEventResize = async (resizeInfo: any) => {
    const event = resizeInfo.event;
    const updatedData = {
      id: event.id,
      staffId: event.extendedProps.staffId,
      room: event.extendedProps.room,
      scheduledStart: event.start.toISOString(),
      scheduledEnd: event.end.toISOString(),
      date: moment(event.start).format('YYYY-MM-DD'),
      scheduleType: event.extendedProps.scheduleType,
      notes: event.extendedProps.notes
    };

    try {
      await apiRequest(`/api/schedules/${event.id}`, 'PATCH', updatedData);
      toast({
        title: 'Success',
        description: 'Shift duration updated successfully'
      });
      if (calendarRef.current) {
        calendarRef.current.getApi().refetchEvents();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update shift duration',
        variant: 'destructive'
      });
      resizeInfo.revert();
    }
  };

  const getShiftColor = (type: string) => {
    switch (type) {
      case 'regular': return '#22c55e';
      case 'float': return '#eab308';
      case 'overtime': return '#dc2626';
      case 'training': return '#6b7280';
      default: return '#22c55e';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.staffId) {
      toast({
        title: 'Error',
        description: 'Please select a staff member',
        variant: 'destructive'
      });
      return;
    }

    // Get the start and end times
    const startTime = selectedSlot ? selectedSlot.start : new Date(selectedEvent.extendedProps.scheduledStart);
    const endTime = selectedSlot ? selectedSlot.end : new Date(selectedEvent.extendedProps.scheduledEnd);
    
    // Validate that scheduled start time is not in the past
    const now = new Date();
    if (startTime < now) {
      toast({
        title: 'Error',
        description: 'Cannot schedule staff for a time in the past. Please select a start time after the current time.',
        variant: 'destructive'
      });
      return;
    }

    // Validate that end time is after start time
    if (endTime <= startTime) {
      toast({
        title: 'Error',
        description: 'End time must be after start time.',
        variant: 'destructive'
      });
      return;
    }

    const data = {
      staffId: formData.staffId,
      room: formData.room,
      scheduledStart: startTime.toISOString(),
      scheduledEnd: endTime.toISOString(),
      date: moment(startTime).format('YYYY-MM-DD'),
      scheduleType: formData.type,
      notes: formData.notes
    };

    createScheduleMutation.mutate(data);
  };

  const handleDelete = () => {
    if (selectedEvent) {
      deleteScheduleMutation.mutate(selectedEvent.extendedProps.id);
    }
  };

  const resetForm = () => {
    setFormData({
      staffId: '',
      room: 'Infant Room',
      type: 'regular',
      notes: ''
    });
    setSelectedEvent(null);
    setSelectedSlot(null);
  };

  const rooms = [
    'Infant Room',
    'Toddler Room',
    'Preschool A',
    'Preschool B',
    'School Age',
    'Kitchen',
    'Office',
    'Float'
  ];

  const shiftTypes = [
    { value: 'regular', label: 'Regular Shift' },
    { value: 'float', label: 'Float/Relief' },
    { value: 'overtime', label: 'Overtime' },
    { value: 'training', label: 'Training' }
  ];

  return (
    <main className="flex-1 p-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Staff Schedule Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[600px]">
              <FullCalendar
                ref={calendarRef}
                plugins={[resourceTimelinePlugin, interactionPlugin]}
                initialView="resourceTimelineWeek"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'resourceTimelineDay,resourceTimelineWeek'
                }}
                buttonIcons={{
                  prev: 'chevron-left',
                  next: 'chevron-right',
                  prevYear: 'chevrons-left',
                  nextYear: 'chevrons-right'
                }}
                slotMinTime="06:00:00"
                slotMaxTime="20:00:00"
                slotDuration="00:30:00"
                resources={resources}
                events={events}
                eventClick={handleEventClick}
                loading={(isLoading) => {
                  // Optional: Show loading indicator
                  console.log('Calendar loading:', isLoading);
                }}
                selectable={true}
                select={handleDateSelect}
                resourceAreaHeaderContent="Staff Members"
                resourceAreaWidth="200px"
                height="100%"
                dayMaxEvents={true}
                weekends={true}
                editable={true}
                eventDrop={handleEventDrop}
                eventResize={handleEventResize}
                eventDisplay="block"
              />
            </div>
            
            {/* Legend */}
            <div className="flex items-center space-x-4 mt-4 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-600 rounded mr-2"></div>
                <span>Regular Shift</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                <span>Float/Relief</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-600 rounded mr-2"></div>
                <span>Overtime</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-600 rounded mr-2"></div>
                <span>Training</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Modal */}
        <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedEvent ? 'Edit Shift' : 'Schedule New Shift'}
              </DialogTitle>
              <DialogDescription>
                {selectedSlot && (
                  <span>
                    {moment(selectedSlot.start).format('MMMM D, YYYY')} • {' '}
                    {moment(selectedSlot.start).format('h:mm A')} - {' '}
                    {moment(selectedSlot.end).format('h:mm A')}
                  </span>
                )}
                {selectedEvent && (
                  <span>
                    {moment(selectedEvent.extendedProps.scheduledStart).format('MMMM D, YYYY')} • {' '}
                    {moment(selectedEvent.extendedProps.scheduledStart).format('h:mm A')} - {' '}
                    {moment(selectedEvent.extendedProps.scheduledEnd).format('h:mm A')}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="staff">Staff Member</Label>
                <Select
                  value={formData.staffId}
                  onValueChange={(value) => setFormData({ ...formData, staffId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((member: any) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.firstName} {member.lastName} - {member.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="room">Room/Area</Label>
                <Select
                  value={formData.room}
                  onValueChange={(value) => setFormData({ ...formData, room: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room} value={room}>
                        {room}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="type">Shift Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {shiftTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex justify-between pt-4">
                <div>
                  {selectedEvent && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDelete}
                    >
                      Delete Shift
                    </Button>
                  )}
                </div>
                <div className="space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEventModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {selectedEvent ? 'Update Shift' : 'Schedule Shift'}
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
  );
}