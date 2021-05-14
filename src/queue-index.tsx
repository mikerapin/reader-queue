import React from 'react';
import ReactDOM from 'react-dom';
import { QueueManager } from './js/components/QueueManager';
import { ReadQueue } from './js/constants/types';

const tabNav = document.querySelector('.lv2-tabs-navigation');
const queueRoot = document.createElement('div');
queueRoot.id = 'queue-root';
tabNav.appendChild(queueRoot);

// cool!
declare var chrome;

chrome.storage.sync.get(['readqueue'], (result) => {
  let storedQueue: ReadQueue = [];
  if (result && result.readqueue) {
    storedQueue = result.readqueue as ReadQueue;
  }
  ReactDOM.render(
    <React.StrictMode>
      <QueueManager storedQueue={storedQueue} />
    </React.StrictMode>,
    document.getElementById('queue-root')
  );
});
