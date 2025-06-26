function generateSandboxName() {
  # Example: feature/CCM-00000_branch-description
  REF=$1

  # Example: feature/ccm-00000_branch-description -> feature/CCm-00000_branch-desCription
  SANITISED_REF1=${REF//c/C}

  # Example: feature/CCm-00000_branch-desCription -> feature/CCM-00000_branch-desCription
  SANITISED_REF2=${SANITISED_REF1//m/M}

  # Example: 00000_branch-description
  END_REF=(${SANITISED_REF2##*CCM-})

  if [[ $END_REF == $SANITISED_REF2 ]]; then
    # No CCM ref detected
    TICKET_NUMBER=""
  else
    # Example: 00000
    TICKET_NUMBER=${END_REF%%[_-]*}
  fi

  # Example: 04f106adc56fc0460853351c314b670d  -
  HASH=$(md5sum <<<"$REF")

  # Example: 0000004f106adc56fc0460853351c314b670d  -
  LONG_SANDBOX_NAME="$TICKET_NUMBER""$HASH"

  MAX_SANDBOX_LENGTH=8

  # Example: 0000004f
  SANDBOX_NAME=${LONG_SANDBOX_NAME:0:MAX_SANDBOX_LENGTH}
  echo "SANDBOX_NAME=$SANDBOX_NAME"
}

generateSandboxName $1
