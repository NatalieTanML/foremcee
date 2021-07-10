import React from 'react';
import { HiSearch } from 'react-icons/hi';
import { IconContext } from 'react-icons';

type Props = {
  keyword: string;
  setKeyword: (value: string) => void;
  title: string;
  placeholder: string;
};

const Search = ({ keyword, setKeyword, title, placeholder }: Props) => {
  return (
    <div className="flex flex-1 relative block cursor-text">
      <input
        type="text"
        name="search"
        id="search"
        title={title}
        className="flex-grow px-4 pr-12 py-2 rounded-md appearance-none border-2 border-indigo-50 bg-white text-gray-700 hover:border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
        placeholder={placeholder}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      <div className="absolute top-0 right-0 mt-3 mr-4 text-gray-300">
        <IconContext.Provider value={{ size: '1.25em' }}>
          <HiSearch />
        </IconContext.Provider>
      </div>
    </div>
  );
};

export default Search;
