const http = require("http");

let rides = [];
let partnerLocation = { lat: null, lng: null };

const server = http.createServer((req, res) => {
  // ✅ CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    return res.end();
  }

  // 📌 Customer creates ride
  if (req.url === "/create-ride" && req.method === "POST") {
    let body = "";

    req.on("data", chunk => (body += chunk));

    req.on("end", () => {
      try {
        const data = JSON.parse(body);

        rides.push({
          id: Date.now().toString(),
          ...data,
          status: "pending"
        });

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Ride created" }));
      } catch (err) {
        res.writeHead(400);
        res.end("Invalid JSON");
      }
    });
  }

  // 📌 Get all rides
  else if (req.url === "/rides" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(rides));
  }

  // 📌 Accept ride
  else if (req.url.startsWith("/accept/") && req.method === "POST") {
    const id = req.url.split("/")[2];

    rides = rides.map(r =>
      r.id === id ? { ...r, status: "accepted" } : r
    );

    res.writeHead(200);
    res.end("Accepted");
  }

  // 📌 Complete ride
  else if (req.url.startsWith("/complete/") && req.method === "POST") {
    const id = req.url.split("/")[2];

    rides = rides.map(r =>
      r.id === id ? { ...r, status: "completed" } : r
    );

    res.writeHead(200);
    res.end("Completed");
  }

  // 📌 History
  else if (req.url === "/history" && req.method === "GET") {
    const completed = rides.filter(r => r.status === "completed");

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(completed));
  }

  // 📌 Partner sends location
  else if (req.url === "/partner-location" && req.method === "POST") {
    let body = "";

    req.on("data", chunk => (body += chunk));

    req.on("end", () => {
      try {
        partnerLocation = JSON.parse(body);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Location updated" }));
      } catch {
        res.writeHead(400);
        res.end("Invalid JSON");
      }
    });
  }

  // 📌 Get partner location
  else if (req.url === "/partner-location" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(partnerLocation));
  }

  // 📌 Earnings
  else if (req.url === "/earnings" && req.method === "GET") {
    const completed = rides.filter(r => r.status === "completed");

    const total = completed.reduce((sum, r) => sum + (r.price || 0), 0);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      total,
      jobs: completed.length,
      rides: completed
    }));
  }

  // ❌ Not found
  else {
    res.writeHead(404);
    res.end("Not found");
  }
});


// ✅ VERY IMPORTANT FOR DEPLOYMENT
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});