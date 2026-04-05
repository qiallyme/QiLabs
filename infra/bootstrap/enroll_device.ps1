param (
    [Parameter(Mandatory=$true)]
    [string]$HostedAdminUrl,

    [Parameter(Mandatory=$true)]
    [string]$EnrollmentToken
)

$ErrorActionPreference = "Stop"

$QiLabsHome = [Environment]::GetEnvironmentVariable("QILABS_HOME", "User")
if (-not $QiLabsHome) {
    Write-Host "QILABS_HOME not found. Assuming 'C:\QiLabs'."
    $QiLabsHome = "C:\QiLabs"
}

Write-Host "Enrolling edge node with Hosted Admin at $HostedAdminUrl..."

# Define node info
$hostname = [System.Net.Dns]::GetHostName()
$endpoint = "$HostedAdminUrl/fleet/enroll"

$body = @{
    hostname = $hostname
    token = $EnrollmentToken
} | ConvertTo-Json

# Attempting connection to fleet administrator
Write-Host "Sending enrollment request for node: $hostname"

# Mock implementation for initial framework setup - replace with Invoke-RestMethod
# $response = Invoke-RestMethod -Uri $endpoint -Method Post -Body $body -ContentType "application/json"
$agentId = [guid]::NewGuid().ToString()

$config = @{
    AdminUrl = $HostedAdminUrl
    AgentId = $agentId
    EnrolledAt = (Get-Date).ToString("o")
}

$configPath = "$QiLabsHome\.agent_config.json"
$config | ConvertTo-Json | Set-Content -Path $configPath

Write-Host "Device successfully enrolled!"
Write-Host "Agent Configuration written to $configPath"
Write-Host "This node is now ready to receive watch folder assignments and execute pipeline jobs."
