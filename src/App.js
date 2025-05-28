import { useState, useEffect } from "react";

export default function AccountApp() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [treasurerPassword, setTreasurerPassword] = useState("1405");
  const [amount, setAmount] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
    setUsers(storedUsers);
  }, []);

  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  const generatePassword = () => Math.random().toString(36).slice(-8);

  const handleRegister = () => {
    if (!nameInput.trim()) return setLoginError("Nom requis.");
    if (users.some(u => u.name === nameInput.trim()))
      return setLoginError("Nom déjà pris.");
    const newUser = {
      id: Date.now(),
      name: nameInput.trim(),
      password: generatePassword(),
      balance: 0,
      role: "user"
    };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setLoginError("");
  };

  const handleLogin = () => {
    if (passwordInput === treasurerPassword) {
      setCurrentUser({ id: 0, name: "Trésorier", role: "tresorier" });
      setLoginError("");
      return;
    }
    const user = users.find(
      u => u.name === nameInput.trim() && u.password === passwordInput
    );
    if (user) {
      setCurrentUser(user);
      setLoginError("");
    } else {
      setLoginError("Nom ou mot de passe incorrect.");
    }
  };

  const isTreasurer = currentUser?.role === "tresorier";

  const handleAddMoney = () => {
    if (!isTreasurer || !selectedUserId || !amount) return;
    const updated = users.map(u =>
      u.id === selectedUserId
        ? { ...u, balance: u.balance + parseFloat(amount) }
        : u
    );
    setUsers(updated);
    setAmount("");
  };

  const handleChangePassword = () => {
    if (!newPassword || !selectedUserId || !isTreasurer) return;
    const updated = users.map(u =>
      u.id === selectedUserId ? { ...u, password: newPassword } : u
    );
    setUsers(updated);
    setNewPassword("");
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md space-y-6 border border-indigo-100">
          <h1 className="text-3xl font-bold text-center text-indigo-600">🔐 Connexion / Inscription</h1>
          <p className="text-sm text-center text-gray-500 italic">
            Entrez <strong>1405</strong> pour se connecter en tant que trésorier.
          </p>
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={passwordInput}
            onChange={e => setPasswordInput(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          />
          <div className="flex gap-4">
            <button
              onClick={handleLogin}
              className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow hover:bg-indigo-700 transition"
            >
              Connexion
            </button>
            <button
              onClick={handleRegister}
              className="flex-1 py-3 bg-green-500 text-white font-semibold rounded-xl shadow hover:bg-green-600 transition"
            >
              Inscription
            </button>
          </div>
          {loginError && (
            <p className="text-red-600 font-medium text-center">{loginError}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-12">
      <h1 className="text-4xl font-bold text-center text-gray-800">
        Bienvenue {currentUser.name}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {users.map(user => (
          <div
            key={user.id}
            className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              👤 {user.name}
            </h2>
            <p className="text-green-600 font-medium text-lg">
              💰 Solde : {user.balance.toFixed(2)} €
            </p>
            {currentUser.id === user.id && (
              <p className="mt-2 text-sm text-gray-500 italic">
                🔑 Mot de passe : {user.password}
              </p>
            )}
          </div>
        ))}
      </div>

      {isTreasurer && (
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl border-l-4 border-indigo-500 space-y-6">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">Espace Trésorier</h2>

          <div>
            <label className="block font-medium mb-1">Utilisateur ciblé</label>
            <select
              value={selectedUserId || ""}
              onChange={e => setSelectedUserId(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            >
              <option value="">-- Choisir un utilisateur --</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <input
              type="number"
              placeholder="Montant à ajouter"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            />
            <button
              onClick={handleAddMoney}
              className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600 transition"
            >
              ➕ Ajouter
            </button>
          </div>

          <div className="border-t pt-6 mt-6">
            <label className="block font-medium mb-1">Changer mot de passe</label>
            <input
              type="text"
              placeholder="Nouveau mot de passe"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
            />
            <button
              onClick={handleChangePassword}
              className="w-full mt-4 bg-yellow-500 text-white font-semibold px-4 py-3 rounded-lg hover:bg-yellow-600 transition"
            >
              🔒 Modifier mot de passe
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
