const iframe = document.getElementById('websim-frame');
const websimHomeUrl = 'https://websim.com';
const oneMinute = 60 * 1000;

let scrollInterval;

async function fetchHotSite() {
  try {
    const response = await fetch('/api/v1/feed/trending?feed=hot&limit=1');
    if (!response.ok) {
      console.error('Failed to fetch trending sites:', response.status, response.statusText);
      return null;
    }
    const { feed } = await response.json();
    if (feed.data && feed.data.length > 0) {
      const site = feed.data[0].site;
      return `https://websim.com/c/${site.id}`;
    }
  } catch (error) {
    console.error('Error fetching hot site:', error);
  }
  return null;
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
  console.log('Fetching a new hot site...');
  const hotSiteUrl = await fetchHotSite();

  if (hotSiteUrl) {
    console.log(`Navigating to ${hotSiteUrl}`);
    iframe.src = hotSiteUrl;

    setTimeout(() => {
      console.log(`Navigating back to ${websimHomeUrl}`);
      iframe.src = websimHomeUrl;
      // Restart the surf cycle
      setTimeout(surf, oneMinute);
    }, oneMinute);
  } else {
    // If fetching failed, just try again after a minute.
    console.log('Failed to get a hot site, will try again.');
    setTimeout(surf, oneMinute);
  }
}

// Initial setup
iframe.onload = () => {
    // Start scrolling once any page loads in the iframe.
    startScrolling();
};

// Start the first cycle a minute after the page loads.
setTimeout(surf, oneMinute);

