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

// Hacky fix to redirect user to recorder page when recorder window is launched.
// eslint-disable-next-line react/prop-types
const Redirect: React.FC<Partial<RouteProps>> = ({ location }) => {
  // eslint-disable-next-line react/prop-types
  const path = new URLSearchParams(location?.search).get('redirect');
  if (path === 'recorder') return <Recorder />;
  return <MenuBar />;
};

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Redirect} />
        <Route path="/recorder" component={Recorder} />
      </Switch>
    </Router>
  );
}
