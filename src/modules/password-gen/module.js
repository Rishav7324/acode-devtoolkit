import { createToolModule } from '../../utils/createToolModule.js';
import { showPasswordGen } from '../../tools/password-gen/ui.js';

export default createToolModule({
  id: 'password-gen',
  icon: '\ue80a',
  name: 'Password Generator',
  description: 'Generate strong random passwords with configurable rules',
  category: 'security',
  showFn: showPasswordGen,
});
