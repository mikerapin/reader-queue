const saveOptions = (e) => {
  const customCss = document.getElementById('custom-css').checked;
  // const removeAfterReading = document.getElementById('remove-after-reading').checked;
  const showQueueOnStart = document.getElementById('show-queue-on-start').checked;
  const options = {
    customCss: customCss,
    // implementing the 'false' state of this will require some _work_
    // Mostly to track where the user is currently IN their queue
    // GOD HELP US if they open multiple things in a new tab.....
    removeAfterReading: true,
    showQueueOnStart: showQueueOnStart
  };
  chrome.storage.sync.set(
    {
      extensionOptions: options
    },
    function () {
      if (chrome.runtime.error) {
        console.log('Runtime error.');
      }

      // Update status to let user know options were saved.
      // Idk this was stupid to build and doesn't EXACTLY work.
      /* 
      const status = document.getElementById('status');
      console.log(status.dataset.animating);
      if (!status.dataset.animating) {
        status.classList.toggle('appear');
        status.dataset.animating = 1;
        setTimeout(function () {
          status.classList.toggle('appear');
          delete status.dataset.animating;
        }, 1000);
      }
      */
    }
  );
};

const loadOptions = () => {
  const checkBoxes = document.querySelectorAll('[type=checkbox');
  if (checkBoxes && checkBoxes.length) {
    checkBoxes.forEach((chkbx) => {
      chkbx.addEventListener('click', saveOptions);
    });
  }
  // Chrome Extensions are cool because we can define default values for things
  // when we fetch them!
  chrome.storage.sync.get(
    {
      extensionOptions: {
        customCss: false,
        removeAfterReading: true,
        showQueueOnStart: false
      }
    },
    function (data) {
      if (chrome.runtime.error) {
        console.log('Runtime error.');
      }
      const options = data.extensionOptions;

      document.getElementById('custom-css').checked = options.customCss;
      // document.getElementById('remove-after-reading').checked = options.removeAfterReading;
      document.getElementById('show-queue-on-start').checked = options.showQueueOnStart;
    }
  );
};

document.addEventListener('DOMContentLoaded', loadOptions);
