import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import s from './CommsStudio.module.css'

type Channel = 'email' | 'sms' | 'whatsapp' | 'instagram' | 'linkedin' | 'facebook' | 'twitter'
type Mode = 'generate' | 'polish' | 'objection'

const BOOKING_LINKS = [
  { label: 'VIP Member Session', detail: '45 min', booking: 'https://tidycal.com/drshallandahunter/vip-member-session', zoom: null },
  { label: 'Member Protocol Review', detail: '20 min', booking: 'https://tidycal.com/drshallandahunter/member-protocol-review', zoom: null },
  { label: 'Protocol Review', detail: '$97 · 20 min', booking: 'https://tidycal.com/drshallandahunter/protocol-review', zoom: null },
  { label: 'Private Education Session', detail: '$197 · 45 min', booking: 'https://tidycal.com/drshallandahunter/private-education-session', zoom: null },
  { label: 'ROOTS Detox Follow-Up', detail: '1 hr', booking: 'https://tidycal.com/drshallandahunter/roots-framework-follow-up-detox', zoom: 'https://us06web.zoom.us/j/85663176184?pwd=mGna7yHmC6TbB3sDSkyJ2p7iZwsWO5.1' },
  { label: 'Heavy Metal and Cardiovascular Health Education', detail: '1 hr', booking: 'https://tidycal.com/drshallandahunter/sustainable-heavy-metal-and-cardiovascular-health-eucation', zoom: 'https://us06web.zoom.us/j/89224844101?pwd=DYhTOASY05XsDduoziQybgQ1OaaJsm.1' },
  { label: 'Viome Coaching', detail: '', booking: 'https://tidycal.com/drshallandahunter/viome-coaching', zoom: 'https://us06web.zoom.us/j/6768665268?pwd=VW1IUkJ3bmxLNXRHR3ptN2d6RkVLdz09' },
]

interface DraftResult {
  raw: string
  subject?: string
  body?: string
  caption?: string
  pinned?: string
  hashtags?: string
  post?: string
  message?: string
}

const CHANNELS: { id: Channel; label: string; icon: string; hint: string }[] = [
  { id: 'email',     label: 'Email',     icon: '✉',  hint: 'Full email with subject line, body, CTA, and footer' },
  { id: 'sms',       label: 'Text/SMS',  icon: '💬', hint: 'One-screen message, under 320 characters' },
  { id: 'whatsapp',  label: 'WhatsApp',  icon: '📱', hint: 'Warm personal message, 2-3 sentences' },
  { id: 'instagram', label: 'Instagram', icon: '📸', hint: 'Caption + pinned comment + hashtags' },
  { id: 'linkedin',  label: 'LinkedIn',  icon: '🔗', hint: 'Clinical authority voice for peers and professionals' },
  { id: 'facebook',  label: 'Facebook',  icon: '👥', hint: 'Warm community tone, every term translated' },
  { id: 'twitter',   label: 'X / Twitter', icon: '𝕏', hint: 'One punchy idea with stat and source' },
]

const EMAIL_TYPES = [
  { id: 'lead_outreach',    label: 'Lead Outreach',      desc: 'First touch, they just joined the list' },
  { id: 'consult_followup', label: 'Post-Consult',        desc: 'After a clarity call' },
  { id: 'checkin',          label: 'Client Check-in',     desc: 'Active client, keep the relationship warm' },
  { id: 'reengagement',     label: 'Re-engagement',       desc: 'They have gone quiet' },
  { id: 'post_session',     label: 'Post-Session',        desc: 'Recap after a session' },
  { id: 'newsletter',       label: 'Newsletter',          desc: 'General send to the list' },
  { id: 'challenge_promo',  label: 'Challenge Promo',     desc: 'Promoting a wellness challenge' },
]

function copyText(text: string, label: string) {
  navigator.clipboard.writeText(text)
  toast.success(`${label} copied`)
}

