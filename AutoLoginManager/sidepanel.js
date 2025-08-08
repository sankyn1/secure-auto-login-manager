// ====== Constants & Globals ======
let tempUsers = []; // For building a new site users[] array
let lastSiteForModal = null; // Which site the "select user" modal is acting for

// ====== Utility Functions ======

/**
 * Upgrade legacy site object to multi-user array structure.
 */
function upgradeSiteModel(site) {
  if (Array.isArray(site.users)) return site;
  const users = [];
  if (site.username || site.password) {
    users.push({
      label: site.username || 'User',
      username: site.username || '',
      password: site.password || ''
    });
  }
  return {
    name: site.name,
    url: site.url,
    loginUrl: site.loginUrl,
    users
  };
}

/**
 * Show a floating toast message.
 */
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.innerText = message;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 2000);
}

// ====== User List Modal Controls ======

function wireAddUserControls() {
  const addUserBtn = document.getElementById('addUserBtn');
  if (!addUserBtn) return;
  addUserBtn.addEventListener('click', () => {
    const label = (document.getElementById('userLabel')?.value || '').trim();
    const username = (document.getElementById('userUsername')?.value || '').trim();
    const password = (document.getElementById('userPassword')?.value || '').trim();
    if (!username || !password) {
      alert('Username and Password are required for a user');
      return;
    }
    tempUsers.push({ label, username, password });
    document.getElementById('userLabel').value = '';
    document.getElementById('userUsername').value = '';
    document.getElementById('userPassword').value = '';
    renderUsersList();
  });
}

function renderUsersList() {
  const usersList = document.getElementById('usersList');
  if (!usersList) return;
  usersList.innerHTML = '';
  tempUsers.forEach((u, idx) => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.gap = '8px';
    row.style.marginBottom = '4px';

    const labelSpan = document.createElement('span');
    labelSpan.textContent = (u.label ? `${u.label} — ` : '') + u.username;

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Remove';
    delBtn.className = 'admin-btn';
    delBtn.onclick = () => {
      tempUsers.splice(idx, 1);
      renderUsersList();
    };

    row.appendChild(labelSpan);
    row.appendChild(delBtn);
    usersList.appendChild(row);
  });
}

// ====== User Picker Modal Controls ======

/**
 * Show the user select modal for a given site.
 */
function showUserSelectModal(site) {
  lastSiteForModal = site;
  const modal = document.getElementById('userSelectModal');
  if (!modal) return;
  document.getElementById('modalSiteName').innerText = site.name || site.url;
  const dropdown = document.getElementById('userDropdown');
  dropdown.innerHTML = '';
  (site.users || []).forEach((u, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = (u.label && u.label.trim()) ? u.label : (u.username || `User ${idx+1}`);
    dropdown.appendChild(opt);
  });
  modal.style.display = 'block';
}

function hideUserSelectModal() {
  document.getElementById('userSelectModal').style.display = 'none';
  lastSiteForModal = null;
}

// ====== Sites List Rendering ======

function renderSiteList() {
  chrome.storage.local.get(['sites'], function(result) {
    let siteList = result.sites || [];
    // Upgrade legacy on-the-fly
    let upgraded = false;
    siteList = siteList.map(site => {
      if (!Array.isArray(site.users)) { upgraded = true; return upgradeSiteModel(site);}
      return site;
    });
    if (upgraded) chrome.storage.local.set({ 'sites': siteList });

    const container = document.getElementById('siteList');
    if (!container) return;
    container.innerHTML = '';

    siteList.forEach((site, index) => {
      const div = document.createElement('div');
      div.className = 'site-list-item';

      // Main site button - launch the user picker modal
      const btn = document.createElement('button');
      btn.classList.add('site-btn');
      btn.innerText = site.name || site.url;
      btn.onclick = () => {
        if ((site.users || []).length === 0) {
          alert('No users saved for this site.');
        } else {
          showUserSelectModal(site);
        }
      };

      // Delete icon
      const delIcon = document.createElement('i');
      delIcon.className = 'fas fa-trash delete-icon';
      delIcon.onclick = () => {
        siteList.splice(index, 1);
        chrome.storage.local.set({ 'sites': siteList }, renderSiteList);
      };

      div.appendChild(btn);
      div.appendChild(delIcon);
      container.appendChild(div);
    });
  });
}

