import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import '../css/OrderHistory.css'

const OrderHistory = () => {
    const [orderHistory, setOrderHistory] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchOrderHistory()
    }, [])

    const fetchOrderHistory = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'))
            if (user && user.email) {
                try {
                    const response = await axios.get(`http://localhost:5000/scp/orders/history/${user.email}`)
                    setOrderHistory(response.data)
                    localStorage.setItem('orderHistory', JSON.stringify(response.data))
                } catch (apiError) {
                    const savedHistory = localStorage.getItem('orderHistory')
                    if (savedHistory) {
                        setOrderHistory(JSON.parse(savedHistory))
                    }
                }
            }
            setLoading(false)
        } catch (error) {
            console.error('Error fetching order history:', error)
            setLoading(false)
        }
    }

    if (loading) return <div className="loading">Loading order history...</div>

    return (
        <div className="history-container">
            <div className="history-header">
                <h1>Order History</h1>
                <Link to="/user-dash" className="back-btn">
                    <button>Back to Dashboard</button>
                </Link>
            </div>

            <div className="history-content">
                {orderHistory.length === 0 ? (
                    <p className="no-history">No order history found</p>
                ) : (
                    orderHistory.map(order => (
                        <div key={order.orderId} className="history-item">
                            <div className="history-header-item">
                                <h3>Order #{order.orderId}</h3>
                            </div>
                            <div className="history-details">
                                <p><strong>Ordered:</strong> {new Date(order.orderTime).toLocaleString()}</p>
                                {order.collectedTime && <p><strong>Collected:</strong> {new Date(order.collectedTime).toLocaleString()}</p>}
                                <p><strong>Total:</strong> ₹{order.total}</p>
                            </div>
                            <div className="history-items">
                                <h4>Items:</h4>
                                {order.items.map(item => (
                                    <div key={item._id} className="history-item-detail">
                                        <span>{item.name} x {item.cartQuantity}</span>
                                        <span>₹{item.price * item.cartQuantity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default OrderHistory