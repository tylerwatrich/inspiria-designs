import * as migration_20260316_050239 from './20260316_050239';

export const migrations = [
  {
    up: migration_20260316_050239.up,
    down: migration_20260316_050239.down,
    name: '20260316_050239'
  },
];
