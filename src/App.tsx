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
// const Redirect2: React.FC<Partial<RouteProps>>  = (AltComponent: React.FC) => ({ location }) => {
//   // eslint-disable-next-line react/prop-types
//   const path = new URLSearchParams(location?.search).get('redirect');
//   if (path === 'recorder') return <Recorder />;
//   return <AltComponent />;
// };

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
