function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  required = false,
}) {
  return (
    <div>
      {label && (
        <label
          htmlFor={name}
          className="ff-label"
        >
          {label}
          {required && (
            <span className="ml-1 text-lime-300">*</span>
          )}
        </label>
      )}

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="ff-input appearance-none"
      >
        <option value="">
          {placeholder}
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Select;