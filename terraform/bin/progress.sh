#!/usr/bin/env bash

function get_colour() {
  echo "$(git config --get-color "" "${1:-white} bold")"
}

color_yellow=$(get_colour yellow)
color_red="$(get_colour red)"
color_white_on_red="$(get_colour 'white red')"
color_green="$(get_colour green)"
color_cyan="$(get_colour cyan)"
color_white="$(get_colour white)"
color_reset="$(git config --get-color "" "reset")"

function show_progress() {
  progress_pc="${1:-0}";
  progress_msg="${2:-}";
  progress_color="${3:-color_reset}";
  echo -e ".\n.\n${color_reset}$(printf "%.0s-" $(seq 1 100))${color_reset}";
  echo -e "${color_white}PROGRESS:${color_reset}";
  echo -e "${color_yellow}${progress_msg//\033[0m/\033[0;33m}${color_reset}";
  echo -e "${color_white}$(printf "%.0s=" $(seq 1 100))${color_reset}";
  echo -e "${color_white}${!progress_color}$(printf "%.0s|" $(seq 1 ${progress_pc}))${color_reset} (${progress_pc}%)";
  echo -e "${color_white}$(printf "%.0s=" $(seq 1 100))${color_reset}\n.\n.";
}
