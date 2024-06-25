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
  asdf plugin-add nodejs
  asdf plugin-add direnv
  asdf plugin-add terraform
  asdf plugin-add gitleaks
  asdf plugin-add pre-commit
```

- Now you can install the tools, and they will be runnable from within the `nhs-notify-web-template-management` directory:

```shell
  asdf install
```

- Now you can run the command below to install the packages in the project:

```shell
  npm install
```

- And tun the command below to start up the project:

```shell
  npm run dev
```

- Open your browser and go to `localhost:3000` to view the app.

### Other commands

- Unit test `npm run test:unit`
- Accessibility test `npm run test:accessibility`

You can find more commands in the `package.json` file

### Project structure

- components `./src/components`
- pages `./src/app`
- SCSS Styles `./src/styles`
- App contents `./src/content
- Unit tests (Components) `./src/__tests__/components`
- Unit tests (Pages) `./src/__tests__/pages`
- Utilities functions `./src/utils`
- Types `./src/types`
