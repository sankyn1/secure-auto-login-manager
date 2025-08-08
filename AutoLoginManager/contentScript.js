// contentScript.js

function getCurrentSiteAndFill() {
  chrome.storage.local.get(['currentSite'], function (result) {
    const site = result.currentSite;
    if (!site) return;

    // Basic URL match: accept either loginUrl(if set) or url
    const target = (site.loginUrl && site.loginUrl.trim() !== '') ? site.loginUrl : site.url;
    if (!target) return;

    // Use hostname containment to reduce false negatives
    try {
      const targetUrl = new URL(target);
      const currentUrl = new URL(window.location.href);
      if (currentUrl.hostname.indexOf(targetUrl.hostname) === -1) {
        console.log("Current URL does not match site hostname. Skipping auto-fill.");
        return;
      }
    } catch (e) {
      // Fallback to substring check
      if (!window.location.href.includes(target)) {
        console.log("Current URL does not include target. Skipping auto-fill.");
        return;
      }
    }

    const users = Array.isArray(site.users) ? site.users : [];
    const idx = Number.isInteger(site.selectedUserIndex) ? site.selectedUserIndex : 0;
    const chosen = users[idx] || users;
    if (!chosen) {
      console.log("No user found for this site.");
      return;
    }

    const username = chosen.username;
    const password = chosen.password;

    console.log("Attempting Auto Fill for Site:", site.url);
    console.log("Current Page URL:", window.location.href);

    let retryCount = 0;
    let isFilled = false;

    function fillAndLogin() {
      if (isFilled) return;

      const inputs = document.querySelectorAll('input');
      let filledUser = false, filledPass = false;

      inputs.forEach(input => {
        const type = (input.getAttribute('type') || '').toLowerCase();
        const nameAttr = (input.getAttribute('name') || '').toLowerCase();
        const idAttr = (input.getAttribute('id') || '').toLowerCase();
        const ariaLabel = (input.getAttribute('aria-label') || '').toLowerCase();
        const placeholder = (input.getAttribute('placeholder') || '').toLowerCase();

        const userHeur = (type === 'text' || type === 'email') ||
          nameAttr.includes('user') || nameAttr.includes('email') || nameAttr.includes('login') ||
          idAttr.includes('user') || idAttr.includes('email') || idAttr.includes('login') ||
          ariaLabel.includes('email') || ariaLabel.includes('user') || placeholder.includes('email') || placeholder.includes('user');

        if (!filledUser && userHeur) {
          input.value = username;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          filledUser = true;
          console.log("Filled Username");
        }

        if (!filledPass && type === 'password') {
          input.value = password;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          filledPass = true;
          console.log("Filled Password");
        }
      });

      if (filledUser && filledPass) {
        isFilled = true;
        const forms = document.querySelectorAll('form');
        if (forms.length > 0) {
          console.log("Submitting Form");
          forms[0].submit();  // Corrected: submit the first form found
        } else {
          // Try clicking a submit button if present
          const btn = document.querySelector('button[type="submit"], input[type="submit"]');
          if (btn) {
            console.log("Clicking submit button");
            btn.click();
          } else {
            console.log("No Form Found to Submit");
          }
        }
        return;
      }
      retryCount++;
      if (retryCount <= 5) {
        console.log(`Fields not found yet, will retry... Attempt ${retryCount}`);
        setTimeout(fillAndLogin, 1000);
      } else {
        console.log("Max retry attempts reached. Giving up.");
      }
    }

    // First try after small delay for SPA/late render
    setTimeout(fillAndLogin, 500);
  });
}

window.addEventListener('load', getCurrentSiteAndFill);
// Also attempt on DOMContentLoaded for pages that don’t fire load late
document.addEventListener('DOMContentLoaded', getCurrentSiteAndFill);
