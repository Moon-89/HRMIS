import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../lib/api';

export default function EditTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium', status: 'Todo', assignee: '' });

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/tasks/${id}`);
        setTask(res.data);
        setForm({ title: res.data.title || '', description: res.data.description || '', priority: res.data.priority || 'Medium', status: res.data.status || 'Todo', assignee: res.data.assignee || '' });
      } catch (e) {
        console.error(e);
      }
    })();
  }, [id]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/tasks/${id}`, form);
      navigate(`/tasks/${id}`);
    } catch (e) {
      toast.error('Update failed');
    }
  };

  if (!task) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Edit Task #{id}</h2>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 500 }}>
        <label>Title</label>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />

        <label>Description</label>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} />

        <label>Priority</label>
        <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>

        <label>Status</label>
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option>Todo</option>
          <option>InProgress</option>
          <option>Done</option>
        </select>

        <label>Assignee</label>
        <input value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} />

        <button type="submit">Save</button>
      </form>
    </div>
  );
}
