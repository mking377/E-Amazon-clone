// frontend/components/InputField.tsx
"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface InputFieldProps {
  type: string;
  placeholderKey: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  showToggle?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ type, placeholderKey, value, onChange, required, showToggle }) => {
  const t = useTranslations("register");
  const [showPassword, setShowPassword] = useState(false);

  const inputType = showToggle && showPassword ? "text" : type;

  return (
    <div className="relative">
      <input
        type={inputType}
        placeholder={t(placeholderKey)}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-400"
        required={required}
      />
      {showToggle && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
        >
          {showPassword ? "🙈" : "👁️"}
        </button>
      )}
    </div>
  );
};

export default InputField;
