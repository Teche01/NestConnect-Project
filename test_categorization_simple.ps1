# Simple test for AI categorization improvement
Write-Host "Testing AI Category Detection..." -ForegroundColor Green
Write-Host "=============================================="

# Test 1: Power shut down
$json = @{ description = "power shut down in my apartment" } | ConvertTo-Json
$response = Invoke-WebRequest -Uri "http://localhost:8000/predict-category" -Method POST -Body $json -ContentType "application/json" -UseBasicParsing
$result = $response.Content | ConvertFrom-Json
Write-Host "Test 1 - Power shut down: $($result.category)" -ForegroundColor Cyan

# Test 2: Water leakage  
$json = @{ description = "water leakage from ceiling" } | ConvertTo-Json
$response = Invoke-WebRequest -Uri "http://localhost:8000/predict-category" -Method POST -Body $json -ContentType "application/json" -UseBasicParsing
$result = $response.Content | ConvertFrom-Json
Write-Host "Test 2 - Water leakage: $($result.category)" -ForegroundColor Cyan

# Test 3: Garbage cleanup
$json = @{ description = "garbage not being picked up from dustbin area" } | ConvertTo-Json
$response = Invoke-WebRequest -Uri "http://localhost:8000/predict-category" -Method POST -Body $json -ContentType "application/json" -UseBasicParsing
$result = $response.Content | ConvertFrom-Json
Write-Host "Test 3 - Garbage cleanup: $($result.category)" -ForegroundColor Cyan

# Test 4: Noise complaint
$json = @{ description = "loud music from neighbors apartment at night" } | ConvertTo-Json
$response = Invoke-WebRequest -Uri "http://localhost:8000/predict-category" -Method POST -Body $json -ContentType "application/json" -UseBasicParsing
$result = $response.Content | ConvertFrom-Json
Write-Host "Test 4 - Noise complaint: $($result.category)" -ForegroundColor Cyan

# Test 5: Parking issue
$json = @{ description = "car blocking my parking space" } | ConvertTo-Json
$response = Invoke-WebRequest -Uri "http://localhost:8000/predict-category" -Method POST -Body $json -ContentType "application/json" -UseBasicParsing
$result = $response.Content | ConvertFrom-Json
Write-Host "Test 5 - Parking issue: $($result.category)" -ForegroundColor Cyan

# Test 6: Broken lock (Security)
$json = @{ description = "broken door lock cannot open" } | ConvertTo-Json
$response = Invoke-WebRequest -Uri "http://localhost:8000/predict-category" -Method POST -Body $json -ContentType "application/json" -UseBasicParsing
$result = $response.Content | ConvertFrom-Json
Write-Host "Test 6 - Broken lock: $($result.category)" -ForegroundColor Cyan

# Test 7: Wall crack (Maintenance)
$json = @{ description = "crack in the wall needs repair" } | ConvertTo-Json
$response = Invoke-WebRequest -Uri "http://localhost:8000/predict-category" -Method POST -Body $json -ContentType "application/json" -UseBasicParsing
$result = $response.Content | ConvertFrom-Json
Write-Host "Test 7 - Wall crack: $($result.category)" -ForegroundColor Cyan

# Test 8: No power (HIGH priority)
Write-Host "=============================================="
Write-Host "Testing Priority Detection..." -ForegroundColor Green
$json = @{ title = "No power in apartment"; description = "no power in my flat"; category = "" } | ConvertTo-Json
$response = Invoke-WebRequest -Uri "http://localhost:8000/analyze" -Method POST -Body $json -ContentType "application/json" -UseBasicParsing
$result = $response.Content | ConvertFrom-Json
Write-Host "Test 8 - No power: Category=$($result.category), Priority=$($result.priority)" -ForegroundColor Cyan

# Test 9: Fire (HIGH priority)
$json = @{ title = "Electrical fire"; description = "there is a fire coming from the electrical outlet"; category = "" } | ConvertTo-Json
$response = Invoke-WebRequest -Uri "http://localhost:8000/analyze" -Method POST -Body $json -ContentType "application/json" -UseBasicParsing
$result = $response.Content | ConvertFrom-Json
Write-Host "Test 9 - Fire: Category=$($result.category), Priority=$($result.priority)" -ForegroundColor Cyan

Write-Host "=============================================="
Write-Host "All tests completed!" -ForegroundColor Green
