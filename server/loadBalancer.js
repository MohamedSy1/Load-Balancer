const express = require('express');
const axios = require('axios');

const app = express();

// Backend servers
const servers = require("../config.json").servers
const setServers = new Set(servers)
// Current index of backend server
let currentIndex = 0;

// Function for getting next backend server
function getNextServer() {
  if (servers.length === 0) {
    throw new Error('No backend servers available')
  }

  currentIndex = (currentIndex + 1) % servers.length;
  return servers[currentIndex];
}

// Health check
async function healthCheck() {
  // Loop through servers and health check each one
  for (let i = 0; i < servers.length; i++) {
    const result = await axios.get(servers[i] + '/health');

    // If unhealthy, remove from servers list
    if (result.status !== 200) {
      servers.splice(i, 1);
      setServers.delete(servers[i]) 
      i--;
    }
  }

  // Add servers back once they become available
  setInterval(async () => {
    let serverAdded = false;
    for (let i = 0; i < servers.length; i++) {
      const result = await axios.get(servers[i] + '/health', { timeout: 5000 });
      if (result.status === 200 && !setServers.has(servers[i])) {
        servers.push(servers[i]);
        setServers.add(servers[i])
        serverAdded = true;
      }
    }

    if (serverAdded) {
      console.log('Server added back to pool');
    }
  }, 5000);

}

healthCheck();

// Log requests
app.use((req, res, next) => {
  console.log(`${req.method} request to ${req.url}`);
  next();
});

// Handler for incoming requests
app.get('*', async (req, res) => {

  // Get next backend server
  const server = getNextServer();
  console.log(server)
  // Forward request
  try {
    const result = await axios.get(server + req.url);
    res.status(result.status).send(result.data);

  } catch (err) {
    res.status(500).send('Failed to connect to backend');
  }
});

app.listen(8080, () => {
  console.log('Load balancer running on port 8080');
});