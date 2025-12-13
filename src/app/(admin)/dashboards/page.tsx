import Footer from '@/components/layout/Footer'
import WelcomeCard from './components/WelcomeCard'
import SystemStatus from './components/SystemStatus'
import QuickLinks from './components/QuickLinks'
import PageTitle from '@/components/PageTitle'

const page = () => {
  return (
    <>
      <PageTitle subName="SoZaVo HRM" title="Dashboard" />
      <WelcomeCard />
      <SystemStatus />
      <QuickLinks />
      <Footer />
    </>
  )
}

export default page
