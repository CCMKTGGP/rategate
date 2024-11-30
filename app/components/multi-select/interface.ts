export default interface IMultiSelectProps {
  id?: string;
  label?: string;
  error?: string;
  helpertext?: string;
  value?: string;
  className?: string;
  disabled?: boolean;
  options?: Array<string>;
  selectedOptions?: Array<string>;
  onChange: (value: string) => void;
}
