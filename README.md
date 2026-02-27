# Keyword Aggregation Tool (关键词聚合工具)

这是一个基于 React + Vite + Tailwind CSS (v4) + Electron 前端和 FastAPI 后端的桌面应用程序。

## 1. 环境准备

### 后端环境
1. 进入后端目录: `cd backend`
2. 创建虚拟环境: `python -m venv venv`
3. 激活虚拟环境:
   - Windows: `.\venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`
4. 安装依赖: `pip install -r requirements.txt`

### 前端环境
1. 进入前端目录: `cd frontend`
2. 安装依赖: `npm install`

---

## 2. 启动项目

现在项目支持一键启动前后端。

### 启动开发环境
只需在前端目录下运行以下命令，Electron 会自动拉起 Python 后端服务：

```powershell
cd frontend
npm run electron:dev
```
*注意：请确保后端虚拟环境已创建且依赖已安装。*

后端服务将自动运行在 `http://127.0.0.1:8000`。
Electron 窗口关闭时，后端服务也会自动关闭。

---

## 3. 开发调试

- **开发者工具**: 在 Electron 窗口中按 `F12` 即可打开/关闭 Chrome 开发者工具。
- **热更新**: 前端代码修改后，Electron 窗口会自动刷新。

---

## 4. 打包与分发

### 前端打包 (生成可执行文件)
在 `frontend` 目录下运行：
```powershell
# 一键打包 Windows 版本 (自动打包后端 + 前端)
npm run build:win
```
这将会在 `frontend/dist_electron` 目录下生成安装包（如 `Keyword Aggregation Tool Setup 0.0.0.exe`）。

### 手动分步打包
如果你需要手动分步操作：
1. **打包后端**:
   ```powershell
   npm run build:backend
   ```
   这会在 `backend/dist` 下生成 `api.exe`。

2. **打包前端**:
   ```powershell
   npm run build:frontend
   ```

3. **生成安装包**:
   ```powershell
   npx electron-builder --win
   ```

---

---