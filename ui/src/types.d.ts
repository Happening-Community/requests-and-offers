type PromptModalMeta = {
  id: string;
  message: string;
  inputs: {
    label: string;
    type: 'text' | 'number';
    name: string;
    placeholder?: string;
    value?: string;
    required?: boolean;
    min?: number;
    max?: number;
  }[];
  confirmText?: string;
};

type ConfirmModalMeta = {
  id: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
};
