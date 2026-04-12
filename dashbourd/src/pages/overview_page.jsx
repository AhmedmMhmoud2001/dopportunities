import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest, ApiError } from '../lib/api'
import { useAuth } from '../auth/auth_context'
import { PageShell } from '../components/page_shell'
import { FiBarChart2, FiCalendar, FiLayers, FiTrendingUp } from 'react-icons/fi'

const STATUS_LABELS = {
  pending: 'قيد الانتظار',
  processing: 'قيد المعالجة',
  done: 'مكتمل',
  rejected: 'مرفوض',
}

function formatArNumber(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return Number(n).toLocaleString('ar-SA')
}

function CompareLine({ label, period }) {
  if (!period) return null
  const { current, previous, changePercent } = period
  if (previous === 0 && current === 0) {
    return (
      <p className="dash-stat-compare dash-stat-compare--muted">
        {label}: لا طلبات في الفترتين
      </p>
    )
  }
  if (previous === 0 && current > 0) {
    return (
      <p className="dash-stat-compare dash-stat-compare--up">
        {label}: لا طلبات في الفترة السابقة — <strong>{formatArNumber(current)}</strong> في الحالية
      </p>
    )
  }
  const cls =
    changePercent > 0
      ? 'dash-stat-compare--up'
      : changePercent < 0
        ? 'dash-stat-compare--down'
        : 'dash-stat-compare--muted'
  const sign = changePercent > 0 ? '+' : ''
  return (
    <p className={`dash-stat-compare ${cls}`}>
      {label}: الفترة السابقة {formatArNumber(previous)} ←{' '}
      <strong>
        {sign}
        {changePercent}%
      </strong>
    </p>
  )
}

function StatCard({ icon, title, value, compareLabel, period, extraHint }) {
  return (
    <div className="dash-card dash-overview-card dash-stat-card">
      <div className="dash-overview-card__head">
        <span className="dash-overview-card__icon" aria-hidden>
          {icon}
        </span>
        <div className="dash-card__label" style={{ marginBottom: 0 }}>
          {title}
        </div>
      </div>
      <div className="dash-stat-value">{formatArNumber(value)}</div>
      {extraHint ? (
        <p className="dash-stat-compare dash-stat-compare--muted">{extraHint}</p>
      ) : (
        <CompareLine label={compareLabel} period={period} />
      )}
    </div>
  )
}

export function OverviewPage() {
  const { token, user } = useAuth()
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!token) return undefined
    if (user?.role !== 'admin') {
      setError('forbidden')
      return undefined
    }
    let cancelled = false
    async function run() {
      try {
        const data = await apiRequest('/v1/contacts/stats/overview', { token })
        if (!cancelled) {
          setStats(data)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError && err.status === 403) setError('forbidden')
          else setError(err?.message || 'تعذّر تحميل الإحصائيات')
        }
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [token, user?.role])

  const displayName = user?.name?.trim() || user?.email || 'زائر'
  const byStatusEntries =
    stats?.byStatus && typeof stats.byStatus === 'object'
      ? Object.entries(stats.byStatus).sort((a, b) => b[1] - a[1])
      : []

  return (
    <PageShell
      title="نظرة عامة"
      subtitle={
        <>
          مرحباً، <b>{displayName}</b>
          <span className="dash-overview-session">
            <span className="dash-badge dash-badge--success">مسجّل الدخول</span>
          </span>
          <span className="dash-overview-subtitle-hint"> — إحصائيات طلبات التواصل</span>
        </>
      }
    >
      {error === 'forbidden' ? (
        <div className="dash-card dash-overview-card">
          <p className="dash-card__hint" style={{ margin: 0 }}>
            عرض الإحصائيات متاح لمسؤولي النظام فقط.
          </p>
        </div>
      ) : error ? (
        <div className="dash-card dash-overview-card">
          <p className="dash-card__hint dash-stat-compare--down" style={{ margin: 0 }}>
            {error}
          </p>
        </div>
      ) : !stats ? (
        <div className="dash-card dash-overview-card">
          <p className="dash-card__hint" style={{ margin: 0 }}>
            جارٍ تحميل الإحصائيات…
          </p>
        </div>
      ) : (
        <>
          <section className="dash-grid dash-overview-stats-grid" aria-label="إحصائيات الطلبات">
            <StatCard
              icon={<FiLayers />}
              title="إجمالي الطلبات"
              value={stats.total}
              extraHint="جميع طلبات التواصل المسجّلة في النظام"
            />
            <StatCard
              icon={<FiTrendingUp />}
              title="هذا الأسبوع"
              value={stats.week?.current}
              compareLabel="مقارنة بالأسبوع الماضي"
              period={stats.week}
            />
            <StatCard
              icon={<FiCalendar />}
              title="هذا الشهر"
              value={stats.month?.current}
              compareLabel="مقارنة بالشهر الماضي"
              period={stats.month}
            />
            <StatCard
              icon={<FiBarChart2 />}
              title="هذه السنة"
              value={stats.year?.current}
              compareLabel="مقارنة بالسنة الماضية"
              period={stats.year}
            />
          </section>

          <section className="dash-overview-secondary" aria-label="التفاصيل">
            <div className="dash-card dash-overview-card">
              <div className="dash-card__label" style={{ marginBottom: 12 }}>
                الطلبات حسب الحالة (كل الأوقات)
              </div>
              {byStatusEntries.length === 0 ? (
                <p className="dash-card__hint" style={{ margin: 0 }}>
                  لا توجد طلبات بعد.
                </p>
              ) : (
                <ul className="dash-stat-status-list">
                  {byStatusEntries.map(([key, count]) => (
                    <li key={key}>
                      <span>{STATUS_LABELS[key] || key}</span>
                      <strong>{formatArNumber(count)}</strong>
                    </li>
                  ))}
                </ul>
              )}
              <p className="dash-card__hint dash-overview-footnote" style={{ marginTop: 14, marginBottom: 0 }}>
                الأسبوع يبدأ يوم الاثنين (توقيت UTC). يمكنك إدارة الطلبات من{' '}
                <Link to="/contacts" className="dash-link">
                  جهات الاتصال
                </Link>
                .
              </p>
            </div>
          </section>
        </>
      )}
    </PageShell>
  )
}
