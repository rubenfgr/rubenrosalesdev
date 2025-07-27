export interface AppSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: number[];
  placeholder: string;
  t: (key: string) => string;
}
