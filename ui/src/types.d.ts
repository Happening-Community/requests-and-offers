type PromptModalMeta = {
  message: string;
  inputs: {
    label: string;
    type: 'text' | 'number';
    name: string;
    placeholder?: string;
    value?: string;
    required?: boolean;
  }[];
};
