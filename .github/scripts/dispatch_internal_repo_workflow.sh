#!/bin/bash

# Triggers a remote GitHub workflow in nhs-notify-internal and waits for completion.

# Usage:
#   ./dispatch_internal_repo_workflow.sh \
#     --jobName <name> \
#     --infraRepoName <repo> \
#     --releaseVersion <version> \
#     --targetWorkflow <workflow.yaml> \
#     --targetEnvironment <env> \
#     --targetComponent <component> \
#     --targetAccountGroup <group> \
#     --terraformAction <action> \
#     --internalRef <ref>
#
# All arguments are required except jobName, terraformAction, and internalRef.
# Example:
#   ./dispatch_internal_repo_workflow.sh \
#     --jobName "Deploy" \
#     --infraRepoName "nhs-notify-web-template-management" \
#     --releaseVersion "v1.2.3" \
#     --targetWorkflow "deploy.yaml" \
#     --targetEnvironment "prod" \
#     --targetComponent "web" \
#     --targetAccountGroup "core" \
#     --terraformAction "apply" \
#     --internalRef "main"

set -e

while [[ $# -gt 0 ]]; do
	case $1 in
		--jobName) # Name of the job triggering the remote workflow (optional)
			jobName="$2"
			shift 2
			;;
		--infraRepoName) # Name of the infrastructure repo in NHSDigital org (required)
			infraRepoName="$2"
			shift 2
			;;
		--releaseVersion) # Release version, commit, or tag to deploy (required)
			releaseVersion="$2"
			shift 2
			;;
		--targetWorkflow) # Name of the workflow file to call in nhs-notify-internal (required)
			targetWorkflow="$2"
			shift 2
			;;
		--targetEnvironment) # Terraform environment to deploy (required)
			targetEnvironment="$2"
			shift 2
			;;
		--targetComponent) # Terraform component to deploy (required)
			targetComponent="$2"
			shift 2
			;;
		--targetAccountGroup) # Terraform account group to deploy (required)
			targetAccountGroup="$2"
			shift 2
			;;
		--terraformAction) # Terraform action to run (optional, default: "plan")
			terraformAction="$2"
			shift 2
			;;
		--internalRef) # Internal repo reference branch or tag (optional, default: "main")
			internalRef="$2"
			shift 2
			;;
		*)
			echo "Unknown argument: $1"
			exit 1
			;;
	esac
done

# Set default values if not provided
if [[ -z "$PR_TRIGGER_PAT" ]]; then
	echo "Error: PR_TRIGGER_PAT environment variable is not set or is empty."
	exit 1
fi

if [[ -z "$jobName" ]]; then
	jobName="${infraRepoName}-${targetComponent}-${terraformAction}"
fi

if [[ -z "$terraformAction" ]]; then
	terraformAction="plan"
fi

if [[ -z "$internalRef" ]]; then
	internalRef="main"
fi


callerRunId="${GITHUB_RUN_ID}-${jobName}-${GITHUB_RUN_ATTEMPT}"

DISPATCH_EVENT=$(jq -ncM \
	--arg infraRepoName "$infraRepoName" \
	--arg releaseVersion "$releaseVersion" \
	--arg targetEnvironment "$targetEnvironment" \
	--arg targetAccountGroup "$targetAccountGroup" \
	--arg targetComponent "$targetComponent" \
	--arg terraformAction "$terraformAction" \
	--arg callerRunId "$callerRunId" \
	--arg targetWorkflow "$targetWorkflow" \
	'{
		"ref": "'"$internalRef"'",
		"inputs": (
			(if $infraRepoName != "" then { "infraRepoName": $infraRepoName } else {} end) +
			(if $terraformAction != "" then { "terraformAction": $terraformAction } else {} end) +
			{
				"releaseVersion": $releaseVersion,
				"targetEnvironment": $targetEnvironment,
				"targetAccountGroup": $targetAccountGroup,
				"targetComponent": $targetComponent
			} +
			(if ($targetWorkflow | test("dispatch-(acceptance|contextual|product|security)-tests-.*\\.yaml"))
				then { "callerRunId": $callerRunId } else {} end)
		)
	}')

# Trigger the workflow
curl -L \
	--fail \
	--silent \
	-X POST \
	-H "Accept: application/vnd.github+json" \
	-H "Authorization: Bearer ${PR_TRIGGER_PAT}" \
	-H "X-GitHub-Api-Version: 2022-11-28" \
	"https://api.github.com/repos/NHSDigital/nhs-notify-internal/actions/workflows/$targetWorkflow/dispatches" \
	-d "$DISPATCH_EVENT"

echo "Workflow triggered. Waiting for the workflow to complete.."

# Poll GitHub API to check the workflow status
workflow_run_url=""
for _ in {1..18}; do
	workflow_run_url=$(curl -s \
		-H "Accept: application/vnd.github+json" \
		-H "Authorization: Bearer ${PR_TRIGGER_PAT}" \
		-H "X-GitHub-Api-Version: 2022-11-28" \
		"https://api.github.com/repos/NHSDigital/nhs-notify-internal/actions/runs?event=workflow_dispatch" \
		| jq -r \
				--arg callerRunId "$callerRunId" \
				--arg targetWorkflow "$targetWorkflow" \
				--arg targetEnvironment "$targetEnvironment" \
				--arg targetAccountGroup "$targetAccountGroup" \
				--arg targetComponent "$targetComponent" \
				--arg terraformAction "$terraformAction" \
			'.workflow_runs[]
				| select(.path == ".github/workflows/" + $targetWorkflow)
				| select(.name
						| contains($targetEnvironment)
						and contains($targetAccountGroup)
						and contains($targetComponent)
						and contains($terraformAction)
				)
				| if ($targetWorkflow | test("dispatch-(acceptance|contextual|product|security)-tests-.*\\.yaml"))
						then select(.name | contains("caller:" + $callerRunId))
						else .
					end
				| .url')

	if [[ -n "$workflow_run_url" && "$workflow_run_url" != null ]]; then
		ui_url=${workflow_run_url/api./}
		ui_url=${ui_url/\/repos/}
		echo "Found workflow run url: $ui_url"
		echo "workflow_run_url=$workflow_run_url" >> "$GITHUB_ENV"
		break
	fi

	echo "Waiting for workflow to start..."
	sleep 10
done

if [[ -z "$workflow_run_url" || "$workflow_run_url" == null ]]; then
	echo "Failed to get the workflow run url. Exiting."
	exit 1
fi

# Wait for workflow completion
while true; do
	sleep 10
	response=$(curl -s -L \
		-H "Authorization: Bearer ${PR_TRIGGER_PAT}" \
		-H "Accept: application/vnd.github+json" \
		"$workflow_run_url")

	status=$(echo "$response" | jq -r '.status')
	conclusion=$(echo "$response" | jq -r '.conclusion')

	if [ "$status" == "completed" ]; then
		if [ -z "$conclusion" ] || [ "$conclusion" == "null" ]; then
			echo "Workflow marked completed but conclusion not yet available, retrying..."
			sleep 5
			continue
		fi

		if [ "$conclusion" == "success" ]; then
			echo "Workflow completed successfully."
			exit 0
		else
			echo "Workflow failed with conclusion: $conclusion"
			exit 1
		fi
	fi

	echo "Workflow still running..."
	sleep 20
done
