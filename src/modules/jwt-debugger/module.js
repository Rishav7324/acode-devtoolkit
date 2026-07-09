import { createToolModule } from '../../utils/createToolModule.js';
import { showJwtDebugger } from '../../tools/jwt-debugger/ui.js';

export default createToolModule({
  id: 'jwt-debugger',
  icon: '\ue806',
  name: 'JWT Debugger',
  description: 'Decode and inspect JSON Web Tokens without sending data',
  category: 'developer',
  showFn: showJwtDebugger,
});
