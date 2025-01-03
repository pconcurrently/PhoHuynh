export const calculateTokenAmount = (
	fromAmount,
	fromCurrency,
	toCurrency,
	prices
) => {
	const fromPrice = prices.find((p) => p.currency === fromCurrency)?.price || 0;
	const toPrice = prices.find((p) => p.currency === toCurrency)?.price || 0;
	return ((fromAmount * fromPrice) / toPrice).toFixed(6);
};

export const preloadTokenImage = (currency, baseUrl) => {
	return new Promise((resolve) => {
		const img = new Image();
		img.src = `${baseUrl}/${currency}.svg`;
		img.onload = resolve;
		img.onerror = () => {
			img.src = `${baseUrl}/GENERIC.svg`;
			img.onload = resolve;
		};
	});
};
