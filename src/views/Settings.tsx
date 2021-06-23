import React, { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';
import { HiPencil, HiX, HiCheck } from 'react-icons/hi';
import { IconContext } from 'react-icons';
import Preferences from '../preferences';

import Header from '../components/Header';

const Settings = () => {
  const [hotKey, setHotKey] = useState<string>();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string | undefined>('');
  const [isKeyUp, setIsKeyUp] = useState<boolean>(false);

  const styleName = isEditing
    ? 'capitalize flex-auto px-4 py-2 rounded-md appearance-none border-2 border-indigo-50 bg-white text-gray-700 hover:border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent cursor-text'
    : 'capitalize flex-auto px-4 py-2 rounded-md appearance-none border-2 border-gray-50 bg-gray-50 text-gray-700 disabled:opacity-75 focus:outline-none cursor-default';
  const btnContent = isEditing ? <HiX /> : <HiPencil />;
  const iconCtx = {
    size: '1.25em',
  };

  const toggleEdit = () => {
    const str = inputValue === hotKey ? '' : hotKey;
    setInputValue(str);
    setIsEditing(!isEditing);
  };

  const handleInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.repeat) return;
    if (e.type === 'keyup') {
      setIsKeyUp(true);
      return;
    }
    const str =
      inputValue === '' || isKeyUp ? `${e.key}` : `${inputValue}+${e.key}`;
    setIsKeyUp(false);
    setInputValue(str);
  };

  const updateHotKey = () => {
    ipcRenderer.send('hotKey:update', inputValue);
    setHotKey(inputValue);
    setIsEditing(false);
    setIsKeyUp(false);
  };

  useEffect(() => {
    const preferences = new Preferences();
    preferences
      .getHotKey()
      .then((res) => {
        setHotKey(res);
        setInputValue(res);
        return res;
      })
      .catch(console.error);
  }, []);

  return (
    <div className="container mx-auto px-4 py-3 w-full bg-white">
      <Header />
      <div className="block mt-4 mb-2 text-xl font-semibold text-gray-800">
        HotKey Configuration
      </div>
      <div className="flex flex-row relative my-2">
        <div className="flex flex-1 gap-x-3 items-center">
          <input
            type="text"
            name="hotKeyInput"
            id="hotKeyInput"
            title="Keyboard shortcut to start and stop a recording"
            className={styleName}
            readOnly
            disabled={!isEditing}
            onKeyDown={handleInput}
            onKeyUp={handleInput}
            value={inputValue}
          />
          <button
            type="button"
            onClick={updateHotKey}
            className={`flex flex-col w-10 h-10 justify-center items-center rounded-md text-indigo-500 bg-indigo-50 hover:text-white active:text-white hover:bg-indigo-500 active:bg-indigo-600 focus:outline-none ${
              isEditing ? '' : 'hidden'
            }`}
          >
            <IconContext.Provider value={iconCtx}>
              <HiCheck />
            </IconContext.Provider>
          </button>
          <button
            type="button"
            onClick={toggleEdit}
            className="flex flex-col w-10 h-10 justify-center items-center rounded-md text-indigo-500 bg-indigo-50 hover:text-white active:text-white hover:bg-indigo-500 active:bg-indigo-600 focus:outline-none"
          >
            <IconContext.Provider value={iconCtx}>
              {btnContent}
            </IconContext.Provider>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
