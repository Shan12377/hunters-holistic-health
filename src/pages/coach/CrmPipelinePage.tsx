import { useState, useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { formatDistanceToNow, format, isPast, isToday } from 'date-fns'
import s from './Crm.module.css'

interface Contact {
  id: string
  kind: 'lead' | 'client'
  first_name: string | null
  last_name: string | null
  email: string
  phone: string | null
  source: string
  pipeline_stage: string
  notes: string | null
  created_at: string
  last_activity_at: string | null
}

interface Activity {
  id: string
  type: string
  body: string
  created_at: string
}

interface Task {
  id: string
  title: string
  due_at: string
  status: 'open' | 'done' | 'snoozed'
}

interface Appointment {
  id: string
  appointment_type: string | null
  start_at: string
  end_at: string
  status: string
}

const LEAD_STAGES = [
  { id: 'new', label: 'New' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'consult_booked', label: 'Consult Booked' },
  { id: 'trial', label: 'Trial' },
  { id: 'lost', label: 'Lost', muted: true },
]

const CLIENT_STAGES = [
  { id: 'client_free', label: 'Free' },
  { id: 'client_foundation', label: 'Foundation' },
  { id: 'client_program', label: 'Program' },
  { id: 'client_vip', label: 'VIP' },
  { id: 'client_overhaul', label: 'Overhaul' },
  { id: 'churned', label: 'Churned', muted: true },
]

const SOURCE_LABELS: Record<string, string> = {
  intake_join: 'Join Form',
  intake_clinical_inquiry: 'Clinical Inquiry',
  intake_support: 'Support',
  intake_feature_request: 'Feature Request',
  manual: 'Manual',
  tidycal_booking: 'TidyCal',
  stripe: 'Stripe',
}

const ACTIVITY_LABELS: Record<string, string> = {
  note: 'Note', call: 'Call', email: 'Email', sms: 'SMS',
  form_submission: 'Form', booking: 'Booking', stage_change: 'Stage',
}

function displayName(c: Contact): string {
  return [c.first_name, c.last_name].filter(Boolean).join(' ') || c.email
}

export default function CrmPipelinePage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selected, setSelected] = useState<Contact | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [showArchived, setShowArchived] = useState(false)
  const [noteBody, setNoteBody] = useState('')
  const [noteType, setNoteType] = useState('note')
  const [showAddLead, setShowAddLead] = useState(false)
  const [leadForm, setLeadForm] = useState({ first_name: '', last_name: '', email: '', phone: '', notes: '' })
  const [showAddTask, setShowAddTask] = useState(false)
  const [taskForm, setTaskForm] = useState({ title: '', due_at: '' })
  const [saving, setSaving] = useState(false)
  const dragId = useRef<string | null>(null)

  useEffect(() => { fetchContacts() }, [])

  async function fetchContacts() {
    setLoading(true)
    const { data } = await supabase
      .from('contacts_view')
      .select('*')
      .order('last_activity_at', { ascending: false, nullsFirst: false })
    setContacts((data as Contact[]) ?? [])
    setLoading(false)
  }

  async function fetchDetails(c: Contact) {
    const col = c.kind === 'lead' ? 'lead_id' : 'profile_id'
    const [{ data: acts }, { data: tks }, { data: appts }] = await Promise.all([
      supabase.from('activities').select('id, type, body, created_at').eq(col, c.id).order('created_at', { ascending: false }),
      supabase.from('tasks').select('id, title, due_at, status').eq(col, c.id).neq('status', 'done').order('due_at'),
      supabase.from('appointments').select('id, appointment_type, start_at, end_at, status').eq(col, c.id).order('start_at', { ascending: false }),
    ])
    setActivities((acts as Activity[]) ?? [])
    setTasks((tks as Task[]) ?? [])
    setAppointments((appts as Appointment[]) ?? [])
  }

  function selectContact(c: Contact) {
    setSelected(c)
    setNoteBody('')
    fetchDetails(c)
  }

  async function handleStageChange(leadId: string, newStage: string) {
    await supabase.from('leads').update({ status: newStage }).eq('id', leadId)
    await supabase.from('activities').insert({ lead_id: leadId, type: 'stage_change', body: `Stage moved to: ${newStage.replace('_', ' ')}` })
    await fetchContacts()
    if (selected?.id === leadId) {
      const updated = { ...selected, pipeline_stage: newStage }
      setSelected(updated)
      fetchDetails(updated)
    }
  }

  async function handleAddNote() {
    if (!noteBody.trim() || !selected) return
    setSaving(true)
    const col = selected.kind === 'lead' ? 'lead_id' : 'profile_id'
    await supabase.from('activities').insert({ [col]: selected.id, type: noteType, body: noteBody.trim() })
    setNoteBody('')
    await fetchDetails(selected)
    setSaving(false)
  }

  async function handleAddLead() {
    if (!leadForm.email.trim()) return
    setSaving(true)
    await supabase.from('leads').insert({ ...leadForm, source: 'manual', status: 'new' })
    setShowAddLead(false)
    setLeadForm({ first_name: '', last_name: '', email: '', phone: '', notes: '' })
    await fetchContacts()
    setSaving(false)
  }

  async function handleAddTask() {
    if (!taskForm.title.trim() || !taskForm.due_at || !selected) return
    setSaving(true)
    const col = selected.kind === 'lead' ? 'lead_id' : 'profile_id'
    await supabase.from('tasks').insert({ [col]: selected.id, title: taskForm.title, due_at: taskForm.due_at, status: 'open' })
    setShowAddTask(false)
    setTaskForm({ title: '', due_at: '' })
    await fetchDetails(selected)
    setSaving(false)
  }

  async function handleCompleteTask(taskId: string) {
    await supabase.from('tasks').update({ status: 'done', completed_at: new Date().toISOString() }).eq('id', taskId)
    if (selected) fetchDetails(selected)
  }

  function handleDragStart(leadId: string) { dragId.current = leadId }
  function handleDragOver(e: React.DragEvent) { e.preventDefault() }
  async function handleDrop(stage: string) {
    if (!dragId.current || stage.startsWith('client_') || stage === 'churned') return
    await handleStageChange(dragId.current, stage)
    dragId.current = null
  }

  const byStage = (stage: string) => contacts.filter(c => c.pipeline_stage === stage)
  const visibleLeadStages = LEAD_STAGES.filter(col => !col.muted || showArchived)
  const visibleClientStages = CLIENT_STAGES.filter(col => !col.muted || showArchived)

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div>
          <h1 className={s.title}>CRM Pipeline</h1>
          <p className={s.sub}>{contacts.length} contacts</p>
        </div>
        <div className={s.headerActions}>
          <button className={s.ghostBtn} onClick={() => setShowArchived(v => !v)}>
            {showArchived ? 'Hide archived' : 'Show archived'}
          </button>
          <button className={s.primaryBtn} onClick={() => setShowAddLead(true)}>+ Add Lead</button>
        </div>
      </div>

      <nav className={s.crmNav}>
        <NavLink to="/coach/crm" end className={({ isActive }) => `${s.crmNavLink} ${isActive ? s.crmNavLinkActive : ''}`}>Pipeline</NavLink>
        <NavLink to="/coach/crm/tasks" className={({ isActive }) => `${s.crmNavLink} ${isActive ? s.crmNavLinkActive : ''}`}>Tasks</NavLink>
        <NavLink to="/coach/crm/calendar" className={({ isActive }) => `${s.crmNavLink} ${isActive ? s.crmNavLinkActive : ''}`}>Calendar</NavLink>
      </nav>

      {loading ? (
        <div className={s.loading}>Loading contacts...</div>
      ) : (
        <div className={s.board}>
          <div className={s.boardSection}>
            <div className={s.boardSectionLabel}>Lead Pipeline</div>
            <div className={s.columns}>
              {visibleLeadStages.map(col => (
                <div
                  key={col.id}
                  className={`${s.col} ${col.muted ? s.colMuted : ''}`}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(col.id)}
                >
                  <div className={s.colHead}>
                    <span className={s.colLabel}>{col.label}</span>
                    <span className={s.colCount}>{byStage(col.id).length}</span>
                  </div>
                  {byStage(col.id).map(c => (
                    <div
                      key={c.id}
                      className={`${s.card} ${selected?.id === c.id ? s.cardActive : ''}`}
                      draggable
                      onDragStart={() => handleDragStart(c.id)}
                      onClick={() => selectContact(c)}
                    >
                      <div className={s.cardName}>{displayName(c)}</div>
                      <div className={s.cardEmail}>{c.email}</div>
                      <div className={s.cardMeta}>
                        <span className={s.cardSource}>{SOURCE_LABELS[c.source] ?? c.source}</span>
                        {c.last_activity_at && (
                          <span className={s.cardAge}>{formatDistanceToNow(new Date(c.last_activity_at), { addSuffix: true })}</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {byStage(col.id).length === 0 && <div className={s.colEmpty}>Drop here</div>}
                </div>
              ))}
            </div>
          </div>

          <div className={s.boardSection}>
            <div className={s.boardSectionLabel}>Active Clients</div>
            <div className={s.columns}>
              {visibleClientStages.map(col => (
                <div key={col.id} className={`${s.col} ${col.muted ? s.colMuted : ''}`}>
                  <div className={s.colHead}>
                    <span className={s.colLabel}>{col.label}</span>
                    <span className={s.colCount}>{byStage(col.id).length}</span>
                  </div>
                  {byStage(col.id).map(c => (
                    <div
                      key={c.id}
                      className={`${s.card} ${s.cardClient} ${selected?.id === c.id ? s.cardActive : ''}`}
                      onClick={() => selectContact(c)}
                    >
                      <div className={s.cardName}>{displayName(c)}</div>
                      <div className={s.cardEmail}>{c.email}</div>
                      {c.last_activity_at && (
                        <div className={s.cardMeta}>
                          <span className={s.cardAge}>{formatDistanceToNow(new Date(c.last_activity_at), { addSuffix: true })}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Contact Detail Panel */}
      {selected && (
        <div className={s.panel}>
          <div className={s.panelHead}>
            <div>
              <div className={s.panelName}>{displayName(selected)}</div>
              <div className={s.panelEmail}>{selected.email}</div>
              {selected.phone && <div className={s.panelPhone}>{selected.phone}</div>}
            </div>
            <button className={s.closeBtn} onClick={() => setSelected(null)}>✕</button>
          </div>

          <div className={s.panelMeta}>
            <span className={`${s.kindBadge} ${selected.kind === 'lead' ? s.kindLead : s.kindClient}`}>{selected.kind}</span>
            <span className={s.stageBadge}>{selected.pipeline_stage.replace('client_', '').replace(/_/g, ' ')}</span>
            <span className={s.sourceBadge}>{SOURCE_LABELS[selected.source] ?? selected.source}</span>
          </div>

          {selected.kind === 'lead' && (
            <div className={s.stageRow}>
              <label className={s.stageLabel}>Move to stage</label>
              <select
                className={s.stageSelect}
                value={selected.pipeline_stage}
                onChange={e => handleStageChange(selected.id, e.target.value)}
              >
                {LEAD_STAGES.map(st => <option key={st.id} value={st.id}>{st.label}</option>)}
              </select>
            </div>
          )}

          {selected.notes && <div className={s.panelNotes}>{selected.notes}</div>}

          <div className={s.addNoteBox}>
            <select className={s.noteTypeSelect} value={noteType} onChange={e => setNoteType(e.target.value)}>
              <option value="note">Note</option>
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
            <textarea
              className={s.noteInput}
              placeholder="Log a note, call, or email..."
              value={noteBody}
              onChange={e => setNoteBody(e.target.value)}
              rows={3}
            />
            <div className={s.noteActions}>
              <button className={s.ghostBtn} onClick={() => setShowAddTask(true)}>+ Task</button>
              <button className={s.primaryBtn} onClick={handleAddNote} disabled={saving || !noteBody.trim()}>Log</button>
            </div>
          </div>

          {tasks.length > 0 && (
            <div className={s.panelSection}>
              <div className={s.panelSectionLabel}>Open Tasks</div>
              {tasks.map(t => (
                <div key={t.id} className={`${s.taskRow} ${isPast(new Date(t.due_at)) && !isToday(new Date(t.due_at)) ? s.taskOverdue : ''}`}>
                  <div className={s.taskTitle}>{t.title}</div>
                  <div className={s.taskDue}>{isToday(new Date(t.due_at)) ? 'Today' : format(new Date(t.due_at), 'MMM d')}</div>
                  <button className={s.taskDoneBtn} onClick={() => handleCompleteTask(t.id)}>Done</button>
                </div>
              ))}
            </div>
          )}

          {appointments.filter(a => a.status === 'booked').length > 0 && (
            <div className={s.panelSection}>
              <div className={s.panelSectionLabel}>Upcoming Appointments</div>
              {appointments.filter(a => a.status === 'booked').map(a => (
                <div key={a.id} className={s.apptRow}>
                  <div className={s.apptType}>{a.appointment_type ?? 'Consultation'}</div>
                  <div className={s.apptTime}>{format(new Date(a.start_at), 'MMM d, h:mm a')}</div>
                </div>
              ))}
            </div>
          )}

          <div className={s.panelSection}>
            <div className={s.panelSectionLabel}>Timeline</div>
            {activities.length === 0 && <div className={s.emptyTimeline}>No activity yet</div>}
            {activities.map(a => (
              <div key={a.id} className={s.actRow}>
                <div className={s.actType}>{ACTIVITY_LABELS[a.type] ?? a.type}</div>
                <div className={s.actBody}>{a.body}</div>
                <div className={s.actTime}>{formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddLead && (
        <div className={s.modalOverlay} onClick={() => setShowAddLead(false)}>
          <div className={s.modal} onClick={e => e.stopPropagation()}>
            <div className={s.modalTitle}>Add Lead</div>
            <div className={s.formRow}>
              <input className={s.input} placeholder="First name" value={leadForm.first_name}
                onChange={e => setLeadForm(f => ({ ...f, first_name: e.target.value }))} />
              <input className={s.input} placeholder="Last name" value={leadForm.last_name}
                onChange={e => setLeadForm(f => ({ ...f, last_name: e.target.value }))} />
            </div>
            <input className={s.input} placeholder="Email *" value={leadForm.email}
              onChange={e => setLeadForm(f => ({ ...f, email: e.target.value }))} />
            <input className={s.input} placeholder="Phone" value={leadForm.phone}
              onChange={e => setLeadForm(f => ({ ...f, phone: e.target.value }))} />
            <textarea className={s.noteInput} placeholder="Notes" rows={3} value={leadForm.notes}
              onChange={e => setLeadForm(f => ({ ...f, notes: e.target.value }))} />
            <div className={s.modalActions}>
              <button className={s.ghostBtn} onClick={() => setShowAddLead(false)}>Cancel</button>
              <button className={s.primaryBtn} onClick={handleAddLead} disabled={saving || !leadForm.email.trim()}>Add Lead</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && selected && (
        <div className={s.modalOverlay} onClick={() => setShowAddTask(false)}>
          <div className={s.modal} onClick={e => e.stopPropagation()}>
            <div className={s.modalTitle}>Add Task for {displayName(selected)}</div>
            <input className={s.input} placeholder="Task title" value={taskForm.title}
              onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))} />
            <label className={s.stageLabel}>Due date</label>
            <input className={s.input} type="datetime-local" value={taskForm.due_at}
              onChange={e => setTaskForm(f => ({ ...f, due_at: e.target.value }))} />
            <div className={s.modalActions}>
              <button className={s.ghostBtn} onClick={() => setShowAddTask(false)}>Cancel</button>
              <button className={s.primaryBtn} onClick={handleAddTask} disabled={saving || !taskForm.title.trim() || !taskForm.due_at}>Add Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
