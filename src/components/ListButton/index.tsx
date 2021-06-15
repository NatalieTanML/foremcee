import React from 'react';
import { CgSpinner } from 'react-icons/cg';
import { IconContext } from 'react-icons';

type Props = {
  onClick: () => void;
  isLoading: boolean;
  // eslint-disable-next-line react/require-default-props
  children?: React.ReactNode;
  // eslint-disable-next-line react/require-default-props
  addStyleName?: string;
};

const ListButton = ({
  onClick,
  isLoading,
  children,
  addStyleName = '',
}: Props) => {
  const styleName = isLoading
    ? `flex flex-col rounded-md w-10 h-10 text-white bg-indigo-600 disabled:opacity-50 cursor-wait justify-center items-center ${addStyleName}`
    : `flex flex-col rounded-md w-10 h-10 text-indigo-500 hover:stroke-current hover:text-white hover:bg-indigo-500 hover:border-transparent focus:outline-none active:bg-indigo-600 justify-center items-center ${addStyleName}`;
  const btnContent = isLoading ? <CgSpinner /> : children;
  const iconCtx = {
    size: '1.25em',
    ...(isLoading && { className: 'animate-spin' }),
  };

  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={onClick}
      className={styleName}
    >
      <IconContext.Provider value={iconCtx}>{btnContent}</IconContext.Provider>
    </button>
  );
};

export default ListButton;
