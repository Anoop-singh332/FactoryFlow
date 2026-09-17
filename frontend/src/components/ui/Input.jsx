function Input({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
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

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="ff-input disabled:cursor-not-allowed disabled:opacity-40"
      />
    </div>
  );
}

export default Input;