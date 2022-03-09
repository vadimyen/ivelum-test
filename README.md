# Ivelum Test Assignment (GraphQL API for railway ticketing system)

## Installation
 - clone repo
 - run `npm i`
 - run `node index.js`
 - open http://localhost:4000/
 
The schema is in `schema.graphql` file (actual `index.js` contains identical content, that's just for convenience).

## API

That's simple schema consists of 4 queries:
 - current user's info
 - trains schedule
 - train's tickets
 - train's info

And 2 mutations:
 - tickets booking
 - tickets cancellation


 Each response describes possible business logic errors.