require("dotenv").config();
const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert({
    "type": "service_account",
    "project_id": process.env.FIREBASE_PROJECT_ID,
    "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCWAkyAnXUkQrJk\nJ+UBokjsFMgpH5MWuHYc0X/FTRC8i47k+BjvtjwErvbdo4Ri3kUNhFkoLEtOZ7gF\n6QGXHgKw/oJHfyE4G8jQUx6FwP2uLkE93rEv5oBHUaU1lp3UterptVJVgN+DOhSE\ngXq76j33gn9o4gmZtLHAkoz9xQWrwXG/DViSGY6FNnrB72IyrGjhPnHgilNSq/B4\nLUfdvfcCs+WAHJEE7hQHnmTWXqAk35O3GD+NosFFzqIyRTQL2wOi7LfBrsYcutxG\nFstIN+Eka8TpwKgsEKDAOCJZ21zLAjv9USVds0VEooJsqUHPxZVR5m4lT9T95tn7\n1PkcogEBAgMBAAECggEADano8QAmpuZiXGgb3nG7RbHA56oGGlgz/f0BL+YMo7fs\njKOildcaEW0kdFzMFrtbO9d1zYh3VY1yACvQpsSnhxqvoDaOvo8dVAh2K8W/9akl\n7S5HIm9S+OwRadetya3GV4JaHQqvkULtkoI+vTYhbdWXqGSKblM8q6dNq2HSWeoR\nrSbQ2iTOCWlmv5QlYW/a7G87V+R3MdDLhtBmKO9ENW7bFYPep74VVTkNPRx6yRsa\npogkYjF+WDB9aG+kXk0bfWT7tZEzX7ielsBsjIvPbeAIY5XcQMFXw0HWm6w6Aock\nKPVXBc6SzpGYO2+ZZEwT/n09A+ne45CQZV90Be9n/wKBgQDJdLDGFBDBvhUi3j2b\nbZzd32UWqx1fDEWOVi+Gi9lKGga91LvbgLmA6woX6sR/Wn2plIPwp5TCO5IHlxv6\ni7IZto5pHrUeHUrmK/MAv0O78L2vVqbqJTdAdfgI8Xf8E7D/Ue2+C35gVy1FxdCa\npj82MDngJIP97/8XshfYeLHFGwKBgQC+n7lPZqfO+iTq1ad8YfyuApfGEmsgu/15\nB0x4mDouaXpLAw60zdP+wq0yWKX9eKukzmJZ59bzwOO+I6OrMLeOny1Zke6zpPN0\nMESKycenTlWfkohI0WklbTJyPizij1ej43s/j4yLrbFTrfNxHEvXzlxROqGQco7A\n5aGJIjcgEwKBgH1KRJK8cft8s3p/C4O59UCMKjuh6l9tq2its1sTaO1MKHsxbjBC\n65wBEcL0MIcgCV1JT5GBN+Rg1h5AXZdCAF87iXBZN71l7GogVT5WtdKSE/aThrXC\ntY0ykTNGsh+lQ4RXOOvkDBHwxehJ8cXstQ2HiscbDrgE5fqfuXLZBX6XAoGAAyim\na3hqA3YFspaDxf3hsAh+91tKxyoWUzEZxU3QeQBqdF/CmKBoiOo08IajiYW8YmjB\nHHhJCZUCsR3qEmYmRIjCuZ8/c16iYiSCnkIlutIDfTdyZrKBqYsbsOTy3XY+n4qf\nejgovg/MxnQ1eoRbhWH4CaiNENW1I+EqQhl9DF0CgYEAvD1BvFQR6E3V2D6Rl02S\nnVLezoEVJw+QV8cyE2JjvitjqDfY6do6fj93ql8K6SiZQiLNpEIUudRR9NDuEyAi\nWQD5dHh/5ShGmf52UzEO+l5AykGkWjzz9O018z/myA9hoQrbxVCOmEL9tveQlKJq\nhp6nDJP2F8r+7JyCu4qsZ6c=\n-----END PRIVATE KEY-----\n",
    "client_email": process.env.FIREBASE_CLIENT_EMAIL,
    "client_id": process.env.FIREBASE_CLIENT_ID,
    "auth_uri": process.env.FIREBASE_AUTH_URL,
    "token_uri": process.env.FIREBASE_TOKEN_URL,
    "auth_provider_x509_cert_url": process.env.FIREBASE_AUTH_PROVIDER_URL,
    "client_x509_cert_url": process.env.FIREBASE_CLIENT_CERT_URL,
    "universe_domain": "googleapis.com"
  }
  ),
});

const db = admin.firestore();

module.exports = { admin, db };

