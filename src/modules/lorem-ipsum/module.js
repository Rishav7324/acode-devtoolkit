import { createToolModule } from '../../utils/createToolModule.js';
import { showLoremIpsum } from '../../tools/lorem-ipsum/ui.js';

export default createToolModule({
  id: 'lorem-ipsum',
  icon: '\ue805',
  name: 'Lorem Ipsum',
  description: 'Generate placeholder text in configurable lengths',
  category: 'generators',
  showFn: showLoremIpsum,
});
