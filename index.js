// HTML 模板
const mainPageHtml = `<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Grok API 使用统计</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="icon" href="https://restful.doublefenzhuan.me/public/0c64dc36-7736-41d8-9f65-3c043deea152-count.png" type="image/png">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        .card-hover {
            transition: all 0.3s ease;
        }
        .card-hover:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .loading {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255,255,255,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .fade-in {
            animation: fadeIn 0.5s ease-in;
        }
        @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
        }
    </style>
</head>
<body class="bg-gray-50">
    <div id="loading" class="loading">
        <div class="spinner"></div>
    </div>

    <div class="container mx-auto px-4 py-8">
        <div class="flex justify-between items-center mb-8">
            <h1 class="text-3xl font-bold text-gray-800">Grok API 使用统计</h1>
            <div class="flex items-center">
                <span id="lastUpdated" class="text-sm text-gray-500 mr-4">上次更新: 刚刚</span>
                <button id="refreshButton" class="bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 flex items-center">
                    <i class="fas fa-sync-alt mr-1"></i> 刷新
                </button>
            </div>
        </div>
        
        <!-- 数据概览 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow p-6 card-hover">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-sm text-gray-500">总剩余次数</p>
                        <h2 id="totalRemaining" class="text-3xl font-bold text-blue-600">0</h2>
                    </div>
                    <div class="bg-blue-100 p-3 rounded-full">
                        <i class="fas fa-chart-line text-blue-500"></i>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow p-6 card-hover">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-sm text-gray-500">SSO 数量</p>
                        <h2 id="ssoCount" class="text-3xl font-bold text-green-600">0</h2>
                    </div>
                    <div class="bg-green-100 p-3 rounded-full">
                        <i class="fas fa-key text-green-500"></i>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow p-6 card-hover">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-sm text-gray-500">平均剩余次数</p>
                        <h2 id="avgRemaining" class="text-3xl font-bold text-purple-600">0</h2>
                    </div>
                    <div class="bg-purple-100 p-3 rounded-full">
                        <i class="fas fa-calculator text-purple-500"></i>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 图表和添加表单 -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div class="lg:col-span-2 bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold mb-4">剩余次数分布</h3>
                <div class="h-64">
                    <canvas id="distributionChart"></canvas>
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold mb-4">添加 SSO Token</h3>
                <form id="quickAddForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">SSO Token</label>
                        <input type="text" id="quickSsoToken" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="输入 SSO Token" required>
                        <p class="text-xs text-gray-500 mt-1">多个 token 请用英文逗号分隔</p>
                    </div>
                    <button type="submit" class="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition flex items-center justify-center">
                        <i class="fas fa-plus mr-2"></i> 添加 Token
                    </button>
                </form>
                <div class="mt-4 text-center">
                    <a href="/admin" class="text-blue-500 hover:text-blue-700 flex items-center justify-center">
                        <i class="fas fa-cog mr-1"></i> 管理面板
                    </a>
                </div>
            </div>
        </div>
        
        <!-- SSO 卡片列表 -->
        <h3 class="text-xl font-semibold mb-4">SSO Token 详情</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="ssoCards"></div>
        
        <!-- 无数据提示 -->
        <div id="noDataMessage" class="hidden text-center py-12">
            <i class="fas fa-info-circle text-blue-500 text-4xl mb-4"></i>
            <p class="text-gray-600">暂无 SSO Token 数据，请添加 Token</p>
        </div>
    </div>
    
    <!-- 添加成功提示 -->
    <div id="successNotification" class="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg transform translate-y-20 opacity-0 transition-all duration-300 flex items-center">
        <i class="fas fa-check-circle mr-2"></i>
        <span id="notificationMessage">操作成功</span>
    </div>
    
    <script>
        // 全局变量
        let chartInstance = null;
        let lastUpdate = 0;
        const REFRESH_INTERVAL = 20000; // 20 秒
        const CACHE_DURATION = 30000;   // 30 秒
        
        // 显示通知
        function showNotification(message) {
            const notification = document.getElementById('successNotification');
            document.getElementById('notificationMessage').textContent = message;
            notification.classList.remove('translate-y-20', 'opacity-0');
            notification.classList.add('translate-y-0', 'opacity-100');
            
            setTimeout(() => {
                notification.classList.remove('translate-y-0', 'opacity-100');
                notification.classList.add('translate-y-20', 'opacity-0');
            }, 3000);
        }
        
        // 显示/隐藏加载动画
        function setLoading(isLoading) {
            const loader = document.getElementById('loading');
            if (isLoading) {
                loader.style.display = 'flex';
            } else {
                loader.style.display = 'none';
            }
        }
        
        // 更新最后更新时间
        function updateLastUpdated() {
            const now = new Date();
            const timeStr = now.toLocaleTimeString();
            document.getElementById('lastUpdated').textContent = '上次更新: ' + timeStr;
        }
        
        // 更新图表
        function updateChart(data) {
            const ctx = document.getElementById('distributionChart').getContext('2d');
            
            // 销毁现有图表
            if (chartInstance) {
                chartInstance.destroy();
            }
            
            // 创建新图表
            chartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                    const percentage = Math.round((value / total) * 100);
                                    return label + ': ' + value + ' (' + percentage + '%)';
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // 获取并显示数据
        async function fetchData(force = false) {
            const now = Date.now();
            if (!force && now - lastUpdate < CACHE_DURATION) {
                return; // 使用现有数据
            }
            
            setLoading(true);
            
            try {
                const response = await fetch('/api/stats');
                if (!response.ok) throw new Error('Network response was not ok');
                
                const responseData = await response.json();
                const data = responseData.stats;
                const modeLabels = responseData.modeLabels;
                const ssoCards = document.getElementById('ssoCards');
                const noDataMessage = document.getElementById('noDataMessage');
                
                // 计算统计数据
                let totalDefault = 0;
                let totalReasoning = 0;
                let totalDeepSearch = 0;
                let ssoCount = 0;
                
                for (const sso in data) {
                    ssoCount++;
                    totalDefault += data[sso].DEFAULT || 0;
                    totalReasoning += data[sso].REASONING || 0;
                    totalDeepSearch += data[sso].DEEPSEARCH || 0;
                }
                
                const totalAll = totalDefault + totalReasoning + totalDeepSearch;
                const avgDefault = ssoCount > 0 ? Math.round(totalDefault / ssoCount) : 0;
                
                // 更新统计卡片
                document.getElementById('totalRemaining').textContent = totalAll;
                document.getElementById('ssoCount').textContent = ssoCount;
                document.getElementById('avgRemaining').textContent = avgDefault;
                
                // 更新图表数据
                const chartData = {
                    labels: ['标准', '思考', '深度'],
                    datasets: [{
                        data: [totalDefault, totalReasoning, totalDeepSearch],
                        backgroundColor: [
                            'rgba(59, 130, 246, 0.5)',
                            'rgba(16, 185, 129, 0.5)',
                            'rgba(139, 92, 246, 0.5)'
                        ],
                        borderColor: [
                            'rgba(59, 130, 246, 1)',
                            'rgba(16, 185, 129, 1)',
                            'rgba(139, 92, 246, 1)'
                        ],
                        borderWidth: 1
                    }]
                };
                
                // 更新图表
                updateChart(chartData);
                
                // 显示或隐藏无数据消息
                if (ssoCount === 0) {
                    ssoCards.innerHTML = '';
                    noDataMessage.classList.remove('hidden');
                } else {
                    noDataMessage.classList.add('hidden');
                    
                    // 预先创建所有卡片的 HTML
                    let cardsHtml = '';
                    
                    for (const sso in data) {
                        const defaultCount = data[sso].DEFAULT || 0;
                        const reasoningCount = data[sso].REASONING || 0;
                        const deepSearchCount = data[sso].DEEPSEARCH || 0;
                        const totalCount = defaultCount + reasoningCount + deepSearchCount;
                        
                        // 计算百分比颜色 (假设最大值是20)
                        const percentage = Math.min(defaultCount / 20 * 100, 100);
                        const colorClass = percentage < 30 ? 'bg-red-500' : 
                                          percentage < 70 ? 'bg-yellow-500' : 'bg-green-500';
                        const id = sso.substring(0, 8);
                        
                        cardsHtml += '<div class="bg-white rounded-lg shadow p-5 card-hover fade-in">' +
                               '<div class="flex justify-between items-center mb-3">' +
                               '<h3 class="text-lg font-semibold text-gray-800">SSO ID: ' + id + '...</h3>' +
                               '<span class="text-xs font-medium px-2.5 py-0.5 rounded-full ' + colorClass + ' text-white">' +
                               Math.round(percentage) + '%' +
                               '</span>' +
                               '</div>' +
                               '<div class="mb-4">' +
                               '<div class="w-full bg-gray-200 rounded-full h-2.5 mb-1">' +
                               '<div class="' + colorClass + ' h-2.5 rounded-full" style="width: ' + percentage + '%"></div>' +
                               '</div>' +
                               '</div>' +
                               '<div class="grid grid-cols-3 gap-2 mb-3 text-center text-sm">' +
                               '<div class="bg-blue-50 p-2 rounded">' +
                               '<div class="font-semibold text-blue-700">标准</div>' +
                               '<div class="text-blue-600">' + defaultCount + '</div>' +
                               '</div>' +
                               '<div class="bg-green-50 p-2 rounded">' +
                               '<div class="font-semibold text-green-700">思考</div>' +
                               '<div class="text-green-600">' + reasoningCount + '</div>' +
                               '</div>' +
                               '<div class="bg-purple-50 p-2 rounded">' +
                               '<div class="font-semibold text-purple-700">深度</div>' +
                               '<div class="text-purple-600">' + deepSearchCount + '</div>' +
                               '</div>' +
                               '</div>' +
                               '<div class="flex justify-between items-center">' +
                               '<p class="text-gray-600 text-sm">总剩余次数</p>' +
                               '<p class="text-2xl font-bold text-blue-600">' + totalCount + '</p>' +
                               '</div>' +
                               '</div>';
                    }
                    
                    // 一次性更新 DOM
                    ssoCards.innerHTML = cardsHtml;
                }
                
                updateLastUpdated();
                lastUpdate = now;
            } catch (error) {
                console.error('Error fetching data:', error);
                showNotification('获取数据失败，请重试');
            } finally {
                setLoading(false);
            }
        }
        
        // 添加快速添加功能
        document.getElementById('quickAddForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const ssoToken = document.getElementById('quickSsoToken').value;
            
            if (!ssoToken.trim()) {
                showNotification('请输入有效的 SSO Token');
                return;
            }
            
            setLoading(true);
            
            try {
                await fetch('/api/add-sso', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({sso: ssoToken})
                });
                
                document.getElementById('quickSsoToken').value = '';
                showNotification('SSO Token 添加成功');
                await fetchData(true);
            } catch (error) {
                console.error('Error adding SSO:', error);
                showNotification('添加失败，请重试');
            } finally {
                setLoading(false);
            }
        });
        
        // 刷新按钮
        document.getElementById('refreshButton').addEventListener('click', () => {
            fetchData(true);
        });
        
        // 页面可见性变化时刷新
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                fetchData(true);
            }
        });
        
        // 初始加载
        document.addEventListener('DOMContentLoaded', () => {
            fetchData(true);
            setInterval(() => fetchData(), REFRESH_INTERVAL);
        });
    </script>
</body>
</html>`;

