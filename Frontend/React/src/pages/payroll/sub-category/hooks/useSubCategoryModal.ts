import { useCallback, useState } from 'react';

export interface SubCategoryModalFormState {
  categoryId: string;
  subCategoryName: string;
}

const INITIAL_FORM_STATE: SubCategoryModalFormState = {
  categoryId: '',
  subCategoryName: '',
};

interface UseSubCategoryModalResult {
  isOpen: boolean;
  form: SubCategoryModalFormState;
  errors: Partial<
    Record<keyof SubCategoryModalFormState, string>
  >;

  openModal: () => void;
  closeModal: () => void;

  setCategoryId: (categoryId: string) => void;
  setSubCategoryName: (subCategoryName: string) => void;

  resetForm: () => void;
  validate: () => boolean;
}

export const useSubCategoryModal =
  (): UseSubCategoryModalResult => {
    const [isOpen, setIsOpen] = useState(false);

    const [form, setForm] =
      useState<SubCategoryModalFormState>(
        INITIAL_FORM_STATE,
      );

    const [errors, setErrors] = useState<
      Partial<Record<keyof SubCategoryModalFormState, string>>
    >({});

    const openModal = useCallback(() => {
      setErrors({});
      setIsOpen(true);
    }, []);

    const closeModal = useCallback(() => {
      setIsOpen(false);
      setErrors({});
      setForm(INITIAL_FORM_STATE);
    }, []);

    const resetForm = useCallback(() => {
      setForm(INITIAL_FORM_STATE);
      setErrors({});
    }, []);

    const setCategoryId = useCallback((categoryId: string) => {
      setForm((current) => ({
        ...current,
        categoryId,
      }));

      setErrors((current) => ({
        ...current,
        categoryId: undefined,
      }));
    }, []);

    const setSubCategoryName = useCallback(
      (subCategoryName: string) => {
        setForm((current) => ({
          ...current,
          subCategoryName,
        }));

        setErrors((current) => ({
          ...current,
          subCategoryName: undefined,
        }));
      },
      [],
    );

    const validate = useCallback((): boolean => {
      const nextErrors: Partial<
        Record<keyof SubCategoryModalFormState, string>
      > = {};

      if (!form.categoryId) {
        nextErrors.categoryId = 'Please select a category.';
      }

      if (!form.subCategoryName.trim()) {
        nextErrors.subCategoryName =
          'Please enter a sub category name.';
      } else if (form.subCategoryName.trim().length < 2) {
        nextErrors.subCategoryName =
          'Sub category name must contain at least 2 characters.';
      }

      setErrors(nextErrors);

      return Object.keys(nextErrors).length === 0;
    }, [form]);

    return {
      isOpen,
      form,
      errors,

      openModal,
      closeModal,

      setCategoryId,
      setSubCategoryName,

      resetForm,
      validate,
    };
  };