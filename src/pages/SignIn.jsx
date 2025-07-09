import React, { useState } from 'react';
import axios from 'axios';

function SignIn() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/users/signin', { username, password });
            console.log('Sign in successful:', response.data);
            alert('Sign in successful! Token: ' + response.data);
            // You might want to store the token in localStorage or a state management solution
        } catch (error) {
            console.error('Sign in failed:', error);
            alert('Sign in failed!');
        }
    };

    return (
        <div>
            <h2>Sign In</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username:</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div>
                    <label>Password:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit">Sign In</button>
            </form>
        </div>
    );
}

export default SignIn;
