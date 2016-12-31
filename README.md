mongosockets
===

# Install

```bash
npm install mongosockets
```

# Usage (server)

```bash
npm start
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
await maeva.connect(connect('ws://localhost:'));
```
