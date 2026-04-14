export interface PasswordRule {
  id: string;
  label: string;
  isValid: (password: string) => boolean;
}

export const passwordRules: PasswordRule[] = [
  {
    id: 'length',
    label: 'Độ dài từ 8-12 ký tự',
    isValid: (password: string) => password.length >= 8 && password.length <= 12,
  },
  {
    id: 'uppercase',
    label: 'Chứa ít nhất một chữ in hoa',
    isValid: (password: string) => /[A-Z]/.test(password),
  },
  {
    id: 'lowercase',
    label: 'Chứa ít nhất một chữ thường',
    isValid: (password: string) => /[a-z]/.test(password),
  },
  {
    id: 'number',
    label: 'Chứa ít nhất một chữ số',
    isValid: (password: string) => /\d/.test(password),
  },
];
