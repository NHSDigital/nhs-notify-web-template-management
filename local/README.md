# Experimental: Local setup for both templates-ui and iam-auth applications

This has only been tried on a mac.

If this local setup proves useful for others it would be great to move this `/local` directory to it's own github repo.

## Description

A docker-compose setup to run multiple web applications locally and served to the same domain: `localhost`.

Two web applications have been configured `nhs-notify-web-templates-management` and `nhs-notify-iam-webauth` are both served through `ngix` which acts as a gateway.

- `nhs-notify-web-templates-management` is served to `http://localhost/templates`
- `nhs-notify-iam-webauth` is served to `http://localhost/auth`

The `docker-compose` file is hooked up to local volume of the projects so any changes you make in your webapps will be ported across, you will need to refresh the web page to see the changes.

### Additional information

At first the application may take a few seconds to warm up. After the app has warmed up it's usually just as fast as running the application natively.

If you install a new `npm` package in either webapp then you'll need to rebuild the docker images.

## Requirements

- local version of `nhs-notify-iam-webauth` project
- docker-compose
- If you're on windows you'll need to configure docker to work through WSL2 [here is a guide that might help](https://docs.docker.com/desktop/features/wsl/)

## Setup

### Setup Amplify sandboxes

Setup the Amplify sandboxes in a new terminal as explained in each web-apps [README.md](../README.md#running-the-project-locally)

### Configure project paths

You'll need to set the directory path location for each web application in the `.env` file or as environment variables.

For example:

```bash
TEMPLATE_MANAGEMENT_DIR='~/projects/nhs-notify-web-template-management'
IAM_WEBAUTH_DIR='~/projects/nhs-notify-iam-webauth'
```

If you're using the `.env` file you might need to run `direnv allow`.

### Run

in the `/local/` directory run:

```bash
docker-compose up
```

First time running this it might take some time as `docker` downloads the base images and configures itself. After subsequent uses it will be much faster to start and stop.
