# XXL Coind :: Address Validation
This is a sample application that allows a user to verify their ownership of a Bitcoin or Bitcoin-derived "coind" address.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

#### NodeJS
This is a cross-platform JavaScript runtime environment for servers and application. [Learn more about NodeJS](https://nodejs.org/en/).

#### MongoDB
MongoDB stores information in flexible JSON-like documents allowing for simple, scalable data. [Learn more about MongoDB](https://docs.mongodb.com/).

#### *Coin Blockchain Process
*Coin refers to Bitcoin or Bitcoin-derived Crypto-currency. This application requires a running wallet / blockchain node process which is configured for external communication (via JSON-RPC).

### Setting Up

Please make sure you have installed NodeJS and MongoDB for your development environment. The following instructions assumes this has already been completed.

Any code samples or directions starting with `$` are to be executed/ran in your computer's bash/shell. For example, on Mac this would be through the `Terminal` application. All commnads should be ran within this project's root.

#### Configuring Blockchain Settings
All blockchains should be configurable via a `*.conf` file located on your computer / server. Please add the following settings to your blockchain configuration file. The location and name of this file will vary from OS to OS, please consult your blockchain technical wiki or support guides.

Example: `/Users/MacUser1/Library/Application Support/ObsidianQt`
```
# enables JSON-RPC communication
server=1

# username for authenticating requests (change this!)
rpcuser=me

# password for authenticating requests (change this!)
rpcpassword=123

# communication port (maybe change this)
rpcport=8332

# (optional) whitelist ip addresses to access JSON-RPC
# not required to set if using internally (localhost)
# more information: https://github.com/bitcoin/bitcoin/blob/master/contrib/debian/examples/bitcoin.conf
#rpcallowip=123.44.5.678
```

#### Install Project Dependencies
The Node Package Manager or `NPM` should have been installed alongside NodeJS.

```bash
$ npm install
```

#### Initialize Local MongoDB Process
The local folder `./db` will be used for running a local MongoDB Instance. MongoDB will continue to run in this process instance until terminated manually.

```bash
$ mongod --fork --logpath logs/mongod.log --dbpath db
```

#### Create MongoDB Database & User
This sample application uses MongoDB to store verification requests. The database and user needs to be setup to properly store and retreive information. `coindb_validator_local` can be replaced with whatever you'd like to name the database. `coind` and `password123` can also be replaced with the username and password you'd wish to use.

```bash
$ mongo
$ > use coindb_validator_local
$ > db.createUser({ user: "coind", pwd: "password123", roles: [ "readWrite" ] })
```

#### Adjust App Settings
Make a copy of the `settings.json.template` file located in the `./config/` folder and rename it to just be `settings.json`. Adjust that configuration file where necessary, making sure the details are correct and match information you adjusted in previous steps above (i.e., wallet & mongodb).

```bash
$ cp ./config/settings.json.template ./config/settings.json
```

## Running Locally

To run this sample application locally after ensuring you have met the prerequisites and gone through the setup, you can run the following command in your terminal/shell application:

```bash
$ npm run serve
```

This will run the sample application locally on the default port of `3000`. You can modify this by adjusting the `config/settings.json` file or by passing the variable before executing the command: `PORT=3001 npm run serve`).

#### Debugging

By default, the `serve` command will set the `DEBUG` level to `xxl` which means this sample application and any related `xxl` frameworks such as the `xxl-coind-express-api`. You can turn this off or adjust the levels of information by running the proxied command by itself with or without the environment flag:

```bash
# only the xxl-coind-validator
$ DEBUG=xxl:coind:validator:* node server.js

# only the xxl-coind-validator app.js
$ DEBUG=xxl:coind:validator:app node server.js

# no debugging
$ node server.js
```

## Running Live

Run through the setup as usual, but you will likely want to configure the MongoDB process to be running in the background or as a "daemonized" process.

To run this sample application as a background process as well, I recommend `ForeverJS`. It ensures a given JavaScript is run indefinitvely (in the background) until the process is stopped manually or exits on an uncaught error. [Learn more about ForeverJS](https://github.com/foreverjs/forever).

Example command to run this sample application through ForeverJS:
```bash
$ forever start node server.js
```

List running ForeverJS processes:
```bash
$ forever list
```

## How It Works

Verifying ownership of a blockchain address (public key) can be useful for various reasons. This sample applications demonstrates address verification by means of validating a signed message. Messages can be signed through most *Coind applications/nodes, and can only be signed when the user is in control of both the public *and* private key of said address.

The proper JSON-RPC method used here is `verifymessage` which takes in the `address (public key)`, `signature (signed message)`, and `message (original, unsigned message)`.

This sample application allows a user to enter their *Coin address and begin the verification process. Once begun, they are "logged in" and can view the randomly generated word that they must use to sign a message with using their wallet or blockchain node program. Signed messages are unique and case sensitive. Any modifications to the message or if it is signed with the wrong address will result in a failed verification.

## Built With

* [XXL Coind Express API](https://github.com/Manbearpixel/xxl-coind-express-api) - *Coin Express Middleware API

## Contributing

No official contribution notes at this time. Please fork and submit a PR against Master.

## Versioning

Please use [SemVer](http://semver.org/) for versioning. For the versions available, see the tags/releases for this repository.

## Authors

* **Vaughn** - [Github@Pixxl](https://github.com/Manbearpixel)

## License

This project is licensed under the BSD-3-Clause - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

This application is supported by the [ODIN Blockchain](https://odinblockchain.org/). A Blockchain focusing on building a Privacy-orientated Platform for developers and everyday users alike.
