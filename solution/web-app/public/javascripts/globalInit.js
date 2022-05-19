/**
 * @file global init modules
 * @author Mingze Ma
 */

const globalInit = async (customInitMethod) => {
  // initial all stores of indexedDB
  await initMessageDB();
  await initCanvasDB();
  await initRoomToStoryDB();
  await initStoryDB();
  await initKGraphDB();

  /**
   * set online and offline tag in nav
   */
  window.addEventListener('load', () => {
    setNetworkStatusTag(navigator.onLine);
  });
  window.addEventListener('online', () => {
    setNetworkStatusTag(navigator.onLine);
  });
  window.addEventListener('offline', () => {
    setNetworkStatusTag(navigator.onLine);
  });

  // run custom init method
  customInitMethod && await customInitMethod();
};

/**
 * set Network Status Tag in nav
 * @param status {boolean} true: online; false: offline;
 */
const setNetworkStatusTag = (status) => {
  const onlineTag = document.getElementById('online');
  onlineTag.className = `badge text-bg-${status ? 'success' : 'danger'} me-4`;
  onlineTag.innerText = status ? 'Online' : 'Offline';
};
