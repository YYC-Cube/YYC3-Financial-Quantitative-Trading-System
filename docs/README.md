# “YYC³ Financial Quantitative Trading System”

## 项目概述
“YYC³（YanYuCloudCube）Financial Quantitative Trading System”是一个整合全球大数据资源，运用先进的量子技术与经典数据分析方法，为金融市场参与者提供精准、高效的量化分析服务的综合性平台。系统致力于解决传统量化分析在处理海量数据和复杂模型时的效率瓶颈，提升预测的准确性和策略的有效性，助力投资者在复杂多变的金融市场中做出更科学的决策。
系统主要面向专业量化投资机构、对冲基金、大型金融机构的投资部门以及高净值个人投资者，提供数据可视化、策略生成与执行、风险评估与管理、量子技术融合、全球大数据整合与处理、量化分析模型构建等核心功能。
	
## 技术栈

### 前端技术栈

- **框架**：React 18
- **状态管理**：Redux Toolkit
- **UI组件库**：Ant Design
- **图表库**：ECharts, D3.js, Highcharts
- **路由**：React Router 6
- **构建工具**：Webpack 5
- **测试**：Jest, React Testing Library
- **代码编辑器**：Monaco Editor

### 后端技术栈
    
- **框架**：FastAPI
- **数据库**：
- 关系型数据库：PostgreSQL
- 时序数据库：InfluxDB
- 缓存：Redis
- **任务队列**：Celery + Redis
- **消息队列**：Kafka
- **量子计算**：Qiskit, Cirq
- **数据处理**：Pandas, NumPy, SciPy
- **机器学习**：Scikit-learn, TensorFlow, PyTorch
- **测试**：Pytest

### 部署与运维

- **容器化**：Docker
- **容器编排**：Kubernetes
- **监控**：Prometheus + Grafana
- **日志**：ELK Stack (Elasticsearch, Logstash, Kibana)
- **CI/CD**：Jenkins, GitLab CI
	
## 开发环境设置

### 前端开发环境设置

