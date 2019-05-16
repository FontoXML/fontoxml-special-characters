import uiManager from 'fontoxml-modular-ui/src/uiManager.js';
import SpecialCharacterModal from './ui/SpecialCharacterModal.jsx';
import specialCharactersManager from './specialCharactersManager.js';
import defaultCharacterSetJson from './character-sets/defaultCharacterSet.json';

export default function install() {
	uiManager.registerReactComponent('SpecialCharacterModal', SpecialCharacterModal);

	specialCharactersManager.addCharacterSet('default', defaultCharacterSetJson);
}
