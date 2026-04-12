import './StatisticsSection.css';
import { useEffect, useState } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useCountUp } from '../hooks/useCountUp';
import { apiRequest } from '../lib/api';

interface StatItem {
  value: string;
  label: string;
  sortOrder: number;
}

interface StatCardProps {
  number: string;
  label: string;
  delay: number;
}

function StatCard({ number, label, delay }: StatCardProps) {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.3,
    rootMargin: '0px',
    triggerOnce: true,
  });

  const trimmed = number.trim();
  const hasK = /k/i.test(trimmed);
  const suffixPlus = !hasK && trimmed.endsWith('+') && !trimmed.startsWith('+');
  const prefixPlus = trimmed.startsWith('+');
  const numericPart = trimmed.replace(/[^0-9]/g, '');
  const endValue = numericPart ? parseInt(numericPart, 10) : 0;

  const { count } = useCountUp(isVisible ? endValue : 0, {
    duration: 4000,
    start: 0,
    decimals: 0,
  });

  let displayNumber: string;
  if (hasK) {
    displayNumber = `${prefixPlus ? '+' : ''}${count}K`;
  } else if (suffixPlus) {
    displayNumber = `${count}+`;
  } else {
    displayNumber = `${prefixPlus ? '+' : ''}${count}`;
  }

  return (
    <div
      ref={ref}
      className={`stat-card animate-fade-in-scale ${isVisible ? 'animated' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="stat-number animate-count-up">{displayNumber}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

const FALLBACK_STATS: StatItem[] = [
  { value: '2K', label: 'عميل', sortOrder: 0 },
  { value: '+300', label: 'شركة ناجحة', sortOrder: 1 },
  { value: '10+', label: 'خبرة', sortOrder: 2 },
];

function StatisticsSection() {
  const [stats, setStats] = useState<StatItem[]>(FALLBACK_STATS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiRequest<{ stats?: StatItem[] }>('/v1/home-intro');
        if (cancelled || !res?.stats?.length) return;
        const normalized = res.stats
          .map((s, i) => ({
            value: String(s.value ?? ''),
            label: String(s.label ?? ''),
            sortOrder: Number.isFinite(s.sortOrder) ? s.sortOrder : i,
          }))
          .sort((a, b) => a.sortOrder - b.sortOrder);
        setStats(normalized);
      } catch {
        /* keep fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="statistics-section">
      <div className="container">
        <div className="statistics-grid">
          {stats.map((stat, index) => (
            <StatCard
              key={`${stat.sortOrder}-${stat.label}-${index}`}
              number={stat.value}
              label={stat.label}
              delay={index * 150}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default StatisticsSection;
