export interface IPlatformCheckboxProps {
  url: string;
  platform: {
    id: string;
    name: string;
  };
  placeholder: string;
  isLoading?: boolean;
  showSeparator?: boolean;
  onChange: ({ id, url }: { id: string; url: string }) => void;
  onDelete: (id: string) => void;
}
