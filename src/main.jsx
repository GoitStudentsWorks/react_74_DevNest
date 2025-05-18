import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { persistor, store } from './redux/store.js'
import Loader from './components/Loader/Loader.jsx'
import { UserProvider } from './utils/UserContext/UserProvider.jsx'

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<Provider store={store}>
			<PersistGate loading={<Loader />} persistor={persistor}>
				<UserProvider>
					<BrowserRouter>
						<App />
					</BrowserRouter>
				</UserProvider>
			</PersistGate>
		</Provider>
	</StrictMode>
)
