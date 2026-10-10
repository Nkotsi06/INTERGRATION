function Checkbox({ label, checked, onChange, disabled }) {
  return (
    <label className="form-checkbox">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span>{label}</span>
    </label>
  );
}

export default Checkbox;