function _id() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function addToQueue(e) {
    let data = e.target.dataset;
    chrome.storage.sync.get(['readqueue'], (result) => {
        let readQueue;
        if (!result.length && typeof result.readqueue === 'undefined') {
            readQueue = [];
        } else {
            readQueue = result.readqueue;
        }
        readQueue.push({
            'uid': _id(),
            'title': data.title,
            'sid': data.sid,
            'id': data.id,
        });
        chrome.storage.sync.set({ 'readqueue': readQueue }, () => {
            console.log('adding ' + data.title + ' to the queue');
            console.log(readQueue);
            createManager();
        })
    });
}

function removeFromQueue(e) {
    let uid = e.target.dataset.uid;
    console.log(e.target.dataset)
    chrome.storage.sync.get(['readqueue'], (result) => {
        let readQueue;
        if (!result.length && typeof result.readqueue === 'undefined' && uid !== null) {
            return;
        } else {
            readQueue = result.readqueue;
        }

        let index = readQueue.findIndex(item => item.uid === uid);
        readQueue.splice(index, 1);

        chrome.storage.sync.set({ 'readqueue': readQueue }, () => {
            console.log(readQueue);
            createManager();
        });
    });
}

function clearQueue() {
    if (confirm("are you sure you want to clear the queue???")) {
        chrome.storage.sync.set({ 'readqueue': [] }, () => {
            console.log("Cleared the queue", []);
            createManager();
        });
    }
}

function buildReaderButtons(bookContainer) {
    bookContainer.forEach(container => {
        let readerButton = container.querySelector('.lv2-read-button');
        let readUrlLink = container.querySelector('.lv2-item-link');

        if (readerButton === null || readUrlLink === null) {
            return;
        }

        let readUrl = readUrlLink.getAttribute('href');;
        let itemId = readUrl.match(/[0-9]+/g);
        let queueButton = document.createElement('button');

        queueButton.textContent = '+';
        queueButton.classList.add('add-to-queue');
        queueButton.dataset.sid = itemId[0];
        queueButton.dataset.id = itemId[1];
        queueButton.dataset.title = readUrlLink.title;

        queueButton.addEventListener('click', addToQueue);
        readerButton.parentElement.appendChild(queueButton);
    });
}

function createManager() {
    let queueManagerContainer = document.querySelector('.queue-manager-container');
    if (document.querySelector('.queue-manager')) {
        document.querySelector('.queue-manager').remove();
    }
    let queueManager = document.createElement('div');
    let clearQueueButton = document.createElement('button');

    queueManager.classList.add('queue-manager');
    queueManager.textContent = 'Queue Manager';
    clearQueueButton.classList.add('queue-clear');
    clearQueueButton.textContent = 'CLEAR QUEUE';
    clearQueueButton.addEventListener('click', clearQueue)

    let content = '';
    chrome.storage.sync.get(['readqueue'], (result) => {
        let readQueue;
        if (!result.length && typeof result.readqueue === 'undefined') {
            readQueue = [];
        } else {
            readQueue = result.readqueue;
        }
        readQueue.forEach(item => {
            content += `
<div class="queue-item-container">
    <div class="queue-item">
        <a href="/comic-reader/${item.sid}/${item.id}">${item.title}</a>
    </div>
    <div class="queue-item-remove">
        <button class="remove-queue-item" data-uid="${item.uid}">x</button>
    </div>
</div>
`;
        });
        content = `<div class="queue-items">${content}</div>`;
        queueManager.innerHTML = content;
        queueManager.appendChild(clearQueueButton);
        let removeFromQueueButtons = queueManager.querySelectorAll('.remove-queue-item');
        removeFromQueueButtons.forEach(button => {
            button.addEventListener('click', removeFromQueue);
        });
    });
    queueManagerContainer.appendChild(queueManager);
}

function triggerManager(e) {
    let manager = document.querySelector('.queue-manager');
    if (manager === null) {
        createManager();
    } else {
        manager.remove();
    }
}

function buildQueueManager() {
    let queueManagerContainer = document.createElement('div');
    let queueManagerToggle = document.createElement('button');

    queueManagerContainer.classList.add('queue-manager-container');
    queueManagerToggle.textContent = 'Queue Manager';
    queueManagerToggle.classList.add('queue-manager-toggle');
    queueManagerToggle.addEventListener('click', triggerManager);

    queueManagerContainer.appendChild(queueManagerToggle);
    document.body.appendChild(queueManagerContainer);
}

function initialize() {
    let bookContainer = document.querySelectorAll('.lv2-book-item, .lv2-book-micro-item');
    let readButtons = document.querySelectorAll('.lv2-read-button');
    if (!bookContainer.length || !readButtons.length) {
        window.requestAnimationFrame(initialize);
    } else {
        buildQueueManager();
        buildReaderButtons(bookContainer);
    }
}

initialize();