import React, { useState } from 'react';
import { ExtensionOptions, ReadQueue } from '../constants/types';
import './NextInQueue.scss';

const NextInQueue = ({ storedQueue, storedOptions }: { storedQueue: ReadQueue; storedOptions: ExtensionOptions }): React.ReactElement => {
  const [readQueue, setReadQueue] = useState<ReadQueue>(storedQueue);
  const currentlyReading = window.location.href.match(/[0-9]+/g);
  const currentQueue = [...readQueue];
  let topOfQueue;

  // if we have any strange business in the url, just get the EFF out of there
  if (currentlyReading.length !== 2) {
    return;
  }

  // Only show the Keep Reading box if there are items in the queue still!
  if (currentQueue.length > 0) {
    topOfQueue = currentQueue[0];
    // if we've opted to, remove the item we've just read from the queue after reading
    if (storedOptions.removeAfterReading) {
      // remove the top item from the queue if it matches the current book we're reading
      if (topOfQueue.sid === parseInt(currentlyReading[0], 10) && topOfQueue.id === parseInt(currentlyReading[1], 10)) {
        const newQueue = currentQueue.shift();
        topOfQueue = newQueue;
        chrome.storage.sync.set({ readqueue: currentQueue }, () => setReadQueue(currentQueue));
      }
    }
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
