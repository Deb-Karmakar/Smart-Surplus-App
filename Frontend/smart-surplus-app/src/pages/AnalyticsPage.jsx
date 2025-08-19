import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FaUtensils, FaUsers, FaLeaf, FaChartPie, FaCalendarDay } from 'react-icons/fa';

const AnalyticsPage = () => {
    const { t } = useTranslation();
    const [timeRange, setTimeRange] = useState('this_week');
    const [allListings, setAllListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            try {
                const res = await api.get('/food/my-listings');
                setAllListings(res.data);
            } catch (err) {
                console.error("Failed to fetch analytics data", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllData();
    }, []);

    const processedData = useMemo(() => {
        // --- FIX: New, non-mutating, and correct date calculation logic ---
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today to the start of the day
        let startDate, endDate = new Date();

        switch (timeRange) {
            case 'last_week': {
                startDate = new Date(today);
                startDate.setDate(today.getDate() - today.getDay() - 7); // Go to last week's Sunday
                endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 6); // Go to last week's Saturday
                endDate.setHours(23, 59, 59, 999);
                break;
            }
            case 'last_month': {
                startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                endDate = new Date(today.getFullYear(), today.getMonth(), 0);
                endDate.setHours(23, 59, 59, 999);
                break;
            }
            case 'this_week':
            default: {
                startDate = new Date(today);
                startDate.setDate(today.getDate() - today.getDay()); // Go to this week's Sunday
                endDate = new Date(); // Set end to now
                break;
            }
        }

        const listings = allListings.filter(item => {
            const itemDate = new Date(item.createdAt);
            return itemDate >= startDate && itemDate <= endDate;
        });

        // Data aggregation logic (unchanged)
        let peopleFed = 0;
        const foodTypeCounts = {};
        const dailyCounts = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
        const daysOfWeekKeys = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        let claimedCount = 0;

        listings.forEach(item => {
            foodTypeCounts[item.foodType] = (foodTypeCounts[item.foodType] || 0) + 1;
            const dayKey = daysOfWeekKeys[new Date(item.createdAt).getDay()];
            dailyCounts[dayKey]++;
            item.claims.forEach(claim => {
                if (claim.pickupStatus === 'confirmed') { peopleFed += claim.quantity; }
            });
            if (item.status === 'claimed') { claimedCount++; }
        });
        
        const foodSavedKg = (peopleFed * 0.5).toFixed(1);
        const co2Prevented = (foodSavedKg * 2.5).toFixed(1);

        // Formatting data for charts (unchanged)
        const foodTypeData = Object.keys(foodTypeCounts).map(nameKey => ({ name: t(`analyticsPage.dataLabels.foodTypes.${nameKey}`, nameKey), value: foodTypeCounts[nameKey] }));
        const dailyActivityData = Object.keys(dailyCounts).map(dayKey => ({ name: t(`analyticsPage.dataLabels.days.${dayKey.toLowerCase()}`), listings: dailyCounts[dayKey] }));
        const statusData = [
            { name: t('analyticsPage.dataLabels.status.claimed'), value: claimedCount, fill: '#4CAF50' },
            { name: t('analyticsPage.dataLabels.status.expired'), value: listings.length - claimedCount, fill: '#F44336' },
        ];
        
        return {
            stats: { totalListings: listings.length, peopleFed, foodSavedKg, co2Prevented },
            foodTypeData,
            dailyActivityData,
            statusData
        };

    }, [allListings, timeRange, t]);

    if (isLoading) {
        return <div className="loading-container">{t('analyticsPage.loading')}</div>;
    }

    const { stats, foodTypeData, dailyActivityData, statusData } = processedData;
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

    return (
        <div className="analytics-container">
            <header className="analytics-header">
                <h1>{t('analyticsPage.title')}</h1>
                <p>{t('analyticsPage.subtitle')}</p>
                <select 
                    className="time-range-selector"
                    value={timeRange} 
                    onChange={e => setTimeRange(e.target.value)}
                >
                    <option value="this_week">{t('analyticsPage.timeRanges.thisWeek')}</option>
                    <option value="last_week">{t('analyticsPage.timeRanges.lastWeek')}</option>
                    <option value="last_month">{t('analyticsPage.timeRanges.lastMonth')}</option>
                </select>
            </header>

            <section className="stats-grid">
                <div className="stat-card"><FaUtensils /><div><h3>{stats.foodSavedKg} kg</h3><p>{t('analyticsPage.stats.foodSaved')}</p></div></div>
                <div className="stat-card"><FaUsers /><div><h3>{stats.peopleFed}</h3><p>{t('analyticsPage.stats.peopleFed')}</p></div></div>
                <div className="stat-card"><FaLeaf /><div><h3>{stats.co2Prevented} kg</h3><p>{t('analyticsPage.stats.co2Prevented')}</p></div></div>
            </section>

            <div className="charts-grid">
                <div className="chart-card">
                    <h3><FaChartPie /> {t('analyticsPage.charts.listingStatus')}</h3>
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
                <div className="chart-card">
                    <h3><FaChartPie /> {t('analyticsPage.charts.popularTypes')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={foodTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {foodTypeData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="chart-card full-width">
                    <h3><FaCalendarDay /> {t('analyticsPage.charts.weeklyActivity')}</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={dailyActivityData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="listings" fill="#8884d8" name={t('analyticsPage.charts.barName')} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <style jsx>{`
                .analytics-container { max-width: 1200px; margin: 2rem auto; padding: 2rem; }
                .analytics-header { text-align: center; margin-bottom: 3rem; }
                .analytics-header h1 { font-size: 2.5rem; color: #2E7D32; }
                .time-range-selector {
                    margin-top: 1.5rem;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    border: 1px solid #ccc;
                    background-color: #fff;
                    font-size: 1rem;
                    cursor: pointer;
                }
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