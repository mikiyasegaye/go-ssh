import React, { useEffect, useRef } from "react";
import "xterm/css/xterm.css";
import io from "socket.io-client";
import { Terminal } from "xterm";

type TerminalProps = {
  host: string;
  port: number;
  username: string;
  password: string;
};

const TerminalComponent: React.FC<TerminalProps> = ({
  host,
  port,
  username,
  password,
}) => {
  const terminalRef = useRef<Terminal | null>(null);

  useEffect(() => {
    const initializeTerminal = async () => {
      const { Terminal } = await import("xterm");
      const { FitAddon } = await import("@xterm/addon-fit");

      const terminalElement = document.getElementById("terminal");
      if (terminalElement && !terminalRef.current) {
        const terminal = new Terminal({
          cursorBlink: true,
          fontFamily: "MesloLGS NF, monospace",
        });

        const fitAddon = new FitAddon();
        terminal.loadAddon(fitAddon);

        terminal.open(terminalElement);
        fitAddon.fit();
        terminalRef.current = terminal;

        const socket = io("http://localhost:3000", { path: "/api/socket" });

        socket.emit("ssh_connect", { host, port, username, password });

        terminal.onData((data) => {
          socket.emit("message", data);
        });

        socket.on("message", (data: string) => {
          terminal.write(data);
        });

        socket.on("error", (error: string) => {
          terminal.write(`\r\nError: ${error}\r\n`);
        });

        const resizeTerminal = () => {
          fitAddon.fit();
          socket.emit("resize", {
            cols: terminal.cols,
            rows: terminal.rows,
          });
        };

        window.addEventListener("resize", resizeTerminal);

        return () => {
          terminal.dispose();
          socket.disconnect();
          window.removeEventListener("resize", resizeTerminal);
        };
      }
    };

    initializeTerminal();
  }, [host, port, username, password]);

  return (
    <div
      id="terminal"
      className="bg-black text-white font-meslo p-4 rounded-md"
      style={{
        width: "100%",
        height: "90%",
      }}
    />
  );
};

export default TerminalComponent;
