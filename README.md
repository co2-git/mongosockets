mongosockets
===

# Install

```bash
npm install mongosockets
```

# Usage (server)

```bash
npm start 3000
```

# Start new worker on port 9000

```bash
npm run worker 9000 mongodb://localhost/test
```

# Usage (client)

```javascript
import {connect} from 'mongosockets';
import maeva, {Model} from 'maeva';

// Define a model
class User extends Model {
  static schema = {email: String};
}

// Connect to a mongosockets server
await maeva.connect(connect('ws://localhost:9000'));

// Perform queries
await User.insert({email: 'john@doe.com'});
```
