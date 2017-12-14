import React, { Component } from 'react';
import Preload from './utils/Preload';

import logo from './logo.svg';
import './App.css';

const myPromise = new Promise((resolve, reject) => {
  setTimeout(() => {
    return resolve('myPromise resolved value.');
  }, 3000);
});

const myOtherPromise = new Promise((resolve, reject) => {
  setTimeout(() => {
    return resolve('myOtherPromise resolved value.');
  }, 2000);
});

@Preload({
  myPromise,
  myOtherPromise
})
class App extends Component {
  render() {
    console.log(this.props)
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <p>myPromise: {this.props.myPromise}</p>
        <p>myOtherPromise: {this.props.myOtherPromise}</p>
      </div>
    );
  }
}

export default App;
