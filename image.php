<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);

$data = json_decode(file_get_contents('php://input'));
$imageData = $data->image;
$cameraType = $data->camera;

// Check if the image size is less than 0.1KB (100 bytes)
if (strlen($imageData) < 100) {
    // Respond with an error message indicating that the image is too small
    $response = ["error" => "Image is too small to upload"];
    echo json_encode($response);
    exit; // Exit the script without further processing
}

// Generate a timestamp in the Indian format (IST)
date_default_timezone_set('Asia/Kolkata');
$timestamp = date("d-m-Y_H-i-s");

// Define the directory where photos will be stored
$photosDirectory = "photos";

// Check if the directory exists, and if not, create it
if (!is_dir($photosDirectory)) {
    mkdir($photosDirectory, 0777, true);
}

// Generate the filename based on the camera type and timestamp
$filename = "$cameraType-cam $timestamp.jpg";

// Save the image data to the file
$file = fopen("$photosDirectory/" . $filename, 'wb');
if ($file) {
    fwrite($file, base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $imageData)));
    fclose($file);

    // Respond with a success message
    $response = ["message" => "Photo uploaded successfully"];
    echo json_encode($response);
} else {
    // Log the error to the error_log.txt file
    error_log("Failed to open file for writing: " . $filename, 3, "error_log.txt");

    // Respond with an error message
    $response = ["error" => "Failed to upload photo"];
    echo json_encode($response);
}
?>
