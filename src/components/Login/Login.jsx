import React, { useState, useEffect } from "react";
import axios from 'axios';
import './Login.css';

const Login = (state) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const backUrl = process.env.REACT_APP_BACK_URL;

    const changeUsername = (event) => {
        setUsername(event.target.value);
        
      };
    const changePassword = (event) => {
        setPassword(event.target.value);        
    };

    const handleSubmit = () => {

        axios.post(backUrl+'/api/auth/local', {
          identifier: username,
          password: password,
        })
        .then(response => {
          console.log('User profile', response.data.user);
          console.log('User token', response.data.jwt);
          localStorage.setItem('token', response.data.jwt);
          window.location.href = '/orders';
        })
        .catch(error => {
            
            alert(error.response.data.error.message);
            console.log('An error occurred:', error.response.data.error);
        });
    }    
    return (
        <div className="login-detail">
            <div className="inputs-form">
                <label>Username
                <input className={'input'} type="text" placeholder="Username" value={username} onChange={changeUsername} />
                </label>
                <label>Password
                <input className={'input'} type="password" placeholder="Password" value={password} onChange={changePassword} />
                </label>
                <button  className="button" onClick={handleSubmit}>Авторизация</button>
            </div>
        </div>);
}
export default Login;

