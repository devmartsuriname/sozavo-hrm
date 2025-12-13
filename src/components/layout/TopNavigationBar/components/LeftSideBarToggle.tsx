import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { useLayoutContext } from '@/context/useLayoutContext'
import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const LeftSideBarToggle = () => {
  const {
    menu: { size },
    changeMenu: { size: changeMenuSize },
    toggleBackdrop,
  } = useLayoutContext()
  const { pathname } = useLocation()
  const isFirstRender = useRef(true)

  const handleMenuSize = () => {
    // User toggle has absolute priority over any other state
    if (size === 'hidden') {
      // Restore from hidden to default
      changeMenuSize('default')
    } else if (size === 'condensed') {
      changeMenuSize('default')
    } else if (size === 'default') {
      changeMenuSize('condensed')
    }
  }

  // Only toggle backdrop on route change when sidebar is hidden (mobile nav)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    
    if (size === 'hidden') {
      toggleBackdrop()
    }
  }, [pathname])

  return (
    <div className="topbar-item">
      <button type="button" onClick={handleMenuSize} className="button-toggle-menu topbar-button">
        <IconifyIcon icon="solar:hamburger-menu-outline" width={24} height={24} className="fs-24  align-middle" />
      </button>
    </div>
  )
}

export default LeftSideBarToggle
