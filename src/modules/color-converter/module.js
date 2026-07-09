import { createToolModule } from '../../utils/createToolModule.js';
import { showColorConverter } from '../../tools/color-converter/ui.js';

export default createToolModule({
  id: 'color-converter',
  icon: '\ue809',
  name: 'Color Converter',
  description: 'Convert between HEX, RGB, HSL, and named CSS colors',
  category: 'converters',
  showFn: showColorConverter,
});
