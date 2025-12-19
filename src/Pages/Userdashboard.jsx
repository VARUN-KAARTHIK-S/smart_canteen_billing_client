import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import '../css/Userdashboard.css'

const Userdashboard = () => {
    const [menuItems, setMenuItems] = useState([])
    const [cart, setCart] = useState([])
    const [orders, setOrders] = useState([])
    useEffect(() => {
        fetchMenuItems()
        fetchOrders()
    }, [])

    useEffect(() => {
        const handleFocus = () => {
            fetchOrders()
        }
        window.addEventListener('focus', handleFocus)
        return () => window.removeEventListener('focus', handleFocus)
    }, [])

    const fetchMenuItems = async () => {
        try {
            const response = await axios.get('https://smart-canteen-billing-server.onrender.com/scp/menu')
            setMenuItems(response.data)
            localStorage.setItem('menuItems', JSON.stringify(response.data))
        } catch (error) {
            console.error('Error fetching menu:', error)
            const savedMenu = localStorage.getItem('menuItems')
            if (savedMenu) {
                setMenuItems(JSON.parse(savedMenu))
            } else {
                // Mock data removed to prevent misleading inventory.
                setMenuItems([])
            }
        }
    }

    const fetchOrders = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'))
            if (user) {
                try {
                    const response = await axios.get(`https://smart-canteen-billing-server.onrender.com/scp/orders/${user.email}`)
                    const activeOrders = response.data.filter(order => order.collected !== true)
                    setOrders(activeOrders)
                    localStorage.setItem('currentOrders', JSON.stringify(activeOrders))
                } catch (apiError) {
                    const savedOrders = localStorage.getItem('currentOrders')
                    if (savedOrders) {
                        setOrders(JSON.parse(savedOrders))
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching orders:', error)
        }
    }

    const addToCart = async (itemId) => {
        const item = menuItems.find(item => item._id === itemId)
        if (item && item.quantity > 0) {
            // Do not decrement local menuItems state.
            // Only update cart.
            setCart(prev => {
                const existingItem = prev.find(cartItem => cartItem._id === itemId)
                if (existingItem) {
                    return prev.map(cartItem =>
                        cartItem._id === itemId
                            ? { ...cartItem, cartQuantity: cartItem.cartQuantity + 1 }
                            : cartItem
                    )
                } else {
                    return [...prev, { ...item, cartQuantity: 1 }]
                }
            })
        }
    }

    const getCartQuantity = (itemId) => {
        const cartItem = cart.find(item => item._id === itemId)
        return cartItem ? cartItem.cartQuantity : 0
    }

    const getTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.cartQuantity), 0)
    }

    const placeOrder = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'))
            const orderId = Date.now().toString()
            const orderData = {
                orderId,
                userId: user?.email || 'guest',
                userName: user?.name || 'Guest',
                userEmail: user?.email || 'guest@example.com',
                items: [...cart],
                total: getTotal()
            }

            const newOrder = {
                orderId,
                userId: user?.email || 'guest',
                userName: user?.name || 'Guest',
                userEmail: user?.email || 'guest@example.com',
                items: [...cart],
                total: getTotal(),
                orderTime: new Date(),
                collected: false
            }

            try {
                // Use production Render URL
                await axios.post('https://smart-canteen-billing-server.onrender.com/scp/orders', orderData)
                setOrders(prev => [newOrder, ...prev])
                setCart([])
                localStorage.setItem('currentOrders', JSON.stringify([newOrder, ...orders]))
                // Refresh menu items to reflect new stock
                fetchMenuItems();
            } catch (apiError) {
                console.log('API not available, using local storage')
                setOrders(prev => [newOrder, ...prev])
                setCart([])
                localStorage.setItem('currentOrders', JSON.stringify([newOrder, ...orders]))
            }
            console.log('Order placed:', newOrder)
        } catch (error) {
            console.error('Error placing order:', error)
        }
    }

    const collectOrder = async (orderId) => {
        try {
            const updatedOrders = orders.filter(order => order.orderId !== orderId)
            setOrders(updatedOrders)
            localStorage.setItem('currentOrders', JSON.stringify(updatedOrders))

            try {
                // Use production Render URL
                await axios.put(`https://smart-canteen-billing-server.onrender.com/scp/orders/${orderId}`, {
                    collected: true,
                    collectedTime: new Date()
                })
            } catch (apiError) {
                console.log('API not available, using local storage')
            }
        } catch (error) {
            console.error('Error collecting order:', error)
        }
    }

    return (
        <div className="outer-user">
            {/* ... [header omitted] ... */}
            <div className='top-user'>
                <div className="left">
                    <p className="tit">Smart_Canteen_Billing</p>
                </div>
                <div className="right">
                    <Link to='/order-history' className="history-link">
                        <button className="history-btn">Order History</button>
                    </Link>
                    <p className="tname">{JSON.parse(localStorage.getItem('user') || '{}').name || 'User'}</p>
                    <span className="logout-btn">
                        <Link to='/' className="logout" onClick={() => {
                            localStorage.removeItem('user')
                            localStorage.removeItem('token')
                            localStorage.removeItem('currentOrders')
                        }}>
                            <button className="logout-btn">Logout</button>
                        </Link>
                    </span>
                </div>
            </div>

            <div className="body">
                <div className="menuitemsp">
                    {menuItems.map(item => (
                        <div key={item._id} className="menu-items">
                            <div className="menu-img">
                                <img src={item.image || "https://via.placeholder.com/150"} alt={item.name} />
                            </div>
                            <div className="menu-details">
                                <h3>{item.name}</h3>
                                <p>Price: ₹{item.price}</p>
                                <p>Available: {item.quantity}</p>
                                <button
                                    className="add"
                                    onClick={() => addToCart(item._id)}
                                    disabled={getCartQuantity(item._id) >= item.quantity}
                                >
                                    {item.quantity === 0 ? 'Out of Stock' : (getCartQuantity(item._id) >= item.quantity ? 'Limit Reached' : 'Add to Cart')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="right-panel">
                    <div className="cart">
                        <h2>Cart</h2>
                        {cart.length === 0 ? (
                            <p>Cart is empty</p>
                        ) : (
                            <>
                                {cart.map(item => (
                                    <div key={item._id} className="cart-item">
                                        <p>{item.name} x {item.cartQuantity}</p>
                                        <p>₹{item.price * item.cartQuantity}</p>
                                    </div>
                                ))}
                                <div className="cart-total">
                                    <h3>Total: ₹{getTotal()}</h3>
                                    <button className="place-order" onClick={placeOrder}>
                                        Place Order
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="orders">
                        <h2>My Orders</h2>
                        {orders.length === 0 ? (
                            <p>No orders yet</p>
                        ) : (
                            orders.map(order => (
                                <div key={order.orderId} className="order-item">
                                    <div className="order-header">
                                        <h4>Order #{order.orderId}</h4>
                                    </div>
                                    <p>Time: {new Date(order.orderTime).toLocaleString()}</p>
                                    <p>Total: ₹{order.total}</p>
                                    <div className="order-items">
                                        {order.items.map(item => (
                                            <span key={item._id}>{item.name} x{item.cartQuantity} </span>
                                        ))}
                                    </div>
                                    <button
                                        className="collect-btn"
                                        onClick={() => collectOrder(order.orderId)}
                                    >
                                        I Got My Order
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Userdashboard
