import { read } from 'fs';
import React, { useEffect, useRef, useState } from 'react';
import { ExtensionOptions, QueueItem, ReadQueue } from '../constants/types';
import { ChevronDown } from '../icons/ChevronDown';
import { ChevronUp } from '../icons/ChevronUp';
import { ClearIcon } from '../icons/ClearIcon';
import { QueueIcon } from '../icons/QueueIcon';
import { RemoveIcon } from '../icons/RemoveIcon';
import { _id } from '../utils';
import './QueueManager.scss';

declare var chrome;

/**
 * Clear all of the items out of the queue
 */
const ClearQueueButton = ({ updateQueueAndSync }: { updateQueueAndSync: (readQueue: ReadQueue) => void }): JSX.Element => {
  const clearQueue = (): void => {
    if (confirm('are you sure you want to clear the queue???')) {
      updateQueueAndSync([] as ReadQueue);
    }
  };
  return (
    <button className="queue-clear queue-button" onClick={clearQueue}>
      <ClearIcon />
    </button>
  );
};

/**
 * Find the first item in the queue and redirect the user to read it
 */
const StartReadingButton = ({ readQueue }: { readQueue: ReadQueue }): JSX.Element => {
  const startReading = () => {
    const firstItem = readQueue[0];
    window.location.href = `/comic-reader/${firstItem.sid}/${firstItem.id}`;
  };
  return (
    <button className="queue-start-reading" onClick={startReading}>
      <span>Start Reading</span>
    </button>
  );
};