// 添加管理面板的通知功能和完整的 HTML 结构
const adminPageHtml = `<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Grok API 管理界面</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="icon" href="https://github.com/user-attachments/assets/3d59310b-fa23-45df-9401-340137170bd6" type="image/png">
</head>
<body class="bg-gray-100">
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-center mb-8">SSO 管理面板</h1>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- 添加 SSO 表单 -->
            <div class="lg:col-span-1">
                <div class="bg-white rounded-lg shadow p-6">
                    <h2 class="text-xl font-semibold mb-4">添加 SSO Token</h2>
                    <form id="ssoForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">SSO Token</label>
                            <textarea id="ssoToken" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                                rows="3" required placeholder="多个token请用英文逗号分隔"></textarea>
                        </div>
                        <button type="submit" class="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                            <i class="fas fa-plus mr-2"></i>添加 SSO
                        </button>
                    </form>
                </div>
                
                <div class="mt-6 bg-white rounded-lg shadow p-6">
                    <h2 class="text-xl font-semibold mb-4">操作</h2>
                    <div class="space-y-3">
                        <a href="/" class="block w-full bg-gray-100 text-center text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition">
                            <i class="fas fa-home mr-2"></i>返回主页
                        </a>
                        <button id="refreshBtn" class="block w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">
                            <i class="fas fa-sync-alt mr-2"></i>刷新数据
                        </button>
                        <button id="copyAllBtn" class="block w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition">
                            <i class="fas fa-copy mr-2"></i>复制所有 SSO(,分隔)
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- SSO 列表 -->
            <div class="lg:col-span-2">
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-xl font-semibold">SSO Token 列表</h2>
                        <span id="ssoCount" class="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">0 个</span>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Token ID
                                    </th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        完整 Token
                                    </th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        操作
                                    </th>
                                </tr>
                            </thead>
                            <tbody id="ssoList" class="bg-white divide-y divide-gray-200">
                                <!-- SSO 列表将在这里动态生成 -->
                            </tbody>
                        </table>
                    </div>
                    <div id="noSsoMessage" class="py-8 text-center text-gray-500 hidden">
                        <i class="fas fa-info-circle text-2xl mb-2"></i>
                        <p>暂无 SSO Token，请添加</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- 通知提示 -->
    <div id="notification" class="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg transform translate-y-20 opacity-0 transition-all duration-300 flex items-center">
        <i class="fas fa-check-circle mr-2"></i>
        <span id="notificationMessage">操作成功</span>
    </div>
    
    <script>
        // 显示通知
        function showNotification(message) {
            const notification = document.getElementById('notification');
            document.getElementById('notificationMessage').textContent = message;
            notification.classList.remove('translate-y-20', 'opacity-0');
            notification.classList.add('translate-y-0', 'opacity-100');
            
            setTimeout(() => {
                notification.classList.remove('translate-y-0', 'opacity-100');
                notification.classList.add('translate-y-20', 'opacity-0');
            }, 3000);
        }
        
        // 复制文本到剪贴板
        async function copyToClipboard(text) {
            try {
                await navigator.clipboard.writeText(text);
                showNotification('复制成功');
            } catch (err) {
                console.error('复制失败:', err);
                alert('复制失败，请手动复制');
            }
        }
        
        // 加载 SSO 列表
        async function loadSSOList() {
            try {
                const response = await fetch('/api/sso-list');
                if (!response.ok) {
                    throw new Error('获取 SSO 列表失败');
                }
                
                const data = await response.json();
                console.log('SSO 列表数据:', data); // 调试日志
                
                const ssoList = document.getElementById('ssoList');
                const noSsoMessage = document.getElementById('noSsoMessage');
                const ssoCount = document.getElementById('ssoCount');
                
                ssoList.innerHTML = '';
                ssoCount.textContent = data.length + ' 个';
                
                if (data.length === 0) {
                    noSsoMessage.classList.remove('hidden');
                    return;
                }
                
                noSsoMessage.classList.add('hidden');
                
                // 遍历 SSO 列表并创建表格行
                data.forEach((sso, index) => {
                    const row = document.createElement('tr');
                    row.className = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                    const id = sso.substring(0, 8);
                    
                    // 使用模板字面量创建行内容
                    const html = 
                        '<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">' +
                        id + '...' +
                        '</td>' +
                        '<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">' +
                        '<div class="flex items-center">' +
                        '<span class="truncate max-w-xs">' + sso + '</span>' +
                        '<button data-sso="' + sso + '" class="copy-btn ml-2 text-blue-500 hover:text-blue-700">' +
                        '<i class="fas fa-copy"></i>' +
                        '</button>' +
                        '</div>' +
                        '</td>' +
                        '<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">' +
                        '<button data-sso="' + sso + '" class="delete-btn text-red-500 hover:text-red-700 transition">' +
                        '<i class="fas fa-trash-alt mr-1"></i>删除' +
                        '</button>' +
                        '</td>';
                    
                    row.innerHTML = html;
                    
                    // 添加事件监听器
                    const copyBtn = row.querySelector('.copy-btn');
                    copyBtn.addEventListener('click', () => {
                        copyToClipboard(sso);
                    });
                    
                    const deleteBtn = row.querySelector('.delete-btn');
                    deleteBtn.addEventListener('click', () => {
                        deleteSso(sso);
                    });
                    
                    ssoList.appendChild(row);
                });
            } catch (error) {
                console.error('加载 SSO 列表失败:', error);
                showNotification('加载 SSO 列表失败');
            }
        }

        // 添加 SSO
        document.getElementById('ssoForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const ssoToken = document.getElementById('ssoToken').value;
            
            if (!ssoToken.trim()) {
                showNotification('请输入有效的 SSO Token');
                return;
            }
            
            try {
                const response = await fetch('/api/add-sso', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({sso: ssoToken})
                });
                
                if (!response.ok) {
                    throw new Error('添加 SSO 失败');
                }
                
                document.getElementById('ssoToken').value = '';
                showNotification('SSO Token 添加成功');
                await loadSSOList();
            } catch (error) {
                console.error('添加 SSO 失败:', error);
                showNotification('添加失败，请重试');
            }
        });

        // 删除 SSO
        async function deleteSso(sso) {
            if (!confirm('确定要删除这个 SSO Token 吗？')) return;
            
            try {
                const response = await fetch('/api/delete-sso', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({sso})
                });
                
                if (!response.ok) {
                    throw new Error('删除 SSO 失败');
                }
                
                showNotification('SSO Token 删除成功');
                await loadSSOList();
            } catch (error) {
                console.error('删除 SSO 失败:', error);
                showNotification('删除失败，请重试');
            }
        }
        
        // 修改复制所有 SSO 的功能
        document.getElementById('copyAllBtn').addEventListener('click', async () => {
            try {
                const response = await fetch('/api/sso-list');
                const data = await response.json();
                if (data.length === 0) {
                    showNotification('没有 SSO Token 可复制');
                    return;
                }
                
                // 使用逗号分隔所有 SSO
                const allSsos = data.join(',');
                await copyToClipboard(allSsos);
                showNotification('已复制 ' + data.length + ' 个 SSO Token');
            } catch (error) {
                console.error('复制所有 SSO 失败:', error);
                showNotification('复制失败，请重试');
            }
        });
        
        // 刷新按钮
        document.getElementById('refreshBtn').addEventListener('click', () => {
            loadSSOList();
            showNotification('数据已刷新');
        });

        // 初始加载
        document.addEventListener('DOMContentLoaded', () => {
            loadSSOList();
        });
    </script>
</body>
</html>`;

