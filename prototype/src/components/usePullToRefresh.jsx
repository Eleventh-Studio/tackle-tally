import { useState, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export default function usePullToRefresh() {
  const [refreshing, setRefreshing] = useState(false);
  const [pullY, setPullY] = useState(0);
  const touchStartY = useRef(null);
  const queryClient = useQueryClient();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setTimeout(() => setRefreshing(false), 800);
  }, [queryClient]);

  const handleTouchStart = (e) => {
    if (window.scrollY === 0) touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (touchStartY.current === null) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0) setPullY(Math.min(delta, 80));
  };

  const handleTouchEnd = () => {
    if (pullY > 50) handleRefresh();
    setPullY(0);
    touchStartY.current = null;
  };

  return { refreshing, pullY, handleTouchStart, handleTouchMove, handleTouchEnd };
}