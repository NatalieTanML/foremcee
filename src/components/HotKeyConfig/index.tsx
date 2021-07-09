import React, { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';
import { HiPencil, HiX, HiCheck } from 'react-icons/hi';
import Preferences from '../../preferences';

import IconButton from '../IconButton';

const HotKeyConfig = () => {
  const [hotKey, setHotKey] = useState<string>();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string | undefined>('');
  const [isKeyUp, setIsKeyUp] = useState<boolean>(false);

  const inputStyleName = isEditing
    ? 'capitalize flex-auto px-4 py-2 rounded-md appearance-none border-2 border-indigo-50 bg-white text-gray-700 hover:border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent cursor-text'
    : 'capitalize flex-auto px-4 py-2 rounded-md appearance-none border-2 border-gray-50 bg-gray-50 text-gray-700 disabled:opacity-75 focus:outline-none cursor-default';
  const btnStyleName =
    'text-indigo-500 bg-indigo-50 hover:text-white active:text-white hover:bg-indigo-500 active:bg-indigo-600 focus:outline-none';
  const btnContent = isEditing ? <HiX /> : <HiPencil />;

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
    ipcRenderer.on('hotKey:success', () => {
      setHotKey(inputValue);
      setIsEditing(false);
    });
    ipcRenderer.on('hotKey:fail', (_event, arg) => {
      console.error(arg);
    });
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
    <>
      <div className="flex flex-row relative my-2">
        <div className="flex flex-1 gap-x-3 items-center">
          <input
            type="text"
            name="hotKeyInput"
            id="hotKeyInput"
            title="Keyboard shortcut to start and stop a recording"
            className={inputStyleName}
            readOnly
            disabled={!isEditing}
            onKeyDown={handleInput}
            onKeyUp={handleInput}
            value={inputValue}
          />
          <IconButton
            onClick={updateHotKey}
            addStyleName={isEditing ? btnStyleName : 'hidden'}
          >
            <HiCheck />
          </IconButton>
          <IconButton onClick={toggleEdit} addStyleName={btnStyleName}>
            {btnContent}
          </IconButton>
        </div>
      </div>
    </>
  );
};

export default HotKeyConfig;
