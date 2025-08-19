
import React, { useState, useRef, useEffect } from 'react';
import type { DropdownOption } from '../types';

interface ComboboxProps {
  options: DropdownOption[];
  value: DropdownOption | null;
  onChange: (value: DropdownOption | null) => void;
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  label: string;
}

const Combobox: React.FC<ComboboxProps> = ({
  options,
  value,
  onChange,
  loading = false,
  disabled = false,
  placeholder = 'Select an option',
  label
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = query === ''
    ? options
    : options.filter(option =>
        option.label.toLowerCase().includes(query.toLowerCase())
      );
  
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleSelectOption = (option: DropdownOption) => {
    onChange(option);
    setQuery(option.label);
    setIsOpen(false);
  };
  
  useEffect(() => {
    setQuery(value ? value.label : '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full" ref={containerRef}>
        <label className="block text-sm font-medium text-text-light mb-1">{label}</label>
        <div className="relative">
            <div className="flex items-center">
                 <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    disabled={disabled || loading}
                    placeholder={loading ? 'Loading...' : placeholder}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                 {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    </div>
                )}
            </div>

            {isOpen && !disabled && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                {filteredOptions.length > 0 ? (
                    filteredOptions.map(option => (
                    <li
                        key={option.value}
                        onClick={() => handleSelectOption(option)}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    >
                        {option.label}
                    </li>
                    ))
                ) : (
                    <li className="px-4 py-2 text-gray-500">No options found</li>
                )}
                </ul>
            )}
        </div>
    </div>
  );
};

export default Combobox;
