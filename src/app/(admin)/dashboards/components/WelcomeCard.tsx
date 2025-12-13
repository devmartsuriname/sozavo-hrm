import { Card, CardBody, Badge } from 'react-bootstrap'
import { useSupabaseAuth } from '@/context/SupabaseAuthContext'

const WelcomeCard = () => {
  const { user, isAdmin, isHRManager, isManager, isEmployee } = useSupabaseAuth()

  const getRoleBadge = () => {
    if (isAdmin) return <Badge bg="danger">Admin</Badge>
    if (isHRManager) return <Badge bg="primary">HR Manager</Badge>
    if (isManager) return <Badge bg="info">Manager</Badge>
    if (isEmployee) return <Badge bg="secondary">Employee</Badge>
    return <Badge bg="dark">No Role</Badge>
  }

  const getInitials = (email: string) => {
    const name = email.split('@')[0]
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <Card>
      <CardBody>
        <div className="d-flex align-items-center gap-3">
          <div
            className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white"
            style={{ width: 56, height: 56, fontSize: '1.25rem', fontWeight: 600 }}
          >
            {user?.email ? getInitials(user.email) : '??'}
          </div>
          <div>
            <h5 className="mb-1">Welcome back!</h5>
            <p className="text-muted mb-1">{user?.email || 'Not signed in'}</p>
            <div>{getRoleBadge()}</div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

export default WelcomeCard
