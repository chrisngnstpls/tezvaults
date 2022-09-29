import React from "react";
import useBeacon from "../hooks/useBeacon";
import { Button } from "./Button";


export const Header = () => {
  const { connect, disconnect, pkh } = useBeacon();

  const handleConnect = () => {
    connect().catch(console.log);
  };

  const handleDisconnect = () => {
    disconnect().catch(console.log);
  };
  return (
    <header className="App-header">
      <div className="header-buttons">
        {!pkh && <Button onClick={handleConnect}>Connect</Button>}
        {pkh && typeof pkh === "string" && (
          <Button variant={"outlined"} onClick={handleConnect}>
            {pkh.slice(0, 6)}...${pkh.slice(-3)}
          </Button>
        )}
        {pkh && (
          <Button onClick={handleDisconnect} variant="filled">
            Disconnect
          </Button>
        )}
      </div>
    </header>
  );
};