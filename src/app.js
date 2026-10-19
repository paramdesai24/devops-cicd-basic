const express = require('express');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Root API Endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'devops-cicd-basic',
    version: '1.0.0',
    description: 'Cloud-native application with automated GitHub Actions CI/CD',
    environment: process.env.NODE_ENV || 'production',
    uptime: `${Math.floor(process.uptime())} seconds`,
    timestamp: new Date().toISOString()
  });
});

// Cloud-Native Liveness Health Check Probe
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Cloud-Native Readiness Probe
app.get('/ready', (req, res) => {
  res.status(200).json({
    ready: true,
    message: 'Application is ready to handle traffic'
  });
});

module.exports = app;
