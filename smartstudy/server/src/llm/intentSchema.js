import { z } from 'zod';
export const EventPayload = z.object({
  title: z.string(),
  start: z.string(),
  end: z.string(),
  allDay: z.boolean().optional().default(false),
  type: z.enum(['event','course']).optional().default('event'),
  courseCode: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});
export const UpdatePayload = z.object({
  id: z.string(),
  updates: z.object({
    title: z.string().optional(),
    start: z.string().optional(),
    end: z.string().optional(),
    allDay: z.boolean().optional(),
    type: z.enum(['event','course']).optional(),
    courseCode: z.string().optional(),
    location: z.string().optional(),
    notes: z.string().optional(),
  })
});
export const DeletePayload = z.object({ id: z.string() });
export const GetPayload = z.object({ range: z.object({ start: z.string().optional(), end: z.string().optional() }).optional() });
export const TaskPayload = z.object({
  title: z.string(),
  due: z.string().optional(),
  notes: z.string().optional(),
});
export const TaskUpdatePayload = z.object({
  id: z.string(),
  updates: z.object({
    title: z.string().optional(),
    due: z.string().optional(),
    done: z.boolean().optional(),
    notes: z.string().optional(),
  })
});
export const TaskListPayload = z.object({
  status: z.enum(['all','open','done']).optional(),
  dueBefore: z.string().optional(),
  dueAfter: z.string().optional(),
});
export const PomodoroPayload = z.object({
  action: z.enum(['start','stop','reset']),
  durationMinutes: z.number().min(1).max(120).optional(),
});
export const HelpPayload = z.object({
  prompt: z.string().optional(),
  suggestions: z.array(z.string()).optional(),
});
export const BulkEventsPayload = z.object({
  events: z.array(EventPayload),
  summary: z.string().optional(),
});
export const BulkTasksPayload = z.object({
  tasks: z.array(TaskPayload),
  summary: z.string().optional(),
});
export const Intent = z.discriminatedUnion('intent', [
  z.object({ intent: z.literal('add_event'), payload: EventPayload }),
  z.object({ intent: z.literal('update_event'), payload: UpdatePayload }),
  z.object({ intent: z.literal('delete_event'), payload: DeletePayload }),
  z.object({ intent: z.literal('get_events'), payload: GetPayload }),
  z.object({ intent: z.literal('help'), payload: HelpPayload.optional() }),
  z.object({ intent: z.literal('add_task'), payload: TaskPayload }),
  z.object({ intent: z.literal('update_task'), payload: TaskUpdatePayload }),
  z.object({ intent: z.literal('delete_task'), payload: z.object({ id: z.string() }) }),
  z.object({ intent: z.literal('get_tasks'), payload: TaskListPayload.optional().default({}) }),
  z.object({ intent: z.literal('control_pomodoro'), payload: PomodoroPayload }),
  z.object({ intent: z.literal('plan_schedule'), payload: BulkEventsPayload }),
  z.object({ intent: z.literal('plan_tasks'), payload: BulkTasksPayload }),
  // Bulk delete events
  z.object({
    intent: z.literal('delete_events'),
    payload: z.object({
      eventIds: z.array(z.string()).min(1).optional(),
      filter: z
        .object({
          titleContains: z.string().optional(),
          from: z.string().datetime().optional(),
          to: z.string().datetime().optional(),
        })
        .optional(),
      confirm: z.boolean().default(true),
    }),
  }),
]);
