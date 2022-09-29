import React from "react";
import useBeacon from "../hooks/useBeacon";

export const View = ({
  children,
}) => {
  const { storage, pkh } = useBeacon();

  return (
    <div>
        
    </div>
  );
};