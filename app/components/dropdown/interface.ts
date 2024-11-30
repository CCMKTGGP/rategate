export interface IDropdownProps {
  id?: string;
  label?: string;
  options?: Array<{
    id: string;
    name: string;
  }>;
  defaultValue?: string;
  selectedOption?: {
    id: string;
    name: string;
  };
  onClick?: (value: { id: string; name: string }) => void;
  error?: string;
  helpertext?: string;
  isDisabled?: boolean;
}
