function characterToString(character: $TSFixMeAny): $TSFixMeAny {
	return character.codePoints
		.map(function (codePoint) {
			return String.fromCodePoint(parseInt(codePoint.substr(2), 16));
		})
		.join('');
}

export default characterToString;
