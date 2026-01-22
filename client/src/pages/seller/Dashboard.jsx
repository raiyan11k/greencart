import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const { axios, currency, products } = useAppContext();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        totalCustomers: 0,
        paidOrders: 0,
        pendingOrders: 0,
        codOrders: 0,
        onlineOrders: 0,
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/order/seller');
            if (data.success) {
                setOrders(data.orders);
                calculateStats(data.orders);
                setRecentOrders(data.orders.slice(0, 5));
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (ordersData) => {
        // Basic stats
        const totalOrders = ordersData.length;
        const totalRevenue = ordersData.reduce((acc, order) => acc + order.amount, 0);
        const totalProducts = products.length;
        
        // Get unique customers
        const uniqueCustomers = new Set(ordersData.map(order => order.userId));
        const totalCustomers = uniqueCustomers.size;

        // Payment stats
        const paidOrders = ordersData.filter(order => order.isPaid).length;
        const pendingOrders = ordersData.filter(order => !order.isPaid).length;
        const codOrders = ordersData.filter(order => order.paymentType === 'COD').length;
        const onlineOrders = ordersData.filter(order => order.paymentType === 'Online').length;

        setStats({
            totalOrders,
            totalRevenue,
            totalProducts,
            totalCustomers,
            paidOrders,
            pendingOrders,
            codOrders,
            onlineOrders,
        });

        // Category breakdown
        const categoryMap = {};
        ordersData.forEach(order => {
            order.items?.forEach(item => {
                const category = item.product?.category || 'Unknown';
                if (!categoryMap[category]) {
                    categoryMap[category] = { count: 0, revenue: 0 };
                }
                categoryMap[category].count += item.quantity;
                categoryMap[category].revenue += (item.product?.offerPrice || 0) * item.quantity;
            });
        });
        
        const categoryArray = Object.entries(categoryMap).map(([name, data]) => ({
            name,
            count: data.count,
            revenue: data.revenue
        })).sort((a, b) => b.revenue - a.revenue);
        
        setCategoryData(categoryArray);

        // Monthly data for last 6 months
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyMap = {};
        const now = new Date();
        
        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${date.getFullYear()}-${date.getMonth()}`;
            monthlyMap[key] = { 
                month: monthNames[date.getMonth()], 
                orders: 0, 
                revenue: 0 
            };
        }

        ordersData.forEach(order => {
            const date = new Date(order.createdAt);
            const key = `${date.getFullYear()}-${date.getMonth()}`;
            if (monthlyMap[key]) {
                monthlyMap[key].orders += 1;
                monthlyMap[key].revenue += order.amount;
            }
        });

        setMonthlyData(Object.values(monthlyMap));
    };

    useEffect(() => {
        fetchOrders();
    }, [products]);

    // Get max revenue for chart scaling
    const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 1);
    const maxCategoryRevenue = Math.max(...categoryData.map(d => d.revenue), 1);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center h-[95vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-green-500"></div>
            </div>
        );
    }

    return (
        <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll bg-gray-50/50">
            <div className="p-4 md:p-8">
                <h1 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard</h1>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {/* Total Revenue */}
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-800">{currency}{stats.totalRevenue.toLocaleString()}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Total Orders */}
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Total Products */}
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Total Products</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.totalProducts}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Total Customers */}
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Total Customers</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.totalCustomers}</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Paid Orders</p>
                        <p className="text-xl font-bold text-green-600 mt-1">{stats.paidOrders}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Pending Orders</p>
                        <p className="text-xl font-bold text-yellow-600 mt-1">{stats.pendingOrders}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">COD Orders</p>
                        <p className="text-xl font-bold text-blue-600 mt-1">{stats.codOrders}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Online Orders</p>
                        <p className="text-xl font-bold text-purple-600 mt-1">{stats.onlineOrders}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Monthly Revenue Chart */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Revenue</h2>
                        <div className="flex items-end justify-between h-48 gap-2">
                            {monthlyData.map((data, index) => (
                                <div key={index} className="flex-1 flex flex-col items-center">
                                    <div className="w-full flex flex-col items-center">
                                        <span className="text-xs text-gray-500 mb-1">{currency}{data.revenue.toLocaleString()}</span>
                                        <div 
                                            className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-md transition-all duration-500"
                                            style={{ 
                                                height: `${Math.max((data.revenue / maxRevenue) * 140, 4)}px`,
                                            }}
                                        ></div>
                                    </div>
                                    <span className="text-xs text-gray-600 mt-2 font-medium">{data.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Monthly Orders Chart */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Orders</h2>
                        <div className="flex items-end justify-between h-48 gap-2">
                            {monthlyData.map((data, index) => (
                                <div key={index} className="flex-1 flex flex-col items-center">
                                    <div className="w-full flex flex-col items-center">
                                        <span className="text-xs text-gray-500 mb-1">{data.orders}</span>
                                        <div 
                                            className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-md transition-all duration-500"
                                            style={{ 
                                                height: `${Math.max((data.orders / Math.max(...monthlyData.map(d => d.orders), 1)) * 140, 4)}px`,
                                            }}
                                        ></div>
                                    </div>
                                    <span className="text-xs text-gray-600 mt-2 font-medium">{data.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Category Breakdown */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Sales by Category</h2>
                        <div className="space-y-3">
                            {categoryData.slice(0, 6).map((category, index) => {
                                const colors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-cyan-500'];
                                const percentage = ((category.revenue / maxCategoryRevenue) * 100).toFixed(0);
                                return (
                                    <div key={index}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600">{category.name}</span>
                                            <span className="text-gray-800 font-medium">{currency}{category.revenue.toLocaleString()}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div 
                                                className={`${colors[index % colors.length]} h-2 rounded-full transition-all duration-500`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                            {categoryData.length === 0 && (
                                <p className="text-gray-500 text-sm text-center py-4">No category data available</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h2>
                        <div className="space-y-3">
                            {recentOrders.map((order, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">
                                                {order.address?.firstName} {order.address?.lastName}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {order.items?.length} item(s) • {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-800">{currency}{order.amount}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {order.isPaid ? 'Paid' : 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {recentOrders.length === 0 && (
                                <p className="text-gray-500 text-sm text-center py-4">No recent orders</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Order Status Overview */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Overview</h2>
                    <div className="flex items-center gap-8">
                        {/* Pie Chart Visual */}
                        <div className="relative w-32 h-32">
                            <svg className="w-32 h-32 transform -rotate-90">
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="#e5e7eb"
                                    strokeWidth="16"
                                    fill="none"
                                />
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="#22c55e"
                                    strokeWidth="16"
                                    fill="none"
                                    strokeDasharray={`${(stats.paidOrders / Math.max(stats.totalOrders, 1)) * 351.86} 351.86`}
                                    className="transition-all duration-500"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-800">
                                        {stats.totalOrders > 0 ? Math.round((stats.paidOrders / stats.totalOrders) * 100) : 0}%
                                    </p>
                                    <p className="text-xs text-gray-500">Paid</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex-1 grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                                <div>
                                    <p className="text-sm text-gray-600">Paid Orders</p>
                                    <p className="text-lg font-bold text-gray-800">{stats.paidOrders}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                                <div>
                                    <p className="text-sm text-gray-600">Pending Orders</p>
                                    <p className="text-lg font-bold text-gray-800">{stats.pendingOrders}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                                <div>
                                    <p className="text-sm text-gray-600">COD Orders</p>
                                    <p className="text-lg font-bold text-gray-800">{stats.codOrders}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                                <div>
                                    <p className="text-sm text-gray-600">Online Orders</p>
                                    <p className="text-lg font-bold text-gray-800">{stats.onlineOrders}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
