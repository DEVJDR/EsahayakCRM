import { ReactNode } from "react";

interface SelectFieldProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  children: ReactNode;
}

export default function SelectField({ name, value, onChange, error, children }: SelectFieldProps) {
  return (
    <div>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
      >
        {children}
      </select>
      {error && <p className="text-red-600 mt-1 text-sm">{error}</p>}
    </div>
  );
}