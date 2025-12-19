import React from 'react'
import Landing from './Pages/Landing'
import Login from './Pages/Login'
import Signup from './Pages/Signup'
import Home from './Pages/Home'
import Userdashboard from './Pages/Userdashboard'
import OrderHistory from './Pages/OrderHistory'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Admindash from './Pages/Admindash'

const App = () => {
  return (
    <div>

      <Router>
        <div>
          <Routes>
            <Route path='/user-dash' element={<Userdashboard />}></Route>
            <Route path='/order-history' element={<OrderHistory />}></Route>
            <Route path='/home' element={<Home />}></Route>
            <Route path='/' element={<Landing />}></Route>
            <Route path='/login' element={<Login />}></Route>
            <Route path='/signup' element={<Signup />}></Route>
            <Route path='/admin-dash' element={<Admindash />}></Route>
          </Routes>
        </div>
      </Router>
    </div>
  )
}

export default App