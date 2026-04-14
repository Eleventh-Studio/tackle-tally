import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

const NavigationContext = createContext(null);

const TAB_PAGES = ['Home', 'Gallery', 'Community', 'Sessions', 'Charts', 'Profile'];

// Parse a page name + params from history state or URL
function parseHistoryState(state) {
  if (state && state.page) return state;
  const parts = window.location.pathname.split('/').filter(Boolean);
  const rawPage = parts[parts.length - 1] || 'Home';
  const page = rawPage.charAt(0).toUpperCase() + rawPage.slice(1);
  const params = Object.fromEntries(new URLSearchParams(window.location.search));
  return { page, params };
}

export function NavigationProvider({ children, initialPage, initialParams }) {
  // Per-tab stacks: { [tabPage]: [{ page, params }] }
  const initTabStacks = () => {
    const stacks = {};
    TAB_PAGES.forEach(t => { stacks[t] = [{ page: t, params: {} }]; });
    return stacks;
  };

  const [activeTab, setActiveTab] = useState(
    TAB_PAGES.includes(initialPage) ? initialPage : 'Home'
  );
  const [tabStacks, setTabStacks] = useState(() => {
    const stacks = initTabStacks();
    if (TAB_PAGES.includes(initialPage)) {
      stacks[initialPage] = [{ page: initialPage, params: initialParams || {} }];
    }
    return stacks;
  });
  // For non-tab pages pushed on top of a tab
  const [overlayStack, setOverlayStack] = useState(() => {
    if (!TAB_PAGES.includes(initialPage)) {
      return [{ page: initialPage, params: initialParams || {} }];
    }
    return [];
  });

  const [direction, setDirection] = useState('tab');
  const scrollPositions = useRef({});
  const suppressPopState = useRef(false);

  // The full effective stack = current tab stack + overlay
  const effectiveStack = [...tabStacks[activeTab], ...overlayStack];
  const current = effectiveStack[effectiveStack.length - 1];
  const currentPage = current.page;
  const currentParams = current.params || {};

  // Push a history entry
  const pushHistory = useCallback((page, params) => {
    const state = { page, params };
    const search = Object.keys(params).length
      ? '?' + new URLSearchParams(params).toString()
      : '';
    window.history.pushState(state, '', `/${page}${search}`);
  }, []);

  const navigate = useCallback((page, params = {}) => {
    const isTab = TAB_PAGES.includes(page);
    setDirection(isTab ? 'tab' : 'push');

    if (isTab) {
      // Save scroll of current tab root
      scrollPositions.current[activeTab] = window.scrollY;
      setActiveTab(page);
      setOverlayStack([]);
    } else {
      setOverlayStack(prev => [...prev, { page, params }]);
    }

    pushHistory(page, params);
  }, [activeTab, pushHistory]);

  const goBack = useCallback(() => {
    setDirection('pop');
    if (overlayStack.length > 0) {
      setOverlayStack(prev => {
        const next = prev.slice(0, -1);
        return next;
      });
      window.history.back();
    } else {
      // Already at tab root — nothing to go back to within this tab
      // But still call history.back() to let browser handle it
      window.history.back();
    }
  }, [overlayStack]);

  // Listen for browser back/forward
  useEffect(() => {
    const onPopState = (e) => {
      if (suppressPopState.current) {
        suppressPopState.current = false;
        return;
      }
      const { page, params } = parseHistoryState(e.state);
      const isTab = TAB_PAGES.includes(page);

      if (isTab) {
        setDirection('tab');
        setActiveTab(page);
        setOverlayStack([]);
        // Restore scroll
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollPositions.current[page] || 0);
        });
      } else {
        setDirection('pop');
        // Rebuild overlay based on where we are — simplest: just set to this page
        setOverlayStack(prev => {
          // If page exists earlier in overlay, pop to it; otherwise treat as new
          const idx = prev.findIndex(s => s.page === page);
          if (idx >= 0) return prev.slice(0, idx + 1);
          return [...prev, { page, params }];
        });
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Replace initial history state so popstate has data
  useEffect(() => {
    const state = { page: initialPage, params: initialParams || {} };
    window.history.replaceState(state, '', window.location.href);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getScrollPosition = useCallback((page) => scrollPositions.current[page] || 0, []);

  return (
    <NavigationContext.Provider value={{
      currentPage,
      currentParams,
      navigate,
      goBack,
      stack: effectiveStack,
      direction,
      getScrollPosition,
      activeTab,
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used inside NavigationProvider');
  return ctx;
}