import React from 'react';

type Props = {
  title: string;
};

const SettingsHeader = ({ title }: Props) => {
  return (
    <div className="block mt-4 mb-2 text-xl font-semibold text-gray-800">
      {title}
    </div>
  );
};

export default SettingsHeader;
