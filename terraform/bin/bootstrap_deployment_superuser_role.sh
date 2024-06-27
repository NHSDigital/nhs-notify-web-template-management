#!/usr/bin/env bash

set -euo pipefail  # safe scripting

declare red="\033[0;31m";
declare yellow="\033[0;33m";
declare cyan="\033[0;36m";
declare nc="\033[0m"; # No Color
declare bold="\033[1m";

echo -e "\n${yellow}Before running this process you should assume the ${cyan}NHSNotify-Admin SSO profile${yellow} in the account in which you want to create the NOTIFYDeployRole iam role${nc}"
echo -e "\n${red}CONFIRM:${cyan} Are you SURE you are in the right AWS account?${nc}\n"

read -r confirmation

if [[ ! "${confirmation^^}" =~ ^(Y|YES)$ ]]; then
  echo -e "\nAborted [ ${red}FAIL${nc} ]\n"
  exit 1
fi

if [[ "$(uname)" == "Darwin" ]]; then
    TAIL_CMD="tail -n +2"
else
    TAIL_CMD="tail +2"
fi

account_id=$(aws sts get-caller-identity | jq '.Account' | sed 's/\"//g')
HOST=$(curl https://vstoken.actions.githubusercontent.com/.well-known/openid-configuration \
| jq -r '.jwks_uri | split("/")[2]')
thumbprint_list=$(  echo | openssl s_client -servername $HOST -showcerts -connect $HOST:443 2> /dev/null \
| sed -n -e '/BEGIN/h' -e '/BEGIN/,/END/H' -e '$x' -e '$p' | $TAIL_CMD \
| openssl x509 -fingerprint -noout \
| sed -e "s/.*=//" -e "s/://g" \
| tr "ABCDEF" "abcdef" )

aws iam create-open-id-connect-provider --url https://token.actions.githubusercontent.com --client-id-list sts.amazonaws.com --thumbprint-list ${thumbprint_list}

echo -e "\n${yellow}Provide Repo Name${nc}"
read -r repo_name

if [[ -z "${repo_name^^}" ]]; then
  echo -e "\nAborted [ ${red}FAIL${nc} ]\n"
  exit 1
fi

document="{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":{\"Federated\":\"arn:aws:iam::${account_id}:oidc-provider/token.actions.githubusercontent.com\"},\"Action\":\"sts:AssumeRoleWithWebIdentity\",\"Condition\":{\"StringEquals\":{\"token.actions.githubusercontent.com:aud\":\"sts.amazonaws.com\"},\"StringLike\":{\"token.actions.githubusercontent.com:sub\":\"repo:NHSDigital/${repo_name}:*\"}}}]}"


if ! aws iam create-role \
  --role-name NOTIFYDeployRole \
  --assume-role-policy-document "${document}" \
  --output yaml
then
  echo -e "\nCouldn't create role [ ${red}FAIL${nc} ]\n"
  exit 1
fi

if ! aws iam attach-role-policy \
  --role-name NOTIFYDeployRole \
  --policy-arn "arn:aws:iam::aws:policy/AdministratorAccess"
then
  echo -e "\nCouldn't attach managed policy [ ${red}FAIL${nc} ]\n"
  exit 1
fi

echo -e "\nRole created [ ${yellow}OK${nc} ]\n"
exit 0
