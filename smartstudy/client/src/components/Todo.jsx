import { useEffect, useMemo, useState } from 'react'
import { listTasks, createTask, updateTask, deleteTask } from '../api/tasks'
import { Plus, Trash2 } from 'lucide-react'

const tabs = ['All','Study','Assignment','Personal']

const detectCategory = (title='') => {
  const t = title.toLowerCase()
  if(t.includes('assignment') || t.includes('report')) return 'Assignment'
  if(t.includes('study') || t.includes('chapter') || t.includes('exam')) return 'Study'
  if(t.includes('buy') || t.includes('call')) return 'Personal'
  return 'Study'
}

export default function Todo(){
  const [items, setItems] = useState([])
  const [input, setInput] = useState('')
  const [tab, setTab] = useState('All')

  const refresh = async () => {
    const data = await listTasks()
    setItems(data)
  }

  useEffect(()=>{
    refresh()
    const handler = () => refresh()
    window.addEventListener('tasks:refresh', handler)
    return () => window.removeEventListener('tasks:refresh', handler)
  }, [])

  const add = async () => {
    if(!input.trim()) return
    const newTask = await createTask({ title: input })
    setItems(prev => [newTask, ...prev])
    setInput('')
    window.dispatchEvent(new CustomEvent('tasks:refresh'))
  }

  const toggle = async (task) => {
    const updated = await updateTask(task._id, { done: !task.done })
    setItems(prev => prev.map(i => i._id===task._id ? updated : i))
    window.dispatchEvent(new CustomEvent('tasks:refresh'))
  }

  const remove = async (task) => {
    await deleteTask(task._id)
    setItems(prev => prev.filter(i => i._id !== task._id))
    window.dispatchEvent(new CustomEvent('tasks:refresh'))
  }

  const filtered = useMemo(()=>{
    if(tab === 'All') return items
    return items.filter(task => detectCategory(task.title) === tab)
  }, [items, tab])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-title text-slate">Tasks</h3>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">All / Study / Assignment / Personal</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2" onClick={add}>
          <Plus size={16}/> Add Task
        </button>
      </div>

      <div className="flex flex-wrap gap-2 text-sm font-semibold">
        {tabs.map(name => (
          <button
            key={name}
            onClick={()=>setTab(name)}
            className={`px-4 py-1.5 rounded-full border ${tab===name ? 'bg-primary text-white border-primary' : 'border-border text-muted'}`}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border dark:border-[#1F2A44] bg-white/60 dark:bg-[#0D1525]/40 p-4 space-y-3">
        <div className="flex gap-2">
          <input
            className="flex-1 border border-border dark:border-[#1F2A44] rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white dark:bg-[#121A2B] text-slate dark:text-[#E6EAF4]"
            placeholder="Review calculus notes..."
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==='Enter') add() }}
          />
          <button className="btn btn-primary" onClick={add}>Add</button>
        </div>

        <div className="space-y-3 max-h-[320px] overflow-auto pr-2">
          {filtered.map(task => {
            const category = detectCategory(task.title)
            return (
              <div key={task._id} className="flex items-center justify-between rounded-2xl border border-border dark:border-[#1F2A44] px-4 py-3 bg-bg-soft dark:bg-[#182339]">
                <label className="flex items-center gap-3 max-w-[70%]">
                  <input type="checkbox" checked={task.done} onChange={()=>toggle(task)} />
                  <div>
                    <p className={`font-semibold ${task.done ? 'line-through text-muted' : 'text-slate'}`}>{task.title}</p>
                    {task.due && <p className="text-xs text-muted">Due {new Date(task.due).toLocaleDateString()}</p>}
                  </div>
                </label>
                <div className="flex items-center gap-3">
                  <span className="pill">{category}</span>
                  <button onClick={()=>remove(task)} className="text-muted hover:text-error"><Trash2 size={16}/></button>
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="text-center text-muted py-10 text-sm">No tasks yet. Add your first one!</div>
          )}
        </div>
      </div>
    </div>
  )
}
