import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowDownUp, ArrowRight, Bell, Building2, Check, CheckCircle2, ChevronDown,
  CircleHelp, Clock3, Droplets, Ellipsis, Flame, Hammer, ImagePlus, Lightbulb,
  MapPin, Menu, MessageCircle, Plus, Search, Send, Settings2, ShieldCheck,
  Sparkles, ThumbsUp, Wifi, X, Wrench,
} from 'lucide-react'
import './App.css'

const initialIssues = [
  {
    id: 'FG-2048', title: 'Water dripping from ceiling near the east stairwell', category: 'Plumbing / Leak',
    building: 'North Hall', floor: '3rd floor', room: 'Near room 308', status: 'In progress', priority: 'Urgent',
    reporter: 'Amara Johnson', assignee: 'Luis Martinez', time: '12 min ago', votes: 18, comments: 4,
    image: 'https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'FG-2047', title: 'Projector flickers during lectures', category: 'Electrical',
    building: 'Science Center', floor: '2nd floor', room: 'Lecture hall 204', status: 'Assigned', priority: 'Medium',
    reporter: 'Noah Williams', assignee: 'Ethan Chen', time: '38 min ago', votes: 12, comments: 6,
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'FG-2046', title: 'Wi-Fi drops out in the library quiet zone', category: 'Internet',
    building: 'Main Library', floor: '1st floor', room: 'Quiet zone', status: 'Reported', priority: 'Low',
    reporter: 'Maya Chen', assignee: 'Unassigned', time: '1 hr ago', votes: 31, comments: 9,
    image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'FG-2045', title: 'Loose desk leg in the back row', category: 'Furniture',
    building: 'Arts Building', floor: '1st floor', room: 'Studio 112', status: 'Fixed', priority: 'Low',
    reporter: 'Maya Chen', assignee: 'Luis Martinez', time: 'Yesterday', votes: 7, comments: 3,
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=85',
  },
]

const categories = ['Plumbing / Leak', 'Electrical', 'Furniture', 'Cleaning', 'Internet', 'Other']
const buildings = ['North Hall', 'Science Center', 'Main Library', 'Arts Building', 'West Residence']
const navItems = [
  { label: 'Home', icon: Building2 }, { label: 'Community feed', icon: MessageCircle },
  { label: 'My reports', icon: Wrench }, { label: 'My tasks', icon: Hammer },
  { label: 'Notifications', icon: Bell },
]

function readSaved(key, fallback) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}

function categoryIcon(category) {
  if (category?.includes('Plumbing')) return <Droplets size={24} />
  if (category === 'Electrical') return <Lightbulb size={24} />
  if (category === 'Internet') return <Wifi size={24} />
  return <Wrench size={24} />
}

function StatusPill({ status }) {
  return <span className={`status-pill status-${status.toLowerCase().replaceAll(' ', '-')}`}>{status}</span>
}

function IssueCard({ issue, onOpen, onVote, voted, compact = false }) {
  return (
    <article className={`issue-card ${compact ? 'issue-card-compact' : ''}`} onClick={() => onOpen(issue)} tabIndex="0" onKeyDown={(event) => event.key === 'Enter' && onOpen(issue)}>
      <div className="issue-photo-wrap">
        <div className="issue-photo-placeholder">{categoryIcon(issue.category)}</div>
        {issue.image && <img className="issue-photo" src={issue.image} alt="" onError={(event) => { event.currentTarget.hidden = true; event.currentTarget.parentElement?.classList.add('image-failed') }} />}
        <span className={`priority-dot priority-${issue.priority.toLowerCase()}`} title={`${issue.priority} priority`} />
      </div>
      <div className="issue-content">
        <div className="issue-eyebrow"><span>{issue.category}</span><span className="issue-dot">/</span><span>{issue.id}</span></div>
        <h3>{issue.title}</h3>
        <div className="issue-location"><MapPin size={13} />{issue.building} <span>/</span> {issue.floor}, {issue.room}</div>
        {!compact && <div className="issue-meta"><span>{issue.reporter} <span className="issue-dot">/</span> {issue.time}</span><StatusPill status={issue.status} /></div>}
      </div>
      <div className="issue-actions">
        <button className={`vote-button ${voted ? 'is-voted' : ''}`} aria-label={voted ? 'Remove me too vote' : 'Me too'} onClick={(event) => { event.stopPropagation(); onVote(issue.id) }}>
          <ThumbsUp size={15} /><span>{issue.votes}</span>
        </button>
        <span className="comment-count"><MessageCircle size={14} /> {issue.comments}</span>
      </div>
    </article>
  )
}

