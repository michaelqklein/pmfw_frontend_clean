// --- ResetRequestForm.js ---
'use client';

import React, { useState } from 'react';
import '@/src/styles/FormStyle.css';

const ResetRequestForm = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('/api/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        alert('If that email exists, a reset link has been sent.');
      } else {
        const errorData = await response.json();
        alert('Error: ' + errorData.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
    }
  };

  return (
    <form className="reactive-container" onSubmit={handleSubmit}>
      <div className="form-group">
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <button className="general-button" type="submit">Send Reset Link</button>
    </form>
  );
};

export default ResetRequestForm;

