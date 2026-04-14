import React, { lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NavigationProvider, useNavigation } from '@/components/NavigationContext';
import { ThemeProvider, useTheme } from '@/components/ThemeContext';

// Code-split all pages via React.lazy
const Home = lazy(() => import('./pages/Home'));
const Gallery = lazy(() => import('./pages/Gallery'));
const LogCatch = lazy(() => import('./pages/LogCatch'));
const Profile = lazy(() => import('./pages/Profile'));
const CatchMap = lazy(() => import('./pages/CatchMap'));
const SessionDetail = lazy(() => import('./pages/SessionDetail'));
const Trophies = lazy(() => import('./pages/Trophies'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Charts = lazy(() => import('./pages/Charts'));
const Landing = lazy(() => import('./pages/Landing'));
const Community = lazy(() => import('./pages/Community'));
const Sessions = lazy(() => import('./pages/Sessions'));
const AccountSettings = lazy(() => import('./pages/AccountSettings'));

const PAGE_MAP = {
  Home,
  Gallery,
  LogCatch,
  Profile,
  CatchMap,
  SessionDetail,
  Trophies,
  Leaderboard,
  Charts,
  Landing,
  Community,
  Sessions,
  AccountSettings,
};

// Slide variants — unchanged
const variants = {
  push: {
    enter: { x: '100%', opacity: 1 },
    center: { x: 0, opacity: 1 },
    exit: { x: '-30%', opacity: 0.5 },
  },
  pop: {
    enter: { x: '-30%', opacity: 0.5 },
    center: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 1 },
  },
  tab: {
    enter: { opacity: 0, scale: 0.98 },
    center: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
  },
};

function PageFallback() {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #CCFF00', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Router() {
  const { currentPage, direction, stack } = useNavigation();
  const PageComponent = PAGE_MAP[currentPage] || Home;
  const v = variants[direction];

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={stack.map(s => s.page).join('/')}
        initial={v.enter}
        animate={v.center}
        exit={v.exit}
        transition={{ duration: 0.28, ease: [0.32, 0, 0.18, 1] }}
        style={{ position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden' }}
      >
        <Suspense fallback={<PageFallback />}>
          <PageComponent />
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

function getInitialPage() {
  const path = window.location.pathname;
  const search = window.location.search;
  const parts = path.split('/').filter(Boolean);
  const rawPage = parts[parts.length - 1] || 'Home';
  const page = rawPage.charAt(0).toUpperCase() + rawPage.slice(1);
  const params = Object.fromEntries(new URLSearchParams(search));
  return { page: PAGE_MAP[page] ? page : 'Home', params };
}

function ThemedRoot({ initialPage, initialParams, currentPageName }) {
  const { isDark } = useTheme();
  return (
    <NavigationProvider initialPage={currentPageName || initialPage} initialParams={initialParams}>
      <div style={{ position: 'relative', height: '100dvh', overflow: 'hidden', background: isDark ? '#121212' : '#F5F5F0' }}>
        <Router />
      </div>
    </NavigationProvider>
  );
}

export default function Layout({ children, currentPageName }) {
  const { page: initialPage, params: initialParams } = getInitialPage();

  return (
    <ThemeProvider>
      <ThemedRoot initialPage={initialPage} initialParams={initialParams} currentPageName={currentPageName} />
    </ThemeProvider>
  );
}