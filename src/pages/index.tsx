import TerminalComponent from "../components/Terminal";

export default function Home() {
  const sshCredentials = {
    host: process.env.NEXT_PUBLIC_SSH_HOST || "",
    port: process.env.NEXT_PUBLIC_SSH_PORT
      ? parseInt(process.env.NEXT_PUBLIC_SSH_PORT)
      : 22,
    username: process.env.NEXT_PUBLIC_SSH_USERNAME || "",
    password: process.env.NEXT_PUBLIC_SSH_PASSWORD || "",
  };

  return (
    <div className="flex flex-col h-screen">
      <h1 className="text-2xl font-bold text-center my-4">SSH Web Client</h1>
      <TerminalComponent
        host={sshCredentials.host}
        port={sshCredentials.port}
        username={sshCredentials.username}
        password={sshCredentials.password}
      />
    </div>
  );
}
