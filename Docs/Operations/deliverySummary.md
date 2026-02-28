# 交付总览（当前状态）

## 1. 文档资产清单

- 规范总览：`Docs/platformSpec.md`
- 文档索引：`Docs/docIndex.md`
- 文档治理：`Docs/Governance/docGovernance.md`
- 文档维护：`Docs/Governance/docMaintenance.md`
- 决策日志：`Docs/Governance/decisionLog.md`
- 架构基线：`Docs/Architecture/architectureBaseline.md`
- 路线规划：`Docs/Delivery/roadmapPlan.md`
- 脑暴机制：`Docs/Delivery/brainstormingWorkshop.md`
- 交付手册：`Docs/Operations/deliveryHandbook.md`

## 2. 已锁定默认决策

- 目录命名：`UpperCamelCase`
- 业务文件命名：`lowerCamelCase`
- 前端技术栈：`React + TypeScript + Tailwind CSS + shadcn/ui`
- IM 实时层：`Socket.IO + Redis Adapter`
- 异步总线：`Kafka`
- 租户模型：共享库 + `RLS`
- 消息留存：默认 1 年

## 3. 执行入口（立即可用）

- 按 `architectureBaseline` 建立服务骨架。
- 按 `roadmapPlan` 拆解 0-30 天任务并分配 owner。
- 按 `brainstormingWorkshop` 启动首次团队评审会。
- 按 `decisionLog` 记录后续关键变更。

## 4. 管理口径

- 架构/范围调整：先改文档，再改实现计划。
- 关键决策变更：必须新增 `decisionLog` 条目。
- 每周固定一次文档巡检，保证索引和内容一致。

## 5. 最近更新时间

- 2026-02-28
