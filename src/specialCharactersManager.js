/**
 * Enables registration of custom character sets to be displayed in the “Insert special character” modal.
 * Registration can be done using the addCharacterSetPath method. While we also provide a method for
 * adding a character set directly into the build, addCharacterSet, adding it via a path instead excludes
 * it from building into the main.js resulting in a faster initial load.
 *
 * @fontosdk
 * @category add-on/fontoxml-special-characters
 */
function SpecialCharactersManager() {
	this._characterSetByName = Object.create(null);
	this._characterSetPathByName = Object.create(null);
}

/**
 * Register the specified characterSet for use by the special-character-insert operation under the specified name.
 *
 * @fontosdk
 *
 * @param  {string}    name
 * @param  {CharacterSetEntry[]}  characterSet
 */
SpecialCharactersManager.prototype.addCharacterSet = function(name, characterSet) {
	this._characterSetByName[name] = Promise.resolve(characterSet);
};

/**
 * Register the specified file path used to fetch the characterSet under the specified name.
 * Character sets should be placed in (a subfolder of) the assets folder. An example of this would be
 * 'assets/character-sets/characterSet.json'. The character set should contain an Array of
 * {@link CharacterSetEntry} objects.
 *
 * @fontosdk
 *
 * @param  {string}  name
 * @param  {string}  characterSetPath
 */
SpecialCharactersManager.prototype.addCharacterSetPath = function(name, characterSetPath) {
	this._characterSetPathByName[name] = characterSetPath;
};

/**
 * Retrieve the character set with the given name
 *
 * @param  {string}  name
 *
 * @return  {Promise<CharacterSetEntry[]>}
 */
SpecialCharactersManager.prototype.getCharacterSet = function(name) {
	const characterSet = this._characterSetByName[name];
	const characterSetPath = this._characterSetPathByName[name];
	if (!characterSet && !characterSetPath) {
		return Promise.reject(new Error('Character set "' + name + '" does not exist.'));
	}
	if (characterSet) {
		return characterSet;
	}
	this._characterSetByName[name] = fetch(characterSetPath)
		.then(response => {
			if (!response.ok) {
				throw new Error('Failed to fetch character set: "' + name + '".');
			}
			const fetchedCharacterSet = response.json();
			return fetchedCharacterSet;
		})
		.catch(_error => {
			delete this._characterSetByName[name];
			throw new Error('Failed to fetch character set: "' + name + '".');
		});
	return this._characterSetByName[name];
};

export default new SpecialCharactersManager();

/**
 * A character set should be provided to {@link SpecialCharactersManager#addCharacterSet} as an
 * array of objects, each containing properties describing a character in the set.
 *
 * A fragment of an example character set is given below:
 *
 * ```json
 * [
 *     {
 *         "id": "U+2669",
 *         "name": "Quarter note",
 *         "codePoints": [ "U+2669" ],
 *         "labels": [ "Unicode miscellaneous symbols" ]
 *     },
 *     {
 *         "id": "U+266A",
 *         "name": "Eighth note",
 *         "codePoints": [ "U+266A" ],
 *         "labels": [ "Unicode miscellaneous symbols" ]
 *     }
 * ]
 * ```
 *
 * @typedef   {Object}  CharacterSetEntry
 *
 * @fontosdk  members
 *
 * @property  {string}    id          Unique identifier for the character
 * @property  {string}    name        Descriptive name for the character, displayed in the modal
 * @property  {string[]}  codePoints  Unicode code points to insert when the character is inserted into the
 *                                      document, in order, encoded as strings starting with U+ followed by the
 *                                      hexadecimal representation of the code point.
 * @property  {string[]}  labels      List of categories under which the character should appear in the modal, each
 *                                      specified using the descriptive label for the category shown in the modal.
 */
