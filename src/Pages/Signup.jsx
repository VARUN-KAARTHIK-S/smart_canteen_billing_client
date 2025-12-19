import React, { useState } from 'react'
import '../css/Signup.css'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const Signup = () => {

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSignup = async () => {
    if (!username || !email || !password) {
      alert("Please fill all fields")
      return;
    }
    try {
      await axios.post('http://localhost:5000/scp/signup', {
        name: username,
        email,
        password
      })
      alert("Signup Successful!")
      navigate('/login')
    } catch (err) {
      console.log(err)
      alert("Signup Failed")
    }
  }

  return (
    <div className="body">
      <div>
        <h3 className="sh">Sign up today, skip the queue tomorrow</h3>

        <div className="osignup">
          <div className="signup">

            <input
              type="text"
              className="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              type="email"
              className="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              className="pass"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button className="signup-btn" onClick={handleSignup}>SignUp</button>


            <Link to="/login" className="new">
              Already have an account? <span className="newl">Login</span>
            </Link>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
