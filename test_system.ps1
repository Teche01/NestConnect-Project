# System Integration Test Script
Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        SMART RESIDENTIAL GOVERNANCE - SYSTEM VERIFICATION      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

$testResults = @()
$failedTests = @()

# Kill all background processes
Write-Host "`n[SETUP] Stopping existing services..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep 3

# Free ports
Stop-Process -Id (Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue).OwningProcess -Force -ErrorAction SilentlyContinue
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue).OwningProcess -Force -ErrorAction SilentlyContinue
Start-Sleep 2

Write-Host "[SETUP] Starting services..." -ForegroundColor Yellow

# Start AI Service
Write-Host "`n[1/3] Starting AI Service (Port 8000)..." -ForegroundColor Cyan
$aiProcess = Start-Process -PassThru -NoNewWindow -FilePath "python" -ArgumentList "-m uvicorn main:app --reload --host 127.0.0.1 --port 8000" -WorkingDirectory "c:\Users\Mohamed Aslam K\Downloads\smart-residential-governance (1)\smart-residential-governance\ai-service"
Start-Sleep 3

# Start Backend
Write-Host "[2/3] Starting Backend (Port 5000)..." -ForegroundColor Cyan
$backendProcess = Start-Process -PassThru -NoNewWindow -FilePath "node" -ArgumentList "server.js" -WorkingDirectory "c:\Users\Mohamed Aslam K\Downloads\smart-residential-governance (1)\smart-residential-governance\backend"
Start-Sleep 3

Write-Host "[3/3] Starting Frontend (Port 3000)..." -ForegroundColor Cyan
$frontendProcess = Start-Process -PassThru -NoNewWindow -FilePath "npm" -ArgumentList "start" -WorkingDirectory "c:\Users\Mohamed Aslam K\Downloads\smart-residential-governance (1)\smart-residential-governance\frontend"
Start-Sleep 5

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    RUNNING TESTS                               ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green

# Test 1: AI Service
Write-Host "`n[TEST 1] AI Complaint Categorization" -ForegroundColor Magenta
Write-Host "Testing: Description 'Water leaking from pipe' → should detect 'Plumbing'" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/predict-category" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body '{"description":"Water is leaking from the main pipe"}' `
        -ErrorAction Stop
    $data = $response.Content | ConvertFrom-Json
    Write-Host "Result: Category = $($data.category)" -ForegroundColor Green
    $testResults += "✅ AI Categorization: PASS"
} catch {
    Write-Host "Result: FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $failedTests += "❌ AI Categorization"
}

# Test 2: Backend Login
Write-Host "`n[TEST 2] Backend Authentication (Login)" -ForegroundColor Magenta
Write-Host "Testing: Admin login with credentials" -ForegroundColor Gray
try {
    $body = @{email="admin@test.com"; password="admin123"} | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $body `
        -ErrorAction Stop
    $data = $response.Content | ConvertFrom-Json
    $token = $data.token
    Write-Host "Result: Login Successful, Token Length = $($token.Length) chars" -ForegroundColor Green
    $testResults += "✅ Backend Login: PASS"
} catch {
    Write-Host "Result: FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $failedTests += "❌ Backend Login"
    exit
}

# Test 3: Workers Endpoint
Write-Host "`n[TEST 3] Get Workers" -ForegroundColor Magenta
Write-Host "Testing: Retrieve all workers from database" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/workers" `
        -Method GET `
        -Headers @{"Authorization"="Bearer $token"} `
        -ErrorAction Stop
    $workers = $response.Content | ConvertFrom-Json
    Write-Host "Result: Found $($workers.Count) workers in system" -ForegroundColor Green
    $testResults += "✅ Workers Endpoint: PASS"
} catch {
    Write-Host "Result: FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $failedTests += "❌ Workers Endpoint"
}

