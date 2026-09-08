import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function CustomerList() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  async function load(q = search) {
    try {
      const { data } = await api.get('/customers', { params: { search: q } });
      setItems(data.data.items);
    } catch (err) {
      setError(err.response?.data?.message || 'خطأ');
    }
  }

  useEffect(() => {
    load('');
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold">الزبناء / الفلاحة</h1>
        <Link to="/customers/new" className="btn-primary">
          زبون جديد
        </Link>
      </div>

      <div className="flex gap-2">
        <input
          className="touch-input text-base!"
          placeholder="بحث بالاسم أو الهاتف..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
        />
        <button type="button" className="btn-primary shrink-0" onClick={() => load()}>
          بحث
        </button>
      </div>

      {error && <div className="text-red-300">{error}</div>}

      <div className="space-y-3">
        {items.map((c) => (
          <div key={c.id} className="card-orchard flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-lg font-bold">
                {c.firstName} {c.lastName}
              </div>
              <div className="text-sm text-olive-500">{c.address || '—'}</div>
              <div className="text-sm text-gold-400 mt-1">مخزون الزيت: {c.oilStockLiters} لتر</div>
            </div>
            <div className="flex gap-2">
              {c.phone && (
                <a href={`tel:${c.phone}`} className="btn-primary text-sm py-2!">
                  اتصال {c.phone}
                </a>
              )}
            </div>
          </div>
        ))}
        {!items.length && <p className="text-olive-500">ما كاين حتى زبون.</p>}
      </div>
    </div>
  );
}
