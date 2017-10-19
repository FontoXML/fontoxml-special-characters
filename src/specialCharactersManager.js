define([
], function (
) {
	'use strict';

	/**
	 * Enables registration of custom character sets to be displayed in the “Insert special character” modal.
	 *
	 * @fontosdk
	 * @category add-on/fontoxml-special-characters
	 */
	function SpecialCharactersManager () {
		this._characterSetByName = Object.create(null);
	}

	/**
	 * Register the specified characterSet for use by the special-character-insert operation under the specified name.
	 *
	 * @fontosdk
	 *
	 * @param  {string}    name
	 * @param  {CharacterSetEntry[]}  characterSet
	 */
	SpecialCharactersManager.prototype.addCharacterSet = function (name, characterSet) {
		this._characterSetByName[name] = characterSet;
	};

	/**
	 * Retrieve the character set with the given name
	 *
	 * @param  {string}  name
	 *
	 * @return  {CharacterSetEntry[]}
	 */
	SpecialCharactersManager.prototype.getCharacterSet = function (name) {
		var characterSet = this._characterSetByName[name];
		if (!characterSet) {
			throw new Error('Character set "' + name + '" does not exist.');
		}
		return characterSet;
	};

	return new SpecialCharactersManager();

	/**
	 * A character set should be provided to {@link SpecialCharactersManager#addCharacterSet} as an array of objects,
	 * each containing properties describing a character in the set.
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
	 * @typedef  {Object}  CharacterSetEntry
	 * @fontosdk
	 *
	 * @property  {string}    id          Unique identifier for the character
	 * @property  {string}    name        Descriptive name for the character, displayed in the modal
	 * @property  {string[]}  codePoints  Unicode code points to insert when the character is inserted into the
	 *                                      document, in order, encoded as strings starting with U+ followed by the
	 *                                      hexadecimal representation of the code point.
	 * @property  {string[]}  labels      List of categories under which the character should appear in the modal, each
	 *                                      specified using the descriptive label for the category shown in the modal.
	 */
});
