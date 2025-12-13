import { Card, CardBody, CardHeader, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'

const QuickLinks = () => {
  const links = [
    {
      icon: 'mingcute:group-line',
      label: 'Employees',
      description: 'View and manage employee records',
      url: '/hrm/employees',
    },
    {
      icon: 'mingcute:building-3-line',
      label: 'Organization Units',
      description: 'Manage organizational structure',
      url: '/hrm/org-units',
    },
    {
      icon: 'mingcute:briefcase-line',
      label: 'Positions',
      description: 'Configure job positions',
      url: '/hrm/positions',
    },
    {
      icon: 'mingcute:user-setting-line',
      label: 'Users & Roles',
      description: 'Manage user access and roles',
      url: '/hrm/users',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <h5 className="card-title mb-0">Quick Links</h5>
      </CardHeader>
      <CardBody>
        <Row className="g-3">
          {links.map((link, index) => (
            <Col md={6} lg={3} key={index}>
              <Link
                to={link.url}
                className="d-block p-3 border rounded text-decoration-none h-100"
                style={{ transition: 'background-color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(var(--bs-primary-rgb), 0.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div className="d-flex flex-column align-items-center text-center">
                  <Icon icon={link.icon} width={40} className="text-primary mb-2" />
                  <h6 className="mb-1">{link.label}</h6>
                  <small className="text-muted">{link.description}</small>
                </div>
              </Link>
            </Col>
          ))}
        </Row>
      </CardBody>
    </Card>
  )
}

export default QuickLinks
