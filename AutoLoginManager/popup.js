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
    chrome.storage.local.set({ 'sites': sites }, loadSites);
  });
});

document.addEventListener('DOMContentLoaded', loadSites);