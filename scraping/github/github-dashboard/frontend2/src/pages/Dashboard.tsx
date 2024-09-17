import { Card } from "../components/card";

export const Dashboard = () => {
  return (
    <div className="bg-center bg-no-repeat bg-cover bg-[url('https://i.imgur.com/fiIJugB.png')] bg-[#373A40] bg-blend-multiply flex h-screen">
      <header className="mb-8 text-center">5
        <h2 className="font-semibold text-white">Student Name</h2>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <img className="w-20 h-20 rounded-full mr-4" src="https://avatar.iran.liara.run/public/36" alt="David's avatar" />
            <h1 className="text-4xl font-bold text-white">
              Hello, I'm David – <br />Crafting Creative Code!
            </h1>
          </div>
          <p className="text-blue-300 max-w-2xl mx-auto">
            As a creative developer, I blend code and design to build unique, user-centric experiences. Let's turn your ideas into a dynamic and engaging digital reality!
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
          <Card backgroundColor="#453a27" borderColor="#fbbf24" glowColor="rgba(251,191,36,0.3)" />
          <Card backgroundColor="#451e1b" borderColor="#f97316" glowColor="rgba(249,115,22,0.3)" />
          <Card backgroundColor="#1b3325" borderColor="#22c55e" glowColor="rgba(34,197,94,0.3)" />
          <Card backgroundColor="#1b2c3a" borderColor="#38bdf8" glowColor="rgba(56,189,248,0.3)" />
        </div>
      </main>
    </div>
  );
};