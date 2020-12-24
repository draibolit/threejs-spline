const express = require('express')
const app = express()
// const port = 3000
const port = 3005

app.use('/', express.static('public'))
// app.use('/', express.static(''))

app.listen(port, () => {
  console.log('This app is listening on the port:' + port)
})
