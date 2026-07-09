import { createToolModule } from '../../utils/createToolModule.js';
import { showUrlParser } from '../../tools/url-parser/ui.js';

export default createToolModule({
  id: 'url-parser',
  icon: '\ue80f',
  name: 'URL Parser',
  description: 'Parse, encode, and decode URL components and query strings',
  category: 'converters',
  showFn: showUrlParser,
});
