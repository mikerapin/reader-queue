import React, { useEffect, useState } from 'react';
import { QueueItem, ReadQueue } from '../constants/types';
import { ChevronDown } from '../icons/ChevronDown';
import { ChevronUp } from '../icons/ChevronUp';
import { ClearIcon } from '../icons/ClearIcon';
import { QueueIcon } from '../icons/QueueIcon';
import { RemoveIcon } from '../icons/RemoveIcon';
import { _id } from '../utils';
import './QueueManager.scss';

declare var chrome;

const ClearQueueButton = ({ setReadQueue }: { setReadQueue: (readQueue: ReadQueue) => void }): JSX.Element => {
  const clearQueue = (): void => {
    if (confirm('are you sure you want to clear the queue???')) {
      chrome.storage.sync.set({ readqueue: [] }, () => {
        setReadQueue([]);
      });
    }
  };
  return (
    <button className="queue-clear queue-button" onClick={clearQueue}>
      <ClearIcon />
    </button>
  );
};

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

export const QueueManager = ({ storedQueue }: { storedQueue: ReadQueue }): JSX.Element => {
  const [showQueue, setShowQueue] = useState<boolean>(false);
  const [readQueue, setReadQueue] = useState<ReadQueue>(storedQueue);
  const queueHasItems = readQueue.length;

  const updateQueueAndSync = (newQueue: ReadQueue) => {
    chrome.storage.sync.set({ readqueue: readQueue }, () => {
      setReadQueue([...newQueue]);
    });
  };

  const buildReaderButtons = (): void => {
    const bookContainer = document.querySelectorAll('.lv2-book-item, .lv2-book-micro-item');
    const currentQueue = readQueue;

    const addToQueue = (e: MouseEvent) => {
      const data = (e.target as HTMLButtonElement).dataset;
      const newItemId = parseInt(data.id, 10);
      const newItemSeriesId = parseInt(data.sid, 10);
      if (currentQueue.length) {
        const index = currentQueue.findIndex((qItem) => {
          return qItem.id === newItemId && qItem.sid === newItemSeriesId;
        });
        if (index > -1) {
          readQueue.splice(index, 1);
        }
      }
      currentQueue.push({
        uid: _id(),
        title: data.title.trim(),
        sid: newItemSeriesId,
        id: newItemId
      });

      // save the new queue in the chrome storage and also update our component so we'll re-render :)
      updateQueueAndSync(currentQueue);
    };

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
        addToQueueButton.dataset.sid = itemId[0];
        addToQueueButton.dataset.id = itemId[1];
        addToQueueButton.dataset.title = queueItemTitle.trim();

        addToQueueButton.addEventListener('click', addToQueue);
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

        // mutation observer to watch when the content changes
        const contentById = document.getElementById('lv2-tab-content');
        const observer = new MutationObserver(() => {
          buildReaderButtons();
        });
        if (contentById) {
          observer.observe(contentById, {
            childList: true
          });
        }
        clearInterval(timer);
      }
    }, 250);
  }, []);

  const removeFromQueue = (uid: string) => {
    const tempQueue = readQueue;
    // find and remove from the queue
    // this should probably be moved to the QueueManager/Queue component
    const index = tempQueue.findIndex((item) => item.uid === uid);
    if (index > -1) {
      tempQueue.splice(index, 1);
    }
    updateQueueAndSync(tempQueue);
  };

  const updatePosition = () => {
    return;
  };

  let queueContainerClasses = 'queue-manager';
  if (showQueue) {
    queueContainerClasses += ' show-queue';
  }

  const moveInQueue = (uid: string, direction: 'up' | 'down') => {
    const tempQueue = readQueue;
    const currentIndex = tempQueue.findIndex((item) => item.uid === uid);
    if (direction === 'up' && currentIndex > 0) {
      const temp = readQueue[currentIndex - 1];
      tempQueue[currentIndex - 1] = tempQueue[currentIndex];
      tempQueue[currentIndex] = temp;
    } else if (direction === 'down' && currentIndex < tempQueue.length - 1) {
      const temp = readQueue[currentIndex + 1];
      tempQueue[currentIndex + 1] = tempQueue[currentIndex];
      tempQueue[currentIndex] = temp;
    }
    updateQueueAndSync(tempQueue);
  };

  return (
    <div className="queue-manager-container">
      <div className="queue-manager-buttons">
        {queueHasItems ? (
          <>
            <ClearQueueButton setReadQueue={setReadQueue} />
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
                  className={index === 0 ? 'queue-position-button hide' : 'queue-position-button'}
                  onClick={() => moveInQueue(queueItem.uid, 'up')}
                >
                  <ChevronUp />
                </button>
                <button
                  className={index === readQueue.length - 1 ? 'queue-position-button hide' : 'queue-position-button'}
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
