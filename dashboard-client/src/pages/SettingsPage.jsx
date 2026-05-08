import React, { useState } from 'react';
import { Card, Button, Breadcrumb, Typography, Space, Alert, Progress, message, Modal } from 'antd';
import { DatabaseOutlined, DownloadOutlined, SafetyOutlined, InfoCircleOutlined, HomeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

function SettingsPage() {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.role === 'Administrator';

  const handleExportDatabase = async () => {
    if (!isAdmin) {
      message.error('您没有权限执行此操作');
      return;
    }

    Modal.confirm({
      title: '确认导出数据库配置',
      icon: <SafetyOutlined />,
      content: (
        <div>
          <Paragraph>确定要导出数据库配置文件吗？</Paragraph>
          <Alert
            message="安全提示"
            description="导出的配置文件不包含任何敏感认证信息（用户名、密码等），已进行脱敏处理。"
            type="info"
            showIcon
            style={{ marginTop: 16 }}
          />
        </div>
      ),
      okText: '确认导出',
      cancelText: '取消',
      onOk: async () => {
        setExporting(true);
        setProgress(10);

        try {
          const token = localStorage.getItem('token');
          setProgress(30);

          const response = await fetch('/api/database/export', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          setProgress(60);

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '导出失败');
          }

          setProgress(80);

          const blob = await response.blob();
          const contentDisposition = response.headers.get('Content-Disposition');
          const timestamp = new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }).replace(/[\/\s:]/g, '').replace(/,/g, '');
          let filename = `database_${timestamp}.sql`;

          if (contentDisposition) {
            const match = contentDisposition.match(/filename="?([^"]+)"?/);
            if (match) {
              filename = match[1];
            }
          }

          setProgress(90);

          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          setProgress(100);

          setTimeout(() => {
            setExporting(false);
            setProgress(0);
            message.success('数据库配置导出成功！');
          }, 500);

        } catch (error) {
          setExporting(false);
          setProgress(0);
          message.error('导出失败: ' + error.message);
          console.error('导出数据库配置失败:', error);
        }
      }
    });
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <Link to="/dashboard"><HomeOutlined /> 首页</Link> },
          { title: '全局设置' }
        ]}
      />

      <Title level={3} style={{ marginBottom: 24 }}>全局设置</Title>

      <Alert
        message="系统配置管理"
        description="在此页面您可以管理系统的全局配置，包括数据库配置导出等功能。仅管理员用户可以访问敏感配置项。"
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ marginBottom: 24 }}
      />

      <Card
        title={
          <Space>
            <DatabaseOutlined />
            <span>数据库配置管理</span>
          </Space>
        }
        extra={
          <Text type="secondary">系统配置管理</Text>
        }
        style={{ marginBottom: 24 }}
      >
        <div style={{ padding: '20px 0' }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            padding: '24px',
            color: 'white',
            marginBottom: '24px'
          }}>
            <Title level={4} style={{ color: 'white', marginBottom: 8 }}>导出数据库配置</Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.9)', marginBottom: 0 }}>
              生成包含当前数据库连接信息、表结构、索引等完整配置的 SQL 文件。导出的文件不包含任何敏感信息。
            </Paragraph>
          </div>

          <div style={{
            background: '#f8f9fa',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <Title level={5} style={{ marginBottom: 12 }}>导出内容说明</Title>
            <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
              <li style={{ marginBottom: 8 }}>数据库类型、主机地址、端口号、数据库名称</li>
              <li style={{ marginBottom: 8 }}>所有表的结构（字段、类型、约束、索引）</li>
              <li style={{ marginBottom: 8 }}>表数据（设备信息等，用户表数据因安全原因已跳过）</li>
              <li style={{ marginBottom: 0 }}>字符集配置信息</li>
            </ul>
          </div>

          <div style={{
            background: '#fff3cd',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '24px',
            borderLeft: '4px solid #ffc107'
          }}>
            <Text type="warning" strong>安全说明：</Text>
            <Text type="secondary"> 导出的配置文件中不包含数据库用户名、密码等敏感认证信息，已进行脱敏处理。</Text>
          </div>

          {exporting && (
            <div style={{ marginBottom: 24 }}>
              <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                正在导出数据库配置...
              </Text>
              <Progress percent={progress} status="active" />
            </div>
          )}

          <Button
            type="primary"
            size="large"
            icon={<DownloadOutlined />}
            onClick={handleExportDatabase}
            loading={exporting}
            disabled={!isAdmin || exporting}
            style={{
              height: 48,
              paddingLeft: 32,
              paddingRight: 32,
              fontSize: 16,
              borderRadius: '8px'
            }}
          >
            {exporting ? '正在导出...' : '导出数据库配置'}
          </Button>

          {!isAdmin && (
            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
              * 只有管理员角色才能导出数据库配置
            </Text>
          )}
        </div>
      </Card>

      <Card title="系统信息" extra={<SafetyOutlined />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div style={{
            padding: '16px',
            background: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <Text type="secondary">系统版本</Text>
            <div style={{ fontSize: '16px', fontWeight: 500, marginTop: 4 }}>v1.0.0</div>
          </div>
          <div style={{
            padding: '16px',
            background: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <Text type="secondary">数据库类型</Text>
            <div style={{ fontSize: '16px', fontWeight: 500, marginTop: 4 }}>MySQL 8.0</div>
          </div>
          <div style={{
            padding: '16px',
            background: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <Text type="secondary">字符集</Text>
            <div style={{ fontSize: '16px', fontWeight: 500, marginTop: 4 }}>utf8mb4</div>
          </div>
          <div style={{
            padding: '16px',
            background: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <Text type="secondary">当前用户</Text>
            <div style={{ fontSize: '16px', fontWeight: 500, marginTop: 4 }}>{currentUser.username || '-'}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default SettingsPage;