1. 安装Node.js (推荐版本：16.x或更高)
2. 克隆项目代码
```bash
git clone https://github.com/YYC-Cube/YYC3-QATS.git
cd YYC3-QATS/frontend

## 项目架构设计

   YYC3-QATS/
	├── README.md                         # 项目说明文档
	├── docs/                             # 文档目录
	│   ├── developer_guide/              # 开发者指南
	│   │   ├── 01_project_overview.md    # 项目概述
	│   │   ├── 02_tech_stack.md          # 技术栈
	│   │   ├── 03_dev_environment.md     # 开发环境设置
	│   │   ├── 04_project_structure.md   # 项目结构
	│   │   ├── 05_core_modules.md        # 核心功能模块
	│   │   ├── 06_api_documentation.md   # API文档
	│   │   ├── 07_component_library.md   # 组件库
	│   │   ├── 08_state_management.md    # 状态管理
	│   │   ├── 09_routing_system.md      # 路由系统
	│   │   ├── 10_error_handling.md      # 错误处理
	│   │   ├── 11_testing_guide.md       # 测试指南
	│   │   ├── 12_deployment.md          # 部署流程
	│   │   ├── 13_contribution.md        # 贡献指南
	│   │   └── 14_faq.md                 # 常见问题
	│   ├── user_guide/                   # 用户指南
	│   │   ├── getting_started.md        # 快速开始
	│   │   ├── data_visualization.md     # 数据可视化指南
	│   │   ├── strategy_development.md   # 策略开发指南
	│   │   ├── risk_management.md        # 风险管理指南
	│   │   └── quantum_features.md       # 量子功能指南
	│   └── api/                          # API文档（自动生成）
	│       └── index.html
	├── frontend/                         # 前端应用
	│   ├── public/                       # 静态资源
	│   │   ├── index.html
	│   │   ├── favicon.ico
	│   │   └── ...
	│   ├── src/                         # 源代码
	│   │   ├── components/              # 通用组件
	│   │   │   ├── common/              # 通用组件
	│   │   │   │   ├── Chart.js         # 图表基础组件
	│   │   │   │   ├── DataTable.js     # 数据表格组件
	│   │   │   │   └── ...
	│   │   │   ├── modules/            # 各模块组件
	│   │   │   │   ├── DataVisualization/   # 数据可视化模块
	│   │   │   │   ├── StrategyExecution/   # 策略执行模块
	│   │   │   │   ├── RiskManagement/      # 风险管理模块
	│   │   │   │   ├── QuantumTech/         # 量子技术模块
	│   │   │   │   ├── DataIntegration/     # 数据整合模块
	│   │   │   │   └── ModelBuilding/       # 模型构建模块
	│   │   │   └── layout/                  # 布局组件
	│   │   │       ├── Header.js
	│   │   │       ├── Sidebar.js
	│   │   │       └── Footer.js
	│   │   ├── pages/                   # 页面组件
	│   │   │   ├── Dashboard.js         # 仪表盘
	│   │   │   ├── DataVisualization.js # 数据可视化页面
	│   │   │   ├── StrategyExecution.js # 策略执行页面
	│   │   │   ├── RiskManagement.js    # 风险管理页面
	│   │   │   ├── QuantumTech.js       # 量子技术页面
	│   │   │   ├── DataIntegration.js   # 数据整合页面
	│   │   │   └── ModelBuilding.js     # 模型构建页面
	│   │   ├── services/                # API服务
	│   │   │   ├── api.js               # API配置
	│   │   │   ├── dataService.js       # 数据服务
	│   │   │   ├── strategyService.js   # 策略服务
	│   │   │   ├── riskService.js       # 风险服务
	│   │   │   ├── quantumService.js    # 量子服务
	│   │   │   └── modelService.js      # 模型服务
	│   │   ├── store/                   # 状态管理
	│   │   │   ├── index.js             # Store配置
	│   │   │   ├── modules/             # 模块状态
	│   │   │   │   ├── data.js          # 数据状态
	│   │   │   │   ├── strategy.js      # 策略状态
	│   │   │   │   ├── risk.js          # 风险状态
	│   │   │   │   ├── quantum.js       # 量子状态
	│   │   │   │   └── model.js         # 模型状态
	│   │   │   └── ...
	│   │   ├── utils/                   # 工具函数
	│   │   │   ├── helpers.js           # 通用帮助函数
	│   │   │   ├── chartUtils.js        # 图表工具函数
	│   │   │   ├── dataUtils.js         # 数据处理工具函数
	│   │   │   └── ...
	│   │   ├── App.js                   # 应用主组件
	│   │   ├── index.js                 # 应用入口
	│   │   └── routes.js                # 路由配置
	│   ├── package.json
	│   └── ...
	├── backend/                         # 后端应用
	│   ├── app/                         # 应用核心
	│   │   ├── __init__.py
	│   │   ├── config.py                # 配置文件
	│   │   ├── models/                  # 数据模型
	│   │   │   ├── __init__.py
	│   │   │   ├── data_models.py       # 数据模型
	│   │   │   ├── strategy_models.py   # 策略模型
	│   │   │   ├── risk_models.py       # 风险模型
	│   │   │   ├── quantum_models.py    # 量子模型
	│   │   │   └── model_models.py      # 模型模型
	│   │   ├── services/                # 业务逻辑
	│   │   │   ├── __init__.py
	│   │   │   ├── data_service.py      # 数据服务
	│   │   │   ├── strategy_service.py  # 策略服务
	│   │   │   ├── risk_service.py      # 风险服务
	│   │   │   ├── quantum_service.py   # 量子服务
	│   │   │   └── model_service.py     # 模型服务
	│   │   ├── api/                     # API路由
	│   │   │   ├── __init__.py
	│   │   │   ├── data_api.py          # 数据API
	│   │   │   ├── strategy_api.py      # 策略API
	│   │   │   ├── risk_api.py          # 风险API
	│   │   │   ├── quantum_api.py       # 量子API
	│   │   │   └── model_api.py         # 模型API
	│   │   ├── utils/                   # 工具函数
	│   │   │   ├── __init__.py
	│   │   │   ├── data_utils.py        # 数据工具
	│   │   │   ├── strategy_utils.py    # 策略工具
	│   │   │   ├── risk_utils.py        # 风险工具
	│   │   │   └── ...
	│   │   └── quantum/                 # 量子计算相关
	│   │       ├── __init__.py
	│   │       ├── qft_algorithm.py     # 量子傅里叶变换
	│   │       ├── grover_search.py     # Grover搜索算法
	│   │       ├── qaoa_optimizer.py    # QAOA优化算法
	│   │       └── quantum_annealing.py # 量子退火算法
	│   ├── migrations/                  # 数据库迁移
	│   ├── tests/                       # 测试
	│   │   ├── __init__.py
	│   │   ├── test_data_service.py
	│   │   ├── test_strategy_service.py
	│   │   └── ...
	│   ├── requirements.txt             # Python依赖
	│   ├── run.py                       # 应用启动脚本
	│   └── ...
	├── docker/                          # Docker配置
	│   ├── Dockerfile.frontend
	│   ├── Dockerfile.backend
	│   └── docker-compose.yml
	├── scripts/                         # 脚本文件
	│   ├── setup.sh                     # 环境设置脚本
	│   ├── deploy.sh                    # 部署脚本
	│   └── import_data.py               # 数据导入脚本
	└── .gitignore                       # Git忽略文件
```
### 后端开发环境设置

