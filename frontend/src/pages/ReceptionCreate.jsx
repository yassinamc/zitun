import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { TractorIcon, TruckIcon, WeighScaleGraphic } from '../components/illustrations/AgriculturalIcons';

export default function ReceptionCreate() {
  const [customers, setCustomers] = useState([]);
  const [pricing, setPricing] = useState({ customerTransportRate: 0.5, companyTransportRate: 0.65 });
  const [customerId, setCustomerId] = useState('');
  const [gross, setGross] = useState('');
  const [tare, setTare] = useState('');
  const [transportType, setTransportType] = useState('CUSTOMER');
  const [paymentStatus, setPaymentStatus] = useState('CREDIT');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/customers', { params: { limit: 100 } }), api.get('/pricing')])
      .then(([custRes, priceRes]) => {
        setCustomers(custRes.data.data.items);
        setPricing(priceRes.data.data);
        if (custRes.data.data.items[0]) {
          setCustomerId(custRes.data.data.items[0].id);
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'خطأ في التحميل'));
  }, []);

  const net = useMemo(() => {
    const g = Number(gross);
    const t = Number(tare);
    if (!gross || Number.isNaN(g) || Number.isNaN(t)) return null;
    return Number((g - t).toFixed(2));
  }, [gross, tare]);

  const unitPrice =
    transportType === 'COMPANY'
      ? pricing.companyTransportRate
      : pricing.customerTransportRate;

  const total = net !== null && net > 0 ? Number((net * unitPrice).toFixed(2)) : null;

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setResult(null);
    try {
      const { data } = await api.post('/receptions', {
        customerId,
        grossWeightKg: Number(gross),
        tareWeightKg: Number(tare),
        transportType,
        paymentStatus,
      });
      setResult(data.data);
      setGross('');
      setTare('');
    } catch (err) {
      setError(err.response?.data?.message || 'فشل التسجيل');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <WeighScaleGraphic className="w-12 h-12" />
        <h1 className="text-3xl font-extrabold">استقبال الزيتون — القبان</h1>
      </div>

      <form onSubmit={handleSubmit} className="card-orchard space-y-5">
        <div>
          <label className="block mb-1 text-sm text-olive-500">الزبون / الفلاح</label>
          <select
            className="touch-input text-base!"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            required
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm text-olive-500">الوزن القائم (كلغ)</label>
            <input
              className="touch-input"
              type="number"
              step="0.01"
              min="0"
              value={gross}
              onChange={(e) => setGross(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-olive-500">وزن الفارغ / الصناديق (كلغ)</label>
            <input
              className="touch-input"
              type="number"
              step="0.01"
              min="0"
              value={tare}
              onChange={(e) => setTare(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="rounded-2xl bg-olive-950/60 border border-gold-600/40 p-5 text-center">
          <div className="text-sm text-olive-500 mb-1">الوزن الصافي</div>
          <div className="text-5xl font-extrabold text-gold-400">
            {net === null ? '—' : net} <span className="text-2xl">كلغ</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTransportType('CUSTOMER')}
            className={`p-4 rounded-2xl border-2 text-right transition ${
              transportType === 'CUSTOMER'
                ? 'border-gold-500 bg-olive-800'
                : 'border-olive-700/50 bg-olive-900/40'
            }`}
          >
            <TractorIcon className="w-10 h-10 mb-2" />
            <div className="font-bold">جابو الزبون</div>
            <div className="text-gold-400 font-extrabold text-xl">
              {pricing.customerTransportRate} DH / كلغ
            </div>
          </button>
          <button
            type="button"
            onClick={() => setTransportType('COMPANY')}
            className={`p-4 rounded-2xl border-2 text-right transition ${
              transportType === 'COMPANY'
                ? 'border-gold-500 bg-olive-800'
                : 'border-olive-700/50 bg-olive-900/40'
            }`}
          >
            <TruckIcon className="w-10 h-10 mb-2" />
            <div className="font-bold">نقل الشركة</div>
            <div className="text-gold-400 font-extrabold text-xl">
              {pricing.companyTransportRate} DH / كلغ
            </div>
          </button>
        </div>

        <div>
          <label className="block mb-1 text-sm text-olive-500">حالة الأداء</label>
          <select
            className="touch-input text-base!"
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
          >
            <option value="CREDIT">على الحساب</option>
            <option value="PARTIAL">جزئي</option>
            <option value="PAID">مؤدى</option>
          </select>
        </div>

        <div className="rounded-2xl bg-clay-900/40 border border-clay-700/40 p-5 text-center">
          <div className="text-sm text-olive-500 mb-1">المبلغ الإجمالي</div>
          <div className="text-4xl font-extrabold text-gold-400">
            {total === null ? '—' : total.toFixed(2)} DH
          </div>
        </div>

        {error && <div className="text-red-300 text-sm">{error}</div>}
        {result && (
          <div className="rounded-xl border border-olive-500/40 bg-olive-800/40 p-4 text-sm">
            تم التسجيل: <strong>{result.receptionNumber}</strong> — {result.totalAmount} DH
          </div>
        )}

        <button type="submit" className="btn-gold w-full text-xl" disabled={saving || !customerId}>
          {saving ? '...' : 'تسجيل الوزن و طباعة التذكرة'}
        </button>
      </form>
    </div>
  );
}
