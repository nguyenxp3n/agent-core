#!/usr/bin/env bash
# Agent Core - Skill & Plugin Installer for Linux / macOS / WSL
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/nguyenxp3n/agent-core/refs/heads/main/install.sh | bash
# Or with target argument:
#   ./install.sh 1,2
#   ./install.sh --all

set -e

REPO_URL="https://raw.githubusercontent.com/nguyenxp3n/agent-core/refs/heads/main"
SKILL_FILES=(
  "skills/agent-core/SKILL.md"
  "skills/agent-core/references/principles.md"
  "skills/agent-core/references/execution.md"
  "skills/agent-core/references/verification.md"
)
MCP_FILES=(
  "mcp/server.js"
  "mcp/package.json"
  "skills/agent-core/references/principles.md"
  "skills/agent-core/references/execution.md"
  "skills/agent-core/references/verification.md"
)

HOME_DIR="${HOME:-~}"

# Claude Desktop config path by OS
if [ "$(uname)" = "Darwin" ]; then
  CLAUDE_CONFIG_DIR="$HOME_DIR/Library/Application Support/Claude"
else
  CLAUDE_CONFIG_DIR="$HOME_DIR/.config/Claude"
fi

echo ""
echo "======================================================"
echo "          AGENT-CORE SKILL & PLUGIN INSTALLER         "
echo "======================================================"
echo "Scanning system for AI Agent & Client environments..."
echo ""

# ID|Name|Path|DetectDir|Type
TARGETS=(
  "1|Claude Code|$HOME_DIR/.claude/skills/agent-core|$HOME_DIR/.claude|skill"
  "2|OpenAI Codex|$HOME_DIR/.codex/skills/agent-core|$HOME_DIR/.codex|skill"
  "3|Google Gemini / AGY|$HOME_DIR/.gemini/config/skills/agent-core|$HOME_DIR/.gemini|skill"
  "4|Cursor Rules|$HOME_DIR/.cursor/rules/agent-core|$HOME_DIR/.cursor|skill"
  "5|Current Workspace|./skills/agent-core|.|skill"
  "6|Claude Desktop (MCP)|$HOME_DIR/.agent-core/mcp|$CLAUDE_CONFIG_DIR|mcp"
)

for target in "${TARGETS[@]}"; do
  IFS="|" read -r id name path detect type <<< "$target"
  if [ -d "$detect" ]; then
    tag="[Detected]"
  else
    tag=""
  fi
  printf "  [%s] %-24s %-43s %s\n" "$id" "$name" "$path" "$tag"
done

echo "  [7] All detected environments"
echo "  [0] Exit"
echo ""

if [ -n "$1" ]; then
  choice="$1"
  if [ "$choice" = "--all" ] || [ "$choice" = "-a" ]; then
    choice="7"
  fi
  echo "Using target(s) from argument: $choice"
else
  printf "Choose target(s) [e.g. 1 or 1,2 or 7 for All, 0 to exit]: "
  read -r choice < /dev/tty || choice=""
fi

if [ -z "$choice" ] || [ "$choice" = "0" ]; then
  echo "Installation cancelled."
  exit 0
fi

has_curl=false
has_wget=false
if command -v curl >/dev/null 2>&1; then
  has_curl=true
elif command -v wget >/dev/null 2>&1; then
  has_wget=true
else
  echo "Error: Neither curl nor wget was found on your system."
  exit 1
fi

download_file() {
  local url="$1"
  local dest="$2"
  mkdir -p "$(dirname "$dest")"
  if [ "$has_curl" = true ]; then
    curl -fsSL "$url" -o "$dest"
  else
    wget -qO "$dest" "$url"
  fi
}

