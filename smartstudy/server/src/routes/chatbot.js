import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { groq } from '../llm/groq.js';
import Event from '../models/Event.js';
import Task from '../models/Task.js';
import { Intent } from '../llm/intentSchema.js';

const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const router = express.Router();
router.use(requireAuth);
const SYSTEM = `You are SmartStudy's AI assistant for schedules, tasks, and focus.
Always output STRICT JSON (no prose) with this top-level shape:
{"intent":"add_event|update_event|delete_event|delete_events|get_events|add_task|update_task|delete_task|get_tasks|control_pomodoro|plan_schedule|plan_tasks|help","payload":{}}.

Schemas:
- add_event.payload: { "title": string, "start": ISO, "end": ISO, "allDay"?: boolean, "type"?: "event"|"course", "courseCode"?: string, "location"?: string, "notes"?: string }
- update_event.payload: { "id": string, "updates": { "title"?: string, "start"?: ISO, "end"?: ISO, "allDay"?: boolean, "type"?: "event"|"course", "courseCode"?: string, "location"?: string, "notes"?: string } }
- delete_event.payload: { "id": string }
- get_events.payload: { "range"?: { "start"?: ISO, "end"?: ISO } }
- add_task.payload: { "title": string, "due"?: ISO, "notes"?: string }
- update_task.payload: { "id": string, "updates": { "title"?: string, "due"?: ISO, "done"?: boolean, "notes"?: string } }
- delete_task.payload: { "id": string }
- get_tasks.payload: { "status"?: "all"|"open"|"done", "dueBefore"?: ISO, "dueAfter"?: ISO }
- control_pomodoro.payload: { "action": "start"|"stop"|"reset", "durationMinutes"?: number }
- plan_schedule.payload: { "events": array of event objects (same structure as add_event.payload), "summary"?: string describing the plan }
- plan_tasks.payload: { "tasks": array of task objects (same structure as add_task.payload), "summary"?: string describing the plan }
- help.payload: { "prompt"?: string, "suggestions"?: string[] }
- delete_events.payload: { "eventIds"?: string[], "filter"?: { "titleContains"?: string, "from"?: ISO, "to"?: ISO }, "confirm"?: boolean }

Rules:
- Prefer exact IDs from context when modifying or deleting items.
- If information is missing (e.g., date or id), ask the user to clarify by returning intent "help" with a short prompt.
- Never invent IDs.
- When a user requests a learning plan, study schedule, or wants to organize multiple events/tasks (e.g., "arrange my week for learning X"), use plan_schedule or plan_tasks intents.
- For bulk operations, intelligently infer missing details: assign realistic times (e.g., study sessions in the morning/afternoon/evening), proper durations (1-2 hours for study sessions), logical progression of topics, and descriptive notes.
- Break down complex topics into logical sub-topics or modules spread across multiple days.
- Use current date context to schedule appropriately throughout the week.
- Be specific and detailed in titles and notes for each event/task you create.
- CRITICAL: When creating events, you MUST avoid scheduling conflicts. Review the list of existing events provided in the context and ensure no new events overlap with existing ones. Schedule around existing commitments by finding free time slots.`;
router.post('/', async (req,res)=>{
  try{
    const { message } = req.body;
    if(!message) return res.status(400).json({ error: 'message required' });
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const twoWeeksLater = new Date(today);
    twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);
    const [upcomingEvents, openTasks] = await Promise.all([
      Event.find({ userId: req.userId, start: { $gte: today, $lte: twoWeeksLater } }).sort({ start: 1 }),
      Task.find({ userId: req.userId, done: false }).sort({ due: 1, createdAt: -1 }).limit(6),
    ]);
    const contextPrompt = [
      `Today is ${now.toISOString()}. The user is in a generic timezone.`,
      '',
      'EXISTING EVENTS IN CALENDAR (next 2 weeks):',
      upcomingEvents.length
        ? upcomingEvents.map(evt => `- ${evt.title} | ${evt.start.toISOString()} to ${evt.end.toISOString()} | ${evt.location || 'no location'} | ID: ${evt._id}`).join('\n')
        : '- No events scheduled',
      '',
      'IMPORTANT: When creating new events, you MUST check the times above and avoid any overlaps. Find free time slots between existing events.',
      '',
      'Open tasks (ID | title | due ISO if any):',
      openTasks.length
        ? openTasks.map(task => `- ${task._id} | ${task.title} | ${task.due ? task.due.toISOString() : 'n/a'}`).join('\n')
        : '- no pending tasks',
      '',
      'Use only the documented intents. When modifying or deleting items, reference IDs from the list above. Ask for clarification via help intent if details are missing.'
    ].join('\n');

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'system', content: contextPrompt },
        { role: 'user', content: message }
      ]
    });
    const raw = completion.choices?.[0]?.message?.content ?? '{}';
    let parsed;
    try{
      parsed = JSON.parse(raw);
    }catch(e){
      console.warn('Groq JSON parse error, retrying with repair prompt');
      const repair = await groq.chat.completions.create({
        model: GROQ_MODEL,
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: `${SYSTEM}\nReturn strictly valid JSON.` },
          { role: 'system', content: contextPrompt },
          { role: 'user', content: `Your previous answer was invalid JSON. Re-send the identical intent as VALID JSON only. Here is the invalid JSON: ${raw}` }
        ]
      });
      try{
        parsed = JSON.parse(repair.choices?.[0]?.message?.content ?? '{}');
      }catch(parseRepairError){
        return res.status(400).json({ error:'LLM JSON parse error', raw, repair: repair.choices?.[0]?.message?.content });
      }
    }
    const intent = Intent.safeParse(parsed);
    if(!intent.success) return res.status(400).json({ error: 'Invalid intent shape', details: intent.error.issues, raw: parsed });
    const data = intent.data;
    if(data.intent==='add_event'){
      const created = await Event.create({ ...data.payload, start: new Date(data.payload.start), end: new Date(data.payload.end), userId: req.userId });
      return res.json({ ok:true, action:'created', event: created });
    }
    if(data.intent==='update_event'){
      const { id, updates } = data.payload;
      const u = { ...updates };
      if(u.start) u.start = new Date(u.start);
      if(u.end) u.end = new Date(u.end);
      const updated = await Event.findOneAndUpdate({ _id: id, userId: req.userId }, u, { new: true });
      if(!updated) return res.status(404).json({ error: 'Not found' });
      return res.json({ ok:true, action:'updated', event: updated });
    }
    if(data.intent==='delete_event'){
      const { id } = data.payload;
      const del = await Event.findOneAndDelete({ _id: id, userId: req.userId });
      if(!del) return res.status(404).json({ error: 'Not found' });
      return res.json({ ok:true, action:'deleted', id });
    }
    if(data.intent==='get_events'){
      const range = data.payload?.range;
      const query = { userId: req.userId };
      if(range?.start && range?.end){
        query.$or = [
          { start: { $gte: new Date(range.start), $lte: new Date(range.end) } },
          { end: { $gte: new Date(range.start), $lte: new Date(range.end) } }
        ];
      }
      const events = await Event.find(query).sort({ start: 1 });
      return res.json({ ok:true, action:'list', events });
    }
    if(data.intent==='help'){
      const prompt = data.payload?.prompt ??
        'Need more details. Examples: Add Algorithms course Dec 5 10:00-12:00 room B201; Move calculus to tomorrow 8am; Delete physics lab Friday; What do I have next Tuesday?; Show open tasks due this week; Start a 25 minute Pomodoro; Mark calculus assignment as done.';
      return res.json({
        ok:true,
        help: prompt,
        suggestions: data.payload?.suggestions
      });
    }
    if(data.intent==='add_task'){
      const payload = data.payload;
      const task = await Task.create({
        userId: req.userId,
        title: payload.title,
        notes: payload.notes,
        due: payload.due ? new Date(payload.due) : undefined,
      });
      return res.json({ ok:true, action:'task_created', task });
    }
    if(data.intent==='update_task'){
      const { id, updates } = data.payload;
      const next = { ...updates };
      if(next.due) next.due = new Date(next.due);
      const task = await Task.findOneAndUpdate({ _id: id, userId: req.userId }, next, { new: true });
      if(!task) return res.status(404).json({ error: 'Task not found' });
      return res.json({ ok:true, action:'task_updated', task });
    }
    if(data.intent==='delete_task'){
      const task = await Task.findOneAndDelete({ _id: data.payload.id, userId: req.userId });
      if(!task) return res.status(404).json({ error: 'Task not found' });
      return res.json({ ok:true, action:'task_deleted', id: data.payload.id });
    }
    if(data.intent==='get_tasks'){
      const query = { userId: req.userId };
      const { status, dueBefore, dueAfter } = data.payload ?? {};
      if(status === 'open') query.done = false;
      if(status === 'done') query.done = true;
      if(dueBefore || dueAfter){
        query.due = {};
        if(dueAfter) query.due.$gte = new Date(dueAfter);
        if(dueBefore) query.due.$lte = new Date(dueBefore);
      }
      const tasks = await Task.find(query).sort({ due: 1, createdAt: -1 });
      return res.json({ ok:true, action:'tasks_list', tasks });
    }
    if(data.intent==='control_pomodoro'){
      const { action, durationMinutes } = data.payload;
      const durationSeconds = durationMinutes ? Math.round(durationMinutes * 60) : undefined;
      let message = 'Pomodoro control acknowledged.';
      if(action === 'start'){
        message = `Starting a ${durationMinutes ?? 25}-minute focus session.`;
      }else if(action === 'stop'){
        message = 'Stopping the current Pomodoro session.';
      }else if(action === 'reset'){
        message = 'Resetting the Pomodoro timer.';
      }
      return res.json({
        ok: true,
        action: 'pomodoro',
        message,
        command: { action, durationSeconds },
      });
    }
    if(data.intent==='plan_schedule'){
      const { events, summary } = data.payload;
      const createdEvents = [];
      for(const eventData of events){
        const created = await Event.create({
          ...eventData,
          start: new Date(eventData.start),
          end: new Date(eventData.end),
          userId: req.userId
        });
        createdEvents.push(created);
      }
      return res.json({
        ok: true,
        action: 'plan_created',
        events: createdEvents,
        summary: summary || `Created ${createdEvents.length} event(s) for your schedule.`,
        count: createdEvents.length
      });
    }
    if(data.intent==='plan_tasks'){
      const { tasks, summary } = data.payload;
      const createdTasks = [];
      for(const taskData of tasks){
        const created = await Task.create({
          userId: req.userId,
          title: taskData.title,
          notes: taskData.notes,
          due: taskData.due ? new Date(taskData.due) : undefined,
        });
        createdTasks.push(created);
      }
      return res.json({
        ok: true,
        action: 'tasks_plan_created',
        tasks: createdTasks,
        summary: summary || `Created ${createdTasks.length} task(s) for your plan.`,
        count: createdTasks.length
      });
    }
    if(data.intent==='delete_events'){
      const { eventIds, filter } = data.payload;
      const query = { userId: req.userId };
      if(Array.isArray(eventIds) && eventIds.length){
        query._id = { $in: eventIds };
      }else if(filter){
        if(filter.titleContains){
          query.title = { $regex: filter.titleContains, $options: 'i' };
        }
        if(filter.from || filter.to){
          query.start = {};
          if(filter.from) query.start.$gte = new Date(filter.from);
          if(filter.to) query.start.$lte = new Date(filter.to);
        }
      }else{
        return res.json({ ok:false, action:'error', error:'Provide eventIds or filter' });
      }
      const events = await Event.find(query).select('_id title start end');
      if(!events.length) return res.json({ ok:true, action:'delete_none', count:0, events:[] });
      const ids = events.map(e=>e._id);
      await Event.deleteMany({ _id: { $in: ids }, userId: req.userId });
      return res.json({ ok:true, action:'events_deleted', count: ids.length, events: events.map(e=>({ id: e._id.toString(), title: e.title })) });
    }
    return res.status(400).json({ error: 'Unhandled intent' });
  }catch(e){
    const groqError = e?.error ?? e?.response?.error ?? e?.response?.data?.error;
    const groqCode = groqError?.code;
    if(groqCode === 'model_decommissioned'){
      console.error('Groq model decommissioned:', groqError?.message);
      return res.status(503).json({
        error: 'The configured Groq model is no longer available. Update GROQ_MODEL (e.g. llama-3.3-70b-versatile) and restart the server.'
      });
    }
    console.error(e);
    res.status(500).json({ error: groqError?.message || e.message });
  }
});
export default router;
