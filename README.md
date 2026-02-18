# NHS Notify Template Management (WebUI) Repository

## Setting up locally

### Git

- Make sure you have GitHub access with the right permissions
- Setup git locally on your machine
- Set your local git email as you `*@nhs.net` email `e.g. git config --global user.email "firstname.lastname1@nhs.net"`
- Setup commit signing (this is required before you can commit any code to the repository). This is a very good resource to help Mac users `https://gist.github.com/troyfontaine/18c9146295168ee9ca2b30c00bd1b41e`
- Pull the repository here `git@github.com:NHSDigital/nhs-notify-web-template-management.git`

### Development and Tools

- Install `asdf` [HERE](https://asdf-vm.com/guide/getting-started.html#_2-download-asdf). We use this tool to manage the required version for packages (this can be found in the `.tool-versions` file at the root of the project) on the project. You can use other tools usch as `brew`, `apt`, etc, but you will be risking having different package versions to other developers.
- Then you need to install the following plugins:

```shell
  asdf plugin add nodejs
  asdf plugin add direnv
  asdf plugin add terraform
  asdf plugin add gitleaks
  asdf plugin add pre-commit
```

- Now you can install the tools, and they will be runnable from within the `nhs-notify-web-template-management` directory:

```shell
  asdf install
```

- Now you can run the command below to install the packages in the project:

```shell
  npm install
```

### Environment Variables and .env.template

This repository provides a `.env.template` file at the root. This file contains example environment variables required for local development and deployment.

**How to use:**

1. Copy `.env.template` to a new file named `.env` in the same directory:

   ```shell
   cp .env.template .env
   ```

2. Open `.env` and update the values as needed for your environment. For example, set your GitHub personal access token and username:

   - `GITHUB_TOKEN` – Your GitHub Personal Access Token with packages:read permissions.
   - `GITHUB_ACTOR` – Your GitHub username associated with the token

3. Save the file. The application and scripts will now use these environment variables.

**Tip:**

- Keep `.env` files out of version control. The `.env.template` is provided as a reference for required variables.

### Running the project locally

1. To create a Terraform backend sandbox, run:

   ```shell
   npm run create-backend-sandbox <environment-name>
   ```

2. Then in a separate terminal, run the app locally:

   ```shell
   npm run dev
   ```

3. Open your browser and go to `localhost:3000` to view the app.

4. To destroy a Terraform backend sandbox, run:

   ```shell
   npm run destroy-backend-sandbox <environment-name>
   ```

5. (Optional) Create a `.env` file at `frontend/.env` and add `INCLUDE_AUTH_PAGES=true` to include the local auth pages when doing a production Next build

### Other commands

- Unit test `npm run test:unit`
- Accessibility test `npm run test:accessibility`

You can find more commands in the `package.json` file

### Running Team and IAM Web Auth projects locally

Read more in the [README.md](./local/README.md).

### Project structure

- components `./src/components`
- pages `./src/app`
- SCSS Styles `./src/styles`
- App contents `./src/content
- Unit tests (Components) `./src/__tests__/components`
- Unit tests (Pages) `./src/__tests__/pages`
- Utilities functions `./src/utils`
- Types `./src/types`

### Shared Terraform Modules

Before you setup modules for this repository and find that there might be modules that can be reused elsewhere, please do check out `https://github.com/NHSDigital/nhs-notify-shared-modules/`. If you find that the modules are shareable, you should set them up there as a separate PR and get that merged in and potentially tag the commit after testing it, so that it can be a stable release that can be used across all repos on Notify should others find the need to re-use that new module. You can simply point to the reference in your module call as below:

```hcl
module "amp_branch" {
  source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/amp_branch?ref=v1.0.0"
  ...
}
```
