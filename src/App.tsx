import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import './App.global.css';
import { ipcRenderer } from 'electron';
import { RecordingManager } from './recording-manager';
import MenuBar from './views/MenuBar';
import Recorder from './views/Recorder';
import Settings from './views/Settings';

export default function App() {
  const [
    recordingManager,
    setRecordingManager,
  ] = useState<RecordingManager | null>(null);

  useEffect(() => {
    ipcRenderer.on('init-menubar', async (_event, applicationDir: string) => {
      setRecordingManager(new RecordingManager(applicationDir));
    });
  }, []);

  return (
    <Router>
      <Switch>
        <Route
          exact
          path="/"
          component={() => <MenuBar recordingManager={recordingManager} />}
        />
        <Route exact path="/settings" component={Settings} />
        <Route
          exact
          path="/recorder"
          component={() => <Recorder recordingManager={recordingManager} />}
        />
      </Switch>
    </Router>
  );
}
