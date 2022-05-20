/**
 * @file global init modules
 * @author Mingze Ma
 */

const globalInit = async (customInitMethod) => {
  console.log('[Global Init] resource onload');
  // initial all stores of indexedDB
  await initMessageDB();
  await initCanvasDB();
  await initRoomToStoryDB();
  await initStoryDB();
  await initKGraphDB();

  /**
   * set online and offline tag in nav
   */
  try {
    const res = await fetch('/offline/check_network', {
      method: 'GET',
    });
    console.log('--res--\n', res);
    window.ONLINE = true;
  } catch (e) {
    window.ONLINE = false;
  }
  setNetworkStatusTag(window.ONLINE);
  window.addEventListener('online', () => {
    setNetworkStatusTag(window.ONLINE);
  });
  window.addEventListener('offline', () => {
    setNetworkStatusTag(window.ONLINE);
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
