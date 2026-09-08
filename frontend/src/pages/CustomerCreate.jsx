import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function CustomerCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    cin: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/customers', form);
      navigate('/customers');
    } catch (err) {
      setError(err.response?.data?.message || 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl space-y-5">
      <h1 className="text-3xl font-extrabold">زبون جديد</h1>
      <form onSubmit={handleSubmit} className="card-orchard space-y-4">
        {[
          ['firstName', 'الاسم'],
          ['lastName', 'النسب'],
          ['cin', 'رقم البطاقة (CIN)'],
          ['phone', 'الهاتف'],
          ['address', 'العنوان'],
        ].map(([key, label]) => (
          <div key={key}>
            <label className="block mb-1 text-sm text-olive-500">{label}</label>
            <input
              className="touch-input text-base!"
              value={form[key]}
              onChange={(e) => setField(key, e.target.value)}
              required={key === 'firstName' || key === 'lastName'}
            />
          </div>
        ))}
        {error && <div className="text-red-300 text-sm">{error}</div>}
        <button type="submit" className="btn-gold w-full" disabled={saving}>
          {saving ? '...' : 'حفظ الزبون'}
        </button>
      </form>
    </div>
  );
}
