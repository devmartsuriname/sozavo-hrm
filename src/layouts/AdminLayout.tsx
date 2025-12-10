import AnimationStar from '@/components/AnimationStar'
import Footer from '@/components/layout/Footer'
import { ChildrenType } from '@/types/component-props'
import { lazy, Suspense } from 'react'
import { Container } from 'react-bootstrap'

const TopNavigationBar = lazy(() => import('@/components/layout/TopNavigationBar/page'))
const VerticalNavigationBar = lazy(() => import('@/components/layout/VerticalNavigationBar/page'))

const AdminLayout = ({ children }: ChildrenType) => {
  return (
    <div className="wrapper">
      <Suspense>
        <TopNavigationBar />
      </Suspense>
      <VerticalNavigationBar />
      <AnimationStar />
      <div className="page-content">
        <Container fluid>
          <Suspense 
            fallback={
              <div className="d-flex justify-content-center align-items-center p-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            }
          >
            {children}
          </Suspense>
        </Container>
        <Footer />
      </div>
    </div>
  )
}

export default AdminLayout
