import React, { useState, useEffect } from "react";
import CheckingLoggedIn from "./components/CheckingLoggedIn";
import IsLoggedIn from "./components/IsLoggedIn";
import IsLoggedOut from "./components/IsLoggedOut";
import "./dist/output.css";
import { auth } from "./firebaseConfig";

function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
  }, []);

  return (
    <div className="flex items-center justify-center w-full h-screen overflow-auto">
      {user === undefined ? (
        <CheckingLoggedIn />
      ) : user ? (
        <IsLoggedIn {...{ user }} />
      ) : (
        <IsLoggedOut />
      )}
    </div>
  );
}

export default App;
