import React from 'react';
import { IconContext } from 'react-icons';

type Props = {
  onClick: () => void;
  // eslint-disable-next-line react/require-default-props
  children?: React.ReactNode;
  // eslint-disable-next-line react/require-default-props
  cname?: string;
};

const ListButton = ({ onClick, children, cname = '' }: Props) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col rounded-md w-10 h-10 text-indigo-500 hover:stroke-current hover:text-white hover:bg-indigo-500 hover:border-transparent focus:outline-none active:bg-indigo-600 justify-center items-center ${cname}`}
    >
      <IconContext.Provider value={{ size: '1.25em' }}>
        {children}
      </IconContext.Provider>
    </button>
  );
};

export default ListButton;
