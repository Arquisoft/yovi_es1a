import React, { useState } from 'react';

const RegisterForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setResponseMessage(null);
    setError(null);

    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('Please enter valid data.');
      return;
    }

    setLoading(true);
    try {
      //import.meta.env.VITE_API_URL
      //'http://localhost:3000'
      const API_URL = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API_URL}/createuser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      });

      const data = await res.json();
      //if the server answers ok
      if (res.ok) {
        //Clean the form
        setResponseMessage(data.message);
        setUsername('');
        setEmail('');
        setPassword('');
      } else {
        setError(data.error || 'Server error');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false); // Whatever happens, stop showing the loading status
    }
  };

  return (
    <form onSubmit={handleSubmit} className="register-form">
      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          value={username} // stores all the letters entered into the box
          onChange={(e) => setUsername(e.target.value)} // value on the box
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-input"
          required
        />
      </div>
      {/* disable the button to prevent double clicking (double registration)  -> disabled={loading}*/}
      <button type="submit" className="submit-button" disabled={loading}> 
        {loading ? 'Entering...' : 'Lets go!'}
      </button>
      
      {responseMessage && (
        <div className="success-message" style={{ marginTop: 12, color: 'green' }}>
          {responseMessage}
        </div>
      )}

      {error && (
        <div className="error-message" style={{ marginTop: 12, color: 'red' }}>
          {error}
        </div>
      )}
    </form>
  );
};

export default RegisterForm;
