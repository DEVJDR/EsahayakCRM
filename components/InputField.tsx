import { ReactNode } from "react";

interface InputFieldProps {
  label?: string;
  name: string;
  value: string | number | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  placeholder?: string;
  type?: string;
}

export default function InputField({ label, name, value, onChange, error, placeholder, type = "text" }: InputFieldProps) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
      />
      {error && <p className="text-red-600 mt-1 text-sm">{error}</p>}
    </div>
  );
}