import { createToolModule } from '../../utils/createToolModule.js';
import { showQrGenerator } from '../../tools/qr-generator/ui.js';

export default createToolModule({
  id: 'qr-generator',
  icon: '\ue80d',
  name: 'QR Generator',
  description: 'Generate QR codes from text, URLs, and contact data',
  category: 'generators',
  showFn: showQrGenerator,
});
