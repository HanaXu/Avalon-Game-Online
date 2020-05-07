import express from 'express';
import socketIO from 'socket.io';
import path from 'path';
import { appSocket } from './socket/appSocket.mjs';

const app = express();
const port = 3000;
const server = app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
const io = socketIO(server);

const __dirname = path.dirname(new URL(import.meta.url).pathname);
app.use(express.static(__dirname + "/../dist/"));

app.get(/.*/, function (req, res) { //handle all other routes
  res.sendFile(path.resolve("dist/index.html"));
});

io.on('connection', socket => {
  appSocket(io, socket, port);
});
