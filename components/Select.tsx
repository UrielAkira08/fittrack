import React from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  containerClassName?: string;
  placeholder?: string; // Explicitly define placeholder prop
}

const Select: React.FC<SelectProps> = ({ 
  label, 
  name, 
  error, 
  options, 
  containerClassName = "mb-4", 
  className, 
  placeholder, // Destructure placeholder
  ...restProps // Gather remaining props
}) => {
  const baseSelectClasses = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";
  const errorSelectClasses = "border-red-500 text-red-600 focus:ring-red-500 focus:border-red-500";
  
  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        id={name}
        name={name}
        className={`${baseSelectClasses} ${error ? errorSelectClasses : ''} ${className}`}
        {...restProps} // Spread valid HTMLSelectAttributes
      >
        {placeholder && <option value="">{placeholder}</option>} {/* Use destructured placeholder */}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Select;