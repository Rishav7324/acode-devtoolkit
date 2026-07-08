import { createToolModule } from '../../utils/createToolModule.js';
import { showMinifier } from '../../tools/minifier/ui.js';

export default createToolModule({
  id: 'minifier',
  icon: '\ue808',
  name: 'Code Minifier',
  description: 'Minify JavaScript, CSS, and HTML for production use',
  showFn: showMinifier,
});
