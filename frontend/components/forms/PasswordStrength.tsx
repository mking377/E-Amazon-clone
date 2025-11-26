// frontend/components/forms/PasswordStrength.tsx
import { useTranslations } from "next-intl";

interface PasswordStrengthProps {
  password: string;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  const t = useTranslations("register");

  const checks = {
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    length: password.length >= 8,
  };

  const strength = Object.values(checks).filter(Boolean).length;

  const getColor = () => {
    if (strength < 3) return "bg-red-500";
    if (strength < 5) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="mt-2">
      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getColor()}`}
          style={{ width: `${(strength / 5) * 100}%` }}
        ></div>
      </div>
      <div className="mt-2 space-y-1">
        {Object.entries(checks).map(([key, valid]) => (
          <div key={key} className={`flex items-center space-x-2 text-sm ${valid ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
            <span>{valid ? "✅" : "❌"}</span>
            <span>{t(key)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrength;
