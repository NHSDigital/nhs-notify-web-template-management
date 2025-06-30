#!/bin/bash
set -euo pipefail

script_path="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";

source "${script_path}/lib/download-consumer-pacts.sh"

# Downloads all consumer-generated Pact contract files for a provider, for use in producer-side tests
provider="templates"

echo "Downloading Pact files for provider: ${provider}"

count=$(download_consumer_pacts $provider)

echo "Downloaded ${count} Pact files for provider: ${provider}"
