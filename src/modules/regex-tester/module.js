import { createToolModule } from '../../utils/createToolModule.js';
import { showRegexTester } from '../../tools/regex-tester/ui.js';

export default createToolModule({
  id: 'regex-tester',
  icon: '\ue807',
  name: 'Regex Tester',
  description: 'Test regular expressions with real-time match highlighting',
  category: 'developer',
  keywords: ['regex', 'regular expression', 'pattern', 'match', 'test'],
  showFn: showRegexTester,
});
