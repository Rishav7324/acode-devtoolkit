import { createToolModule } from '../../utils/createToolModule.js';
import { showHtmlEntities } from '../../tools/html-entities/ui.js';

export default createToolModule({
  id: 'html-entities',
  icon: '\ue804',
  name: 'HTML Entities',
  description: 'Encode and decode HTML entities and special characters',
  category: 'converters',
  showFn: showHtmlEntities,
});
