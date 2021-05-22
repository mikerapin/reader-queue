import React from 'react';
import ReactDOM from 'react-dom';
import NextInQueue from './js/components/NextInQueue';
import { DEFAULT_EXTENSION_OPTIONS, ExtensionOptions, ReadQueue } from './js/constants/types';

// cool!
declare var chrome;

let nextItem;
let observerElement;
const endComic = document.querySelector('.end-comic');
const endRelatedTitleSection = document.querySelector('.end-related-title-section');
const nextInQueue = document.createElement('section');
nextInQueue.classList.add('queue-container', 'end-comic');
nextInQueue.id = 'queue-root';

// hey, there's a next item to read, prepend it
if (endComic) {
  endComic.parentElement.insertBefore(nextInQueue, endComic);
  observerElement = endComic;
} else {
  // we're at either the end of a series or there is no next comic so do some fun business
  // to inject the next queue item
  nextInQueue.classList.add('no-next');
  endRelatedTitleSection.parentElement.insertBefore(nextInQueue, endRelatedTitleSection);
  observerElement = endRelatedTitleSection;
}

// use this clever little devil to only update the queue when the end modal is visible
const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
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
            <NextInQueue storedQueue={storedQueue} storedOptions={storedOptions} />
          </React.StrictMode>,
          document.getElementById('queue-root')
        );
        obs.disconnect();
      });
    }
  });
});
observer.observe(observerElement);
