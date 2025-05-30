import React, { useState, useEffect } from 'react';
import { Database, Code2, Send, Loader2, Table, Sparkles, DatabaseZap, User, Search, Settings, HelpCircle, Moon, Sun, ChevronDown, BarChart, PieChart, LineChart } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { generateSqlFromText } from './services/geminiService';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface QueryResult {
  columns: string[];
  rows: any[][];
}

type ChartType = 'bar' | 'pie' | 'line';

function App() {
  const [prompt, setPrompt] = useState('');
  const [sql, setSql] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [activeTab, setActiveTab] = useState<'sql' | 'result' | 'visualization'>('sql');
  const [darkMode, setDarkMode] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    if (queryResult) {
      prepareChartData();
    }
  }, [queryResult, chartType]);

  const prepareChartData = () => {
    if (!queryResult || queryResult.rows.length === 0) return;

    // Extract data based on the query content
    let labels: string[] = [];
    let data: number[] = [];

    // Determine what to visualize based on the prompt
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes("user") || lowerPrompt.includes("customer")) {
      // For user/customer queries, use name and total_sales
      labels = queryResult.rows.map(row => row[1]); // name column
      data = queryResult.rows.map(row => row[4]); // total_sales column
    } else if (lowerPrompt.includes("product") || lowerPrompt.includes("sale")) {
      // For product/sales queries, use name and total_sales
      labels = queryResult.rows.map(row => row[1]); // name column
      data = queryResult.rows.map(row => row[4]); // total_sales column
    } else if (lowerPrompt.includes("month") || lowerPrompt.includes("year") || lowerPrompt.includes("date")) {
      // For time-based queries, use created_at and total_sales
      labels = queryResult.rows.map(row => row[3]); // created_at column
      data = queryResult.rows.map(row => row[4]); // total_sales column
    } else {
      // Default fallback
      labels = queryResult.rows.map(row => row[1]); // name column
      data = queryResult.rows.map(row => row[4]); // total_sales column
    }

    // Generate random colors for pie chart
    const backgroundColors = queryResult.rows.map(() =>
      `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`
    );

    // Determine chart title based on prompt
    let chartTitle = 'Data Visualization';
    if (lowerPrompt.includes("sale")) {
      chartTitle = 'Sales by Customer';
    } else if (lowerPrompt.includes("product")) {
      chartTitle = 'Product Performance';
    } else if (lowerPrompt.includes("month") || lowerPrompt.includes("year")) {
      chartTitle = 'Time-based Analysis';
    }

    setChartData({
      labels,
      datasets: [
        {
          label: 'Sales Amount ($)',
          data,
          backgroundColor: chartType === 'pie' ? backgroundColors : 'rgba(99, 102, 241, 0.6)',
          borderColor: chartType === 'line' ? 'rgb(99, 102, 241)' : 'rgba(99, 102, 241, 1)',
          borderWidth: 1,
        },
      ],
      chartTitle
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      console.log('Generating SQL from text:', prompt);

      const generatedSql = await generateSqlFromText(prompt);
      setSql(generatedSql);

      // Generate mock data based on the prompt
      const mockResult = generateMockData(prompt);
      setQueryResult(mockResult);
      setActiveTab('sql');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate SQL');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockData = (prompt: string): QueryResult => {
    const lowerPrompt = prompt.toLowerCase();

    // Default columns
    const columns = ['id', 'name', 'email', 'created_at', 'total_sales'];
    let rows = [];

    if (lowerPrompt.includes("top 5") && lowerPrompt.includes("product")) {
      // Top 5 products with highest sales
      rows = [
        [1, 'Premium Headphones', 'electronics@example.com', '2023-05-15', 12500],
        [2, 'Smartphone X', 'mobile@example.com', '2023-06-20', 9800],
        [3, 'Laptop Pro', 'computers@example.com', '2023-04-10', 8400],
        [4, 'Smart Watch', 'wearables@example.com', '2023-07-05', 6200],
        [5, 'Wireless Earbuds', 'audio@example.com', '2023-03-22', 5100]
      ];
    } else if (lowerPrompt.includes("last 30 days") || lowerPrompt.includes("last month")) {
      // Users who signed up in the last 30 days
      rows = [
        [101, 'Emma Wilson', 'emma@example.com', '2023-10-28', 1200],
        [102, 'Michael Chen', 'michael@example.com', '2023-10-25', 950],
        [103, 'Sophia Rodriguez', 'sophia@example.com', '2023-10-20', 1450],
        [104, 'James Kim', 'james@example.com', '2023-10-15', 800],
        [105, 'Olivia Singh', 'olivia@example.com', '2023-10-10', 1100]
      ];
    } else if (lowerPrompt.includes("spent more than") || lowerPrompt.includes("$1000")) {
      // Customers who spent more than $1000
      rows = [
        [201, 'Robert Johnson', 'robert@example.com', '2023-02-15', 3500],
        [202, 'Jennifer Lopez', 'jennifer@example.com', '2023-03-20', 2800],
        [203, 'David Williams', 'david@example.com', '2023-01-10', 4200],
        [204, 'Sarah Brown', 'sarah@example.com', '2023-04-05', 1800],
        [205, 'Thomas Garcia', 'thomas@example.com', '2023-05-12', 2100]
      ];
    } else if (lowerPrompt.includes("average") && lowerPrompt.includes("month")) {
      // Average order value by month
      rows = [
        [301, 'January', 'stats@example.com', '2023-01-31', 2200],
        [302, 'February', 'stats@example.com', '2023-02-28', 2400],
        [303, 'March', 'stats@example.com', '2023-03-31', 2100],
        [304, 'April', 'stats@example.com', '2023-04-30', 2600],
        [305, 'May', 'stats@example.com', '2023-05-31', 2800],
        [306, 'June', 'stats@example.com', '2023-06-30', 3100]
      ];
    } else {
      // Default data
      rows = [
        [1, 'John Doe', 'john@example.com', '2023-01-15', 5420],
        [2, 'Jane Smith', 'jane@example.com', '2023-02-20', 8750],
        [3, 'Bob Johnson', 'bob@example.com', '2023-03-25', 3200],
        [4, 'Alice Brown', 'alice@example.com', '2023-04-30', 6800],
        [5, 'Charlie Davis', 'charlie@example.com', '2023-05-05', 4300]
      ];
    }

    return { columns, rows };
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
  };

  const renderChart = () => {
    if (!chartData) return null;

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            color: darkMode ? '#fff' : '#333'
          }
        },
        title: {
          display: true,
          text: chartData.chartTitle || 'Data Visualization',
          color: darkMode ? '#fff' : '#333'
        },
      },
      scales: {
        y: {
          ticks: {
            color: darkMode ? '#ccc' : '#666',
            callback: (value: number) => `$${value}`
          },
          grid: {
            color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          }
        },
        x: {
          ticks: {
            color: darkMode ? '#ccc' : '#666'
          },
          grid: {
            color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          }
        }
      }
    };

    switch (chartType) {
      case 'bar':
        return <Bar data={chartData} options={options} />;
      case 'pie':
        return (
          <Pie
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                  labels: {
                    color: darkMode ? '#fff' : '#333'
                  }
                },
                title: {
                  display: true,
                  text: chartData.chartTitle || 'Data Distribution',
                  color: darkMode ? '#fff' : '#333'
                },
              }
            }}
          />
        );
      case 'line':
        return <Line data={chartData} options={options} />;
      default:
        return null;
    }
  };

  const getTotalSales = () => {
    if (!queryResult) return 0;
    // Assuming the last column is total_sales
    return queryResult.rows.reduce((sum, row) => sum + (row[4] || 0), 0);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <header className={`${darkMode ? 'bg-indigo-900' : 'bg-indigo-600'} text-white shadow-lg sticky top-0 z-10`}>
        <div className="container mx-auto px-4 ">
          <div className="flex items-center justify-between">

            <div className="flex items-center space-x-3">
              {/* <Database className="h-8 w-8" /> */}
              <img
                src="../../public/logo.webp"
                className="w-48 object-cover"
                alt="Logo"
              />
            </div>

            <div className="hidden md:flex items-center space-x-6 ml-40">

              <h1 className="text-2xl font-bold">Text to SQL Converter</h1>
              <DatabaseZap className="h-8 w-8" />




              {/* <button className="flex items-center space-x-1 text-indigo-100 hover:text-white transition-colors">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button> */}
              {/* <div className="flex items-center space-x-2 text-indigo-100">
                <Sparkles className="h-5 w-5" />
                <span>Powered by Gemini AI</span>
              </div> */}
            </div>

            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-1 text-indigo-100 hover:text-white transition-colors">
                <HelpCircle className="h-4 w-4" />
                <span>Documentation</span>
              </button>
              <button
                onClick={toggleSearch}
                className="p-2 rounded-full hover:bg-indigo-500 transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>

              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-indigo-500 transition-colors"
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-1 p-1 rounded-full hover:bg-indigo-500 transition-colors"
                  aria-label="User menu"
                >
                  <div className="bg-indigo-300 text-indigo-800 rounded-full p-1">
                    <User className="h-5 w-5" />
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {userMenuOpen && (
                  <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} ring-1 ring-black ring-opacity-5`}>
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="user-menu">
                      <a href="#" className={`block px-4 py-2 text-sm ${darkMode ? 'text-gray-100 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`} role="menuitem">Your Profile</a>
                      <a href="#" className={`block px-4 py-2 text-sm ${darkMode ? 'text-gray-100 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`} role="menuitem">Settings</a>
                      <a href="#" className={`block px-4 py-2 text-sm ${darkMode ? 'text-gray-100 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`} role="menuitem">Sign out</a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {searchOpen && (
            <div className="mt-3 pb-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for queries..."
                  className={`w-full p-2 pl-10 rounded-lg ${darkMode ? 'bg-indigo-800 text-white placeholder-indigo-300' : 'bg-white text-gray-900 placeholder-gray-500'}`}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-indigo-300" />
              </div>
            </div>
          )}
        </div>
      </header>

      <div className={`${darkMode ? 'bg-indigo-800' : 'bg-indigo-50'} py-2`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-indigo-800'}`}>
                Amlgo Labs  Natural Language to SQL Transformation
              </h2>
              <p className={`mt-1 ${darkMode ? 'text-indigo-200' : 'text-indigo-600'}`}>
                Describe what data you need in plain English, and Amlgo Labs AI will get it from your database             </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-indigo-100 hover:bg-indigo-200'} transition-colors`}>
                Recent Queries
              </button>
              <button className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-indigo-100 hover:bg-indigo-200'} transition-colors`}>
                Saved Templates
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <div className={`${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-lg shadow-md p-6`}>
              <h2 className={`text-xl font-semibold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                <Code2 className={`h-5 w-5 mr-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                Natural Language Query
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <textarea
                    className={`w-full h-28 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    placeholder="Describe what data you want to retrieve in plain English. For example: 'Show me all users who registered in the last month'"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !prompt.trim()}
                  className={`w-full flex items-center justify-center py-2 px-4 rounded-lg text-white font-medium ${isLoading || !prompt.trim()
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      {/* <Send className="h-5 w-5 mr-2" /> */}
                      <Sparkles className="h-5 w-5 mx-2" />

                      Generate SQL
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className={`mt-6 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-lg shadow-md p-6`}>
              <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Example Queries</h2>
              <ul className="space-y">
                <li>
                  <button
                    onClick={() => setPrompt("Find all users who signed up in the last 30 days")}
                    className={`text-left w-full p-2 rounded ${darkMode
                      ? 'hover:bg-gray-700 text-indigo-400'
                      : 'hover:bg-indigo-50 text-indigo-700'
                      }`}
                  >
                    Find all users who signed up in the last 30 days
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setPrompt("Show me the top 5 products with the highest sales")}
                    className={`text-left w-full p-2 rounded ${darkMode
                      ? 'hover:bg-gray-700 text-indigo-400'
                      : 'hover:bg-indigo-50 text-indigo-700'
                      }`}
                  >
                    Show me the top 5 products with the highest sales
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setPrompt("List all customers who have spent more than $1000")}
                    className={`text-left w-full p-2 rounded ${darkMode
                      ? 'hover:bg-gray-700 text-indigo-400'
                      : 'hover:bg-indigo-50 text-indigo-700'
                      }`}
                  >
                    List all customers who have spent more than $1000
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setPrompt("Find the average order value by month for the past year")}
                    className={`text-left w-full p-2 rounded ${darkMode
                      ? 'hover:bg-gray-700 text-indigo-400'
                      : 'hover:bg-indigo-50 text-indigo-700'
                      }`}
                  >
                    Find the average order value by month for the past year
                  </button>
                </li>
              </ul>
            </div>

            {/* {queryResult && (
              <div className={`mt-6 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-lg shadow-md p-6`}>
                <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Sales Summary</h2>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                      <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Sales</h3>
                      <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        ${getTotalSales().toLocaleString()}
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                      <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Average Sale</h3>
                      <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        ${(getTotalSales() / (queryResult?.rows.length || 1)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )} */}
          </div>

          <div>
            <div className={`${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-lg shadow-md overflow-hidden`}>
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  className={`flex-1 py-3 px-4 font-medium ${activeTab === 'sql'
                    ? darkMode
                      ? 'bg-gray-700 text-indigo-400 border-b-2 border-indigo-500'
                      : 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600'
                    : darkMode
                      ? 'text-gray-400 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  onClick={() => setActiveTab('sql')}
                >
                  <Code2 className="h-5 w-5 inline mr-2" />
                  SQL Query
                </button>
                <button
                  className={`flex-1 py-3 px-4 font-medium ${activeTab === 'result'
                    ? darkMode
                      ? 'bg-gray-700 text-indigo-400 border-b-2 border-indigo-500'
                      : 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600'
                    : darkMode
                      ? 'text-gray-400 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  onClick={() => setActiveTab('result')}
                  disabled={!queryResult}
                >
                  <Table className="h-5 w-5 inline mr-2" />
                  Query Results
                </button>
                <button
                  className={`flex-1 py-3 px-4 font-medium ${activeTab === 'visualization'
                    ? darkMode
                      ? 'bg-gray-700 text-indigo-400 border-b-2 border-indigo-500'
                      : 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600'
                    : darkMode
                      ? 'text-gray-400 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  onClick={() => setActiveTab('visualization')}
                  disabled={!queryResult}
                >
                  <BarChart className="h-5 w-5 inline mr-2" />
                  Visualization
                </button>
              </div>

              <div className="p-6">
                {error && (
                  <div className={`${darkMode ? 'bg-red-900 text-red-200' : 'bg-red-50 text-red-700'} p-4 rounded-lg mb-4`}>
                    {error}
                  </div>
                )}

                {activeTab === 'sql' ? (
                  sql ? (
                    <div className="rounded-lg overflow-hidden">
                      <SyntaxHighlighter
                        language="sql"
                        style={atomOneDark}
                        customStyle={{ borderRadius: '0.5rem' }}
                      >
                        {sql}
                      </SyntaxHighlighter>
                      <div className="flex justify-end mt-4 space-x-2">
                        <button className={`px-3 py-1 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>
                          Copy
                        </button>
                        <button className={`px-3 py-1 rounded ${darkMode ? 'bg-indigo-700 hover:bg-indigo-600' : 'bg-indigo-100 hover:bg-indigo-200'} transition-colors`}>
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Code2 className={`h-12 w-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                      <p>Generated SQL will appear here</p>
                      <p className="mt-2 text-sm">Enter a natural language query and click "Generate SQL"</p>
                    </div>
                  )
                ) : activeTab === 'result' ? (
                  queryResult ? (
                    <div className="overflow-x-auto">
                      <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                          <tr>
                            {queryResult.columns.map((column, i) => (
                              <th
                                key={i}
                                className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}
                              >
                                {column}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className={`${darkMode ? 'bg-gray-800 divide-y divide-gray-700' : 'bg-white divide-y divide-gray-200'}`}>
                          {queryResult.rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                              {row.map((cell, cellIndex) => (
                                <td
                                  key={cellIndex}
                                  className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}
                                >
                                  {cellIndex === 4 ? `$${cell}` : cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="flex justify-between mt-4">
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Showing {queryResult.rows.length} results
                        </div>
                        <div className="flex space-x-2">
                          <button className={`px-3 py-1 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>
                            Export CSV
                          </button>
                          <button className={`px-3 py-1 rounded ${darkMode ? 'bg-indigo-700 hover:bg-indigo-600' : 'bg-indigo-100 hover:bg-indigo-200'} transition-colors`}>
                            Save View
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Table className={`h-12 w-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                      <p>Query results will appear here</p>
                      <p className="mt-2 text-sm">Generate a SQL query first to see results</p>
                    </div>
                  )
                ) : (
                  queryResult ? (
                    <div>
                      <div className="mb-4 flex justify-between items-center">
                        <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          Data Visualization
                        </h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setChartType('bar')}
                            className={`p-2 rounded ${chartType === 'bar'
                              ? (darkMode ? 'bg-indigo-700' : 'bg-indigo-100')
                              : (darkMode ? 'bg-gray-700' : 'bg-gray-100')}`}
                          >
                            <BarChart className={`h-5 w-5 ${chartType === 'bar' ? 'text-indigo-500' : darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          </button>
                          <button
                            onClick={() => setChartType('pie')}
                            className={`p-2 rounded ${chartType === 'pie'
                              ? (darkMode ? 'bg-indigo-700' : 'bg-indigo-100')
                              : (darkMode ? 'bg-gray-700' : 'bg-gray-100')}`}
                          >
                            <PieChart className={`h-5 w-5 ${chartType === 'pie' ? 'text-indigo-500' : darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          </button>
                          <button
                            onClick={() => setChartType('line')}
                            className={`p-2 rounded ${chartType === 'line'
                              ? (darkMode ? 'bg-indigo-700' : 'bg-indigo-100')
                              : (darkMode ? 'bg-gray-700' : 'bg-gray-100')}`}
                          >
                            <LineChart className={`h-5 w-5 ${chartType === 'line' ? 'text-indigo-500' : darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          </button>
                        </div>
                      </div>
                      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className="h-80">
                          {renderChart()}
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end space-x-2">
                        <button className={`px-3 py-1 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>
                          Download Chart
                        </button>
                        <button className={`px-3 py-1 rounded ${darkMode ? 'bg-indigo-700 hover:bg-indigo-600' : 'bg-indigo-100 hover:bg-indigo-200'} transition-colors`}>
                          Save View
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <BarChart className={`h-12 w-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                      <p>Data visualization will appear here</p>
                      <p className="mt-2 text-sm">Generate a SQL query first to see visualizations</p>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* {queryResult && (
              <div className={`mt-6 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-lg shadow-md p-6`}>
                <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Data Visualization</h2>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {chartData?.chartTitle || 'Query Results Visualization'}
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setChartType('bar')}
                        className={`p-2 rounded ${chartType === 'bar'
                          ? (darkMode ? 'bg-indigo-700' : 'bg-indigo-100')
                          : (darkMode ? 'bg-gray-700' : 'bg-gray-100')}`}
                      >
                        <BarChart className={`h-5 w-5 ${chartType === 'bar' ? 'text-indigo-500' : darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      </button>
                      <button
                        onClick={() => setChartType('pie')}
                        className={`p-2 rounded ${chartType === 'pie'
                          ? (darkMode ? 'bg-indigo-700' : 'bg-indigo-100')
                          : (darkMode ? 'bg-gray-700' : 'bg-gray-100')}`}
                      >
                        <PieChart className={`h-5 w-5 ${chartType === 'pie' ? 'text-indigo-500' : darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      </button>
                      <button
                        onClick={() => setChartType('line')}
                        className={`p-2 rounded ${chartType === 'line'
                          ? (darkMode ? 'bg-indigo-700' : 'bg-indigo-100')
                          : (darkMode ? 'bg-gray-700' : 'bg-gray-100')}`}
                      >
                        <LineChart className={`h-5 w-5 ${chartType === 'line' ? 'text-indigo-500' : darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      </button>
                    </div>
                  </div>
                  <div className="h-64">
                    {renderChart()}
                  </div>
                </div>
              </div>
            )} */}

            {/* {sql && (
              <div className={`mt-6 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-lg shadow-md p-6`}>
                <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Query Insights</h2>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    This query retrieves data from the database based on your natural language description.
                    It's optimized for performance and follows SQL best practices.
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tables Used</h3>
                      <p className={`mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>users, orders</p>
                    </div>
                    <div>
                      <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Query Type</h3>
                      <p className={`mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>SELECT</p>
                    </div>
                  </div>
                </div>
              </div>
            )} */}

            {queryResult && (
              <div className={`mt-6 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-lg shadow-md p-6`}>
                <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Insights </h2>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                      <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Sales</h3>
                      <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        ${getTotalSales().toLocaleString()}
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                      <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Average Sale</h3>
                      <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        ${(getTotalSales() / (queryResult?.rows.length || 1)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className={`${darkMode ? 'bg-gray-800 border-t border-gray-700' : 'bg-gray-100 border-t'} mt-12`}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Text to SQL Converter © {new Date().getFullYear()} | Amlgo Labs
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Privacy Policy</a>
              <a href="#" className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Terms of Service</a>
              <a href="#" className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;