// ====== Event Handlers ======

function handleSaveSite() {
  const name = document.getElementById('siteName').value;
  const url = document.getElementById('siteUrl').value;
  const loginUrl = document.getElementById('loginUrl').value;
  if (!name && !url) {
    alert('Please provide at least a Site Name or URL');
    return;
  }
  if (!Array.isArray(tempUsers) || tempUsers.length === 0) {
    alert('Please add at least one user for this site');
    return;
  }
  chrome.storage.local.get(['sites'], function(result) {
    const sites = result.sites || [];
    sites.push({ name, url, loginUrl, users: tempUsers });
    chrome.storage.local.set({ 'sites': sites }, function() {
      renderSiteList();
      document.getElementById('siteName').value = '';
      document.getElementById('siteUrl').value = '';
      document.getElementById('loginUrl').value = '';
      tempUsers = [];
      renderUsersList();
      showToast('Saved Successfully!');
      const modal = document.getElementById('addSiteModal');
      if (modal) modal.style.display = 'none';
    });
  });
}

function handleExport() {
  chrome.storage.local.get(['sites'], function(result) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result.sites || []));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "site-backup.json");
    dlAnchor.click();
  });
}

function handleImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedSites = JSON.parse(e.target.result);
      const upgradedList = (importedSites || []).map(upgradeSiteModel);
      chrome.storage.local.set({ 'sites': upgradedList }, renderSiteList);
      alert("Import Successful!");
    } catch (err) {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
}

// ====== Modal and Dialog Controls ======

function wireModalControls() {
  document.getElementById('addSiteBtn')?.addEventListener('click', function() {
    document.getElementById('addSiteModal').style.display = 'block';
  });
  document.querySelector('.close')?.addEventListener('click', function() {
    document.getElementById('addSiteModal').style.display = 'none';
  });
  window.addEventListener('click', function(event) {
    const modal = document.getElementById('addSiteModal');
    if (event.target === modal) {
      modal.style.display = 'none';
    }
    const userModal = document.getElementById('userSelectModal');
    if (event.target === userModal) {
      hideUserSelectModal();
    }
  });
}

// ====== User Picker Modal Wiring ======

function wireUserPickerModal() {
  document.querySelector('.close-user-modal')?.addEventListener('click', hideUserSelectModal);
  document.getElementById('userLoginBtn')?.addEventListener('click', function() {
    if (!lastSiteForModal) return;
    const selectedUserIdx = parseInt(document.getElementById('userDropdown').value, 10) || 0;
    const targetUrl = lastSiteForModal.loginUrl && lastSiteForModal.loginUrl.trim() !== ''
      ? lastSiteForModal.loginUrl
      : lastSiteForModal.url;
    const siteWithSelection = { ...lastSiteForModal, selectedUserIndex: selectedUserIdx };
    chrome.storage.local.set({ 'currentSite': siteWithSelection }, () => {
      chrome.tabs.create({ url: targetUrl });
      hideUserSelectModal();
    });
  });
}

// ====== Initialization ======

document.addEventListener('DOMContentLoaded', () => {
  renderSiteList();
  wireAddUserControls();
  renderUsersList();
  wireModalControls();
  wireUserPickerModal();

  document.getElementById('saveBtn')?.addEventListener('click', handleSaveSite);
  document.getElementById('exportBtn')?.addEventListener('click', handleExport);
  document.getElementById('importBtn')?.addEventListener('click', function() {
    document.getElementById('importFile')?.click();
  });
  document.getElementById('importFile')?.addEventListener('change', handleImport);
});
