/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext';
import InvoiceModal from '../components/InvoiceModal';

const MyOrders = () => {
    const [myOrders, setMyOrders] = useState([])
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [showInvoice, setShowInvoice] = useState(false)
    const {currency, axios, user} = useAppContext()

    const fetchMyOrders = async ()=>{
        try {
            const { data } = await axios.get('/api/order/user')
            if(data.success){
                setMyOrders(data.orders)
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(()=>{
        const fetchData = async () => {
            if (user) {
                await fetchMyOrders()
            }
        };
        fetchData();
    },[user])

  return (
    <div className='mt-16 pb-16'>
      <div className='flex flex-col items-end w-max mb-8'>
        <p className='text-2xl font-medium uppercase'>My Orders</p>
        <div className='w-16 h-0.5 bg-primary rounded-full'></div>
      </div>
      {myOrders.map((order, index)=>(
        <div key={index} className='border border-gray-300 rounded-lg mb-10 p-4 py-5 max-w-4xl'>
            <p className='flex justify-between md:items-center text-gray-500 md:font-medium max-md:flex-col'>
                <span>OrderID : {order._id}</span>
                <span>Payment : {order.paymentType}</span>
                <span>Total Amount : {currency}{order.amount}</span>
            </p>
            {order.items.map((item, index)=>(
                item.product && (
                <div key={index}
                className={`relative bg-white text-gray-500/70 ${order.items.length !== index + 1 && "border-b"} border-gray-300 flex flex-col md:flex-row md:items-center justify-between p-4 py-5 md:gap-16 w-full max-w-4xl`}>
                

                    <div className='flex items-center mb-4 md:mb-0'>
                        <div className='bg-primary/10 p-4 rounded-lg'>
                            <img src={item.product.image?.[0]} alt="" className='w-16 h-16'/>
                        </div>
                        <div className='ml-4' >
                            <h2 className='text-xl font-medium text-gray-800'>{item.product.name}</h2>
                            <p>category: {item.product.category}</p>
                        </div>
                    </div>

                    <div className='flex flex-col justify-center md:ml-8 mb-4 md:mb-0'>
                        <p>Quantity: {item.quantity || "1"}</p>
                        <p>Status: {order.status}</p>
                        <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <p className='text-primary text-lg font-medium'>
                        Amount: {currency}{item.product.offerPrice * item.quantity}
                    </p>
                        

                    
                </div>
                )
            ))}
            <div className='flex justify-end mt-4'>
                <button 
                    onClick={() => {
                        setSelectedOrder(order);
                        setShowInvoice(true);
                    }}
                    className='flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dull transition cursor-pointer'
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View Invoice
                </button>
            </div>
        </div>
      ))}

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

export default MyOrders
