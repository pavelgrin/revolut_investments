## Revolut investments

Calculation of the buy/sell shares results through the Revolut app. The output is based on a csv-file that is exported from the app

### How to build

```
# Preparation
npm install
npm build
npm run migration_up

# Dev mode (with change watching)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Prod mode
docker-compose up
```