1. 安装Python (推荐版本：3.9或更高)
2. 创建虚拟环境
```python
cd Yunshu-Quant-System/backend
	python -m venv venv
	source venv/bin/activate  # Linux/Mac
	# 或
	venv\Scripts\activate     # Windows
```

3. 安装依赖

```plaintext
pip install -r requirements.txt

```
4. 配置环境变量
```python
cp .env.example .env
# 编辑.env文件，配置数据库连接等参数
```

5. 初始化数据库

```plaintext
python manage.py migrate
python manage.py load_initial_data
```
6. 启动后端服务
```plaintext
python run.py

```
7. 访问 http://localhost:8000 查看API文档
### 量子计算环境设置
1. 安装量子计算框架
```plaintext
pip install qiskit cirq

```
2. 配置量子计算资源（如IBM Quantum Experience）
```python

# 在.env文件中添加IBM Quantum API密钥
IBM_QUANTUM_TOKEN=your_ibm_quantum_token
```
## 项目结构

项目采用前后端分离的架构，主要包含以下目录：
- docs/：文档目录，包含开发者指南、用户指南和API文档
- frontend/：前端应用，基于React开发
- backend/：后端应用，基于FastAPI开发
- docker/：Docker配置文件
- scripts/：实用脚本文件

详细的项目结构请参考 docs/developer_guide/04_project_structure.md。
## 核心功能模块

系统包含以下核心功能模块：

1. 数据可视化与交互界面：提供金融数据的可视化展示和交互操作
2. 策略生成与执行：提供量化策略的生成、回测、优化和执行功能
3. 风险评估与管理：提供投资组合的风险评估和管理功能
4. 量子技术融合：展示量子技术在量化分析中的应用
5. 全球大数据整合与处理：展示全球大数据的整合和处理情况
6. 量化分析模型构建：提供量化分析模型的构建和管理功能
每个模块独立自治，可单独运行，并且每个模块内的数据面板都支持点击跳转操作。
详细的功能模块说明请参考 docs/developer_guide/05_core_modules.md。

## API文档

API文档采用OpenAPI 3.0规范，可通过以下方式访问：
1. 在线访问：启动后端服务后，访问 http://localhost:8000/docs
2. 离线访问：查看 docs/api/index.html 文件
API文档包含所有接口的详细说明，包括请求参数、响应格式、错误码等。

## 组件库

系统提供了一套可复用的组件库，位于 frontend/src/components/ 目录下：
- common/：通用组件，如Chart、DataTable等
- modules/：各模块专用组件
- layout/：布局组件，如Header、Sidebar等
组件库的详细说明请参考 docs/developer_guide/07_component_library.md。

## 状态管理

前端应用使用Redux Toolkit进行状态管理，状态管理相关代码位于 frontend/src/store/ 目录下：
- index.js：Store配置
- modules/：各模块的状态管理

状态管理的详细说明请参考 docs/developer_guide/08_state_management.md。

## 路由系统

