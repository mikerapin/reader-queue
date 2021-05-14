import React from 'react';
import { ReadQueue } from '../constants/types';
import './NextInQueue.scss';

const NextInQueue = ({ storedQueue }: { storedQueue: ReadQueue }): React.ReactElement => {
  const currentlyReading = window.location.href.match(/[0-9]+/g);
  let topOfQueue;

  // if we have any strange business in the url, just get the EFF out of there
  if (currentlyReading.length !== 2) {
    return;
  }

  // remove the top item from the queue if it matches the current book we're reading
  if (storedQueue[0].sid === parseInt(currentlyReading[0], 10) && storedQueue[0].id === parseInt(currentlyReading[1], 10)) {
    storedQueue.shift();
    chrome.storage.sync.set({ readqueue: storedQueue });
  }

  if (storedQueue.length) {
    topOfQueue = storedQueue[0];
  } else {
    return null;
  }
  return (
    <div className="next-in-queue">
      <h3 className="end-subtitle">Keep Reading In Your Queue</h3>
      <h4>{topOfQueue.title}</h4>
      <div className="ComicBtn actBtn readBtn queue-read-button">
        <a
          className="read_link read-action primary-action action-button queue-read"
          href={`https://www.comixology.com/comic-reader/${topOfQueue.sid}/${topOfQueue.id}`}
        >
          Read
        </a>
      </div>
    </div>
  );
};

export default NextInQueue;
