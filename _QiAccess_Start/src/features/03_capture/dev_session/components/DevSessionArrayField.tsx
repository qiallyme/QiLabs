type DevSessionArrayFieldProps = {
  label: string;
  description?: string;
  placeholder?: string;
  value: string[];
  onChange: (value: string[]) => void;
};

function parseLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function DevSessionArrayField({
  label,
  description,
  placeholder,
  value,
  onChange,
}: DevSessionArrayFieldProps) {
  return (
    <label className="grid gap-2">
      <div className="text-sm font-semibold text-heading">{label}</div>
      {description ? <div className="text-xs leading-5 text-muted">{description}</div> : null}
      <textarea
        className="field min-h-[112px]"
        onChange={(event) => onChange(parseLines(event.target.value))}
        placeholder={placeholder}
        value={value.join("\n")}
      />
    </label>
  );
}
