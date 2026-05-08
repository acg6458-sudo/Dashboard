import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, Tag, message, Popconfirm, Typography, Row, Col, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DesktopOutlined, SafetyOutlined, SwitcherOutlined, LaptopOutlined, QuestionOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { DeviceCard, UserCard, useResponsiveTable } from '../components/ResponsiveTable';

const { Title, Text } = Typography;
const { Option } = Select;

const ResizeableTitle = (props) => {
  const { onResize, width, ...restProps } = props;
  const [resizing, setResizing] = useState(false);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setResizing(true);

    const startX = e.clientX;
    const startWidth = width;

    const handleMouseMove = (moveEvent) => {
      const diff = moveEvent.clientX - startX;
      const newWidth = Math.max(50, startWidth + diff);
      onResize && onResize(newWidth);
    };

    const handleMouseUp = () => {
      setResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <th
      {...restProps}
      style={{ ...restProps.style, position: 'relative', cursor: 'col-resize', userSelect: 'none' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {restProps.children}
        </div>
        <div
          onMouseDown={handleMouseDown}
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: 8,
            cursor: 'col-resize',
            backgroundColor: resizing ? '#1890ff' : 'transparent',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(24, 144, 255, 0.3)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = resizing ? '#1890ff' : 'transparent'}
        />
      </div>
    </th>
  );
};

function DevicePage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [form] = Form.useForm();
  const tableRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'Administrator';
  const isMobile = useResponsiveTable();

  const [columnWidths, setColumnWidths] = useState({});

  const handleResize = useCallback((key, width) => {
    setColumnWidths(prev => ({
      ...prev,
      [key]: width
    }));
  }, []);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/devices', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setDevices(result.data);
      }
    } catch (error) {
      message.error('获取设备列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingDevice(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingDevice(record);
    form.setFieldsValue({
      ...record,
      password: ''
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/devices/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        message.success('删除成功');
        fetchDevices();
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const token = localStorage.getItem('token');
      const method = editingDevice ? 'PUT' : 'POST';
      const url = editingDevice ? `/api/devices/${editingDevice.id}` : '/api/devices';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(values)
      });

      const result = await response.json();
      if (result.success) {
        message.success(editingDevice ? '更新成功' : '添加成功');
        setModalVisible(false);
        fetchDevices();
      } else {
        message.error(result.message);
      }
    } catch (error) {
      console.error('提交失败:', error);
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

  const columns = [
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
      render: (type) => {
        const typeMap = { server: '服务器', firewall: '防火墙', switch: '交换机', computer: '电脑主机', other: '其他设备' };
        return <Tag color="blue">{typeMap[type] || type}</Tag>;
      },
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 140,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: '运行时间',
      dataIndex: 'uptime',
      key: 'uptime',
      width: 120,
    },
    {
      title: 'CPU型号',
      dataIndex: 'cpu_model',
      key: 'cpu_model',
      width: 180,
      render: (cpu_model) => cpu_model || <Text type="secondary">未设置</Text>,
    },
    {
      title: '内存大小',
      dataIndex: 'memory_size',
      key: 'memory_size',
      width: 120,
      render: (memory_size) => memory_size || <Text type="secondary">未设置</Text>,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {isAdmin && (
            <>
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              >
                编辑
              </Button>
              <Popconfirm
                title="确认删除"
                description="确定要删除这个设备吗？"
                onConfirm={() => handleDelete(record.id)}
                okText="确认"
                cancelText="取消"
              >
                <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                  删除
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  const mergeColumns = columns.map(col => ({
    ...col,
    width: columnWidths[col.key] || col.width,
    onHeaderCell: (record) => ({
      width: columnWidths[col.key] || col.width,
      onResize: (width) => handleResize(col.key, width),
    }),
  }));

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>设备列表</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={12} md={6}>
          <Card loading={loading} style={{ minWidth: 200 }}>
            <Space>
              <DesktopOutlined style={{ fontSize: 24, color: '#1890ff' }} />
              <div>
                <Text type="secondary">服务器</Text>
                <div>
                  <Text strong style={{ fontSize: 20 }}>
                    {devices.filter(d => d.type === 'server').length}
                  </Text>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card loading={loading} style={{ minWidth: 200 }}>
            <Space>
              <SafetyOutlined style={{ fontSize: 24, color: '#f5222d' }} />
              <div>
                <Text type="secondary">防火墙</Text>
                <div>
                  <Text strong style={{ fontSize: 20 }}>
                    {devices.filter(d => d.type === 'firewall').length}
                  </Text>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card loading={loading} style={{ minWidth: 200 }}>
            <Space>
              <SwitcherOutlined style={{ fontSize: 24, color: '#52c41a' }} />
              <div>
                <Text type="secondary">交换机</Text>
                <div>
                  <Text strong style={{ fontSize: 20 }}>
                    {devices.filter(d => d.type === 'switch').length}
                  </Text>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card loading={loading} style={{ minWidth: 200 }}>
            <Space>
              <LaptopOutlined style={{ fontSize: 24, color: '#722ed1' }} />
              <div>
                <Text type="secondary">电脑主机</Text>
                <div>
                  <Text strong style={{ fontSize: 20 }}>
                    {devices.filter(d => d.type === 'computer').length}
                  </Text>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card loading={loading} style={{ minWidth: 200 }}>
            <Space>
              <QuestionOutlined style={{ fontSize: 24, color: '#faad14' }} />
              <div>
                <Text type="secondary">其他设备</Text>
                <div>
                  <Text strong style={{ fontSize: 20 }}>
                    {devices.filter(d => d.type === 'other').length}
                  </Text>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
        {isAdmin && (
          <Col xs={24} sm={24} md={isMobile ? 24 : 6} style={{ textAlign: isMobile ? 'center' : 'right', paddingBottom: 16 }}>
          </Col>
        )}
      </Row>

      {isMobile ? (
        <div style={{ width: '100%', position: 'relative' }}>
          {isAdmin && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAdd} 
              size="large"
              style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10 }}
            >
              添加设备
            </Button>
          )}
          {devices.length > 0 ? (
            devices.map((device) => (
              <DeviceCard
                key={device.id}
                record={device}
                isAdmin={isAdmin}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <Card>
              <Text type="secondary">暂无设备数据</Text>
            </Card>
          )}
        </div>
      ) : (
        <Card 
          extra={isAdmin ? (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large">
              添加设备
            </Button>
          ) : null}
        >
          <Table
            columns={mergeColumns}
            dataSource={devices}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 'max-content' }}
            components={{
              header: {
                cell: ResizeableTitle,
              },
            }}
          />
        </Card>
      )}

      <Modal
        title={editingDevice ? '编辑设备' : '添加设备'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText={editingDevice ? '更新' : '添加'}
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="设备名称"
            rules={[{ required: true, message: '请输入设备名称' }]}
          >
            <Input placeholder="请输入设备名称" />
          </Form.Item>

          <Form.Item
            name="type"
            label="设备类型"
            rules={[{ required: true, message: '请选择设备类型' }]}
          >
            <Select placeholder="请选择设备类型">
              <Option value="server">服务器</Option>
              <Option value="firewall">防火墙</Option>
              <Option value="switch">交换机</Option>
              <Option value="computer">电脑主机</Option>
              <Option value="other">其他设备</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="ip"
            label="IP地址"
            rules={[
              { required: true, message: '请输入IP地址' },
              { pattern: /^(\d{1,3}\.){3}\d{1,3}$/, message: '请输入有效的IP地址' }
            ]}
          >
            <Input placeholder="例如: 192.168.1.10" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="管理账号"
              >
                <Input placeholder="设备登录用户名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="password"
                label={editingDevice ? '新密码' : '密码'}
                rules={editingDevice ? [] : [{ required: true, message: '请输入密码' }]}
              >
                <Input.Password placeholder={editingDevice ? '留空则不修改密码' : '请输入密码'} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="port" label="端口">
                <InputNumber min={1} max={65535} style={{ width: '100%' }} placeholder="22" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value="online">在线</Option>
                  <Option value="warning">告警</Option>
                  <Option value="offline">离线</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="cpu_model"
                label="CPU型号"
                rules={[
                  { max: 100, message: 'CPU型号不能超过100个字符' }
                ]}
              >
                <Input placeholder="例如: Intel Xeon E5-2680 v4" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="memory_size"
                label="内存大小"
                rules={[
                  { max: 50, message: '内存大小不能超过50个字符' }
                ]}
              >
                <Input placeholder="例如: 32GB DDR4" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="uptime" label="运行时间">
            <Input placeholder="例如: 30天 5小时" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default DevicePage;
