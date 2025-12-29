'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import '@/src/styles/FormStyle.css';

const SignUpForm = ({ setCurrentPage }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    tips: false,
    features: false
  });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch('/api/add-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          First_Name: formData.firstName,
          Last_Name: formData.lastName,
          email: formData.email,
          password: formData.password,
          tips: formData.tips,           // ✅ included
          features: formData.features    // ✅ included
        })
      });

      if (response.ok) {
        alert('User added successfully');
        
        // Check if we need to redirect back to a specific page after login
        const returnTo = searchParams.get('returnTo');
        const source = searchParams.get('source');
        
        if (returnTo && source) {
          // Pass the parameters to login page
          router.push(`/login?returnTo=${returnTo}&source=${source}&newUser=true`);
        } else {
          router.push('/login');
        }
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
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <input
          type="email"
          name="email"
          placeholder="Email (Login Name)"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
      </div>

      <div className="flex items-center mt-6 mb-4">
        <input
          type="checkbox"
          name="tips"
          checked={formData.tips}
          onChange={handleChange}
          className="w-5 h-5 accent-green-700 mr-3 shrink-0"
        />
        <span className="flex-1">Yes, I would like to receive ear training tips.</span>
      </div>

      <div className="flex items-center mt-6 mb-4">
        <input
          type="checkbox"
          name="features"
          checked={formData.features}
          onChange={handleChange}
          className="w-5 h-5 accent-green-700 mr-3 shrink-0"
        />
        <span className="flex-1">Yes, I am happy to receive information about new features.</span>
      </div>

      <button className="general-button" type="submit">Sign Up</button>
    </form>
  );
}

export default SignUpForm;