export default function CommunicationsStudioPage() {
  const [channel, setChannel] = useState<Channel>('email')
  const [mode, setMode] = useState<Mode>('generate')
  const [topic, setTopic] = useState('')
  const [draftToPolish, setDraftToPolish] = useState('')
  const [audience, setAudience] = useState('')
  const [emailType, setEmailType] = useState('lead_outreach')
  const [contactName, setContactName] = useState('')
  const [contactStage, setContactStage] = useState('')
  const [contactNotes, setContactNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DraftResult | null>(null)
  const [linksOpen, setLinksOpen] = useState(false)
  const [objectionType, setObjectionType] = useState('too_expensive')

  const selectedChannel = CHANNELS.find(c => c.id === channel)!

  async function handleGenerate() {
    if (mode === 'generate' && !topic.trim()) { toast.error('Add a topic first'); return }
    if (mode === 'polish' && !draftToPolish.trim()) { toast.error('Paste your draft first'); return }
    setLoading(true)
    setResult(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/crm-brief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify(
          mode === 'objection'
            ? { action: 'objection_draft', objectionType, prospectNotes: contactNotes.trim() || undefined }
            : {
                action: mode === 'polish' ? 'comms_polish' : 'comms_draft',
                channel,
                topic: topic.trim(),
                draft: draftToPolish.trim(),
                audience: audience.trim(),
                emailType: channel === 'email' ? emailType : undefined,
                contactName: contactName.trim() || undefined,
                contactStage: contactStage.trim() || undefined,
                contactNotes: contactNotes.trim() || undefined,
              }
        ),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Generation failed')
      setResult(json)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not generate draft')
    }
    setLoading(false)
  }

  function renderResult() {
    if (!result) return null

    if (channel === 'email' && result.subject) {
      return (
        <div className={s.resultBlock}>
          <div className={s.resultSection}>
            <div className={s.resultLabel}>Subject line</div>
            <div className={s.resultText}>{result.subject}</div>
            <button className={s.copyBtn} onClick={() => copyText(result.subject!, 'Subject')}>Copy subject</button>
          </div>
          <div className={s.resultSection}>
            <div className={s.resultLabel}>Body</div>
            <div className={s.resultText}>{result.body}</div>
            <button className={s.copyBtn} onClick={() => copyText(result.body!, 'Body')}>Copy body</button>
          </div>
          <button
            className={s.copyAllBtn}
            onClick={() => copyText(`Subject: ${result.subject}\n\n${result.body}`, 'Full email')}
          >Copy full email</button>
        </div>
      )
    }

    if (channel === 'instagram') {
      return (
        <div className={s.resultBlock}>
          <div className={s.resultSection}>
            <div className={s.resultLabel}>Caption</div>
            <div className={s.resultText}>{result.caption}</div>
            <button className={s.copyBtn} onClick={() => copyText(result.caption!, 'Caption')}>Copy caption</button>
          </div>
          {result.pinned && (
            <div className={s.resultSection}>
              <div className={s.resultLabel}>Pinned comment</div>
              <div className={s.resultText}>{result.pinned}</div>
              <button className={s.copyBtn} onClick={() => copyText(result.pinned!, 'Pinned comment')}>Copy pinned comment</button>
            </div>
          )}
          {result.hashtags && (
            <div className={s.resultSection}>
              <div className={s.resultLabel}>Hashtags</div>
              <div className={s.resultText}>{result.hashtags}</div>
              <button className={s.copyBtn} onClick={() => copyText(result.hashtags!, 'Hashtags')}>Copy hashtags</button>
            </div>
          )}
        </div>
      )
    }

    if (channel === 'linkedin' || channel === 'facebook' || channel === 'twitter') {
      return (
        <div className={s.resultBlock}>
          <div className={s.resultSection}>
            <div className={s.resultLabel}>Post</div>
            <div className={s.resultText}>{result.post}</div>
            <button className={s.copyBtn} onClick={() => copyText(result.post!, 'Post')}>Copy post</button>
          </div>
          {result.hashtags && (
            <div className={s.resultSection}>
              <div className={s.resultLabel}>Hashtags</div>
              <div className={s.resultText}>{result.hashtags}</div>
              <button className={s.copyBtn} onClick={() => copyText(result.hashtags!, 'Hashtags')}>Copy hashtags</button>
            </div>
          )}
          {result.hashtags && (
            <button
              className={s.copyAllBtn}
              onClick={() => copyText(`${result.post}\n\n${result.hashtags}`, 'Full post')}
            >Copy post + hashtags</button>
          )}
        </div>
      )
    }

    if (channel === 'sms' || channel === 'whatsapp') {
      return (
        <div className={s.resultBlock}>
          <div className={s.resultSection}>
            <div className={s.resultLabel}>Message</div>
            <div className={s.resultText}>{result.message ?? result.raw}</div>
            <button className={s.copyBtn} onClick={() => copyText(result.message ?? result.raw, 'Message')}>Copy message</button>
          </div>
          {channel === 'sms' && result.message && (
            <div className={s.charCount}>{(result.message ?? result.raw).length} characters</div>
          )}
        </div>
      )
    }

    return (
      <div className={s.resultBlock}>
        <div className={s.resultSection}>
          <div className={s.resultText}>{result.raw}</div>
          <button className={s.copyBtn} onClick={() => copyText(result.raw, 'Content')}>Copy</button>
        </div>
      </div>
    )
  }

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div>
          <h1 className={s.title}>Communications Studio</h1>
          <p className={s.sub}>Draft in your voice for any channel. No contact required.</p>
        </div>
      </div>

      <div className={s.body}>
        <div className={s.form}>

          {/* Mode toggle */}
          <div className={s.modeRow}>
            <button className={`${s.modeBtn} ${mode === 'generate' ? s.modeBtnActive : ''}`} onClick={() => { setMode('generate'); setResult(null) }}>
              Write for me
            </button>
            <button className={`${s.modeBtn} ${mode === 'polish' ? s.modeBtnActive : ''}`} onClick={() => { setMode('polish'); setResult(null) }}>
              Polish my draft
            </button>
            <button className={`${s.modeBtn} ${mode === 'objection' ? s.modeBtnActive : ''}`} onClick={() => { setMode('objection'); setResult(null) }}>
              Handle objection
            </button>
          </div>

          {/* Objection handler UI */}
          {mode === 'objection' && (
            <div className={s.field}>
              <label className={s.label}>What objection did they raise?</label>
              <select
                className={s.select}
                value={objectionType}
                onChange={e => setObjectionType(e.target.value)}
              >
                <option value="too_expensive">Too expensive</option>
                <option value="not_right_time">Not the right time</option>
                <option value="need_to_think">Need to think about it</option>
                <option value="need_spouse">Need to talk to my spouse</option>
              </select>
              <div className={s.field} style={{ marginTop: '10px' }}>
                <label className={s.label}>Notes about this prospect <span className={s.optional}>(optional)</span></label>
                <textarea
                  className={s.textarea}
                  placeholder="e.g. She has been on the email list 6 months, mentioned struggling with belly fat after menopause, called it a 'big investment'"
                  rows={3}
                  value={contactNotes}
                  onChange={e => setContactNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Channel selector, hint, email type, hidden in objection mode */}
          {mode !== 'objection' && (
            <>
              <div className={s.channelRow}>
                {CHANNELS.map(ch => (
                  <button
                    key={ch.id}
                    className={`${s.channelBtn} ${channel === ch.id ? s.channelBtnActive : ''}`}
                    onClick={() => { setChannel(ch.id); setResult(null) }}
                  >
                    <span className={s.channelIcon}>{ch.icon}</span>
                    <span className={s.channelLabel}>{ch.label}</span>
                  </button>
                ))}
              </div>

              <p className={s.channelHint}>{selectedChannel.hint}</p>

              {channel === 'email' && (
                <div className={s.field}>
                  <label className={s.label}>Email type</label>
                  <select
                    className={s.select}
                    value={emailType}
                    onChange={e => setEmailType(e.target.value)}
                  >
                    {EMAIL_TYPES.map(t => (
                      <option key={t.id} value={t.id}>{t.label}, {t.desc}</option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {/* Polish mode: paste your draft */}
          {mode === 'polish' && (
            <div className={s.field}>
              <label className={s.label}>Paste your draft <span className={s.required}>*</span></label>
              <textarea
                className={s.textarea}
                placeholder="Paste what you wrote. The AI will clean it up, fix the flow, and make sure it sounds like you."
                rows={6}
                value={draftToPolish}
                onChange={e => setDraftToPolish(e.target.value)}
              />
            </div>
          )}

          {/* Topic, audience, contact, hidden in objection mode */}
          {mode !== 'objection' && (
            <>
              <div className={s.field}>
                <label className={s.label}>{mode === 'polish' ? 'Context or goal (optional)' : <>Topic or message goal <span className={s.required}>*</span></>}</label>
                <textarea
                  className={s.textarea}
                  placeholder={channel === 'email'
                    ? 'e.g. Explain the connection between cortisol and belly fat, invite them to the free 5-Day Belly Reset'
                    : channel === 'instagram'
                      ? 'e.g. Fasting glucose reflects your liver, not your breakfast'
                      : channel === 'linkedin'
                        ? 'e.g. GLP-1 medications and lean mass preservation during weight loss'
                        : channel === 'sms' || channel === 'whatsapp'
                          ? 'e.g. Reminder that the free 5-Day Belly Reset starts Monday'
                          : 'e.g. The 3pm energy crash is chemistry, not willpower'
                  }
                  rows={3}
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                />
              </div>

              <div className={s.field}>
                <label className={s.label}>Audience <span className={s.optional}>(optional)</span></label>
                <input
                  className={s.input}
                  placeholder="e.g. Women 40+ dealing with unexplained weight gain, or leave blank for general audience"
                  value={audience}
                  onChange={e => setAudience(e.target.value)}
                />
              </div>

              <details className={s.contactToggle}>
                <summary className={s.contactSummary}>Writing for a specific person? (optional)</summary>
                <div className={s.contactFields}>
                  <div className={s.fieldRow}>
                    <div className={s.field}>
                      <label className={s.label}>Name</label>
                      <input
                        className={s.input}
                        placeholder="First name or full name"
                        value={contactName}
                        onChange={e => setContactName(e.target.value)}
                      />
                    </div>
                    <div className={s.field}>
                      <label className={s.label}>Stage / relationship</label>
                      <input
                        className={s.input}
                        placeholder="e.g. New lead, VIP client, post-consult"
                        value={contactStage}
                        onChange={e => setContactStage(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className={s.field}>
                    <label className={s.label}>Context or notes about them</label>
                    <textarea
                      className={s.textarea}
                      placeholder="e.g. She mentioned struggling with the 3pm crash and hasn't booked yet"
                      rows={2}
                      value={contactNotes}
                      onChange={e => setContactNotes(e.target.value)}
                    />
                  </div>
                </div>
              </details>
            </>
          )}

          <button
            className={s.generateBtn}
            onClick={handleGenerate}
            disabled={loading || (mode === 'generate' ? !topic.trim() : mode === 'polish' ? !draftToPolish.trim() : false)}
          >
            {loading
              ? (mode === 'objection' ? 'Writing response...' : mode === 'polish' ? 'Polishing...' : `Drafting for ${selectedChannel.label}...`)
              : (mode === 'objection' ? 'Write my response' : mode === 'polish' ? 'Polish in my voice' : `Draft ${selectedChannel.label} in my voice`)
            }
          </button>

          {/* Booking Links */}
          <details className={s.contactToggle} open={linksOpen} onToggle={e => setLinksOpen((e.target as HTMLDetailsElement).open)}>
            <summary className={s.contactSummary}>Booking links and meeting rooms</summary>
            <div className={s.bookingLinks}>
              {BOOKING_LINKS.map(link => (
                <div key={link.label} className={s.bookingRow}>
                  <div className={s.bookingInfo}>
                    <span className={s.bookingLabel}>{link.label}</span>
                    {link.detail && <span className={s.bookingDetail}>{link.detail}</span>}
                  </div>
                  <div className={s.bookingActions}>
                    <button className={s.copyBtn} onClick={() => copyText(link.booking, 'Booking link')}>Copy booking link</button>
                    {link.zoom && (
                      <button className={s.copyBtn} onClick={() => copyText(link.zoom!, 'Zoom link')}>Copy Zoom</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </details>

        </div>

        {/* Result panel */}
        <div className={s.resultPanel}>
          {loading && (
            <div className={s.loadingState}>
              <div className={s.loadingIcon}>{selectedChannel.icon}</div>
              <div className={s.loadingText}>Drafting in Dr. Hunter&apos;s voice...</div>
              <div className={s.loadingHint}>Applying voice laws and channel rules</div>
            </div>
          )}
          {!loading && !result && (
            <div className={s.emptyState}>
              <div className={s.emptyIcon}>✍</div>
              <div className={s.emptyText}>Your draft will appear here</div>
              <div className={s.emptyHint}>Fill in the topic and hit Generate</div>
            </div>
          )}
          {!loading && result && renderResult()}
        </div>

      </div>
    </div>
  )
}
