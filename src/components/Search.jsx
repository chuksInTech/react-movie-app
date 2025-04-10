import React from 'react'

const Search = ({searchTerm, setSearchTerm}) => {
  return (
    <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md px-4">
     <div className="flex items-center w-full py-1 px-2 bg-[rgba(206,206,251,0.05)] text-gray-200 rounded-md border border-gray-700 focus-within:border-purple-500">
        <img src="search.png"
        className='ml-3 h-4 w-4'
        alt="search" />
        <input
        type="text"
        placeholder='search movies...'
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        className="w-full bg-transparent text-gray-200 px-2 py-1 focus:outline-none text-sm sm:text-base"
         />
     </div>
    </div>
  )
}

export default Search