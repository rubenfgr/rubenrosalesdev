export interface SelectOption<TValue = string> {
  value: TValue;
  label: string;
  disabled?: boolean;
}
