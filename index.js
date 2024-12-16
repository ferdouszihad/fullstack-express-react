const express = require("express");
require("dotenv").config();
const app = express();
const path = require("path");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const PORT = process.env.PORT || 5000;
const client = new MongoClient(process.env.URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

//middleware
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  console.log(
    `request for ${req.method}-${
      req.url
    } Time - ${new Date().toLocaleTimeString()}`
  );
  next();
});
app.use(express.static(path.join(__dirname, "dist")));

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};

const verify = (req, res, next) => {
  //   console.log(req?.cookies?.token);
  const token = req?.cookies?.token;
  if (!token) return res.status(401).send({ msg: "unauthorized" });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decode) => {
    if (err) {
      return res.status(401).send({ msg: "token is Corrupted" });
    }

    req.user = decode;
    next();
  });
};

async function run() {
  try {
    // await client.connect();

    /*********************************************
     * ************* JWT STARTED *****************
     *********************************************/
    app.post("/api/jwt", async (req, res) => {
      const user = req.body;
      //   console.log("user for token", user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);

      res.cookie("token", token, cookieOptions).send({ success: true });
    });

    //clearing Token
    app.post("/api/logout", async (req, res) => {
      const user = req.body;
      console.log("logging out", user);
      res
        .clearCookie("token", { ...cookieOptions, maxAge: 0 })
        .send({ success: true });
    });

    /*********************************************
     * *************JWT END***********************
     *********************************************/

    //my DB Collections
    const productDB = client.db("product-house");
    const productCollection = productDB.collection("products");

    app.get("/api/products", verify, async (req, res) => {
      const result = await productCollection.find().toArray();
      res.send(result);
    });

    // await client.db("admin").command({ ping: 1 });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("*", (__, res) => {
  console.log(path.join(__dirname, "dist", "index.html"));
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server  running on http://localhost:${PORT}`);
});
