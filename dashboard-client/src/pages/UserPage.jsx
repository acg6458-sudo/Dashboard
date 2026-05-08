import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, Tag, message, Popconfirm, Typography, Row, Col, Badge } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { UserCard, useResponsiveTable } from '../components/ResponsiveTable';

const { Title, Text } = Typography;
const { Option } = Select;

function UserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.role === 'Administrator';
  const isMobile = useResponsiveTable();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setUsers(result.data);
      }
    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingUser(record);
    form.setFieldsValue({
      ...record,
      password: ''
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        message.success('删除成功');
        fetchUsers();
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

      if (editingUser) {
        const submitData = { ...values };
        if (!submitData.password) {
          delete submitData.password;
        }
        const response = await fetch(`/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(submitData)
        });
        const result = await response.json();
        if (result.success) {
          message.success('更新成功');
          setModalVisible(false);
          fetchUsers();
        } else {
          message.error(result.message);
        }
      } else {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(values)
        });
        const result = await response.json();
        if (result.success) {
          message.success('添加成功');
          setModalVisible(false);
          fetchUsers();
        } else {
          message.error(result.message);
        }
      }
    } catch (error) {
      console.error('提交失败:', error);
    }
  };

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

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 140,
      render: (text) => (
        <Space size="small">
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: 12,
          }}>
            {text.charAt(0).toUpperCase()}
          </div>
          <Text strong style={{ fontSize: 13 }}>{text}</Text>
        </Space>
      ),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      ellipsis: true,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role) => (
        <Tag color={getRoleColor(role)} style={{ fontSize: 12 }}>{getRoleText(role)}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status) => (
        <Badge status={status === 'active' ? 'success' : 'default'} text={status === 'active' ? '活跃' : '未激活'} />
      ),
    },
    {
      title: '最后登录',
      dataIndex: 'last_login',
      key: 'last_login',
      width: 150,
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '从未登录',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
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
                style={{ padding: '0 4px' }}
              >
                编辑
              </Button>
              {record.id !== currentUser.id && (
                <Popconfirm
                  title="确认删除"
                  description="确定要删除这个用户吗？"
                  onConfirm={() => handleDelete(record.id)}
                  okText="确认"
                  cancelText="取消"
                >
                  <Button type="link" size="small" danger icon={<DeleteOutlined />} style={{ padding: '0 4px' }}>
                    删除
                  </Button>
                </Popconfirm>
              )}
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>用户列表</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col>
          <Card loading={loading} style={{ minWidth: 200 }}>
            <Space>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: '#f5222d',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 'bold'
              }}>
                A
              </div>
              <div>
                <Text type="secondary">管理员</Text>
                <div>
                  <Text strong style={{ fontSize: 20 }}>
                    {users.filter(u => u.role === 'Administrator').length}
                  </Text>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
        <Col>
          <Card loading={loading} style={{ minWidth: 200 }}>
            <Space>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: '#1890ff',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 'bold'
              }}>
                O
              </div>
              <div>
                <Text type="secondary">操作员</Text>
                <div>
                  <Text strong style={{ fontSize: 20 }}>
                    {users.filter(u => u.role === 'Operator').length}
                  </Text>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
        <Col>
          <Card loading={loading} style={{ minWidth: 200 }}>
            <Space>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: '#52c41a',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 'bold'
              }}>
                V
              </div>
              <div>
                <Text type="secondary">访客</Text>
                <div>
                  <Text strong style={{ fontSize: 20 }}>
                    {users.filter(u => u.role === 'Viewer').length}
                  </Text>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
        <Col style={{ marginLeft: 'auto' }}>
          {isAdmin && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large">
              添加用户
            </Button>
          )}
        </Col>
      </Row>

      <Card>
        {isMobile ? (
          <div style={{ width: '100%' }}>
            {users.length > 0 ? (
              users.map((user) => (
                <UserCard
                  key={user.id}
                  record={user}
                  isAdmin={isAdmin}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  currentUserId={currentUser.id}
                />
              ))
            ) : (
              <Text type="secondary">暂无用户数据</Text>
            )}
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 'max-content' }}
          />
        )}
      </Card>

      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText={editingUser ? '更新' : '添加'}
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' }
            ]}
          >
            <Input placeholder="请输入用户名" disabled={!!editingUser} />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' }
              ]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}

          {editingUser && (
            <Form.Item
              name="password"
              label="新密码"
              rules={[
                { min: 6, message: '密码至少6个字符' }
              ]}
            >
              <Input.Password placeholder="留空则不修改密码" />
            </Form.Item>
          )}

          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Option value="Administrator">管理员</Option>
              <Option value="Operator">操作员</Option>
              <Option value="Viewer">访客</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value="active">活跃</Option>
              <Option value="inactive">未激活</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default UserPage;
