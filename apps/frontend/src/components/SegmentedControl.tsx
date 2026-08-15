import { ToggleButton, ToggleButtonGroup } from "@mui/material";

interface SegmentedControlOption<T extends string> {
  label: string;
  value: T;
}

interface SegmentedControlProps<T extends string> {
  ariaLabel: string;
  onChange: (value: T) => void;
  options: Array<SegmentedControlOption<T>>;
  value: T;
}

export function SegmentedControl<T extends string>({
  ariaLabel,
  onChange,
  options,
  value,
}: SegmentedControlProps<T>) {
  return (
    <ToggleButtonGroup
      exclusive
      fullWidth
      aria-label={ariaLabel}
      className="segmented-control"
      value={value}
      onChange={(_, selectedValue: T | null) => {
        if (selectedValue) {
          onChange(selectedValue);
        }
      }}
    >
      {options.map((option) => (
        <ToggleButton
          className="segmented-control__option"
          key={option.value}
          value={option.value}
        >
          {option.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
