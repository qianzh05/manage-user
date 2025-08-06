let users = [];
let filteredUsers = [];
let currentPage = 1;
const pageSize = 10; // 每页显示10个用户
let passwordVisibility = {};

function initData() {
    const names = ['admin', 'manager', 'operator', 'test', 'demo', 'user',
                   'developer', 'designer', 'analyst', 'supervisor', 'coordinator',
                   'james', 'mary', 'john', 'lisa', 'mike', 'anna', 'david', 'sarah'];
    
    const domains = ['qq.com', '163.com', 'gmail.com', 'hotmail.com', 'sina.com', 
                     'sohu.com', '126.com', 'outlook.com', 'foxmail.com'];
    
    const roles = ['管理员', '用户'];
    
    // 生成用户数据
    for (let i = 1; i <= 655; i++) {
        const name = names[Math.floor(Math.random() * names.length)] + (i > names.length ? i : '');
        const domain = domains[Math.floor(Math.random() * domains.length)];
        let role;
        if (i === 1) {
            role = '超级管理员';
        } else {
            role = roles[Math.floor(Math.random() * roles.length)];
        }
        
        users.push({
            id: i,
            username: name,
            email: `${name.toLowerCase()}${i}@${domain}`,
            role: role,
            password: `pass${Math.random().toString(36).substring(2, 8)}`,
            active: Math.random() > 0.2 // 80% 的用户是活跃的
        });
        passwordVisibility[i] = false;
    }
    filteredUsers = [...users];
}

function renderUserTable() { 
    const tbody = document.querySelector('#userTable tbody');
    tbody.innerHTML = '';
    const startIdx = (currentPage - 1) * pageSize;
    const pageUsers = filteredUsers.slice(startIdx, startIdx + pageSize);

    if (pageUsers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="no-data">
                    <div class="no-data-icon">📭</div>
                    <div class="no-data-text">暂无用户数据</div>
                </td>
            </tr>
        `;
        return;
    }

    for (const u of pageUsers) {    // 遍历当前页的用户
        // 根据用户ID获取密码显示状态
        const showPassword = passwordVisibility[u.id];
        const passwordDisplay = showPassword ? u.password : '••••••••';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>#${u.id}</strong></td>
            <td>${u.username}</td>
            <td>${u.email}</td>
            <td><span style="background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%); padding: 4px 12px; border-radius: 20px; font-size: 12px;">${u.role}</span></td>
            <td>
                <div class="password-cell">
                    <span class="password-text">${passwordDisplay}</span>
                    <button class="toggle-password" onclick="toggleUserPassword(${u.id})">
                        ${showPassword ? '隐藏' : '显示'}
                    </button>
                </div>
            </td>
            <td>
                <label class="status-switch">
                    <input type="checkbox" ${u.active ? 'checked' : ''} onchange="toggleUserStatus(${u.id})">
                    <span class="status-slider"></span>
                </label>
            </td>
            <td>
                <button class="btn btn-reset" onclick="resetPassword(${u.id})" ${u.active ? '' : 'disabled'}>重置密码</button>
                <button class="btn btn-edit" onclick="openEditModal(${u.id})" ${u.active ? '' : 'disabled'}>修改</button>
                <button class="btn btn-delete" onclick="deleteUser(${u.id})" ${u.active ? '' : 'disabled'}>删除</button>
            </td>
        `;
        tbody.appendChild(tr);
    }
}

function toggleUserPassword(userId) {
    passwordVisibility[userId] = !passwordVisibility[userId];
    renderUserTable();
}

function togglePasswordVisibility(inputId, button) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '隐藏';
    } else {
        input.type = 'password';
        button.textContent = '显示';
    }
}

function toggleUserStatus(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
        user.active = !user.active;
        const filteredUser = filteredUsers.find(u => u.id === userId);
        if (filteredUser) {
            filteredUser.active = user.active;
        }
        renderUserTable();
    }
}

