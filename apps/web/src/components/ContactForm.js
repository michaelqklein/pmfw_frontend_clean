'use client';

import React, { useState } from 'react';
import '@/src/styles/FormStyle.css';

const ContactForm = () => {
  // const baseUrl = process.env.NEXT_PUBLIC_EMAIL_PROXY_URL;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('/api/send-email', { 
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          message
        })
      });

      const data = await response.json();  // Change from .text() to .json()
      
      // Extract the message from the JSON response
      setSuccess(data.message);  // Access the 'message' property directly
      setError(null);
    } catch (err) {
      setError(err.message);
      setSuccess(null);
    }
  };

  return (
    <form className="reactive-container" onSubmit={handleSubmit}>
      <div className="form-group">
        <input type="text" placeholder="Name" value={name} onChange={(event) => setName(event.target.value)} />
      </div>
      <div className="form-group">
        <input type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
      </div>
      <div className="form-group">
        <textarea placeholder="Message" value={message} onChange={(event) => setMessage(event.target.value)} />
      </div>
      <button className="general-button" type="submit">Send</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </form>
  );
};

export default ContactForm;
