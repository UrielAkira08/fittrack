
import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, name, error, containerClassName = "mb-4", className, ...props }) => {
  const baseTextareaClasses = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";
  const errorTextareaClasses = "border-red-500 text-red-600 focus:ring-red-500 focus:border-red-500";
  
  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        rows={3}
        className={`${baseTextareaClasses} ${error ? errorTextareaClasses : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Textarea;
    