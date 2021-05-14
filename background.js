/**
 * Hey this thing is kind of a mess, but I think it works pretty well!
 *
 * Author: Mike Rapin - @mikerapin
 */

const queueIcon = () => {
  return `
<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
</svg>
`;
};

const clearIcon = () => {
  return `
<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
</svg>
`;
};

const readIcon = () => {
  return ` 
<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
</svg>
`;
};

const _id = () => {
  return '_' + Math.random().toString(36);
};

const addToQueue = (e) => {
  const data = e.target.dataset;
  chrome.storage.sync.get(['readqueue'], (result) => {
    let readQueue;
    if (!result.length && typeof result.readqueue === 'undefined') {
      readQueue = [];
    } else {
      readQueue = result.readqueue;
    }
    if (readQueue.length) {
      const index = readQueue.findIndex((qItem) => {
        return qItem.id === data.id && qItem.sid === data.sid;
      });
      if (index > -1) {
        readQueue.splice(index, 1);
      }
    }
    readQueue.push({
      uid: _id(),
      title: data.title.trim(),
      sid: data.sid,
      id: data.id
    });
    console.log(chrome.storage);
    chrome.storage.sync.set({ readqueue: readQueue }, () => {
      createManager();
    });
  });
};

const removeFromQueue = (e) => {
  const uid = e.currentTarget.dataset.uid;
  chrome.storage.sync.get(['readqueue'], (result) => {
    let readQueue;
    if ((!result.length && typeof result.readqueue === 'undefined') || uid === null) {
      return;
    } else {
      readQueue = result.readqueue;
    }

    const index = readQueue.findIndex((item) => item.uid === uid);

    if (index > -1) {
      readQueue.splice(index, 1);
      chrome.storage.sync.set({ readqueue: readQueue }, () => {
        createManager();
      });
    }
  });
};

const clearQueue = () => {
  if (confirm('are you sure you want to clear the queue???')) {
    chrome.storage.sync.set({ readqueue: [] }, () => {
      createManager();
    });
  }
};

const startReading = () => {
  chrome.storage.sync.get(['readqueue'], (result) => {
    let readQueue;
    if (!result.length && typeof result.readqueue === 'undefined') {
      return;
    }
    const firstItem = result.readqueue[0];
    window.location.href = `/comic-reader/${firstItem.sid}/${firstItem.id}`;
  });
};

const buildReaderButtons = () => {
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
    const queueButton = document.createElement('button');
    const queueItemTitle = `${readerLink.textContent}`;

    queueButton.textContent = '+';
    queueButton.classList.add('add-to-queue');
    if (itemId) {
      queueButton.dataset.sid = itemId[0];
      queueButton.dataset.id = itemId[1];
      queueButton.dataset.title = queueItemTitle.trim();

      queueButton.addEventListener('click', addToQueue);
      readerButton.parentElement.appendChild(queueButton);
    }
  });
};

const createQueueItem = (item) => {
  return `
<div class="queue-item-container">
    <div class="queue-item">
        ${item.title}
    </div>
    <div class="queue-item-remove">
        <button class="remove-queue-item" data-uid="${item.uid}">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
            </svg>
        </button>
    </div>
</div>
`;
};

const emptyQueueItem = () => {
  return `<div class="queue-item-container"><div class="queue-item">Empty Queue</div></div>`;
};

const createQueueButtons = (showEmptyQueueButton) => {
  const buttonGroup = document.createElement('div');
  const clearQueueButton = document.createElement('button');
  const startReadingButton = document.createElement('button');
  const buttons = [];

  buttonGroup.classList.add('queue-button-group');

  startReadingButton.classList.add('queue-start-reading');
  startReadingButton.innerHTML = '<span>Start Reading</span>';
  startReadingButton.addEventListener('click', startReading);
  // don't show this if the queue is empty, DUH
  // TODO: FIX IT
  buttons.push(startReadingButton);

  if (showEmptyQueueButton) {
    clearQueueButton.classList.add('queue-clear', 'queue-button');
    clearQueueButton.innerHTML = clearIcon();
    clearQueueButton.addEventListener('click', clearQueue);
    buttons.push(clearQueueButton);
  }

  buttonGroup.append(...buttons);

  return buttonGroup;
};

const createManager = () => {
  const queueManagerContainer = document.querySelector('.queue-manager-container');
  if (document.querySelector('.queue-manager')) {
    document.querySelector('.queue-manager').remove();
  }
  const queueManager = document.createElement('div');

  queueManager.classList.add('queue-manager');
  queueManager.textContent = '~Loading~';

  let content = emptyQueueItem();
  chrome.storage.sync.get(['readqueue'], (result) => {
    let readQueue;
    if (!result.length && typeof result.readqueue === 'undefined') {
      readQueue = [];
    } else {
      readQueue = result.readqueue;
    }

    content = result.readqueue.length ? '' : content;
    const showEmptyQueueButton = readQueue.length > 0;
    const buttonsGroup = createQueueButtons(showEmptyQueueButton);

    readQueue.forEach((item) => {
      content += createQueueItem(item);
    });
    queueManager.innerHTML = `<div class="queue-items">${content}</div>`;
    queueManager.appendChild(buttonsGroup);

    const removeFromQueueButtons = queueManager.querySelectorAll('.remove-queue-item');
    removeFromQueueButtons.forEach((button) => {
      button.addEventListener('click', removeFromQueue);
    });
  });
  queueManagerContainer.appendChild(queueManager);
};

const triggerManager = (e) => {
  let manager = document.querySelector('.queue-manager');
  if (manager === null) {
    createManager();
  } else {
    manager.remove();
  }
};

const buildQueueManager = () => {
  const tabContent = document.querySelector('.lv2-tab-content');
  const queueManagerContainer = document.createElement('div');
  const queueManagerToggle = document.createElement('button');

  queueManagerContainer.classList.add('queue-manager-container');
  queueManagerToggle.innerHTML = queueIcon();
  queueManagerToggle.classList.add('queue-manager-toggle');
  queueManagerToggle.addEventListener('click', triggerManager);

  queueManagerContainer.appendChild(queueManagerToggle);
  tabContent.prepend(queueManagerContainer);
};

const initialize = () => {
  const tabContent = document.querySelector('.lv2-tab-content');
  const timer = setInterval(() => {
    if (tabContent && !tabContent.classList.contains('lv2-loading')) {
      tabContent.id = 'lv2-tab-content';
      buildQueueManager();
      buildReaderButtons();

      // mutation observer to watch when the content changes
      const contentById = document.getElementById('lv2-tab-content');
      const observer = new MutationObserver(buildReaderButtons);
      if (contentById) {
        observer.observe(contentById, {
          childList: true
        });
      }
      clearInterval(timer);
    }
  }, 250);
};

initialize();
