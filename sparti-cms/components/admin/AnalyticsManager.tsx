import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointer, 
  Clock, 
  Target,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Activity,
  Zap,
  RefreshCw
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { format, subDays } from 'date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AnalyticsOverview {
  sessions: number;
  page_views: number;
  unique_visitors: number;
  avg_session_duration: number;
  bounce_rate: number;
  total_events: number;
  conversions: number;
  conversion_rate: number;
  top_pages: Array<{ page: string; views: number }>;
  top_referrers: Array<{ referrer: string; sessions: number }>;
}

interface ChartDataPoint {
  date: string;
  page_views: number;
  sessions: number;
  unique_visitors: number;
  bounce_rate: number;
  events: number;
  conversions: number;
}

interface EventDefinition {
  id: number;
  name: string;
  category: string;
  description: string;
  is_conversion: boolean;
  conversion_value: number;
  is_active: boolean;
}

interface RealTimeData {
  page_views_24h: number;
  sessions_24h: number;
  visitors_24h: number;
  page_views_1h: number;
  sessions_1h: number;
  events_24h: number;
  events_1h: number;
  conversions_24h: number;
  active_pages: Array<{ page: string; views: number }>;
}

const AnalyticsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'realtime'>('overview');
  const [timeRange, setTimeRange] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(true);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [eventDefinitions, setEventDefinitions] = useState<EventDefinition[]>([]);
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null);
  const [showEventModal, setShowEventModal] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<EventDefinition | null>(null);

  // Load analytics data
  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const [overviewRes, chartRes, eventsRes, realTimeRes] = await Promise.all([
        fetch(`/api/analytics/overview?days=${timeRange}`),
        fetch(`/api/analytics/chart-data?days=${timeRange}`),
        fetch('/api/analytics/event-definitions'),
        fetch('/api/analytics/realtime')
      ]);

      if (overviewRes.ok) {
        const overviewData = await overviewRes.json();
        // Only set if it has expected structure
        if (overviewData && typeof overviewData === 'object' && 'page_views' in overviewData) {
          setOverview(overviewData);
        }
      }

      if (chartRes.ok) {
        const chartData = await chartRes.json();
        // Only set if it's actually an array
        if (Array.isArray(chartData)) {
          setChartData(chartData);
        }
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        // Only set if it's actually an array
        if (Array.isArray(eventsData)) {
          setEventDefinitions(eventsData);
        }
      }

      if (realTimeRes.ok) {
        const realTimeData = await realTimeRes.json();
        // Only set if it has expected structure
        if (realTimeData && typeof realTimeData === 'object' && 'page_views_24h' in realTimeData) {
          setRealTimeData(realTimeData);
        }
      }
    } catch (error) {
      console.error('[testing] Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  // Auto-refresh real-time data every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (activeTab === 'realtime') {
        try {
          const res = await fetch('/api/analytics/realtime');
          if (res.ok) {
            const data = await res.json();
            // Only set if it has expected structure
            if (data && typeof data === 'object' && 'page_views_24h' in data) {
              setRealTimeData(data);
            }
          }
        } catch (error) {
          console.error('[testing] Failed to refresh real-time data:', error);
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [activeTab]);

  // Format duration in seconds to readable format
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Format number with commas
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num);
  };

  // Prepare chart data
  const prepareLineChartData = () => {
    if (!Array.isArray(chartData) || chartData.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: 'Page Views',
            data: [],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
          },
          {
            label: 'Sessions',
            data: [],
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
          },
          {
            label: 'Unique Visitors',
            data: [],
            borderColor: 'rgb(245, 158, 11)',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.4,
          }
        ]
      };
    }

    const labels = chartData.map(d => format(new Date(d.date), 'MMM dd'));
    
    return {
      labels,
      datasets: [
        {
          label: 'Page Views',
          data: chartData.map(d => d.page_views),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Sessions',
          data: chartData.map(d => d.sessions),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Unique Visitors',
          data: chartData.map(d => d.unique_visitors),
          borderColor: 'rgb(245, 158, 11)',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4,
        }
      ]
    };
  };

  const prepareBounceRateChartData = () => {
    if (!Array.isArray(chartData) || chartData.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: 'Bounce Rate (%)',
            data: [],
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            borderColor: 'rgb(239, 68, 68)',
            borderWidth: 1,
          }
        ]
      };
    }

    const labels = chartData.map(d => format(new Date(d.date), 'MMM dd'));
    
    return {
      labels,
      datasets: [
        {
          label: 'Bounce Rate (%)',
          data: chartData.map(d => d.bounce_rate),
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 1,
        }
      ]
    };
  };

  const prepareEventsChartData = () => {
    if (!Array.isArray(chartData) || chartData.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: 'Total Events',
            data: [],
            backgroundColor: 'rgba(139, 92, 246, 0.8)',
            borderColor: 'rgb(139, 92, 246)',
            borderWidth: 1,
          },
          {
            label: 'Conversions',
            data: [],
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgb(34, 197, 94)',
            borderWidth: 1,
          }
        ]
      };
    }

    const labels = chartData.map(d => format(new Date(d.date), 'MMM dd'));
    
    return {
      labels,
      datasets: [
        {
          label: 'Total Events',
          data: chartData.map(d => d.events),
          backgroundColor: 'rgba(139, 92, 246, 0.8)',
          borderColor: 'rgb(139, 92, 246)',
          borderWidth: 1,
        },
        {
          label: 'Conversions',
          data: chartData.map(d => d.conversions),
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1,
        }
      ]
    };
  };

  const prepareTopPagesChartData = () => {
    if (!overview?.top_pages || overview.top_pages.length === 0) {
      return {
        labels: ['No data'],
        datasets: [{
          data: [1],
          backgroundColor: ['#e5e7eb'],
        }]
      };
    }

    return {
      labels: overview.top_pages.map(p => p.page),
      datasets: [{
        data: overview.top_pages.map(p => p.views),
        backgroundColor: [
          '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
          '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
        ],
      }]
    };
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Track your website performance and user engagement</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button
            onClick={loadAnalyticsData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'events', label: 'Events', icon: Target },
            { id: 'realtime', label: 'Real-time', icon: Activity }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && overview && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Page Views</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(overview.page_views)}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(overview.sessions)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <MousePointer className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unique Visitors</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(overview.unique_visitors)}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Session Duration</p>
                  <p className="text-2xl font-bold text-gray-900">{formatDuration(overview.avg_session_duration)}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Bounce Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{overview.bounce_rate}%</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(overview.total_events)}</p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-full">
                  <Zap className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversions</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(overview.conversions)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{overview.conversion_rate}%</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traffic Chart */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Overview</h3>
              <div className="h-64">
                <Line data={prepareLineChartData()} options={chartOptions} />
              </div>
            </div>

            {/* Bounce Rate Chart */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bounce Rate</h3>
              <div className="h-64">
                <Bar data={prepareBounceRateChartData()} options={chartOptions} />
              </div>
            </div>

            {/* Events Chart */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Events & Conversions</h3>
              <div className="h-64">
                <Bar data={prepareEventsChartData()} options={chartOptions} />
              </div>
            </div>

            {/* Top Pages Chart */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Pages</h3>
              <div className="h-64">
                <Doughnut data={prepareTopPagesChartData()} options={doughnutOptions} />
              </div>
            </div>
          </div>

          {/* Top Pages and Referrers Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Pages Table */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Top Pages</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {overview.top_pages?.slice(0, 5).map((page, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 truncate flex-1 mr-4">{page.page}</span>
                      <span className="text-sm font-medium text-gray-900">{formatNumber(page.views)} views</span>
                    </div>
                  ))}
                  {(!overview.top_pages || overview.top_pages.length === 0) && (
                    <p className="text-sm text-gray-500">No page data available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Top Referrers Table */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Top Referrers</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {overview.top_referrers?.slice(0, 5).map((referrer, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 truncate flex-1 mr-4">
                        {referrer.referrer === 'Direct' ? 'Direct Traffic' : referrer.referrer}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{formatNumber(referrer.sessions)} sessions</span>
                    </div>
                  ))}
                  {(!overview.top_referrers || overview.top_referrers.length === 0) && (
                    <p className="text-sm text-gray-500">No referrer data available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Event Definitions</h3>
              <p className="text-sm text-gray-600">Manage trackable events for your website</p>
            </div>
            <button
              onClick={() => setShowEventModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Event</span>
            </button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conversion
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {eventDefinitions.map((event) => (
                    <tr key={event.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {event.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          event.category === 'lead' ? 'bg-green-100 text-green-800' :
                          event.category === 'engagement' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {event.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {event.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.is_conversion ? (
                          <span className="text-green-600 font-medium">Yes</span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${event.conversion_value.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          event.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {event.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setEditingEvent(event);
                              setShowEventModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this event?')) {
                                // Handle delete
                              }
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Tab */}
      {activeTab === 'realtime' && realTimeData && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Real-time Analytics</h3>
              <p className="text-sm text-gray-600">Live data from the last 24 hours</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Auto-refreshing every 30s</span>
            </div>
          </div>

          {/* Real-time KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Page Views (24h)</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(realTimeData.page_views_24h)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatNumber(realTimeData.page_views_1h)} in last hour
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sessions (24h)</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(realTimeData.sessions_24h)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatNumber(realTimeData.sessions_1h)} in last hour
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <MousePointer className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Visitors (24h)</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(realTimeData.visitors_24h)}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Events (24h)</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(realTimeData.events_24h)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatNumber(realTimeData.events_1h)} in last hour
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Active Pages */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Active Pages (Last 5 minutes)</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {realTimeData.active_pages?.map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 truncate flex-1 mr-4">{page.page}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-900">{formatNumber(page.views)} active</span>
                    </div>
                  </div>
                ))}
                {(!realTimeData.active_pages || realTimeData.active_pages.length === 0) && (
                  <p className="text-sm text-gray-500">No active pages in the last 5 minutes</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsManager;
