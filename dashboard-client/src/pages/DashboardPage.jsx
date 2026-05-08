import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Tag, Space, Typography, Button, Alert, Statistic } from 'antd';
import { DesktopOutlined, SafetyOutlined, SwitcherOutlined, LaptopOutlined, QuestionOutlined, CheckCircleOutlined, ExclamationCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useResponsiveTable } from '../components/ResponsiveTable';

const { Title, Text } = Typography;

const RecentDeviceCard = ({ device }) => {
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'warning': return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      case 'offline': return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#52c41a';
      case 'warning': return '#faad14';
      case 'offline': return '#ff4d4f';
      default: return '#8c8c8c';
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

  const typeMap = {
    server: '服务器',
    firewall: '防火墙',
    switch: '交换机',
    computer: '电脑主机',
    other: '其他设备'
  };

  return (
    <Card
      size="small"
      style={{
        marginBottom: 12,
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
      styles={{ body: { padding: 16 } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <Space>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${getStatusColor(device.status)}15 0%, ${getStatusColor(device.status)}25 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
          }}>
            {getDeviceIcon(device.type)}
          </div>
          <div>
            <Text strong style={{ fontSize: 15, display: 'block' }}>{device.name}</Text>
            <Space size={4}>
              <Tag color="blue" style={{ margin: 0, fontSize: 11 }}>{typeMap[device.type] || device.type}</Tag>
              <Space size={4}>
                {getStatusIcon(device.status)}
                <Text style={{ fontSize: 12, color: getStatusColor(device.status), fontWeight: 500 }}>
                  {getStatusText(device.status)}
                </Text>
              </Space>
            </Space>
          </div>
        </Space>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 12,
      }}>
        <div style={{
          padding: '10px 12px',
          background: 'linear-gradient(135deg, #fafbfc 0%, #fff 100%)',
          borderRadius: 8,
          border: '1px solid #f0f0f0',
        }}>
          <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>IP地址</Text>
          <Text style={{ fontSize: 13, fontWeight: 500 }}>{device.ip}</Text>
        </div>
        <div style={{
          padding: '10px 12px',
          background: 'linear-gradient(135deg, #fafbfc 0%, #fff 100%)',
          borderRadius: 8,
          border: '1px solid #f0f0f0',
        }}>
          <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>运行时间</Text>
          <Text style={{ fontSize: 13, fontWeight: 500 }}>{device.uptime || '未知'}</Text>
        </div>
      </div>
    </Card>
  );
};