function Sheet({ children, onClose, title, wide = false }) {
  return (
    <motion.div className="sheet-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <motion.section className={`sheet ${wide ? 'sheet-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title} initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} transition={{ type: 'spring', damping: 28, stiffness: 280 }}>
        <div className="sheet-grabber" />
        <div className="sheet-heading"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button></div>
        {children}
      </motion.section>
    </motion.div>
  )
}

function ReportForm({ onClose, onSubmit, issues }) {
  const [form, setForm] = useState({ category: categories[0], building: buildings[0], floor: '1st floor', room: '', description: '', urgent: false })
  const [photo, setPhoto] = useState('')
  const [aiMessage, setAiMessage] = useState('')
  const [aiModel, setAiModel] = useState('')
  const [aiError, setAiError] = useState(false)
  const [thinking, setThinking] = useState(false)
  const duplicate = issues.find((issue) => issue.category === form.category && issue.building === form.building && issue.floor === form.floor && issue.room.trim().toLowerCase() === form.room.trim().toLowerCase() && issue.room.trim() && issue.status !== 'Fixed')
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  async function askGemma() {
    if (!form.description.trim()) {
      setAiMessage('Add a short description first so Gemma has something to review.')
      setAiModel('')
      setAiError(true)
      return
    }
    setThinking(true)
    setAiMessage('')
    setAiModel('')
    setAiError(false)
    try {
      const response = await fetch('http://127.0.0.1:5000/api/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: form.description }),
      })
      const result = await response.json()
      if (!response.ok || result.success !== true || typeof result.analysis !== 'string' || !result.analysis.trim()) {
        throw new Error('The analysis service did not return a valid result.')
      }
      setAiMessage(result.analysis)
      setAiModel(typeof result.model === 'string' ? result.model : '')
    } catch {
      setAiMessage('Gemma analysis is unavailable right now. Please try again in a moment.')
      setAiError(true)
    } finally {
      setThinking(false)
    }
  }

  function submit(event) {
    event.preventDefault()
    onSubmit({ ...form, image: photo || '', priority: form.urgent ? 'Urgent' : 'Medium' })
    onClose()
  }

  return (
    <form className="report-form" onSubmit={submit}>
      <p className="sheet-intro">A few details help the right person get there faster.</p>
      <label className="field-label">What needs attention?<select value={form.category} onChange={(event) => update('category', event.target.value)}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
      <div className="field-grid">
        <label className="field-label">Building<select value={form.building} onChange={(event) => update('building', event.target.value)}>{buildings.map((building) => <option key={building}>{building}</option>)}</select></label>
        <label className="field-label">Floor<select value={form.floor} onChange={(event) => update('floor', event.target.value)}>{['Basement', '1st floor', '2nd floor', '3rd floor', '4th floor'].map((floor) => <option key={floor}>{floor}</option>)}</select></label>
      </div>
      <label className="field-label">Room or nearby landmark<input value={form.room} onChange={(event) => update('room', event.target.value)} placeholder="e.g. Room 204, east stairwell" required /></label>
      <label className="field-label">A short description<textarea value={form.description} onChange={(event) => { update('description', event.target.value); setAiMessage(''); setAiModel(''); setAiError(false) }} placeholder="What happened? Anything else we should know?" rows="3" required /></label>
      {duplicate && <div className="duplicate-hint"><Sparkles size={16} /><span>Similar report in this building: <button type="button" onClick={() => { onClose(); document.dispatchEvent(new CustomEvent('open-issue', { detail: duplicate.id })) }}>{duplicate.title}</button>. Add your vote instead?</span></div>}
      <div className="report-tools">
        <label className="upload-button"><ImagePlus size={17} /><span>{photo ? 'Photo added' : 'Add a photo'}</span><input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) setPhoto(URL.createObjectURL(file)) }} /></label>
        <button className="gemma-button" type="button" onClick={askGemma} disabled={thinking}><Sparkles size={16} />{thinking ? 'Analyzing...' : 'Ask Gemma'}</button>
      </div>
      {photo && <img className="upload-preview" src={photo} alt="Selected report" />}
      {aiMessage && <div className={`ai-message ${aiError ? 'ai-error' : ''}`} role={aiError ? 'alert' : 'status'}><p>{aiMessage}</p>{aiModel && <small>{aiModel}</small>}</div>}
      <label className="urgency-toggle"><span><strong>Needs urgent attention</strong><small>For active leaks, hazards, or safety concerns</small></span><input type="checkbox" checked={form.urgent} onChange={(event) => update('urgent', event.target.checked)} /><span className="switch-track" /></label>
      <button className="primary-button submit-report" type="submit">Send report <ArrowRight size={17} /></button>
      <p className="privacy-note"><ShieldCheck size={13} /> Your campus facilities team will be notified.</p>
    </form>
  )
}

