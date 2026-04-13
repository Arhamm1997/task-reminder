import { useEffect } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { getTabTitle } from '@/lib/utils';

export function useTabTitle() {
  const getOverdueCount = useTaskStore(s => s.getOverdueCount);

  useEffect(() => {
    const update = () => {
      document.title = getTabTitle(getOverdueCount());
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [getOverdueCount]);
}
