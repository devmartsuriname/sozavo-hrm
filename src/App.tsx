import AppProvidersWrapper from './components/wrapper/AppProvidersWrapper'
import AppRouter from './routes/router'
import '@/assets/scss/style.scss'

function App() {
  return (
    <>
      <AppProvidersWrapper>
        <AppRouter />
      </AppProvidersWrapper>
    </>
  )
}

export default App
