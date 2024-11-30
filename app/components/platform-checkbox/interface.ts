export interface IPlatformCheckboxProps {
  label: string;
  url: string;
  id: string;
  name: string;
  checked: boolean;
  helpertext: string;
  isLoading?: boolean;
  onSelect: ({ id, name }: { id: string; name: string }) => void;
  onChange: ({ id, url }: { id: string; url: string }) => void;
}
