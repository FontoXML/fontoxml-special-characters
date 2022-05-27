/**
 * @remarks
 * A character set should be provided to {@link
 * SpecialCharactersManager#addCharacterSet} as an array of objects, each
 * containing properties describing a character in the set.
 *
 * A fragment of an example character set is given below:
 *
 * ```json
 * [
 *     {
 *         "codePoints": [ "U+2669" ],
 *         "id": "U+2669"
 *     },
 *     {
 *         "codePoints": [ "U+266A" ],
 *         "id": "U+266A",
 *         "labels": [ "Unicode miscellaneous symbols" ],
 *         "name": "Eighth note"
 *     }
 * ]
 * ```
 *
 * @fontosdk importable
 */
export type SpecialCharacterSetItem = {
	/**
	 * @remarks
	 * Unicode code points to insert when the character is inserted into the document,
	 * in order, encoded as strings starting with U+ followed by the hexadecimal
	 * representation of the code point.
	 *
	 * @fontosdk
	 */
	codePoints: string[];
	/**
	 * @remarks
	 * Unique identifier for the character.
	 *
	 * @fontosdk
	 */
	id: string;
	/**
	 * @remarks
	 * List of categories under which the character should appear in the modal, each
	 * specified using the descriptive label for the category shown in the modal.
	 *
	 * @fontosdk
	 */
	labels?: string[];
	/**
	 * @remarks
	 * Descriptive name for the character, displayed in the modal and as a tooltip
	 * content in the grid.
	 *
	 * @fontosdk
	 */
	name?: string;
};
