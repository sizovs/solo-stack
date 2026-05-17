// ------------
// Error reporting
// ------------

// Queue to store pending errors
const queue = [];

const FLUSH_INTERVAL = 1500; // Flush every 1.5s
const MAX_ERRORS = 1; // Max number of errors to send (e.g. to avoid sending gazillions in case of an infinite loop)

// Error context to send alongside with errors
const context = {
  url: location.href,
  ua: navigator.userAgent,
  platform:
    navigator.userAgentData?.platform || navigator.platform || "unknown",
};

// Send all queued errors
function flush() {
  if (queue.length === 0) return;

  // Ensure we only send up to MAX_ERRORS
  const errors = queue.splice(0, MAX_ERRORS);

  navigator.sendBeacon(
    "/js-error",
    JSON.stringify({
      context,
      errors,
    }),
  );
}

function capture(e) {
  if (!(e instanceof Error)) {
    console.warn("Not an Error instance. Skipping sending to the server.", e);
    return;
  }

  const { name, message, stack } = e;
  if (!name || !message || !stack) {
    console.warn(
      "Error doesn't have required properties. Skipping sending to the server.",
      e,
    );
    return;
  }

  const key = `js-error:${name}|${message}|${stack}`;

  const sentAlready = sessionStorage.getItem(key);
  if (!sentAlready) {
    queue.push({ name, message, stack });
    sessionStorage.setItem(key, "1"); // mark as sent
  }
}

// Capture runtime errors
window.addEventListener("error", (event) => capture(event.error));

// Capture unhandled Promise rejections
window.addEventListener("unhandledrejection", (event) => capture(event.reason));

// Flush on page unload
window.addEventListener("pagehide", flush);
window.addEventListener("beforeunload", flush);

// Periodic flush
setInterval(flush, FLUSH_INTERVAL);
