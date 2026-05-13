function FilterSelect({
  value,
  onChange,
  options,
  ariaLabel,
  className = '',
}) {
  const classes = ['filter-select', className].filter(Boolean).join(' ');

  return (
    <select
      className={classes}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={ariaLabel}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default FilterSelect;
