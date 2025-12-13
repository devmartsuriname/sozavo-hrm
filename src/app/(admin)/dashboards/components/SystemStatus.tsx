import { Card, CardBody, Row, Col, Badge } from 'react-bootstrap'
import { Icon } from '@iconify/react'

const SystemStatus = () => {
  const statusItems = [
    {
      icon: 'mingcute:database-line',
      label: 'Database',
      status: 'Connected',
      variant: 'success',
    },
    {
      icon: 'mingcute:shield-check-line',
      label: 'RLS',
      status: 'Enabled',
      variant: 'success',
    },
    {
      icon: 'mingcute:box-line',
      label: 'Active Module',
      status: 'HRM',
      variant: 'primary',
    },
  ]

  return (
    <Row className="g-3 mb-4">
      {statusItems.map((item, index) => (
        <Col md={4} key={index}>
          <Card className="h-100">
            <CardBody className="d-flex align-items-center gap-3">
              <div className="flex-shrink-0">
                <Icon icon={item.icon} width={32} className="text-primary" />
              </div>
              <div>
                <p className="text-muted mb-1 small">{item.label}</p>
                <Badge bg={item.variant}>{item.status}</Badge>
              </div>
            </CardBody>
          </Card>
        </Col>
      ))}
    </Row>
  )
}

export default SystemStatus
