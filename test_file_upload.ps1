#!/usr/bin/env powershell

# Test file upload functionality
Write-Host "🧪 TESTING FILE UPLOAD FUNCTIONALITY" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Create test files
$testDir = ".\test_uploads"
if (!(Test-Path $testDir)) {
    New-Item -ItemType Directory -Path $testDir -Force | Out-Null
}

# Create a test image (PNG)
$pngPath = "$testDir\test_qr.png"
$jpgPath = "$testDir\test_bill.jpg"
$pdfPath = "$testDir\test_bill.pdf"

# Create simple PNG using PowerShell
Write-Host "📝 Creating test files..." -ForegroundColor Yellow

# Create a minimal PNG file (1x1 transparent pixel)
$pngBytes = @(137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 10, 73, 68, 65, 84, 8, 29, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 21, 181, 238, 86, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130)
[IO.File]::WriteAllBytes($pngPath, $pngBytes)
Write-Host "✅ Created test PNG: $pngPath" -ForegroundColor Green

# Create a minimal JPG (very simple)
$jpgBytes = @(255, 216, 255, 224, 0, 16, 74, 70, 73, 70, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 255, 219, 0, 67, 0, 8, 6, 6, 7, 6, 5, 8, 7, 7, 7, 9, 9, 8, 10, 12, 20, 13, 12, 11, 11, 12, 25, 18, 19, 15, 20, 29, 26, 31, 30, 29, 26, 28, 28, 30, 31, 34, 34, 34, 31, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 255, 217)
[IO.File]::WriteAllBytes($jpgPath, $jpgBytes)
Write-Host "✅ Created test JPG: $jpgPath" -ForegroundColor Green

# Copy a real PDF if exists, or create minimal PDF
$pdfContent = "%PDF-1.4`n1 0 obj`n<< /Type /Catalog /Pages 2 0 R >>`nendobj`n2 0 obj`n<< /Type /Pages /Kids [3 0 R] /Count 1 >>`nendobj`n3 0 obj`n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>`nendobj`nxref`n0 4`n0000000000 65535 f`n0000000009 00000 n`n0000000058 00000 n`n0000000115 00000 n`ntrailer`n<< /Size 4 /Root 1 0 R >>`nstartxref`n206`n%%EOF"
Set-Content -Path $pdfPath -Value $pdfContent -Encoding ASCII
Write-Host "✅ Created test PDF: $pdfPath" -ForegroundColor Green

Write-Host ""
Write-Host "🔍 File Information:" -ForegroundColor Cyan
Get-ChildItem $testDir | ForEach-Object {
    Write-Host "  - $($_.Name): $($_.Length) bytes, MIME type: $(if ($_.Extension -eq '.png') { 'image/png' } elseif ($_.Extension -eq '.jpg') { 'image/jpeg' } else { 'application/pdf' })" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✨ Test files created successfully!" -ForegroundColor Green
Write-Host "Next: Try uploading these files via the web UI at http://localhost:3000/worker-dashboard" -ForegroundColor Yellow