// 修改 adminPageHtml，添加登录界面
const adminLoginHtml = `<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>管理员登录</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="icon" href="https://restful.doublefenzhuan.me/public/0c64dc36-7736-41d8-9f65-3c043deea152-count.png" type="image/png">
</head>
<body class="bg-gray-100">
    <div class="min-h-screen flex items-center justify-center">
        <div class="max-w-md w-full bg-white rounded-lg shadow p-8">
            <h1 class="text-2xl font-bold text-center mb-8">管理员登录</h1>
            <form id="loginForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">用户名</label>
                    <input type="text" id="username" required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">密码</label>
                    <input type="password" id="password" required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                </div>
                <button type="submit" class="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    登录
                </button>
            </form>
            <div id="errorMsg" class="mt-4 text-red-500 text-center hidden"></div>
            <div class="mt-4 text-center">
                <a href="/" class="text-blue-500 hover:text-blue-600">返回主页</a>
            </div>
        </div>
    </div>
    <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
        
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username, password})
            });
            
            const data = await response.json();
            if (data.success) {
                window.location.href = '/admin/dashboard';
            } else {
                const errorMsg = document.getElementById('errorMsg');
                errorMsg.textContent = '用户名或密码错误';
                errorMsg.classList.remove('hidden');
            }
        });
    </script>
</body>
</html>`;

