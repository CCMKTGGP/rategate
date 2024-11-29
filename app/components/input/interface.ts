export interface IInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hasHelperText?: boolean;
  helperText?: string;
}