function renderPagination() {
    const pag = document.getElementById('pagination');
    pag.innerHTML = '';
    const pageCount = Math.ceil(filteredUsers.length / pageSize);
    
    if (pageCount <= 1) return;

    // 上一页按钮
    if (currentPage > 1) {
        const prev = document.createElement('span');
        prev.innerHTML = '&laquo;';
        prev.onclick = () => {
            currentPage--;
            renderUserTable();
            renderPagination();
        };
        pag.appendChild(prev);
    }

    // 页码逻辑
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(pageCount, startPage + 4);
    
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }

    // 第一页
    if (startPage > 1) {
        const first = document.createElement('span');
        first.textContent = '1';
        first.onclick = () => {
            currentPage = 1;
            renderUserTable();
            renderPagination();
        };
        pag.appendChild(first);
        
        if (startPage > 2) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.style.cursor = 'default';
            dots.style.border = 'none';
            pag.appendChild(dots);
        }
    }

    // 页码
    for (let i = startPage; i <= endPage; i++) {
        const span = document.createElement('span');
        span.textContent = i;
        if (i === currentPage) span.classList.add('active');
        span.onclick = () => {
            currentPage = i;
            renderUserTable();
            renderPagination();
        };
        pag.appendChild(span);
    }

    // 最后一页
    if (endPage < pageCount) {
        if (endPage < pageCount - 1) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.style.cursor = 'default';
            dots.style.border = 'none';
            pag.appendChild(dots);
        }
        
        const last = document.createElement('span');
        last.textContent = pageCount;
        last.onclick = () => {
            currentPage = pageCount;
            renderUserTable();
            renderPagination();
        };
        pag.appendChild(last);
    }

    // 下一页按钮
    if (currentPage < pageCount) {
        const next = document.createElement('span');
        next.innerHTML = '&raquo;';
        next.onclick = () => {
            currentPage++;
            renderUserTable();
            renderPagination();
        };
        pag.appendChild(next);
    }
}

// 搜索
document.getElementById('searchInput').addEventListener('input', e => {
    const kw = e.target.value.trim().toLowerCase();
    filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(kw) ||
        u.email.toLowerCase().includes(kw) ||
        u.role.toLowerCase().includes(kw) ||
        u.password.toLowerCase().includes(kw)
    );
    currentPage = 1;
    renderUserTable();
    renderPagination();
});

// 重置密码
function resetPassword(id) {
    const u = users.find(u => u.id === id);
    if (!u) return;
    
    const newPwd = u.username + u.email.split('@')[0];
    u.password = newPwd;
    const fu = filteredUsers.find(f => f.id === id);
    if (fu) fu.password = newPwd;
    
    renderUserTable();
    alert(`用户 ${u.username} 的密码已重置为：${newPwd}`);
}

// 删除用户
function deleteUser(id) {
    const user = users.find(u => u.id === id);
    if (!user) return;
    
    if (!confirm(`确认要删除用户 "${user.username}" 吗？此操作不可恢复。`)) return;
    
    users = users.filter(u => u.id !== id);
    filteredUsers = filteredUsers.filter(f => f.id !== id);
    delete passwordVisibility[id];
    
    const totalPages = Math.ceil(filteredUsers.length / pageSize);
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
    }
    
    renderUserTable();
    renderPagination();
    alert('用户删除成功！');
}

// 打开添加模态框
function openAddModal() {
    document.getElementById('addModal').style.display = 'flex';
    document.getElementById('addPassword').type = 'password';
    document.querySelector('#addModal .password-toggle-btn').textContent = '显示';
    document.getElementById('addUsername').focus();
}

// 打开编辑模态框
function openEditModal(id) {
    const u = users.find(u => u.id === id);
    if (!u) return;
    
    document.getElementById('editUserId').value = u.id;
    document.getElementById('editUsername').value = u.username;
    document.getElementById('editEmail').value = u.email;
    document.getElementById('editRole').value = u.role;
    document.getElementById('editPassword').value = u.password;
    document.getElementById('editModal').style.display = 'flex';
    document.getElementById('editPassword').type = 'password';
    document.querySelector('#editModal .password-toggle-btn').textContent = '显示';
    document.getElementById('editUsername').focus();
}