// KV 操作辅助函数
async function getSsoList(env) {
    const list = await env.GROK_KV.get('sso_list');
    return list ? JSON.parse(list) : [];
}

async function saveSsoList(env, list) {
    await env.GROK_KV.put('sso_list', JSON.stringify(list));
}

// API 请求函数
async function fetchGrokStats(sso, requestKind = "DEFAULT") {
    const response = await fetch('https://grok.com/rest/rate-limits', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'Cookie': 'sso=' + sso + '; sso-rw=' + sso + '; _ga_8FEWB057YH=GS1.1.1740406711.1.1.1740407320.0.0.0',
        },
        body: JSON.stringify({
            "requestKind": requestKind,
            "modelName": "grok-3"
        })
    });
    
    const data = await response.json();
    return data.remainingQueries;
}

// 修改缓存函数
async function getCachedStats(env, sso, requestKind = "DEFAULT") {
    const cacheKey = `stats_${sso}_${requestKind}`;
    const cached = await env.GROK_KV.get(cacheKey);
    if (cached) {
        const cachedData = JSON.parse(cached);
        // 检查缓存是否在 60 秒内
        if (Date.now() - cachedData.timestamp < 60000) {
            return cachedData.value;
        }
    }
    
    try {
        const stats = await fetchGrokStats(sso, requestKind);
        // 缓存 60 秒
        await env.GROK_KV.put(cacheKey, JSON.stringify({
            value: stats,
            timestamp: Date.now()
        }), {expirationTtl: 120}); // 2分钟过期，但实际上60秒后会刷新
        return stats;
    } catch (error) {
        return 0;
    }
}

