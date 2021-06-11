import React from 'react';

import Header from '../components/Header';
import ListHeader from '../components/ListHeader';
import ListItem from '../components/ListItem';

const MenuBar = () => {
  return (
    <div className="container mx-auto p-4 w-full bg-white">
      <Header />
      <ListHeader />
      <ListItem />
      <ListItem />
      <ListItem />
      <ListHeader />
      <ListItem />
      <ListItem />
      <ListItem />
    </div>
  );
};

export default MenuBar;