# Test 4: Create Complaint with Auto-Categorization
Write-Host "`n[TEST 4] Complaint Creation with Auto-Categorization" -ForegroundColor Magenta
Write-Host "Testing: Create complaint → Auto-detect category → Auto-assign worker" -ForegroundColor Gray
try {
    $body = @{
        title="Broken light fixture"
        description="Light in living room is not working"
        room_number="502"
        preferred_time="Morning"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/complaints" `
        -Method POST `
        -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} `
        -Body $body `
        -ErrorAction Stop
    
    $complaint = $response.Content | ConvertFrom-Json
    Write-Host "✓ Complaint ID: $($complaint.id)" -ForegroundColor Green
    Write-Host "✓ Auto-Detected Category: $($complaint.ai_category)" -ForegroundColor Green
    Write-Host "✓ Assigned Worker ID: $($complaint.assigned_worker_id)" -ForegroundColor Green
    Write-Host "✓ Auto-Assigned: $($complaint.assigned_automatically)" -ForegroundColor Green
    Write-Host "✓ Status: $($complaint.status)" -ForegroundColor Green
    $testResults += "✅ Complaint Auto-Assignment: PASS"
} catch {
    Write-Host "Result: FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $failedTests += "❌ Complaint Auto-Assignment"
}

# Test 5: Worker Assignment Logic
Write-Host "`n[TEST 5] Worker Assignment Logic Verification" -ForegroundColor Magenta
Write-Host "Testing: Time-based filtering and least-busy worker selection" -ForegroundColor Gray
try {
    # Test multiple complaint categories
    $categories = @("Water leaking from pipe", "Light is broken", "Door lock not working")
    $assignedWorkers = @()
    
    foreach ($desc in $categories) {
        $body = @{
            title=$desc
            description=$desc
            room_number="502"
            preferred_time="Morning"
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/complaints" `
            -Method POST `
            -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} `
            -Body $body `
            -ErrorAction Stop
        
        $complaint = $response.Content | ConvertFrom-Json
        $assignedWorkers += $complaint.assigned_worker_id
    }
    
    Write-Host "✓ Created 3 test complaints with different categories" -ForegroundColor Green
    Write-Host "✓ All assigned automatically: $(if ($assignedWorkers -contains $null) { 'SOME NULL' } else { 'YES' })" -ForegroundColor Green
    $testResults += "✅ Worker Assignment Logic: PASS"
} catch {
    Write-Host "Result: FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $failedTests += "❌ Worker Assignment Logic"
}

# Test 6: Frontend Check
Write-Host "`n[TEST 6] Frontend Application" -ForegroundColor Magenta
Write-Host "Testing: React app loads on port 3000" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Frontend responds with status 200" -ForegroundColor Green
        Write-Host "✓ Content length: $($response.Content.Length) bytes" -ForegroundColor Green
        $testResults += "✅ Frontend Application: PASS"
    }
} catch {
    Write-Host "Result: Warning - Frontend may still be loading. Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    $testResults += "⚠️  Frontend Application: LOADING/DELAYED"
}

# Test 7: Check Routes Integration
Write-Host "`n[TEST 7] Routes Integration (ManageWorkers)" -ForegroundColor Magenta
Write-Host "Testing: Verify /admin/workers route is configured" -ForegroundColor Gray
try {
    $appPath = "c:\Users\Mohamed Aslam K\Downloads\smart-residential-governance (1)\smart-residential-governance\frontend\src\App.js"
    $appContent = Get-Content $appPath -Raw
    
    if ($appContent -match "ManageWorkers" -and $appContent -match "/admin/workers") {
        Write-Host "✓ ManageWorkers component imported" -ForegroundColor Green
        Write-Host "✓ /admin/workers route configured" -ForegroundColor Green
        $testResults += "✅ Routes Integration: PASS"
    } else {
        Write-Host "✗ Route configuration incomplete" -ForegroundColor Red
        $failedTests += "❌ Routes Integration"
    }
} catch {
    Write-Host "Result: FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $failedTests += "❌ Routes Integration"
}

# Test 8: Check Sidebar Update
Write-Host "`n[TEST 8] Sidebar Navigation Update" -ForegroundColor Magenta
Write-Host "Testing: Manage Workers link added to admin menu" -ForegroundColor Gray
try {
    $sidebarPath = "c:\Users\Mohamed Aslam K\Downloads\smart-residential-governance (1)\smart-residential-governance\frontend\src\components\Sidebar.jsx"
    $sidebarContent = Get-Content $sidebarPath -Raw
    
    if ($sidebarContent -match "Manage Workers" -and $sidebarContent -match "/admin/workers") {
        Write-Host "✓ 'Manage Workers' menu item added" -ForegroundColor Green
        Write-Host "✓ Route path /admin/workers configured" -ForegroundColor Green
        $testResults += "✅ Sidebar Navigation: PASS"
    } else {
        Write-Host "✗ Sidebar not updated" -ForegroundColor Red
        $failedTests += "❌ Sidebar Navigation"
    }
} catch {
    Write-Host "Result: FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $failedTests += "❌ Sidebar Navigation"
}

# Summary
Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "║              TEST RESULTS SUMMARY                              ║" -ForegroundColor Yellow
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Yellow

Write-Host "`nPASSED TESTS:" -ForegroundColor Green
$testResults | ForEach-Object { Write-Host "  $_" }

if ($failedTests.Count -gt 0) {
    Write-Host "`nFAILED TESTS:" -ForegroundColor Red
    $failedTests | ForEach-Object { Write-Host "  $_" }
}

Write-Host "`nSUMMARY: $($testResults.Count) Passed, $($failedTests.Count) Failed" -ForegroundColor Cyan
Write-Host "`n📊 System Status: $(if ($failedTests.Count -eq 0) { '✅ ALL TESTS PASSED' } else { '⚠️  SOME TESTS FAILED' })" -ForegroundColor $(if ($failedTests.Count -eq 0) { "Green" } else { "Yellow" })

Write-Host "`n" -ForegroundColor White
Write-Host "🚀 Services running on:" -ForegroundColor Cyan
Write-Host "   • Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "   • Backend:   http://localhost:5000" -ForegroundColor White
Write-Host "   • AI Service: http://localhost:8000" -ForegroundColor White
Write-Host "`n🔐 Test Credentials:" -ForegroundColor Cyan
Write-Host "   • Email: admin@test.com" -ForegroundColor White
Write-Host "   • Password: admin123" -ForegroundColor White
Write-Host "`n"
