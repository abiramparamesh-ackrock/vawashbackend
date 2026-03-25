const http = require("http");

let rides = []; // shared between both apps

let partnerLocation = { lat: null, lng: null };


const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    return res.end();
  }

  // 📌 Customer creates ride
  if (req.url === "/create-ride" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);

    req.on("end", () => {
      const data = JSON.parse(body);
      rides.push({ id: Date.now(), ...data, status: "pending" });

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Ride created" }));
    });
  }

  // 📌 Partner gets rides
  else if (req.url === "/rides" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(rides));
  }

  // 📌 Partner accepts ride
  else if (req.url.startsWith("/accept/") && req.method === "POST") {
    const id = req.url.split("/")[2];

    rides = rides.map(r =>
      r.id == id ? { ...r, status: "accepted" } : r
    );

    res.writeHead(200);
    res.end("Accepted");
  }
// 📌 Get completed rides (History)
  else if (req.url === "/history" && req.method === "GET") {
  const completed = rides.filter(r => r.status === "completed");

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(completed));
}

// 📌 Partner sends live location
  else if (req.url === "/partner-location" && req.method === "POST") {
  let body = "";
  req.on("data", chunk => body += chunk);

  req.on("end", () => {
    partnerLocation = JSON.parse(body);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Location updated" }));
  });
}

// 📌 Customer gets partner location
  else if (req.url === "/partner-location" && req.method === "GET") {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(partnerLocation));
} 
  // 📌 Partner marks ride completed
else if (req.url.startsWith("/complete/") && req.method === "POST") {
  const id = req.url.split("/")[2];

  rides = rides.map(r =>
    r.id == id ? { ...r, status: "completed" } : r
  );

  res.writeHead(200);
  res.end("Completed");
}
  // 📌 Get partner earnings (only completed rides)
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

server.listen(5000, () => console.log("Server running"));