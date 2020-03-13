import uiManager from 'fontoxml-modular-ui/src/uiManager.js';
import SpecialCharacterModal from './ui/SpecialCharacterModal.jsx';
import specialCharactersManager from './specialCharactersManager.js';

export default function install() {
	uiManager.registerReactComponent('SpecialCharacterModal', SpecialCharacterModal);

	specialCharactersManager.addCharacterSetPath(
		'default',
		'assets/character-sets/defaultCharacterSet.json'
	);
}
