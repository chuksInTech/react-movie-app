import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const SortOptions = ({ selectedSort, onSortChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const sortOptions = [
        { value: "popularity.desc", label: "Most Popular" },
        { value: "popularity.asc", label: "Least Popular" },
        { value: "vote_average.desc", label: "Highest Rated" },
        { value: "vote_average.asc", label: "Lowest Rated" },
        { value: "release_date.desc", label: "New Releases" },
        { value: "release_date.asc", label: "Old Releases" }
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center bg-[rgba(206,206,251,0.1)] focus:outline-none focus:ring-2 focus:ring-[rgba(206,206,251,0.5)] text-white px-4 py-2 rounded-lg"
            >
                {selectedSort
                    ? sortOptions.find((option) => option.value === selectedSort)?.label
                    : "Sort By"}
                <ChevronDown className={`w-5 h-5 ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg z-10">
                    {sortOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => {
                                onSortChange(option.value);
                                setIsOpen(false);
                            }}
                             className="block w-full px-4 py-2 text-left text-white hover:bg-[rgba(206,206,251,0.5)] rounded-t-lg"
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SortOptions;