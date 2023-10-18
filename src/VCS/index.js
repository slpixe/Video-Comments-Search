import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import history from './history'
import { configureUrlQuery } from 'react-url-query';

configureUrlQuery({ history });

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
