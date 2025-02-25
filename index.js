// HTML 模板
const mainPageHtml = `<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Grok API 使用统计</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-center mb-8">Grok API 使用统计</h1>
        
        <!-- 添加快速添加表单 -->
        <div class="max-w-md mx-auto mb-8">
            <form id="quickAddForm" class="flex gap-2">
                <input type="text" id="quickSsoToken" 
                    class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="输入 SSO Token" required>
                <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    快速添加
                </button>
            </form>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="ssoCards">
        </div>
        <div class="mt-8 text-center">
            <p class="text-xl">总剩余次数: <span id="totalRemaining" class="font-bold">0</span></p>
            <a href="/admin" class="mt-4 inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">管理面板</a>
        </div>
    </div>
    <script>
        let lastUpdate = 0;
        const REFRESH_INTERVAL = 30000; // 30 秒
        const CACHE_DURATION = 60000;   // 1 分钟
        
        async function fetchData(force = false) {
            const now = Date.now();
            if (!force && now - lastUpdate < CACHE_DURATION) {
                return; // 使用现有数据
            }
            
            try {
                const response = await fetch('/api/stats');
                if (!response.ok) throw new Error('Network response was not ok');
                
                const data = await response.json();
                const ssoCards = document.getElementById('ssoCards');
                let total = 0;
                
                // 预先创建所有卡片的 HTML
                const cardsHtml = Object.entries(data).map(([key, value]) => {
                    total += value;
                    const id = key.substring(0, 8);
                    return '<div class="bg-white p-6 rounded-lg shadow">' +
                           '<h3 class="text-lg font-semibold mb-2">SSO ID: ' + id + '...</h3>' +
                           '<p class="text-2xl font-bold text-blue-600">' + value + '</p>' +
                           '<p class="text-gray-600">剩余调用次数</p></div>';
                }).join('');
                
                // 一次性更新 DOM
                ssoCards.innerHTML = cardsHtml;
                document.getElementById('totalRemaining').textContent = total;
                lastUpdate = now;
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        
        // 初始加载
        fetchData(true);
        
        // 定期刷新
        setInterval(() => fetchData(), REFRESH_INTERVAL);
        
        // 页面可见性变化时刷新
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                fetchData(true);
            }
        });
        
        // 添加快速添加功能
        document.getElementById('quickAddForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const ssoToken = document.getElementById('quickSsoToken').value;
            
            try {
                await fetch('/api/add-sso', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({sso: ssoToken})
                });
                
                document.getElementById('quickSsoToken').value = '';
                fetchData(true);
            } catch (error) {
                console.error('Error adding SSO:', error);
            }
        });
    </script>
</body>
</html>`;

const adminPageHtml = `<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Grok API 管理界面</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
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
                            <i class="fas fa-copy mr-2"></i>复制所有 SSO
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
    
    <!-- 复制成功提示 -->
    <div id="copyNotification" class="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg transform translate-y-20 opacity-0 transition-all duration-300">
        <i class="fas fa-check mr-2"></i>复制成功
    </div>
    
    <script>
        // 显示复制成功提示
        function showCopyNotification() {
            const notification = document.getElementById('copyNotification');
            notification.classList.remove('translate-y-20', 'opacity-0');
            notification.classList.add('translate-y-0', 'opacity-100');
            
            setTimeout(() => {
                notification.classList.remove('translate-y-0', 'opacity-100');
                notification.classList.add('translate-y-20', 'opacity-0');
            }, 2000);
        }
        
        // 复制文本到剪贴板
        async function copyToClipboard(text) {
            try {
                await navigator.clipboard.writeText(text);
                showCopyNotification();
            } catch (err) {
                console.error('复制失败:', err);
                alert('复制失败，请手动复制');
            }
        }
        
        // 加载 SSO 列表
        async function loadSSOList() {
            try {
                const response = await fetch('/api/sso-list');
                const data = await response.json();
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
                
                data.forEach((sso, index) => {
                    const row = document.createElement('tr');
                    row.className = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                    
                    row.innerHTML = \`
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            \${sso.substring(0, 8)}...
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                            <div class="flex items-center">
                                <span class="truncate max-w-xs">\${sso}</span>
                                <button onclick="copyToClipboard('\${sso}')" class="ml-2 text-blue-500 hover:text-blue-700">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button onclick="deleteSso('\${sso}')" class="text-red-500 hover:text-red-700 transition">
                                <i class="fas fa-trash-alt mr-1"></i>删除
                            </button>
                        </td>
                    \`;
                    
                    ssoList.appendChild(row);
                });
            } catch (error) {
                console.error('加载 SSO 列表失败:', error);
            }
        }

        // 添加 SSO
        document.getElementById('ssoForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const ssoToken = document.getElementById('ssoToken').value;
            
            try {
                await fetch('/api/add-sso', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({sso: ssoToken})
                });
                
                document.getElementById('ssoToken').value = '';
                await loadSSOList();
            } catch (error) {
                console.error('添加 SSO 失败:', error);
            }
        });

        // 删除 SSO
        async function deleteSso(sso) {
            if (!confirm('确定要删除这个 SSO Token 吗？')) return;
            
            try {
                await fetch('/api/delete-sso', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({sso})
                });
                await loadSSOList();
            } catch (error) {
                console.error('删除 SSO 失败:', error);
            }
        }
        
        // 复制所有 SSO
        document.getElementById('copyAllBtn').addEventListener('click', async () => {
            try {
                const response = await fetch('/api/sso-list');
                const data = await response.json();
                const allSsos = data.join('\\n');
                await copyToClipboard(allSsos);
            } catch (error) {
                console.error('复制所有 SSO 失败:', error);
            }
        });
        
        // 刷新按钮
        document.getElementById('refreshBtn').addEventListener('click', () => {
            loadSSOList();
        });

        // 初始加载
        loadSSOList();
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
async function fetchGrokStats(sso) {
    const response = await fetch('https://grok.com/rest/rate-limits', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'Cookie': 'sso=' + sso + '; sso-rw=' + sso + '; _ga_8FEWB057YH=GS1.1.1740406711.1.1.1740407320.0.0.0',
        },
        body: JSON.stringify({
            "requestKind": "DEFAULT",
            "modelName": "grok-3"
        })
    });
    
    const data = await response.json();
    return data.remainingQueries;
}

// 添加缓存相关函数
async function getCachedStats(env, sso) {
    const cacheKey = `stats_${sso}`;
    const cached = await env.GROK_KV.get(cacheKey);
    if (cached) {
        return parseInt(cached);
    }
    
    try {
        const stats = await fetchGrokStats(sso);
        // 缓存 5 分钟
        await env.GROK_KV.put(cacheKey, stats.toString(), {expirationTtl: 300});
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
        
        // 并发请求所有 SSO 的统计数据
        const statsPromises = ssoList.map(sso => 
            getCachedStats(env, sso).then(count => [sso, count])
        );
        
        const results = await Promise.all(statsPromises);
        const stats = Object.fromEntries(results);
        
        return new Response(JSON.stringify(stats), {
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