// 路由处理
async function handleRequest(request, env) {
    const url = new URL(request.url);
    
    // 验证管理员会话
    async function isAuthenticated(request) {
        const cookie = request.headers.get('Cookie') || '';
        const sessionToken = cookie.split('session=')[1]?.split(';')[0];
        if (!sessionToken) return false;
        
        // 验证 session token
        const validSession = await env.GROK_KV.get('session_' + sessionToken);
        return !!validSession;
    }

    // 管理员登录
    if (url.pathname === '/api/admin/login' && request.method === 'POST') {
        const { username, password } = await request.json();
        
        // 确保进行字符串比较
        if (String(username) === String(env.ADMIN_USERNAME) && 
            String(password) === String(env.ADMIN_PASSWORD)) {
            const sessionToken = crypto.randomUUID();
            await env.GROK_KV.put('session_' + sessionToken, 'valid', {expirationTtl: 3600}); // 1小时过期
            
            return new Response(JSON.stringify({success: true}), {
                headers: {
                    'Content-Type': 'application/json',
                    'Set-Cookie': `session=${sessionToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600`
                }
            });
        }
        return new Response(JSON.stringify({success: false}), {
            headers: {'Content-Type': 'application/json'}
        });
    }

    // 管理员相关路由
    if (url.pathname === '/admin') {
        return new Response(adminLoginHtml, {
            headers: {'Content-Type': 'text/html'}
        });
    }

    if (url.pathname === '/admin/dashboard') {
        if (!await isAuthenticated(request)) {
            return Response.redirect(new URL('/admin', request.url));
        }
        return new Response(adminPageHtml, {
            headers: {'Content-Type': 'text/html'}
        });
    }

    // 主页
    if (url.pathname === '/') {
        return new Response(mainPageHtml, {
            headers: { 'Content-Type': 'text/html' },
        });
    }
    
    // API 路由
    if (url.pathname === '/api/stats') {
        const ssoList = await getSsoList(env);
        const modes = ["DEFAULT", "REASONING", "DEEPSEARCH"];
        const modeLabels = {
            "DEFAULT": "标准",
            "REASONING": "思考",
            "DEEPSEARCH": "深度"
        };
        
        // 并发请求所有 SSO 的所有模式的统计数据
        const statsPromises = [];
        
        for (const sso of ssoList) {
            for (const mode of modes) {
                statsPromises.push(
                    getCachedStats(env, sso, mode).then(count => ({
                        sso: sso,
                        mode: mode,
                        count: count
                    }))
                );
            }
        }
        
        const results = await Promise.all(statsPromises);
        
        // 重新组织数据结构
        const stats = {};
        for (const result of results) {
            if (!stats[result.sso]) {
                stats[result.sso] = {};
            }
            stats[result.sso][result.mode] = result.count;
        }
        
        return new Response(JSON.stringify({
            stats: stats,
            modeLabels: modeLabels
        }), {
            headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=60' // 浏览器缓存 1 分钟
            },
        });
    }
    
    if (url.pathname === '/api/sso-list') {
        const list = await getSsoList(env);
        const isAdmin = await isAuthenticated(request);
        
        if (isAdmin) {
            // 管理员可以看到完整的 SSO 列表
            return new Response(JSON.stringify(list), {
                headers: {'Content-Type': 'application/json'}
            });
        } else {
            // 非管理员只能看到部分信息
            const maskedList = list.map(sso => sso.substring(0, 8) + '...');
            return new Response(JSON.stringify(maskedList), {
                headers: {'Content-Type': 'application/json'}
            });
        }
    }
    
    if (url.pathname === '/api/add-sso' && request.method === 'POST') {
        const { sso } = await request.json();
        const list = await getSsoList(env);
        // 将输入按逗号分割，并过滤掉空值
        const newSsos = sso.split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0);
        
        // 添加新的未重复的 SSO
        for (const newSso of newSsos) {
            if (!list.includes(newSso)) {
                list.push(newSso);
            }
        }
        
        await saveSsoList(env, list);
        return new Response(JSON.stringify({success: true}));
    }
    
    if (url.pathname === '/api/delete-sso' && request.method === 'POST') {
        const { sso } = await request.json();
        const list = await getSsoList(env);
        const newList = list.filter(s => s !== sso);
        await saveSsoList(env, newList);
        return new Response(JSON.stringify({success: true}));
    }
    
    return new Response('Not Found', { status: 404 });
}

export default {
    async fetch(request, env, ctx) {
        return handleRequest(request, env);
    },
}; 