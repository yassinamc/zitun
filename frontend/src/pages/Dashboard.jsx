import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { WeighScaleGraphic } from '../components/illustrations/AgriculturalIcons';

export default function Dashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/dashboard/metrics')
      .then((res) => setMetrics(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'خطأ في التحميل'));
  }, []);

  const cards = [
    { label: 'زيتون اليوم (كلغ)', value: metrics?.olivesTodayKg ?? '—', accent: 'text-olive-500' },
    { label: 'الزيت المنتج (لتر)', value: metrics?.oilProducedTodayL ?? '—', accent: 'text-gold-400' },
    { label: 'مخزون الزبناء (لتر)', value: metrics?.customerOilStockL ?? '—', accent: 'text-olive-500' },
    { label: 'المداخيل (درهم)', value: metrics?.revenueTodayDh ?? '—', accent: 'text-gold-400' },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl overflow-hidden relative border border-olive-700/40">
        <div
          className="p-6 md:p-10"
          style={{
            background:
              'linear-gradient(120deg, rgba(28,36,20,0.95), rgba(75,96,56,0.55)), radial-gradient(circle at 80% 20%, rgba(212,147,18,0.25), transparent 45%)',
          }}
        >
          <p className="text-olive-500 mb-1">السلام عليكم</p>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            {user?.tenant?.name || 'OliveFlow'}
          </h1>
          <p className="text-olive-500 max-w-xl">
            نظرة سريعة على نشاط المعصرة اليوم — الوزن، الزيت، والمداخيل بالدرهم.
          </p>
          <Link to="/receptions/new" className="btn-gold inline-flex items-center gap-2 mt-5">
            <WeighScaleGraphic className="w-8 h-8" />
            وزن جديد فالقبان
          </Link>
        </div>
      </section>

      {error && <div className="text-red-300">{error}</div>}

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="card-orchard">
            <div className="text-sm text-olive-500 mb-2">{card.label}</div>
            <div className={`text-3xl font-extrabold ${card.accent}`}>{card.value}</div>
          </div>
        ))}
      </section>

      <section className="card-orchard">
        <h2 className="text-xl font-bold mb-4">آخر العمليات</h2>
        {!metrics?.recentReceptions?.length && (
          <p className="text-olive-500">ما كاين حتى استقبال اليوم. ابدأ بوزنة فالقبان.</p>
        )}
        <div className="space-y-2">
          {metrics?.recentReceptions?.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-2 py-3 border-b border-olive-700/30 last:border-0"
            >
              <div>
                <div className="font-bold">{item.customerName}</div>
                <div className="text-xs text-olive-500">{item.receptionNumber}</div>
              </div>
              <div className="text-left">
                <div className="font-bold text-gold-400">{item.totalAmount} DH</div>
                <div className="text-xs text-olive-500">{item.netWeightKg} كلغ</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
