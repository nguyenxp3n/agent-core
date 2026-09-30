# Agent Core - Skill & Plugin Installer for Windows (PowerShell)
# Usage:
#   irm https://raw.githubusercontent.com/nguyenxp3n/agent-core/refs/heads/main/install.ps1 | iex
# Or with target parameter:
#   .\install.ps1 -Targets "1,2"
#   .\install.ps1 -All

param (
    [string]$Targets = "",
    [switch]$All
)

if ($All) {
    $Targets = "7"
}

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$ErrorActionPreference = "Stop"
$REPO_URL = "https://raw.githubusercontent.com/nguyenxp3n/agent-core/refs/heads/main"
$SKILL_FILES = @(
    "skills/agent-core/SKILL.md",
    "skills/agent-core/references/principles.md",
    "skills/agent-core/references/execution.md",
    "skills/agent-core/references/verification.md"
)
$MCP_FILES = @(
    "mcp/server.js",
    "mcp/package.json",
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
        Type = "skill"
    },
    @{
        Id = "2"
        Name = "OpenAI Codex"
        Path = Join-Path $HOME_DIR ".codex\skills\agent-core"
        DetectPath = Join-Path $HOME_DIR ".codex"
        Type = "skill"
    },
    @{
        Id = "3"
        Name = "Google Gemini / AGY"
        Path = Join-Path $HOME_DIR ".gemini\config\skills\agent-core"
        DetectPath = Join-Path $HOME_DIR ".gemini"
        Type = "skill"
    },
    @{
        Id = "4"
        Name = "Cursor Rules"
        Path = Join-Path $HOME_DIR ".cursor\rules\agent-core"
        DetectPath = Join-Path $HOME_DIR ".cursor"
        Type = "skill"
    },
    @{
        Id = "5"
        Name = "Current Workspace"
        Path = ".\skills\agent-core"
        DetectPath = "."
        Type = "skill"
    },
    @{
        Id = "6"
        Name = "Claude Desktop (MCP)"
        Path = Join-Path $HOME_DIR ".agent-core\mcp"
        DetectPath = Join-Path $env:APPDATA "Claude"
        Type = "mcp"
    }
)

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "          AGENT-CORE SKILL & PLUGIN INSTALLER         " -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "Scanning system for AI Agent & Client environments..." -ForegroundColor Gray
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
    Write-Host "$($agent.Name.PadRight(24)) " -NoNewline -ForegroundColor White
    Write-Host "$($agent.Path.PadRight(43)) " -NoNewline -ForegroundColor DarkGray
    Write-Host $tag -ForegroundColor $tagColor
}

Write-Host "  [7] All detected environments" -ForegroundColor Yellow
Write-Host "  [0] Exit" -ForegroundColor Red
Write-Host ""

if ([string]::IsNullOrWhiteSpace($Targets)) {
    $choice = Read-Host "Choose target(s) [e.g. 1 or 1,2 or 7 for All, 0 to exit]"
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
if ($choice.Trim() -eq "7" -or $choice.Trim().ToLower() -eq "all") {
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
        if ($clean -match "^[1-6]$") {
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
Write-Host "Installing Agent Core to $($selectedIds.Count) target(s)..." -ForegroundColor Cyan
Write-Host ""

$localSource = $false
$scriptDir = $null
if ($MyInvocation -and $MyInvocation.MyCommand -and $MyInvocation.MyCommand.Path) {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path -ErrorAction SilentlyContinue
    if ($scriptDir -and (Test-Path (Join-Path $scriptDir "skills\agent-core\SKILL.md"))) {
        $localSource = $true
    }
}

foreach ($id in $selectedIds) {
    $targetAgent = $AGENTS | Where-Object { $_.Id -eq $id }
    if (-not $targetAgent) { continue }
    
    $destRoot = $targetAgent.Path
    Write-Host "Installing to $($targetAgent.Name)..." -ForegroundColor White
    
    $fileList = if ($targetAgent.Type -eq "mcp") { $MCP_FILES } else { $SKILL_FILES }
    $prefix = if ($targetAgent.Type -eq "mcp") { "" } else { "skills/agent-core/" }
    
    $allOk = $true
    foreach ($relFile in $fileList) {
        $fileName = if ($targetAgent.Type -eq "mcp") {
            $relFile -replace "^(skills/agent-core/|mcp/)", ""
        } else {
            $relFile -replace "^skills/agent-core/", ""
        }
        $destPath = Join-Path $destRoot $fileName
        
        $destDir = Split-Path -Parent $destPath
        if (-not (Test-Path $destDir)) {
            $null = New-Item -ItemType Directory -Path $destDir -Force
        }
        
        try {
            if ($localSource) {
                $sourcePath = Join-Path $scriptDir $relFile
                if ((Test-Path $destPath) -and (Test-Path $sourcePath) -and ((Resolve-Path $destPath).Path -eq (Resolve-Path $sourcePath).Path)) {
                    # identical path
                } else {
                    Copy-Item $sourcePath -Destination $destPath -Force
                }
            } else {
                $url = "$REPO_URL/$relFile"
                Invoke-RestMethod -Uri $url -OutFile $destPath
            }
            
            if (-not ((Test-Path $destPath) -and (Get-Item $destPath).Length -gt 0)) {
                $allOk = $false
                Write-Host "  x Failed to verify $fileName" -ForegroundColor Red
            }
        } catch {
            $allOk = $false
            Write-Host "  x Error writing $fileName : $_" -ForegroundColor Red
        }
    }
    
    # If target is Claude Desktop MCP, register into claude_desktop_config.json
    if ($targetAgent.Type -eq "mcp") {
        try {
            $configPath = Join-Path $env:APPDATA "Claude\claude_desktop_config.json"
            $configDir = Split-Path -Parent $configPath
            if (-not (Test-Path $configDir)) {
                $null = New-Item -ItemType Directory -Path $configDir -Force
            }
            
            $cfg = @{}
            if (Test-Path $configPath) {
                try {
                    $jsonStr = Get-Content $configPath -Raw
                    if ($jsonStr.Trim()) { $cfg = $jsonStr | ConvertFrom-Json -AsHashtable }
                } catch {}
            }
            if (-not $cfg["mcpServers"]) {
                $cfg["mcpServers"] = @{}
            }
            
            $serverJsPath = (Join-Path $destRoot "server.js").Replace("\", "/")
            $cfg["mcpServers"]["agent-core"] = @{
                command = "node"
                args = @($serverJsPath)
            }
            
            $cfg | ConvertTo-Json -Depth 10 | Set-Content $configPath -Encoding UTF8
            Write-Host "  [OK] Registered MCP server in $configPath" -ForegroundColor Green
        } catch {
            Write-Host "  [WARN] Could not update Claude Desktop config: $_" -ForegroundColor Yellow
        }
    }
    
    if ($allOk) {
        Write-Host "  [OK] Successfully installed to $($targetAgent.Path)" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] Incomplete installation for $($targetAgent.Name)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Done! Agent Core is ready to use." -ForegroundColor Green
Write-Host "Restart or refresh your AI assistant / Claude Desktop to load changes." -ForegroundColor Gray
Write-Host ""
