#!/usr/bin/env bash
# Agent Core - Skill Installer for Linux / macOS / WSL
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/nguyenxp3n/agent-core/main/install.sh | bash
# Or with target argument:
#   ./install.sh 1,2

set -e

REPO_URL="https://raw.githubusercontent.com/nguyenxp3n/agent-core/refs/heads/main"
FILES=(
  "skills/agent-core/SKILL.md"
  "skills/agent-core/references/principles.md"
  "skills/agent-core/references/execution.md"
  "skills/agent-core/references/verification.md"
)

HOME_DIR="${HOME:-~}"

echo ""
echo "======================================================"
echo "             AGENT-CORE SKILL INSTALLER               "
echo "======================================================"
echo "Scanning system for AI Agent environments..."
echo ""

# Agent definitions: ID|Name|Path|DetectDir
TARGETS=(
  "1|Claude Code|$HOME_DIR/.claude/skills/agent-core|$HOME_DIR/.claude"
  "2|OpenAI Codex|$HOME_DIR/.codex/skills/agent-core|$HOME_DIR/.codex"
  "3|Google Gemini / AGY|$HOME_DIR/.gemini/config/skills/agent-core|$HOME_DIR/.gemini"
  "4|Cursor Rules|$HOME_DIR/.cursor/rules/agent-core|$HOME_DIR/.cursor"
  "5|Current Workspace|./skills/agent-core|."
)

for target in "${TARGETS[@]}"; do
  IFS="|" read -r id name path detect <<< "$target"
  if [ -d "$detect" ]; then
    tag="[Detected]"
  else
    tag=""
  fi
  printf "  [%s] %-22s %-45s %s\n" "$id" "$name" "$path" "$tag"
done

echo "  [6] All detected environments"
echo "  [0] Exit"
echo ""

if [ -n "$1" ]; then
  choice="$1"
  if [ "$choice" = "--all" ] || [ "$choice" = "-a" ]; then
    choice="6"
  fi
  echo "Using target(s) from argument: $choice"
else
  printf "Choose target(s) [e.g. 1 or 1,2 or 6 for All, 0 to exit]: "
  read -r choice < /dev/tty || choice=""
fi

if [ -z "$choice" ] || [ "$choice" = "0" ]; then
  echo "Installation cancelled."
  exit 0
fi

# Determine download tool
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

# Determine selected IDs
SELECTED_IDS=()
if [ "$choice" = "6" ] || [ "$choice" = "all" ] || [ "$choice" = "ALL" ]; then
  for target in "${TARGETS[@]}"; do
    IFS="|" read -r id name path detect <<< "$target"
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
      1|2|3|4|5)
        # Check if already added
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
echo "Installing agent-core skill to ${#SELECTED_IDS[@]} target(s)..."
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
    IFS="|" read -r t_id t_name t_path t_detect <<< "$target"
    if [ "$t_id" = "$id" ]; then
      echo "Installing to $t_name: $t_path"
      mkdir -p "$t_path/references"
      all_ok=true
      
      for rel_file in "${FILES[@]}"; do
        file_subpath="${rel_file#skills/agent-core/}"
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
        
        if [ -s "$dest_file" ]; then
          : # verified non-empty
        else
          all_ok=false
          echo "  x Failed to verify $file_subpath"
        fi
      done
      
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
echo "Done! agent-core skill is ready to use."
echo "Restart or refresh your AI assistant to load the new skill."
echo ""
