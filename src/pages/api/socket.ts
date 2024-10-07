import { NextApiRequest, NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";
import { Client as SSHClient } from "ssh2";
import { Server as HTTPServer } from "http";

let io: SocketIOServer | undefined;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!io) {
    const httpServer = (
      res.socket as typeof res.socket & { server: HTTPServer }
    ).server;
    io = new SocketIOServer(httpServer, {
      path: "/api/socket",
      cors: { origin: "*" },
    });

    io.on("connection", (socket) => {
      console.log("Socket.IO connected");

      socket.on("ssh_connect", ({ host, username, password }) => {
        const ssh = new SSHClient();
        ssh
          .on("ready", () => {
            console.log("SSH Connection established");

            ssh.shell((err, stream) => {
              if (err) {
                console.error("SSH Error:", err.message);
                socket.emit("error", `SSH Error: ${err.message}`);
                return;
              }

              socket.on("message", (data: string) => {
                stream.write(data);
              });

              stream.on("data", (data: Buffer) => {
                socket.emit("message", data.toString());
              });

              stream.on("close", () => {
                console.log("SSH stream closed");
                ssh.end();
                socket.disconnect();
              });
            });
          })
          .on("error", (err: Error) => {
            console.error("SSH connection error:", err.message);
            socket.emit("error", `SSH connection error: ${err.message}`);
          })
          .connect({ host, username, password });
      });
    });

    console.log("Socket.IO server initialized");
  }

  res.status(200).end();
}

export const config = {
  api: {
    bodyParser: false,
  },
};
