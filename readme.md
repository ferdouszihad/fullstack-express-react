# Ful Stack Deployment Techniques for Project

### -2. Rename all API with /api convention

```js
app.get("/products"); //❌❌
app.get("/api/products"); //✅✅
```

### -1. add prozy server on vite.config.js

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
  plugins: [react()],
});
```

### 0. Set State for Token Loading on Client

```js
//authstate change
const [tokenLoading, setTokenLoading] = useState(true);
useEffect(() => {
  const unSubscribe = onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) {
      axios
        .post("/api/jwt", {
          user: currentUser?.email,
        })
        .then(() => {
          setUser(currentUser);
          setLoading(false);
          setTokenLoading(false);
        });
    } else {
      axios.post("/api/logout").then(() => {
        setUser(null);
        setLoading(false);
        setTokenLoading(false);
      });
    }
  });
  return () => {
    unSubscribe();
  };
}, [user]);

//share your token for holding private route loading
if (loading || tokenLoading) {
  return <Loading></Loading>;
}
```

### 1. copy build to server

Build your client

```bash
npm run build
```

copy and paste in vercel

### 2. use express.static middleware

```js
const path = require("path");
app.use(express.static(path.join(__dirname, "dist")));
```

### 3. Replace your default get function with this

```js
app.get("*", (__, res) => {
  console.log(path.join(__dirname, "dist", "index.html"));
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});
```

### 4. add vercel.json for full-stack deployment

```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    },
    {
      "src": "dist/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js",
      "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    },
    {
      "src": "/(.+\\.[a-z]+)$",
      "dest": "/dist/$1"
    }
  ]
}
```

### 5. Deploy & add to Firebase for Authorization
