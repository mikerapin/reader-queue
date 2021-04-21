
function initialize() {
    const endModal = document.querySelector('.end-comic');
    const nextInQueue = document.createElement('section');
    nextInQueue.classList.add('queue-container', 'end-comic');

    let nextItem;

    chrome.storage.sync.get(['readqueue'], (result) => {
        const queue = result.readqueue;
        if (queue.length) {
            nextItem = queue[0];
            nextInQueue.innerHTML = `
            <h3 class="end-subtitle">Keep Reading In Your Queue</h3>
            <h4>${nextItem.title}</h4>
            <div class="ComicBtn actBtn readBtn queue-read-button">
            <a class="read_link read-action primary-action action-button queue-read" href="https://www.comixology.com/comic-reader/${nextItem.sid}/${nextItem.id}">Read</a>
            </div>
            `;

            endModal.parentElement.insertBefore(nextInQueue, endModal);

            
        }
    });

    console.log("prepended boss");
}

window.setTimeout(initialize(), 2000);


/*

            0:
id: "73244"
sid: "12630"
title: "All-New X-Factor (2014-2015) #3"


<section class="end-comic">
				<h3 class="end-subtitle">Keep Reading</h3>
				<figure class="end-comic-cover">
					<a target="_blank" href="https://www.comixology.com/All-New-X-Factor-2014-2015-4/digital-comic/80574"><img src="https://images-na.ssl-images-amazon.com/images/S/cmx-images-prod/Item/80574/DIG017944_2._SX200_QL80_TTD_.jpg"></a>
					<div class="price-container"><div class="price">$1.69</div><div class="org_price">$1.99</div></div>
<div class="ComicBtn actBtn readBtn">
    <a class="read_link read-action primary-action action-button" href="https://www.comixology.com/comic-reader/12630/80574">Read</a>
    </div>

				</figure>
				<h4>All-New X-Factor (2014-2015) #4</h4>
				<p>The team takes on their former frenemy, Danger!</p>
				<p></p>
				<div class="clear"></div>
            </section>


*/