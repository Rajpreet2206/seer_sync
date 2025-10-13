import React from 'react';
import AuthButton from './AuthButton';
import FriendsList from './FriendsList';

function App() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">SeerSync</h1>
      <p>Extension popup content here</p>
      <AuthButton />
      <FriendsList />
    </div>
  );
}

export default App;