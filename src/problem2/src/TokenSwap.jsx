/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback, memo } from 'react';
import debounce from 'lodash/debounce';
import toast from 'react-hot-toast';

import { TOKEN_ICON_BASE_URL } from './urlConstants';
import { calculateTokenAmount, preloadTokenImage } from './tokenUtils';

const TokenSwap = () => {
	const [prices, setPrices] = useState([]);
	const [loading, setLoading] = useState(true);
	const [fromToken, setFromToken] = useState({ currency: 'ETH', amount: '' });
	const [toToken, setToToken] = useState({ currency: 'USDC', amount: '' });
	const [conversionLoading, setConversionLoading] = useState(false);
	const [swapping, setSwapping] = useState(false);

	useEffect(() => {
		const fetchPrices = async () => {
			try {
				await new Promise((resolve) => setTimeout(resolve, 1500));

				const response = await import('./prices.json');
				const uniquePrices = Array.from(
					new Map(
						response.default.map((item) => [item.currency, item])
					).values()
				);
				setPrices(uniquePrices);
			} catch (error) {
				toast.error('Failed to load token prices');
				console.error('Error fetching prices:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchPrices();
	}, []);

	useEffect(() => {
		if (prices.length > 0) {
			Promise.all(
				prices.map((price) =>
					preloadTokenImage(price.currency, TOKEN_ICON_BASE_URL)
				)
			).catch(() => toast.error('Failed to load some token icons'));
		}
	}, [prices]);

	const debouncedHandleFromAmountChange = useCallback(
		debounce(async (amount) => {
			if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
				setConversionLoading(true);
				try {
					await new Promise((resolve) => setTimeout(resolve, 500));

					const toAmount = calculateTokenAmount(
						amount,
						fromToken.currency,
						toToken.currency,
						prices
					);
					setToToken((prev) => ({ ...prev, amount: toAmount }));
				} finally {
					setConversionLoading(false);
				}
			} else {
				setToToken((prev) => ({ ...prev, amount: '' }));
			}
		}, 300),
		[fromToken.currency, toToken.currency, prices]
	);

	const handleFromAmountChange = (amount) => {
		setFromToken((prev) => ({ ...prev, amount }));
		debouncedHandleFromAmountChange(amount);
	};

	const handleInputChange = (value, isFrom) => {
		if (isFrom) {
			setFromToken((prev) => ({ ...prev, currency: value }));
			if (fromToken.amount && !isNaN(fromToken.amount)) {
				const toAmount = calculateTokenAmount(
					fromToken.amount,
					value,
					toToken.currency,
					prices
				);
				setToToken((prev) => ({ ...prev, amount: toAmount }));
			}
		} else {
			setToToken((prev) => ({ ...prev, currency: value }));
			if (fromToken.amount && !isNaN(fromToken.amount)) {
				const toAmount = calculateTokenAmount(
					fromToken.amount,
					fromToken.currency,
					value,
					prices
				);
				setToToken((prev) => ({ ...prev, amount: toAmount }));
			}
		}
	};

	const handleSwapTokens = () => {
		const temp = { ...fromToken };
		setFromToken({ ...toToken });
		setToToken({ ...temp });
	};

	const handleSwap = async () => {
		if (
			!fromToken.amount ||
			isNaN(fromToken.amount) ||
			parseFloat(fromToken.amount) <= 0
		) {
			toast.error('Please enter a valid amount');
			return;
		}

		setSwapping(true);

		try {
			await new Promise((resolve) => setTimeout(resolve, 1500));

			toast.success(
				`Swapped ${fromToken.amount} ${fromToken.currency} for ${toToken.amount} ${toToken.currency}`,
				{
					duration: 3000,
				}
			);

			setFromToken((prev) => ({ ...prev, amount: '' }));
			setToToken((prev) => ({ ...prev, amount: '' }));
			// eslint-disable-next-line no-unused-vars
		} catch (error) {
			toast.error('Swap failed. Please try again.');
		} finally {
			setSwapping(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center flex-col justify-center min-h-screen bg-gray-900 w-full">
				<Loader size={10} />
				<span className="text-white">Loading tokens...</span>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 w-full">
			<div className="bg-gray-800 p-6 rounded-xl shadow-xl">
				<h2 className="text-2xl font-bold text-white mb-6">Swap Tokens</h2>

				<TokenInput
					label="From"
					token={fromToken}
					onTokenChange={(value) => handleInputChange(value, true)}
					onAmountChange={handleFromAmountChange}
					prices={prices}
				/>

				<button
					onClick={handleSwapTokens}
					className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full w-10 h-10 flex items-center justify-center mx-auto my-4"
				>
					⇅
				</button>

				<TokenInput
					label="To"
					token={toToken}
					onTokenChange={(value) => handleInputChange(value, false)}
					prices={prices}
					readOnly
					loading={conversionLoading}
				/>

				<button
					onClick={handleSwap}
					disabled={swapping}
					className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg mt-6 font-semibold"
				>
					{swapping ? (
						<div className="flex items-center justify-center gap-2">
							<Loader />
							<span>Swapping...</span>
						</div>
					) : (
						'Swap'
					)}
				</button>
			</div>
		</div>
	);
};

const TokenInput = memo(
	({
		label,
		token,
		onTokenChange,
		onAmountChange,
		prices,
		readOnly,
		loading,
	}) => (
		<div className="bg-gray-700 p-4 rounded-lg mb-2">
			<div className="flex justify-between mb-2">
				<label className="text-gray-400">{label}</label>
				<select
					value={token.currency}
					onChange={(e) => onTokenChange(e.target.value)}
					className="bg-gray-600 text-blue-500 rounded px-2 py-1"
				>
					{prices.map((price) => (
						<option key={price.currency} value={price.currency}>
							{price.currency}
						</option>
					))}
				</select>
			</div>
			<div className="flex items-center gap-2">
				<img
					src={`${TOKEN_ICON_BASE_URL}/${token.currency}.svg`}
					alt={token.currency}
					className="w-6 h-6"
				/>
				<div className="relative flex-1">
					<input
						type="number"
						value={loading ? '' : token.amount}
						onChange={(e) => onAmountChange?.(e.target.value)}
						readOnly={readOnly}
						placeholder={loading ? '' : '0.0'}
						className="w-full bg-transparent text-white text-2xl outline-none"
					/>
					{loading && (
						<div className="absolute left-0 top-1/2 -translate-y-1/2">
							<Loader />
						</div>
					)}
				</div>
			</div>
		</div>
	)
);

TokenInput.displayName = 'TokenInput';

const Loader = ({ size = 6, color = 'blue-500' }) => (
	<svg
		className={`animate-spin text-${color} w-${size} h-${size}`}
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
	>
		<circle
			className="opacity-25"
			cx="12"
			cy="12"
			r="10"
			stroke="currentColor"
			strokeWidth="4"
		></circle>
		<path
			className="opacity-75"
			fill="currentColor"
			d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
		></path>
	</svg>
);

export default memo(TokenSwap);
