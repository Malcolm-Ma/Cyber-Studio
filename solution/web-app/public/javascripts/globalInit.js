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
  // check network status
  await setNetworkStatusTag();

  // run custom init method
  customInitMethod && await customInitMethod();
};

window.addEventListener('online', async () => {
  setNetworkStatusTag();
  // update offline story to server
  let offlineStories = await getOfflineStoryList();
  console.log(offlineStories)
  try{
    const res = await fetch('/create_story_in_bulk', {
      method: 'POST',
      body: JSON.stringify(offlineStories),
      headers: { 'Content-Type': 'application/json' }
    })
    const offlineresult = await res.json()
    console.log("fetch result: ", offlineresult)
  }catch (err){
    console.error(err)
    console.log(err.message)
  }



  // get story list from server
  const response = await fetch('/get_story_list', {method: 'GET'});
  const result = await response.json();
  console.log(result);
  updateStory(result);
});
window.addEventListener('offline', () => {
  setNetworkStatusTag();
});

/**
 * set Network Status Tag in nav
 */
const setNetworkStatusTag = async () => {
  const changeTag = (status) => {
    const onlineTag = document.getElementById('online');
    onlineTag.className = `badge text-bg-${status ? 'success' : 'danger'} me-4`;
    onlineTag.innerText = status ? 'Online' : 'Offline';
  }
  try {
    await fetch('/offline/check_network', { method: 'GET' });
    window.ONLINE = true;
    changeTag(true);
  } catch (e) {
    window.ONLINE = false;
    changeTag(false);
  }
};
