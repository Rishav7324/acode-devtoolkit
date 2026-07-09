import { createToolModule } from '../../utils/createToolModule.js';
import { showSqlFormatter } from '../../tools/sql-formatter/ui.js';

export default createToolModule({
  id: 'sql-formatter',
  icon: '\ue80c',
  name: 'SQL Formatter',
  description: 'Format and beautify SQL queries for better readability',
  category: 'formatting',
  showFn: showSqlFormatter,
});
