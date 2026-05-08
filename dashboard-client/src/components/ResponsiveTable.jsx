import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Space, Typography, Empty } from 'antd';
import { DesktopOutlined, SafetyOutlined, SwitcherOutlined, LaptopOutlined, QuestionOutlined } from '@ant-design/icons';

const { Text } = Typography;

export const DeviceCard = ({ record, isAdmin, onEdit, onDelete }) => {
  const getDeviceIcon = (type) => {
    switch (type) {
      case 'server': return <DesktopOutlined style={{ color: '#1890ff' }} />;
      case 'firewall': return <SafetyOutlined style={{ color: '#f5222d' }} />;
      case 'switch': return <SwitcherOutlined style={{ color: '#52c41a' }} />;
      case 'computer': return <LaptopOutlined style={{ color: '#722ed1' }} />;
      case 'other': return <QuestionOutlined style={{ color: '#faad14' }} />;
      default: return <DesktopOutlined />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'success';
      case 'warning': return 'warning';
      case 'offline': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online': return '在线';
      case 'warning': return '告警';
      case 'offline': return '离线';
      default: return status;
    }
  };

  const typeMap = { server: '服务器', firewall: '防火墙', switch: '交换机', computer: '电脑主机', other: '其他设备' };

  return (
    <Card
      size="small"
      style={{
        marginBottom: 12,
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
      styles={{ body: { padding: 16 } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <Space>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: '#f0f5ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
          }}>
            {getDeviceIcon(record.type)}
          </div>
          <div>
            <Text strong style={{ fontSize: 15, display: 'block' }}>{record.name}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{typeMap[record.type] || record.type}</Text>
          </div>
        </Space>
        <Tag color={getStatusColor(record.status)} style={{ fontSize: 12 }}>
          {getStatusText(record.status)}
        </Tag>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        <div style={{ background: '#fafafa', padding: '8px 12px', borderRadius: 6 }}>
          <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>IP地址</Text>
          <Text style={{ fontSize: 13 }}>{record.ip}</Text>
        </div>
        <div style={{ background: '#fafafa', padding: '8px 12px', borderRadius: 6 }}>
          <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>运行时间</Text>
          <Text style={{ fontSize: 13 }}>{record.uptime || '-'}</Text>
        </div>
        <div style={{ background: '#fafafa', padding: '8px 12px', borderRadius: 6 }}>
          <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>CPU型号</Text>
          <Text style={{ fontSize: 13 }} ellipsis={{ tooltip: record.cpu_model }}>{record.cpu_model || '-'}</Text>
        </div>
        <div style={{ background: '#fafafa', padding: '8px 12px', borderRadius: 6 }}>
          <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>内存大小</Text>
          <Text style={{ fontSize: 13 }}>{record.memory_size || '-'}</Text>
        </div>
      </div>

      {isAdmin && (
        <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
          <button
            onClick={() => onEdit(record)}
            style={{
              flex: 1,
              padding: '8px 0',
              border: '1px solid #d9d9d9',
              borderRadius: 6,
              background: '#fff',
              color: '#1890ff',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            编辑
          </button>
          <button
            onClick={() => onDelete(record.id)}
            style={{
              flex: 1,
              padding: '8px 0',
              border: '1px solid #ff4d4f',
              borderRadius: 6,
              background: '#fff',
              color: '#ff4d4f',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            删除
          </button>
        </div>
      )}
    </Card>
  );
};

export const UserCard = ({ record, isAdmin, onEdit, onDelete, currentUserId }) => {
  const getRoleColor = (role) => {
    switch (role) {
      case 'Administrator': return 'red';
      case 'Operator': return 'blue';
      case 'Viewer': return 'green';
      default: return 'default';
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'Administrator': return '管理员';
      case 'Operator': return '操作员';
      case 'Viewer': return '访客';
      default: return role;
    }
  };

  return (
    <Card
      size="small"
      style={{
        marginBottom: 12,
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
      styles={{ body: { padding: 16 } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <Space>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: 16,
          }}>
            {record.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <Text strong style={{ fontSize: 15, display: 'block' }}>{record.username}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
          </div>
        </Space>
        <Tag color={getRoleColor(record.role)} style={{ fontSize: 12 }}>
          {getRoleText(record.role)}
        </Tag>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        <div style={{ background: '#fafafa', padding: '8px 12px', borderRadius: 6 }}>
          <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>状态</Text>
          <Text style={{ fontSize: 13, color: record.status === 'active' ? '#52c41a' : '#999' }}>
            {record.status === 'active' ? '活跃' : '未激活'}
          </Text>
        </div>
        <div style={{ background: '#fafafa', padding: '8px 12px', borderRadius: 6 }}>
          <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>最后登录</Text>
          <Text style={{ fontSize: 13 }}>{record.last_login ? new Date(record.last_login).toLocaleDateString('zh-CN') : '从未登录'}</Text>
        </div>
      </div>

      {isAdmin && record.id !== currentUserId && (
        <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
          <button
            onClick={() => onEdit(record)}
            style={{
              flex: 1,
              padding: '8px 0',
              border: '1px solid #d9d9d9',
              borderRadius: 6,
              background: '#fff',
              color: '#1890ff',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            编辑
          </button>
          <button
            onClick={() => onDelete(record.id)}
            style={{
              flex: 1,
              padding: '8px 0',
              border: '1px solid #ff4d4f',
              borderRadius: 6,
              background: '#fff',
              color: '#ff4d4f',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            删除
          </button>
        </div>
      )}
    </Card>
  );
};

export const useResponsiveTable = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
};

export const ResponsiveTable = ({
  columns,
  dataSource,
  rowKey,
  loading,
  pagination,
  onChange,
  emptyText = '暂无数据',
  sortColumns,
  filters,
}) => {
  const isMobile = useResponsiveTable();

  if (isMobile) {
    return (
      <div style={{ width: '100%' }}>
        {dataSource && dataSource.length > 0 ? (
          dataSource.map((item) => (
            <div key={item[rowKey]}>{item.renderCard ? item.renderCard(item) : null}</div>
          ))
        ) : (
          <Empty description={emptyText} style={{ padding: '40px 0' }} />
        )}
      </div>
    );
  }

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      rowKey={rowKey}
      loading={loading}
      pagination={pagination}
      onChange={onChange}
      scroll={{ x: 'max-content' }}
      locale={{ emptyText }}
    />
  );
};
