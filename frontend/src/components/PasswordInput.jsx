import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { passwordFieldClassName } from "../styles/formStyles";

/** passwordFieldClassName includes form-field + pr-10 */

export default function PasswordInput({
  id,
  name,
  value,
  onChange,
  className = "",
  autoComplete,
  minLength,
  required,
  placeholder,
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative mt-1">
      <input
        id={id}
        name={name}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={`${passwordFieldClassName} ${className}`.trim()}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        aria-label={show ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {show ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
      </button>
    </div>
  );
}