function IssueDetails({ issue, role, voted, onVote, onClose, onUpdate, onComment, userName }) {
  const [comment, setComment] = useState('')
  const [feedback, setFeedback] = useState('')
  const [rating, setRating] = useState(0)
  const [afterPhoto, setAfterPhoto] = useState('')
  const canManage = role === 'Warden'
  const canComplete = role === 'Worker' && issue.assignee === userName
  const timeline = [
    { label: 'Reported', time: issue.time, done: true },
    { label: 'Assigned', time: issue.assignee !== 'Unassigned' ? `Assigned to ${issue.assignee}` : 'Awaiting assignment', done: issue.assignee !== 'Unassigned' },
    { label: 'In progress', time: issue.status === 'In progress' || issue.status === 'Fixed' || issue.status === 'Verified' ? 'Work has started' : 'Not started yet', done: issue.status === 'In progress' || issue.status === 'Fixed' || issue.status === 'Verified' },
    { label: 'Fixed', time: issue.status === 'Fixed' || issue.status === 'Verified' ? 'Work marked complete' : 'Pending completion', done: issue.status === 'Fixed' || issue.status === 'Verified' },
    { label: 'Verified', time: issue.status === 'Verified' ? 'Reporter or warden verified' : 'Awaiting confirmation', done: issue.status === 'Verified' },
  ]
  return (
    <Sheet title={issue.id} onClose={onClose} wide>
      <div className="detail-scroll"><div className="detail-photo"><img src={issue.image || 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=85'} alt="Issue location" onError={(event) => { event.currentTarget.hidden = true }} /><StatusPill status={issue.status} /></div><div className="detail-summary"><div className="issue-eyebrow"><span>{issue.category}</span><span className="issue-dot">/</span><span>{issue.building}</span><span className="issue-dot">/</span><span>{issue.floor}</span></div><h2>{issue.title}</h2><p>Reported by {issue.reporter} <span>/</span> {issue.time}</p><div className="detail-interactions"><button className={`vote-button ${voted ? 'is-voted' : ''}`} onClick={() => onVote(issue.id)}><ThumbsUp size={15} /> Me too <strong>{issue.votes}</strong></button><span><MessageCircle size={15} /> {issue.comments} comments</span></div></div>
        {issue.afterPhoto && <div className="after-photo-wrap"><span>WORKER AFTER PHOTO</span><img src={issue.afterPhoto} alt="Maintenance work after photo" /></div>}
        {canManage && <div className="warden-controls"><label className="field-label">Priority<select value={issue.priority} onChange={(event) => onUpdate(issue.id, { priority: event.target.value })}>{['Low', 'Medium', 'Urgent'].map((item) => <option key={item}>{item}</option>)}</select></label><label className="field-label">Assign worker<select value={issue.assignee} onChange={(event) => onUpdate(issue.id, { assignee: event.target.value, status: event.target.value === 'Unassigned' ? 'Reported' : 'Assigned' })}>{['Unassigned', 'Luis Martinez', 'Ethan Chen', 'Priya Patel'].map((item) => <option key={item}>{item}</option>)}</select></label></div>}
        <div className="detail-grid"><section className="timeline-panel"><h3>Progress</h3><div className="timeline">{timeline.map((step) => <div className={`timeline-step ${step.done ? 'timeline-done' : ''}`} key={step.label}><span className="timeline-marker">{step.done ? <Check size={12} /> : null}</span><span><strong>{step.label}</strong><small>{step.time}</small></span></div>)}</div></section><section className="comments-panel"><h3>Community updates</h3><div className="comment-entry"><span className="profile-avatar tiny-avatar">AJ</span><p><strong>Amara Johnson</strong><small>Thanks for reporting this. It's getting worse when it rains.</small></p></div>{issue.lastComment && <div className="comment-entry"><span className="profile-avatar tiny-avatar">MC</span><p><strong>Campus community</strong><small>{issue.lastComment}</small></p></div>}<form className="comment-form" onSubmit={(event) => { event.preventDefault(); if (comment.trim()) { onComment(issue.id, comment.trim()); setComment('') } }}><input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add to the conversation..." aria-label="Write a comment" /><button aria-label="Send comment"><Send size={15} /></button></form></section></div>
        {canComplete && issue.status === 'Assigned' && <button className="primary-button detail-action" onClick={() => onUpdate(issue.id, { status: 'In progress' })}><Hammer size={17} /> Start this task</button>}
        {canComplete && issue.status !== 'Fixed' && issue.status !== 'Verified' && <div className="worker-complete"><label className="upload-button"><ImagePlus size={17} /><span>{afterPhoto ? 'After photo added' : 'Add after photo'}</span><input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) setAfterPhoto(URL.createObjectURL(file)) }} /></label><button className="primary-button detail-action" onClick={() => onUpdate(issue.id, { status: 'Fixed', afterPhoto })}><CheckCircle2 size={17} /> Mark as done</button></div>}
        {role === 'Worker' && issue.assignee === userName && <div className="worker-contact"><a href="tel:+15550140100">Call warden</a><a href="mailto:warden@northwood.edu">Message warden</a></div>}
        {(role === 'Warden' || role === 'Teacher') && issue.status === 'Fixed' && <button className="primary-button detail-action" onClick={() => onUpdate(issue.id, { status: 'Verified' })}><ShieldCheck size={17} /> Verify completed work</button>}
        {role === 'Teacher' && issue.status !== 'Fixed' && issue.status !== 'Verified' && <button className="secondary-action detail-action" onClick={() => onUpdate(issue.id, { priority: 'Urgent' })}><Flame size={16} /> Escalate to warden</button>}
        {issue.status === 'Fixed' && issue.reporter === userName && <div className="feedback-box"><h3>Is it really fixed?</h3><p>Your feedback helps keep repairs accountable.</p><div className="feedback-actions"><button onClick={() => { setFeedback('resolved'); onUpdate(issue.id, { status: 'Verified' }) }}><CheckCircle2 size={15} /> Resolved</button><button onClick={() => { setFeedback('not-fixed'); onUpdate(issue.id, { status: 'In progress' }) }}><Wrench size={15} /> Not fixed</button></div><div className="rating-row"><span>Rate this fix</span>{[1, 2, 3, 4, 5].map((star) => <button key={star} aria-label={`${star} stars`} className={rating >= star ? 'star-active' : ''} onClick={() => setRating(star)}>*</button>)}</div>{feedback && <small className="feedback-thanks">Thanks, your feedback was sent.</small>}</div>}
      </div>
    </Sheet>
  )
}