前端应用使用React Router进行路由管理，路由配置位于 frontend/src/routes.js 文件中。
路由系统的详细说明请参考 docs/developer_guide/09_routing_system.md。

## 错误处理

系统采用统一的错误处理机制，包括前端错误处理和后端错误处理。
错误处理的详细说明请参考 docs/developer_guide/10_error_handling.md。

## 测试指南

系统包含前端测试和后端测试，测试代码分别位于 frontend/src/__tests__/ 和 backend/tests/ 目录下。
测试指南的详细说明请参考 docs/developer_guide/11_testing_guide.md。

## 部署流程

系统支持多种部署方式，包括Docker部署、Kubernetes部署等。
部署流程的详细说明请参考 docs/developer_guide/12_deployment.md。

## 贡献指南

欢迎贡献代码！请遵循以下步骤：
1. Fork项目
2. 创建特性分支 (git checkout -b feature/AmazingFeature)
3. 提交更改 (git commit -m 'Add some AmazingFeature')
4. 推送到分支 (git push origin feature/AmazingFeature)
5. 创建Pull Request
贡献指南的详细说明请参考 docs/developer_guide/13_contribution.md。

## 常见问题

常见问题及解答请参考 docs/developer_guide/14_faq.md。

## 许可证

本项目采用MIT许可证 - 详见 LICENSE 文件。

## 移动端与性能专项优化 (2026-02-02)

### 1. K 线图表触摸缩放 (Pinch-to-zoom)
- **优化配置**：在 `lightweight-charts` 中显式开启了 `pinch` 与 `horzTouchDrag` 属性。
- **平滑处理**：调整了 `minBarSpacing` 与 `shiftVisibleRangeOnNewBar`，确保在大跨度缩放时图表不跳动，保持视觉连贯。
- **视觉反馈**：移动端检测到用户悬停或点击时，会自动显示“双指缩放”操作指引。

### 2. Service Worker 离线增强
- **缓存策略**：采用 **Network-First**（网络优先）策略处理行情数据，确保数据新鲜度的同时，在网络波动时能瞬间切换至本地缓存（毫秒级）。
- **PWA 预载**：将核心资源纳入预缓存，显著提升冷启动速度。
- **注册逻辑**：已在 `App.tsx` 全局注册入口，支持后台静默更新。

### 3. 极端行情响应 (一键撤单)
- **安全交互**：针对移动端极易发生的误触问题，引入了 **Slide-to-Confirm**（滑动确认）交互组件。
- **优先级响应**：紧急撤单指令直接挂载在交易模块顶层，不随列表滚动而消失，确保在极端行情下“指哪打哪”。
- **状态同步**：撤单指令执行后，通过 `sonner` 全局 Toast 实时反馈各节点（交易所、撮合引擎）的指令到达状态。

## 极端行情与多端同步增强 (2026-02-02)

### 1. Web Push API 风险预警
- **离线推送**：在 Service Worker 中集成了 `push` 事件监听，支持在浏览器关闭或 PWA 处于后台时，通过系统级通知推送极端行情风险预警。
- **交互通知**：通知包含“查看行情”与“关闭”快捷动作，点击可直接唤起应用并定位至受影响的合约页面。

### 2. 触感反馈 (Vibration Feedback)
- **操作确认**：在移动端执行“滑动撤单”动作成功后，调用 `navigator.vibrate` 触发 `[100, 50, 200]` 模式的震动反馈，从物理层面增强交易操作的确定感。
- **安全冗余**：震动反馈与 UI 提示双重叠加，确保在高压力交易环境下用户能清晰感知指令执行结果。

### 3. 多端实时状态同步
- **WebSocket 仿真**：引入了 `useQuantSync` 钩子，模拟 WebSocket 双向通信。当用户在移动端撤单时，桌面端会实时收到同步广播并自动更新持仓与挂单状态。
- **一致性保证**：通过全局广播机制，确保账户资产、活跃订单在所有终端（Desktop/Mobile）保持毫秒级数据同步。

## 联系方式

如有问题或建议，请通过以下方式联系：
- 邮箱：admin@0379.email
- 项目地址：https://github.com/YYC-Cube/YYC3-QATS