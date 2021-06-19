import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { IconContext } from 'react-icons';
import { HiOutlineCog, HiX } from 'react-icons/hi';

const Header = () => {
  const history = useHistory();
  const isMenubar = useLocation().pathname === '/';

  const title = isMenubar ? 'Voice Notes' : 'Settings';
  const btnContent = isMenubar ? <HiOutlineCog /> : <HiX />;
  const handleClick = isMenubar
    ? () => history.push('/settings')
    : () => history.push('/');

  return (
    <div className="flex flex-row items-center">
      <div className="flex flex-1 items-center">
        <p className="flex-grow text-2xl font-bold tracking-tight text-indigo-500">
          {title}
        </p>
        <button
          type="button"
          onClick={handleClick}
          className="text-gray-500 hover:stroke-current hover:text-indigo-500 focus:outline-none active:text-indigo-600"
        >
          <IconContext.Provider value={{ size: '1.5em' }}>
            {btnContent}
          </IconContext.Provider>
        </button>
      </div>
    </div>
  );
};

export default Header;
