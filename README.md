# Pump and dump crypto detector

This small tool runs simple heuristics for detecting pump and dump schemes in crypto exchanges. It is designed for remaining very small and easy to maintain.

# Pre-reqs
- Install [Node.js](https://nodejs.org/en/)

# Getting started
In order to run the project you need to run the following commands
```
npm install
npm build-ts
npm run test
```

# Getting started with docker container
```
docker run -p 8080:3000 --name crypto-plumber gianluca91/crypto-plumber
```

# How to use 
You can see the outpunt in the terminal.
You can download additional analytics data at http://localhost:8080

# Contribute
Every time you add a new functionality, please write a new test for it before implementing it.
```
npm run test
```

Recompile the Typescript files every time that they change.
```
npm run watch-ts
```

Rebuild the docker container
```
npm clean
docker build . --tag gianluca91/crypto-plumber
```
