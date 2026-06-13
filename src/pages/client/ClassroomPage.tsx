import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Lock, ChevronRight, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import styles from './Client.module.css'

interface Course {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  sort_order: number
  is_locked: boolean
}

interface ModuleMeta {
  course_id: string
  total: number
  completed: number
}

export default function ClassroomPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [courses, setCourses] = useState<Course[]>([])
  const [meta, setMeta] = useState<ModuleMeta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user?.id) fetchAll() }, [user?.id])

  const fetchAll = async () => {
    const [{ data: courseData }, { data: moduleData }, { data: completionData }] = await Promise.all([
      supabase.from('courses').select('*').order('sort_order', { ascending: true }),
      supabase.from('course_modules').select('id, course_id'),
      supabase.from('module_completions').select('module_id').eq('user_id', user!.id),
    ])

    const list = (courseData ?? []) as Course[]
    setCourses(list)

    const modules = (moduleData ?? []) as { id: string; course_id: string }[]
    const completedIds = new Set((completionData ?? []).map((c: { module_id: string }) => c.module_id))

    const metaMap: ModuleMeta[] = list.map(c => {
      const mods = modules.filter(m => m.course_id === c.id)
      return {
        course_id: c.id,
        total: mods.length,
        completed: mods.filter(m => completedIds.has(m.id)).length,
      }
    })
    setMeta(metaMap)
    setLoading(false)
  }

  const getMeta = (courseId: string) =>
    meta.find(m => m.course_id === courseId) ?? { total: 0, completed: 0, course_id: courseId }

  // A course is accessible if the educator unlocked it AND
  // either it is the first course or the previous course is 100% complete.
  const isAccessible = (course: Course, index: number): boolean => {
    if (course.is_locked) return false
    if (index === 0) return true
    const prev = courses[index - 1]
    const prevMeta = getMeta(prev.id)
    return prevMeta.total > 0 && prevMeta.completed >= prevMeta.total
  }

  return (
    <div className={styles.classroomPage}>
      <div className={styles.classroomHeader}>
        <h1 className={styles.classroomTitle}>
          <BookOpen size={22} color="var(--gold)" /> Classroom
        </h1>
        <p className={styles.classroomSub}>Work through each course in order. Complete a course to unlock the next one.</p>
      </div>

      {loading ? (
        <p className={styles.evEmpty}>Loading courses...</p>
      ) : courses.length === 0 ? (
        <div className={styles.evEmptyState}>
          <BookOpen size={40} color="var(--border)" />
          <p>No courses available yet. Check back soon.</p>
        </div>
      ) : (
        <div className={styles.classroomGrid}>
          {courses.map((course, index) => {
            const accessible = isAccessible(course, index)
            const m = getMeta(course.id)
            const pct = m.total > 0 ? Math.round((m.completed / m.total) * 100) : 0
            const done = m.total > 0 && m.completed >= m.total

            return (
              <div
                key={course.id}
                className={`${styles.courseCard} ${!accessible ? styles.courseCardLocked : ''}`}
                onClick={() => accessible && navigate(`/app/classroom/${course.id}`)}
                role={accessible ? 'button' : undefined}
                tabIndex={accessible ? 0 : undefined}
                onKeyDown={e => accessible && e.key === 'Enter' && navigate(`/app/classroom/${course.id}`)}
              >
                <div className={styles.courseThumb}>
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} className={styles.courseThumbImg} />
                  ) : (
                    <div className={styles.courseThumbPlaceholder}>
                      <BookOpen size={32} color="var(--text-muted)" />
                    </div>
                  )}
                  {!accessible && (
                    <div className={styles.courseLockOverlay}>
                      <Lock size={24} color="#fff" />
                      <span className={styles.courseLockLabel}>
                        {course.is_locked ? 'Not yet available' : 'Complete previous course first'}
                      </span>
                    </div>
                  )}
                  {done && accessible && (
                    <div className={styles.courseDoneBadge}>
                      <CheckCircle size={16} color="#4be08a" /> Complete
                    </div>
                  )}
                </div>

                <div className={styles.courseCardBody}>
                  <h3 className={styles.courseCardTitle}>{course.title}</h3>
                  {course.description && (
                    <p className={styles.courseCardDesc}>{course.description}</p>
                  )}

                  <div className={styles.courseProgressWrap}>
                    <div className={styles.courseProgressBar}>
                      <div
                        className={styles.courseProgressFill}
                        style={{ width: `${pct}%`, background: done ? '#4be08a' : 'var(--gold)' }}
                      />
                    </div>
                    <div className={styles.courseProgressRow}>
                      <span className={styles.courseProgressLabel}>
                        {m.completed} of {m.total} {m.total === 1 ? 'lesson' : 'lessons'}
                      </span>
                      {accessible && (
                        <span className={styles.courseEnterLink}>
                          {done ? 'Review' : 'Continue'} <ChevronRight size={13} />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
