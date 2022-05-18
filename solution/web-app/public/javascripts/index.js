/**
 * set online and offline tag in nav
 */
const onlineTag = document.getElementById('online');
window.addEventListener('online', () => {
  onlineTag.className = 'badge text-bg-success me-4';
  onlineTag.innerText = 'Online';
});
window.addEventListener('offline', () => {
  onlineTag.className = 'badge text-bg-danger me-4';
  onlineTag.innerText = 'Offline';
});
