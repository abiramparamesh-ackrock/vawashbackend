const http = require("http");

let rides = [];
let users = [];
let partnerLocation = { lat: null, lng: null };

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    return res.end();
  }

  // 📌 SIGNUP
  if (req.url === "/signup" && req.method === "POST") {
    let body = "";

    req.on("data", chunk => body += chunk);

    req.on("end", () => {
      const data = JSON.parse(body);

      const existing = users.find(u => u.phone === data.phone);

      if (existing) {
        res.writeHead(400);
        return res.end("User already exists");
      }

      const user = {
        id: Date.now(),
        name: data.name,
        phone: data.phone,
      };

      users.push(user);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(user));
    });
  }

  // 📌 LOGIN
  else if (req.url === "/login" && req.method === "POST") {
    let body = "";

    req.on("data", chunk => body += chunk);

    req.on("end", () => {
      const data = JSON.parse(body);

      const user = users.find(u => u.phone === data.phone);

      if (!user) {
        res.writeHead(404);
        return res.end("User not found");
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(user));
    });
  }

  // 📌 CREATE RIDE
if (!data.phone) {
  res.writeHead(400);
  return res.end("Contact number required");
}
  else if (req.url === "/create-ride" && req.method === "POST") {
    let body = "";

    req.on("data", chunk => body += chunk);

    req.on("end", () => {
      const data = JSON.parse(body);

 console.log("Incoming ride:", data); // ✅ DEBUG

rides.push({
  id: Date.now(),
  packageName: data.packageName,
  price: data.price || 100,
  location: data.location,
  lat: data.lat,
  lng: data.lng,
  phone: data.phone || "NO PHONE", // ✅ FIX
  status: "pending"
});

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Ride created" }));
    });
  }

  // 📌 GET RIDES (Partner)
  else if (req.url === "/rides" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(rides));
  }

  // 📌 ACCEPT RIDE
  else if (req.url.startsWith("/accept/") && req.method === "POST") {
    const id = req.url.split("/")[2];

    rides = rides.map(r =>
      r.id == id ? { ...r, status: "accepted" } : r
    );

    res.writeHead(200);
    res.end("Accepted");
  }

  // 📌 COMPLETE RIDE
  else if (req.url.startsWith("/complete/") && req.method === "POST") {
    const id = req.url.split("/")[2];

    rides = rides.map(r =>
      r.id == id ? { ...r, status: "completed" } : r
    );

    res.writeHead(200);
    res.end("Completed");
  }

  // 📌 HISTORY
  else if (req.url === "/history" && req.method === "GET") {
    const completed = rides.filter(r => r.status === "completed");

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(completed));
  }

  // 📌 PARTNER LOCATION UPDATE
  else if (req.url === "/partner-location" && req.method === "POST") {
    let body = "";

    req.on("data", chunk => body += chunk);

    req.on("end", () => {
      partnerLocation = JSON.parse(body);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Location updated" }));
    });
  }

  // 📌 GET LOCATION
  else if (req.url === "/partner-location" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(partnerLocation));
  }

  // 📌 EARNINGS
  else if (req.url === "/earnings" && req.method === "GET") {
    const completed = rides.filter(r => r.status === "completed");

    const total = completed.reduce((sum, r) => sum + r.price, 0);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      total,
      jobs: completed.length,
      rides: completed
    }));
  }

  else {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(5000, () => console.log("Server running on port 5000"));