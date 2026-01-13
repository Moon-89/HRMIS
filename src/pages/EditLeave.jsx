import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../lib/api';

export default function EditLeave() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [leave, setLeave] = useState(null);
  const [form, setForm] = useState({ startDate: '', endDate: '', reason: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/leaves/${id}`);
        setLeave(res.data);
        setForm({ startDate: res.data.startDate || '', endDate: res.data.endDate || '', reason: res.data.reason || '' });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/leaves/${id}`, form);
      navigate(`/leaves/${id}`);
    } catch (err) {
      toast.error('Update failed');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!leave) return <div>Leave not found</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Edit Leave #{id}</h2>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400 }}>
        <label>Start Date</label>
        <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />

        <label>End Date</label>
        <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />

        <label>Reason</label>
        <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={4} required />

        <button type="submit">Save</button>
      </form>
    </div>
  );
}
