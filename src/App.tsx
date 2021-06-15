import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  RouteProps,
} from 'react-router-dom';
import './App.global.css';
import MenuBar from './views/MenuBar';
import Recorder from './views/Recorder';

function Redirect(AltComponent: React.FC<Partial<RouteProps>>) {
  return function Render({ location }: Partial<RouteProps>) {
    const path = new URLSearchParams(location?.search).get('redirect');
    if (path === 'recorder') return <Recorder />;
    return <AltComponent />;
  };
}

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Redirect(MenuBar)} />
        {/* <Route path="/settings" component={Redirect(Settings)} /> */}
        <Route path="/recorder" component={Recorder} />
      </Switch>
    </Router>
  );
}
