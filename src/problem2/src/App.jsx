import TokenSwap from './TokenSwap';
import { Toaster } from 'react-hot-toast';
import './App.css';

const toastOptions = {
	style: {
		background: '#333',
		color: '#fff',
	},
	success: {
		duration: 3000,
		style: {
			background: '#1E293B',
			color: '#fff',
		},
	},
	error: {
		duration: 3000,
		style: {
			background: '#1E293B',
			color: '#fff',
		},
	},
};

function App() {
	return (
		<div className="app-container">
			<Toaster position="top-right" toastOptions={toastOptions} />
			<TokenSwap />
		</div>
	);
}

export default App;
