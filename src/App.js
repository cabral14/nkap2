import { useState, useEffect } from "react";
import { Card, CardContent } from "src/components/ui/card";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";

export default function AccountApp() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [treasurerPassword, setTreasurerPassword] = useState("1405"); // Mot de passe trésorier par défaut

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem("users")) || [];

    // Si pas d'utilisateur du tout, initialiser la liste vide
    setUsers(storedUsers);
  }, []);

  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  const generatePassword = () => Math.random().toString(36).slice(-8);

  const handleRegister = () => {
    if (!nameInput.trim()) {
      setLoginError("Le nom d'utilisateur est obligatoire.");
      return;
    }
    if (users.some(u => u.name === nameInput.trim())) {
      setLoginError("Nom d'utilisateur déjà pris.");
      return;
    }
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
      // Accès Trésorier par mot de passe uniquement
      const tresorierUser = { id: 0, name: "Trésorier", role: "tresorier" };
      setCurrentUser(tresorierUser);
      setLoginError("");
      return;
    }
    const user = users.find(u => u.name === nameInput.trim() && u.password === passwordInput);
    if (user) {
      setCurrentUser(user);
      setLoginError("");
    } else {
      setLoginError("Nom ou mot de passe incorrect.");
    }
  };

  const isTreasurer = currentUser && currentUser.role === "tresorier";

  const [amount, setAmount] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  const handleAddMoney = () => {
    if (!isTreasurer || selectedUserId === null || !amount) return;
    const updatedUsers = users.map(user =>
      user.id === selectedUserId
        ? { ...user, balance: user.balance + parseFloat(amount) }
        : user
    );
    setUsers(updatedUsers);
    setAmount("");
  };

  const handleChangePassword = () => {
    if (!isTreasurer || selectedUserId === null || !newPassword) return;

    const updatedUsers = users.map(user =>
      user.id === selectedUserId ? { ...user, password: newPassword } : user
    );
    setUsers(updatedUsers);
    setNewPassword("");
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-white px-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">🔐 Connexion / Inscription</h1>

        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={nameInput}
          onChange={e => setNameInput(e.target.value)}
          className="mb-4 w-full max-w-md px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
        <input
          type="password"
          placeholder="Mot de passe (laisser vide si nouveau)"
          value={passwordInput}
          onChange={e => setPasswordInput(e.target.value)}
          className="mb-6 w-full max-w-md px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />

        <div className="flex gap-4 w-full max-w-md">
          <button
            onClick={handleLogin}
            className="flex-1 bg-indigo-600 text-white font-semibold py-3 rounded-lg shadow hover:bg-indigo-700 transition"
          >
            Connexion
          </button>
          <button
            onClick={handleRegister}
            className="flex-1 bg-green-600 text-white font-semibold py-3 rounded-lg shadow hover:bg-green-700 transition"
          >
            Inscription
          </button>
        </div>

        {loginError && (
          <p className="mt-6 text-red-600 font-medium">{loginError}</p>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
        💰 Bienvenue {currentUser.name}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-10">
        {users.map(user => (
          <div
            key={user.id}
            className="bg-white rounded-xl shadow p-6 flex flex-col justify-between border border-gray-200 hover:shadow-lg transition"
          >
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">👤 {user.name}</h2>
              <p className="text-lg font-medium text-green-600">💵 Solde : {user.balance.toFixed(2)} €</p>
            </div>
            {currentUser.id === user.id && (
              <p className="mt-3 text-sm text-gray-500 italic">
                🔑 Mot de passe : {user.password}
              </p>
            )}
          </div>
        ))}
      </div>

      {isTreasurer && (
        <div className="max-w-3xl mx-auto bg-white rounded-xl p-6 shadow border border-indigo-300">
          <h2 className="text-2xl font-semibold text-indigo-700 mb-6">🧾 Espace Trésorier</h2>

          <div className="mb-6">
            <label className="block mb-2 font-medium text-gray-700">Sélectionnez un utilisateur</label>
            <select
              value={selectedUserId || ""}
              onChange={e => setSelectedUserId(Number(e.target.value))}
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="">-- Choisir --</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6 flex gap-4 items-center">
            <input
              type="number"
              placeholder="Montant à ajouter"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            <button
              onClick={handleAddMoney}
              className="bg-green-600 text-white font-semibold px-6 py-2 rounded-md shadow hover:bg-green-700 transition"
            >
              ➕ Ajouter
            </button>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <label className="block mb-2 font-medium text-gray-700">Changer mot de passe</label>
            <input
              type="password"
              placeholder="Nouveau mot de passe"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            <button
              onClick={handleChangePassword}
              className="bg-yellow-500 text-white font-semibold px-6 py-2 rounded-md shadow hover:bg-yellow-600 transition w-full"
            >
              🔒 Modifier mot de passe
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
