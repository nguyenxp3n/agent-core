# Agent Core - Skill Installer for Windows (PowerShell)
# Usage:
#   irm https://raw.githubusercontent.com/nguyenxp3n/agent-core/main/install.ps1 | iex
# Or with target parameter:
#   .\install.ps1 -Targets "1,2"

param (
    [string]$Targets = ""
)

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$ErrorActionPreference = "Stop"
$REPO_URL = "https://raw.githubusercontent.com/nguyenxp3n/agent-core/refs/heads/main"
$FILES = @(
    "skills/agent-core/SKILL.md",
    "skills/agent-core/references/principles.md",
    "skills/agent-core/references/execution.md",
    "skills/agent-core/references/verification.md"
)

$HOME_DIR = [Environment]::GetFolderPath("UserProfile")

$AGENTS = @(
    @{
        Id = "1"
        Name = "Claude Code"
        Path = Join-Path $HOME_DIR ".claude\skills\agent-core"
        DetectPath = Join-Path $HOME_DIR ".claude"
    },
    @{
        Id = "2"
        Name = "OpenAI Codex"
        Path = Join-Path $HOME_DIR ".codex\skills\agent-core"
        DetectPath = Join-Path $HOME_DIR ".codex"
    },
    @{
        Id = "3"
        Name = "Google Gemini / AGY"
        Path = Join-Path $HOME_DIR ".gemini\config\skills\agent-core"
        DetectPath = Join-Path $HOME_DIR ".gemini"
    },
    @{
        Id = "4"
        Name = "Cursor Rules"
        Path = Join-Path $HOME_DIR ".cursor\rules\agent-core"
        DetectPath = Join-Path $HOME_DIR ".cursor"
    },
    @{
        Id = "5"
        Name = "Current Workspace"
        Path = ".\skills\agent-core"
        DetectPath = "."
    }
)

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "             AGENT-CORE SKILL INSTALLER               " -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "Scanning system for AI Agent environments..." -ForegroundColor Gray
Write-Host ""

$detectedCount = 0
foreach ($agent in $AGENTS) {
    $exists = Test-Path $agent.DetectPath
    $agent["Detected"] = $exists
    if ($exists -and $agent.Id -ne "5") {
        $detectedCount++
    }
    
    $tag = if ($exists) { "[Detected]" } else { "" }
    $tagColor = if ($exists) { "Green" } else { "DarkGray" }
    
    Write-Host "  [$($agent.Id)] " -NoNewline -ForegroundColor Yellow
    Write-Host "$($agent.Name.PadRight(22)) " -NoNewline -ForegroundColor White
    Write-Host "$($agent.Path.PadRight(45)) " -NoNewline -ForegroundColor DarkGray
    Write-Host $tag -ForegroundColor $tagColor
}

Write-Host "  [6] All detected environments" -ForegroundColor Yellow
Write-Host "  [0] Exit" -ForegroundColor Red
Write-Host ""

if ([string]::IsNullOrWhiteSpace($Targets)) {
    $choice = Read-Host "Choose target(s) [e.g. 1 or 1,2 or 6 for All, 0 to exit]"
} else {
    $choice = $Targets
    Write-Host "Using target(s) from arguments: $choice" -ForegroundColor Gray
}

if ([string]::IsNullOrWhiteSpace($choice) -or $choice.Trim() -eq "0") {
    Write-Host "Installation cancelled." -ForegroundColor Yellow
    exit 0
}

# Parse selected IDs
$selectedIds = @()
if ($choice.Trim() -eq "6" -or $choice.Trim().ToLower() -eq "all") {
    foreach ($agent in $AGENTS) {
        if ($agent.Detected -and $agent.Id -ne "5") {
            $selectedIds += $agent.Id
        }
    }
    if ($selectedIds.Count -eq 0) {
        $selectedIds += "5"
    }
} else {
    $rawTokens = $choice -split "[,;\s]+"
    foreach ($t in $rawTokens) {
        $clean = $t.Trim()
        if ($clean -match "^[1-5]$") {
            if (-not ($selectedIds -contains $clean)) {
                $selectedIds += $clean
            }
        }
    }
}

if ($selectedIds.Count -eq 0) {
    Write-Host "No valid options selected. Exiting." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Installing agent-core skill to $($selectedIds.Count) target(s)..." -ForegroundColor Cyan
Write-Host ""

$localSource = $false
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path -ErrorAction SilentlyContinue
if ($scriptDir -and (Test-Path (Join-Path $scriptDir "skills\agent-core\SKILL.md"))) {
    $localSource = $true
}

foreach ($id in $selectedIds) {
    $targetAgent = $AGENTS | Where-Object { $_.Id -eq $id }
    if (-not $targetAgent) { continue }
    
    $destRoot = $targetAgent.Path
    Write-Host "Installing to $($targetAgent.Name): $destRoot" -ForegroundColor White
    
    $null = New-Item -ItemType Directory -Path (Join-Path $destRoot "references") -Force
    
    $allOk = $true
    foreach ($relFile in $FILES) {
        $fileName = $relFile -replace "^skills/agent-core/", ""
        $destPath = Join-Path $destRoot $fileName
        
        $destDir = Split-Path -Parent $destPath
        if (-not (Test-Path $destDir)) {
            $null = New-Item -ItemType Directory -Path $destDir -Force
        }
        
        try {
            if ($localSource) {
                $sourcePath = Join-Path $scriptDir $relFile
                if ((Test-Path $destPath) -and (Test-Path $sourcePath) -and ((Resolve-Path $destPath).Path -eq (Resolve-Path $sourcePath).Path)) {
                    # File is identical source path, already in place
                } else {
                    Copy-Item $sourcePath -Destination $destPath -Force
                }
            } else {
                $url = "$REPO_URL/$relFile"
                Invoke-RestMethod -Uri $url -OutFile $destPath
            }
            
            if ((Test-Path $destPath) -and (Get-Item $destPath).Length -gt 0) {
                # verified
            } else {
                $allOk = $false
                Write-Host "  x Failed to verify $fileName" -ForegroundColor Red
            }
        } catch {
            $allOk = $false
            Write-Host "  x Error writing $fileName : $_" -ForegroundColor Red
        }
    }
    
    if ($allOk) {
        Write-Host "  [OK] Successfully installed to $($targetAgent.Path)" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] Incomplete installation for $($targetAgent.Name)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Done! agent-core skill is ready to use." -ForegroundColor Green
Write-Host "Restart or refresh your AI assistant to load the new skill." -ForegroundColor Gray
Write-Host ""
