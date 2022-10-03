import logo from './logo.svg';
import './App.css';
import React from "react";
import "./material-button.css";
import { Header } from "./components/Header";
import  { Main } from "./components/Main";


function App() {
  return (
    <div className="App">
      <Header />
      <Main />
    </div>
  );
}

export default App;
