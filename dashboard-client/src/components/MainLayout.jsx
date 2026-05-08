import React, { useState, useEffect, useRef } from 'react';
import { Layout, Menu, Button, Avatar, Typography, Drawer, Dropdown } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  DesktopOutlined,
  UserOutlined,
  LogoutOutlined,
  GlobalOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MenuOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setDrawerVisible(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/devices',
      icon: <DesktopOutlined />,
      label: '设备管理',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: '用户管理',
    },
    {
      key: '/settings',
      icon: <GlobalOutlined />,
      label: '全局设置',
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
    if (isMobile) {
      setDrawerVisible(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Administrator': return '#f5222d';
      case 'Operator': return '#1890ff';
      case 'Viewer': return '#52c41a';
      default: return '#666';
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

  const siderWidth = collapsed ? 80 : 240;
  const siderCollapsedWidth = 80;

  const renderSiderMenu = () => (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[location.pathname]}
      items={menuItems}
      onClick={handleMenuClick}
      style={{ borderRight: 0 }}
      inlineCollapsed={isMobile ? false : collapsed}
    />
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{
        background: '#001529',
        padding: '0 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        height: isMobile ? 56 : 64,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isMobile ? (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setDrawerVisible(true)}
              style={{
                color: 'white',
                fontSize: 20,
                width: 44,
                height: 44,
              }}
            />
          ) : (
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                color: 'white',
                fontSize: 18,
                width: 40,
                height: 40,
              }}
            />
          )}
          <h2 style={{
            color: 'white',
            margin: 0,
            fontSize: isMobile ? 16 : 18,
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
          }}>
            🖥️ 网络设备监控平台
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: '退出登录',
                  danger: true,
                  onClick: handleLogout,
                },
              ],
            }}
            trigger={['click']}
            placement="bottomRight"
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
            >
              <Avatar style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontSize: 12,
              }}>
                {user.username?.charAt(0).toUpperCase()}
              </Avatar>
              {!isMobile && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Text style={{ color: 'white', fontWeight: 500, fontSize: 12 }}>
                    {user.username}
                  </Text>
                  <Text style={{
                    color: getRoleColor(user.role),
                    fontSize: 10,
                    fontWeight: 'bold'
                  }}>
                    {getRoleText(user.role)}
                  </Text>
                </div>
              )}
            </div>
          </Dropdown>
        </div>
      </Header>

      <Layout style={{ marginTop: isMobile ? 56 : 64 }}>
        {!isMobile && (
          <Sider
            width={siderWidth}
            collapsedWidth={siderCollapsedWidth}
            collapsed={collapsed}
            style={{
              background: '#001529',
              position: 'fixed',
              left: 0,
              top: isMobile ? 56 : 64,
              bottom: 0,
              overflow: 'auto',
              transition: 'width 0.2s ease, min-width 0.2s ease',
              zIndex: 999,
            }}
          >
            {renderSiderMenu()}
          </Sider>
        )}

        <Layout
          style={{
            marginLeft: isMobile ? 0 : siderWidth,
            minHeight: `calc(100vh - ${isMobile ? 56 : 64}px)`,
            background: '#f0f2f5',
            transition: 'margin-left 0.2s ease',
          }}
        >
          <Content
            style={{
              padding: isMobile ? 12 : 24,
              transition: 'padding 0.2s ease',
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>

      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🖥️ 网络设备监控平台</span>
          </div>
        }
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={280}
        bodyStyle={{ padding: 0, background: '#001529' }}
        headerStyle={{ background: '#001529', borderBottom: '1px solid #333' }}
        styles={{
          header: { color: 'white' },
          body: { padding: 0 }
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '16px 24px',
          borderBottom: '1px solid #333'
        }}>
          <Avatar style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontSize: 16,
          }}>
            {user.username?.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <Text style={{ color: 'white', fontWeight: 500, fontSize: 14, display: 'block' }}>
              {user.username}
            </Text>
            <Text style={{
              color: getRoleColor(user.role),
              fontSize: 12,
              fontWeight: 'bold'
            }}>
              {getRoleText(user.role)}
            </Text>
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0, background: 'transparent' }}
        />
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #333',
          marginTop: 'auto'
        }}>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{
              color: '#ff4d4f',
              width: '100%',
              textAlign: 'left',
              padding: '8px 0'
            }}
          >
            退出登录
          </Button>
        </div>
      </Drawer>

      <style>{`
        @media (max-width: 767px) {
          .ant-layout-content {
            padding: 12px !important;
          }
        }

        @media (max-width: 767px) {
          .ant-table-wrapper {
            overflow-x: auto;
          }
          .ant-table {
            font-size: 12px !important;
          }
          .ant-table-thead > tr > th,
          .ant-table-tbody > tr > td {
            padding: 8px !important;
            font-size: 12px !important;
          }
          .ant-table-cell {
            white-space: nowrap !important;
          }
        }

        .ant-layout-sider-collapsed .ant-menu-inline-collapsed {
          width: 80px;
        }

        .ant-layout-sider-collapsed .ant-menu-item,
        .ant-layout-sider-collapsed .ant-menu-submenu-title {
          padding: 0 24px !important;
        }

        .ant-layout-sider-collapsed .ant-menu-item .anticon,
        .ant-layout-sider-collapsed .ant-menu-submenu-title .anticon {
          font-size: 18px;
        }

        .ant-drawer .ant-drawer-content {
          background: #001529;
        }

        .ant-drawer .ant-drawer-header {
          background: #001529;
          border-bottom: 1px solid #333;
        }

        .ant-drawer .ant-drawer-title {
          color: white;
        }

        .ant-drawer .ant-drawer-close {
          color: white;
        }
      `}</style>
    </Layout>
  );
}

export default MainLayout;
