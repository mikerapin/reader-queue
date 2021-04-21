/**
 * Hey this thing is kind of a mess, but I think it works pretty okay!
 * 
 * @mikerapin
 */

function queueIcon() {
    return `
<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
</svg>
`;
}

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

function buildReaderButtons() {
    console.log('adding queue buttons')
    let bookContainer = document.querySelectorAll('.lv2-book-item, .lv2-book-micro-item');
    bookContainer.forEach(container => {
        const readerButton = container.querySelector('.lv2-read-button');
        const gridReadUrlLink = container.querySelector('.lv2-item-link');
        const microReadUrlLink = container.querySelector('.lv2-micro-item-title-container');

        if ((readerButton === null || gridReadUrlLink === null) && (readerButton === null || microReadUrlLink === null)) {
            console.log('no button!!', gridReadUrlLink, microReadUrlLink)
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
}

function createManager() {
    let queueManagerContainer = document.querySelector('.queue-manager-container');
    if (document.querySelector('.queue-manager')) {
        document.querySelector('.queue-manager').remove();
    }
    let queueManager = document.createElement('div');
    let clearQueueButton = document.createElement('button');

    queueManager.classList.add('queue-manager');
    queueManager.textContent = '~Loading~';
    clearQueueButton.classList.add('queue-clear');
    clearQueueButton.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
</svg>
    `;
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
        <button class="remove-queue-item" data-uid="${item.uid}">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
            </svg>
        </button>
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
    queueManagerToggle.innerHTML = queueIcon();
    queueManagerToggle.classList.add('queue-manager-toggle');
    queueManagerToggle.addEventListener('click', triggerManager);

    queueManagerContainer.appendChild(queueManagerToggle);
    document.body.appendChild(queueManagerContainer);
}

function createQueue() {
    console.log('creating the reading queue');
    const tabContent = document.querySelector('.lv2-tab-content');
    let bookContainer = document.querySelectorAll('.lv2-book-item, .lv2-book-micro-item');
    let readButtons = document.querySelectorAll('.lv2-read-button');
    if (!bookContainer.length || !readButtons.length) {
        window.requestAnimationFrame(createQueue);
    } else {
        buildQueueManager();
        buildReaderButtons();
    }
}

function initialize() {
    const tabContent = document.querySelector('.lv2-tab-content');
    const timer = setInterval(function() {
        if (tabContent && !tabContent.classList.contains('lv2-loading')) {
            tabContent.id = 'lv2-tab-content';
            createQueue();

            // mutation observer to watch when the content changes
            const contentById = document.getElementById('lv2-tab-content')
            const observer = new MutationObserver(buildReaderButtons);
            if (contentById) {
                console.log('observin')
                observer.observe(contentById, {
                    childList: true
                });
            }
            clearInterval(timer);
        }
    });

}

initialize();