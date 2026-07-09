import { createToolModule } from '../../utils/createToolModule.js';
import { showTextStatistics } from '../../tools/text-diff/ui.js';

export default createToolModule({
  id: 'text-diff',
  icon: '\ue80e',
  name: 'Text Statistics',
  description: 'Analyze word count, character count, reading time and more',
  category: 'developer',
  showFn: showTextStatistics,
});
