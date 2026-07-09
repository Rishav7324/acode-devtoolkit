import { createToolModule } from '../../utils/createToolModule.js';
import { showDiffChecker } from '../../tools/diff-checker/ui.js';

export default createToolModule({
  id: 'diff-checker',
  icon: '\ue80b',
  name: 'Diff Checker',
  description: 'Compare two text blocks and highlight differences',
  category: 'developer',
  showFn: showDiffChecker,
});
