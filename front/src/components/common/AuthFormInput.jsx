import React from 'react';

function AuthFormInput({ id, label, type = 'text', value, onChange, required = true }) {
  return (
    <div className="form-group">
      <label htmlFor={id}  className="form-label">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        className="form-control"
        onChange={onChange}
        required={required}
      />
    </div>
  );
}

export default AuthFormInput;