// 关闭模态框
function closeModal(id) {
    document.getElementById(id).style.display = 'none';
    if (id === 'addModal') document.getElementById('addUserForm').reset();
    if (id === 'editModal') document.getElementById('editUserForm').reset();
}

// 添加用户表单提交
document.getElementById('addUserForm').addEventListener('submit', e => {
    e.preventDefault();
    const username = document.getElementById('addUsername').value.trim();
    const email = document.getElementById('addEmail').value.trim();
    const role = document.getElementById('addRole').value;
    let pwd = document.getElementById('addPassword').value.trim();

    if (!username || !email || !role) {
        alert('请填写所有必填项');
        return;
    }
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        alert('用户名已存在');
        return;
    }
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        alert('邮箱已存在');
        return;
    }
    if (!pwd) {
        pwd = 'pwd' + Math.random().toString(36).substring(2, 10);
    }

    const id = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const newUser = { id, username, email, role, password: pwd, active: true };
    users.push(newUser);
    passwordVisibility[id] = false;
    
    const searchKeyword = document.getElementById('searchInput').value.trim().toLowerCase();
    if (searchKeyword) {
        filteredUsers = users.filter(u =>
            u.username.toLowerCase().includes(searchKeyword) ||
            u.email.toLowerCase().includes(searchKeyword) ||
            u.role.toLowerCase().includes(searchKeyword) ||
            u.password.toLowerCase().includes(searchKeyword)
        );
    } else {
        filteredUsers = [...users];
    }
    
    const totalPages = Math.ceil(filteredUsers.length / pageSize);
    currentPage = totalPages;
    
    closeModal('addModal');
    renderUserTable();
    renderPagination();
    alert('用户添加成功！');
});

// 编辑用户表单提交
document.getElementById('editUserForm').addEventListener('submit', e => {
    e.preventDefault();
    const id = parseInt(document.getElementById('editUserId').value, 10);
    const username = document.getElementById('editUsername').value.trim();
    const role = document.getElementById('editRole').value;
    const pwd = document.getElementById('editPassword').value.trim();
    const user = users.find(u => u.id === id);

    if (!username || !role || !pwd) {
        alert('请填写所有必填项');
        return;
    }

    if (users.some(u => u.username.toLowerCase() === username.toLowerCase() && u.id !== id)) {
        alert('用户名已存在');
        return;
    }

    user.username = username;
    user.role = role;
    user.password = pwd;
    
    const filteredUser = filteredUsers.find(u => u.id === id);
    if (filteredUser) {
        filteredUser.username = username;
        filteredUser.role = role;
        filteredUser.password = pwd;
    }
    
    closeModal('editModal');
    renderUserTable();
    alert('用户信息修改成功！');
});

// 点击模态框外部关闭
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        const modalId = event.target.id;
        if (modalId === 'addModal') document.getElementById('addUserForm').reset();
        if (modalId === 'editModal') document.getElementById('editUserForm').reset();
    }
}

// 密码强度条
function injectStrengthBar(inputId) {
    const input = document.getElementById(inputId);
    const container = document.createElement('div');
    container.className = 'password-strength-container';

    const bar = document.createElement('div');
    bar.id = 'passwordStrengthBar';
    const label = document.createElement('div');
    label.id = 'passwordStrengthLabel';
    label.textContent = '密码强度';

    container.appendChild(bar);
    container.appendChild(label);
    input.parentNode.parentNode.appendChild(container);

    input.addEventListener('input', () => {
        const val = input.value;
        let strength = 0;
        if (val.length >= 8) strength++;
        if (/[A-Z]/.test(val)) strength++;
        if (/[a-z]/.test(val)) strength++;
        if (/\d/.test(val)) strength++;
        if (/[^A-Za-z0-9]/.test(val)) strength++;

        const colors = ['#dc3545', '#fd7e14', '#ffc107', '#28a745', '#20c997'];
        bar.style.background = colors[strength - 1] || '#e0e0e0';
    });
}

// 在初始化后调用
document.addEventListener('DOMContentLoaded', () => {
    injectStrengthBar('addPassword');
    injectStrengthBar('editPassword');
});

// 初始化
initData();
renderUserTable();
renderPagination();