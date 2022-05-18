/**
 * @file index script
 * @author Mingze Ma
 */

/**
 * service worker registration
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(registration => {
        console.log('[Service Worker] Register successfully: ', registration);
        console.log('[Service Worker] SW registered with scope: ', registration.scope);
      })
      .catch(err => {
        console.error('[Service Worker] Registration failed:', err);
      });
  });
} else {
  console.warn('[Service Worker] No service worker supported');
}


/**
 * set online and offline tag in nav
 */
window.addEventListener('online', () => {
  setNetworkStatusTag(true);
});
window.addEventListener('offline', () => {
  setNetworkStatusTag(false);
});

/**
 * set Network Status Tag in nav
 * @param status {boolean} true: online; false: offline;
 */
const setNetworkStatusTag = (status) => {
  const onlineTag = document.getElementById('online');
  onlineTag.className = `badge text-bg-${status ? 'success' : 'danger'} me-4`;
  onlineTag.innerText = status ? 'Online' : 'Offline';
};



const orderByDate = document.querySelector('#order-by-date')
const orderByAuthor = document.querySelector('#order-by-author')

orderByDate.addEventListener('click', (e) => {
  e.preventDefault()
  window.location.href = "/order_by_date"
})

orderByAuthor.addEventListener('click', (e) => {
  e.preventDefault()
  window.location.href = "/order_by_author"
})