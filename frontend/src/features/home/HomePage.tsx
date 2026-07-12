import { useState, useEffect } from 'react';
import { fetchStats } from '../../shared/services/api';
import type { LiveStats } from '../../shared/services/api';
import HeroSection from './HeroSection';
import BringYourOwnAi from './BringYourOwnAi';
import DesktopAppBanner from './DesktopAppBanner';
import TerminalDemo from './TerminalDemo';
import FeaturesGrid from './FeaturesGrid';
import WorkflowSteps from './WorkflowSteps';
import TargetUsers from './TargetUsers';
import LiveStatsSection from './LiveStatsSection';
import CTASection from './CTASection';

export default function HomePage() {
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    let failCount = 0;
    const loadStats = async () => {
      try {
        setStats(await fetchStats());
        setStatsError(false);
      } catch {
        failCount++;
        if (failCount >= 3) setStatsError(true);
      }
    };
    loadStats();
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background: 'var(--surface-0)', color: 'var(--text-primary)' }}>
      <HeroSection />
      <BringYourOwnAi />
      <DesktopAppBanner />
      <TerminalDemo />
      <FeaturesGrid />
      <WorkflowSteps />
      <TargetUsers />
      <LiveStatsSection stats={stats} unavailable={statsError} />
      <CTASection />
    </div>
  );
}
