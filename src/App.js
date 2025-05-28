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

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem("users")) || [];

    // Ajouter automatiquement le trésorier si pas présent
    const hasTreasurer = storedUsers.some(u => u.name === "Tresorier");
    if (!hasTreasurer) {
      storedUsers.push({
        id: Date.now(),
        name: "Tresorier",
        password: "tresorier123",
        balance: 0
      });
    }

    setUsers(storedUsers);
  }, []);

  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  const generatePassword = () => Math.random().toString(36).slice(-8);

  const handleRegister = () => {
    if (users.some(u => u.name === nameInput)) {
      setLoginError("Nom d'utilisateur déjà pris.");
      return;
    }
    const newUser = {
      id: Date.now(),
      name: nameInput,
      password: generatePassword(),
      balance: 0
    };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setLoginError("");
  };

  const handleLogin = () => {
    const user = users.find(u => u.name === nameInput && u.password === passwordInput);
    if (user) {
      setCurrentUser(user);
      setLoginError("");
    } else {
      setLoginError("Nom ou mot de passe incorrect.");
    }
  };

  const isTreasurer = currentUser && currentUser.name === "Tresorier" && currentUser.password === "tresorier123";

  const [amount, setAmount] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const handleAddMoney = () => {
    if (!isTreasurer || selectedUserId === null) return;
    const updatedUsers = users.map(user =>
      user.id === selectedUserId
        ? { ...user, balance: user.balance + parseFloat(amount) }
        : user
    );
    setUsers(updatedUsers);
    setAmount(0);
  };

  if (!currentUser) {
    return (
      <div className="p-6 bg-gradient-to-r from-fuchsia-100 via-sky-100 to-pink-100 min-h-screen flex flex-col items-center justify-center font-sans text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-indigo-600 tracking-tight drop-shadow-md">🔐 Connexion ou Inscription</h1>
        <p className="mb-6 max-w-md text-gray-700 italic">"Gérer vos finances n'a jamais été aussi simple. Inscrivez-vous ou connectez-vous pour commencer."</p>
        <Input
          placeholder="Nom d'utilisateur"
          value={nameInput}
          onChange={e => setNameInput(e.target.value)}
          className="mb-3 w-full max-w-sm h-12 text-lg shadow-inner border-2 border-indigo-300"
        />
        <Input
          placeholder="Mot de passe (laisser vide si nouveau)"
          type="password"
          value={passwordInput}
          onChange={e => setPasswordInput(e.target.value)}
          className="mb-5 w-full max-w-sm h-12 text-lg shadow-inner border-2 border-indigo-300"
        />
        <div className="flex gap-6 flex-col sm:flex-row w-full justify-center">
          <Button onClick={handleLogin} className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 text-lg rounded-full shadow-lg w-full max-w-sm">Connexion</Button>
          <Button onClick={handleRegister} className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 text-lg rounded-full shadow-lg w-full max-w-sm">Inscription</Button>
        </div>
        {loginError && <p className="mt-4 text-red-600 font-semibold italic animate-pulse">{loginError}</p>}
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-sky-50 via-pink-100 to-fuchsia-100 min-h-screen font-sans">
      <h1 className="text-4xl font-extrabold text-center mb-4 text-indigo-700 drop-shadow-sm">💰 Bienvenue {currentUser.name}</h1>
      <p className="text-center mb-10 text-gray-600 italic">"Une bonne gestion de groupe commence par une transparence totale."</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {users.map(user => (
          <Card key={user.id} className="bg-white rounded-3xl shadow-xl border-2 border-indigo-200 hover:shadow-2xl transition duration-300">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-gray-800">👤 {user.name}</h2>
              <p className="text-lg mt-3">💵 Solde : <span className="font-bold text-green-700">{user.balance} €</span></p>
              {currentUser.id === user.id && (
                <p className="text-sm mt-3 text-gray-500 italic">🔑 Mot de passe : {user.password}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {isTreasurer && (
        <div className="mt-12 p-6 bg-white rounded-3xl shadow-lg border-l-4 border-blue-400">
          <h3 className="text-2xl font-bold text-gray-700 mb-4">🧾 Espace Trésorier</h3>
          <p className="mb-4 text-gray-500">Sélectionnez un utilisateur et ajoutez des fonds à son compte</p>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <select
              className="border-2 border-indigo-300 p-3 rounded-md shadow w-full md:w-64"
              onChange={e => setSelectedUserId(parseInt(e.target.value))}
            >
              <option value="">Choisir un utilisateur</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            <Input
              type="number"
              placeholder="Montant à ajouter"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full md:w-40 border-2 border-indigo-300 shadow-inner p-2"
            />
            <Button onClick={handleAddMoney} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow-lg transition w-full md:w-auto">➕ Ajouter</Button>
          </div>
        </div>
      )}
    </div>
  );
}
