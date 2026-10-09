import { useCallback, useState } from 'react';

import type { Category } from '../types/category.types';

interface CategoryModalState {
  isOpen: boolean;
  category: Category | null;
}

export function useCategoryModal() {
  const [state, setState] = useState<CategoryModalState>({
    isOpen: false,
    category: null,
  });

  const openCreate = useCallback(() => {
    setState({
      isOpen: true,
      category: null,
    });
  }, []);

  const openEdit = useCallback((category: Category) => {
    setState({
      isOpen: true,
      category,
    });
  }, []);

  const close = useCallback(() => {
    setState({
      isOpen: false,
      category: null,
    });
  }, []);

  return {
    isOpen: state.isOpen,
    category: state.category,
    openCreate,
    openEdit,
    close,
  };
}