export interface IPlatformCheckboxProps {
  url: string;
  platform: {
    label: string;
    id: string;
    name: string;
    helpertext: string;
  };
  checked: boolean;
  isLoading?: boolean;
  onSelect: ({ id, name }: { id: string; name: string }) => void;
  onChange: ({ id, url }: { id: string; url: string }) => void;
}
