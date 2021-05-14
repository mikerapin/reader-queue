const initialize = () => {
  const endComic = document.querySelector('.end-comic');
  const endRelatedTitleSection = document.querySelector('.end-related-title-section');
  const nextInQueue = document.createElement('section');
  nextInQueue.classList.add('queue-container', 'end-comic');

  let nextItem;
  let observerElement;

  chrome.storage.sync.get(['readqueue'], (result) => {
    const queue = result.readqueue;
    const currentlyReading = window.location.href.match(/[0-9]+/g);
    let topOfQueue;

    // if we have any strange business in the url, just get the EFF out of there
    if (currentlyReading.length !== 2) {
      return;
    }

    // remove the top item from the queue if it matches the current book we're reading
    if (queue[0].sid === currentlyReading[0] && queue[0].id === currentlyReading[1]) {
      queue.shift();
    }

    if (queue.length) {
      topOfQueue = queue[0];
    } else {
      topOfQueue = null;
    }

    if (topOfQueue !== null) {
      // this is kind of simplistic, could be refactored to be less template and more programmatic?
      nextInQueue.innerHTML = `
            <h3 class="end-subtitle">Keep Reading In Your Queue</h3>
            <h4>${topOfQueue.title}</h4>
            <div class="ComicBtn actBtn readBtn queue-read-button">
            <a class="read_link read-action primary-action action-button queue-read" href="https://www.comixology.com/comic-reader/${topOfQueue.sid}/${topOfQueue.id}">Read</a>
            </div>
            `;

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
    }

    // use this clever little devil to only update the queue when the end modal is visible
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          chrome.storage.sync.set({ readqueue: queue });
          obs.disconnect();
        }
      });
    });
    observer.observe(observerElement);
  });
};

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
