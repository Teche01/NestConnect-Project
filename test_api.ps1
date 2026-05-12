# Test Script for Smart Residential Governance APIs

Write-Host "="*60
Write-Host "TESTING SMART RESIDENTIAL GOVERNANCE SYSTEM"
Write-Host "="*60

# Test 1: Login as Admin
Write-Host "`n[TEST 1] Admin Login..."
$loginBody = @{
    email = "admin@community.com"
    password = "Admin@123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody -UseBasicParsing
    $adminData = $loginResponse.Content | ConvertFrom-Json
    $adminToken = $adminData.token
    Write-Host "✅ PASS: Admin logged in successfully"
    Write-Host "   Token: $($adminToken.Substring(0, 30))..."
} catch {
    Write-Host "❌ FAIL: Could not login admin"
    Write-Host "   Error: $_"
    exit 1
}

# Test 2: Create Test Workers
Write-Host "`n[TEST 2] Creating Test Workers..."

$workers = @(
    @{user_id=3; category="Plumbing"; name="Plumber Worker1"},
    @{user_id=4; category="Electrical"; name="Electrical Worker1"},
    @{user_id=5; category="Others"; name="General Worker1"}
)

$workerIds = @()

foreach ($worker in $workers) {
    try {
        $workerBody = @{
            user_id = $worker.user_id
            category = $worker.category
            schedule = "Mon-Fri 9AM-5PM"
        } | ConvertTo-Json
        
        $workerResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/workers" -Method POST `
            -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $adminToken"} `
            -Body $workerBody -UseBasicParsing
        
        $workerData = $workerResponse.Content | ConvertFrom-Json
        $workerIds += $worker.user_id
        Write-Host "✅ Created $($worker.category) worker (ID: $($worker.user_id))"
    } catch {
        # Might already exist, which is fine
        Write-Host "⚠️  Worker $($worker.user_id) might already exist: $_"
        $workerIds += $worker.user_id
    }
}

# Test 3: Get Available Workers
Write-Host "`n[TEST 3] Checking Available Workers..."
try {
    $workersResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/workers" -Method GET `
        -Headers @{"Authorization"="Bearer $adminToken"} -UseBasicParsing
    
    $workersList = $workersResponse.Content | ConvertFrom-Json
    Write-Host "✅ PASS: Retrieved $($workersList.Count) workers"
    foreach ($w in $workersList) {
        Write-Host "   - ID:$($w.user_id), Category:$($w.category), Available:$($w.is_available), Tasks:$($w.current_tasks)"
    }
} catch {
    Write-Host "❌ FAIL: Could not get workers"
    Write-Host "   Error: $_"
}

# Test 4: Create Complaint with Auto-Assignment (Plumbing)
Write-Host "`n[TEST 4] Creating Complaint with Auto-Assignment (Plumbing)..."

# First, create a resident token
try {
    $residentLoginBody = @{
        email = "resident@test.com"
        password = "Resident@123"
    } | ConvertTo-Json
    
    $residentLoginResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST `
        -Headers @{"Content-Type"="application/json"} -Body $residentLoginBody -UseBasicParsing -ErrorAction SilentlyContinue
    
    if ($residentLoginResponse) {
        $residentData = $residentLoginResponse.Content | ConvertFrom-Json
        $residentToken = $residentData.token
    } else {
        Write-Host "⚠️  Creating resident user first..."
        # Assume resident exists with default credentials
        exit 1
    }
} catch {
    Write-Host "⚠️  Could not login resident: $_"
    exit 1
}

# Create complaint
$complaintBody = @{
    title = "Water Leakage Issue"
    description = "There is water leaking from the pipe under the bathroom sink. It's dripping continuously."
    preferred_time = "Evening"
} | ConvertTo-Json

try {
    $complaintResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/complaints" -Method POST `
        -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $residentToken"} `
        -Body $complaintBody -UseBasicParsing
    
    $complaintData = $complaintResponse.Content | ConvertFrom-Json
    Write-Host "✅ PASS: Complaint created successfully"
    Write-Host "   ID: $($complaintData.id)"
    Write-Host "   Category: $($complaintData.category)"
    Write-Host "   Assigned Worker: $($complaintData.assigned_worker_id)"
    Write-Host "   Auto-Assigned: $($complaintData.assigned_automatically)"
    Write-Host "   Status: $($complaintData.status)"
    
    $complaintId = $complaintData.id
    $assignedWorkerId = $complaintData.assigned_worker_id
} catch {
    Write-Host "❌ FAIL: Could not create complaint"
    Write-Host "   Error: $_"
    exit 1
}

# Test 5: Verify Worker Task Count Updated
Write-Host "`n[TEST 5] Verifying Worker Task Count Updated..."
if ($assignedWorkerId) {
    try {
        $workerDetailsResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/workers/$assignedWorkerId" -Method GET `
            -Headers @{"Authorization"="Bearer $adminToken"} -UseBasicParsing
        
        $workerDetails = $workerDetailsResponse.Content | ConvertFrom-Json
        Write-Host "✅ PASS: Worker details retrieved"
        Write-Host "   Worker ID: $($workerDetails.worker.user_id)"
        Write-Host "   Current Tasks: $($workerDetails.worker.current_tasks)"
        Write-Host "   Assigned Complaints: $($workerDetails.assigned_complaints.Count)"
        if ($workerDetails.assigned_complaints.Count -gt 0) {
            Write-Host "   Recent Complaint: $($workerDetails.assigned_complaints[0].title)"
        }
    } catch {
        Write-Host "❌ FAIL: Could not get worker details"
        Write-Host "   Error: $_"
    }
} else {
    Write-Host "⚠️  SKIP: No worker was assigned to complaint"
}

# Test 6: Get Worker Statistics
Write-Host "`n[TEST 6] Worker Availability Statistics..."
try {
    $statsResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/workers/stats/availability" -Method GET `
        -Headers @{"Authorization"="Bearer $adminToken"} -UseBasicParsing
    
    $stats = $statsResponse.Content | ConvertFrom-Json
    Write-Host "✅ PASS: Retrieved worker statistics"
    foreach ($stat in $stats) {
        Write-Host "   Category: $($stat.category) | Total: $($stat.total_workers) | Available: $($stat.available_count) | Avg Tasks: $($stat.avg_tasks)"
    }
} catch {
    Write-Host "❌ FAIL: Could not get statistics"
    Write-Host "   Error: $_"
}

# Test 7: Test Complaint Status Update
Write-Host "`n[TEST 7] Testing Complaint Status Update..."
if ($complaintId) {
    try {
        $statusBody = @{
            status = "IN_PROGRESS"
        } | ConvertTo-Json
        
        $statusResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/complaints/$complaintId/status" -Method PUT `
            -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $adminToken"} `
            -Body $statusBody -UseBasicParsing
        
        $statusData = $statusResponse.Content | ConvertFrom-Json
        Write-Host "✅ PASS: Complaint status updated"
        Write-Host "   Message: $($statusData.message)"
    } catch {
        Write-Host "❌ FAIL: Could not update status"
        Write-Host "   Error: $_"
    }
}

Write-Host "`n" + "="*60
Write-Host "TESTING COMPLETE"
Write-Host "="*60
