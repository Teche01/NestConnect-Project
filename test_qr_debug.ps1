# QR Code Debugging Script
# This script tests the QR code flow end-to-end

# Test 1: Check if a worker has a QR image in their profile
Write-Host "=== TEST 1: Check worker profile QR ===" -ForegroundColor Cyan

# First, get a worker ID (assuming worker ID 2 from previous tests)
$profileResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/workers/payment-profile/view" `
  -Method GET `
  -Headers @{
    "Authorization" = "Bearer your_worker_token_here"
  } `
  -ContentType "application/json" `
  -ErrorAction SilentlyContinue

if ($profileResponse) {
  $profileData = $profileResponse.Content | ConvertFrom-Json
  Write-Host "Worker profile response:"
  Write-Host ($profileData | ConvertTo-Json -Depth 10)
  
  if ($profileData.data.qr_image) {
    Write-Host "✓ QR image URL: $($profileData.data.qr_image)" -ForegroundColor Green
  } else {
    Write-Host "✗ No QR image found in profile" -ForegroundColor Red
  }
} else {
  Write-Host "Could not fetch worker profile" -ForegroundColor Red
}

Write-Host "`n=== TEST 2: Check payment details API ===" -ForegroundColor Cyan

# Get a payment ID from database or test
$paymentResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/work/payment/1" `
  -Method GET `
  -Headers @{
    "Authorization" = "Bearer your_token_here"
  } `
  -ContentType "application/json" `
  -ErrorAction SilentlyContinue

if ($paymentResponse) {
  $paymentData = $paymentResponse.Content | ConvertFrom-Json
  Write-Host "Payment response:"
  Write-Host ($paymentData | ConvertTo-Json -Depth 10)
  
  if ($paymentData.data.qr_image) {
    Write-Host "✓ QR image URL: $($paymentData.data.qr_image)" -ForegroundColor Green
    
    # Try to fetch the actual image
    $imageResponse = Invoke-WebRequest -Uri "http://localhost:5000$($paymentData.data.qr_image)" `
      -Method GET `
      -ErrorAction SilentlyContinue
    
    if ($imageResponse.StatusCode -eq 200) {
      Write-Host "✓ QR image file accessible" -ForegroundColor Green
    } else {
      Write-Host "✗ QR image file NOT accessible (Status: $($imageResponse.StatusCode))" -ForegroundColor Red
    }
  } else {
    Write-Host "✗ No QR image found in payment details" -ForegroundColor Red
  }
} else {
  Write-Host "Could not fetch payment details" -ForegroundColor Red
}

Write-Host "`n=== TEST 3: Check file system ===" -ForegroundColor Cyan

$uploadPath = "backend/uploads/worker_profiles"
if (Test-Path $uploadPath) {
  $files = Get-ChildItem $uploadPath -ErrorAction SilentlyContinue
  if ($files) {
    Write-Host "✓ Files in $uploadPath:" -ForegroundColor Green
    $files | ForEach-Object { Write-Host "  - $($_.Name)" }
  } else {
    Write-Host "✗ No files found in $uploadPath" -ForegroundColor Red
  }
} else {
  Write-Host "✗ Directory $uploadPath does NOT exist" -ForegroundColor Red
}
