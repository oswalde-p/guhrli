const express = require('express')
const data = require('./tomato-example.json')
const app = express()

app.listen(11111, () => {
  console.log('Mock Tomato server listening on port 11111')
})

app.get('/', (req, res) => res.send(data))
