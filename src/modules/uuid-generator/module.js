import { createToolModule } from '../../utils/createToolModule.js';
import { showUuidGenerator } from '../../tools/uuid-generator/ui.js';

export default createToolModule({
  id: 'uuid-generator',
  icon: '\ue803',
  name: 'UUID Generator',
  description: 'Generate v4 UUIDs and unique identifiers on demand',
  category: 'generators',
  showFn: showUuidGenerator,
});
