import specialCharactersManager from 'fontoxml-special-characters/src/specialCharactersManager.js';

// There are 27 characters here
const EXAMPLE_CHARACTER_SET = [
	{ codePoints: ['U+0024'], name: 'Dollar sign', id: 'Dollar-id123', labels: ['Basic Latin'] },
	{ codePoints: ['U+00A3'], name: 'Pound sterling', id: 'Pound-id123', labels: ['Basic Latin'] },
	{ codePoints: ['U+20AC'], name: 'Euro sign', id: 'Euro-id123', labels: ['Basic Latin'] },
	{ codePoints: ['U+00A5'], name: 'Yen', id: 'Yen-id123', labels: ['Basic Latin'] },
	{
		codePoints: ['U+20BD'],
		name: 'Russian rouble sign',
		id: 'Russian-id123',
		labels: ['Basic Latin']
	},
	{ codePoints: ['U+00A2'], name: 'Cent sign', id: 'Cent-id123', labels: ['Basic Latin'] },
	{
		codePoints: ['U+20A0'],
		name: 'Euro-currency sign',
		id: 'Euro-currency-id123',
		labels: ['Basic Latin']
	},
	{ codePoints: ['U+20A1'], name: 'Colon sign', id: 'Colon-id123', labels: ['Basic Latin'] },
	{
		codePoints: ['U+20A2'],
		name: 'Cruzeiro sign',
		id: 'Cruzeiro-id123',
		labels: ['Basic Latin']
	},
	{
		codePoints: ['U+20A3'],
		name: 'French franc sign',
		id: 'French-id123',
		labels: ['Basic Latin']
	},
	{ codePoints: ['U+20A4'], name: 'Lira sign', id: 'Lira-id123', labels: ['Basic Latin'] },
	{ codePoints: ['U+20A5'], name: 'Mill sign', id: 'Mill-id123', labels: ['Basic Latin'] },
	{ codePoints: ['U+20A6'], name: 'Naira sign', id: 'Naira-id123', labels: ['Basic Latin'] },
	{ codePoints: ['U+20A7'], name: 'Peseta sign', id: 'Peseta-id123', labels: ['Basic Latin'] },
	{ codePoints: ['U+20A8'], name: 'Rupee sign', id: 'Rupee-id123', labels: ['Basic Latin'] },
	{ codePoints: ['U+20A9'], name: 'Won sign', id: 'Won-id123', labels: ['Basic Latin'] },
	{ codePoints: ['U+20AA'], name: 'New sheqel sign', id: 'New-id123', labels: ['Basic Latin'] },
	{ codePoints: ['U+20AB'], name: 'Dong sign', id: 'Dong-id123', labels: ['Basic Latin'] },
	{ codePoints: ['U+20AD'], name: 'Kip sign', id: 'Kip-id123', labels: ['Basic Latin'] },
	{ codePoints: ['U+20AE'], name: 'Tugrik sign', id: 'Tugrik-id123', labels: ['Basic Latin'] },
	{ codePoints: ['U+20AF'], name: 'Drachma sign', id: 'Drachma-id123', labels: ['Basic Latin'] },
	{
		codePoints: ['U+20B0'],
		name: 'German penny sign',
		id: 'German-id123',
		labels: ['Basic Latin']
	},
	{ codePoints: ['U+20B1'], name: 'Peso sign', id: 'Peso-id123', labels: ['Basic Latin'] },
	{ codePoints: ['U+20B2'], name: 'Guarani sign', id: 'Guarani-id123', labels: ['Basic Latin'] },
	{ codePoints: ['U+20B3'], name: 'Austral sign', id: 'Austral-id123', labels: ['Basic Latin'] },
	{ codePoints: ['U+20B4'], name: 'Hryvnia sign', id: 'Hryvnia-id123', labels: ['Basic Latin'] },
	{ codePoints: ['U+20B5'], name: 'Cedi sign', id: 'Cedi-id123', labels: ['Basic Latin'] }
];

describe('Recently used symbols', function() {
	beforeEach(() => {
		specialCharactersManager.cleanStorage();
	});

	it('can mark characters as recently used.', async () => {
		let recentSymbols = specialCharactersManager.getRecentSymbols();

		chai.assert.equal(recentSymbols.length, 0);

		// Mark another character as recently used
		specialCharactersManager.markAsRecentlyUsed(EXAMPLE_CHARACTER_SET[4]);

		recentSymbols = specialCharactersManager.getRecentSymbols();

		chai.assert.equal(recentSymbols[0].name, EXAMPLE_CHARACTER_SET[4].name);
	});

	it('should order characters according to usage order.', async () => {
		let recentSymbols = specialCharactersManager.getRecentSymbols();

		chai.assert.equal(recentSymbols.length, 0);

		// Mark some characters as recently used
		specialCharactersManager.markAsRecentlyUsed(EXAMPLE_CHARACTER_SET[4]);
		specialCharactersManager.markAsRecentlyUsed(EXAMPLE_CHARACTER_SET[15]);
		specialCharactersManager.markAsRecentlyUsed(EXAMPLE_CHARACTER_SET[6]);
		specialCharactersManager.markAsRecentlyUsed(EXAMPLE_CHARACTER_SET[20]);
		specialCharactersManager.markAsRecentlyUsed(EXAMPLE_CHARACTER_SET[2]);

		recentSymbols = specialCharactersManager.getRecentSymbols();

		chai.assert.deepEqual(
			recentSymbols.slice(0, 5).map(e => e.name),
			[
				EXAMPLE_CHARACTER_SET[2],
				EXAMPLE_CHARACTER_SET[20],
				EXAMPLE_CHARACTER_SET[6],
				EXAMPLE_CHARACTER_SET[15],
				EXAMPLE_CHARACTER_SET[4]
			].map(e => e.name)
		);
	});
});