function App() {
  const [issues, setIssues] = useState(() => readSaved('fixgenie-issues', initialIssues))
  const [role, setRole] = useState(() => readSaved('fixgenie-role', 'Student'))
  const [activeView, setActiveView] = useState('Home')
  const [voted, setVoted] = useState(() => readSaved('fixgenie-voted', []))
  const [notifications, setNotifications] = useState(() => readSaved('fixgenie-notifications', [
    { id: 1, title: 'Your report was assigned', detail: 'Projector flickers during lectures / Science Center', time: '38 min ago', unread: true },
    { id: 2, title: '18 people said "Me too"', detail: 'Water dripping near the east stairwell', time: '1 hr ago', unread: true },
    { id: 3, title: 'A task was marked fixed', detail: 'Desk leg in Studio 112', time: 'Yesterday', unread: false },
  ]))
  const [sheet, setSheet] = useState('')
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [buildingFilter, setBuildingFilter] = useState('All buildings')
  const [categoryFilter, setCategoryFilter] = useState('All categories')
  const [mobileNav, setMobileNav] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => { localStorage.setItem('fixgenie-issues', JSON.stringify(issues)) }, [issues])
  useEffect(() => { localStorage.setItem('fixgenie-role', JSON.stringify(role)) }, [role])
  useEffect(() => { localStorage.setItem('fixgenie-voted', JSON.stringify(voted)) }, [voted])
  useEffect(() => { localStorage.setItem('fixgenie-notifications', JSON.stringify(notifications)) }, [notifications])
  useEffect(() => {
    const openIssue = (event) => setSelectedIssue(issues.find((issue) => issue.id === event.detail) || null)
    document.addEventListener('open-issue', openIssue)
    return () => document.removeEventListener('open-issue', openIssue)
  }, [issues])
  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 2800)
    return () => window.clearTimeout(timer)
  }, [toast])

  const userName = role === 'Student' ? 'Maya Chen' : role === 'Teacher' ? 'Noah Williams' : role === 'Warden' ? 'Jordan Ellis' : 'Luis Martinez'
  const openIssues = issues.filter((issue) => issue.status !== 'Fixed' && issue.status !== 'Verified')
  const unseen = notifications.filter((notification) => notification.unread).length
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch = `${issue.title} ${issue.category} ${issue.building} ${issue.id}`.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'All' || issue.status === filter || issue.priority === filter
    const matchesBuilding = buildingFilter === 'All buildings' || issue.building === buildingFilter
    const matchesCategory = categoryFilter === 'All categories' || issue.category === categoryFilter
    const matchesView = activeView !== 'My reports' || issue.reporter === userName
    const matchesTasks = activeView !== 'My tasks' || (role === 'Worker' ? issue.assignee === userName && issue.status !== 'Fixed' && issue.status !== 'Verified' : issue.status !== 'Fixed')
    return matchesSearch && matchesFilter && matchesBuilding && matchesCategory && matchesView && matchesTasks
  })

  function voteFor(id) {
    const hasVoted = voted.includes(id)
    setVoted((current) => hasVoted ? current.filter((value) => value !== id) : [...current, id])
    setIssues((current) => current.map((issue) => issue.id === id ? { ...issue, votes: issue.votes + (hasVoted ? -1 : 1) } : issue))
    setSelectedIssue((current) => current?.id === id ? { ...current, votes: current.votes + (hasVoted ? -1 : 1) } : current)
  }

  function addReport(report) {
    const issue = { ...report, id: `FG-${2050 + issues.length}`, title: report.description, status: 'Reported', reporter: userName, assignee: 'Unassigned', time: 'Just now', votes: 1, comments: 0 }
    setIssues((current) => [issue, ...current])
    setNotifications((current) => [{ id: Date.now(), title: 'Your report was received', detail: issue.title, time: 'Just now', unread: true }, ...current])
    setToast('Report sent to your campus team')
    setActiveView('My reports')
  }

  function updateIssue(id, changes) {
    setIssues((current) => current.map((issue) => issue.id === id ? { ...issue, ...changes } : issue))
    setSelectedIssue((current) => current?.id === id ? { ...current, ...changes } : current)
    if (changes.status || changes.priority || changes.assignee) {
      const eventLabel = changes.status ? `Report ${changes.status.toLowerCase()}` : changes.priority ? `Priority set to ${changes.priority.toLowerCase()}` : 'Report assigned'
      setNotifications((current) => [{ id: Date.now(), title: eventLabel, detail: issues.find((issue) => issue.id === id)?.title || '', time: 'Just now', unread: true }, ...current])
      setToast(changes.status ? `Status updated to ${changes.status}` : eventLabel)
    }
  }

  function addComment(id, comment) {
    const target = issues.find((issue) => issue.id === id)
    updateIssue(id, { comments: (target?.comments || 0) + 1, lastComment: comment })
    setToast('Comment added')
  }

  const title = activeView === 'Home' ? (role === 'Warden' ? 'Campus overview' : role === 'Worker' ? 'Your work orders' : `Good morning, ${userName.split(' ')[0]}`) : activeView

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <a className="brand" href="#home" onClick={(event) => { event.preventDefault(); setActiveView('Home') }}><span className="brand-mark"><Sparkles size={19} /></span><span>fixgenie</span></a>
        <div className="campus-label">CAMPUS</div>
        <div className="campus-select"><span className="campus-avatar">N</span><span><strong>Northwood College</strong><small>Campus services</small></span><ChevronDown size={15} /></div>
        <div className="nav-caption">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">{navItems.map(({ label, icon: Icon }) => <button key={label} className={`nav-item ${activeView === label ? 'nav-active' : ''} ${label === 'My tasks' && role !== 'Worker' ? 'nav-staff-only' : ''}`} onClick={() => { setActiveView(label); setMobileNav(false); if (label === 'Notifications') setNotifications((current) => current.map((item) => ({ ...item, unread: false }))) }}><Icon size={18} /><span>{label}</span>{label === 'Notifications' && unseen > 0 && <span className="nav-badge">{unseen}</span>}</button>)}</nav>
        <div className="sidebar-bottom"><div className="team-card"><div className="team-card-icon"><CircleHelp size={17} /></div><div><strong>Need a hand?</strong><span>Contact campus support</span></div><ArrowRight size={15} /></div><button className="profile-button" onClick={() => setSheet('profile')}><span className="profile-avatar">{userName.split(' ').map((part) => part[0]).join('')}</span><span className="profile-copy"><strong>{userName}</strong><small>{role}</small></span><Ellipsis size={18} /></button></div>
      </aside>
      {mobileNav && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}

      <main className="main-area">
        <header className="topbar"><button className="icon-button mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={20} /></button><div className="breadcrumb"><span>Northwood College</span><span>/</span><strong>{activeView}</strong></div><div className="topbar-actions"><label className="global-search"><Search size={16} /><input value={search} onChange={(event) => { setSearch(event.target.value); if (event.target.value) setActiveView('Community feed') }} placeholder="Search campus issues" /><kbd>Ctrl K</kbd></label><button className="icon-button top-notification" aria-label="Notifications" onClick={() => { setActiveView('Notifications'); setNotifications((current) => current.map((item) => ({ ...item, unread: false }))) }}><Bell size={18} />{unseen > 0 && <i />}</button><button className="primary-button top-report" onClick={() => setSheet('report')}><Plus size={16} /> New report</button></div></header>

        <div className="page-wrap">
          {(activeView === 'Home' || activeView === 'My reports' || activeView === 'My tasks') && <section className="welcome-row"><div><div className="overline">CAMPUS SERVICE DESK <span className="overline-dot">/</span> NORTHWOOD CAMPUS</div><h1>{title}</h1><p>{role === 'Warden' ? 'Here is what needs your attention across campus.' : role === 'Worker' ? 'Your assigned jobs, sorted by priority.' : 'A better campus starts with speaking up.'}</p></div><button className="role-switch" onClick={() => setSheet('profile')}><span className="profile-avatar small-avatar">{userName.split(' ').map((part) => part[0]).join('')}</span>{role}<ChevronDown size={14} /></button></section>}

          {activeView === 'Home' && <>
            <section className="stat-grid" aria-label="Campus issue summary"><div className="stat-card"><div className="stat-top"><span>Open reports</span><span className="stat-icon stat-blue"><Wrench size={17} /></span></div><strong>{openIssues.length.toString().padStart(2, '0')}</strong><small>Currently need attention</small></div><div className="stat-card"><div className="stat-top"><span>In progress</span><span className="stat-icon stat-orange"><Clock3 size={17} /></span></div><strong>{issues.filter((issue) => issue.status === 'In progress').length.toString().padStart(2, '0')}</strong><small>Across campus buildings</small></div><div className="stat-card"><div className="stat-top"><span>Resolved reports</span><span className="stat-icon stat-green"><CheckCircle2 size={17} /></span></div><strong>{issues.filter((issue) => issue.status === 'Fixed' || issue.status === 'Verified').length.toString().padStart(2, '0')}</strong><small>Marked fixed or verified</small></div><div className="stat-card stat-pulse"><div className="stat-top"><span>Campus response</span><span className="pulse-live"><i /> DEMO</span></div><strong>2.4 <small>hrs</small></strong><small>Sample average response time</small><div className="mini-bars" aria-hidden="true">{[34, 55, 42, 69, 45, 78, 58, 90, 64, 75, 50, 82].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div></div></section>
            <section className="content-grid"><div className="primary-column"><div className="section-heading"><div><span className="section-kicker">THE LATEST</span><h2>Campus pulse</h2></div><button className="text-button" onClick={() => setActiveView('Community feed')}>View all reports <ArrowRight size={15} /></button></div><div className="issue-list">{issues.slice(0, 4).map((issue) => <IssueCard key={issue.id} issue={issue} onOpen={setSelectedIssue} onVote={voteFor} voted={voted.includes(issue.id)} compact />)}</div><button className="feed-more" onClick={() => setActiveView('Community feed')}>Explore community feed <ArrowRight size={15} /></button></div><aside className="right-column"><div className="attention-card"><div className="attention-photo"><img src="https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?auto=format&fit=crop&w=900&q=85" alt="Campus building exterior" onError={(event) => { event.currentTarget.hidden = true }} /><span><Flame size={13} /> NEEDS ATTENTION</span></div><div className="attention-body"><div className="attention-label"><span>URGENT REPORT</span><span>12 MIN AGO</span></div><h3>Water dripping near east stairwell</h3><p>North Hall <span>/</span> 3rd floor</p><button onClick={() => setSelectedIssue(issues[0])}>See report <ArrowRight size={15} /></button></div></div><div className="quick-panel"><div className="quick-title"><h3>Quick actions</h3><Settings2 size={16} /></div><button onClick={() => setSheet('report')}><span className="quick-icon quick-blue"><Plus size={17} /></span><span><strong>Report an issue</strong><small>Something need fixing?</small></span><ArrowRight size={15} /></button><button onClick={() => setActiveView(role === 'Worker' ? 'My tasks' : 'My reports')}><span className="quick-icon quick-green"><Check size={17} /></span><span><strong>{role === 'Worker' ? 'View assigned tasks' : 'Track your reports'}</strong><small>See the latest updates</small></span><ArrowRight size={15} /></button></div><div className="help-note"><span className="help-spark"><Sparkles size={15} /></span><p><strong>Small fixes make a big difference.</strong><br />Thanks for looking out for your campus.</p></div></aside></section>
          </>}

          {(activeView === 'Community feed' || activeView === 'My reports' || activeView === 'My tasks') && <section className="list-view"><div className="list-toolbar"><div className="segmented-control" aria-label="Filter reports">{(role === 'Warden' ? ['All', 'Reported', 'Assigned', 'In progress', 'Fixed', 'Verified', 'Low', 'Medium', 'Urgent'] : ['All', 'Reported', 'In progress', 'Fixed', 'Urgent']).map((item) => <button key={item} className={filter === item ? 'segment-active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div><button className="sort-button" onClick={() => setIssues((current) => [...current].reverse())}><ArrowDownUp size={15} /> Most recent</button></div>{role === 'Warden' && <div className="warden-filter-row"><label>Building<select value={buildingFilter} onChange={(event) => setBuildingFilter(event.target.value)}><option>All buildings</option>{buildings.map((building) => <option key={building}>{building}</option>)}</select></label><label>Category<select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option>All categories</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></label></div>}<div className="feed-results"><div className="feed-results-title"><span>{filteredIssues.length} {activeView === 'My tasks' ? 'tasks' : 'reports'}</span><span>Sorted by recent activity</span></div>{filteredIssues.length ? filteredIssues.map((issue) => <IssueCard key={issue.id} issue={issue} onOpen={setSelectedIssue} onVote={voteFor} voted={voted.includes(issue.id)} />) : <div className="empty-state"><span><CheckCircle2 size={26} /></span><h3>All clear! Nothing to fix.</h3><p>When an issue matches your view, it'll show up here.</p><button className="primary-button" onClick={() => setSheet('report')}><Plus size={16} /> Report an issue</button></div>}</div></section>}

          {activeView === 'Notifications' && <section className="notifications-view"><div className="section-heading"><div><span className="section-kicker">YOU'RE ALL CAUGHT UP</span><h2>Notifications</h2></div><span className="notification-count">{notifications.length} updates</span></div><div className="notification-list">{notifications.map((notification) => <div className={`notification-item ${notification.unread ? 'notification-unread' : ''}`} key={notification.id}><span className="notification-icon"><Bell size={17} /></span><div><strong>{notification.title}</strong><p>{notification.detail}</p><small>{notification.time}</small></div>{notification.unread && <i />}</div>)}</div></section>}
        </div>
      </main>

      <nav className="mobile-tabbar" aria-label="Mobile navigation">{[{ label: 'Home', icon: Building2 }, { label: 'Feed', icon: MessageCircle }, { label: 'Report', icon: Plus }, { label: 'Alerts', icon: Bell }, { label: 'Profile', icon: Menu }].map(({ label, icon: Icon }) => <button key={label} className={`${(label === 'Feed' && activeView === 'Community feed') || (label === 'Alerts' && activeView === 'Notifications') || label === activeView ? 'mobile-tab-active' : ''} ${label === 'Report' ? 'mobile-report-tab' : ''}`} onClick={() => label === 'Report' ? setSheet('report') : label === 'Profile' ? setSheet('profile') : setActiveView(label === 'Feed' ? 'Community feed' : label === 'Alerts' ? 'Notifications' : label)}><Icon size={label === 'Report' ? 22 : 19} /><span>{label}</span></button>)}</nav>

      <AnimatePresence>{sheet === 'report' && <Sheet key="report" title="New maintenance report" onClose={() => setSheet('')}><ReportForm onClose={() => setSheet('')} onSubmit={addReport} issues={issues} /></Sheet>}{sheet === 'profile' && <Sheet key="profile" title="Your account" onClose={() => setSheet('')}><div className="profile-sheet"><div className="profile-sheet-person"><span className="profile-avatar large-avatar">{userName.split(' ').map((part) => part[0]).join('')}</span><div><strong>{userName}</strong><small>{role} / Northwood College</small></div></div><label className="field-label">Switch demo role<select value={role} onChange={(event) => { setRole(event.target.value); setSheet(''); setToast(`Viewing as ${event.target.value}`) }}>{['Student', 'Teacher', 'Warden', 'Worker'].map((option) => <option key={option}>{option}</option>)}</select></label>{role === 'Warden' && <div className="approval-note"><ShieldCheck size={17} /><span>Warden accounts require admin approval in a connected production setup.</span></div>}<button className="settings-row" onClick={() => { setSheet(''); setToast('Settings are saved on this device') }}><Settings2 size={17} /> Preferences <ArrowRight size={15} /></button><p className="demo-disclaimer">Demo mode / Your changes are saved in this browser.</p></div></Sheet>}</AnimatePresence>
      <AnimatePresence>{selectedIssue && <IssueDetails key={selectedIssue.id} issue={selectedIssue} role={role} voted={voted.includes(selectedIssue.id)} onVote={voteFor} onClose={() => setSelectedIssue(null)} onUpdate={updateIssue} onComment={addComment} userName={userName} />}</AnimatePresence>
      <AnimatePresence>{toast && <motion.div className="toast" initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }}><CheckCircle2 size={17} />{toast}</motion.div>}</AnimatePresence>
    </div>
  )
}

export default App
