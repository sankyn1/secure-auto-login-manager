function loadSites() {
  chrome.storage.local.get(['sites'], function(result) {
    const siteList = result.sites || [];
    const container = document.getElementById('siteList');
    container.innerHTML = '';
    siteList.forEach((site, index) => {
      const div = document.createElement('div');

      const btn = document.createElement('button');
      btn.classList.add('site-btn');
      btn.innerText = site.name || site.url;
      btn.onclick = () => {
        const targetUrl = site.loginUrl && site.loginUrl.trim() !== '' ? site.loginUrl : site.url;
        chrome.storage.local.set({ 'currentSite': site }, () => {
          chrome.tabs.create({ url: targetUrl });
        });
      };

      const delIcon = document.createElement('i');
      delIcon.className = 'fas fa-trash delete-icon';
      delIcon.onclick = () => {
        siteList.splice(index, 1);
        chrome.storage.local.set({ 'sites': siteList }, loadSites);
      };

      div.appendChild(btn);
      div.appendChild(delIcon);
      container.appendChild(div);
    });
  });
}

document.getElementById('saveBtn').addEventListener('click', function() {
  const name = document.getElementById('siteName').value;
  const url = document.getElementById('siteUrl').value;
  const loginUrl = document.getElementById('loginUrl').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  chrome.storage.local.get(['sites'], function(result) {
    const sites = result.sites || [];
    sites.push({ name, url, loginUrl, username, password });
     chrome.storage.local.set({ 'sites': sites }, function() {
      loadSites();
      // Clear the input fields after save
      document.getElementById('siteName').value = '';
      document.getElementById('siteUrl').value = '';
      document.getElementById('loginUrl').value = '';
      document.getElementById('username').value = '';
      document.getElementById('password').value = '';
      showToast("Saved Successfully!");
      document.getElementById('addSiteModal').style.display = 'none';
    });
  });
});


document.addEventListener('DOMContentLoaded', loadSites);


// Import export code
document.getElementById('exportBtn').addEventListener('click', function() {
  chrome.storage.local.get(['sites'], function(result) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result.sites || []));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "site-backup.json");
    dlAnchor.click();
  });
});

document.getElementById('importBtn').addEventListener('click', function() {
  document.getElementById('importFile').click();
});

document.getElementById('importFile').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedSites = JSON.parse(e.target.result);
      chrome.storage.local.set({ 'sites': importedSites }, loadSites);
      alert("Import Successful!");
    } catch (err) {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
});

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.innerText = message;
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 2000);
}

document.getElementById('addSiteBtn').addEventListener('click', function() {
  document.getElementById('addSiteModal').style.display = 'block';
});

document.querySelector('.close').addEventListener('click', function() {
  document.getElementById('addSiteModal').style.display = 'none';
});

window.addEventListener('click', function(event) {
  const modal = document.getElementById('addSiteModal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});