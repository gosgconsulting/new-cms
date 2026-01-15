$apiKey = "tenant_tenant-8361048f_ed0358132ef040228240b6af70613d19"
$baseUrl = "http://localhost:4173/api/woocommerce/sync/products"

$totalCreated = 0
$totalUpdated = 0
$totalSkipped = 0

for ($page = 2; $page -le 8; $page++) {
    Write-Host "[testing] Syncing page $page..."
    
    $body = @{
        page = $page
        per_page = 50
        status = 'publish'
    } | ConvertTo-Json
    
    try {
        $result = Invoke-RestMethod -Uri $baseUrl -Method Post -Headers @{
            "X-API-Key" = $apiKey
            "Content-Type" = "application/json"
        } -Body $body
        
        $totalCreated += $result.data.created
        $totalUpdated += $result.data.updated
        $totalSkipped += $result.data.skipped
        
        Write-Host "[testing] Page $page : Created=$($result.data.created), Updated=$($result.data.updated), Skipped=$($result.data.skipped)"
        
        Start-Sleep -Milliseconds 1000
    } catch {
        Write-Host "[testing] Error on page $page : $_"
        break
    }
}

Write-Host "[testing] Total: Created=$totalCreated, Updated=$totalUpdated, Skipped=$totalSkipped"
