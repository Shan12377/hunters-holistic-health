import { useEffect, useState } from 'react'
import { BookOpen, Plus, Trash2, ToggleLeft, ToggleRight, ChevronDown, ChevronUp, GripVertical } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import styles from './Coach.module.css'

interface Course {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  sort_order: number
  is_locked: boolean
}

interface CourseModule {
  id: string
  course_id: string
  title: string
  youtube_url: string | null
  notes: string | null
  sort_order: number
}

const EMPTY_COURSE = { title: '', description: '', thumbnail_url: '' }
const EMPTY_MODULE = { title: '', youtube_url: '', notes: '' }

export default function ManageClassroomPage() {
  const { user } = useAuthStore()
  const [courses, setCourses] = useState<Course[]>([])
  const [modules, setModules] = useState<Record<string, CourseModule[]>>({})
  const [loading, setLoading] = useState(true)
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [courseForm, setCourseForm] = useState(EMPTY_COURSE)
  const [savingCourse, setSavingCourse] = useState(false)
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null)
  const [showModuleForm, setShowModuleForm] = useState<string | null>(null)
  const [moduleForm, setModuleForm] = useState(EMPTY_MODULE)
  const [savingModule, setSavingModule] = useState(false)

  useEffect(() => { fetchCourses() }, [])

  const fetchCourses = async () => {
    const { data } = await supabase.from('courses').select('*').order('sort_order', { ascending: true })
    setCourses((data ?? []) as Course[])
    setLoading(false)
  }

  const fetchModules = async (courseId: string) => {
    const { data } = await supabase
      .from('course_modules')
      .select('*')
      .eq('course_id', courseId)
      .order('sort_order', { ascending: true })
    setModules(prev => ({ ...prev, [courseId]: (data ?? []) as CourseModule[] }))
  }

  const toggleExpand = (courseId: string) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null)
    } else {
      setExpandedCourse(courseId)
      if (!modules[courseId]) fetchModules(courseId)
    }
    setShowModuleForm(null)
    setModuleForm(EMPTY_MODULE)
  }

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!courseForm.title.trim() || !user?.id) return
    setSavingCourse(true)
    const { error } = await supabase.from('courses').insert({
      created_by: user.id,
      title: courseForm.title.trim(),
      description: courseForm.description.trim() || null,
      thumbnail_url: courseForm.thumbnail_url.trim() || null,
      sort_order: courses.length,
      is_locked: true,
    })
    if (error) { toast.error('Could not create course.') }
    else { toast.success('Course created.'); setCourseForm(EMPTY_COURSE); setShowCourseForm(false); fetchCourses() }
    setSavingCourse(false)
  }

  const handleToggleLock = async (course: Course) => {
    const { error } = await supabase
      .from('courses')
      .update({ is_locked: !course.is_locked })
      .eq('id', course.id)
    if (error) { toast.error('Could not update.'); return }
    setCourses(prev => prev.map(c => c.id === course.id ? { ...c, is_locked: !c.is_locked } : c))
  }

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Delete this course and all its lessons? This cannot be undone.')) return
    const { error } = await supabase.from('courses').delete().eq('id', id)
    if (error) { toast.error('Could not delete.'); return }
    toast.success('Course deleted.')
    setCourses(prev => prev.filter(c => c.id !== id))
    setModules(prev => { const next = { ...prev }; delete next[id]; return next })
    if (expandedCourse === id) setExpandedCourse(null)
  }

  const handleAddModule = async (e: React.FormEvent, courseId: string) => {
    e.preventDefault()
    if (!moduleForm.title.trim()) return
    setSavingModule(true)
    const existing = modules[courseId] ?? []
    const { error } = await supabase.from('course_modules').insert({
      course_id: courseId,
      title: moduleForm.title.trim(),
      youtube_url: moduleForm.youtube_url.trim() || null,
      notes: moduleForm.notes.trim() || null,
      sort_order: existing.length,
    })
    if (error) { toast.error('Could not add lesson.') }
    else {
      toast.success('Lesson added.')
      setModuleForm(EMPTY_MODULE)
      setShowModuleForm(null)
      fetchModules(courseId)
    }
    setSavingModule(false)
  }

  const handleDeleteModule = async (moduleId: string, courseId: string) => {
    const { error } = await supabase.from('course_modules').delete().eq('id', moduleId)
    if (error) { toast.error('Could not delete lesson.'); return }
    toast.success('Lesson removed.')
    setModules(prev => ({ ...prev, [courseId]: prev[courseId].filter(m => m.id !== moduleId) }))
  }

  const cf = (key: keyof typeof courseForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setCourseForm(f => ({ ...f, [key]: e.target.value }))

  const mf = (key: keyof typeof moduleForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setModuleForm(f => ({ ...f, [key]: e.target.value }))

  return (
    <div className={styles.evMgmtPage}>
      <div className={styles.evMgmtHeader}>
        <div>
          <h2 className={styles.evMgmtTitle}><BookOpen size={20} color="var(--gold)" /> Classroom</h2>
          <p className={styles.evMgmtSub}>Build courses and add video lessons. Toggle the lock to control when participants can access each course.</p>
        </div>
        <button className={styles.evMgmtAddBtn} onClick={() => setShowCourseForm(v => !v)}>
          <Plus size={16} /> {showCourseForm ? 'Cancel' : 'New Course'}
        </button>
      </div>

      {showCourseForm && (
        <form className={styles.evForm} onSubmit={handleCreateCourse}>
          <div className={styles.evFormField}>
            <label className={styles.evFormLabel}>Course Title</label>
            <input className={styles.evFormInput} value={courseForm.title} onChange={cf('title')} placeholder="e.g. Start Here: ROOTS Foundations" maxLength={120} required />
          </div>
          <div className={styles.evFormField}>
            <label className={styles.evFormLabel}>Description (optional)</label>
            <textarea className={styles.evFormTextarea} value={courseForm.description} onChange={cf('description')} placeholder="What participants will learn" rows={2} maxLength={400} />
          </div>
          <div className={styles.evFormField}>
            <label className={styles.evFormLabel}>Thumbnail Image URL (optional)</label>
            <input className={styles.evFormInput} value={courseForm.thumbnail_url} onChange={cf('thumbnail_url')} placeholder="https://..." />
          </div>
          <div className={styles.evFormActions}>
            <button type="submit" className={styles.evFormSubmit} disabled={savingCourse}>
              {savingCourse ? 'Saving...' : 'Create Course'}
            </button>
          </div>
        </form>
      )}

      <div className={styles.evMgmtList}>
        {loading ? (
          <p className={styles.evMgmtEmpty}>Loading...</p>
        ) : courses.length === 0 ? (
          <div className={styles.evMgmtEmptyState}>
            <BookOpen size={36} color="var(--border)" />
            <p>No courses yet. Create one above.</p>
          </div>
        ) : (
          courses.map(course => (
            <div key={course.id} className={styles.clCourseBlock}>
              {/* Course row */}
              <div className={styles.clCourseRow}>
                <div className={styles.clCourseLeft}>
                  <GripVertical size={14} color="var(--text-muted)" className={styles.clGrip} />
                  <div>
                    <div className={styles.clCourseTitle}>{course.title}</div>
                    {course.description && (
                      <div className={styles.clCourseDesc}>{course.description}</div>
                    )}
                    <div className={styles.clModuleCount}>
                      {(modules[course.id]?.length ?? 0)} {modules[course.id]?.length === 1 ? 'lesson' : 'lessons'}
                    </div>
                  </div>
                </div>
                <div className={styles.clCourseActions}>
                  <span className={styles.clLockLabel}>
                    {course.is_locked ? 'Locked' : 'Unlocked'}
                  </span>
                  <button
                    className={styles.chToggleBtn}
                    onClick={() => handleToggleLock(course)}
                    title={course.is_locked ? 'Unlock for participants' : 'Lock course'}
                  >
                    {course.is_locked
                      ? <ToggleLeft size={22} color="var(--text-muted)" />
                      : <ToggleRight size={22} color="var(--teal)" />
                    }
                  </button>
                  <button
                    className={styles.clExpandBtn}
                    onClick={() => toggleExpand(course.id)}
                    title="Manage lessons"
                  >
                    {expandedCourse === course.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button className={styles.evMgmtDelete} onClick={() => handleDeleteCourse(course.id)} title="Delete course">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Expanded: lesson list + add form */}
              {expandedCourse === course.id && (
                <div className={styles.clModulePanel}>
                  {(modules[course.id] ?? []).length === 0 ? (
                    <p className={styles.clNoModules}>No lessons yet. Add one below.</p>
                  ) : (
                    (modules[course.id] ?? []).map((m, i) => (
                      <div key={m.id} className={styles.clModuleRow}>
                        <span className={styles.clModuleNum}>{i + 1}</span>
                        <div className={styles.clModuleInfo}>
                          <span className={styles.clModuleTitle}>{m.title}</span>
                          {m.youtube_url && (
                            <span className={styles.clModuleUrl}>{m.youtube_url}</span>
                          )}
                        </div>
                        <button
                          className={styles.evMgmtDelete}
                          onClick={() => handleDeleteModule(m.id, course.id)}
                          title="Remove lesson"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))
                  )}

                  {showModuleForm === course.id ? (
                    <form className={styles.clModuleForm} onSubmit={e => handleAddModule(e, course.id)}>
                      <div className={styles.evFormField}>
                        <label className={styles.evFormLabel}>Lesson Title</label>
                        <input className={styles.evFormInput} value={moduleForm.title} onChange={mf('title')} placeholder="e.g. Welcome to the ROOTS Framework" maxLength={120} required />
                      </div>
                      <div className={styles.evFormField}>
                        <label className={styles.evFormLabel}>YouTube URL</label>
                        <input className={styles.evFormInput} value={moduleForm.youtube_url} onChange={mf('youtube_url')} placeholder="https://www.youtube.com/watch?v=..." />
                      </div>
                      <div className={styles.evFormField}>
                        <label className={styles.evFormLabel}>Lesson Notes (optional)</label>
                        <textarea className={styles.evFormTextarea} value={moduleForm.notes} onChange={mf('notes')} placeholder="Key takeaways, action steps, links..." rows={3} maxLength={1000} />
                      </div>
                      <div className={styles.evFormActions}>
                        <button type="button" className={styles.clCancelBtn} onClick={() => { setShowModuleForm(null); setModuleForm(EMPTY_MODULE) }}>
                          Cancel
                        </button>
                        <button type="submit" className={styles.evFormSubmit} disabled={savingModule}>
                          {savingModule ? 'Saving...' : 'Add Lesson'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button className={styles.clAddLessonBtn} onClick={() => { setShowModuleForm(course.id); setModuleForm(EMPTY_MODULE) }}>
                      <Plus size={14} /> Add Lesson
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
