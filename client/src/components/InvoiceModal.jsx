import React, { useRef, useState } from 'react';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const InvoiceModal = ({ order, isOpen, onClose }) => {
    const { currency } = useAppContext();
    const invoiceRef = useRef();
    const [downloading, setDownloading] = useState(false);

    if (!isOpen || !order) return null;

    const handleDownloadPDF = async () => {
        try {
            setDownloading(true);
            const element = invoiceRef.current;
            
            // Clone the element to avoid modifying the original
            const clone = element.cloneNode(true);
            clone.style.position = 'absolute';
            clone.style.left = '-9999px';
            clone.style.top = '0';
            clone.style.backgroundColor = '#ffffff';
            document.body.appendChild(clone);

            // Function to convert any color to RGB
            const convertToRGB = (color) => {
                if (!color || color === 'transparent' || color === 'inherit' || color === 'initial') {
                    return color;
                }
                
                // Create a temporary element to compute the color
                const temp = document.createElement('div');
                temp.style.color = color;
                temp.style.display = 'none';
                document.body.appendChild(temp);
                
                const computedColor = window.getComputedStyle(temp).color;
                document.body.removeChild(temp);
                
                return computedColor;
            };

            // Process all elements in the clone to convert oklch colors
            const allElements = clone.querySelectorAll('*');
            allElements.forEach(el => {
                const style = window.getComputedStyle(el);
                
                // Convert background color
                if (style.backgroundColor && style.backgroundColor.includes('oklch')) {
                    el.style.backgroundColor = convertToRGB(style.backgroundColor);
                }
                
                // Convert text color
                if (style.color && style.color.includes('oklch')) {
                    el.style.color = convertToRGB(style.color);
                }
                
                // Convert border color
                if (style.borderColor && style.borderColor.includes('oklch')) {
                    el.style.borderColor = convertToRGB(style.borderColor);
                }
            });

            const canvas = await html2canvas(clone, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                removeContainer: true,
                onclone: (clonedDoc) => {
                    // Additional cleanup if needed
                    const clonedElement = clonedDoc.body.querySelector('[data-invoice]') || clonedDoc.body;
                    return clonedElement;
                }
            });

            // Remove the clone
            document.body.removeChild(clone);

            const imgData = canvas.toDataURL('image/png', 1.0);
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min((pdfWidth - 10) / imgWidth, (pdfHeight - 20) / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 10;

            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save(`Invoice-${order._id.slice(-8).toUpperCase()}.pdf`);
        } catch (error) {
            console.error('PDF Download Error:', error);
            alert('Failed to download PDF. Please try again. Error: ' + error.message);
        } finally {
            setDownloading(false);
        }
    };

    // Calculate subtotal
    const subtotal = order.items?.reduce((acc, item) => {
        const price = item.product?.offerPrice || 0;
        return acc + (price * item.quantity);
    }, 0) || 0;

    // Tax is 10%
    const tax = Math.floor(subtotal * 0.10 * 100) / 100;
    const total = order.amount || (subtotal + tax);

    return (
        <div 
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                padding: '16px'
            }} 
            onClick={onClose}
        >
            <div 
                style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    maxWidth: '672px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }} 
                onClick={e => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    borderBottom: '1px solid #e5e7eb'
                }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', margin: 0 }}>Invoice</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                            onClick={handleDownloadPDF}
                            disabled={downloading}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                backgroundColor: '#4fbf8b',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: downloading ? 'not-allowed' : 'pointer',
                                opacity: downloading ? 0.5 : 1,
                                fontSize: '14px',
                                fontWeight: '500'
                            }}
                        >
                            {downloading ? (
                                <>
                                    <svg style={{ animation: 'spin 1s linear infinite', height: '20px', width: '20px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '20px', width: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download PDF
                                </>
                            )}
                        </button>
                        <button onClick={onClose} style={{ color: '#6b7280', cursor: 'pointer', background: 'none', border: 'none', padding: '4px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '24px', width: '24px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Invoice Content - Using inline styles for PDF compatibility */}
                <div ref={invoiceRef} style={{ padding: '32px', backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }}>
                    {/* Invoice Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                        <div>
                            <img src={assets.logo} alt="GreenCart" style={{ height: '40px', marginBottom: '8px' }} />
                            <p style={{ color: '#6b7280', fontSize: '14px', margin: '2px 0' }}>Fresh Groceries Delivered</p>
                            <p style={{ color: '#6b7280', fontSize: '14px', margin: '2px 0' }}>Dhaka, Bangladesh</p>
                            <p style={{ color: '#6b7280', fontSize: '14px', margin: '2px 0' }}>support@greencart.com</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#4fbf8b', marginBottom: '8px' }}>INVOICE</h1>
                            <p style={{ color: '#4b5563', fontSize: '14px', margin: '2px 0' }}>
                                <span style={{ fontWeight: '500' }}>Invoice No:</span> INV-{order._id?.slice(-8).toUpperCase()}
                            </p>
                            <p style={{ color: '#4b5563', fontSize: '14px', margin: '2px 0' }}>
                                <span style={{ fontWeight: '500' }}>Date:</span> {new Date(order.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                            <span style={{ 
                                fontSize: '12px', 
                                marginTop: '4px', 
                                padding: '4px 8px', 
                                borderRadius: '4px', 
                                display: 'inline-block',
                                backgroundColor: order.isPaid ? '#dcfce7' : '#fef9c3',
                                color: order.isPaid ? '#15803d' : '#a16207'
                            }}>
                                {order.isPaid ? 'PAID' : 'PENDING'}
                            </span>
                        </div>
                    </div>

                    {/* Billing Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
                        <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
                            <h3 style={{ fontWeight: '600', color: '#374151', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bill To:</h3>
                            {order.address ? (
                                <>
                                    <p style={{ fontWeight: '500', color: '#1f2937', margin: '2px 0' }}>{order.address.firstName} {order.address.lastName}</p>
                                    <p style={{ color: '#4b5563', fontSize: '14px', margin: '2px 0' }}>{order.address.street}</p>
                                    <p style={{ color: '#4b5563', fontSize: '14px', margin: '2px 0' }}>{order.address.city}, {order.address.state} {order.address.zipcode}</p>
                                    <p style={{ color: '#4b5563', fontSize: '14px', margin: '2px 0' }}>{order.address.country}</p>
                                    <p style={{ color: '#4b5563', fontSize: '14px', margin: '6px 0 2px 0' }}>{order.address.phone}</p>
                                    <p style={{ color: '#4b5563', fontSize: '14px', margin: '2px 0' }}>{order.address.email}</p>
                                </>
                            ) : (
                                <p style={{ color: '#6b7280' }}>Address not available</p>
                            )}
                        </div>
                        <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
                            <h3 style={{ fontWeight: '600', color: '#374151', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment Details:</h3>
                            <p style={{ color: '#4b5563', fontSize: '14px', margin: '2px 0' }}><span style={{ fontWeight: '500' }}>Method:</span> {order.paymentType}</p>
                            <p style={{ color: '#4b5563', fontSize: '14px', margin: '2px 0' }}><span style={{ fontWeight: '500' }}>Status:</span> {order.status}</p>
                            <p style={{ color: '#4b5563', fontSize: '14px', margin: '2px 0' }}><span style={{ fontWeight: '500' }}>Order ID:</span> {order._id}</p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div style={{ marginBottom: '32px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#4fbf8b', color: '#ffffff' }}>
                                    <th style={{ textAlign: 'left', padding: '12px 16px', borderTopLeftRadius: '8px' }}>Item</th>
                                    <th style={{ textAlign: 'center', padding: '12px 16px' }}>Qty</th>
                                    <th style={{ textAlign: 'right', padding: '12px 16px' }}>Price</th>
                                    <th style={{ textAlign: 'right', padding: '12px 16px', borderTopRightRadius: '8px' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items?.map((item, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: index % 2 === 0 ? '#f9fafb' : '#ffffff' }}>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                {item.product?.image?.[0] && (
                                                    <img src={item.product.image[0]} alt={item.product?.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                                )}
                                                <div>
                                                    <p style={{ fontWeight: '500', color: '#1f2937', margin: 0 }}>{item.product?.name || 'Product'}</p>
                                                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{item.product?.category}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '12px 16px', color: '#4b5563' }}>{item.quantity}</td>
                                        <td style={{ textAlign: 'right', padding: '12px 16px', color: '#4b5563' }}>{currency}{item.product?.offerPrice || 0}</td>
                                        <td style={{ textAlign: 'right', padding: '12px 16px', fontWeight: '500', color: '#1f2937' }}>
                                            {currency}{(item.product?.offerPrice || 0) * item.quantity}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ width: '256px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#4b5563' }}>
                                <span>Subtotal:</span>
                                <span>{currency}{subtotal.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#4b5563' }}>
                                <span>Shipping:</span>
                                <span style={{ color: '#16a34a' }}>Free</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#4b5563' }}>
                                <span>Tax (10%):</span>
                                <span>{currency}{tax.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '2px solid #4fbf8b', marginTop: '8px' }}>
                                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>Total:</span>
                                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#4fbf8b' }}>{currency}{total}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
                        <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 4px 0' }}>Thank you for shopping with GreenCart!</p>
                        <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>If you have any questions, contact us at support@greencart.com</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '16px', fontSize: '12px', color: '#9ca3af' }}>
                            <span>🌿 Fresh Quality</span>
                            <span>•</span>
                            <span>🚚 Fast Delivery</span>
                            <span>•</span>
                            <span>💚 Customer First</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceModal;
