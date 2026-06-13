import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Circle, BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import styles from './Client.module.css'

interface CourseModule {
  id: string
  title: string
  youtube_url: string | null
  notes: string | null
  sort_order: number
}

interface Course {
  id: string
  title: string
  description: string | null
}

function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    let id = ''
    if (u.hostname === 'youtu.be') {
      id = u.pathname.slice(1)
    } else if (u.hostname.includes('youtube.com') && u.searchParams.has('v')) {
      id = u.searchParams.get('v')!
    } else if (u.pathname.startsWith('/embed/')) {
      id = u.pathname.split('/embed/')[1]
    }
    return id ? `https://www.youtube.com/embed/${id}` : null
  } catch {
    return null
  }
}

export default function CoursePage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<CourseModule[]>([])
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null)
  const [marking, setMarking] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user?.id && courseId) fetchAll() }, [user?.id, courseId])

  const fetchAll = async () => {
    const [{ data: courseData }, { data: moduleData }, { data: completionData }] = await Promise.all([
      supabase.from('courses').select('id, title, description').eq('id', courseId!).single(),
      supabase.from('course_modules').select('*').eq('course_id', courseId!).order('sort_order', { ascending: true }),
      supabase.from('module_completions').select('module_id').eq('user_id', user!.id),
    ])

    if (!courseData) { navigate('/app/classroom'); return }
    setCourse(courseData as Course)
    const mods = (moduleData ?? []) as CourseModule[]
    setModules(mods)

    const ids = new Set((completionData ?? []).map((c: { module_id: string }) => c.module_id))
    setCompletedIds(ids)

    // Start on first incomplete module, or first module if all done
    const firstIncomplete = mods.find(m => !ids.has(m.id))
    setActiveModuleId(firstIncomplete?.id ?? mods[0]?.id ?? null)
    setLoading(false)
  }

  const activeModule = modules.find(m => m.id === activeModuleId) ?? null
  const embedUrl = activeModule?.youtube_url ? getEmbedUrl(activeModule.youtube_url) : null

  const handleMarkComplete = async () => {
    if (!activeModuleId || !user?.id || completedIds.has(activeModuleId)) return
    setMarking(true)
    const { error } = await supabase.from('module_completions').insert({
      user_id: user.id,
      module_id: activeModuleId,
    })
    if (error) {
      toast.error('Could not save progress.')
    } else {
      setCompletedIds(prev => new Set([...prev, activeModuleId]))
      toast.success('Lesson complete!')
      // Auto-advance to next module
      const currentIndex = modules.findIndex(m => m.id === activeModuleId)
      const next = modules[currentIndex + 1]
      if (next) setActiveModuleId(next.id)
    }
    setMarking(false)
  }

  const pct = modules.length > 0 ? Math.round((completedIds.size / modules.length) * 100) : 0

  if (loading) return <p className={styles.evEmpty}>Loading course...</p>
  if (!course) return null

  return (
    <div className={styles.coursePage}>
      <button className={styles.courseBackBtn} onClick={() => navigate('/app/classroom')}>
        <ArrowLeft size={15} /> Back to Classroom
      </button>

      <div className={styles.coursePageHeader}>
        <h1 className={styles.coursePageTitle}>{course.title}</h1>
        {course.description && <p className={styles.coursePageDesc}>{course.description}</p>}
        <div className={styles.coursePageProgress}>
          <div className={styles.courseProgressBar}>
            <div className={styles.courseProgressFill} style={{ width: `${pct}%`, background: pct === 100 ? '#4be08a' : 'var(--gold)' }} />
          </div>
          <span className={styles.courseProgressLabel}>{completedIds.size} of {modules.length} complete</span>
        </div>
      </div>

      <div className={styles.courseLayout}>
        {/* Module sidebar */}
        <aside className={styles.moduleList}>
          {modules.map((m, i) => (
            <button
              key={m.id}
              className={`${styles.moduleItem} ${m.id === activeModuleId ? styles.moduleItemActive : ''}`}
              onClick={() => { setActiveModuleId(m.id); setNotesOpen(false) }}
            >
              <span className={styles.moduleItemNum}>{i + 1}</span>
              <span className={styles.moduleItemTitle}>{m.title}</span>
              {completedIds.has(m.id)
                ? <CheckCircle size={15} color="#4be08a" className={styles.moduleItemCheck} />
                : <Circle size={15} color="var(--text-muted)" className={styles.moduleItemCheck} />
              }
            </button>
          ))}
        </aside>

        {/* Video + actions */}
        <div className={styles.moduleContent}>
          {activeModule ? (
            <>
              <h2 className={styles.moduleLessonTitle}>{activeModule.title}</h2>

              {embedUrl ? (
                <div className={styles.videoWrap}>
                  <iframe
                    src={embedUrl}
                    title={activeModule.title}
                    className={styles.videoEmbed}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className={styles.videoPlaceholder}>
                  <BookOpen size={36} color="var(--text-muted)" />
                  <p>No video for this lesson.</p>
                </div>
              )}

              {activeModule.notes && (
                <div className={styles.notesWrap}>
                  <button className={styles.notesToggle} onClick={() => setNotesOpen(v => !v)}>
                    Lesson Notes {notesOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                  {notesOpen && (
                    <div className={styles.notesBody}>
                      {activeModule.notes.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className={styles.moduleActions}>
                {completedIds.has(activeModule.id) ? (
                  <div className={styles.moduleDoneMsg}>
                    <CheckCircle size={18} color="#4be08a" /> Lesson complete
                  </div>
                ) : (
                  <button
                    className={styles.moduleMarkBtn}
                    onClick={handleMarkComplete}
                    disabled={marking}
                  >
                    {marking ? 'Saving...' : 'Mark as Complete'}
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className={styles.evEmptyState}>
              <BookOpen size={40} color="var(--border)" />
              <p>No lessons in this course yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
