import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import axios from 'axios';
import "../css/Admindash.css";

const Admindash = () => {
    const [activeTab, setActiveTab] = useState('menu')
    const [menu, setMenu] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({
        name: "",
        price: "",
        quantity: "",
        image: ""
    });

    useEffect(() => {
        fetchMenu()
        fetchOrders()
        fetchUsers()
    }, [])

    const fetchMenu = async () => {
        try {
            const response = await axios.get('http://localhost:5000/scp/menu')
            setMenu(response.data)
        } catch (error) {
            console.error('Error fetching menu:', error)
        }
    }

    const fetchOrders = async () => {
        try {
            const response = await axios.get('http://localhost:5000/scp/orders/all')
            setOrders(response.data)
        } catch (error) {
            console.error('Error fetching orders:', error)
        }
    }

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:5000/scp/users')
            setUsers(response.data)
        } catch (error) {
            console.error('Error fetching users:', error)
        }
    }

    const addItem = async () => {
        if (!form.name || !form.price || !form.quantity) return;

        try {
            const newItem = {
                name: form.name,
                price: Number(form.price),
                quantity: Number(form.quantity),
                image: form.image || 'https://via.placeholder.com/150'
            }

            await axios.post('http://localhost:5000/scp/menu', newItem)
            fetchMenu()
            setForm({ name: "", price: "", quantity: "", image: "" })
        } catch (error) {
            console.error('Error adding item:', error)
        }
    };

    const updateItem = async (id, field, value) => {
        try {
            const updateData = { [field]: field === 'name' ? value : Number(value) }
            await axios.put(`http://localhost:5000/scp/menu/${id}`, updateData)
            fetchMenu()
        } catch (error) {
            console.error('Error updating item:', error)
        }
    };

    const deleteItem = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/scp/menu/${id}`)
            fetchMenu()
        } catch (error) {
            console.error('Error deleting item:', error)
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            await axios.put(`http://localhost:5000/scp/orders/${orderId}`, { status })
            fetchOrders()
        } catch (error) {
            console.error('Error updating order:', error)
        }
    }

    const deleteUser = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await axios.delete(`http://localhost:5000/scp/users/${id}`)
                fetchUsers()
            } catch (error) {
                console.error('Error deleting user:', error)
            }
        }
    }

    return (
        <div className="admin-body">
            <div className="admin-header">
                <h2 className="admin-title">Admin Dashboard</h2>
                <Link to="/" className="logout-link">
                    <button className="logout-btn" onClick={() => {
                        localStorage.removeItem('user')
                        localStorage.removeItem('token')
                    }}>Logout</button>
                </Link>
            </div>

            <div className="admin-tabs">
                <button
                    className={`tab-btn ${activeTab === 'menu' ? 'active' : ''}`}
                    onClick={() => setActiveTab('menu')}
                >
                    Menu Management
                </button>
                <button
                    className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    Orders ({orders.length})
                </button>
                <button
                    className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    Users
                </button>
            </div>

            {activeTab === 'menu' && (
                <div className="tab-content">
                    <div className="admin-form">
                        <input
                            placeholder="Item Name"
                            value={form.name}
                            className="a"
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Price"
                            value={form.price}
                            className="a"
                            onChange={(e) => setForm({ ...form, price: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Quantity"
                            value={form.quantity}
                            className="a"
                            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                        />
                        <input
                            placeholder="Image URL (optional)"
                            value={form.image}
                            className="a"
                            onChange={(e) => setForm({ ...form, image: e.target.value })}
                        />
                        <button className="admin-btn" onClick={addItem}>
                            Add Item
                        </button>
                    </div>

                    <div className="menu-grid">
                        {menu.map(item => (
                            <div className="menu-card" key={item._id}>
                                <h4>{item.name}</h4>
                                <img src={item.image} alt={item.name} className="menu-image" />
                                <input
                                    type="number"
                                    value={item.price}
                                    onChange={(e) =>
                                        updateItem(item._id, "price", e.target.value)
                                    }
                                />
                                <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) =>
                                        updateItem(item._id, "quantity", e.target.value)
                                    }
                                />
                                <button
                                    className="delete-btn"
                                    onClick={() => deleteItem(item._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'orders' && (
                <div className="tab-content">
                    <div className="orders-grid">
                        {orders.map(order => (
                            <div className="order-card" key={order.orderId}>
                                <div className="order-header">
                                    <h4>Order #{order.orderId}</h4>
                                </div>
                                <p><strong>Customer:</strong> {order.userName}</p>
                                <p><strong>Email:</strong> {order.userEmail}</p>
                                <p><strong>Time:</strong> {new Date(order.orderTime).toLocaleString()}</p>
                                <p><strong>Total:</strong> ₹{order.total}</p>
                                <div className="order-items">
                                    {order.items?.map(item => (
                                        <span key={item._id}>{item.name} x{item.cartQuantity} </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="tab-content">
                    <div className="users-grid">
                        {users.map(user => (
                            <div className="user-card" key={user.id}>
                                <h4>{user.name}</h4>
                                <p><strong>Email:</strong> {user.email}</p>
                                <p><strong>Role:</strong> {user.role}</p>
                                <span className={`role-badge ${user.role}`}>
                                    {user.role.toUpperCase()}
                                </span>
                                {user.role !== 'admin' && (
                                    <button
                                        className="delete-btn"
                                        style={{
                                            marginTop: '10px',
                                            padding: '5px 10px',
                                            fontSize: '12px',
                                            height: 'auto'
                                        }}
                                        onClick={() => deleteUser(user._id)}
                                    >
                                        Remove User
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admindash;