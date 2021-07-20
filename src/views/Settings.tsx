import React from 'react';
import { useHistory } from 'react-router-dom';
import { HiX } from 'react-icons/hi';

import Header from '../components/Header';
import HotKeyConfig from '../components/HotKeyConfig';
import SettingsHeader from '../components/SettingsHeader';

const Settings = () => {
  const history = useHistory();

  return (
    <div className="container mx-auto px-4 py-3 w-full bg-white">
      <Header
        title="Settings"
        btnContent={<HiX />}
        handleClick={() => history.push('/')}
      />
      <SettingsHeader title="HotKey Configuration" />
      <HotKeyConfig />
    </div>
  );
};

export default Settings;
