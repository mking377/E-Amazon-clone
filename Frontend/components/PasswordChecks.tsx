interface PasswordChecksProps {
  strength: number;
}

const PasswordChecks: React.FC<PasswordChecksProps> = ({ strength }) => {
  const getColor = () => {
    if (strength < 50) return "bg-red-500";
    if (strength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="mt-2">
      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getColor()}`}
          style={{ width: `${strength}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
        Password strength: {strength < 50 ? "Weak" : strength < 75 ? "Medium" : "Strong"}
      </p>
    </div>
  );
};

export default PasswordChecks;



/*

"use client";
import React from "react";
import { useTranslations } from "next-intl";

interface PasswordChecksProps {
  password: string;
}

export default function PasswordChecks({ password }: PasswordChecksProps) {
  const t = useTranslations("register");

  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-={}[\]|:;"'<>,.?/]/.test(password),
  };

  const passedChecks = Object.values(passwordChecks).filter(Boolean).length;
  const passwordStrength = (passedChecks / 5) * 100;

  const renderCheck = (ok: boolean, text: string) => (
    <p
      key={text}
      className={`flex items-center text-sm ${ok ? "text-green-600" : "text-gray-500"}`}
    >
      {ok ? "✔️" : "○"} <span className="ml-2">{text}</span>
    </p>
  );

  const strengthColor =
    passwordStrength < 40
      ? "bg-red-500"
      : passwordStrength < 80
      ? "bg-yellow-500"
      : "bg-green-500";

  return (
    <div className="space-y-2">
      <div className="bg-gray-100 p-3 rounded-lg space-y-1">
        {renderCheck(passwordChecks.uppercase, t("uppercase"))}
        {renderCheck(passwordChecks.lowercase, t("lowercase"))}
        {renderCheck(passwordChecks.number, t("number"))}
        {renderCheck(passwordChecks.special, t("special"))}
        {renderCheck(passwordChecks.length, t("length"))}
      </div>
      <div className="w-full bg-gray-200 h-2 rounded-lg overflow-hidden">
        <div
          className={`${strengthColor} h-2 transition-all duration-300`}
          style={{ width: `${passwordStrength}%` }}
        />
      </div>
    </div>
  );
}

*/
