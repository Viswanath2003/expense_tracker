const App = () => {
  const [user, setUser] = React.useState(null);
  const [page, setPage] = React.useState("login");
  const [expenses, setExpenses] = React.useState([]);

  // Fetch expenses for the logged-in user
  const fetchExpenses = async (userId) => {
    try {
      const res = await fetch(`/api/expenses/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      } else {
        console.error("Failed to fetch expenses");
      }
    } catch (err) {
      console.error("Error fetching expenses:", err);
    }
  };

  const handleRegister = async (name, salary, username, password) => {
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, salary, username, password })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        // Automatically log in after registration
        await handleLogin(username, password);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Registration failed.");
    }
  };

  const handleLogin = async (username, password) => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setPage("home");
        fetchExpenses(data.user.id);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Login failed.");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setExpenses([]);
    setPage("login");
  };

  const handleAddExpense = async (expenseName, expenseAmount) => {
    if (!expenseName || !expenseAmount || parseFloat(expenseAmount) <= 0) {
      alert("Please enter a valid expense name and amount.");
      return;
    }
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          name: expenseName,
          amount: parseFloat(expenseAmount)
        })
      });
      const data = await res.json();
      if (res.ok) {
        fetchExpenses(user.id); // Refresh the expenses list
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Adding expense failed.");
    }
  };

  if (!user) {
    return page === "login" ? (
      <LoginPage onLogin={handleLogin} onSwitchToRegister={() => setPage("register")} />
    ) : (
      <RegisterPage onRegister={handleRegister} onSwitchToLogin={() => setPage("login")} />
    );
  }

  return (
    <div className="app-container">
      <Navbar onLogout={handleLogout} onNavigate={setPage} />
      <div className="main-content">
        {page === "home" && <HomePage user={user} expenses={expenses} onAddExpense={handleAddExpense} />}
        {page === "about" && <AboutPage />}
      </div>
    </div>
  );
};

// Login Page
const LoginPage = ({ onLogin, onSwitchToRegister }) => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={() => onLogin(username, password)}>Login</button>
      <p>
        Don't have an account? <button onClick={onSwitchToRegister}>Register</button>
      </p>
    </div>
  );
};

// Register Page
const RegisterPage = ({ onRegister, onSwitchToLogin }) => {
  const [name, setName] = React.useState("");
  const [salary, setSalary] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="number" placeholder="Monthly Salary" value={salary} onChange={(e) => setSalary(e.target.value)} />
      <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={() => onRegister(name, parseFloat(salary), username, password)}>Register</button>
      <p>
        Already have an account? <button onClick={onSwitchToLogin}>Login</button>
      </p>
    </div>
  );
};

// Navbar
const Navbar = ({ onLogout, onNavigate }) => (
  <nav className="navbar">
    <div className="navbar-left">
      <a href="#" onClick={() => onNavigate("home")}>Home</a>
      <a href="#" onClick={() => onNavigate("about")}>About</a>
    </div>
    <div className="navbar-right">
      <button onClick={onLogout}>Logout</button>
    </div>
  </nav>
);

// Home Page
const HomePage = ({ user, expenses, onAddExpense }) => {
  const [expenseName, setExpenseName] = React.useState("");
  const [expenseAmount, setExpenseAmount] = React.useState("");

  const handleSubmit = () => {
    onAddExpense(expenseName, expenseAmount);
    setExpenseName("");
    setExpenseAmount("");
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingBalance = user.salary - totalExpenses;

  return (
    <div className="home-page">
      <div className="welcome-message">
        <h2>Welcome, {user.name}!</h2>
        <p>Your monthly salary: ${user.salary.toFixed(2)}</p>
      </div>
      <div className="expense-form">
        <input type="text" placeholder="Expense Name" value={expenseName} onChange={(e) => setExpenseName(e.target.value)} />
        <input type="number" placeholder="Expense Amount" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} />
        <button onClick={handleSubmit}>Add Expense</button>
      </div>
      <table className="expense-table">
        <thead>
          <tr>
            <th>Expense Name</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <td>{expense.name}</td>
              <td>${expense.amount.toFixed(2)}</td>
            </tr>
          ))}
          <tr className="table-summary">
            <td><strong>Total Expenses</strong></td>
            <td><strong>${totalExpenses.toFixed(2)}</strong></td>
          </tr>
          <tr className="table-summary">
            <td><strong>Remaining Balance</strong></td>
            <td className={remainingBalance >= 0 ? "balance-positive" : "balance-negative"}><strong>${remainingBalance.toFixed(2)}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// About Page
const AboutPage = () => (
  <div className="about-page">
    <h2>About Our Expense Tracker</h2>
    <p>Our mission is to provide a simple and efficient way to manage your monthly expenses. By keeping track of your spending, you can gain better control over your finances and work towards your financial goals.</p>
    <p><strong>Motto:</strong> Track, Save, Thrive.</p>
  </div>
);

// Render
const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);
root.render(<App />);
