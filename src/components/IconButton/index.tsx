import React from 'react';
import { CgSpinner } from 'react-icons/cg';
import { IconContext } from 'react-icons';

export type Props = {
  onClick: () => void;
  isLoading?: boolean;
  children?: React.ReactNode;
  title?: string;
  addStyleName?: string;
  addStyleNameLoading?: string;
};

const IconButton = ({
  onClick,
  isLoading = false,
  children,
  title,
  addStyleName = '',
  addStyleNameLoading = '',
}: Props) => {
  const styleName = isLoading
    ? `flex flex-col rounded-md w-10 h-10 justify-center items-center cursor-wait disabled:opacity-50 ${addStyleNameLoading}`
    : `flex flex-col rounded-md w-10 h-10 justify-center items-center focus:outline-none ${addStyleName}`;
  const btnContent = isLoading ? <CgSpinner /> : children;
  const iconCtx = {
    size: '1.25em',
    ...(isLoading && { className: 'animate-spin' }),
  };

  return (
    <button
      type="button"
      disabled={isLoading}
      title={title}
      onClick={onClick}
      className={styleName}
    >
      <IconContext.Provider value={iconCtx}>{btnContent}</IconContext.Provider>
    </button>
  );
};

export default IconButton;
