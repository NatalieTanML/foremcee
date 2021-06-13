import React from 'react';
import { CgSpinner } from 'react-icons/cg';
import { IconContext } from 'react-icons';

type Props = {
  onClick: () => void;
  isLoading: boolean;
  // eslint-disable-next-line react/require-default-props
  children?: React.ReactNode;
  // eslint-disable-next-line react/require-default-props
  cname?: string;
};

const ListButton = ({ onClick, isLoading, children, cname = '' }: Props) => {
  return isLoading ? (
    <button
      disabled
      type="button"
      className={`flex flex-col rounded-md w-10 h-10 text-white bg-indigo-600 disabled:opacity-50 cursor-wait justify-center items-center ${cname}`}
    >
      <IconContext.Provider
        value={{ className: 'animate-spin', size: '1.25em' }}
      >
        <CgSpinner />
      </IconContext.Provider>
    </button>
  ) : (
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
