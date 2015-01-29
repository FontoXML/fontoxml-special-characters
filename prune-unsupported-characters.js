var	
	// eg "/home/wybe/FontoXML/fxitmuran/src/assets/configuration/specialCharacters.json"
	specialCharactersJsonPath = process.argv[2],

	// eg "Code2000", must be font name as used on http://www.kreativekorp.com/charset/font.php
	specialCharacterFontName = process.argv[3] || 'Code2000';

if(!specialCharactersJsonPath)
	throw new Error('The first argument to generate.js needs to be a valid path to specialCharacters.json')

var fs = require('fs'),
	path = require('path'),
	request = require('request'),
	cheerio = require('cheerio'),

	specialCharactersJson = require(specialCharactersJsonPath);

function camelCase (string) {
	return string.substring(0,1).toUpperCase() + string.substring(1).toLowerCase();
}

function scrapeCharacters (url, cb) {
	var charactersInCode2000 = [];

	request(url, function (error, response, body) {
		if (error || response.statusCode != 200) {
			console.error(error);
			return cb(error || new Error(response.statusCode));
		}

		var $ = cheerio.load(body);

			$('.charmap tr').each(function (i, tr) {
				$(tr).children('.defined').each(function(i, char) {
					charactersInCode2000.push(('U+' + $(char).find('.chcode').text()).toLowerCase());
				});
			});

			return cb(null, charactersInCode2000);
			console.log(JSON.stringify(characters, null, '    '));
	});
}


scrapeCharacters(
	'http://www.kreativekorp.com/charset/font.php?font=' + specialCharacterFontName,

	function(err, charactersInCode2000) {
		fs.writeFile(
			specialCharactersJsonPath,
			JSON.stringify(specialCharactersJson.filter(function(specialCharacter) {
				return charactersInCode2000.indexOf(specialCharacter.id.toLowerCase()) >= 0;
			}), null, '\t'),
			function(err) {
				if(err)
					return console.error(err);
				console.log('- Done -');
			}
		);
	}
);