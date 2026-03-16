import * as migration_20260316_050239 from './20260316_050239';
import * as migration_20260316_182703 from './20260316_182703';
import * as migration_20260316_182732 from './20260316_182732';

export const migrations = [
  {
    up: migration_20260316_050239.up,
    down: migration_20260316_050239.down,
    name: '20260316_050239',
  },
  {
    up: migration_20260316_182703.up,
    down: migration_20260316_182703.down,
    name: '20260316_182703',
  },
  {
    up: migration_20260316_182732.up,
    down: migration_20260316_182732.down,
    name: '20260316_182732'
  },
];
