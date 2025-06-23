const iframe = document.getElementById('websim-frame');
const websimHomeUrl = 'https://websim.com';
const oneMinute = 60 * 1000;
const siteDisplayDuration = oneMinute;

let scrollInterval;
let siteQueue = [];

async function populateSiteQueue() {
  console.log('Fetching 100 hot sites...');
  try {
    const response = await fetch('/api/v1/feed/trending?feed=hot&limit=100');
    if (!response.ok) {
      console.error('Failed to fetch trending sites:', response.status, response.statusText);
      return;
    }
    const { feed } = await response.json();
    if (feed.data && feed.data.length > 0) {
      const newSites = feed.data.map(item => ({
          id: item.site.id,
          url: `https://websim.com/c/${item.site.id}`
      }));

      // Simple shuffle to randomize the order
      for (let i = newSites.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newSites[i], newSites[j]] = [newSites[j], newSites[i]];
      }

      siteQueue = newSites;
      console.log(`Populated queue with ${siteQueue.length} sites.`);
    } else {
        console.log('No sites returned from API.');
    }
  } catch (error) {
    console.error('Error fetching hot sites:', error);
  }
}

function startScrolling() {
  if (scrollInterval) {
    clearInterval(scrollInterval);
  }
  // Try to send a scroll command to the iframe. This may be blocked by the browser's
  // cross-origin policy, but is the standard way to communicate with iframes.
  scrollInterval = setInterval(() => {
    iframe.contentWindow.postMessage({ type: 'scrollBy', y: 300 }, '*');
  }, 10 * 1000); // Scroll every 10 seconds
}

async function surf() {
  if (siteQueue.length === 0) {
    console.log('Site queue is empty. Fetching new list.');
    await populateSiteQueue();
    if (siteQueue.length === 0) {
      console.log('Failed to populate site queue. Retrying in 1 minute.');
      setTimeout(surf, oneMinute);
      return;
    }
  }
  
  const site = siteQueue.pop();
  console.log(`Navigating to ${site.url}. ${siteQueue.length} sites remaining in queue.`);
  iframe.src = site.url;

  // After the display duration, move to the next site.
  setTimeout(surf, siteDisplayDuration);
}

// Initial setup
iframe.onload = () => {
    // Start scrolling once any page loads in the iframe.
    startScrolling();
};

// Start the first cycle.
surf();