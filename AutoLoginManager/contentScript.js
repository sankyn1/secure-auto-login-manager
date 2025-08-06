function getCurrentSiteAndFill() {
  chrome.storage.local.get(['currentSite'], function(result) {
    const site = result.currentSite;
    if (!site) return;

    if (!window.location.href.includes(site.url)) {
      console.log("Current URL does not match site URL. Skipping auto-fill.");
      return;
    }

    const username = site.username;
    const password = site.password;

    console.log("Attempting Auto Fill for Site:", site.url);
    console.log("Current Page URL:", window.location.href);

    let retryCount = 0;
    let isFilled = false;

    function fillAndLogin() {
      if (isFilled) return; // Stop retrying if already filled

      const inputs = document.querySelectorAll('input');
      let filledUser = false, filledPass = false;

      inputs.forEach(input => {
        const type = input.getAttribute('type');
        const name = input.getAttribute('name') || '';
        if (!filledUser && (type === 'text' || name.toLowerCase().includes('user') || name.toLowerCase().includes('email'))){
          input.value = username;
          filledUser = true;
          console.log("Filled Username");
        }
        if (!filledPass && type === 'password') {
          input.value = password;
          filledPass = true;
          console.log("Filled Password");
        }
      });

      if (filledUser && filledPass) {
        isFilled = true;
        const forms = document.querySelectorAll('form');
        if (forms.length > 0) {
          console.log("Submitting Form");
          forms[0].submit();
        } else {
          console.log("No Form Found to Submit");
        }
      } else {
        retryCount++;
        if (retryCount <= 5) {
          console.log(`Fields not found yet, will retry... Attempt ${retryCount}`);
          setTimeout(fillAndLogin, 1000);
        } else {
          console.log("Max retry attempts reached. Giving up.");
        }
      }
    }

    setTimeout(fillAndLogin, 2000);
  });
}

window.addEventListener('load', getCurrentSiteAndFill);