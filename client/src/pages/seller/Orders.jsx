import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import { assets, dummyOrders } from '../../assets/assets'
import toast from 'react-hot-toast'
import InvoiceModal from '../../components/InvoiceModal'

const Orders = () => {
  const {currency, axios} = useAppContext() 
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showInvoice, setShowInvoice] = useState(false)

  const fetchOrders = async () =>{
        try {
            const {data} = await axios.get('/api/order/seller');
            if (data.success) {
                // Sort orders by date (newest first)
                const sortedOrders = data.orders.sort((a, b) => 
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                setOrders(sortedOrders)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
  };

  // Backend payment status update
  const updatePaymentStatus = async (orderId, isPaid) => {
    try {
        const { data } = await axios.post('/api/order/update-payment', { orderId, isPaid });
        if (data.success) {
            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order._id === orderId 
                        ? { ...order, isPaid } 
                        : order
                )
            );
            toast.success(data.message);
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error(error.message);
    }
  };


    useEffect(()=>{
        fetchOrders();
    },[])



  return (
    <div className='no-scrollbar flex-1 h-[95vh] overflow-y-scroll'>
    <div className="md:p-10 p-4 space-y-4">
            <h2 className="text-lg font-medium">Orders List</h2>
            {orders && orders.length > 0 ? (
                orders.map((order, index) => (
                    <div key={index} className="flex flex-col md:items-center md:flex-row gap-5 justify-between p-5 max-w-4xl rounded-md border border-gray-300">

                        <div className="flex gap-5 max-w-80">
                            <img className="w-12 h-12 object-cover" src={assets.box_icon} alt="boxIcon" />
                            <div>
                                {order.items && order.items.length > 0 ? (
                                    order.items.map((item, index) => (
                                        <div key={index} className="flex flex-col">
                                            <p className="font-medium">
                                                {item.product ? item.product.name : 'Product not available'}{" "}
                                                <span className="text-primary">x {item.quantity}</span>
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-red-500">No items in order</p>
                                )}
                            </div>
                        </div>

                        <div className="text-sm md:text-base text-black/60">
                            {order.address ? (
                                <>
                                    <p className='text-black/80'>
                                        {order.address.firstName} {order.address.lastName}
                                    </p>
                                    <p>{order.address.street}, {order.address.city}</p>
                                    <p>{order.address.state}, {order.address.zipcode}, {order.address.country}</p>
                                    <p></p>
                                    <p>{order.address.phone}</p>
                                </>
                            ) : (
                                <p className='text-red-500'>Address not available</p>
                            )}
                        </div>

                        <p className="font-medium text-lg my-auto">
                        {currency}{order.amount}</p>

                        <div className="flex flex-col text-sm">
                            <p>Method: {order.paymentType}</p>
                            <p>Date: {new Date(order.createdAt).toLocaleString()}</p>
                            
                            {/* Payment Status Toggle */}
                            <div className="flex items-center gap-2 mt-1">
                                <span>Payment:</span>
                                <select 
                                    value={order.isPaid ? "paid" : "pending"}
                                    onChange={(e) => updatePaymentStatus(order._id, e.target.value === "paid")}
                                    className={`px-2 py-1 rounded text-xs font-medium cursor-pointer outline-none border ${
                                        order.isPaid 
                                            ? 'bg-green-100 text-green-700 border-green-300' 
                                            : 'bg-yellow-100 text-yellow-700 border-yellow-300'
                                    }`}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                </select>
                            </div>
                            
                            <button 
                                onClick={() => {
                                    setSelectedOrder(order);
                                    setShowInvoice(true);
                                }}
                                className='flex items-center gap-2 mt-2 px-3 py-1.5 bg-primary text-white text-xs rounded-md hover:bg-primary-dull transition cursor-pointer'
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Invoice
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-center text-gray-500">No orders found.</p>
            )}
        </div>

        {/* Invoice Modal */}
        <InvoiceModal 
            order={selectedOrder} 
            isOpen={showInvoice} 
            onClose={() => {
                setShowInvoice(false);
                setSelectedOrder(null);
            }} 
        />
        </div>
  )
}

export default Orders