SELECTED_IDS=()
if [ "$choice" = "7" ] || [ "$choice" = "all" ] || [ "$choice" = "ALL" ]; then
  for target in "${TARGETS[@]}"; do
    IFS="|" read -r id name path detect type <<< "$target"
    if [ "$id" != "5" ] && [ -d "$detect" ]; then
      SELECTED_IDS+=("$id")
    fi
  done
  if [ ${#SELECTED_IDS[@]} -eq 0 ]; then
    SELECTED_IDS+=("5")
  fi
else
  IFS=',; ' read -r -a tokens <<< "$choice"
  for t in "${tokens[@]}"; do
    t_clean="$(echo "$t" | tr -d ' ')"
    case "$t_clean" in
      1|2|3|4|5|6)
        already=false
        for exist_id in "${SELECTED_IDS[@]}"; do
          if [ "$exist_id" = "$t_clean" ]; then
            already=true
            break
          fi
        done
        if [ "$already" = false ]; then
          SELECTED_IDS+=("$t_clean")
        fi
        ;;
    esac
  done
fi

if [ ${#SELECTED_IDS[@]} -eq 0 ]; then
  echo "No valid options selected. Exiting."
  exit 1
fi

echo ""
echo "Installing Agent Core to ${#SELECTED_IDS[@]} target(s)..."
echo ""

LOCAL_SOURCE=false
if [ -n "${BASH_SOURCE[0]}" ] && [ -f "${BASH_SOURCE[0]}" ]; then
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" 2>/dev/null && pwd || echo "")"
  if [ -n "$SCRIPT_DIR" ] && [ -f "$SCRIPT_DIR/skills/agent-core/SKILL.md" ]; then
    LOCAL_SOURCE=true
  fi
fi

for id in "${SELECTED_IDS[@]}"; do
  for target in "${TARGETS[@]}"; do
    IFS="|" read -r t_id t_name t_path t_detect t_type <<< "$target"
    if [ "$t_id" = "$id" ]; then
      echo "Installing to $t_name: $t_path"
      all_ok=true
      
      if [ "$t_type" = "mcp" ]; then
        FILES_TO_PROCESS=("${MCP_FILES[@]}")
      else
        FILES_TO_PROCESS=("${SKILL_FILES[@]}")
      fi
      
      for rel_file in "${FILES_TO_PROCESS[@]}"; do
        if [ "$t_type" = "mcp" ]; then
          file_subpath="${rel_file#skills/agent-core/}"
          file_subpath="${file_subpath#mcp/}"
        else
          file_subpath="${rel_file#skills/agent-core/}"
        fi
        dest_file="$t_path/$file_subpath"
        mkdir -p "$(dirname "$dest_file")"
        
        if [ "$LOCAL_SOURCE" = true ]; then
          src_file="$SCRIPT_DIR/$rel_file"
          if [ "$(cd "$(dirname "$dest_file")" 2>/dev/null && pwd)/$(basename "$dest_file")" != "$(cd "$(dirname "$src_file")" 2>/dev/null && pwd)/$(basename "$src_file")" ]; then
            cp -f "$src_file" "$dest_file"
          fi
        else
          download_file "$REPO_URL/$rel_file" "$dest_file"
        fi
        
        if [ ! -s "$dest_file" ]; then
          all_ok=false
          echo "  x Failed to verify $file_subpath"
        fi
      done
      
      if [ "$t_type" = "mcp" ]; then
        CONFIG_FILE="$CLAUDE_CONFIG_DIR/claude_desktop_config.json"
        mkdir -p "$CLAUDE_CONFIG_DIR"
        SERVER_PATH="$t_path/server.js"
        # Update JSON via python or jq if available
        if command -v python3 >/dev/null 2>&1; then
          python3 -c "
import json, os
cfg_path = '$CONFIG_FILE'
cfg = {'mcpServers': {}}
if os.path.exists(cfg_path):
    try:
        with open(cfg_path, 'r', encoding='utf-8') as f:
            cfg = json.load(f)
    except: pass
if 'mcpServers' not in cfg: cfg['mcpServers'] = {}
cfg['mcpServers']['agent-core'] = {'command': 'node', 'args': ['$SERVER_PATH']}
with open(cfg_path, 'w', encoding='utf-8') as f:
    json.dump(cfg, f, indent=2)
"
          echo "  [OK] Registered MCP server in $CONFIG_FILE"
        fi
      fi
      
      if [ "$all_ok" = true ]; then
        echo "  [OK] Successfully installed to $t_path"
      else
        echo "  [WARN] Incomplete installation for $t_name"
      fi
      break
    fi
  done
done

echo ""
echo "Done! Agent Core is ready to use."
echo "Restart or refresh your AI assistant / Claude Desktop to load changes."
echo ""
