import React, { useEffect, useState } from 'react';
import Preferences from '../preferences';

import Header from '../components/Header';

const Settings = () => {
  const [hotKey, setHotKey] = useState<string>();
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const hotKeyContent = isRecording ? 'Recording...' : hotKey;
  // const handleClick() => {

  // }

  useEffect(() => {
    const preferences = new Preferences();
    preferences
      .getHotKey()
      .then((res) => {
        setHotKey(res);
        return res;
      })
      .catch(console.error);
  });

  return (
    <div className="container mx-auto px-4 py-3 w-full bg-white">
      <Header />
      <div className="block mt-4 mb-2 text-xl font-semibold text-gray-800">
        HotKey Configuration
      </div>
      <div className="grid gap-x-4 grid-cols-2 items-center">
        <span className="text-gray-800 font-medium">Start/Stop Recording</span>
        <button
          type="button"
          title="Click to record new shortcut"
          className="capitalize px-4 py-1 rounded text-indigo-800 font-medium bg-indigo-50 border-2 border-transparent hover:bg-white hover:border-indigo-200 focus:outline-none"
        >
          <span>{hotKeyContent}</span>
        </button>
      </div>
    </div>
  );
};

export default Settings;
