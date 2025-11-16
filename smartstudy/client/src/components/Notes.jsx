import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { createNote, deleteNote, listNotes, updateNote } from '../api/notes'
import { FileText, Plus, Trash2 } from 'lucide-react'

export default function Notes(){
  const [notes, setNotes] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [showForm, setShowForm] = useState(false)

  const refresh = async () => {
    const data = await listNotes()
    setNotes(data)
  }

  useEffect(()=>{ refresh() }, [])

  const add = async () => {
    if(!title.trim()) return
    const note = await createNote({ title, content })
    setNotes([note, ...notes])
    setTitle('')
    setContent('')
    setShowForm(false)
    window.dispatchEvent(new CustomEvent('notes:refresh'))
  }

  const save = async (note, updatedContent) => {
    const updated = await updateNote(note._id, { content: updatedContent })
    setNotes(notes.map(n => n._id===note._id ? updated : n))
    window.dispatchEvent(new CustomEvent('notes:refresh'))
  }

  const remove = async (note) => {
    await deleteNote(note._id)
    setNotes(notes.filter(n => n._id !== note._id))
    window.dispatchEvent(new CustomEvent('notes:refresh'))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <FileText className="text-accent" size={20}/>
          </div>
          <h3 className="text-lg font-title text-slate dark:text-dark-slate">Quick Notes</h3>
        </div>
        <button className="btn bg-card dark:bg-dark-card border border-border dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-border text-slate dark:text-dark-slate flex items-center gap-2 px-4 py-2 rounded-xl transition-all" onClick={()=>setShowForm(!showForm)}>
          <Plus size={16}/>
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border dark:border-dark-border p-4 bg-bg-soft dark:bg-dark-border space-y-3">
          <input
            className="w-full border border-border dark:border-dark-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent/40 bg-card dark:bg-dark-card text-slate dark:text-dark-slate"
            placeholder="Note title..."
            value={title}
            onChange={e=>setTitle(e.target.value)}
            autoFocus
          />
          <textarea
            className="w-full border border-border dark:border-dark-border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-accent/40 h-24 resize-none bg-card dark:bg-dark-card text-slate dark:text-dark-slate"
            placeholder="Note content..."
            value={content}
            onChange={e=>setContent(e.target.value)}
          />
          <div className="flex gap-2">
            <button className="btn bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-xl" onClick={add}>
              Save Note
            </button>
            <button className="btn bg-card dark:bg-dark-card border border-border dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-border text-slate dark:text-dark-slate px-4 py-2 rounded-xl" onClick={()=>setShowForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3 max-h-[400px] overflow-auto pr-2">
        {notes.map(note => {
          const updatedAt = note.updatedAt || note.createdAt || Date.now()
          return (
            <div key={note._id} className="rounded-2xl border-l-4 border-l-accent border-t border-r border-b border-border dark:border-dark-border p-4 bg-card dark:bg-dark-card shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-semibold text-slate dark:text-dark-slate">{note.title}</p>
                  <p className="text-xs text-muted dark:text-dark-muted mt-1">{formatDistanceToNow(new Date(updatedAt), { addSuffix:true })}</p>
                </div>
                <button className="text-muted dark:text-dark-muted hover:text-error transition-colors" onClick={()=>remove(note)}>
                  <Trash2 size={16}/>
                </button>
              </div>
              {note.content && (
                <p className="text-sm text-slate dark:text-dark-slate mt-2 line-clamp-2">{note.content}</p>
              )}
            </div>
          )
        })}
        {notes.length===0 && (
          <div className="rounded-2xl border border-dashed border-border dark:border-dark-border p-8 text-center">
            <FileText className="mx-auto mb-2 text-muted dark:text-dark-muted" size={32}/>
            <p className="text-muted dark:text-dark-muted text-sm">No notes yet</p>
            <p className="text-xs text-muted dark:text-dark-muted mt-1">Click + to add your first note</p>
          </div>
        )}
      </div>
    </div>
  )
}
