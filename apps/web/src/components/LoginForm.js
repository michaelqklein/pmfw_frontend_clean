'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { login } from '@/src/interfaces/apiSQLfrontend';
import eventEmitter from '@shared/utils/eventEmitter';
import Link from 'next/link';
import '@/src/styles/FormStyle.css';

const LogInForm = ({ setCurrentPage }) => {
    const [formData, setFormData] = useState({
        loginName: '',
        password: ''
    });
    const { setCurrentUser } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };

    const handleLoginSubmit = async (event) => {
        event.preventDefault();

        try {
            const user = await login(formData);

            const userLoginData = {
                user_ID: user.user_ID,
                firstName: user.First_Name,
                lastName: user.Last_Name,
                email: user.email
            };

            console.log('Login successful:', userLoginData.firstName);
            setCurrentUser(userLoginData);

            eventEmitter.emit('changeLoggedIn', true);

            // Check if we need to redirect to a specific page
            const returnTo = searchParams.get('returnTo');
            const source = searchParams.get('source');
            const newUser = searchParams.get('newUser');
            
            if (returnTo === 'melody-bricks' && source === 'gameOver' && newUser === 'true') {
              // Redirect to melody-bricks with context for new user from game over
              router.push('/melody-bricks?fromLogin=true&source=gameOver&newUser=true');
            } else {
              router.push('/');
            }
        } catch (error) {
            alert(error.message);
            setFormData({ loginName: '', password: '' });
        }
    };

    return (
        <div className="reactive-container">
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Login Name (Email)"
                        name="loginName"
                        value={formData.loginName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <input
                        type="password"
                        placeholder="Password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="flex items-center justify-between">
                    <button className="general-button" type="submit">Log In</button>
                    <span className="ml-4 text-sm">
                        <Link href="/reset-request" className="text-green-600 hover:underline auth-link">
                            Forgot
                        </Link>{' '}your password?
                    </span>
                </div>
            </form>

            <div className="auth-links-container mt-4">
                <p>
                    Don’t have an account?{' '}
                    <Link href="/sign-up" className="text-green-600 hover:underline auth-link">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LogInForm;
