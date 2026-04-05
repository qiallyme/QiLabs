$ErrorActionPreference = "Stop"

$QiLabsHome = "C:\QiLabs"
Write-Host "Setting up QiLabs at $QiLabsHome..."

# Folders to create
$folders = @(
    "$QiLabsHome\QiData\inbox",
    "$QiLabsHome\QiData\processing",
    "$QiLabsHome\QiData\reviewed",
    "$QiLabsHome\QiData\failed",
    "$QiLabsHome\QiData\manifests",
    "$QiLabsHome\QiData\extracted_text",
    "$QiLabsHome\QiData\embeddings_cache",
    "$QiLabsHome\QiData\logs",
    "$QiLabsHome\QiData\model_cache",
    "$QiLabsHome\_QiOne_MonoRepo"
)

foreach ($folder in $folders) {
    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
        Write-Host "Created $folder"
    } else {
        Write-Host "$folder already exists"
    }
}

# Set Environment Variable
[Environment]::SetEnvironmentVariable("QILABS_HOME", $QiLabsHome, "User")
Write-Host "Environment variable QILABS_HOME set to $QiLabsHome"

Write-Host "QiLabs installation complete!"
Write-Host "Next Step: run enroll_device.ps1 to authenticate with Hosted Admin."