function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [devices, setDevices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const isMobile = useResponsiveTable();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [statsRes, devicesRes, usersRes] = await Promise.all([
        fetch('/api/stats', { headers }),
        fetch('/api/devices', { headers }),
        fetch('/api/users', { headers })
      ]);

      const statsData = await statsRes.json();
      const devicesData = await devicesRes.json();
      const usersData = await usersRes.json();

      if (statsData.success) setStats(statsData.data);
      if (devicesData.success) setDevices(devicesData.data);
      if (usersData.success) setUsers(usersData.data);

    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'warning':
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      case 'offline':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return null;
    }
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'server':
        return <DesktopOutlined style={{ color: '#1890ff' }} />;
      case 'firewall':
        return <SafetyOutlined style={{ color: '#f5222d' }} />;
      case 'switch':
        return <SwitcherOutlined style={{ color: '#52c41a' }} />;
      case 'computer':
        return <LaptopOutlined style={{ color: '#722ed1' }} />;
      case 'other':
        return <QuestionOutlined style={{ color: '#faad14' }} />;
      default:
        return <DesktopOutlined />;
    }
  };

  const deviceColumns = [
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => <Space size="small">{getStatusIcon(status)}</Space>,
    },
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          {getDeviceIcon(record.type)}
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => {
        const typeMap = { server: '服务器', firewall: '防火墙', switch: '交换机', computer: '电脑主机', other: '其他设备' };
        return <Tag color="blue">{typeMap[type] || type}</Tag>;
      },
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 130,
    },
    {
      title: '管理账号',
      dataIndex: 'username',
      key: 'username',
      width: 120,
      render: (username) => username || '-',
    },
    {
      title: '运行时间',
      dataIndex: 'uptime',
      key: 'uptime',
      width: 120,
    },
  ];

  const getDeviceChartData = () => {
    if (!stats) return [];
    return [
      { name: '服务器', value: stats.servers || 0, color: '#1890ff' },
      { name: '防火墙', value: stats.firewalls || 0, color: '#f5222d' },
      { name: '交换机', value: stats.switches || 0, color: '#52c41a' },
      { name: '电脑主机', value: stats.computers || 0, color: '#722ed1' },
      { name: '其他设备', value: stats.others || 0, color: '#faad14' },
    ].filter(item => item.value > 0);
  };

  const getUserChartData = () => {
    if (!users || !stats) return [];
    return [
      { name: '管理员', value: users.filter(u => u.role === 'Administrator').length || 0, color: '#f5222d' },
      { name: '操作员', value: users.filter(u => u.role === 'Operator').length || 0, color: '#1890ff' },
      { name: '访客', value: users.filter(u => u.role === 'Viewer').length || 0, color: '#52c41a' },
    ].filter(item => item.value > 0);
  };

  const getHealthChartData = () => {
    if (!stats) return [];
    return [
      { name: '在线', value: stats.onlineDevices || 0, color: '#52c41a' },
      { name: '告警', value: stats.warningDevices || 0, color: '#faad14' },
      { name: '离线', value: stats.offlineDevices || 0, color: '#ff4d4f' },
    ].filter(item => item.value > 0);
  };

  const PieChart3D = ({ data, title, isMobile }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const colors = ['#4F7BFE', '#FF6B6B', '#51CF66', '#FFD43B', '#845EF7', '#20C997'];

    const chartSize = isMobile ? 140 : 200;
    const innerRadius = isMobile ? 28 : 40;

    const createPieChart = () => {
      if (total === 0) return null;

      let currentAngle = -90;
      const slices = [];

      data.forEach((item, index) => {
        if (item.value === 0) return;

        const sliceAngle = (item.value / total) * 360;
        const largeArc = sliceAngle > 180 ? 1 : 0;
        const color = colors[index % colors.length];

        const startRad = currentAngle * Math.PI / 180;
        const endRad = (currentAngle + sliceAngle) * Math.PI / 180;

        const x1 = 50 + innerRadius * Math.cos(startRad);
        const y1 = 50 + innerRadius * Math.sin(startRad);
        const x2 = 50 + innerRadius * Math.cos(endRad);
        const y2 = 50 + innerRadius * Math.sin(endRad);

        const pathD = sliceAngle >= 359.99
          ? `M 50 ${50 - innerRadius} A ${innerRadius} ${innerRadius} 0 1 1 49.99 ${50 - innerRadius} Z`
          : `M 50 50 L ${x1} ${y1} A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

        slices.push(
          <path
            key={item.name}
            d={pathD}
            fill={color}
            stroke="#fff"
            strokeWidth="3"
            strokeLinejoin="round"
            style={{
              filter: `drop-shadow(0 4px 8px ${color}40)`,
              transform: 'scale(1)',
              transformOrigin: 'center',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.filter = `drop-shadow(0 6px 12px ${color}60)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.filter = `drop-shadow(0 4px 8px ${color}40)`;
            }}
          />
        );

        currentAngle += sliceAngle;
      });

      return slices;
    };

    return (
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>{title}</span>
          </div>
        }
        loading={loading}
        style={{ borderRadius: '16px', height: '100%' }}
        styles={{ body: { padding: isMobile ? '16px' : '24px', display: 'flex', alignItems: 'center', gap: isMobile ? '16px' : '32px', flexWrap: isMobile ? 'wrap' : 'nowrap', overflow: 'hidden', justifyContent: 'center' } }}
      >
        <div style={{
          position: 'relative',
          width: `${chartSize}px`,
          height: `${chartSize}px`,
          flexShrink: 0,
        }}>
          <svg
            width={chartSize}
            height={chartSize}
            viewBox="0 0 100 100"
            style={{
              transform: 'rotate(0deg)',
              filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.1))',
            }}
          >
            <defs>
              <filter id={`shadow-${title}`}>
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.1"/>
              </filter>
            </defs>
            {createPieChart()}
          </svg>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}>
            <div style={{
              fontSize: isMobile ? '10px' : '12px',
              color: '#8c8c8c',
              marginBottom: isMobile ? '2px' : '4px',
              fontWeight: 500,
            }}>
              总计
            </div>
            <div style={{
              fontSize: isMobile ? '24px' : '32px',
              fontWeight: 700,
              color: '#262626',
              lineHeight: 1,
            }}>
              {total}
            </div>
          </div>
        </div>

        <div style={{
          flex: 1,
          minWidth: 0,
          maxWidth: isMobile ? '100%' : '280px',
          height: `${chartSize}px`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
            {data.map((item, index) => {
              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
              const color = colors[index % colors.length];

              return (
                <div
                  key={item.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '8px' : '12px',
                    marginBottom: isMobile ? '6px' : '8px',
                    padding: isMobile ? '8px 10px' : '10px 14px',
                    background: 'linear-gradient(135deg, #fafbfc 0%, #fff 100%)',
                    borderRadius: isMobile ? '8px' : '10px',
                    border: '1px solid #f0f0f0',
                    transition: 'all 0.25s ease',
                    cursor: 'pointer',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 8px 24px ${color}20`;
                    e.currentTarget.style.borderColor = color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = '#f0f0f0';
                  }}
                >
                  <div style={{
                    width: isMobile ? '8px' : '10px',
                    height: isMobile ? '8px' : '10px',
                    borderRadius: '3px',
                    background: `linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -15)} 100%)`,
                    boxShadow: `0 2px 8px ${color}50`,
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                    <div style={{
                      fontSize: isMobile ? '12px' : '13px',
                      fontWeight: 500,
                      color: '#262626',
                      marginBottom: isMobile ? '2px' : '3px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {item.name}
                    </div>
                    <div style={{
                      width: '100%',
                      height: isMobile ? '3px' : '4px',
                      background: '#f0f0f0',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, ${color} 0%, ${adjustColor(color, -10)} 100%)`,
                        borderRadius: '2px',
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>
                  <div style={{
                    textAlign: 'right',
                    flexShrink: 0,
                  }}>
                    <div style={{
                      fontSize: isMobile ? '14px' : '16px',
                      fontWeight: 700,
                      color: color,
                      lineHeight: 1,
                      marginBottom: isMobile ? '2px' : '3px',
                    }}>
                      {item.value}
                    </div>
                    <div style={{
                      fontSize: isMobile ? '10px' : '11px',
                      color: '#8c8c8c',
                    }}>
                      {percentage}%
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </Card>
    );
  };

  const adjustColor = (color, amount) => {
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>仪表盘概览</Title>

      {stats && stats.warningDevices > 0 && (
        <Alert
          message="设备告警"
          description={`有 ${stats.warningDevices} 台设备状态异常，请及时处理`}
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="设备总数"
              value={stats?.totalDevices || 0}
              prefix={<DesktopOutlined style={{ color: '#667eea' }} />}
              valueStyle={{ color: '#667eea' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="在线设备"
              value={stats?.onlineDevices || 0}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="告警设备"
              value={stats?.warningDevices || 0}
              prefix={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="离线设备"
              value={stats?.offlineDevices || 0}
              prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <PieChart3D data={getHealthChartData()} title="设备健康状态" isMobile={isMobile} />
          </div>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <PieChart3D data={getDeviceChartData()} title="设备类型分布" isMobile={isMobile} />
          </div>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <PieChart3D data={getUserChartData()} title="用户类型分布" isMobile={isMobile} />
          </div>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card
            title="最近设备状态"
            extra={
              <Button type="link" onClick={() => navigate('/devices')}>
                查看全部
              </Button>
            }
            loading={loading}
            styles={{ body: { padding: isMobile ? 16 : 24 } }}
          >
            {isMobile ? (
              <div style={{ width: '100%' }}>
                {devices && devices.length > 0 ? (
                  devices.map((device) => (
                    <RecentDeviceCard key={device.id} device={device} />
                  ))
                ) : (
                  <Text type="secondary">暂无设备数据</Text>
                )}
              </div>
            ) : (
              <Table
                columns={deviceColumns}
                dataSource={devices}
                rowKey="id"
                pagination={false}
                size="small"
                scroll={{ x: 'max-content' }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default DashboardPage;
