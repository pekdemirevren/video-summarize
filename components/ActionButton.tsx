
import React from 'react';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const ActionButton: React.FC<ActionButtonProps> = ({ children, isLoading = false, icon, className, ...props }) => {
  return (
    <button
      className={`relative flex items-center justify-center w-full px-4 py-3 font-semibold text-white rounded-lg shadow-md transition-all duration-300 ease-in-out
        ${props.disabled ? 'bg-base-300 cursor-not-allowed' : 'bg-brand-primary hover:bg-brand-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 focus:ring-brand-primary'}
        ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <>
          {icon && <span className="mr-2 h-5 w-5">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default ActionButton;
