import React from 'react';

import { IconContext } from 'react-icons';
import { HiOutlineCog } from 'react-icons/hi';

const Header = () => {
  return (
    <div className="flex flex-row items-center">
      <div className="flex flex-1 items-center">
        <p className="flex-grow text-2xl font-bold tracking-tight text-indigo-500">
          Voice Notes
        </p>
        <button
          type="button"
          className="text-gray-500 hover:stroke-current hover:text-indigo-500 focus:outline-none active:text-indigo-600"
        >
          <IconContext.Provider value={{ size: '1.5em' }}>
            <HiOutlineCog />
          </IconContext.Provider>
        </button>
      </div>
    </div>
  );
};

export default Header;
