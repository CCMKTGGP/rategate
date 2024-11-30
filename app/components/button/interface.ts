export interface IButtonProps {
  buttonText: string;
  buttonClassName: string;
  onClick: () => void;
  hasIcon?: string;
  icon?: React.ReactNode;
  isDisabled?: boolean;
  isLoading?: boolean;
}
