# Knowledge Base API

A knowledge base assistant which utilizes Open AI to load a document, and enable conversations with said document.

## Setup
Install node version manager to install Node on your system. 
Follow the instructions listed here: https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating

curl
```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```
wget
```sh
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

source the .bashrc or .profile in the user directory.
```sh
source ~/.bashrc
```

check nvm version
```sh
nvm version
```

install Node 18.
```sh
nvm install 18
```

## Open AI Setup
Create a .env file in the root of the project and add your Open AI API Key to operate the server.
```sh
OPENAI_API_KEY=sk-...
```

## Run
Start the server on port 5041.
```sh
npm run start
```

