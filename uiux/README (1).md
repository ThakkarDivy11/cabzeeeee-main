# initialize node repo

```
npm init
```

# For Installing Dev Dependencies

```
npm i -D nodemon prettier @babel/eslint-parser eslint eslint-config-airbnb eslint-config-prettier eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-node  eslint-plugin-prettier eslint-plugin-react¯¸
```

# For Installing Dependencies

```
npm i @clerk/backend @clerk/express cors dotenv express mongoose morgan pg pg-hstore sequelize svix qs redis ioredis socket.io multer node-cron slugify
```

# Create Folder Structure

> Using Cmd/terminal

```
mkdir -p public src/{config,constants,controllers,data,helpers,middlewares,models,routes,scripts,services,tests,utils,webhooks} && touch src/{config,constants,controllers,data,helpers,middlewares,models,routes,scripts,services,tests,utils,webhooks}/index.js
```

> Using Powershell

```
New-Item -ItemType Directory -Path public, src/config, src/constants, src/controllers, src/data, src/helpers, src/middlewares, src/models, src/routes, src/scripts, src/services, src/tests, src/utils, src/webhooks -Force; New-Item -ItemType File -Path src/config/index.js, src/constants/index.js, src/controllers/index.js, src/data/index.js, src/helpers/index.js, src/middlewares/index.js, src/models/index.js, src/routes/index.js, src/scripts/index.js, src/services/index.js, src/tests/index.js, src/utils/index.js, src/webhooks/index.js -Force
```

# Eslint and Prettier Setup

```shell
@'
{
  "extends": ["airbnb", "prettier", "plugin:node/recommended"],
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": [
      "error",
      {
        "endOfLine": "auto"
      }
    ],
    "spaced-comment": "off",
    "no-console": "off",
    "consistent-return": "off",
    "func-names": "off",
    "object-shorthand": "off",
    "no-process-exit": "off",
    "no-param-reassign": "off",
    "no-return-await": "off",
    "no-underscore-dangle": "off",
    "class-methods-use-this": "off",
    "prefer-destructuring": [
      "error",
      {
        "object": true,
        "array": false
      }
    ],
    "no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "req|res|next|val|_"
      }
    ]
  },
  "parserOptions": {
    "requireConfigFile": false,
    "ecmaVersion": 2020,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  }
}
'@ | Out-File -FilePath .eslintrc.json -Encoding utf8; @'
{
  "singleQuote": true,
  "endOfLine": "lf",
  "trailingComma": "all"
}
'@ | Out-File -FilePath .prettierrc -Encoding utf8
```

> > terminal equivalent

```
cat > .eslintrc.json << 'EOF'
{
  "extends": ["airbnb", "prettier", "plugin:node/recommended"],
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": [
      "error",
      {
        "endOfLine": "auto"
      }
    ],
    "spaced-comment": "off",
    "no-console": "off",
    "consistent-return": "off",
    "func-names": "off",
    "object-shorthand": "off",
    "no-process-exit": "off",
    "no-param-reassign": "off",
    "no-return-await": "off",
    "no-underscore-dangle": "off",
    "class-methods-use-this": "off",
    "prefer-destructuring": [
      "error",
      {
        "object": true,
        "array": false
      }
    ],
    "no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "req|res|next|val|_"
      }
    ]
  },
  "parserOptions": {
    "requireConfigFile": false,
    "ecmaVersion": 2020,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  }
}
EOF

cat > .prettierrc << 'EOF'
{
  "singleQuote": true,
  "endOfLine": "lf",
  "trailingComma": "all"
}
EOF
```

> Add to package.json scripts

```json
"lint": "eslint .",
"lint:fix": "eslint . --fix",
"format": "prettier --write \"**/*.{js,jsx,json,md}\""
```

> Add this to package.json "below main and above scripts"

```
"engines": {
    "node": ">=12.9.0"
  },
```

# Add Config to `config.env`

```
NODE_ENV=development

DEVELOPMENT_PORT = 5957
STAGING_PORT = 5958
PRODUCTION_PORT=5959

DEFAULT_PROFILE_IMAGE_URL=https://www.gravatar.com/avatar?d=mp
```

> Note: Expand this as needed
