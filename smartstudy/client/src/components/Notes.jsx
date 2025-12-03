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
          <h3 className="text-lg font-title text-slate">Quick Notes</h3>
        </div>
        <button className="btn bg-white dark:bg-[#182339] border border-border dark:border-[#1F2A44] hover:bg-gray-50 dark:hover:bg-[#1F2A44] text-slate dark:text-[#E6EAF4] flex items-center gap-2 px-4 py-2 rounded-xl transition-all" onClick={()=>setShowForm(!showForm)}>
          <Plus size={16}/>
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border dark:border-[#1F2A44] p-4 bg-bg-soft dark:bg-[#0D1525]/40 space-y-3">
          <input
            className="w-full border border-border dark:border-[#1F2A44] rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent/40 bg-white dark:bg-[#121A2B] text-slate dark:text-[#E6EAF4]"
            placeholder="Note title..."
            value={title}
            onChange={e=>setTitle(e.target.value)}
            autoFocus
          />
          <textarea
            className="w-full border border-border dark:border-[#1F2A44] rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-accent/40 h-24 resize-none bg-white dark:bg-[#121A2B] text-slate dark:text-[#E6EAF4]"
            placeholder="Note content..."
            value={content}
            onChange={e=>setContent(e.target.value)}
          />
          <div className="flex gap-2">
            <button className="btn bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-xl" onClick={add}>
              Save Note
            </button>
            <button className="btn bg-white dark:bg-[#182339] border border-border dark:border-[#1F2A44] hover:bg-gray-50 dark:hover:bg-[#1F2A44] text-slate dark:text-[#E6EAF4] px-4 py-2 rounded-xl" onClick={()=>setShowForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3 max-h-[400px] overflow-auto pr-2">
        {notes.map(note => {
          const updatedAt = note.updatedAt || note.createdAt || Date.now()
          return (
            <div key={note._id} className="rounded-2xl border-l-4 border-l-accent border-t border-r border-b border-border dark:border-[#1F2A44] p-4 bg-white dark:bg-[#182339] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-semibold text-slate">{note.title}</p>
                  <p className="text-xs text-muted mt-1">{formatDistanceToNow(new Date(updatedAt), { addSuffix:true })}</p>
                </div>
                <button className="text-muted hover:text-error transition-colors" onClick={()=>remove(note)}>
                  <Trash2 size={16}/>
                </button>
              </div>
              {note.content && (
                <p className="text-sm text-slate mt-2 line-clamp-2">{note.content}</p>
              )}
            </div>
          )
        })}
        {notes.length===0 && (
          <div className="rounded-2xl border border-dashed border-border dark:border-[#1F2A44] p-8 text-center bg-transparent">
            <FileText className="mx-auto mb-2 text-muted" size={32}/>
            <p className="text-muted text-sm">No notes yet</p>
            <p className="text-xs text-muted mt-1">Click + to add your first note</p>
          </div>
        )}
      </div>
    </div>
  )
}
