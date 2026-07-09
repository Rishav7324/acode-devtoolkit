import { createToolModule } from '../../utils/createToolModule.js';
import { showHashGenerator } from '../../tools/hash-generator/ui.js';

export default createToolModule({
  id: 'hash-generator',
  icon: '\ue802',
  name: 'Hash Generator',
  description: 'Generate MD5, SHA-1, SHA-256, and SHA-512 hashes',
  category: 'security',
  showFn: showHashGenerator,
});
