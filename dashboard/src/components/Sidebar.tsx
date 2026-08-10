import GitHubIcon from '@mui/icons-material/GitHub'
import GroupsIcon from '@mui/icons-material/Groups'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import SchoolIcon from '@mui/icons-material/School'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import HubIcon from '@mui/icons-material/Hub'
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'

const DRAWER_WIDTH = 240
const GITHUB_URL = 'https://github.com/abdollahpour/crewbuilder'

const navItems = [
  { label: 'Crews', path: '/crews', icon: <GroupsIcon /> },
  { label: 'Agents', path: '/agents', icon: <SmartToyIcon /> },
  { label: 'Skills', path: '/skills', icon: <SchoolIcon /> },
  { label: 'Knowledge', path: '/knowledge', icon: <MenuBookIcon /> },
  { label: 'MCPs', path: '/mcps', icon: <HubIcon /> },
]

const drawerPaperSx = {
  width: DRAWER_WIDTH,
  boxSizing: 'border-box',
  borderRight: '1px solid',
  borderColor: 'divider',
}

function isNavItemActive(pathname: string, path: string) {
  if (path === '/') return pathname === '/'
  return pathname === path || pathname.startsWith(`${path}/`)
}

type DrawerContentProps = {
  onNavigate?: () => void
}

function DrawerContent({ onNavigate }: DrawerContentProps) {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          px: 2,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          minHeight: 72,
          background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.06) 0%, rgba(37, 99, 235, 0.06) 100%)',
        }}
      >
        <Box
          component="button"
          onClick={() => {
            navigate('/crews')
            onNavigate?.()
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            p: 0,
            textAlign: 'left',
            transition: 'transform 0.15s ease, opacity 0.15s ease',
            '&:hover': {
              transform: 'translateY(-1px)',
              opacity: 0.92,
            },
          }}
        >
          <Box
            component="img"
            src="/favicon.svg"
            alt=""
            sx={{ width: 28, height: 28, flexShrink: 0 }}
          />
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
            <Typography
              component="span"
              sx={{
                fontSize: '1.35rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1,
                color: '#DC2626',
              }}
            >
              Crew
            </Typography>
            <Typography
              component="span"
              sx={{
                fontSize: '1.35rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1,
                color: '#2563EB',
              }}
            >
              Builder
            </Typography>
          </Box>
        </Box>
      </Box>
      <Divider />
      <Box sx={{ overflow: 'auto', pt: 1, flex: 1 }}>
        <List>
          {navItems.map((item) => (
            <ListItemButton
              key={item.path}
              selected={isNavItemActive(location.pathname, item.path)}
              onClick={() => {
                navigate(item.path)
                onNavigate?.()
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Box>
      <Divider />
      <List dense sx={{ py: 1 }}>
        <ListItemButton
          component="a"
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ListItemIcon>
            <GitHubIcon />
          </ListItemIcon>
          <ListItemText primary="GitHub" />
        </ListItemButton>
      </List>
    </Box>
  )
}

type SidebarProps = {
  mobileOpen: boolean
  onMobileClose: () => void
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': drawerPaperSx,
        }}
      >
        <DrawerContent onNavigate={onMobileClose} />
      </Drawer>
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': drawerPaperSx,
        }}
      >
        <DrawerContent />
      </Drawer>
    </Box>
  )
}

export { DRAWER_WIDTH }
