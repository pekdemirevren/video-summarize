import React from 'react';

interface SelectorOption {
  value: string;
  label: string;
}

interface SelectorProps {
  label: string;
  options: SelectorOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

const Selector: React.FC<SelectorProps> = ({ label, options, selectedValue, onValueChange, disabled }) => {
  return (
    <div className="relative w-full">
      <label className="text-sm font-medium text-content/80 block mb-2">{label}</label>
      <select
        value={selectedValue}
        onChange={(e) => onValueChange(e.target.value)}
        disabled={disabled}
        className={`w-full appearance-none bg-base-300 border border-base-300/50 text-white py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-base-200 focus:border-brand-primary transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label={`Select ${label}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 top-7 flex items-center px-2 text-content">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
};

export default Selector;
