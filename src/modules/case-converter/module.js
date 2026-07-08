import { createToolModule } from '../../utils/createToolModule.js';
import { showCaseConverter } from '../../tools/case-converter/ui.js';

export default createToolModule({
  id: 'case-converter',
  icon: '\ue810',
  name: 'Case Converter',
  description: 'Convert text between camelCase, snake_case, kebab-case, and more',
  showFn: showCaseConverter,
});
