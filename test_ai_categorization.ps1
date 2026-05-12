# Test script to verify AI categorization improvements

Write-Host "Testing AI Category Detection..." -ForegroundColor Green
Write-Host "=" * 60

# Test cases
$testCases = @(
    @{ desc = "power shut down in my apartment"; expected = "Electrical" },
    @{ desc = "water leakage from ceiling"; expected = "Plumbing" },
    @{ desc = "garbage not being picked up"; expected = "Cleaning" },
    @{ desc = "loud music from neighbors"; expected = "Noise" },
    @{ desc = "car blocking my parking space"; expected = "Parking" },
    @{ desc = "broken door lock"; expected = "Security" },
    @{ desc = "crack in the wall needs repair"; expected = "Maintenance" },
    @{ desc = "electrical outlet spark"; expected = "Electrical" },
    @{ desc = "no power in my flat"; expected = "Electrical" },
    @{ desc = "blackout in the building"; expected = "Electrical" }
)

$passed = 0
$failed = 0

foreach ($test in $testCases) {
    $json = @{ description = $test.desc } | ConvertTo-Json
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/predict-category" `
            -Method POST -Body $json -ContentType "application/json" -UseBasicParsing
        $result = $response.Content | ConvertFrom-Json
        $category = $result.category
        
        if ($category -eq $test.expected) {
            Write-Host "✓ PASS: '$($test.desc)'" -ForegroundColor Green
            Write-Host "  → Detected as: $category" -ForegroundColor Cyan
            $passed++
        } else {
            Write-Host "✗ FAIL: '$($test.desc)'" -ForegroundColor Red
            Write-Host "  Expected: $($test.expected), Got: $category" -ForegroundColor Yellow
            $failed++
        }
    } catch {
        Write-Host "✗ ERROR: '$($test.desc)'" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Yellow
        $failed++
    }
}

Write-Host "=" * 60
Write-Host "Priority Detection Test:" -ForegroundColor Green

# Test priority detection
$priorityTests = @(
    @{ title = "Electrical fire"; desc = "fire from outlet"; expected = "HIGH" },
    @{ title = "Water leak"; desc = "small water drip"; expected = "MEDIUM" },
    @{ title = "Emergency"; desc = "flood in apartment"; expected = "HIGH" }
)

$priorityPassed = 0
$priorityFailed = 0

foreach ($test in $priorityTests) {
    $json = @{ title = $test.title; description = $test.desc; category = "" } | ConvertTo-Json
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/analyze" `
            -Method POST -Body $json -ContentType "application/json" -UseBasicParsing
        $result = $response.Content | ConvertFrom-Json
        
        if ($result.priority -eq $test.expected) {
            Write-Host "✓ PASS: '$($test.title)'" -ForegroundColor Green
            Write-Host "  → Priority: $($result.priority), Category: $($result.category)" -ForegroundColor Cyan
            $priorityPassed++
        } else {
            Write-Host "✗ FAIL: '$($test.title)'" -ForegroundColor Red
            Write-Host "  Expected: $($test.expected), Got: $($result.priority)" -ForegroundColor Yellow
            $priorityFailed++
        }
    } catch {
        Write-Host "✗ ERROR: '$($test.title)'" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Yellow
        $priorityFailed++
    }
}

Write-Host "=" * 60
Write-Host "Test Summary:" -ForegroundColor Cyan
$categoryColor = if($failed -eq 0) { 'Green' } else { 'Red' }
$priorityColor = if($priorityFailed -eq 0) { 'Green' } else { 'Red' }
Write-Host "Category Tests: $passed PASSED, $failed FAILED" -ForegroundColor $categoryColor
Write-Host "Priority Tests: $priorityPassed PASSED, $priorityFailed FAILED" -ForegroundColor $priorityColor
