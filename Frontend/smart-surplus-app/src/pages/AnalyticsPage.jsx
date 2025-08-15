import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { FaUtensils, FaUsers, FaLeaf, FaChartPie, FaCalendarDay, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const AnalyticsPage = () => {
    const [stats, setStats] = useState({
        totalListings: 0,
        totalClaimed: 0,
        totalExpired: 0,
        peopleFed: 0,
        foodSavedKg: 0,
        co2Prevented: 0,
    });
    const [foodTypeData, setFoodTypeData] = useState([]);
    const [dailyActivityData, setDailyActivityData] = useState([]);
    const [statusData, setStatusData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/food/my-listings');
                const listings = res.data;

                // --- Process Data for Analytics ---
                let peopleFed = 0;
                const foodTypeCounts = {};
                const dailyCounts = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                let claimedCount = 0;
                let expiredCount = 0;

                listings.forEach(item => {
                    // Tally food types
                    foodTypeCounts[item.foodType] = (foodTypeCounts[item.foodType] || 0) + 1;

                    // Tally daily activity
                    const dayOfWeek = days[new Date(item.createdAt).getDay()];
                    dailyCounts[dayOfWeek]++;

                    // Calculate total people fed from confirmed claims
                    item.claims.forEach(claim => {
                        if (claim.pickupStatus === 'confirmed') {
                            peopleFed += claim.quantity;
                        }
                    });
                    
                    // Tally status
                    if (item.status === 'claimed' || (item.status === 'available' && new Date(item.expiresAt) < new Date())) {
                        claimedCount++;
                    } else if (item.status === 'expired' || (item.status === 'available' && new Date(item.expiresAt) < new Date())) {
                        expiredCount++;
                    }
                });
                
                const foodSavedKg = (peopleFed * 0.5).toFixed(1);
                const co2Prevented = (foodSavedKg * 2.5).toFixed(1);

                setStats({
                    totalListings: listings.length,
                    totalClaimed: claimedCount,
                    totalExpired: listings.length - claimedCount, // A simplified assumption
                    peopleFed,
                    foodSavedKg,
                    co2Prevented,
                });

                setFoodTypeData(Object.keys(foodTypeCounts).map(name => ({ name, value: foodTypeCounts[name] })));
                setDailyActivityData(Object.keys(dailyCounts).map(name => ({ name, listings: dailyCounts[name] })));
                setStatusData([
                    { name: 'Successfully Claimed', value: claimedCount, fill: '#4CAF50' },
                    { name: 'Expired / Unclaimed', value: listings.length - claimedCount, fill: '#F44336' },
                ]);

            } catch (err) {
                console.error("Failed to fetch analytics data", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return <div className="loading-container">Loading analytics...</div>;
    }

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

    return (
        <div className="analytics-container">
            <header className="analytics-header">
                <h1>Your Detailed Analytics</h1>
                <p>An overview of your food redistribution efforts and impact.</p>
            </header>

            {/* Overall Stats */}
            <section className="stats-grid">
                <div className="stat-card"><FaUtensils /><div><h3>{stats.foodSavedKg} kg</h3><p>Food Saved</p></div></div>
                <div className="stat-card"><FaUsers /><div><h3>{stats.peopleFed}</h3><p>People Fed</p></div></div>
                <div className="stat-card"><FaLeaf /><div><h3>{stats.co2Prevented} kg</h3><p>CO₂ Prevented</p></div></div>
            </section>

            {/* Charts Section */}
            <div className="charts-grid">
                {/* Listing Status Pie Chart */}
                <div className="chart-card">
                    <h3><FaChartPie /> Listing Status</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Popular Food Types Pie Chart */}
                <div className="chart-card">
                    <h3><FaChartPie /> Popular Food Types</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={foodTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {foodTypeData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Daily Activity Bar Chart */}
                <div className="chart-card full-width">
                    <h3><FaCalendarDay /> Weekly Listing Activity</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={dailyActivityData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="listings" fill="#8884d8" name="Food Items Listed" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <style jsx>{`
                .analytics-container { max-width: 1200px; margin: 2rem auto; padding: 2rem; }
                .analytics-header { text-align: center; margin-bottom: 3rem; }
                .analytics-header h1 { font-size: 2.5rem; color: #2E7D32; }
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
                .stat-card { background: #fff; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); display: flex; align-items: center; gap: 1.5rem; }
                .stat-card svg { font-size: 2.5rem; color: #4CAF50; }
                .stat-card h3 { margin: 0; font-size: 2rem; }
                .stat-card p { margin: 0; color: #666; }
                .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
                .chart-card { background: #fff; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
                .chart-card h3 { text-align: center; margin-top: 0; margin-bottom: 2rem; color: #2E7D32; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
                .full-width { grid-column: 1 / -1; }
                .loading-container { text-align: center; padding: 4rem; font-size: 1.2rem; }
                @media (max-width: 768px) {
                    .charts-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default AnalyticsPage;
