import React from 'react';
import ReactDOM from 'react-dom';
import { QueueManager } from './js/components/QueueManager';
import { DEFAULT_EXTENSION_OPTIONS, ExtensionOptions, ReadQueue } from './js/constants/types';

const tabNav = document.querySelector('.lv2-tabs-navigation');
const queueRoot = document.createElement('div');
queueRoot.id = 'queue-root';
tabNav.appendChild(queueRoot);

// cool!
declare var chrome;

chrome.storage.sync.get(['readqueue', 'extensionOptions'], (result) => {
  let storedQueue: ReadQueue = [];
  let storedOptions: ExtensionOptions = DEFAULT_EXTENSION_OPTIONS;
  if (result) {
    if (result.readqueue) {
      storedQueue = result.readqueue as ReadQueue;
    }
    if (result.extensionOptions) {
      storedOptions = result.extensionOptions as ExtensionOptions;
    }
  }
  ReactDOM.render(
    <React.StrictMode>
      <QueueManager storedQueue={storedQueue} storedOptions={storedOptions} />
    </React.StrictMode>,
    document.getElementById('queue-root')
  );
});