export const QueueManager = ({ storedQueue, storedOptions }: { storedQueue: ReadQueue; storedOptions: ExtensionOptions }): JSX.Element => {
  const [readQueue, setReadQueue] = useState<ReadQueue>(storedQueue);
  const [options] = useState<ExtensionOptions>(storedOptions);
  const [showQueue, setShowQueue] = useState<boolean>(options.showQueueOnStart);
  const queueRef = useRef<ReadQueue>(readQueue);
  const queueHasItems = readQueue.length;

  if (options.customCss) {
    document.body.classList.add('queue-custom-style');
  }

  const updateQueueAndSync = (newQueue: ReadQueue) => {
    const queue = [...newQueue];
    chrome.storage.sync.set({ readqueue: queue }, () => {
      // we need this specifically for the add buttins since they don't use state properly
      queueRef.current = queue;
      setReadQueue(queue);
    });
  };

  /**
   * Add an item to the queue.
   * Because this function is added to items that don't care for our state,
   * we use the queueRef to ensure we're always getting the latest queue before
   * we trigger an update
   * @param item an item to be queued
   */
  const addToQueue = (item: QueueItem) => {
    const currentQueue = [...queueRef.current];

    if (currentQueue.length) {
      const index = currentQueue.findIndex((qItem) => {
        return qItem.id === item.id && qItem.sid === item.sid;
      });
      if (index > -1) {
        currentQueue.splice(index, 1);
      }
    }
    currentQueue.push(item);

    // save the new queue in the chrome storage and also update our component so we'll re-render :)
    updateQueueAndSync(currentQueue);
  };

  /**
   * This generates all of the "add" buttons within the My Books page
   * and appends them to each readable book
   */
  const buildReaderButtons = (): void => {
    const bookContainer = document.querySelectorAll('.lv2-book-item, .lv2-book-micro-item');

    bookContainer.forEach((container) => {
      const readerButton = container.querySelector('.lv2-read-button');
      const gridReadUrlLink = container.querySelector('.lv2-item-link');
      const microReadUrlLink = container.querySelector('.lv2-micro-item-title-container');

      if ((readerButton === null || gridReadUrlLink === null) && (readerButton === null || microReadUrlLink === null)) {
        return;
      }

      const readerLink = gridReadUrlLink || microReadUrlLink;

      const readUrl = readerButton.getAttribute('href');
      const itemId = readUrl.match(/[0-9]+/g);
      const addToQueueButton = document.createElement('button');
      const queueItemTitle = `${readerLink.textContent}`;

      addToQueueButton.textContent = '+';
      addToQueueButton.classList.add('add-to-queue');
      if (itemId) {
        const itemData: QueueItem = {
          uid: _id(),
          sid: parseInt(itemId[0], 10),
          id: parseInt(itemId[1], 10),
          title: queueItemTitle.trim()
        };

        addToQueueButton.addEventListener('click', () => {
          addToQueue(itemData);
        });
        readerButton.parentElement.appendChild(addToQueueButton);
      }
    });
  };

  // only do this once per render
  useEffect(() => {
    //generate read buttons
    const tabContent = document.querySelector('.lv2-tab-content');
    const timer = setInterval(() => {
      if (tabContent && !tabContent.classList.contains('lv2-loading')) {
        tabContent.id = 'lv2-tab-content';
        buildReaderButtons();

        /**
         * Using the observer, we can watch for changes on the page and trigger
         * adding the buttons once the page finishes loading
         */
        const contentId = document.getElementById('lv2-tab-content');
        const observer = new MutationObserver(() => {
          buildReaderButtons();
        });
        if (contentId) {
          observer.observe(contentId, {
            childList: true
          });
        }
        clearInterval(timer);
      }
    }, 250);
  }, []);

  /**
   * Remove an item from the queue.
   * @param uid the unique id within the queue
   */
  const removeFromQueue = (uid: string) => {
    const tempQueue = readQueue;
    // find and remove from the queue
    // this should probably be moved to the QueueManager/Queue component
    const index = tempQueue.findIndex((item) => item.uid === uid);
    if (index > -1) {
      tempQueue.splice(index, 1);
      updateQueueAndSync(tempQueue);
    } else {
      console.log('Couldn\'t find that uid:', uid, tempQueue);
    }
  };

  /**
   * Move an item within the queue:
   *  'up'    - To the top of the queue
   *  'down'  - To the bottom of the queue
   * @param uid the unique id of an item within the queue
   * @param direction which direction you're moving in the queue (up, or down)
   */
  const moveInQueue = (uid: string, direction: 'up' | 'down') => {
    const tempQueue = readQueue;
    const currentIndex = tempQueue.findIndex((item) => item.uid === uid);
    if (direction === 'up' && currentIndex > 0) {
      const temp = tempQueue[currentIndex - 1];
      tempQueue[currentIndex - 1] = tempQueue[currentIndex];
      tempQueue[currentIndex] = temp;
    } else if (direction === 'down' && currentIndex < tempQueue.length - 1) {
      const temp = tempQueue[currentIndex + 1];
      tempQueue[currentIndex + 1] = tempQueue[currentIndex];
      tempQueue[currentIndex] = temp;
    }
    updateQueueAndSync(tempQueue);
  };

  let queueContainerClasses = 'queue-manager';
  if (showQueue) {
    queueContainerClasses += ' show-queue';
  }

  return (
    <div className="queue-manager-container">
      <div className="queue-manager-buttons">
        {queueHasItems ? (
          <>
            <ClearQueueButton updateQueueAndSync={updateQueueAndSync} />
            <StartReadingButton readQueue={readQueue} />
          </>
        ) : null}
        <button className="queue-button queue-manager-toggle" onClick={() => setShowQueue(!showQueue)}>
          <QueueIcon />
        </button>
      </div>
      <div className={queueContainerClasses}>
        {readQueue.length ? (
          readQueue.map((queueItem: QueueItem, index: number) => (
            <div key={queueItem.uid} className="queue-item-container">
              <div className="queue-arranger">
                <button
                  className={index === 0 ? 'queue-position-button queue-invisible' : 'queue-position-button'}
                  onClick={() => moveInQueue(queueItem.uid, 'up')}
                >
                  <ChevronUp />
                </button>
                <button
                  className={index === readQueue.length - 1 ? 'queue-position-button queue-invisible' : 'queue-position-button'}
                  onClick={() => moveInQueue(queueItem.uid, 'down')}
                >
                  <ChevronDown />
                </button>
              </div>
              <div className="queue-item">{queueItem.title}</div>
              <div className="queue-item-remove">
                <button className="remove-queue-item" onClick={() => removeFromQueue(queueItem.uid)} data-uid={queueItem.uid}>
                  <RemoveIcon />
                </button>
              </div>
            </div>
          ))
        ) : (
          <span>Empty Queue</span>
        )}
      </div>
    </div>
  );
};
